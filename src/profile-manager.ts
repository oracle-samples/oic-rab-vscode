/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { log } from './logger';

/**
 * A ProfileManager provides functionality to manage publisher profiles.
 */
export interface ProfileManager {

  /**
   * Allow user to edit the profile in an editor.
   */
  edit(): Thenable<vscode.TextEditor>

  /**
   * Return all the profiles defined.
   */
  all(): Promise<Profile[]>

  /**
   * Return the active profile selected in the profile yaml.
   */
  active(): Promise<Profile>

  /**
   * Test whether profiles yaml is present.
   */
  isPresent(): Promise<boolean>

  /**
   * Register a callback to be called when profiles yaml is updated.
   */
  onUpdate(callback: Callback): void
}

export declare type Callback = (content: string) => void;

export declare type ProfilesYaml = {
  active: string;
  profiles: ProfileYaml[];

};

export declare type ProfileYaml = {
  name: string;
  publisherId: string;
  host: string;
  integrationInstance: string;
  auth?: any;
};

export function loadProfileYaml(content: string): ProfilesYaml {
  try {
    let ret = yaml.load(content) as ProfilesYaml;
    return ret;
  } catch (err) {
    log.error(`cannot parse profiles yaml.`);
    throw new Error('cannot parse profiles yaml');
  }
}

export class Profile {

  readonly name: string;

  readonly publisherId: string;

  readonly host: string;

  readonly integrationInstance: string;

  readonly auth: any;

  readonly active: boolean = false;

  constructor(name: string, publisherId: string, host: string, integrationInstance: string, auth: any, active: boolean) {
    this.name = name;
    this.publisherId = publisherId;
    this.host = host;
    this.integrationInstance = integrationInstance;
    this.auth = auth;
    this.active = active;
  }

  /**
   * Tests if the profile is ready to use.
   */
  isReady(): boolean {
    return !!this.host && !!this.integrationInstance && this.isValidAuthentication();
  }

  private isValidAuthentication(): boolean {
    if (!this.auth) return true;
    return !!this.auth.tokenUrl && !!this.auth.clientId && !!this.auth.clientSecret && !!this.auth.scope;
  }

}