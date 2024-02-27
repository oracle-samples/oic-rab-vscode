/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as vscode from 'vscode';
import { Observable, from, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { registration } from './api';
import { log } from './logger';
import { fs, message, workspace } from './utils';
import { RABError, showErrorMessage } from './utils/ui-utils';
import { getAddFile } from './workspace-manager';
import { RabAddNs } from './webview-shared-lib';

const invalidAddHandler = (
  getFile = () => workspace.getAddFile()!
) => {
  showErrorMessage(`❌ The operation is aborted because the adapter definition '${fs.parseFilename(getFile())}' is invalid. You need to correct it before continue.`);
  return workspace.showADDDocument();
};

export const detectIsADDLocal = (
  getFile = () => workspace.getAddFile()!,
  errorError: (getFile: () => vscode.Uri) => Observable<any> = (getFile: () => vscode.Uri) =>
    from(showErrorMessage(`The offered file is not a valid adapter definition document. File:  ['${fs.parseFilename(getFile())}']`))

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

export const detectIsADDValidRemote = (getFile = () => getAddFile()!) => fs.checkWorkspaceInitialized().pipe(
  switchMap(
    () => detectIsADDLocal(
      getFile,
      (getFile) => invalidAddHandler(getFile)
    )
  ),
  tap(
    () => showErrorMessage(`🛜 Verifying the adapter definition [${workspace.presetFileMapAbs.definitionsMainAddJson}]`)
  ),
  switchMap(
    () => registration.validateAdd(getFile()
  )
  ),
  switchMap(report => {
    if (report.valid) {
      return of(report);
    } else {
      log.error("Result: " + log.format(report));
      return invalidAddHandler(getFile).pipe(
        map(() =>report)
      );
    }
  }),
  filter(
    report => report.valid
  ),
  catchError((err) => {
    log.showOutputChannel();
    showErrorMessage(new RABError("❌ Unable to call API for validating the adapter definition", err));
    return of(false);
  }),
  filter((ret) => !!ret)
);
