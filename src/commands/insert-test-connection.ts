/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as _ from 'lodash';

import * as utils from '../utils';

function callback(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]): any {

  vscode.window
    .showInformationMessage("This command will override 'testConnection' flow. Do you want to continue?", "Yes", "No")
    .then(answer => {
      if (answer === "Yes") {
        let editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        let current = JSON.parse(editor.document.getText());
        let template = _.omit(utils.ext.readJson('templates/test-connection.json'), '_comment');
        let ret = _.merge(current, template);
        let source = editor.document.getText();
        let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
        editor.edit(edit => {
          edit.replace(range, JSON.stringify(ret, null, 2));
        });
      }
    });
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand("orab.insertTestConnection", callback);
  context.subscriptions.push(disposable);
}