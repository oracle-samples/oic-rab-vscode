/**
 * Copyright © 2023, 2024 Oracle and/or its affiliates.
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
import { PostmanNs, RabAddNs, SharedNs } from './webview-shared-lib';
import { Profile } from './profile-manager';
import { RABError, showErrorMessage } from './utils/ui-utils';

export const timeout = 120;

let client: AxiosInstance;

type Token = { value: string, expiry: number };
let tokens: Map<string, Token> = new Map();

/**
 * Acquires access token from a service instance.
 */
async function acquireAccessToken(profile: Profile): Promise<{ access_token: string, expires_in: number }> {
  log.debug("Acquiring new access token");
  let { tokenUrl, clientId, clientSecret, scope } = profile.auth;
  try {
    let res = await axios.request({
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
      timeout: timeout * 1000,
    });

    log.debug("Authentication complete.");
    return res.data;
  } catch (err) {
    log.error("Authentication failed.", err);
    throw new Error("Authentication failed.");
  }
}

function createClientConfig(host: string, instance: string, token?: string): CreateAxiosDefaults {
  const config: CreateAxiosDefaults = {
    baseURL: host,
    timeout: timeout * 1000,
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

  if (!profile.isComplete()) {
    throw new Error('Profile is not complete');
  }
  let accessToken: string;

  if (!profile.auth) {
    log.debug("no auth scheme defined, no access token will be used.");
    accessToken = "";
  } else {
    let key = `${profile.host}/${profile.integrationInstance}`;
    let token = tokens.get(key);
    if (token && token.expiry - Date.now() > 120 * 1000) {
      log.debug("Using current access token...");
      accessToken = token.value;
    } else {
      let data = await acquireAccessToken(profile);
      tokens.set(key, { value: data.access_token, expiry: Date.now() + (data.expires_in * 1000) });
      accessToken = data.access_token;
    }
  }

  return axios.create(createClientConfig(profile.host, profile.integrationInstance, accessToken));
}

async function callAPI<T>(task: () => Promise<AxiosResponse<T, any>>, errorCallback = (err: any) => { }): Promise<AxiosResponse<T, any>> {
  try {
    let res = await task();
    try {
      log.debug(`Received response (status=${res.status})`);
      log.debug(`Received body: '${log.format(res.data)}'`);
    } catch (error) {
    }
    return res;
  } catch (err) {
    if (err instanceof Error) {
      log.debug(`API call failed. cause: ${err.message}`);
    }
    if (err instanceof AxiosError) {
      try {
        log.debug(`response body: '${log.format(err.response?.data)}'`);
      } catch (error) { }
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

export interface PagedResult<T> {
  items: T[]
  limit: number
  offset: number
  hasMore: boolean
  count: number
}

export interface AdapterRegistryEntity {
  adapterId: string
  adapterVersion: string
  createdBy: string
  updatedBy?: string
  createdTime: number
  updatedTime?: number
  kind: string
  state: string
}

export interface AdapterRegistrationResponse {
  success: boolean
  id: string
  version: string
  validation: {
    warnings: any[]
    errors: any[]
    valid: boolean
  }
}

export interface DefinitionValidationResponse {
  errors: ValidationMessage[]
  warnings: ValidationMessage[]
  valid: boolean
}

export interface ValidationMessage {
  ruleId: string
  message: string
  severity: string
  location: string
  suggestions: string[]
}

/**
 * Bundle API
 */
export namespace bundle {

  let resource = 'adapterBundles';

  export async function list(): Promise<PagedResult<AdapterRegistryEntity>> {

    let url = `${apiRootPath}/${resource}`;
    log.debug(`Calling '${url}'`);
    try {
      let res = await callAPI(async () => (await getClient()).get(url) as Promise<AxiosResponse<PagedResult<AdapterRegistryEntity>>>);
      return res.data;
    } catch (err) {
      throw new RABError(`Failed to call 'GET ${url}'`, err);
    }
  }

  export async function get(id: string): Promise<Buffer> {

    let url = `${apiRootPath}/${resource}/${id}`;
    log.debug(`Calling '${url}'`);

    try {
      let res = await callAPI(async () => (await getClient()).get(url, { responseType: 'arraybuffer' }) as Promise<AxiosResponse<Buffer>>);
      return res.data;
    } catch (err) {
      throw new RABError(`Failed to call 'GET ${url}'`, err);
    }
  }

  export async function exist(id: string): Promise<AdapterRegistryEntity | undefined> {

    let url = `${apiRootPath}/${resource}/${id}/exist`;
    log.debug(`Calling '${url}'`);

    try {
      let res = await callAPI(async () => (await getClient()).get(url) as Promise<AxiosResponse<AdapterRegistryEntity>>);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.status === 404) {
        return undefined;
      } else {
        throw new RABError(`Failed to call 'GET ${url}'`, err);
      }
    }
  }

  export async function create(bundle: Buffer): Promise<AdapterRegistrationResponse> {

    let url = `${apiRootPath}/${resource}`;
    log.debug(`Calling '${url}'`);

    try {
      let res = await callAPI(async () => (await getClient()).post(url, bundle, {
        params: {
          source: "private",
          isLogoEnabled: true
        },
        headers: {
          'Content-Type': 'application/zip',
        },
      }) as Promise<AxiosResponse<AdapterRegistrationResponse>>);
      log.info(`Server response: ${log.format(res.data)}`);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status !== 404) {
        log.info(`Server response: ${err.response?.data}`);
      }
      throw new RABError(`Failed to call 'POST ${url}'`, err);
    }
  }

  export async function update(id: string, bundle: Buffer): Promise<AdapterRegistrationResponse> {

    let url = `${apiRootPath}/${resource}/${id}`;
    log.debug(`Calling '${url}'`);

    try {
      let res = await callAPI(async () => (await getClient()).put(url, bundle, {
        headers: {
          'Content-Type': 'application/zip',
        },
      }) as Promise<AxiosResponse<AdapterRegistrationResponse>>);
      log.info(`Server response: ${log.format(res.data)}`);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status !== 404) {
        log.info(`Server response: ${log.format(err.response?.data)}`);
      }
      throw new RABError(`Failed to call 'PUT ${url}'`, err);
    }
  }

  /**
   * Remove adapter from SI. 
   * @param id The adapter ID to remove.
   * @returns True if successfully removed, false is the adapter is nonexistent.
   */
  export async function remove(id: string): Promise<boolean> {

    let url = `${apiRootPath}/${resource}/${id}`;
    log.debug(`Calling '${url}'`);
    try {
      await callAPI(async () => (await getClient()).delete(url));
      return true;
    } catch (err) {
      if (err instanceof AxiosError && err.status) {
        return false;
      }
      throw new RABError(`Failed to call 'DELETE ${url}'`, err);
    }
  }

}

/**
 * Definition API
 */
export namespace registration {

  const resource = 'adapterDefinitions';

  export async function validateAdd(file: vscode.Uri) {
    let url = `${apiRootPath}/${resource}/validate`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    let config = {
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      let res = await callAPI(() => client.post(url, fs.readFileSync(file.fsPath), config) as Promise<AxiosResponse<DefinitionValidationResponse>>);
      log.info(`Server response: ${log.format(res.data)}`);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status !== 404) {
        log.info(`Server response: ${log.format(err.response?.data)}`);
      }
      throw new RABError(`Failed to call 'POST ${url}'`, err);
    }
  }

  export async function verionCheck(file: vscode.Uri) {
    let add = JSON.parse(fs.readFileSync(file.fsPath, 'utf8'));
    let id = add.info.id;
    let url = `${apiRootPath}/${resource}/${id}/versionCheck`;
    log.debug(`Calling '${url}'`);
    let client = await getClient();
    let config = {
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      let res = await callAPI(() => client.post(url, fs.readFileSync(file.fsPath), config) as Promise<AxiosResponse<any>>);
      log.info(`Server response: ${log.format(res.data)}`);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status !== 404) {
        log.info(`Server response: ${log.format(err.response?.data)}`);
      }
      throw new RABError(`Failed to call 'POST ${url}'`, err);
    }
  }
}

