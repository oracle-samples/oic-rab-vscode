/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as utils from '../utils';

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.initWorkspace", () => {
    try {
      utils.fs.initWorkspace();
    } catch (err) {
      if (err instanceof Error) {
        vscode.window.showErrorMessage("Cannot initialize workspace: " + err.message);
      }
    }
  });
  context.subscriptions.push(disposable);
}