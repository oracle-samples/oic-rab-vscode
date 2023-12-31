
/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { log } from './logger';
import * as utils from './utils';
import { Callback, Profile, ProfileYaml, ProfileManager, ProfilesYaml, loadProfileYaml } from './profile-manager';

export class SecretStorageProfileManager implements ProfileManager {

  readonly context: vscode.ExtensionContext;

  readonly secrets: vscode.SecretStorage;

  readonly secretKey: string = 'publisher-profiles';

  readonly tmpFile: string = path.resolve(os.tmpdir(), 'oic-rab-vscode/publisher-profiles.yaml');

  readonly onUpdateCallbacks: Callback[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.secrets = context.secrets;

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(evt => {
      if (evt.uri.path === this.tmpFile) {
        fs.rmSync(this.tmpFile);
        console.log('tmp file deleted.');
      }
    }));

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async document => {
      if (document.uri.path === this.tmpFile) {
        await this.secrets.store(this.secretKey, document.getText());
        vscode.window.showInformationMessage("Profiles updated.");
        this.onUpdateCallbacks.forEach(cb => { cb(document.getText()); })
        return;
      }
    }));
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
    }

    try {
      fs.mkdirSync(path.dirname(this.tmpFile), { recursive: true });
      fs.writeFileSync(this.tmpFile, content || "");
    } catch (err) {
      console.log(`Cannot create tmp file '${this.tmpFile}'`);
    }

    let uri = vscode.Uri.parse(`file:${this.tmpFile}`);
    let doc = await vscode.workspace.openTextDocument(uri);
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
      throw new Error(`No active profile`);
    }
    const profile = obj?.profiles.find((e: ProfileYaml) => e.name === name);
    if (!profile) {
      throw new Error(`profile '${name}' not found`);
    }
    log.info(`Using profile '${name}'`);
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

}

