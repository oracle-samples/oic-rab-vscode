/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { readFileSync } from "fs";
import * as vscode from 'vscode';

import path = require("path");

import { filter, firstValueFrom, from, iif, of, switchMap, tap } from "rxjs";
import { timeout as apiTimeout } from "../api";
import { callOpenAPIConversionApiAndShowDocument, openAPIConvertCallback } from "../commands/convert-openapi-document";
import { callPostmanConversionApiAndShowDocument, postmanConvertCallback } from "../commands/convert-postman-collection";
import { log } from "../logger";
import { fs, message, workspace } from '../utils';
import { detectIsADDValidRemote } from "../utils-api";
import { showErrorMessage, showInfoMessage } from "../utils/ui-utils";
import { OpenAPINS, PostmanNs, RabAddNs, SharedNs } from "../webview-shared-lib";
import { getAddFile } from "../workspace-manager";

export namespace UtilsNs {

  export let panel: vscode.WebviewPanel | undefined;

  const webFolder = `webview-helper`;

  export const showWebview = (context: vscode.ExtensionContext) => {

    if (!panel) {
      panel = initWebview(context);
    }

    panel.reveal();

  };

  export const initWebview = (context: vscode.ExtensionContext) => {

    if (panel) {
      return panel;
    }

    const { extensionPath, extensionUri } = context;

    const webroot = vscode.Uri.joinPath(extensionUri, webFolder);


    // Create and show a new webview
    panel = vscode.window.createWebviewPanel(
      SharedNs.ExtensionCommandEnum.openCopilotAssistant, // Identifies the type of the webview. Used internally
      'Oracle RAB', // Title of the panel displayed to the user
      vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
      {
        enableScripts: true,

        localResourceRoots: [
          webroot
        ]
      }
    );

    // And set its HTML content
    // panel.webview.html = getWebviewContent(context, panel.webview);
    let server = fs.serveStaticServer();
    server.on('listening', () => {
      if (!panel) {
        showErrorMessage("❌ The webview panel is gone");
        return;
      }
      panel.webview.html = getWebviewContentV2ForStaticIframe(context, panel.webview);
    });

    panel.onDidDispose(() => {
      panel = undefined;
      server.close();
      server = undefined as any;
    });

    return panel;
  };

  const getStaticResourceUrl = (webview: vscode.Webview, extensionPath: vscode.Uri, fileName: string) => {
    return webview.asWebviewUri(vscode.Uri.joinPath(extensionPath, webFolder, fileName));
  };


  function getWebviewContentV2ForStaticIframe(context: vscode.ExtensionContext, webview: vscode.Webview) {
    let indexHtml = readFileSync(
      path.resolve(
        __dirname,
        `..`,
        `webview-helper`,
        `index.html`
      )
    ).toString().replace(/__WEBVIEW_URL__/, fs.WEBVIEW_URL);


    const jsUrl = getStaticResourceUrl(webview, context.extensionUri, `index.js`);

    const replace = [
      [
        / src=".+?\.js">/,
        ` src="${jsUrl}">`
      ],
    ];
    for (let entry of replace) {
      indexHtml = indexHtml.replace(
        entry[0],
        //@ts-ignore
        entry[1]
      );
    }

    return indexHtml;
  }

  function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {

    const webRootPath = path.join(context.extensionPath, webFolder);
    // ext.readJson
    const manifestJson = require(path.join(webRootPath, 'asset-manifest.json'));
    let staticHtml = readFileSync(path.join(webRootPath, 'index.html')).toString();

    const reactJsMainPath = manifestJson.files['main.js'];
    const reactCssMainPath = manifestJson.files['main.css'];

    const jsUrl = getStaticResourceUrl(webview, context.extensionUri, reactJsMainPath);

    const replace = [
      [
        / src=".+?\.js">/,
        ` src="${jsUrl}">`
      ],
    ];

    if (reactCssMainPath) {

      const cssUrl = getStaticResourceUrl(webview, context.extensionUri, reactCssMainPath);
      replace.push(
        [
          / href=".+?\.css" /,
          ` href="${cssUrl}" `
        ],
      );
    }

    for (let entry of replace) {
      staticHtml = staticHtml.replace(
        entry[0],
        //@ts-ignore
        entry[1]
      );
    }

    // console.log(staticHtml);

    return staticHtml;
  }

  export const listenWebview = <T extends keyof typeof SharedNs.WebviewCommandEnum>(onCommand: T, callback: (payload: SharedNs.WebviewCommandPayload[T]) => any) => {

    if (!panel) { return; }
    return panel.webview.onDidReceiveMessage(
      ({
        target,
        command,
        payload
      }: {
        target: 'vscode' | 'webview', command: T, payload: SharedNs.WebviewCommandPayload[T]
      } = {} as any) => {
        if (target !== 'vscode') {
          return;
        }
        if (command === onCommand) {
          callback(payload);
        }
      }
    );
  };

