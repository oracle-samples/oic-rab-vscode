/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { log } from '../logger';
import { showErrorMessage } from '../utils/ui-utils';
import { exportRABBundle } from '../workspace-manager';


async function callback(file?: vscode.Uri): Promise<any> {
  
  log.info("Creating RAB bundle in current workspace");
  try {
    await exportRABBundle();
    vscode.window.showInformationMessage("RAB bundle created.");
  } catch (err) {
    showErrorMessage(err);
  }
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("orab.createRabBundle", callback)
  );
}