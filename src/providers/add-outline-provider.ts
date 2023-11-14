/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as parse from 'json-to-ast';
import * as utils from '../utils';

class AddOutlineProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!this.workspaceRoot || !utils.workspace.getAddFile()) {
      // vscode.window.showInformationMessage('no ADD found.');
      return Promise.resolve([]);
    }

    if (element) {
      if (element instanceof TriggersTreeItem) {
        return this._getData("triggers");
      } else if (element instanceof ActionsTreeItem) {
        return this._getData("actions");
      }
      else {return Promise.resolve([]);}
    } else { // root
      return Promise.resolve([new TriggersTreeItem(), new ActionsTreeItem()]);
    }
  }

  /**
   * Given the path to ADD file, read all its triggers and actions.
   */
  private _getData(type: string): Promise<vscode.TreeItem[]> {
    let data = utils.workspace.getAddContent();
    if (!data) {return Promise.resolve([]);}
    let add = JSON.parse(data);

    // parse('{"a": 1}');
    let ret = [];
    if (type === 'triggers') {
      for (let [k, v] of Object.entries(add.triggers || [])) {
        ret.push(new TriggerItemTreeItem(k, v, {
          command: 'orab.add.locate',
          title: '',
          arguments: [data, "triggers", k]
        }));
      }
    } else if (type === 'actions') {
      for (let [k, v] of Object.entries(add.actions || [])) {
        ret.push(new ActionItemTreeItem(k, v, {
          command: 'orab.add.locate',
          title: '',
          arguments: [data, "actions", k]
        }));
      }
    }
    return Promise.resolve(ret.sort((a, b) => {
      if (!a.label || !b.label) {
        return 0;
      } else if (typeof a.label === "string" && typeof b.label === "string") {
        return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
      } else {
        return (a.label as vscode.TreeItemLabel).label.toLowerCase() > (b.label as vscode.TreeItemLabel).label.toLowerCase() ? 1 : -1;
      }
    }));
  }
}

function isTreeLabel(obj: any): obj is vscode.TreeItemLabel {
  return true;
}

class TriggersTreeItem extends vscode.TreeItem {

  constructor() {
    super("Triggers", vscode.TreeItemCollapsibleState.Expanded);
    this.tooltip = "";
    this.description = "";
  }
  contextValue = 'triggers';
}

class TriggerItemTreeItem extends vscode.TreeItem {

  constructor(
    public readonly id: string,
    public readonly data: any,
    public readonly command?: vscode.Command
  ) {
    super(id, vscode.TreeItemCollapsibleState.None);
    this.description = data.displayName;
    this.tooltip = data.description;
    this.command = command;
  }
  contextValue = 'triggerItem';
}

class ActionsTreeItem extends vscode.TreeItem {

  constructor(
    public readonly command?: vscode.Command
  ) {
    super("Actions", vscode.TreeItemCollapsibleState.Expanded);
    this.tooltip = "";
    this.description = "";
  }

  contextValue = 'actions';
}

class ActionItemTreeItem extends vscode.TreeItem {

  constructor(
    public readonly id: string,
    public readonly data: any,
    public readonly command?: vscode.Command
  ) {
    super(id, vscode.TreeItemCollapsibleState.None);
    this.description = data.displayName;
    this.tooltip = data.description;
    this.command = command;
  }
  contextValue = 'actionItem';
}

export function register(context: vscode.ExtensionContext) {
  const provider = new AddOutlineProvider(utils.workspace.getWorkspaceRoot());
  vscode.window.registerTreeDataProvider('outlineTreeView', provider);
  vscode.commands.registerCommand('orab.explorer.outline.refresh', () => provider.refresh());
}