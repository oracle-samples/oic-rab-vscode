/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { firstValueFrom, switchMap } from 'rxjs';
import * as api from '../api';
import { fs } from '../utils';
import { SharedNs } from '../webview-shared-lib';
import { getAddName } from '../workspace-manager';
import { callApiAndShowADDDocument } from './add-operation-helper';

export const callADDCompressApiAndShowDocument = async (addFile: vscode.Uri, config?: SharedNs.WebviewCommandPayloadADDCompressRequests) => {
  return callApiAndShowADDDocument(
    {
      operationName: `Compressing ${fs.parseFilename(addFile)}`,
      newAddName: getAddName(addFile),
      apiCall: (file1, cfg) => api.conversion.compress(file1, cfg),
      file1: addFile,
      config,
    }
  );
};

export function addCompressCallback(file: vscode.Uri, context: vscode.ExtensionContext, config?: SharedNs.WebviewCommandPayloadADDCompressRequests) {

  const observable = fs.checkWorkspaceInitialized().pipe(
    switchMap(
      () => callADDCompressApiAndShowDocument(file, config)
    )
  );

  const promise = firstValueFrom(observable);

  return promise;
}