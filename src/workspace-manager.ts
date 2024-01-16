
/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import JSZip from 'jszip';

import { log } from './logger';
import * as utils from './utils';
import { get } from 'lodash';

/**
 * This function ensures one open workspace otherwise throw error with specify message intended to be shown in UI.
 */
export function ensureOpenWorkspace(): vscode.WorkspaceFolder {
  if (!vscode.workspace.workspaceFolders) {
    throw new Error('No active workspace.');
  }
  if (vscode.workspace.workspaceFolders.length > 1) {
    throw new Error('Found multiple workspace folders.');
  }
  return vscode.workspace.workspaceFolders[0];
}

function getWorkspacePath(): string {
  let workspaceFolder = ensureOpenWorkspace();
  return workspaceFolder.uri.fsPath;
}

class AdapterBundleBuilder {

  private zip: JSZip

  private containsDefinition: boolean = false

  private adapterId: string = ''

  private adapterVersion: string = ''

  constructor() {
    this.zip = new JSZip();
  }

  addDefinition(file: string) {

    log.debug(`Adding entry '${file}'`);
    let buf = this._readFile(file);
    if (!buf) {
      throw new Error(`Cannot read file '${file}'`);
    }

    try {
      const def = JSON.parse(buf.toString('utf-8'));
      //TODO validate against the schema.

      this.adapterId = def.info.id;
      this.adapterVersion = def.info.version;
      if (!this.adapterId || !this.adapterVersion) {
        throw new Error(`definition is missing 'id' and/or 'version'.`);
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Invalid adapter definition '${file}': ${err.message}`);
      } else {
        throw new Error(`Invalid parse adapter definition '${file}': ${err}`);
      }
    }

    this.zip.file("definitions/main.add.json", buf);
    this.containsDefinition = true;
    log.debug(`Added entry '${file}'`);
    return this;
  }

  addLogo(file: string) {

    let buf = this._readFile(file);
    if (buf) {
      this.zip.file("logo.svg", buf);
      log.debug(`Added entry '${file}'`);
    } else {
      log.debug(`file not found '${file}'`);
    }
    return this;
  }

  addOpenAPI(file: string) {

    let buf = this._readFile(file);
    if (buf) {
      this.zip.file("api/openapi.resource.json", buf);
      log.debug(`Added entry '${file}'`);
    } else {
      log.debug(`file not found '${file}'`);
    }
    return this;
  }

  async build(): Promise<vscode.Uri> {
    const content = await this.zip.generateAsync({ type: "nodebuffer" });
    const filepath = path.resolve(getWorkspacePath(), 'bundle.rab');
    fs.writeFileSync(filepath, content);
    return vscode.Uri.file(filepath);
  }

  private _readFile(filepath: string): Buffer | undefined {

    if (fs.existsSync(filepath)) {
      try {
        return fs.readFileSync(filepath);
      } catch (err) {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

}

/**
 * Creates RAB bundle file at the root of the workspace. Must have an open RAB workspace.
 * @returns URI of the bundle file.
 */
export async function createRabBundle(): Promise<vscode.Uri> {

  try {
    ensureOpenWorkspace();
  } catch (err) {
    return Promise.reject(err);
  }

  try {
    return new AdapterBundleBuilder()
      .addDefinition(path.resolve(getWorkspacePath(), 'definitions', 'main.add.json'))
      .addLogo(path.resolve(getWorkspacePath(), 'resources', 'logo.svg'))
      .addOpenAPI(path.resolve(getWorkspacePath(), 'api', 'openapi.resource.json'))
      .build();
  } catch (err) {
    return Promise.reject(err);
  }
}
