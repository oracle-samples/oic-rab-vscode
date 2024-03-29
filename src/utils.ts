/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as _fs from 'fs';
import * as fsExtra from 'fs-extra';

import { createServer } from 'http';
import * as path from 'path';
import { Observable, bindNodeCallback, firstValueFrom, from, iif, of, range } from 'rxjs';
import { catchError, defaultIfEmpty, delay, filter, map, skipWhile, switchMap, take, takeWhile, tap } from 'rxjs/operators';
import * as vscode from 'vscode';
import { log } from './logger';
import { ensureOpenWorkspace } from './workspace-manager';

import { PostmanNs, RabAddNs } from './webview-shared-lib';

import { isWorkSpaceInitialized } from './workspace-manager';

export const defaultApiCallTimeoutInSeconds = 120;

export namespace helpers {
  export const delayInSeconds = (timeInSeconds: number) => firstValueFrom(of(null).pipe(delay(timeInSeconds * 1000)));
}

export namespace constants {
  export const commands = {
    'orabConvertPostmanDocument': 'orab.convert.postman.document'
  };

}

export namespace workspace {

  export const MAX_ADD_COUNT_ALLOWED = 1000;

  export const extensionMap = {
    add: `add.json`
  };

  export const mainAddFileName = `main`;

  export const presetFileMap = {
    definitions: `definitions`,
    api: `api`,
    resources: `resources`,
    definitionsMainAddJson: `${mainAddFileName}.add.json`,
    publisherYaml: `publisher.yaml`,
  };

  export const presetFileMapAbs = {
    definitions: presetFileMap.definitions,
    api: presetFileMap.api,
    resources: presetFileMap.resources,
    resourcesLogo: `${presetFileMap.resources}/logo.svg`,
    definitionsMainAddJson: `${presetFileMap.definitions}/${presetFileMap.definitionsMainAddJson}`,
    publisherYaml: presetFileMap.publisherYaml,
  };

