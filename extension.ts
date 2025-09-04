/**
 * @file This file is the main entry point for the Calmppuccin VS Code extension.
 * It uses a lazy-activation strategy, meaning its core logic only runs when a user
 * interacts with the theme (by selecting it or opening the customizer).
 */

import * as vscode from "vscode";
import { buildAllFlavors } from "./build";
import * as C from "./src/constants";
import { SettingsPanel } from "./src/SettingsPanel";
import { ConfigurationService } from "./src/ConfigurationService";

// This disposable will hold the main settings listener. It's defined here
// to track its state and ensure it only registers it once.
let settingsChangeListener: vscode.Disposable | undefined;

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
 * Checks the user's current color theme and icon theme to sync them.
 */
async function syncIconFlavor() {
  // Using a short timeout to ensure the workbench has finished applying the theme change.
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
 * This is the main activation function for the extension.
 * @param {vscode.ExtensionContext} context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Calmppuccin extension activated.");

  // This internal command is used by the extension itself to regenerate themes.
  const regenerateThemesCommand = vscode.commands.registerCommand(C.REGENERATE_COMMAND_ID, async () => {
    try {
      const accentValue = ConfigurationService.getAccent();
      const fontStyles = ConfigurationService.getFontStyles();
      const syntaxOverrides = ConfigurationService.getSyntaxOverrides();
      const uiOverrides = ConfigurationService.getUiOverrides();
      await buildAllFlavors(accentValue, fontStyles, syntaxOverrides, uiOverrides);
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

  // This is the command that opens the customization UI. Because it's declared in `package.json`,
  // running it will activate the extension for the first time.
  const customizeCommand = vscode.commands.registerCommand(C.CUSTOMIZE_COMMAND_ID, () => {
    SettingsPanel.createOrShow(context);
    // When the user opens the UI, we ensure all our powerful listeners are running.
    ensureListenersAreActive();
  });

  context.subscriptions.push(regenerateThemesCommand, customizeCommand);

  /**
   * Sets up the "heavy" listeners that react to settings changes and theme switches.
   * This function is designed to run only once.
   */
  function ensureListenersAreActive() {
    // If the listener has already been registered, do nothing.
    if (settingsChangeListener) {
      return;
    }

    // This is the main listener that handles automatic theme regeneration and icon syncing.
    settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      // If a Calmppuccin-specific setting changed, regenerate the themes.
      if (
        event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`) ||
        event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`) ||
        event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_CUSTOM_ACCENT}`) ||
        event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_SYNTAX_OVERRIDES}`) ||
        event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_UI_OVERRIDES}`)
      ) {
        vscode.commands.executeCommand(C.REGENERATE_COMMAND_ID);
      }

      // If the user changed their color theme, sync the icons and update the webview.
      if (event.affectsConfiguration("workbench.colorTheme")) {
        syncIconFlavor();
        SettingsPanel.updateIfVisible();
      }
    });

    context.subscriptions.push(settingsChangeListener);
    // Run an initial icon sync now that the listeners are active.
    syncIconFlavor();
  }

  // This lightweight, always-on listener acts as a "tripwire". Its only job is to
  // fully activate our extension's features if a user switches TO a Calmppuccin theme.
  const themeChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("workbench.colorTheme")) {
      const currentTheme = vscode.workspace.getConfiguration("workbench").get<string>("colorTheme", "");
      if (currentTheme.toLowerCase().startsWith("calmppuccin")) {
        ensureListenersAreActive();
      }
    }
  });

  context.subscriptions.push(themeChangeListener);

  // Restore the panel if it was open before a reload.
  if (context.globalState.get<boolean>(C.PANEL_IS_OPEN_KEY)) {
    SettingsPanel.createOrShow(context);
  }

  // Finally, check if the user is already using our theme when VS Code starts.
  // This ensures that features like icon syncing work correctly from the get-go
  // for existing users.
  const currentTheme = vscode.workspace.getConfiguration("workbench").get<string>("colorTheme", "");
  if (currentTheme.toLowerCase().startsWith("calmppuccin")) {
    ensureListenersAreActive();
  }
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() {}
