/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as _fs from 'fs';

import { AxiosResponse } from 'axios';
import { bindNodeCallback, catchError, firstValueFrom, from, map, switchMap, tap, throwError } from 'rxjs';
import * as api from '../api';

import { log } from '../logger';
import { constants, fs, workspace } from '../utils';
import { PostmanNs, SharedNs } from '../webview-shared-lib';

const revealADDDocument = () => switchMap(
  (documentAndResponse: {
    response: AxiosResponse<any, any>,
    document: vscode.TextDocument
  }) => from(workspace.showADDDocument(documentAndResponse.document))
    .pipe(
      map(editor => ({
        editor,
        ...documentAndResponse
      })
      )
    )
);

const getPostmanCollection = (postmanFile: vscode.Uri) => bindNodeCallback(_fs.readFile)(postmanFile.fsPath).pipe(
  map(buffer => JSON.parse(buffer.toString()) as PostmanNs.Root)
);

const getPostmanCollectionName = (postmanFile: vscode.Uri) => getPostmanCollection(postmanFile).pipe(
  map(postman => postman.info.name)
);
const getPostmanCollectionNameAsFileName = (postmanFile: vscode.Uri) => getPostmanCollectionName(postmanFile).pipe(
  map(postmanCollectionName => fs.getFileNameFromPostmanCollectionName(postmanCollectionName))
);

export const callConversionApiAndShowDocument = (postmanFile: vscode.Uri, addFile?: vscode.Uri, selectedItems?: string[]) => 
  fs.checkWorkspaceInitialized()
  
  .pipe(

    switchMap(
      () => getPostmanCollectionNameAsFileName(postmanFile)
    ),
  
    switchMap(
      (postmanCollectionName) => from(api.conversion.postman(postmanFile, !!addFile ? addFile : undefined, selectedItems)).pipe(
        map(response => ({
          postmanCollectionName,
          response,
        }))
      )
    ),

    switchMap(
      ({ postmanCollectionName, response }) => workspace.detectOverrideAndOpenADDDocument(postmanCollectionName, SharedNs.ADDJsonStringify(response.data))
      .pipe(
        map(
          (document) => ({
            response,
            document
          })
        ),
      )
    ),

    revealADDDocument(),
    
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

function callback(file: vscode.Uri, context: vscode.ExtensionContext) {

  const observable = fs.checkWorkspaceInitialized().pipe(
    switchMap(
      () => workspace.detectIsPostmanFileWithUILoading(
        context,
        file, 
        () => callConversionApiAndShowDocument(file)
      )
    )
  ) ;

  const promise = firstValueFrom(observable);

  return promise;
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(constants.commands.orabConvertPostmanDocument, (file: vscode.Uri) => callback(file, context));
  context.subscriptions.push(disposable);
  return disposable;
}