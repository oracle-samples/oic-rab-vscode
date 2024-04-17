/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import path from 'path';

import { log } from '../logger';
import * as api from '../api';
import { RABError, showErrorMessage } from '../utils/ui-utils';

async function callback(file: vscode.Uri) {

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