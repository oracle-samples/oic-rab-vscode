/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import { log } from '../logger';
import * as api from '../api';
import * as utils from '../utils';

function callback(file: vscode.Uri): any {

  log.showOutputChannel();
  log.info(`Checking semver on ${utils.fs.parseFilename(file)}...`);
  api.registration
    .verionCheck(file)
    .then(res => {
      if (res.data) {
        let same = res.data.advices.length === 0;
        if (same) {
          log.info(`Version check complete. Documents are identical.`);
        } else {
          log.info(`Version check complete. Recommended version change: ${res.data.minLevelUpdate}`);
        }
        log.debug(`Result: ${log.formatJSON(res.data)}`);
      }
    }).catch(err => {
      log.debug(`API call failed (code=${err?.response?.status})`);
      log.debug(err);
    });
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("orab.add.version-check", callback);
  context.subscriptions.push(disposable);
}