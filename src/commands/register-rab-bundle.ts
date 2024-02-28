/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as vscode from 'vscode';

import * as _ from 'lodash';

import * as api from '../api';
import { log } from '../logger';
import { createRABBundle } from '../workspace-manager';
import { get as getProfileManager } from '../profile-manager-provider';
import { RABError, showInfoMessage, showErrorMessage, withProgress } from '../utils/ui-utils';

async function callback(file: vscode.Uri, context: vscode.ExtensionContext): Promise<any> {

  withProgress("Registering RAB bundle...", async () => {
    log.info(`Registering RAB bundle...`);
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
      let metadata = await api.bundle.exist(bundle.id);

      if (metadata) { // update
        log.info(`Adapter already exists, attempt update...`);
        // check if updatable
        if (metadata.kind !== 'local') {
          showErrorMessage(new RABError("Cannot update non-local adapter.")); return;
        }
        // now update
        ret = await api.bundle.update(bundle.id, bundle.content);
        showInfoMessage(`Adapter '${bundle.id}' updated (profile: ${profileName})`);
      } else { // create
        log.info(`Adapter does not exist, creating...`);

        ret = await api.bundle.create(bundle.content);
        showInfoMessage(`Adapter '${bundle.id}' registered (profile: ${profileName})`);
      }
      vscode.commands.executeCommand('orab.explorer.bundle.refresh');
    } catch (err) {
      showErrorMessage(new RABError('Cannot register adapter.', err));
    }
  });
}

export function register(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand("orab.bundle.register", callback)
  );
}