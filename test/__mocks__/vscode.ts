/**
 * @file The `vscode` module Jest maps every import to. It holds only the members the code calls,
 * in the shape `@types/vscode` gives them.
 */

export const workspace = {
  getConfiguration: jest.fn(),
  onDidChangeConfiguration: jest.fn(),
};

export const ConfigurationTarget = {
  Global: 1,
};

export const extensions = {
  getExtension: jest.fn(),
};

export const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn().mockReturnValue(Promise.resolve()),
};

export const Uri = {
  parse: jest.fn((str: string) => ({ fsPath: str })),
};

export const ExtensionMode = {
  Test: 1,
};
