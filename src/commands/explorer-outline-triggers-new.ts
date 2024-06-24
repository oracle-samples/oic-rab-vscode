/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as _ from 'lodash';
import * as utils from '../utils';

import * as Handlebars from 'handlebars';

function generateUniqueId(current: string[], base: string): string {
  let ret = base;
  let index = 0;
  while (current.includes(ret)) {
    ret = `${ret}_${index}`;
  }
  return ret;
}

async function callback(): Promise<any> {
  let addFile = utils.workspace.getAddFile();
  if (addFile) {
    let doc = await vscode.workspace.openTextDocument(addFile);
    let add = JSON.parse(doc.getText());

    const triggerId = await vscode.window.showInputBox({
      placeHolder: 'Please enter an ID...',
      validateInput: (val) => {
        if (_.has(add, 'triggers') && Object.keys(add.triggers).includes(val)) {
          return 'already exists.';
        } else {
          return null;
        }
      }
    });
    if (triggerId) {
      const template = Handlebars.compile(utils.ext.readTextFile('templates/trigger.template'));
      let props = {
        outputSchemaId: generateUniqueId(Object.keys(add.schemas), `${triggerId}OutputSchema`)
      };
      _.set(add, ['triggers', triggerId], _.omit(JSON.parse(template(props)), '_comment'));
      _.set(add, ['schemas', props.outputSchemaId], { "type": "object" });

      let editor = await vscode.window.showTextDocument(doc);
      let source = editor.document.getText();
      let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
      editor.edit(edit => {
        edit.replace(range, JSON.stringify(add, null, 2));
        vscode.commands.executeCommand("orab.explorer.outline.refresh");
      });
    }
  }
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.explorer.outline.triggers.new", callback);
  context.subscriptions.push(disposable);
}