/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';


import * as api from '../api';
import { log } from '../logger';
import { get as getProfileManager } from '../profile-manager-provider';
import { RABError, showErrorMessage, showInfoMessage, withProgress } from '../utils/ui-utils';
import { createRABBundle } from '../workspace-manager';

async function callback(file: vscode.Uri, context: vscode.ExtensionContext): Promise<any> {

  withProgress("Validating RAB bundle...", async () => {
    log.info(`Validating RAB bundle...`);
    let bundle;
    try {
      bundle = await createRABBundle();
    } catch (err) {
      showErrorMessage(err); return;
    }

    let profileName = (await getProfileManager().active())?.name;
    log.info(`Using the publisher profile '${profileName}'`);

    try {
      let ret;
      ret = await api.bundle.validate(bundle.content);
      showInfoMessage(`Adapter '${bundle.id}' is ${ret.valid ? 'valid' : 'invalid'}.`);
    } catch (err) {
      showErrorMessage(new RABError('Cannot validate the bundle.', err));
    }
  });
}

export function register(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand("orab.bundle.validate", callback)
  );
}