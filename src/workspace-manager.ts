
/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import JSZip from 'jszip';
import _ from 'lodash';

import { log } from './logger';

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

/**
 * 
 * @returns The absolute file system path to the workspace root.
 * @throws if no open workspace.
 */
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
    const entry = "definitions/main.add.json";
    let buf = this._readFile(file);
    if (!buf) {
      throw new Error(`Cannot read file '${file}'`);
    }

    try {
      const def = JSON.parse(buf.toString('utf-8'));
      //TODO validate against the schema.

      this.adapterId = _.get(def, ['info', 'id']);
      this.adapterVersion = _.get(def, ['info', 'version']);
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

    this._addEntry(entry, buf);
    this.containsDefinition = true;
    return this;
  }

  addLogo(file: string) {
    const entry = 'logo.svg';
    let buf = this._readFile(file);
    this._addEntry(entry, buf);
    return this;
  }

  addOpenAPI(file: string) {
    const entry = 'api/openapi.resource.json';
    let buf = this._readFile(file);
    this._addEntry(entry, buf);
    return this;
  }

  async build(): Promise<vscode.Uri> {
    const content = await this.zip.generateAsync({ type: "nodebuffer" });

    let filename = `${this.adapterId.replace(":", "_")}_${this.adapterVersion}.rab`;
    const filepath = path.resolve(getWorkspacePath(), filename);
    fs.writeFileSync(filepath, content);
    log.info(`Bundle created (${filepath})`);
    return vscode.Uri.file(filepath);
  }

  private _addEntry(entry: string, buf: Buffer | undefined) {
    if (buf) {
      this.zip.file(entry, buf);
      log.debug(`Added entry '${entry}'`);
    } else {
      log.debug(`Skipped entry '${entry}'`);
    }
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
    log.info("Collecting files for the bundle...")
    return new AdapterBundleBuilder()
      .addDefinition(path.resolve(getWorkspacePath(), 'definitions', 'main.add.json'))
      .addLogo(path.resolve(getWorkspacePath(), 'logo.svg'))
      .addOpenAPI(path.resolve(getWorkspacePath(), 'api', 'openapi.resource.json'))
      .build();
  } catch (err) {
    return Promise.reject(err);
  }
}

const presetFileMap = {
  definitions: `definitions`,
  api: `api`,
  definitionsMainAddJson: `main.add.json`
};

const presetFileMapAbs = {
  definitions: presetFileMap.definitions,
  api: presetFileMap.api,
  resourcesLogo: `logo.svg`,
  definitionsMainAddJson: `${presetFileMap.definitions}/${presetFileMap.definitionsMainAddJson}`
};

export const isWorkSpaceInitialized = async () => {
  let ws: string;
  try {
    ws = getWorkspacePath();
  } catch (err) {
    ws = "";
  }
  const ingoreList = [
    presetFileMapAbs.api
  ];

  return Object.values(presetFileMapAbs)
    .filter(
      fileRelativePath => !ingoreList.includes(
        fileRelativePath
      )
    )
    .map(
      fileRelativePath => path.resolve(ws, fileRelativePath)
    )
    .every(
      (filePath) => fs.existsSync(filePath)
    )
};
