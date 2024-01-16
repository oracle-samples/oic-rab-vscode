/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { log } from '../logger';
import * as api from '../api';
import * as utils from '../utils';
import * as _ from 'lodash';
import * as parse from 'json-to-ast';

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

    const actionId = await vscode.window.showInputBox({
      placeHolder: 'Please enter an action ID...',
      validateInput: (val) => {
        if (_.has(add, 'actions') && Object.keys(add.actions).includes(val)) {
          return 'already exists.';
        } else {
          return null;
        }
      }
    });
    if (actionId) {
      const template = Handlebars.compile(utils.ext.readTextFile('templates/action.template'));
      let props = {
        flowId: generateUniqueId(Object.keys(add.flows), `${actionId}Flow`),
        inputSchemaId: generateUniqueId(Object.keys(add.schemas), `${actionId}InputSchema`),
        outputSchemaId: generateUniqueId(Object.keys(add.schemas), `${actionId}OutputSchema`)
      };

      _.set(add, ['actions', actionId], _.omit(JSON.parse(template(props)), '_comment'));
      _.set(add, ['schemas', props.inputSchemaId], { "type": "object" });
      _.set(add, ['schemas'], props.outputSchemaId), { "type": "object" };
      _.set(add, ['flows', props.flowId], _.omit(JSON.parse(Handlebars.compile(utils.ext.readTextFile('templates/flow.template'))(props)), '_comment'));

      let editor = await vscode.window.showTextDocument(doc);
      let source = editor.document.getText();
      let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
      let ret = await editor.edit(edit => {
        edit.replace(range, JSON.stringify(add, null, 2));
      });
      if (ret) {
        setTimeout(() => {
          vscode.commands.executeCommand('orab.explorer.outline.refresh');
        }, 1000);
      }
    }
  }
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.explorer.outline.actions.new", callback);
  context.subscriptions.push(disposable);
}