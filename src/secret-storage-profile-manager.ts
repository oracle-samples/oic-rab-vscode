
/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

import { log } from './logger';
import { Callback, Profile, ProfileManager, ProfileYaml, ProfilesYaml, loadProfileYaml } from './profile-manager';
import * as utils from './utils';
import { RABError, showInfoMessage } from './utils/ui-utils';

export class SecretStorageProfileManager implements ProfileManager {

  readonly context: vscode.ExtensionContext;

  readonly secrets: vscode.SecretStorage;

  readonly secretKey: string = 'publisher-profiles';

  readonly tmpFile: string;

  readonly tmpFileUri: vscode.Uri;

  readonly onUpdateCallbacks: Callback[] = [];

  constructor(context: vscode.ExtensionContext) {

    this.context = context;
    this.secrets = context.secrets;

    this.tmpFile = path.resolve(os.tmpdir(), 'oic-rab-vscode/publisher-profiles.yaml');
    this.tmpFileUri = vscode.Uri.parse(`file:${this.tmpFile}`);

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(evt => {
      if (evt.uri.fsPath === this.tmpFileUri.fsPath) {
        this._deleteTmpFile();
      }
    }));

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async document => {

      if (document.uri.fsPath === this.tmpFileUri.fsPath) {
        log.debug(`detected file save '${document.fileName}'`);
        await this.secrets.store(this.secretKey, document.getText());
        showInfoMessage("Profiles updated.");
        await vscode.commands.executeCommand('orab.explorer.profile.refresh');
        this.onUpdateCallbacks.forEach(cb => { cb(document.getText()); });
      }
    }));
  }

  dispose(): void {
    this._deleteTmpFile();
  }

  onUpdate(callback: Callback): void {
    this.onUpdateCallbacks.push(callback);
  }

  async isPresent(): Promise<boolean> {
    try {
      await this._getYaml();
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Reads profile yaml from secret storage and show the content in an editor.
   */
  async edit(): Promise<vscode.TextEditor> {
    let content = await this.secrets.get(this.secretKey);
    if (content == undefined || content.trim() == '') {
      content = utils.ext.readTextFile(`templates/publisher-template.yaml`);
      log.debug('no content read from secret storage, using default template.');
    }

    try {
      this._deleteTmpFile();
      this._createTmpFile(content);
    } catch (err) {
      log.warn(`Cannot create tmp file '${this.tmpFile}'`);
    }

    log.debug(`opening ${this.tmpFileUri}`);
    let doc = await vscode.workspace.openTextDocument(this.tmpFileUri);
    return await vscode.window.showTextDocument(doc);
  }

  async all(): Promise<Profile[]> {
    let profilesYaml = await this._getYaml();
    return profilesYaml
      .profiles
      .map((profile) => {
        let active = profile.name === profilesYaml?.active;
        return new Profile(profile.name, profile.publisherId, profile.host, profile.integrationInstance, profile.auth, active);
      });
  }

  async active(): Promise<Profile> {
    let obj = await this._getYaml();
    const name = obj?.active;
    if (!name) {
      throw new RABError(`No active profile`);
    }
    const profile = obj?.profiles.find((e: ProfileYaml) => e.name === name);
    if (!profile) {
      throw new RABError(`profile '${name}' not found`);
    }
    log.debug(`Active profile is '${name}'`);
    log.debug(`Host: ${profile.host}`);
    log.debug(`SI  : ${profile.integrationInstance}`);
    return new Profile(profile.name, profile.publisherId, profile.host, profile.integrationInstance, profile.auth, true);
  }

  /**
   * 
   * @returns the profile yaml file.
   */
  private async _getYaml(): Promise<ProfilesYaml> {
    let content = await this.secrets.get(this.secretKey);
    if (content == undefined || content.trim() == "") {
      throw new Error('no profile yaml found');
    } else {
      return loadProfileYaml(content);
    }
  }

  private _createTmpFile(content: string): void {
    try {
      fs.mkdirSync(path.dirname(this.tmpFile), { recursive: true });
      fs.writeFileSync(this.tmpFile, content);
    } catch (err) {
      log.warn(`Cannot create tmp file '${this.tmpFile}'`);
    }
  }
  private _deleteTmpFile(): void {
    try {
      fs.rmSync(this.tmpFile);
      log.debug(`deleted tmp file ${this.tmpFile}`);
    } catch (err) {
      log.warn(`cannot delete ${this.tmpFile}`);
    }
  }
}

