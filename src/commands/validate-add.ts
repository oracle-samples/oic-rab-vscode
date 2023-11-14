/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { of, switchMap } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import * as api from '../api';
import { log } from '../logger';
import * as utils from '../utils';

function callback(file: vscode.Uri, context: vscode.ExtensionContext): any {

  utils.fs.confirmSaveFile(file)
    .pipe(

      tap(() => log.showOutputChannel()),
      tap(() => log.info(`Validating ${utils.fs.parseFilename(file)}...`)),

      switchMap(
        () => api.registration
          .validateAdd(file)
      ),

      tap(res => {
        if (res.data.valid) {
          log.info("Result: " + log.formatJSON(res.data));
          utils.message.showInfoWithLog("👍 Good job. Your adapter definition document is valid.");
        } else {
          log.error("Result: " + log.formatJSON(res.data));
          utils.message.showErrorWithLog("❌ Your adapter definition document is invalid. See OUTPUT for more.");
        }
      }),

      catchError(err => {
        utils.message.showErrorWithLog(`API call failed (code=${err?.response?.status}). See OUTPUT for more.`);
        log.error(err.response.data);
        return of(err);
      })
    )
    .subscribe();

}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.add.validate", (file: vscode.Uri) => {
    callback(file, context);
  });
  context.subscriptions.push(disposable);
}