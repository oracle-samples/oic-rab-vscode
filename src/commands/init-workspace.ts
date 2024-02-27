/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { RABError, showErrorMessage } from '../utils/ui-utils';
import { initWorkspace } from '../workspace-manager';

export async function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("orab.initWorkspace", async () => {
      try {
        await initWorkspace();
      } catch (err) {
        showErrorMessage(new RABError("Cannot initialize workspace.", err));
      }
    })
  );
}