  export function getWorkspaceRoot(): string | undefined {
    return (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
      ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
  }


  export const detectIsPostmanFileWithUILoading = <T>(context: vscode.ExtensionContext, file: vscode.Uri, successCallback: () => Observable<T>) => {

    let externalResolve = (val: any) => { };
    const hidePromise = new Promise((resolve) => {
      externalResolve = resolve;
    });

    return detectIsPostmanFile(file, () => of(file).pipe(
      tap(() => message.loading(
        {
          message: `⏱ Converting document in progress.... This may take 5-${defaultApiCallTimeoutInSeconds} seconds.`,
          hidePromise,
          context,
          isBlocking: false
        }
      )
      ),
      switchMap(
        successCallback
      ),
      tap(() => externalResolve(true))
    )
    );
  };

  export const detectIsPostmanFile = <T>(file: vscode.Uri, successCallback: () => Observable<T>) => fs.isFileMatching(
    file,
    (doc) => {
      const postmanCollection = JSON.parse(doc.getText()) as PostmanNs.Root;
      return !!postmanCollection && !!postmanCollection.info?._postman_id && !!postmanCollection.item?.length;
    },
    (file) => from(message.showErrorWithLog(`The offered file is not a valid postman collection. File: ['${fs.parseFilename(file)}']`))
  )
    .pipe(
      switchMap(
        (isPostman) => successCallback(),
      ),
    );


  export const detectIsADDWithUILoading = <T extends Observable<any>>(context: vscode.ExtensionContext, file: vscode.Uri, successCallback: () => T) => {

    let externalResolve = (val: any) => { };
    const hidePromise = new Promise((resolve) => {
      externalResolve = resolve;
    });

    return detectIsADDLocal(() => file)
      .pipe(
        tap(() => message.loading(
          {
            message: `⏱ Working on the adapter definition '${fs.parseFilename(file!)}'.... This may take 5-${defaultApiCallTimeoutInSeconds} seconds.`,
            hidePromise,
            context,
            isBlocking: false
          }
        )
        ),
        switchMap(
          successCallback
        ),
        tap(() => externalResolve(true)),
        catchError((err) => {
          externalResolve(true);
          throw err;
        })

      );
  };


  export const detectIsADDLocal = (
    getFile = () => workspace.getAddFile()!,
    errorError: (getFile: () => vscode.Uri) => Observable<any> = (getFile: () => vscode.Uri) =>
      from(message.showErrorWithLog(`The offered file is not a valid adapter definition document. File:  ['${fs.parseFilename(getFile())}']`))

  ) => fs.isFileMatching(
    getFile(),
    (doc) => {
      try {
        const add = JSON.parse(doc.getText()) as RabAddNs.Root;
        return !!add && !!add.info?.id;
      } catch (error) {

        return false;
      }

    },

    () => errorError(getFile)

  );

  export function getApiFile(type: string): vscode.Uri | undefined {
    let root = fs.getWorkspaceRoot();
    if (!root) { return undefined; }
    if (type === 'postman') {
      let file = _fs.readdirSync(path.resolve(root, "api")).find(e => e.endsWith('.postman_collection.json'));
      if (file) {
        return vscode.Uri.file(path.resolve(root, "api", file));
      }
    }
    return undefined;
  }

  export const detectOverrideAndOpenADDDocumentDialogOptions: message.ConfirmProp = {
    yesText: `Update main`,
    noText: `Save new`,
    useNotification: true

  };

  /**
   * 
   * @param addFileName The filename if user choose to save the result as new file.
   * @param defaultFileContent 
   * @returns 
   */
  export const detectOverrideAndOpenADDDocument = (addFileName?: string, defaultFileContent?: string) => of(getAddFile()).pipe(

    switchMap(
      (addFile) => iif(
        () => !!addFile,
        message
          .confirmV2(() => `Update main doucment '${fs.parseFilename(addFile!)}' or save as a new file? `, detectOverrideAndOpenADDDocumentDialogOptions)
          .pipe(
            map(
              (confirm) => ({
                addFile: addFile!,
                confirm
              })
            )
          ),

        createUniqueRabAddFile({
          addFileName,
          defaultFileContent
        }).pipe(
          map(addFile =>
          ({
            confirm: true,
            addFile
          })
          )
        )
      )
    ),

    switchMap(
      ({ addFile, confirm }) => iif(
        () => confirm,
        of(
          addFile
        ),
        createUniqueRabAddFile({
          addFileName,
          defaultFileContent
        })
      )
    ),

    switchMap(
      (addFile) => vscode.workspace.openTextDocument(addFile)
    ),

  );;

  export const openADDDocument = (addFileName?: string) => createRabAddFileIfNotExist({
    addFileName,
    callback: (addFile) => from(
      vscode.workspace.openTextDocument(addFile)
    )
  }
  );

  export const showADDDocument = (doc?: vscode.TextDocument, addFileName?: string) => iif(
    () => !!doc,
    of(doc),
    openADDDocument(addFileName)
  ).pipe(
    switchMap(document => vscode.window.showTextDocument(document!, vscode.ViewColumn.One)),
  );

  const defaultCreateRabAddFileHandler = (addFileName?: string, defaultFileContent?: string) => of(fs.ensureAddFile(addFileName, defaultFileContent)).pipe(
    map(() => getAddFile(addFileName)!)
  );

  export const createRabAddFileIfNotExist = <T extends Observable<any>>({
    addFileName,
    callback,
    createRabAddFileHandler = defaultCreateRabAddFileHandler
  }: {
    addFileName?: string;
    callback: (addFile: vscode.Uri) => T;
    createRabAddFileHandler?: (addFileName?: string) => Observable<vscode.Uri>;
  }
  ) => fs.checkWorkspaceInitialized()
    .pipe(

      map(() => getAddFile(addFileName)),
      filter(addFile => !addFile),
      switchMap(() => createRabAddFileHandler(addFileName)),

      defaultIfEmpty(getAddFile(addFileName)!),

      switchMap((addFile) => callback(addFile)),
    );

  export const getUniqueFileName = (addFileNamePrefix: string = `file`, getFile = (fileName: string) => getAddFile(fileName)) => of(addFileNamePrefix)
    .pipe(

      switchMap(
        () => iif(
          () => !getFile(addFileNamePrefix),
          of(addFileNamePrefix),
          range(0, MAX_ADD_COUNT_ALLOWED)
            .pipe(
              skipWhile(idx => !!getFile(`${addFileNamePrefix}-${idx}`)),
              take(1),
              map(
                (idx) => `${addFileNamePrefix}-${idx}`
              ),
            )
        )
      ),

    );

  export const createUniqueRabAddFile = ({
    addFileName = workspace.mainAddFileName,
    defaultFileContent,
    createRabAddFileHandler = defaultCreateRabAddFileHandler
  }: {
    addFileName?: string;
    defaultFileContent?: string;
    createRabAddFileHandler?: (addFileName?: string, defaultFileContent?: string) => Observable<vscode.Uri>;
  }
  ) => fs.checkWorkspaceInitialized()
    .pipe(

      switchMap(
        () => getUniqueFileName(addFileName)
      ),

      switchMap(
        (addFileNameUnique) => createRabAddFileHandler(addFileNameUnique, defaultFileContent)
      ),

    );

  // export const showPublisherYaml = () => of(getPublisherYaml())
  //   .pipe(
  //     filter(publisherYamlPath => !!publisherYamlPath),
  //     switchMap((publisherYamlPath) => vscode.workspace.openTextDocument(publisherYamlPath!)),
  //     switchMap((doc) => vscode.window.showTextDocument(doc!, vscode.ViewColumn.One)),
  //   );

  export function getPublisherYaml() {
    let root = fs.getWorkspaceRoot();
    if (!root) {
      return;
    }

    const filePath = path.resolve(root, workspace.presetFileMap.publisherYaml);

    if (!_fs.existsSync(filePath)) {
      return;
    }

    return vscode.Uri.file(filePath);

  }

  export function getAddFile(fileName: string = workspace.mainAddFileName, allowFallBack?: boolean): vscode.Uri | undefined {

    let root = fs.getWorkspaceRoot();
    if (!root) {
      return;
    }

    try {
      let files = _fs.readdirSync(path.resolve(root, "definitions"));
      let fileMain = files.find(e => e === `${workspace.mainAddFileName}.add.json`);
      let file = files.find(e => e === `${fileName}.add.json`);

      if (!file) {
        if (!allowFallBack || !fileMain) {
          return;
        }
        file = fileMain;
      }

      return vscode.Uri.file(path.resolve(root, "definitions", file));

    } catch (err) {
      log.error(`Unable to find the adapter definition document.`);
    }

  }

  export const listAddFiles = () => fs.checkWorkspaceInitialized().pipe(
    map(() => fs.getWorkspaceRoot()),
    map(root => ({ root: root!, files: _fs.readdirSync(path.resolve(root!, "definitions")).filter(e => e.endsWith(`.add.json`)) }))
  );

  /**
   * Get ADD content in current RAB workspace.
   * @returns ADD or undefined if not found.
   */
  export function getAddContent(fileName: string = workspace.mainAddFileName): string | undefined {
    let root = fs.getWorkspaceRoot();
    if (!root) { return undefined; };
    try {
      let file = getAddFile(fileName);
      if (file) {
        return _fs.readFileSync(path.resolve(root, "definitions", file.fsPath), 'utf8');
      }
    } catch (err) {
    }
    return undefined;
  }
}

export namespace fs {

