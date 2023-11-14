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
  api.registration
    .getAdd(id)
    .then(res => {
      vscode.workspace.openTextDocument({ "language": "json", "content": JSON.stringify(res?.data, null, 2) })
        .then(document => vscode.window.showTextDocument(document));
    }).catch(err => {
      log.debug(`API call failed (code=${err?.response?.status})`);
      log.debug(err.response?.data);
    });
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.add.get", callback);
  context.subscriptions.push(disposable);
}