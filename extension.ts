/**
 * @file This file is the main entry point for the Calmppuccin VS Code extension.
 * It handles the activation and deactivation of the extension, listens for configuration changes,
 * and registers the command to regenerate themes.
 */

import * as vscode from "vscode";
import { buildAllFlavors } from "./build";
import * as C from "./src/constants";

/**
 * Maps Calmppuccin theme flavors to their corresponding Catppuccin Icon flavors.
 */
const flavorIconMap: Record<string, string> = {
  latte: "latte",
  frappe: "frappe",
  macchiato: "macchiato",
  mocha: "mocha",
  "nitro-cold-brew": "mocha",
  oledppuccin: "mocha",
};

/**
 * Checks the current color theme and syncs the Catppuccin icon flavor if the user
 * has a Catppuccin icon theme active.
 */
async function syncIconFlavor() {
  // Use a minimal timeout to defer the execution to the next event loop tick.
  // This ensures that when the function runs, VS Code's configuration has been fully updated.
  setTimeout(async () => {
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const currentTheme = workbenchConfig.get<string>("colorTheme", "");
    const currentIconTheme = workbenchConfig.get<string>("iconTheme");

    // 1. Only proceed if the user is currently using a Catppuccin icon theme.
    // This prevents overriding their choice if they prefer other icons (e.g., Material Icons).
    if (!currentIconTheme || !currentIconTheme.startsWith(C.CATPPUCCIN_ICON_PACK_ID)) {
      return;
    }

    // 2. Only proceed if the active color theme is a Calmppuccin theme.
    const themeParts = currentTheme.split(" ");
    if (themeParts[0]?.toLowerCase() !== "calmppuccin" || themeParts.length < 2) {
      return;
    }

    // 3. Robustly parse the flavor name from the theme string.
    // This handles multi-word names (e.g., "Nitro Cold Brew") and special characters (e.g., "Frappé").
    const flavor = themeParts
      .slice(1) // Get all parts after "Calmppuccin"
      .join("-") // Join them with a hyphen
      .toLowerCase() // Convert to lowercase
      .normalize("NFD") // Normalize to separate accents from letters
      .replace(/[\u0300-\u036f]/g, ""); // Remove the accent characters

    if (!flavorIconMap[flavor]) {
      return;
    }

    // 4. Construct the target icon theme ID and update only if it's different.
    const targetIconFlavor = flavorIconMap[flavor];
    const targetIconThemeId = `${C.CATPPUCCIN_ICON_PACK_ID}${targetIconFlavor}`;

    if (currentIconTheme !== targetIconThemeId) {
      await workbenchConfig.update("iconTheme", targetIconThemeId, vscode.ConfigurationTarget.Global);
    }
  }, 100);
}

/**
 * This method is called when the extension is activated.
 * @param context The extension context provided by VS Code.
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
      console.error(error);
      let errorMessage = C.ERROR_MESSAGE_PREFIX;
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += String(error);
      }
      const selection = await vscode.window.showErrorMessage(errorMessage, C.REPORT_ISSUE_ACTION);
      if (selection === C.REPORT_ISSUE_ACTION) {
        vscode.env.openExternal(vscode.Uri.parse(C.REPO_ISSUES_URL));
      }
    }
  });

  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    if (event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`)) {
      vscode.commands.executeCommand(C.REGENERATE_COMMAND_ID);
    }
    if (event.affectsConfiguration("workbench.colorTheme")) {
      syncIconFlavor();
    }
  });

  context.subscriptions.push(regenerateThemesCommand, settingsChangeListener);

  // Run the icon sync on extension activation to ensure consistency.
  syncIconFlavor();
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() {}