  export const STATIC_SERVER_PORT = 18888;
  export const WEBVIEW_URL = `http://localhost:${STATIC_SERVER_PORT}`;

  var mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf"
  };

  export const serveStaticServer = () => {
    const staticServerRoot = path.resolve(__dirname, '../', `webview`);

    return createServer((req, res) => {
      if (!req.url) {
        return;
      }
      let url = new URL(WEBVIEW_URL);
      try {
        url = new URL(`${WEBVIEW_URL}${req.url}`);

      } catch (err) {
        log.error(`${err}`);
        log.showOutputChannel();
      }
      bindNodeCallback(_fs.readFile)(`${staticServerRoot}/${url.pathname}`).pipe(
        map((buffer) => {
          const ext = url.pathname.split('.').pop() || 'html';
          return {
            statusCode: 200,
            mime: mimeTypes[`.${ext}` as keyof typeof mimeTypes] || `text/html`,
            buffer,
          };
        }),
        tap(
          ({ statusCode, mime, buffer }) => {
            res.writeHead(statusCode, { 'content-type': mime });
            res.end(buffer);
          }
        ),
        catchError(() => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(_fs.readFileSync(`${staticServerRoot}/index.html`));
          return of(200);
        })
      ).subscribe();

    }).listen(
      STATIC_SERVER_PORT
    );
  };

  export const getFileNameFromPostmanCollectionName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9-. ]/g, '_');
  };

  export const checkWorkspaceInitialized = () => from(isWorkSpaceInitialized())
    .pipe(
      filter(initialized => !initialized),

      switchMap(
        (addFile) => message
          .confirm(`Your workspace is not intialized or was impaired. You must initialize/repair it before continue`, {
            yesText: `Intialize/Repair`
          })
      ),

      switchMap(
        (confirm) => iif(
          () => confirm,
          of(
            null
          ).pipe(
            switchMap(() => initWorkspace()),
            map(() => false)
          ),
          of(false)
        )
      ),

      defaultIfEmpty(true),

      takeWhile(isContinue => isContinue)


    );



  export const ensureAddFile = (addFileName: string = '', defaultFileContent?: string) => {

    addFileName = getFileNameFromPostmanCollectionName(addFileName);

    let ws = getWorkspaceRoot() || '';

    let sourcePath = pathExists(path.resolve(__dirname, '../scaffold')) ? path.resolve(__dirname, '../scaffold') : path.resolve(__dirname, '../../scaffold');

    const srcAddPath = path.resolve(sourcePath, workspace.presetFileMap.definitions, workspace.presetFileMap.definitionsMainAddJson);
    const definitionPath = path.resolve(ws, workspace.presetFileMap.definitions);
    const addPath = path.resolve(definitionPath, workspace.presetFileMap.definitionsMainAddJson);
    const addFileNameAddPath = path.resolve(definitionPath, `${addFileName}.${workspace.extensionMap.add}`);

    const isDefaultAddExist = _fs.existsSync(addPath);
    const isCustomiedAddExist = _fs.existsSync(addFileNameAddPath);

    if (addFileName) {
      if (!isCustomiedAddExist) {
        _fs.copyFileSync(srcAddPath, addFileNameAddPath);

        if (defaultFileContent) {
          _fs.writeFileSync(addFileNameAddPath, defaultFileContent);
        }
      }
    } else if (!isDefaultAddExist) {
      _fs.copyFileSync(srcAddPath, addPath);
      if (defaultFileContent) {
        _fs.writeFileSync(addPath, defaultFileContent);
      }
    }

  };

  function copyRecursiveNoOverride(src: string, dest: string) {
    try {
      fsExtra
        .readdirSync(src)
        .filter(e => fsExtra.statSync(path.resolve(src, e)).isDirectory())
        .forEach(e => {
          log.debug(`Ensures dir: ${e}`);
          fsExtra.ensureDirSync(path.resolve(dest, e));
        });
      fsExtra.copySync(src, dest, {
        overwrite: false,
        filter: e => !path.basename(e).startsWith('.')
      });
    } catch (error) {
      log.warn(`${error}`);
    }
  }

  export const initWorkspace = async () => {

    ensureOpenWorkspace();

    log.showOutputChannel();

    let ws = getWorkspaceRoot() || '';

    if (await isWorkSpaceInitialized()) {
      log.warn(`[initWorkspace] The workspace is already intialized at [${ws}]`);
      return;
    }


    let p = pathExists(path.resolve(__dirname, '../scaffold')) ? path.resolve(__dirname, '../scaffold') : path.resolve(__dirname, '../../scaffold');

    copyRecursiveNoOverride(p, path.resolve(ws));

    log.debug("Workspace initialized.");
    vscode.commands.executeCommand('orab.explorer.profile.refresh');

    log.info("📝 Please review the publisher settings.");

    vscode.commands.executeCommand('orab.explorer.profile.edit');
  };

  /**
 * Get the filename from a path.
 * @param file 
 * @returns 
 */
  export function parseFilename(file: vscode.Uri) {
    let arr = file.fsPath?.split('/');
    return arr[arr.length - 1];
  }

  const defaultErrMsg = (file: vscode.Uri,) => from(message.showErrorWithLog(`The file format of '${parseFilename(file)}' is invalid.`))
    .pipe(
      map(() => file)
    );

  export const isFileMatching = (
    file: vscode.Uri,
    assert: (doc: vscode.TextDocument) => boolean,
    errorMsg: (file: vscode.Uri,) => Observable<any> = defaultErrMsg
  ) => from(vscode.workspace.openTextDocument(file))
    .pipe(
      map(doc => {
        try {
          return assert(doc);
        } catch (error) {
          return false;
        }
      }),
      switchMap(
        (isCorrect) => {

          if (!isCorrect) {
            try {
              return errorMsg(file)
                .pipe(
                  map(() => isCorrect)
                );
            } catch (error) {
              log.error(`${error}`);
            }
          }

          return of(isCorrect);
        }
      ),
      filter(isCorrect => isCorrect)
    );

  export function isFileSaved(file: vscode.Uri) {
    return from(vscode.workspace.openTextDocument(file))
      .pipe(
        tap((file) => {
          log.debug(`[confirmSaveFile] checking if file is saved [${file}]`);
        }),
        map(doc => !doc.isDirty),
      );
  }
  export function saveFile(file: vscode.Uri) {
    return vscode.workspace.openTextDocument(file).then(doc => doc.save());
  }

  export const confirmOperationOnNonMainFile = (file: vscode.Uri, operation: string) => {
    return of(file)
      .pipe(
        map(file => fs.parseFilename(file!)),

        switchMap(
          (fileName) => iif(
            () => fileName === workspace.presetFileMap.definitionsMainAddJson,
            of(false),
            of(fileName)
              .pipe(
                switchMap((fileName) => message.confirm(`'${fileName}' is not the main document '${workspace.presetFileMap.definitionsMainAddJson}'. Are you sure`, {
                  yesText: operation,
                  useNotification: true
                })
                ),
                filter(confirmed => !!confirmed),
                tap(() => message.showInfoWithLog(`Perform operation '${operation}' over file [${fileName}]`)),
                map(() => true)
              )

          )
        ),
      );
  }

  export function confirmSaveFile(file: vscode.Uri) {
    return isFileSaved(file)
      .pipe(
        switchMap(
          (isSaved) => iif(
            () => isSaved,
            of(true),
            of(file)
              .pipe(
                map((file) => file.path.split('/').pop()!),
                switchMap((fileName) => message.confirm(`${fileName} should be saved before continue.`, {
                  yesText: "Save and proceed",
                  useNotification: true
                })
                ),
                filter(isToSave => !!isToSave),
                tap(() => message.showInfoWithLog(`File saved`)),
                switchMap(() => saveFile(file))
              )

          )
        ),

        tap((isSaved) => {
          log.debug(`[confirmSaveFile] isSaved [${isSaved}]`);
        }),

        filter(isSaved => isSaved)
      );
  }

  /**
   * Get the folder path of current workspace's root.
   * @returns 
   */
  export function getWorkspaceRoot() {

    const getWorkspacePath = () => (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
      ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

    let workspace = getWorkspacePath();

    return workspace;
  }

  /**
   * Check if a path exists in FS.
   * 
   * @param p 
   * @returns 
   */
  export function pathExists(p: string): boolean {
    try {
      _fs.accessSync(p);
      return true;
    } catch (err) {
      return false;
    }
  }

}

