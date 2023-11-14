/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as utils from '../utils';

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.initWorkspace", () => utils.fs.initWorkspace());
  context.subscriptions.push(disposable);
}