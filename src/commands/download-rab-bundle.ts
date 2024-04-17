/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';

import * as api from '../api';
import { log } from '../logger';
import { RABTreeItem } from '../providers/add-list-provider';
import { getBundleFilename } from '../workspace-manager';
import { RABError, showErrorMessage, withProgress } from '../utils/ui-utils';

async function callback(item: RABTreeItem) {
  
  let { adapterId, adapterVersion } = item.getData();
  let dir = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
  });

  if (!dir || !dir[0]) {
    return;
  }
  let dest = dir[0];

  withProgress("Downloading RAB Bundle...", async () => {
    let data;
    try {
      data = await api.bundle.get(adapterId);
    } catch (err) {
      showErrorMessage(new RABError(`Failed to download '${adapterId}'`, err));
      return;
    }

    try {
      let file = path.resolve(dest.fsPath, getBundleFilename(adapterId, adapterVersion));
      fs.writeFileSync(file, data);
      vscode.window.showInformationMessage(`Bundle saved as ${file}`);
    } catch (err) {
      showErrorMessage(new RABError(`Failed to save '${adapterId}'`, err));
    }
  })
}

export function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("orab.bundle.get", callback)
  );
}