export namespace ext {

  export function readTextFile(file: string): string {
    let root = path.resolve(__dirname, '..');
    let filePath = path.resolve(root, file);
    return _fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Load JSON file in extension bundle.
   * @param file relative to the extension root.
   * @returns The JSON object
   */
  export function readJson(file: string): object {
    let root = path.resolve(__dirname, '..');
    let filePath = path.resolve(root, file);
    return JSON.parse(_fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * Read file names in extension bundle.
   * @param dir dir relative to the extension root.
   * @returns The list of filenames in the directory.
   */
  export function readDir(dir: string): string[] {
    let root = path.resolve(__dirname, '..');
    return _fs.readdirSync(path.resolve(root, dir).replace("src", "out"));
  }
}

export namespace message {

  export type ConfirmProp = {
    yesText?: string;
    noText?: string;
    useNotification?: boolean;
  };

  export const confirmV2 = (getMsg: () => string, opts: ConfirmProp = {

  }) => of(null)
    .pipe(
      switchMap(
        () => confirm(getMsg(), opts)
      )
    );

  export async function confirm(msg: string, {
    yesText = "Yes",
    noText,
    useNotification
  }: ConfirmProp = {

    }): Promise<boolean> {
    log.showOutputChannel();
    log.info(`${msg}`);
    return (noText ? vscode.window
      .showInformationMessage(msg, { modal: !useNotification }, yesText, noText)
      : vscode.window
        .showInformationMessage(msg, { modal: !useNotification }, yesText)
    )
      .then(
        str => { return str === yesText; },
        () => { return false; }
      );
  }

  export async function showInfo<T extends string>(msg: string, options: vscode.MessageOptions = {}, ...items: T[]) {
    return vscode.window
      .showInformationMessage(msg, { ...options }, ...items);
  }
  export async function showInfoWithLog<T extends string>(msg: string, options: vscode.MessageOptions = {}, ...items: T[]) {
    log.showOutputChannel();
    log.info(msg);
    return vscode.window
      .showInformationMessage(msg, { ...options }, ...items);
  }

  export function showErrorWithLog<T extends string>(msg: string, options: vscode.MessageOptions = {}, ...items: T[]) {
    log.showOutputChannel();
    log.error(msg);
    return vscode.window
      .showErrorMessage(msg, { ...options }, ...items);
  }

  export function pop(msg: string, duration: number = 2) {
    let disposable = vscode.window.setStatusBarMessage(msg);
    setTimeout(() => disposable.dispose(), duration * 1000);
  }

  export function loading({ message, hidePromise, context, isBlocking }: { message: string, hidePromise: Promise<any>, context: vscode.ExtensionContext, isBlocking?: boolean }) {

    // const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    // myStatusBarItem.text = `$(sync~spin) ${message}`;

    // myStatusBarItem.show();

    // context.subscriptions.push(myStatusBarItem);

    if (isBlocking) {

      const showMask = () => {
        return showInfoWithLog(message, { modal: true });
      };
      showMask();
    };

    const promise = vscode.window.setStatusBarMessage(message, hidePromise);

    const hideStatusItem = () => {
      showInfoWithLog(`Done`);
      // myStatusBarItem.hide();
      // myStatusBarItem.dispose();
    };

    hidePromise.then(
      hideStatusItem,
      hideStatusItem
    );

    context.subscriptions.push(promise);

    return promise;
  }
}

export namespace AddValidateReponseNs {
  export interface Root {
    errors: Warning[]
    warnings: Warning[]
    valid: boolean
  }

  export interface Warning {
    ruleId: string
    message: string
    severity: string
    location: string
    suggestions: string[]
  }

}

export namespace AddListReponseNs {
  export interface Root {
    items: Item[]
    limit: number
    offset: number
    hasMore: boolean
    count: number
  }

  export interface Item {
    adapterId: string
    adapterVersion: string
    createdBy: string
    updatedBy?: string
    createdTime: number
    updatedTime: number
    kind: string
    state: string
  }

}

export namespace AddCreateUpdateResponseNs {
  export interface Root {
    success: boolean
    id: string
    version: string
    validation: Validation
  }

  export interface Validation {
    warnings: any[]
    errors: any[]
    valid: boolean
  }

}