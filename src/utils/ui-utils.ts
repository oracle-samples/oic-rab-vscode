import * as vscode from 'vscode';
import * as _ from 'lodash';

import { log } from '../logger';

/**
 * An error which can chain to its cause.
 * The full chain will be pretty printed when the error is logged in the extension's interal log channel.
 */
export class RABError extends Error {

  private _cause: unknown | undefined;

  constructor(message: string, cause?: unknown) {
    super(message);
    Object.setPrototypeOf(this, RABError.prototype);
    if (cause) {
      this._cause = cause;
    }
  }

  get cause() {
    return this._cause;
  }

  get text() {
    let msg = this.message;
    if (this.cause) {
      msg += `cause: ${this.cause}`;
    }
    return msg;
  }
}

export type ConfirmOptions = {
  yesText?: string
  noText?: string;
  useNotification?: boolean;
};

export async function showConfirmMessage(msg: string | (() => string), opts?: ConfirmOptions): Promise<boolean> {
  let val = _.isFunction(msg) ? msg() : msg;
  let yesText = opts?.yesText || "Yes";
  let noText = opts?.noText || "No";
  let modal = opts?.useNotification === false || false;

  let answer;
  if (noText) {
    answer = await vscode.window.showInformationMessage(val, { modal: modal }, yesText, noText);
  } else {
    answer = await vscode.window.showInformationMessage(val, { modal: modal }, yesText);
  }
  return answer === yesText;
}

export function showModal(msg: string) {
  vscode.window.showInformationMessage(msg, { modal: true });
  log.showOutputChannel();
  log.info(msg);
}

/**
 * Show an info notification.
 */
export function showInfoMessage(msg: string) {
  log.showOutputChannel();
  log.info(msg);
  return vscode.window.showInformationMessage(msg);
}

/**
 * Show an info notification.
 */
export function showWarningMessage(msg: string) {
  log.showOutputChannel();
  log.warn(msg);
  return vscode.window.showWarningMessage(msg);
}

/**
 * Show an error notification.
 */
export function showErrorMessage(err: RABError | Error | string | unknown) {
  let msg: string | undefined = undefined;
  let cause: string | undefined = undefined;
  if (err instanceof RABError) {
    msg = err.message;
    cause = printCause(err.cause);
  } else if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === 'string') {
    msg = err;
  } else {
    msg = "unknown error";
  }
  // if (msg) {
  log.showOutputChannel();
  log.error(`${msg} ${cause ? ('cause:\n' + cause) : ''}`);
  return vscode.window.showErrorMessage(msg);
  // }
}

/**
 * Executes a task with UI progress bar indicator.
 * 
 * @param title The title of the progress bar.
 * @param task The task to be executed.
 * @returns the result of the task.
 */
export function withProgress<T>(title: string, task: () => Promise<T>) {

  return vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: title,
    cancellable: false
  }, async (progress, token) => {
    return await task();
  });
}

/* ========================================================================= *
 *  Internal methods                                                         *
 * ========================================================================= */

function printCause(err: RABError | Error | string | undefined | unknown): string {
  let msg: string = "";
  if (err instanceof RABError) {
    msg = `${err.message}\n${printCause(err.cause)}`;
  } else if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === 'string') {
    msg = err;
  } else if (err === undefined) {
    return '';
  } else {
    msg = "unknown error";
  }
  return `=> ${msg}`;
}