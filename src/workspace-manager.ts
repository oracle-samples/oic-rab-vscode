
/**
 * Copyright © 2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

import JSZip, { file } from 'jszip';
import _, { extend } from 'lodash';

import Ajv from "ajv-draft-04";
import addFormats from "ajv-formats";
import * as openapiSchema from "./openapi/openapi_v3.0.json";

import { log } from './logger';
import { RABError, showErrorMessage, showInfoMessage } from './utils/ui-utils';
import { fs as fsUtils } from './utils';

/**
 * This function ensures one open workspace.
 * @returns The workspace folder if the check passes.
 * @throws if the check fails. The error message is intended for display in UI.
 */
export function ensureOpenWorkspace(): vscode.WorkspaceFolder {
  if (!vscode.workspace.workspaceFolders) {
    throw new RABError('No active workspace.');
  }
  if (vscode.workspace.workspaceFolders.length > 1) {
    throw new RABError('Found multiple workspace folders.');
  }
  return vscode.workspace.workspaceFolders[0];
}

/**
 * Ensure a workspace is open and has RAB layout.
 * 
 * @param {boolean} opts.createFolders if true, creates folders in RAB workspace structure.
 * @returns The workspace folder if the check passes.
 * @throws if the check fails. The error message is intended for display in UI.
 */
export async function ensureValidRABWorkspace(opts?: { createFolders?: boolean; }): Promise<vscode.WorkspaceFolder> {
  const ws = ensureOpenWorkspace();
  if (opts?.createFolders === true) {
    fs.ensureDirSync(path.resolve(ws.uri.fsPath, 'api'));
    fs.ensureDirSync(path.resolve(ws.uri.fsPath, 'misc'));
  }
  await new AdapterDefinitionFile(ws).validate();
  await new LogoFile(ws).validate();
  await new OpenApiFile(ws).validate();
  return ws;
}

/**
 * Ensures a workspace is open and empty.
 * 
 * @returns The workspace folder if the check passes.
 * @throws if the check fails. The error message is intended for display in UI.
 */
export async function ensureEmptyWorkspace(): Promise<vscode.WorkspaceFolder> {
  const ws = ensureOpenWorkspace();
  const files = fs.readdirSync(ws.uri.fsPath);
  if (files.length > 0) {
    throw new RABError('Workspace is not clean. Make sure it is empty before importing.');
  }
  return ws;
}

export const initWorkspace = async () => {

  let ws = ensureOpenWorkspace();

  // if (await isWorkSpaceInitialized()) {
  //   log.info(`workspace already intialized at '${ws.uri.fsPath}'`);
  //   return;
  // }

  let p = fsUtils.pathExists(path.resolve(__dirname, '../scaffold')) ? path.resolve(__dirname, '../scaffold') : path.resolve(__dirname, '../../scaffold');
  copyRecursiveNoOverride(p, path.resolve(ws.uri.fsPath));
  showInfoMessage("Workspace initialized.");
};

/**
 * Import an RAB bundle file and unzip it into current workspace.
 * 
 * @param rab The URI of the RAB bundle file.
 */
export async function importRABBundle(rab: vscode.Uri): Promise<boolean> {
  const ws = await ensureEmptyWorkspace();
  const zip = await JSZip.loadAsync(fs.readFileSync(rab.fsPath));

  for (const filename in zip.files) {
    const content = zip.files[filename];
    const dest = path.resolve(ws.uri.fsPath, filename);
    if (content.dir) {
      fs.ensureDirSync(dest);
    } else {
      fs.outputFileSync(dest, await content.async("nodebuffer"));
    }
  }

  try {
    await ensureValidRABWorkspace({ createFolders: true });
  } catch (err) {
    log.warn(`The imported RAB bundle is invalid`, err);
    return false;
  }

  return true;
}

/**
 * Creates RAB bundle file at the root of the workspace. Must have an open RAB workspace.
 * 
 * @returns The URI of the RAB bundle file.
 */
export async function exportRABBundle(): Promise<vscode.Uri> {

  await ensureValidRABWorkspace();

  log.info("Collecting files for the bundle...");
  let bundle = await createRABBundle();
  const filepath = path.resolve(getWorkspacePath(), getBundleFilename(bundle.id, bundle.version));
  fs.writeFileSync(filepath, bundle.content);
  log.info(`Bundle created (${filepath})`);
  return vscode.Uri.file(filepath);
}

/**
 * Create adapter bundle content.
 * 
 * @returns binary of the adapter bundle archive.
 */
export async function createRABBundle(): Promise<AdapterBundle> {

  await ensureValidRABWorkspace();

  return await new AdapterBundleBuilder()
    .addDefinition(path.resolve(getWorkspacePath(), 'definitions', 'main.add.json'))
    .addLogo(path.resolve(getWorkspacePath(), 'logo.svg'))
    .addOpenAPI(path.resolve(getWorkspacePath(), 'api', 'openapi.resource.json'))
    .build();
}

export function getBundleFilename(id: string, version: string) {
  return `${id.replace(":", "_")}-${version}.rab`;
}

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

