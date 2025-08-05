import * as vscode from "vscode";
import { buildAllFlavors } from "./build";

/**
 * Forces VS Code to re-read the theme files from disk and apply the current theme.
 * This is a workaround to avoid a full window reload.
 */
async function refreshTheme() {
  const workbenchConfig = vscode.workspace.getConfiguration("workbench");
  const currentTheme = workbenchConfig.get<string>("colorTheme");

  if (!currentTheme || !currentTheme.toLowerCase().includes("calmppuccin")) {
    // Doesn't do anything if it's not a Calmppuccin theme that's active.
    return;
  }

  // Determine a suitable temporary theme to avoid a harsh visual flash.
  const isLightTheme = currentTheme.toLowerCase().includes("latte");
  const temporaryTheme = isLightTheme ? "Default Light Modern" : "Default Dark Modern";

  // To force a reload, it quickly switches to a different theme and then back again.
  await workbenchConfig.update("colorTheme", temporaryTheme, vscode.ConfigurationTarget.Global);
  await workbenchConfig.update("colorTheme", currentTheme, vscode.ConfigurationTarget.Global);
}

/**
 * Main activation function for the extension.
 * This sets up a listener for configuration changes.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Calmppuccin theme is now active!");

  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration(
    async (event: vscode.ConfigurationChangeEvent) => {
      if (event.affectsConfiguration("calmppuccin.accent")) {
        try {
          const config = vscode.workspace.getConfiguration("calmppuccin");
          const accent = config.get<string>("accent", "sapphire");

          await buildAllFlavors(accent);

          vscode.window.showInformationMessage(`Calmppuccin accent color updated to ${accent}.`);
          await refreshTheme();
        } catch (error) {
          // Provides a more helpful error message with a link to report the issue.
          const openIssueAction = "Report Issue";
          const selection = await vscode.window.showErrorMessage(
            `Failed to update Calmppuccin themes. Error: ${error}`,
            openIssueAction
          );

          if (selection === openIssueAction) {
            vscode.env.openExternal(vscode.Uri.parse("https://github.com/KenanSalar/calmppuccin-vscode/issues"));
          }
          console.error(error);
        }
      }
    }
  );

  context.subscriptions.push(settingsChangeListener);
}

export function deactivate() {}
