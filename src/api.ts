/**
 * Copyright © 2023, Oracle and/or its affiliates.
 * This software is licensed to you under the Universal Permissive License (UPL) 1.0 as shown at https://oss.oracle.com/licenses/upl.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import axios, { AxiosError, AxiosInstance, AxiosResponse, CreateAxiosDefaults } from 'axios';

import FormData = require('form-data');

import { log } from './logger';
import { get as getProfileManager } from './profile-manager-provider';
import * as utils from './utils';
import { AddCreateUpdateResponseNs, AddListReponseNs, AddValidateReponseNs } from './utils';
import { PostmanNs, RabAddNs } from './webview-shared-lib';


let client: AxiosInstance;

type Token = { value: string, expiry: number };
let tokens: Map<string, Token> = new Map();

function createClientConfig(host: string, instance: string, token?: string): CreateAxiosDefaults {
  const config: CreateAxiosDefaults = {
    baseURL: host,
    timeout: utils.defaultApiCallTimeoutInSeconds * 1000,
    params: {
      integrationInstance: instance
    },
    proxy: false
  };
  if (token) {
    config.headers = { "Authorization": `Bearer ${token}` };
  }
  return config;
}

async function getClient(): Promise<AxiosInstance> {

  let profile = await getProfileManager().active();
  let promise: Promise<string>;
  if (!profile.isReady()) {
    return Promise.reject(new Error('Profile not ready'));
  }
  if (!profile.auth) {
    log.debug("no auth scheme defined, no access token will be used.");
    promise = Promise.resolve("");
  } else {
    let key = profile.host + "/" + profile.integrationInstance;
    let token = tokens.get(key);
    if (token && token.expiry - Date.now() > 120 * 1000) {
      log.debug("Using current access token...");
      promise = Promise.resolve(token.value);
    } else {
      log.debug("Getting new access token...");
      let { tokenUrl, clientId, clientSecret, scope } = profile.auth;
      promise = axios.request({
        url: tokenUrl,
        method: "post",
        auth: {
          username: clientId,
          password: clientSecret
        },
        data: {
          "grant_type": "client_credentials",
          "scope": scope
        },
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded'
        },
        proxy: false,
        timeout: utils.defaultApiCallTimeoutInSeconds * 1000,
      }).then(res => {
        log.debug("Authentication complete.");
        tokens.set(key, { value: res.data.access_token, expiry: Date.now() + (res.data.expires_in * 1000) });
        return res.data.access_token;
      }).catch(err => {
        utils.message.showErrorWithLog("❌ Authentication failed.");
        throw err;
      });
    }
  }
  return promise
    .then(token => {
      let config = createClientConfig(profile.host, profile.integrationInstance, token);
      client = axios.create(config);
      return client;
    });
}

async function callAPI<T>(task: () => Promise<AxiosResponse<T, any>>, errorCallback = (err: any) => { }):
  Promise<AxiosResponse<T, any>> {
  try {
    let res = await task();
    try {
      log.debug(`Received response (status=${res.status})`);
      log.debug(`Received body: '${log.formatJSON(res.data)}'`);
    } catch (error) {

    }
    return res;
  } catch (err) {
    log.error(`API call failed. ${err}`);
    console.error(err);
    if (err instanceof AxiosError) {
      try {
        log.error(`response body: '${log.formatJSON(err.response?.data)}'`);
      } catch (error) {

      }
    }
    errorCallback(err);
    throw err;
  }
}

export function deleteTokens() {
  log.debug('All tokens have been deleted.');
  tokens.clear();
}

let apiRootPath = '/ic/api/adapters/v1';

/**
 * Handles the callout to OIC registration API
 */
export namespace registration {

  export async function listAdd() {
    let url = `${apiRootPath}/adapterDefinitions`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    return callAPI(() => client.get(url) as Promise<AxiosResponse<AddListReponseNs.Root>>);
  }

  export async function getAdd(id: string) {
    let url = `${apiRootPath}/adapterDefinitions/${id}`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    return callAPI(() => client.get(url) as Promise<AxiosResponse<RabAddNs.Root>>);
  }

