/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as utils from '../utils';
import { log } from '../logger';
import { get as getProfileManager } from '../profile-manager-provider';

class PublisherProfileListProvider implements vscode.TreeDataProvider<PublisherProfileRecord> {

  private _onDidChangeTreeData: vscode.EventEmitter<PublisherProfileRecord | undefined | void> = new vscode.EventEmitter<PublisherProfileRecord | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<PublisherProfileRecord | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: PublisherProfileRecord): vscode.TreeItem {
    return element;
  }

  getChildren(element?: PublisherProfileRecord): Thenable<PublisherProfileRecord[]> {
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

  private getData(): Promise<PublisherProfileRecord[]> {
    return Promise.resolve(
      getProfileManager()
        .all().then(list => {
          return list.map(e => new PublisherProfileRecord(e.name, e, vscode.TreeItemCollapsibleState.None));
        })
    );
  }

}

class PublisherProfileRecord extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    private readonly data: any,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.tooltip = "";
    this.description = this.data.active ? '(active)' : '';
  }

  getPublisherProfileRecord() {
    return this.data;
  }

  contextValue = 'PublisherProfileRecord';
}

export function register(context: vscode.ExtensionContext) {

  const provider = new PublisherProfileListProvider(utils.workspace.getWorkspaceRoot());

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('profilesTreeView', provider),
    vscode.commands.registerCommand('orab.explorer.profile.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('orab.explorer.profile.edit', () => getProfileManager().edit())
  );
  getProfileManager().onUpdate(_ => { provider.refresh(); });
}
