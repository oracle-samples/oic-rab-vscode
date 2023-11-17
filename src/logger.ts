
/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';
import { SharedNs } from './webview-shared-lib';

vscode.workspace.onDidChangeConfiguration(event => {
  let affected = event.affectsConfiguration("RAB.logLevel");
  if (affected) {
    log.level = vscode.workspace.getConfiguration("RAB").get("logLevel") || 'info';
  }
});

/**
 * This logger prints console logs meant for users.
 */
class Logger {

  private outputChannel: vscode.OutputChannel;

  private _level: string = 'info';

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel("OIC Rapid Adapter Builder", "log");
    this.level = vscode.workspace.getConfiguration("RAB").get("logLevel") || 'info';
  }

  get level(): string {
    return this._level;
  }

  set level(val: string) {
    this._level = val;
    if (val === 'info') {
      this.info("Log level set to 'info'.");
    } else if (val === 'debug') {
      this.debug("Log level set to 'debug'.");
    }
  }

  error(msg: string, err?: Error | unknown): Logger {
    if (err instanceof Error) {
      msg = `${msg} cause: ${err.stack}`;
    }
    return this.log('error', msg);
  }

  warn(msg: string): Logger {
    return this.log('warn', msg);
  }

  info(msg: string): Logger {
    return this.log('info', msg);
  }

  debug(...msg: string[]): Logger {
    return this.log('debug', ...msg);
  }

  showOutputChannel() {
    this.outputChannel.show(true);
    return this;
  }

  formatJSON(val: any): string {
    return SharedNs.ADDJsonStringify(val);
  }

  private log(level: string, ...msg: string[]): Logger {
    console.log(level, msg);

    if (level === 'debug' && this.level === 'info') {return this;}
    let ts = `${new Date().toISOString()}`;
    let lvl: string;
    switch (level) {
      case 'error':
      case 'warn':
      case 'info':
      case 'debug':
        lvl = `[${level}]`;
        break;
      default:
        lvl = `[info]`;
        break;
    }

    const msgMerged = msg.join(`, `);
    this.outputChannel.appendLine(`${ts} ${lvl} ${msgMerged}`);
    return this;
  }
}

export let log = new Logger();

