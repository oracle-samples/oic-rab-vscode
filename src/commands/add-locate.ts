/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as utils from '../utils';

import { AST, parse } from 'json-to-ast-ext';

function callback(add: string, prop1: string, prop2: string): any {
  let addFile = utils.workspace.getAddFile();
  if (addFile) {
    vscode.workspace
      .openTextDocument(addFile)
      .then(doc => {
        let ast = parse(add);
        let node = (ast as AST.ObjectNode)
          .children
          .find(e => e.key.value === prop1)
          ?.value;
        let start = (node as AST.ObjectNode).children.find(e => e.key.value === prop2)?.key.loc?.start;
        vscode.window
          .showTextDocument(doc)
          .then(editor => {
            if (!start) {return;}
            var newPosition = new vscode.Position(start.line - 1, start.column - 1);
            var newSelection = new vscode.Selection(newPosition, newPosition);
            editor.selection = newSelection;
            editor.revealRange(new vscode.Range(newPosition, newPosition), vscode.TextEditorRevealType.InCenter);
          });
      });
  }
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.add.locate", callback);
  context.subscriptions.push(disposable);
}