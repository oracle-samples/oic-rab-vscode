/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as _fs from 'fs';


import { firstValueFrom } from 'rxjs';
import * as _ from 'lodash';

import * as api from '../api';
import { log } from '../logger';
import { workspace, message } from '../utils';
import { ensureOpenWorkspace } from '../workspace-manager';
import { ensureOpenApiDocument } from '../utils/file-utils';

async function callback(file: vscode.Uri): Promise<any> {

  try {
    ensureOpenWorkspace();
    ensureOpenApiDocument(file);
  } catch (err) {
    if (err instanceof Error) {
      vscode.window.showErrorMessage(err.message);
    }
    return;
  }

  try {
    let response = await api.conversion.openapi(file);
    let doc = await firstValueFrom(workspace.detectOverrideAndOpenADDDocument('main.add.json', JSON.stringify(response.data, null, 2)));
    let editor = await vscode.window.showTextDocument(doc);

    let source = editor.document.getText();
    let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
    await editor.edit(edit => {
      edit.replace(range, JSON.stringify(response?.data, null, 2));
    });
    setTimeout(() => {
      vscode.commands.executeCommand('orab.explorer.outline.refresh');
    }, 500);
  } catch (err) {
    if (err instanceof Error) {
      message.showErrorWithLog(`❌ Conversion failed`);
    }
  }
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.add.convert", callback);
  context.subscriptions.push(disposable);
  return disposable;
}