export function getAddFile(fileName: string = "main", allowFallBack?: boolean): vscode.Uri | undefined {

  let root = ensureOpenWorkspace();
  if (!root) {
    return;
  }

  try {
    let files = fs.readdirSync(path.resolve(root.uri.fsPath, "definitions"));
    let fileMain = files.find(e => e === `main.add.json`);
    let file = files.find(e => e === `${fileName}.add.json`);

    if (!file) {
      if (!allowFallBack || !fileMain) {
        return;
      }
      file = fileMain;
    }

    return vscode.Uri.file(path.resolve(root.uri.fsPath, "definitions", file));

  } catch (err) {
    log.error(`Unable to find the adapter definition document.`);
  }

}

export class AdapterBundle {

  readonly id: string;

  readonly version: string;

  readonly content: Buffer;

  constructor(id: string, version: string, content: Buffer) {
    this.id = id;
    this.version = version;
    this.content = content;
  }

}

/* ========================================================================= *
 *  Internal methods                                                         *
 * ========================================================================= */

let ajv = new Ajv();
addFormats(ajv);
let validateOpenAPI = ajv.compile(openapiSchema);

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

  async build(): Promise<AdapterBundle> {
    let content = await this.zip.generateAsync({ type: "nodebuffer" })
    return new AdapterBundle(this.adapterId, this.adapterVersion, content);
  }

  private _addEntry(entry: string, buf: Buffer | undefined) {
    if (buf) {
      this.zip.file(entry, buf);
      log.info(`Added entry '${entry}'`);
    } else {
      log.info(`Skipped entry '${entry}'`);
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

abstract class AdapterBundleFile {

  readonly workspace: vscode.WorkspaceFolder;

  constructor(workspace: vscode.WorkspaceFolder) {
    this.workspace = workspace;
  }

  exist(): boolean {
    return fs.existsSync(this.absoluteFilePath);
  }

  isOpen(): boolean {
    return vscode.workspace.textDocuments.some(e => {
      return e.fileName === this.absoluteFilePath;
    });
  }

  get absoluteFilePath(): string {
    return path.resolve(this.workspace.uri.fsPath, this.filepath);
  }

  abstract get filepath(): string

  abstract validate(): Promise<boolean>

}

class AdapterDefinitionFile extends AdapterBundleFile {

  get filepath(): string {
    return "definitions/main.add.json";
  }

  async validate(): Promise<boolean> {
    let uri = vscode.Uri.file(this.absoluteFilePath);
    if (!this.exist()) {
      throw new Error(`missing ${this.filepath}.`);
    }
    if (this.isOpen()) {
      let doc = await vscode.workspace.openTextDocument(uri);
      if (doc.isDirty) {
        throw new RABError(`'${this.filepath}' has unsaved change.`);
      } else {
        return true;
      }
    } else {
      //TODO validate content
      return true;
    }
  }

}

class LogoFile extends AdapterBundleFile {

  get filepath(): string {
    return "logo.svg";
  }

  async validate(): Promise<boolean> {
    let uri = vscode.Uri.file(path.resolve(this.workspace.uri.fsPath, this.filepath));
    if (!this.exist()) {
      return true;
    }
    if (this.isOpen()) {
      let doc = await vscode.workspace.openTextDocument(uri);
      if (doc.isDirty) {
        throw new Error('Logo file has unsaved change.');
      } else {
        return true;
      }
    } else {
      //TODO validate content
      return true;
    }
  }

}

class OpenApiFile extends AdapterBundleFile {

  get filepath(): string {
    return "api/openapi.resource.json";
  }

  async validate(): Promise<boolean> {
    let uri = vscode.Uri.file(path.resolve(this.workspace.uri.fsPath, this.filepath));
    if (!this.exist()) {
      return true;
    }
    if (this.isOpen()) {
      let doc = await vscode.workspace.openTextDocument(uri);
      if (doc.isDirty) {
        throw new Error('OpenAPI document has unsaved change.');
      } else {
        return this.validateSchema();
      }
    } else {
      return this.validateSchema();
    }
  }

  /**
   * Validates the OpenAPI against its JSON schema.
   */
  private validateSchema(): boolean {
    let valid = validateOpenAPI(JSON.parse(fs.readFileSync(this.absoluteFilePath, 'utf8')));
    if (!valid) {
      log.error(`The OpenAPI document is invalid: ${log.format(validateOpenAPI.errors)}`);
      throw new Error(`The OpenAPI document is invalid. Please check logs for details.`);
    }
    return valid;
  }

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

function copyRecursiveNoOverride(src: string, dest: string) {
  fs
    .readdirSync(src)
    .filter(e => fs.statSync(path.resolve(src, e)).isDirectory())
    .forEach(e => {
      log.debug(`Ensures dir: ${e}`);
      fs.ensureDirSync(path.resolve(dest, e));
    });
  fs.copySync(src, dest, {
    overwrite: false,
    filter: e => !path.basename(e).startsWith('.')
  });
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
