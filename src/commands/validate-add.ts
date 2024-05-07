/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import path from 'path';

import { firstValueFrom } from 'rxjs';
import * as api from '../api';
import { log } from '../logger';
import { fs } from '../utils';
import { RABError, showErrorMessage, showInfoMessage } from '../utils/ui-utils';

async function callback(file: vscode.Uri, context: vscode.ExtensionContext) {

  const isSaved = await firstValueFrom(fs.confirmSaveFile(file, true));
  if (!isSaved) {
    return;
  }

  log.info(`Validating adapter definition ${path.basename(file.fsPath)}...`);

  try {
    let report = await api.registration.validateAdd(file);
    if (report.valid) {
      showInfoMessage("👍 Good job. Your adapter definition document is valid.");
    } else {
      showErrorMessage("❌ Your adapter definition document is invalid. See OUTPUT for more.");
    }
  } catch (err) {
    showErrorMessage(new RABError('Cannot validate adapter definition.', err));
  }
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("orab.add.validate", callback)
  );
}