  export const notifyWebview = <T extends keyof typeof SharedNs.ExtensionCommandEnum>(command: T, payload: SharedNs.VscodeCommandPayload[T]) => {
    if (panel) {
      panel.webview.postMessage({
        target: 'webview',
        command: command,
        payload
      });
    }
  };

  const registryMap: Map<keyof typeof SharedNs.ExtensionCommandEnum, vscode.Disposable[]> = new Map();

  export const registerCommandV2 = <T extends keyof typeof SharedNs.ExtensionCommandEnum>({
    context,
    command,
    callback,
  }: {
    context: vscode.ExtensionContext;
    command: T;
    callback: (payload: SharedNs.VscodeCommandPayload[T]) => vscode.Disposable[]
  }) => {
    return vscode.commands.registerCommand(command, (...args) => {

      const callBackSet = registryMap.get(command) ?? [];

      callBackSet.forEach(disposable => disposable.dispose());

      registryMap.set(command, callback?.(args[0] as any));

    });
  };
}

function handleWebviewRouting(href: SharedNs.WebviewRouteEnum) {

  UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.routerNavigateTo, {
    href
  });

  return UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.webviewRouterReady, (...args) => {
    UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.routerNavigateTo, {
      href
    });
  });

}

function handleWebviewLifecycle() {

  return UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.webviewLifecycle, (payload) => {
    if (payload.type === 'close') {
      UtilsNs.panel!.dispose();
      UtilsNs.panel = undefined;
    }
  });

}

const notifyPostmanWebview = (file: vscode.Uri, entryType: SharedNs.VscodeCommandPayload["updateEntryType"]) => {
  UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.updatePostmanRawData, JSON.parse(readFileSync(file.fsPath, 'utf8')) as PostmanNs.Root);
  UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.updateEntryType, entryType);
};

const notifyOpenAPIWebview = ({
  openAPIFile,
  addFile,
  entryType
}: {
  openAPIFile: vscode.Uri,
  addFile?: vscode.Uri,
  entryType: SharedNs.VscodeCommandPayload["updateEntryType"]
}) => {

  let openAPIDoc: OpenAPINS.Root;
  try {
    openAPIDoc = JSON.parse(readFileSync(openAPIFile.fsPath, 'utf8'));
  } catch (error) {
    log.error(`Unable to parse OpenAPI document`, error);
    return;
  }

  let ADD: RabAddNs.Root | undefined = undefined;

  try {
    if (addFile) {
      ADD = JSON.parse(readFileSync(addFile.fsPath, 'utf8'));
    }
  } catch (error) {
    log.error(`Unable to parse adapter definition document`, error);
    return;
  }

  UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.updateOpenAPIRawData, {
    openapi: openAPIDoc,
    add: ADD
  });

  UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.updateEntryType, entryType);
};

const openWebview = ({
  file,
  context,
  entryType,
  addFile
}: {

  file: vscode.Uri,
  context: vscode.ExtensionContext,
  entryType: SharedNs.VscodeCommandPayload["updateEntryType"];
  addFile?: vscode.Uri,

}) => {

  const isPostmanEvents = [
    SharedNs.VscodeCommandPayloadEntryType.PostmanAddRequest,
    SharedNs.VscodeCommandPayloadEntryType.PostmanConvertDocument,
  ].some(type => type === entryType);


  const postmanEvents = () => [

    notifyPostmanWebview(file, entryType),
    UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.postmanSelectReady, () => notifyPostmanWebview(file, entryType)),
    UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.postmanSelectRequests, (data) => {

      const observable = fs.checkWorkspaceInitialized().pipe(
        switchMap(
          () => workspace.detectIsPostmanFileWithUILoading(context, file, () => of(file)
            .pipe(
              switchMap(() => callPostmanConversionApiAndShowDocument(file, data, addFile,))
            )
          )
        )
      );

      const requestPromise = firstValueFrom(observable);

      message.loading(
        {
          message: `Updating in progress. This may take 5-${apiTimeout} seconds. Don't edit the document before it's done.`,
          hidePromise: requestPromise,
          context,
          isBlocking: false
        }
      );
    }),

    UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.postmanDoneConvertDocument, (data) => {
      postmanConvertCallback(file, context, data);
    })
  ];

  const openAPIEvents = () => [

    notifyOpenAPIWebview({
      openAPIFile: file,
      entryType,
      addFile

    }),

    UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.openAPISelectReady, () => notifyOpenAPIWebview({
      openAPIFile: file,
      entryType,
      addFile

    }
    )),
    UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.openAPISelectRequests, (data) => {

      const observable = fs.checkWorkspaceInitialized().pipe(
        switchMap(
          () => workspace.detectIsOpenAPIFileWithUILoading(context, file, () => of(file)
            .pipe(
              switchMap(() => callOpenAPIConversionApiAndShowDocument(file, data, addFile,))
            )
          )
        )
      );

      const requestPromise = firstValueFrom(observable);

      message.loading(
        {
          message: `Updating in progress. This may take 5-${apiTimeout} seconds. Don't edit the document before it's done.`,
          hidePromise: requestPromise,
          context,
          isBlocking: false
        }
      );
    }),

    UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.openAPIDoneConvertDocument, (data) => {
      openAPIConvertCallback(file, context, data);
    })
  ];

  const entryEvents = isPostmanEvents ? postmanEvents() : openAPIEvents();

  return from([
    handleWebviewRouting(SharedNs.WebviewRouteEnum.OpenAPIAdd),
    handleWebviewLifecycle(),
    ...entryEvents,
  ]);
};

