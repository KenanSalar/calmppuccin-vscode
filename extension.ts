/**
 * @file This file is the main entry point for the Calmppuccin VS Code extension.
 * It handles the activation and deactivation of the extension, listens for configuration changes,
 * and registers the command to regenerate themes.
 */

import * as vscode from "vscode";
import { buildAllFlavors } from "./build";
import * as C from "./src/constants";

/**
 * This method is called when the extension is activated.
 * It sets up the command for regenerating themes and a listener for configuration changes.
 * @param context The extension context provided by VS Code, used for managing subscriptions.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Calmppuccin theme is now active!");

  const regenerateThemesCommand = vscode.commands.registerCommand(C.REGENERATE_COMMAND_ID, async () => {
    try {
      const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
      const accent = config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);

      await buildAllFlavors(accent);

      const selection = await vscode.window.showInformationMessage(C.INFO_MESSAGE(accent), C.RELOAD_ACTION);

      if (selection === C.RELOAD_ACTION) {
        vscode.commands.executeCommand(C.RELOAD_COMMAND_ID);
      }
    } catch (error) {
      // Log the full error to the console for debugging.
      console.error(error);

      // Safely construct a detailed error message for the user.
      let errorMessage = C.ERROR_MESSAGE_PREFIX;
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += String(error);
      }

      // Show the error message with an action button to report the issue.
      const selection = await vscode.window.showErrorMessage(errorMessage, C.REPORT_ISSUE_ACTION);

      // If the user clicks the action, open the GitHub issues page.
      if (selection === C.REPORT_ISSUE_ACTION) {
        vscode.env.openExternal(vscode.Uri.parse(C.REPO_ISSUES_URL));
      }
    }
  });

  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    if (event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`)) {
      vscode.commands.executeCommand(C.REGENERATE_COMMAND_ID);
    }
  });

  context.subscriptions.push(regenerateThemesCommand, settingsChangeListener);
}

/**
 * This method is called when the extension is deactivated.
 * It's used for cleaning up any resources.
 */
export function deactivate() {}
