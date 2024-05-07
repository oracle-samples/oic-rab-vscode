
/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as api from '../api';
import { log } from '../logger';
import { RABTreeItem } from '../providers/add-list-provider';
import { RABError, showConfirmMessage, showErrorMessage } from '../utils/ui-utils';

async function callback(item: RABTreeItem) {

  let id = item.getData().adapterId;
  try {
    let yes = await showConfirmMessage(`Do you want to remove '${id}' from current SI?`);
    if (!yes) {
      return;
    }
    log.info(`Removing '${id}'...`);
    let ret = await api.bundle.remove(id);
    if (ret) {
      log.info(`Adapter bundle '${id}' removed.`);
    } else {
      log.info(`Adapter bundle '${id}' does not exist.`);
    }
  } catch (err) {
    showErrorMessage(new RABError(`Cannot remove adapter bundle '${id}'`, err));
  }
  vscode.commands.executeCommand('orab.explorer.bundle.refresh');
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("orab.bundle.delete", callback)
  );
}