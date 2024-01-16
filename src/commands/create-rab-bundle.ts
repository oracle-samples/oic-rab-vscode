/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { createRabBundle } from '../workspace-manager';

async function callback(file: vscode.Uri): Promise<any> {
  try {
    await createRabBundle();
    vscode.window.showInformationMessage("RAB bundle created.");
  } catch (err) {
    if (err instanceof Error) {
      vscode.window.showErrorMessage("Cannot create RAB bundle: " + err.message);
    }
  }
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.createRabBundle", callback);
  context.subscriptions.push(disposable);
}