/**
 * Copyright © 2022-2024, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import _ from 'lodash';

import { log } from '../logger';
import * as utils from '../utils';
import { showConfirmMessage } from '../utils/ui-utils';

/**
 * All policy enums come from
 * https://bitbucket.oci.oraclecorp.com/projects/OI/repos/integration-adapters/browse/metadata-framework/cloud.add.parser/src/main/resources/schema/connection_v01.json#236
 * 
 * Supported policies come from
 * https://confluence.oraclecorp.com/confluence/display/ICS/ADD+Connection+Definition#ADDConnectionDefinition-SupportedManagedSecurityPolicies:
 */

let actionSchemes = [
  "NONE",
  "BASIC_AUTH",
  "API_KEY_AUTHENTICATION",
  "OCI_SIGNATURE_VERSION1",
  "OAUTH_ONE_TOKEN_BASED",
  "OAUTH_AUTHORIZATION_CODE_CREDENTIALS",
  "OAUTH_CLIENT_CREDENTIALS",
  "OAUTH_RESOURCE_OWNER_PASSWORD_CREDENTIALS"
];

let triggerSchemes = [
  "BASIC_AUTH_VALIDATION",
  "OAUTH2.0_TOKEN_VALIDATION",
  "HMAC_SIGNATURE_VALIDATION",
  "RSA_SIGNATURE_VALIDATION",
  "JWT_VALIDATION",
];

/**
 * Set baseURL as connection property in ADD document.
 * @param addDoc ADD document object.
 * @param template ADD template to merge.
 */
function setBaseURL(addDoc: any, template: any) {
  if (Array.isArray(addDoc?.connection?.connectionProperties)) {
    if (!addDoc.connection.connectionProperties.find((e: { name: string; }) => e.name === 'baseURL')) {
      addDoc.connection.connectionProperties.push(template.connection.connectionProperties[0]);
    }
  } else {
    if (!addDoc.connection) { addDoc.connection = {}; }
    if (!Array.isArray(addDoc.connection.connectionProperties)) { addDoc.connection.connectionProperties = []; }
    addDoc.connection.connectionProperties.push(template.connection.connectionProperties[0]);
  }
}

function readTemplate(policyId: string): any | undefined {
  let template: any;
  try {
    template = utils.ext.readJson(`templates/auth/${policyId}.json`);
    return _.omit(template, '_comment');
  } catch (err) {
    log.error(`cannot find 'templates/auth/${policyId}.json'`, err);
    return undefined;
  }
}

/**
 * Read template by `policyId` and apply to the ADD document in editor.
 * @param editor 
 * @param policyId 
 * @returns 
 */
async function applyToEditor(editor: vscode.TextEditor, policyId: string, scope: string, template: any) {

  let addDoc = JSON.parse(editor.document.getText());
  let policyObj = Array.isArray(addDoc?.connection?.securityPolicies) ? addDoc.connection.securityPolicies.find((e: { policy: string; }) => e.policy === policyId) : undefined;
  if (policyObj) {
    let confirm = await showConfirmMessage(`${policyId} already exists. Do you want to override?`);
    if (confirm) {
      if (scope === 'ACTION') {
        setBaseURL(addDoc, template);
      }
      _.merge(policyObj, template.connection.securityPolicies[0]);
    }
  } else {
    if (scope === 'ACTION') {
      setBaseURL(addDoc, template);
    }
    if (!addDoc.connection) { addDoc.connection = {}; }
    if (!Array.isArray(addDoc.connection.securityPolicies)) { addDoc.connection.securityPolicies = []; }
    addDoc.connection.securityPolicies.push(template.connection.securityPolicies[0]);
  }

  let source = editor.document.getText();
  let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
  editor.edit(edit => {
    edit.replace(range, JSON.stringify(addDoc, null, 2));
  });
}

class SchemeItem implements vscode.QuickPickItem {

  label: string;

  description?: string | undefined;

  policyId: string;

  scope: string;

  template: string;

  constructor(label: string, description: string, policyId: string, scope: string, template: string) {
    this.label = label;
    this.description = description;
    this.policyId = policyId;
    this.scope = scope;
    this.template = template;
  }
}

class SeparatorItem implements vscode.QuickPickItem {

  label: string;

  kind?: vscode.QuickPickItemKind;

  constructor(label: string) {
    this.label = label;
    this.kind = vscode.QuickPickItemKind.Separator;
  }
}

function createSchemeItem(policyId: string): SchemeItem | undefined {
  let template = readTemplate(policyId);
  if (!template) {
    return;
  }
  let policy = template.connection.securityPolicies[0];
  return new SchemeItem(policy.displayName, policy.description, policyId, policy.scope, template);
}

async function callback(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]): Promise<any> {

  let editor = vscode.window.activeTextEditor;
  if (!editor) { return; }

  let items: (SchemeItem | SeparatorItem)[] = [];
  items.push(new SeparatorItem("Actions"));
  items = items.concat(actionSchemes.map(e => createSchemeItem(e)).filter(e => e instanceof SchemeItem) as SchemeItem[]);
  items.push(new SeparatorItem("Triggers"));
  items = items.concat(triggerSchemes.map(e => createSchemeItem(e)).filter(e => e instanceof SchemeItem) as SchemeItem[]);

  const result = await vscode.window.showQuickPick<SchemeItem | SeparatorItem>(items, {
    placeHolder: 'Please select an authentication scheme...'
  });
  if (!result) { return; }
  try {
    if (result instanceof SchemeItem) {
      applyToEditor(editor, result.policyId, result.scope, result.template);
    }
  } catch (err) {
  }
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand("orab.insertAuthenticationScheme", callback);
  context.subscriptions.push(disposable);
}