const registerPostmanConvertCallback = (context: vscode.ExtensionContext, entryType: SharedNs.VscodeCommandPayload["updateEntryType"]) => (file: vscode.Uri) => {

  const disposableList: vscode.Disposable[] = [];


  const observable = of(entryType).pipe(
    switchMap(
      () => iif(
        () => entryType === SharedNs.VscodeCommandPayloadEntryType.PostmanAddRequest,
        detectIsADDValidRemote(),
        fs.checkWorkspaceInitialized()
      )
    ),
    switchMap(
      () => workspace.detectIsPostmanFile(file, () => of(file)
        .pipe(
          tap(() => UtilsNs.showWebview(context)),
          tap(() => showInfoMessage(
            entryType === SharedNs.VscodeCommandPayloadEntryType.PostmanAddRequest ?
              "Select the requests from the Postman collection to add"
              : "Select the requests from the Postman collection to convert"
          )),
          switchMap(
            () => openWebview(
              {
                file, context, entryType
              }
            )
              .pipe(
                filter(disposible => !!disposible),
                tap(disposable => disposableList.push(disposable!))
              )
          )
        )
      )
    )
  );

  observable.subscribe();

  return disposableList;
};


const registerOpenAPIConvertCallback = (context: vscode.ExtensionContext, entryType: SharedNs.VscodeCommandPayload["updateEntryType"]) => (file: vscode.Uri) => {

  const disposableList: vscode.Disposable[] = [];


  const observable = of(entryType).pipe(
    switchMap(
      () => iif(
        () => entryType === SharedNs.VscodeCommandPayloadEntryType.OpenAPIAddRequest,
        detectIsADDValidRemote(),
        fs.checkWorkspaceInitialized()
      )
    ),
    switchMap(
      () => workspace.detectIsOpenAPIFile(file, () => of(file)
        .pipe(
          tap(() => UtilsNs.showWebview(context)),
          tap(() => showInfoMessage(
            entryType === SharedNs.VscodeCommandPayloadEntryType.OpenAPIAddRequest ? 
            "Select the OpenAPI paths and methods to add" 
              : "Select the OpenAPI paths and methods to convert" 
          )),
          switchMap(
            () => openWebview({
              file, context, entryType,
              addFile: entryType === SharedNs.VscodeCommandPayloadEntryType.OpenAPIAddRequest ? getAddFile() : undefined
            })
              .pipe(
                filter(disposible => !!disposible),
                tap(disposable => disposableList.push(disposable!))
              )
          )
        )
      )
    )
  );

  observable.subscribe();

  return disposableList;
};

function registerPostmanConvertAddRequests(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    UtilsNs.registerCommandV2({
      context,
      command: SharedNs.ExtensionCommandEnum.openCopilotPostmanConvert,
      callback: registerPostmanConvertCallback(context, SharedNs.VscodeCommandPayloadEntryType.PostmanAddRequest)
    })
  );
}

function registerPostmanConvertConvertDocument(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    UtilsNs.registerCommandV2({
      context,
      command: SharedNs.ExtensionCommandEnum.openPostmanConvertConverDocument,
      callback: registerPostmanConvertCallback(context, SharedNs.VscodeCommandPayloadEntryType.PostmanConvertDocument)
    })
  );
}

