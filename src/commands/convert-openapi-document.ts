/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as _fs from 'fs';

import { bindNodeCallback, catchError, filter, firstValueFrom, from, map, switchMap, tap, throwError } from 'rxjs';
import * as api from '../api';

import { log } from '../logger';
import { fs, workspace } from '../utils';
import { showWarningMessage, withProgress } from '../utils/ui-utils';
import { OpenAPINS, SharedNs } from '../webview-shared-lib';


const getOpenAPIDocument = (file: vscode.Uri) => bindNodeCallback(_fs.readFile)(file.fsPath).pipe(
  map(buffer => JSON.parse(buffer.toString()) as OpenAPINS.Root)
);

const getOpenAPIDocumentName = (file: vscode.Uri) => getOpenAPIDocument(file).pipe(
  map(openapi => openapi.info.title)
);
const getOpenAPIDocumenNameAsFileName = (file: vscode.Uri) => getOpenAPIDocumentName(file).pipe(
  map(name => fs.getFileNameFromOpenAPIName(name))
);

export const filterOpenAPIConfig = (openAPIConfig?: SharedNs.WebviewCommandPayloadOpenAPISelectRequests) => {
  if (!openAPIConfig) {
    return;
  }

  //@ts-ignore
  delete openAPIConfig.actionDelta.selected;

  return openAPIConfig;
  
}

export const callOpenAPIConversionApiAndShowDocument = (openAPIFile: vscode.Uri, openAPIConfig: SharedNs.WebviewCommandPayloadOpenAPISelectRequests, addFile?: vscode.Uri,) => 
  fs.checkWorkspaceInitialized()
  
  .pipe(

    tap(
      () =>  {
        if (!openAPIConfig.actionDelta.add.length && !openAPIConfig.actionDelta.remove.length) {
          showWarningMessage(`There is nothing to add or to remove`);
        }
      }
    ),

    filter(
      () => !!openAPIConfig.actionDelta.add.length || !!openAPIConfig.actionDelta.remove.length
    ),

    switchMap(
      () => getOpenAPIDocumenNameAsFileName(openAPIFile)
    ),
  
    switchMap(
      (openAPIName) => from(
        withProgress(
          'Converting OpenAPI document...',
          () => api.conversion.openapi(openAPIFile, filterOpenAPIConfig(openAPIConfig), addFile)
        )
      ).pipe(
        map(response => ({
          openAPIName,
          response,
        }))
      )
    ),

    switchMap(
      ({ openAPIName, response }) => workspace.detectOverrideAndOpenADDDocument(openAPIName, SharedNs.ADDJsonStringify(response.data))
      .pipe(
        map(
          (document) => ({
            response,
            document
          })
        ),
      )
    ),

    workspace.revealADDDocument(),
    
    tap(({ editor, response }) => {
      let source = editor.document.getText();
      let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
      editor.edit(edit => {
        edit.replace(range, SharedNs.ADDJsonStringify(response?.data));
        
      }).then(ret => {
        setTimeout(() => {
          vscode.commands.executeCommand('orab.explorer.outline.refresh');
        }, 1000);
      });
    }),


    catchError(err => {
      log.error(`Unable to convert document. [${err}]`);
      return throwError(() => err);
    })
  );

export function openAPIConvertCallback(file: vscode.Uri, context: vscode.ExtensionContext, openAPIConfig: SharedNs.WebviewCommandPayloadOpenAPISelectRequests) {

  const observable = fs.checkWorkspaceInitialized().pipe(
    switchMap(
      () => workspace.detectIsOpenAPIFileWithUILoading(
        context,
        file, 
        () => callOpenAPIConversionApiAndShowDocument(file, openAPIConfig)
      )
    )
  ) ;

  const promise = firstValueFrom(observable);

  return promise;
}