/**
 * @file An `ExtensionContext` for activating an entry point. Its `globalState` keeps what one
 * activation stores for the next, as VS Code's does across restarts.
 */

import * as vscode from "vscode";

export function createExtensionContext(): vscode.ExtensionContext {
  return {
    subscriptions: [],
    globalState: new InMemoryMemento(),
    workspaceState: new InMemoryMemento(),
    secrets: {
      get: jest.fn(),
      store: jest.fn(),
      onDidChange: jest.fn(),
      delete: jest.fn(),
      keys: jest.fn(),
    },
    extensionUri: vscode.Uri.parse("file:///mock/extension/path"),
    extensionPath: "/mock/extension/path",
    storageUri: vscode.Uri.parse("file:///mock/storage/path"),
    storagePath: undefined,
    globalStorageUri: vscode.Uri.parse("file:///mock/global/storage/path"),
    globalStoragePath: "/mock/global/storage/path",
    logUri: vscode.Uri.parse("file:///mock/log/path"),
    logPath: "/mock/log/path",
    extensionMode: vscode.ExtensionMode.Test,
    environmentVariableCollection: {} as unknown as vscode.GlobalEnvironmentVariableCollection,
    asAbsolutePath: jest.fn((relativePath) => `/mock/extension/path/${relativePath}`),
    extension: {} as unknown as vscode.Extension<unknown>,
    languageModelAccessInformation: {
      onDidChange: jest.fn(),
      canSendRequest: jest.fn(),
    },
  };
}

class InMemoryMemento implements vscode.Memento {
  private readonly _values = new Map<string, unknown>();

  keys(): readonly string[] {
    return [...this._values.keys()];
  }

  get<T>(key: string, defaultValue?: T): T {
    return (this._values.has(key) ? this._values.get(key) : defaultValue) as T;
  }

  update(key: string, value: unknown): Thenable<void> {
    this._values.set(key, value);
    return Promise.resolve();
  }

  setKeysForSync(_keys: readonly string[]): void {}
}
