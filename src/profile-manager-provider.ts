
/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { ProfileManager } from './profile-manager';
import { SecretStorageProfileManager } from './secret-storage-profile-manager';

let manager: ProfileManager;

/**
 * Must be called on extension activation.
 */
export function init(context: vscode.ExtensionContext): void {
  manager = new SecretStorageProfileManager(context);
}

/**
 * @returns an instance of ProfileManager.
 */
export function get(): ProfileManager {
  return manager;
}