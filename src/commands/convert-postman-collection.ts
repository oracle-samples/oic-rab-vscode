/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as _fs from 'fs';

import { bindNodeCallback, firstValueFrom, from, map, switchMap } from 'rxjs';
import * as api from '../api';

import { fs, workspace } from '../utils';
import { PostmanNs, SharedNs } from '../webview-shared-lib';
import { callApiAndShowADDDocument } from './add-operation-helper';


const getPostmanCollection = (postmanFile: vscode.Uri) => bindNodeCallback(_fs.readFile)(postmanFile.fsPath).pipe(
  map(buffer => JSON.parse(buffer.toString()) as PostmanNs.Root)
);

const getPostmanCollectionName = (postmanFile: vscode.Uri) => getPostmanCollection(postmanFile).pipe(
  map(postman => postman.info.name)
);
const getPostmanCollectionNameAsFileName = (postmanFile: vscode.Uri) => getPostmanCollectionName(postmanFile).pipe(
  map(postmanCollectionName => fs.getFileNameFromPostmanCollectionName(postmanCollectionName))
);

export const callPostmanConversionApiAndShowDocument = async (postmanFile: vscode.Uri, postmanConfig?: SharedNs.WebviewCommandPayloadPostmanSelectRequests, addFile?: vscode.Uri,) =>  {
  return callApiAndShowADDDocument(
    {
      operationName: `Converting Postman Collection ${fs.parseFilename(postmanFile)}`,
      newAddName: await firstValueFrom(getPostmanCollectionNameAsFileName(postmanFile)),
      apiCall: (postmanFile, postmanConfig, addFile) => api.conversion.postman(postmanFile, postmanConfig),
      file1: postmanFile,
      config: postmanConfig,
      file2: addFile
    }
  );
}
export function postmanConvertCallback(file: vscode.Uri, context: vscode.ExtensionContext, postmanConfig: SharedNs.WebviewCommandPayloadPostmanSelectRequests) {

  const observable = fs.checkWorkspaceInitialized().pipe(
    switchMap(
      () => workspace.detectIsPostmanFileWithUILoading(
        context,
        file, 
        () => from(callPostmanConversionApiAndShowDocument(file, postmanConfig))
      )
    )
  ) ;

  const promise = firstValueFrom(observable);

  return promise;
}

// export function register(context: vscode.ExtensionContext) {
//   let disposable = vscode.commands.registerCommand(constants.commands.orabConvertPostmanDocument, (file: vscode.Uri) => callback(file, context));
//   context.subscriptions.push(disposable);
//   return disposable;
// }