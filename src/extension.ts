/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { log } from './logger';

import * as addLocate from './commands/add-locate';
// import * as convertPostmanCollection from './commands/convert-postman-collection';
import * as deleteAdd from './commands/delete-add';
import * as explorerOutlineActionsNew from './commands/explorer-outline-actions-new';
import * as explorerOutlineTriggersNew from './commands/explorer-outline-triggers-new';
import * as getAdd from './commands/get-add';
import * as initWorkspace from './commands/init-workspace';
import * as insertSecurityPolicy from './commands/insert-security-policy';
import * as insertTestConnection from './commands/insert-test-connection';
import * as publishAdd from './commands/publish-add';
import * as validateAdd from './commands/validate-add';
import * as versionCheck from './commands/version-check';

import * as addListProvider from './providers/add-list-provider';
import * as addOutlineProvider from './providers/add-outline-provider';
import * as postmanSelectRequrestWebview from './providers/copilot-webview';
import * as profileListProvider from './providers/profile-list-provider';

import { init as initProfileManager } from './profile-manager-provider';

async function registerCommands(context: vscode.ExtensionContext) {
  addLocate.register(context);
  // convertPostmanCollection.register(context);
  deleteAdd.register(context);
  explorerOutlineActionsNew.register(context);
  explorerOutlineTriggersNew.register(context);
  getAdd.register(context);
  initWorkspace.register(context);
  insertSecurityPolicy.register(context);
  insertTestConnection.register(context);
  publishAdd.register(context);
  validateAdd.register(context);
  versionCheck.register(context);
}

async function registerProviders(context: vscode.ExtensionContext) {
  addListProvider.register(context);
  addOutlineProvider.register(context);
  postmanSelectRequrestWebview.register(context);
  profileListProvider.register(context);
}

export async function activate(context: vscode.ExtensionContext) {

  try {
    initProfileManager(context);

    await registerCommands(context);
    await registerProviders(context);

  } catch (err) {
    log.error(`activation failed.`, err);
  }

  log.info(`Extension 'OIC Rapid Adapter Builder' is now active.`);
}


// This method is called when your extension is deactivated
export function deactivate() {
  log.info(`Extension "OIC Rapid Adapter Builder" is now deactivated!`);
}
