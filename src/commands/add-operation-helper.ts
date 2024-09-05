/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';


import { catchError, firstValueFrom, from, map, switchMap, tap, throwError } from 'rxjs';
import * as api from '../api';

import { AxiosResponse } from 'axios';
import { log } from '../logger';
import { fs, workspace } from '../utils';
import { showErrorMessage, showInfoMessage, withProgress } from '../utils/ui-utils';
import { SharedNs } from '../webview-shared-lib';

export const callApiAndShowADDDocument = <CONFIG, RESDATA, RESPONSE extends AxiosResponse<RESDATA, any>>({
  operationName, 
  newAddName, 
  file1, 
  config,
  file2,
  apiCall
}: {
  operationName: string, 
  newAddName?: string, 
  file1: vscode.Uri, 
  config?: CONFIG, 
  file2?: vscode.Uri,
    apiCall: (
      file1: vscode.Uri,
      config?: CONFIG,
      file2?: vscode.Uri,
    ) => Promise<RESPONSE>
}) => 
  firstValueFrom(fs.checkWorkspaceInitialized()
  
  .pipe(

    tap(
      () => showInfoMessage(`Start ${operationName}...`)
    ),

    switchMap(
      () => from(
        withProgress(
          `${operationName}...`,
          () => apiCall(file1, config, file2)
        )
      ).pipe(
        map(response => ({
          response,
        }))
      )
    ),

    switchMap(
      ({ response }) => workspace.detectOverrideAndOpenADDDocument(newAddName, SharedNs.ADDJsonStringify(response.data))
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

    tap(
      () => showInfoMessage(`Finish ${operationName}.`)
    ),

    catchError(err => {
      log.error(`❌ ${operationName} failed`, err);
      api.logInfoServer(err?.cause?.message);
      api.logInfoServer(err?.cause?.response?.data);
      showErrorMessage(`❌ ${operationName} failed`);
      return throwError(() => err);
    })
  ));
