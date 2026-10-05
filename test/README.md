# Extension host smoke test

Run `npm ci`, then `npm run test:extension`. The runner downloads VS Code using
`@vscode/test-electron` by default. To use an existing installation, set
`VSCODE_EXECUTABLE_PATH` to its executable.

The test uses temporary workspace, user data, and extension directories. It
activates the extension, initializes a workspace, checks valid OpenAPI bundle
contents, checks rejection of invalid OpenAPI, and checks recovery after
correcting the document. It needs a graphical desktop and does not contact an
OIC instance. Temporary test data is removed when the host exits.
