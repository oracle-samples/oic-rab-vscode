import * as vscode from 'vscode';
import * as fs from 'fs';
import * as _ from 'lodash';

import { log } from '../logger';

/**
 * Check if the give file is valid OpenAPI document.
 * 
 * @param file URI to the file.
 * @throws if the check fails. The error message is intended to be surfaced to UI.
 */
export function ensureOpenApiDocument(file: vscode.Uri) {

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(file.fsPath, 'utf8'));
  } catch (err) {
    log.error(`Cannot parse ${file.fsPath}`, err);
    throw new Error("The file is not valid JSON document.");
  }

  let version = _.get(doc, "openapi");
  if (!version || !/^3\.\d+\.\d+/.test(version)) {
    throw new Error("The file is not valid OpenAPI document.");
  }
}