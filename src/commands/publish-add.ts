/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as vscode from 'vscode';

import { iif, of, switchMap } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import * as _ from 'lodash';

import * as api from '../api';
import { log } from '../logger';
import { message, fs as utilsFs, workspace } from '../utils';

function callback(file: vscode.Uri, context: vscode.ExtensionContext): any {

  utilsFs.confirmOperationOnNonMainFile(file, "Publish")
    .pipe(

      switchMap(
        () => utilsFs.confirmSaveFile(file)
      ),
      switchMap(
        () => workspace.detectIsADDWithUILoading(
          context,
          file,

          () => of(null).pipe(

            tap(() => log.showOutputChannel()),
            tap(() => log.info(`Preparing to publish '${utilsFs.parseFilename(file)}'`)),
            // tap(() => log.info("Checking SI...")),

            map(() => {
              let add = JSON.parse(fs.readFileSync(file.fsPath, 'utf8'));
              let id = _.get(add, ['info', "id"]) as string;
              let version = _.get(add, ['info', "version"]) as string;
              log.info(`Found ${id}:${version}`);
              return id;
            }),
            switchMap(
              (id) => api.registration
                .listAdd()
                .then(
                  (response) => ({
                    id,
                    response
                  })
                )
            ),

            switchMap(
              ({ response, id }) => iif(
                () => !!response.data.items.find((addItem) => addItem.adapterId === id),
                of(true)
                  .pipe(
                    tap(() => log.info(`'${id}' exists, updating...`)),
                    switchMap(() => api.registration.updateAdd(id, file))
                  ),
                of(true)
                  .pipe(
                    tap(() => log.info(`'${id}' does not exist, creating...`)),
                    switchMap(() => api.registration.createAdd(file))
                  ),
              )
            ),

          )
        )
      ),

      tap(res => {
        log.info(`Response: ${log.formatJSON(res?.data)}`);
        message.showInfoWithLog("✅ Published.");
      }),

      catchError(err => {
        log.error(`Response: ${log.formatJSON(err.response?.data)}`);
        message.showErrorWithLog(`API call failed (code=${err?.response?.status}). See OUTPUT for more.`);
        return of(err);
      })
    )

    .subscribe();

}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.add.publish", (file) => callback(file, context));
  context.subscriptions.push(disposable);
}