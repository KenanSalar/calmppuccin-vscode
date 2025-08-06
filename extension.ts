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

  // Dynamically get all configuration keys from package.json
  const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;
  const configKeys = Object.keys(extensionConfig?.contributes?.configuration?.properties ?? {});

  const regenerateThemesCommand = vscode.commands.registerCommand(C.REGENERATE_COMMAND_ID, async () => {
    try {
      const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
      const accent = config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);

      // Dynamically build the settings object from the user's configuration
      const editorSettings: { [key: string]: any } = {};
      for (const key of configKeys) {
        const settingName = key.split(".")[1];
        // This is the fix: only add the setting if it's not the accent color.
        if (settingName && settingName !== C.CONFIG_KEY_ACCENT) {
          editorSettings[settingName] = config.get(settingName);
        }
      }

      // Pass the dynamically created settings object to the build function
      await buildAllFlavors(accent, editorSettings);

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

  // The listener now checks against the dynamic list of settings.
  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    const affectsOurSettings = configKeys.some((key) => event.affectsConfiguration(key));

    if (affectsOurSettings) {
      vscode.commands.executeCommand(C.REGENERATE_COMMAND_ID);
    }
    if (event.affectsConfiguration("workbench.colorTheme")) {
      syncIconFlavor();
    }
  });

  context.subscriptions.push(regenerateThemesCommand, settingsChangeListener);
  syncIconFlavor();
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() {}