  export async function createAdd(file: vscode.Uri) {
    let url = `${apiRootPath}/adapterDefinitions`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    const form = new FormData();
    form.append('document', fs.readFileSync(file.fsPath, 'utf8'));

    let name = fs.readdirSync(path.resolve(utils.fs.getWorkspaceRoot() || "", 'resources')).find(e => e.endsWith('.svg'));
    if (name) {
      let logoFile = path.resolve(utils.fs.getWorkspaceRoot() || "", 'resources', name);
      log.info(`Included icon 'resources/${name}'`);
      form.append('icon', fs.createReadStream(logoFile));
    }

    return callAPI(() => client.post(`${apiRootPath}/adapterDefinitions`, form) as Promise<AxiosResponse<AddCreateUpdateResponseNs.Root>>);
  }

  export async function updateAdd(id: string, file: vscode.Uri) {
    let url = `${apiRootPath}/adapterDefinitions/${id}`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    const form = new FormData();
    form.append('document', fs.readFileSync(file.fsPath, 'utf8'));

    let name = fs.readdirSync(path.resolve(utils.fs.getWorkspaceRoot() || "", 'resources')).find(e => e.endsWith('.svg'));
    if (name) {
      let logoFile = path.resolve(utils.fs.getWorkspaceRoot() || "", 'resources', name);
      log.info(`Included icon 'resources/${name}'`);
      form.append('icon', fs.createReadStream(logoFile));
    }
    return callAPI(() => client.put(url, form) as Promise<AxiosResponse<AddCreateUpdateResponseNs.Root>>);
  }

  export async function deleteAdd(id: string) {
    let url = `${apiRootPath}/adapterDefinitions/${id}`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    return callAPI(() => client.delete(url));
  }

  export async function validateAdd(file: vscode.Uri) {
    let url = `${apiRootPath}/adapterDefinitions/validate`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    let config = {
      headers: { 'Content-Type': 'application/json' }
    };

    return callAPI(() => client.post(url, fs.readFileSync(file.fsPath), config) as Promise<AxiosResponse<AddValidateReponseNs.Root>>);
  }

  export async function verionCheck(file: vscode.Uri) {
    let add = JSON.parse(fs.readFileSync(file.fsPath, 'utf8'));
    let id = add.info.id;
    let url = `${apiRootPath}/adapterDefinitions/${id}/versionCheck`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    let config = {
      headers: { 'Content-Type': 'application/json' }
    };

    return callAPI(() => client.post(url, fs.readFileSync(file.fsPath), config));
  }
}

export namespace conversion {

  export async function postman(postmanCollection: vscode.Uri | string, add?: vscode.Uri | string, requests?: string[]) {
    let endpoint = `${apiRootPath}/adapterDefinitions/convert?type=postman`;
    log.debug(`Calling '${endpoint}'`);
    let client = await getClient();
    const form = new FormData();
    // part 1
    form.append('sourceFile', postmanCollection instanceof vscode.Uri ? fs.readFileSync(postmanCollection.fsPath, 'utf8') : postmanCollection);
    log.debug("Set 'sourceFile'");
    // part 2
    if (add) {
      form.append('targetADD', add instanceof vscode.Uri ? fs.readFileSync(add.fsPath, 'utf8') : add);
      log.debug("Set 'targetADD'");
    }
    // part 3
    if (requests) {
      form.append('postmanConfigRequest', JSON.stringify({
        "postman_requests": requests.map(name => {
          return {
            "name": name,
            "actionImport": true,
            "flowImport": true,
            "schemaImport": true
          };
        })
      }));
      log.debug("Set 'postmanConfigRequest'");
    }

    return callAPI(() => client.post(endpoint, form) as Promise<AxiosResponse<PostmanNs.Root>>, (err) => {
      utils.message.showErrorWithLog(`❌ Convert failed: Failed to call API at ${endpoint}`);
    });
  }
}
