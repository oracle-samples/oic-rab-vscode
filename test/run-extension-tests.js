// Copyright (c) 2026, Oracle and/or its affiliates. Licensed under UPL 1.0.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runTests } = require('@vscode/test-electron');

async function main() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'oic-rab-host-test-'));
  const workspace = path.join(temporary, 'workspace');
  fs.mkdirSync(workspace);
  try {
    await runTests({
      vscodeExecutablePath: process.env.VSCODE_EXECUTABLE_PATH,
      extensionDevelopmentPath: path.resolve(__dirname, '..'),
      extensionTestsPath: path.join(__dirname, 'extension-host.js'),
      launchArgs: [workspace, '--disable-extensions', '--disable-workspace-trust',
        '--skip-welcome', '--skip-release-notes',
        `--user-data-dir=${path.join(temporary, 'user-data')}`,
        `--extensions-dir=${path.join(temporary, 'extensions')}`],
    });
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
