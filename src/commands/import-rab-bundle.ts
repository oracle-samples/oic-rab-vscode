/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { ensureEmptyWorkspace, ensureValidRABWorkspace, importRABBundle } from '../workspace-manager';
import { log } from '../logger';
import { showErrorMessage, showInfoMessage, showWarningMessage } from '../utils/ui-utils';


async function callback(file: vscode.Uri): Promise<any> {
  log.info("Importing RAB bundle in current workspace");
  try {
    await ensureEmptyWorkspace();
  } catch (err) {
    showErrorMessage(err);
    return;
  }

  let selection = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: true,
    canSelectFolders: false,
    filters: { 'RAB': ['rab'] }
  });
  if (!selection || !selection[0]) {
    return;
  }
  let uri = selection[0];

  try {
    let success = await importRABBundle(uri);

    if (success) {
      showInfoMessage(`RAB bundle imported.`);
    } else {
      showWarningMessage(`RAB bundle imported but the content may be invalid.`);
    }
    
  } catch (err) {
    showErrorMessage(err);
  }
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("orab.importRabBundle", callback)
  );
}