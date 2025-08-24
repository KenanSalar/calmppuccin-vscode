/**
 * @file This file is the main entry point for the Calmppuccin VS Code extension.
 * It handles the activation and deactivation of the extension, listens for configuration changes,
 * and registers commands for theme generation and customization.
 */

import * as vscode from "vscode";
import { buildAllFlavors } from "./build";
import * as C from "./src/constants";
import { SettingsPanel } from "./src/SettingsPanel";
import { ConfigurationService } from "./src/ConfigurationService"; 

/**
 * Maps Calmppuccin theme flavors to their corresponding Catppuccin Icon flavors.
 * This is used to automatically sync the icon pack with the active color theme.
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
 * Checks the user's current color theme and icon theme. If they are using
 * a Calmppuccin theme and a Catppuccin icon pack, it updates the icon pack's
 * flavor to match the color theme's flavor for a cohesive look.
 * @returns {Promise<void>}
 */
async function syncIconFlavor() {
  // Use a short timeout to ensure the workbench has finished applying the theme change before we query it.
  setTimeout(async () => {
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const currentTheme = workbenchConfig.get<string>("colorTheme", "");
    const currentIconTheme = workbenchConfig.get<string>("iconTheme");

    // Proceed only if a Catppuccin icon theme is active.
    if (!currentIconTheme || !currentIconTheme.startsWith(C.CATPPUCCIN_ICON_PACK_ID)) {
      return;
    }

    const themeParts = currentTheme.split(" ");
    if (themeParts[0]?.toLowerCase() !== "calmppuccin" || themeParts.length < 2) {
      return;
    }

    // Parse the flavor name from the theme's display name (e.g., "Calmppuccin Nitro Cold Brew" -> "nitro-cold-brew").
    const flavor = themeParts
      .slice(1)
      .join("-")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (!flavorIconMap[flavor]) {
      return;
    }

    const targetIconFlavor = flavorIconMap[flavor];
    const targetIconThemeId = `${C.CATPPUCCIN_ICON_PACK_ID}${targetIconFlavor}`;

    // Update the icon theme only if it's not already the correct one.
    if (currentIconTheme !== targetIconThemeId) {
      await workbenchConfig.update("iconTheme", targetIconThemeId, vscode.ConfigurationTarget.Global);
    }
  }, 100);
}

/**
 * This is the main activation function for the extension, called by VS Code on startup.
 * It sets up all commands, listeners, and initial state.
 * @param {vscode.ExtensionContext} context The extension context provided by VS Code, used for managing subscriptions and state.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Calmppuccin theme is now active!");

  // Register the command that regenerates theme files based on the user's current settings.
  const regenerateThemesCommand = vscode.commands.registerCommand(C.REGENERATE_COMMAND_ID, async () => {
    try {
      // Fetch all necessary settings via the centralized ConfigurationService.
      const accentValue = ConfigurationService.getAccent();
      const fontStyles = ConfigurationService.getFontStyles();
      const syntaxOverrides = ConfigurationService.getSyntaxOverrides();

      // Trigger the build process with the current settings.
      await buildAllFlavors(accentValue, fontStyles, syntaxOverrides);

      // Prompt the user to reload the window to apply the changes.
      const selection = await vscode.window.showInformationMessage(C.INFO_MESSAGE, C.RELOAD_ACTION);
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
      // Show a detailed error message and offer to open the GitHub issues page.
      const selection = await vscode.window.showErrorMessage(errorMessage, C.REPORT_ISSUE_ACTION);
      if (selection === C.REPORT_ISSUE_ACTION) {
        vscode.env.openExternal(vscode.Uri.parse(C.REPO_ISSUES_URL));
      }
    }
  });

  // Register the command that opens the customization webview UI.
  const customizeCommand = vscode.commands.registerCommand(C.CUSTOMIZE_COMMAND_ID, () => {
    SettingsPanel.createOrShow(context);
  });

  // Listen for any changes to the user's settings.
  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    // If a Calmppuccin-specific setting changed, regenerate the themes.
    if (
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`) ||
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`) ||
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_CUSTOM_ACCENT}`) ||
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_SYNTAX_OVERRIDES}`)
    ) {
      vscode.commands.executeCommand(C.REGENERATE_COMMAND_ID);
    }

    // If the user changed their color theme, sync the icons and update the webview if it's open.
    if (event.affectsConfiguration("workbench.colorTheme")) {
      syncIconFlavor();
      SettingsPanel.updateIfVisible();
    }
  });

  // Add all commands and listeners to the extension's subscriptions to ensure they are disposed of properly on deactivation.
  context.subscriptions.push(regenerateThemesCommand, settingsChangeListener, customizeCommand);

  // Restore the panel if it was open before a reload.
  if (context.globalState.get<boolean>(C.PANEL_IS_OPEN_KEY)) {
    SettingsPanel.createOrShow(context);
  }

  // Run an initial sync on activation to ensure icons are correct from the start.
  syncIconFlavor();
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() {}