function registerOpenAPIConvertAppendDocument(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    UtilsNs.registerCommandV2({
      context,

      command: SharedNs.ExtensionCommandEnum.openOpenAPIConvertAppendDocument,
      callback: registerOpenAPIConvertCallback(context, SharedNs.VscodeCommandPayloadEntryType.OpenAPIAddRequest)
    })
  );
}
function registerOpenAPIConvertNewDocument(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    UtilsNs.registerCommandV2({
      context,

      command: SharedNs.ExtensionCommandEnum.openOpenAPIConvertNewDocument,
      callback: registerOpenAPIConvertCallback(context, SharedNs.VscodeCommandPayloadEntryType.OpenAPIConvertDocument)
    })
  );
}

function moveCursor(props: {
  editor: vscode.TextEditor,
} & SharedNs.VsCoderEditorConfig) {

  const { editor, documentString, startTextPattern, endTextPattern, startOffset = 0, endOffset = 0 } = props;

  const position = editor.selection.active;

  const startLine = documentString.split('\n').map((lineText, lineNumber) => ([lineNumber, lineText,])).find(entry => `${entry[1]}`.match(startTextPattern));

  if (startLine) {

    let endLine;

    if (endTextPattern) {
      endLine = documentString.split('\n').map((lineText, lineNumber) => ([lineNumber, lineText,])).find(entry => entry[0] >= startLine[0] && `${entry[1]}`.match(endTextPattern));
    }

    var startPosition = position.with(startLine[0] as number + startOffset, 0);

    const endLineNumber = endLine?.[0] ? +endLine[0] : +startLine[0];


    var endPosition = position.with(endLineNumber + endOffset, 0);

    var newSelection = new vscode.Selection(startPosition, endPosition);
    editor.selection = newSelection;

    editor.revealRange(editor.selection);

  }

}

// const rabAddReady = () => {
//   workspace.openADDDocument().pipe(
//     tap((document) => {
//       const addDoc = JSON.parse(document.getText());
//       UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.loadRabAddData, addDoc);
//     })
//   );

// };

// const updatedAddDocFromWebviewV2 = (context: vscode.ExtensionContext, data: SharedNs.WebviewCommandPayloadRabAddSave) => workspace.showADDDocument().pipe(
//   tap(
//     (editor) => {
//       let source = editor.document.getText();
//       let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
//       editor.edit(edit => {
//         const updatedAddDoc = SharedNs.ADDJsonStringify(data.addToSave);
//         edit.replace(range, updatedAddDoc);

//         setTimeout(() => {

//           if (data.vsCodeEditorConfig) {
//             moveCursor(
//               {
//                 editor,

//                 ...data.vsCodeEditorConfig
//               }
//             );
//           }
//         }, 500);


//       }).then(ret => {

//         setTimeout(() => {
//           vscode.commands.executeCommand('orab.explorer.outline.refresh');
//         }, 1000);
//       });
//     }
//   ),
// );

// const initCopilotEvents = (context: vscode.ExtensionContext) => from([
//   UtilsNs.showWebview(context),
//   handleWebviewRouting(SharedNs.WebviewRouteEnum.Root),
//   handleWebviewLifecycle(),
//   rabAddReady(),
//   UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.rabAddReady, rabAddReady),
//   UtilsNs.listenWebview(SharedNs.WebviewCommandEnum.rabAddSave, (data) => {

//     workspace.createRabAddFileIfNotExist(
//       {
//         callback:
//           (addFile) => from(
//             vscode.workspace.openTextDocument(addFile)
//           )
//       }
//     )
//       .pipe(
//         tap((document) => {
//           const addDoc = JSON.parse(document.getText());
//           UtilsNs.notifyWebview(SharedNs.ExtensionCommandEnum.loadRabAddData, addDoc);
//         })
//       )
//       .subscribe();

//     updatedAddDocFromWebviewV2(context, data)
//       .subscribe();

//   }),

// ]);


// const registerCopilotAssistantCallback = (context: vscode.ExtensionContext) => () => {

//   const disposableList: vscode.Disposable[] = [];

//   const observable = initCopilotEvents(context).pipe(
//     filter(disposible => !!disposible),
//     tap(disposable => disposableList.push(disposable!))
//   );

//   observable.subscribe();

//   return disposableList;

// };

// function registerCopilotAssistant(context: vscode.ExtensionContext) {
//   context.subscriptions.push(
//     UtilsNs.registerCommandV2({
//       context,
//       command: SharedNs.ExtensionCommandEnum.openCopilotAssistant,
//       callback: registerCopilotAssistantCallback(context)
//     })
//   );
// }

export function register(context: vscode.ExtensionContext) {
  registerPostmanConvertAddRequests(context);
  registerPostmanConvertConvertDocument(context);
  registerOpenAPIConvertAppendDocument(context);
  registerOpenAPIConvertNewDocument(context);
  // registerCopilotAssistant(context);
}