/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as api from '../api';
import { get as getProfileManager } from '../profile-manager-provider';
import { RABError, showErrorMessage } from '../utils/ui-utils';

/**
 * TreeDataProvider for RAB adapters explorer.
 * It reads data from the configured service instance.
 */
class RABAdapterListProvider implements vscode.TreeDataProvider<RABTreeItem> {

  private _onDidChangeTreeData: vscode.EventEmitter<RABTreeItem | undefined | void> = new vscode.EventEmitter<RABTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<RABTreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor() {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: RABTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: RABTreeItem): Promise<RABTreeItem[]> {

    if (element) {
      return [];
    }

    if (await getProfileManager().isPresent()) {
      return this.getData();
    } else {
      return [];
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private async getData(): Promise<RABTreeItem[]> {
    let data;
    try {
      data = await api.bundle.list();
    } catch (err) {
      showErrorMessage(new RABError("Cannot list registered adapters.", err));
      return [];
    }
    return data.items
      .sort((a: { adapterId: string; }, b: { adapterId: string; }) => a.adapterId > b.adapterId ? 1 : -1)
      .map((e: { adapterId: string, adapterVersion: string }) => {
        return new RABTreeItem(e.adapterId, e, vscode.TreeItemCollapsibleState.None);
      });
  }
}

export class RABTreeItem extends vscode.TreeItem {

  constructor(
    public readonly label: string,
    private readonly data: { adapterId: string, adapterVersion: string },
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.description = this.data.adapterVersion;
    this.tooltip = JSON.stringify(this.data, null, 2);
  }

  getData() {
    return this.data;
  }

  // this is identifier for contribution point.
  contextValue = 'bundle';
}

export function register(context: vscode.ExtensionContext) {

  const provider = new RABAdapterListProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('adaptersTreeView', provider),
    vscode.commands.registerCommand('orab.explorer.bundle.refresh', () => provider.refresh())
  );
}