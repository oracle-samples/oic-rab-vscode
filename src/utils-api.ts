/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import { of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { registration } from './api';
import { log } from './logger';
import { fs, message, workspace } from './utils';

const invalidAddHandler = (
  getFile = () => workspace.getAddFile()!
) => {
  message.showErrorWithLog(`❌ The operation is aborted because the adapter definition '${fs.parseFilename(getFile())}' is invalid. You need to correct it before continue.`);
  return workspace.showADDDocument();
};

export const detectIsADDValidRemote = (getFile = () => workspace.getAddFile()!) => fs.checkWorkspaceInitialized().pipe(
  switchMap(
    () => workspace.detectIsADDLocal(
      getFile,
      (getFile) => invalidAddHandler(getFile)
    )
  ),
  tap(
    () => message.showInfoWithLog(`🛜 Verifying the adapter definition [${workspace.presetFileMapAbs.definitionsMainAddJson}]`)
  ),
  switchMap(() => registration
    .validateAdd(getFile())
  ),
  switchMap(res => {
    if (res.data.valid) {
      return of(res);
    } else {
      log.error("Result: " + log.formatJSON(res.data));
      return invalidAddHandler(getFile).pipe(
        map(() =>res)
      );
    }
  }),
  filter(
    res => res.data.valid
  ),
  catchError((err) => {

    log.showOutputChannel();
    log.error(err);
    message.showErrorWithLog("❌ Unable to call API for validating the adapter definition");
    return of(false);
  }),
  filter((ret) => !!ret)
);
