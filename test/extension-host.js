// Copyright (c) 2026, Oracle and/or its affiliates. Licensed under UPL 1.0.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const JSZip = require('jszip');

exports.run = async function () {
  const extension = vscode.extensions.getExtension('Oracle.oic-rapid-adapter-builder');
  assert.ok(extension, 'Extension must be discovered');
  await extension.activate();
  const commands = await vscode.commands.getCommands(true);
  for (const command of ['orab.initWorkspace', 'orab.createRabBundle']) {
    assert.ok(commands.includes(command), `${command} must be registered`);
  }

  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
  await vscode.commands.executeCommand('orab.initWorkspace');
  const definitionPath = path.join(root, 'definitions', 'main.add.json');
  assert.ok(fs.existsSync(definitionPath), 'Initialize must create the scaffold');
  const definition = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
  definition.info.id = 'test:ajv';
  definition.info.version = '1.0.0';
  fs.writeFileSync(definitionPath, JSON.stringify(definition));

  const apiPath = path.join(root, 'api', 'openapi.resource.json');
  const valid = { openapi: '3.0.0', info: { title: 'AJV smoke test', version: '1.0.0' }, paths: {} };
  fs.writeFileSync(apiPath, JSON.stringify(valid));
  await vscode.commands.executeCommand('orab.createRabBundle');
  const bundlePath = path.join(root, 'test_ajv-1.0.0.rab');
  assert.ok(fs.existsSync(bundlePath), 'Valid OpenAPI must produce a bundle');
  const zip = await JSZip.loadAsync(fs.readFileSync(bundlePath));
  assert.deepStrictEqual(JSON.parse(await zip.file('api/openapi.resource.json').async('string')), valid);

  fs.unlinkSync(bundlePath);
  fs.writeFileSync(apiPath, JSON.stringify({ ...valid, openapi: 'not-an-openapi-version' }));
  await vscode.commands.executeCommand('orab.createRabBundle');
  assert.ok(!fs.existsSync(bundlePath), 'Invalid OpenAPI must prevent bundle creation');

  // Prove the rejected document did not leave the command in a broken state.
  fs.writeFileSync(apiPath, JSON.stringify(valid));
  await vscode.commands.executeCommand('orab.createRabBundle');
  assert.ok(fs.existsSync(bundlePath), 'A corrected OpenAPI document must work again');
  console.log('PASS: activation, workspace initialization, valid/invalid OpenAPI bundling, recovery');
};