export namespace conversion {

  const resource = 'adapterDefinitions';

  export async function postman(postmanCollection: vscode.Uri | string, postmanConfig?: SharedNs.WebviewCommandPayloadPostmanSelectRequests, add?: vscode.Uri | string) {
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

    const postmanConfigEntries: [string, any][] = [];

    // part 3
    if (postmanConfig?.items) {
      postmanConfigEntries.push(
        [
          'postman_requests',
          postmanConfig.items.map(name => {
            return {
              "name": name,
              "actionImport": true,
              "flowImport": true,
              "schemaImport": true
            };
          })
        ]
      );
    }

    if (postmanConfig?.selectedItemForTestConnection) {
      postmanConfigEntries.push(
        [
          'postman_request_as_test_connection',
          {
            name: postmanConfig.selectedItemForTestConnection
          }
        ]
      );
    }

    if (postmanConfigEntries.length) {
      log.debug("Set 'postmanConfigRequest'");
      form.append('postmanConfigRequest', JSON.stringify(Object.fromEntries(postmanConfigEntries)));
    }

    return callAPI(() => client.post(endpoint, form) as Promise<AxiosResponse<PostmanNs.Root>>, (err) => {
      showErrorMessage("❌ Conversion failed");
    });
  }

  export async function openapi(document: vscode.Uri | string): Promise<any> {
    let endpoint = `${apiRootPath}/${resource}/convert?type=openapi`;
    log.debug(`Calling '${endpoint}'`);
    let client = await getClient();
    const form = new FormData();
    // part 1
    form.append('sourceFile', document instanceof vscode.Uri ? fs.readFileSync(document.fsPath, 'utf8') : document);

    try {
      let res = await callAPI(() => client.post(endpoint, form) as Promise<AxiosResponse<any>>);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status !== 404) {
        log.info(`Server response: ${log.format(err.response?.data)}`);
      }
      throw new RABError(`Failed to call 'POST ${endpoint}'`, err);
    }
  }
}
