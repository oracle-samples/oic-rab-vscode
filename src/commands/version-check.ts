/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import path from 'path';
import * as vscode from 'vscode';

import { firstValueFrom } from 'rxjs';
import * as api from '../api';
import { log } from '../logger';
import { fs } from '../utils';
import { RABError, showErrorMessage } from '../utils/ui-utils';

async function callback(file: vscode.Uri) {

  const isSaved = await firstValueFrom(fs.confirmSaveFile(file, true));
  if (!isSaved) {
    return;
  }
  
  log.info(`Version check on ${path.basename(file.fsPath)}...`);

  try {
    let report = await api.registration.verionCheck(file);
    let same = report.advices.length === 0;
    if (same) {
      log.info(`Version check complete. Documents are identical.`);
    } else {
      log.info(`Version check complete. Recommended version change: ${report.minLevelUpdate}`);
    }
  } catch (err) {
    showErrorMessage(new RABError('Cannot conduct version check.', err));
  }
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("orab.add.version-check", callback)
  );
}