
/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as api from '../api';
import { log } from '../logger';
import { AddRecord } from '../providers/add-list-provider';


function callback(item: AddRecord): any {

  let id = item.getAddRecord().adapterId;
  log.info(`Deleting '${id}'...`);
  api.registration
    .deleteAdd(id)
    .then(res => {
      log.info(`Adapter definition document '${id}' deleted.`);
      vscode.commands.executeCommand('orab.explorer.add.refresh');
    }).catch(err => {
      log.debug(`API call failed (code=${err?.response?.status})`);
      log.debug(`response: ${log.formatJSON(err.response?.data)}`);
      log.error(`Cannot delete adapter definition document '${id}'. Reason: ${err.response.data?.error.message}`);
    });
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.add.delete", callback);
  context.subscriptions.push(disposable);
}