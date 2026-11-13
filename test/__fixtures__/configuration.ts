/** @file A settings section for the `vscode` mock's `getConfiguration` to hand out. */

import * as vscode from "vscode";

/** A section holding `values`, where a read of any other key gets the caller's default. */
export function createConfiguration(
  values: Record<string, unknown>,
  update: vscode.WorkspaceConfiguration["update"] = () => Promise.resolve(),
): vscode.WorkspaceConfiguration {
  return {
    get: <T>(key: string, defaultValue?: T) =>
      (Object.hasOwn(values, key) ? values[key] : defaultValue) as T,
    has: (key) => Object.hasOwn(values, key),
    inspect: () => undefined,
    update,
  };
}
