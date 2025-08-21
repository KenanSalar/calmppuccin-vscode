/**
 * @file This file is the main entry point for the Calmppuccin VS Code extension.
 * It handles the activation and deactivation of the extension, listens for configuration changes,
 * and registers the command to regenerate themes.
 */

import * as vscode from "vscode";
import { buildAllFlavors } from "./build";
import * as C from "./src/constants";
import { SettingsPanel } from "./src/SettingsPanel";
import { ConfigurationService } from "./src/ConfigurationService";

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
  setTimeout(async () => {
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const currentTheme = workbenchConfig.get<string>("colorTheme", "");
    const currentIconTheme = workbenchConfig.get<string>("iconTheme");

    if (!currentIconTheme || !currentIconTheme.startsWith(C.CATPPUCCIN_ICON_PACK_ID)) {
      return;
    }

    const themeParts = currentTheme.split(" ");
    if (themeParts[0]?.toLowerCase() !== "calmppuccin" || themeParts.length < 2) {
      return;
    }

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
      const accentValue = ConfigurationService.getAccent();
      const fontStyles = ConfigurationService.getFontStyles();
      const syntaxOverrides = ConfigurationService.getSyntaxOverrides();

      await buildAllFlavors(accentValue, fontStyles || {}, syntaxOverrides as any);

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
      const selection = await vscode.window.showErrorMessage(errorMessage, C.REPORT_ISSUE_ACTION);
      if (selection === C.REPORT_ISSUE_ACTION) {
        vscode.env.openExternal(vscode.Uri.parse(C.REPO_ISSUES_URL));
      }
    }
  });

  const customizeCommand = vscode.commands.registerCommand(C.CUSTOMIZE_COMMAND_ID, () => {
    SettingsPanel.createOrShow(context);
  });

  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    if (
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`) ||
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`) ||
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_CUSTOM_ACCENT}`) ||
      event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_SYNTAX_OVERRIDES}`)
    ) {
      vscode.commands.executeCommand(C.REGENERATE_COMMAND_ID);
    }

    if (event.affectsConfiguration("workbench.colorTheme")) {
      syncIconFlavor();
      // If the theme changes, we should update the webview if it's open
      SettingsPanel.updateIfVisible();
    }
  });

  context.subscriptions.push(regenerateThemesCommand, settingsChangeListener, customizeCommand);

  // Restore the panel if it was open before the reload
  if (context.globalState.get<boolean>(C.PANEL_IS_OPEN_KEY)) {
    SettingsPanel.createOrShow(context);
  }

  syncIconFlavor();
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() {}
