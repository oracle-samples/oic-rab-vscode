/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';



import { firstValueFrom } from 'rxjs';

import * as api from '../api';
import { workspace } from '../utils';
import { ensureOpenApiDocument } from '../utils/file-utils';
import { RABError, showErrorMessage, withProgress } from '../utils/ui-utils';
import { ensureOpenWorkspace } from '../workspace-manager';

async function callback(file: vscode.Uri): Promise<any> {

  try {
    ensureOpenWorkspace();
    ensureOpenApiDocument(file);
  } catch (err) {
    showErrorMessage(err);
    return;
  }

  try {
    let data = await withProgress('Converting OpenAPI document...', () => api.conversion.openapi(file));
    let doc = await firstValueFrom(workspace.detectOverrideAndOpenADDDocument('conversion_result.tmp.json', JSON.stringify(data, null, 2)));
    let editor = await vscode.window.showTextDocument(doc);

    let source = editor.document.getText();
    let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
    await editor.edit(edit => {
      edit.replace(range, JSON.stringify(data, null, 2));
    });
    setTimeout(() => {
      vscode.commands.executeCommand('orab.explorer.outline.refresh');
    }, 500);
  } catch (err) {
    showErrorMessage(new RABError('❌ Conversion failed', err));
  }
}

// migrate to registerOpenAPIConvertNewDocument

// export function register(context: vscode.ExtensionContext) {
//   let disposable = vscode.commands.registerCommand("orab.add.convert", callback);
//   context.subscriptions.push(disposable);
//   return disposable;
// }
