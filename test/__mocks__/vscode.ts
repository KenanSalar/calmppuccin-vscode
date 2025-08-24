/**
 * @file This file provides a manual mock for the entire 'vscode' API.
 * Whenever a test file imports 'vscode', Jest will use this file instead.
 * This allows us to control the behavior of VS Code APIs in our tests
 * without needing the actual VS Code environment.
 */

/**
 * Mocks the `vscode.workspace` namespace.
 */
export const workspace = {
  getConfiguration: jest.fn(),
  onDidChangeConfiguration: jest.fn(),
};

/**
 * Mocks the `vscode.ConfigurationTarget` enum.
 * We only need to provide the values our code actually uses.
 */
export const ConfigurationTarget = {
  Global: 1,
};

/**
 * Mocks the `vscode.extensions` namespace.
 */
export const extensions = {
  getExtension: jest.fn(),
};

/**
 * Mocks the `vscode.window` namespace.
 */
export const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
};

/**
 * Mocks the `vscode.commands` namespace.
 */
export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn(),
};

/**
 * Mocks the `vscode.Uri` class and its static methods.
 */
export const Uri = {
  // The `parse` method is often used to create Uri objects from strings.
  // We simulate a simplified version that returns an object with an `fsPath`.
  parse: jest.fn((str: string) => ({ fsPath: str })),
};

/**
 * Mocks the `vscode.ExtensionMode` enum.
 */
export const ExtensionMode = {
  // We only need to mock the 'Test' mode for our test environment.
  Test: 1,
};
