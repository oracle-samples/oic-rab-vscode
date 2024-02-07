/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as vscode from 'vscode';

import * as _ from 'lodash';

import { log } from '../logger';
import * as utils from '../utils';

/**
 * All policy enums come from
 * https://bitbucket.oci.oraclecorp.com/projects/OI/repos/integration-adapters/browse/metadata-framework/cloud.add.parser/src/main/resources/schema/connection_v01.json#236
 * 
 * Supported policies come from
 * https://confluence.oraclecorp.com/confluence/display/ICS/ADD+Connection+Definition#ADDConnectionDefinition-SupportedManagedSecurityPolicies:
 */
let authSchemes = [
  "NONE",
  "BASIC_AUTH",
  // "OAUTH_INBOUND",
  // "OAUTH2.0_TOKEN_VALIDATION",
  // "MULTI_TOKEN_INBOUND",
  // "OAUTH2.0_OR_BASIC_AUTH_VALIDATION",
  // "DIGITAL_SIGNATURE",
  // "HMAC_SIGNATURE_VALIDATION",
  // "RSA_SIGNATURE_VALIDATION",
  // "JWT_VALIDATION",
  // "CUSTOM_SINGLE_TOKEN",
  "API_KEY_AUTHENTICATION",
  // "OAUTH_AUTHORIZATION_CODE_CREDENTIALS",
  // "OAUTH_CLIENT_CREDENTIALS",
  // "OAUTH_RESOURCE_OWNER_PASSWORD_CREDENTIALS",
  "OCI_SIGNATURE_VERSION1",
  // "OAUTH_ONE_TOKEN_BASED",
  "OAUTH1.0A_ONE_LEGGED_TOKEN_AUTHENTICATION",
  // "ADD_OAUTH_AUTHORIZATION_CODE_CREDENTIALS",
  "OAUTH2.0_AUTHORIZATION_CODE_CREDENTIALS",
  // "ADD_OAUTH_CLIENT_CREDENTIALS",
  "OAUTH2.0_CLIENT_CREDENTIALS",
  // "ADD_OAUTH_RESOURCE_OWNER_PASSWORD_CREDENTIALS",
  "OAUTH2.0_RESOURCE_OWNER_PASSWORD_CREDENTIALS"
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
    if (!addDoc.connection) {addDoc.connection = {};}
    if (!Array.isArray(addDoc.connection.connectionProperties)) {addDoc.connection.connectionProperties = [];}
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
async function apply(editor: vscode.TextEditor, policyId: string) {

  let template = readTemplate(policyId);
  if (!template) {
    utils.message.pop("Policy 'policyId' not supported yet.");
    return;
  }

  let addDoc = JSON.parse(editor.document.getText());
  let policyObj = Array.isArray(addDoc?.connection?.securityPolicies) ? addDoc.connection.securityPolicies.find((e: { policy: string; }) => e.policy === policyId) : undefined;
  if (policyObj) {
    let confirm = await utils.message.confirm(`${policyId} already exists. Do you want to override?`);
    if (confirm) {
      setBaseURL(addDoc, template);
      _.merge(policyObj, template.connection.securityPolicies[0]);
    }
  } else {
    setBaseURL(addDoc, template);
    if (!addDoc.connection) {addDoc.connection = {};}
    if (!Array.isArray(addDoc.connection.securityPolicies)) {addDoc.connection.securityPolicies = [];}
    addDoc.connection.securityPolicies.push(template.connection.securityPolicies[0]);
  }

  let source = editor.document.getText();
  let range = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(source.length));
  editor.edit(edit => {
    edit.replace(range, JSON.stringify(addDoc, null, 2));
  });
}

async function callback(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]): Promise<any> {

  let editor = vscode.window.activeTextEditor;
  if (!editor) {return;}

  let i = 0;
  const result = await vscode.window.showQuickPick(authSchemes.map(e => e.replace(/_/g, " ")), {
    placeHolder: 'Please select an authentication scheme...'
  });
  if (!result) {return;}
  try {
    apply(editor, result.replace(" ", "_"));
  } catch (err) {
    
   }
}

export function register(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerTextEditorCommand("orab.insertAuthenticationScheme", callback);
  context.subscriptions.push(disposable);
}