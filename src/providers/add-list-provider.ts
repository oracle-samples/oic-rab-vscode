/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as api from '../api';
import * as utils from '../utils';
import { get as getProfileManager } from '../profile-manager-provider';

class AddListProvider implements vscode.TreeDataProvider<AddRecord> {

  private _onDidChangeTreeData: vscode.EventEmitter<AddRecord | undefined | void> = new vscode.EventEmitter<AddRecord | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<AddRecord | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AddRecord): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AddRecord): Thenable<AddRecord[]> {

    if (element) {
      return Promise.resolve([]);
    } else {
      return getProfileManager()
        .isPresent()
        .then(present => {
          if (present) {
            return this.getData();
          } else {
            return Promise.resolve([]);
          }
        });
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getData(): Promise<AddRecord[]> {
    return api.registration
      .listAdd()
      .then(res => {
        return res.data.items
          .sort((a: { adapterId: string; }, b: { adapterId: string; }) => a.adapterId > b.adapterId ? 1 : -1)
          .map((e: { adapterId: string, adapterVersion: string }) => {
            return new AddRecord(e.adapterId, e, vscode.TreeItemCollapsibleState.None);
          });
      });
  }
}

export class AddRecord extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    private readonly record: any,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = JSON.stringify(this.record, null, 2);
    this.description = this.record.adapterVersion;
  }

  getAddRecord() {
    return this.record;
  }

  contextValue = 'addRecord';
}

export function register(context: vscode.ExtensionContext) {

  const provider = new AddListProvider(utils.workspace.getWorkspaceRoot());
  vscode.window.registerTreeDataProvider('adaptersTreeView', provider);
  let disposable = vscode.commands.registerCommand('orab.explorer.add.refresh', () => provider.refresh());
  context.subscriptions.push(disposable);
}