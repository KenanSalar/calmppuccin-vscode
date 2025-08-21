/**
 * @file This file manages the logic for the Calmppuccin Customization webview panel.
 * It acts as a controller, handling communication between the webview UI and the extension's configuration.
 */

import * as vscode from "vscode";
import * as C from "./constants";
import palettes, { Palettes } from "./palettes";
import { WebviewManager } from "./WebviewManager";
import { ConfigurationService, FontStyles, SyntaxOverrides } from "./ConfigurationService";

// #region Webview Message Types
/** Defines a message to update a font style setting. */
type UpdateSettingMessage = { command: "updateSetting"; key: string; value: string };
/** Defines a message to reset a font style setting to its default. */
type ResetFontStyleMessage = { command: "resetFontStyle"; key: string };
/** Defines a message to update the active accent color. */
type UpdateAccentMessage = { command: "updateAccent"; value: string };
/** Defines a message to update the custom accent color hex code. */
type UpdateCustomAccentMessage = { command: "updateCustomAccent"; value: string };
/** Defines a message to update a specific syntax color for a flavor. */
type UpdateSyntaxColorMessage = { command: "updateSyntaxColor"; flavor: string; key: string; value: string };
/** Defines a message to reset a specific syntax color for a flavor. */
type ResetSyntaxColorMessage = { command: "resetSyntaxColor"; flavor: string; key: string };
/** Defines a message to reset all extension settings to their defaults. */
type ResetAllMessage = { command: "resetAll" };

/** A discriminated union of all possible messages that can be sent from the webview to the extension. */
type WebviewMessage =
  | UpdateSettingMessage
  | ResetFontStyleMessage
  | UpdateAccentMessage
  | UpdateCustomAccentMessage
  | UpdateSyntaxColorMessage
  | ResetSyntaxColorMessage
  | ResetAllMessage;
// #endregion

/** An array of syntax keys that are customizable in the UI. */
const customizableSyntaxKeys = [
  "comment",
  "variable",
  "keyword",
  "type",
  "namespace",
  "namespaceAttribute",
  "module",
  "annotation",
  "directive",
  "decorator",
  "class",
  "interface",
  "struct",
  "enum",
  "enumMember",
  "fieldAndAttribute",
  "property",
  "propertyReadOnly",
  "functionAndMethod",
  "extensionMethod",
  "delegate",
  "event",
  "parameter",
  "typeParameter",
  "number",
  "constant",
  "operator",
  "operatorOverload",
  "punctuation",
  "string",
  "stringVerbatim",
  "text",
];

/**
 * A type guard to check if a string is a valid flavor key from the palettes.
 * @param key The string to check.
 * @returns {boolean} True if the key is a valid flavor name.
 */
function isFlavor(key: string): key is keyof Palettes {
  return key in palettes;
}

/**
 * Manages the state and logic of the settings webview panel.
 * This class follows a singleton pattern to ensure only one panel exists.
 */
export class SettingsPanel {
  private static _instance: SettingsPanel | undefined;
  private readonly _context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  /**
   * Creates a new settings panel or reveals the existing one.
   * @param context The extension context from VS Code.
   */
  public static createOrShow(context: vscode.ExtensionContext) {
    if (!SettingsPanel._instance) {
      SettingsPanel._instance = new SettingsPanel(context);
    }
    WebviewManager.createOrShow(context, SettingsPanel._instance._handleMessage.bind(SettingsPanel._instance));
    SettingsPanel._instance._update();
  }

  /**
   * Sends updated settings to the webview panel if it is currently visible.
   */
  public static updateIfVisible() {
    SettingsPanel._instance?._update();
  }

  /**
   * Handles incoming messages from the webview panel.
   * @param {WebviewMessage} message The deserialized message object sent from the webview.
   */
  private async _handleMessage(message: WebviewMessage) {
    // The 'command' property is used as a discriminator for the message type.
    // TypeScript correctly infers the shape of 'message' in each case block.
    switch (message.command) {
      case C.WEBVIEW_COMMANDS.UPDATE_SETTING:
        await ConfigurationService.updateFontStyle(message.key, message.value);
        return;
      case C.WEBVIEW_COMMANDS.RESET_FONT_STYLE:
        await ConfigurationService.resetFontStyle(message.key);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_ACCENT:
        await ConfigurationService.updateAccent(message.value);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_CUSTOM_ACCENT:
        await ConfigurationService.updateCustomAccent(message.value);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_SYNTAX_COLOR:
        await ConfigurationService.updateSyntaxColor(message.flavor, message.key, message.value);
        return;
      case C.WEBVIEW_COMMANDS.RESET_SYNTAX_COLOR:
        await ConfigurationService.resetSyntaxColor(message.flavor, message.key);
        return;
      case C.WEBVIEW_COMMANDS.RESET_ALL:
        await ConfigurationService.resetAll();
        this._update();
        return;
    }
  }

  /**
   * Parses the active VS Code theme name to determine the current Calmppuccin flavor.
   * @param {string} themeName The full name of the active color theme.
   * @returns {keyof Palettes} The corresponding flavor key (e.g., "mocha").
   */
  private _getFlavorFromTheme(themeName: string): keyof Palettes {
    const calmppuccinPrefix = "calmppuccin ";
    if (themeName.toLowerCase().startsWith(calmppuccinPrefix)) {
      const flavor = themeName
        .slice(calmppuccinPrefix.length)
        .toLowerCase()
        .replace(/ /g, "-")
        // Normalize accented characters (like 'é' in 'Frappé') to their base character 'e'
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (isFlavor(flavor)) {
        return flavor;
      }
    }
    // Fallback to a default flavor if parsing fails.
    return "mocha";
  }

  /**
   * Gathers all current settings and posts them to the webview panel to update its state.
   */
  private _update() {
    if (!WebviewManager.currentPanel) return;

    // --- 1. Get all necessary configurations ---
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;
    const activeTheme = workbenchConfig.get<string>("colorTheme", "Calmppuccin Mocha");

    // Get strongly-typed settings from our centralized service
    const activeFlavor = this._getFlavorFromTheme(activeTheme);
    const fontStyles: FontStyles = ConfigurationService.getFontStyles();
    const syntaxOverrides: SyntaxOverrides = ConfigurationService.getSyntaxOverrides();
    const currentAccent = ConfigurationService.getAccent(); // Handles "custom" logic internally
    const customAccentColor = vscode.workspace
      .getConfiguration(C.EXTENSION_NAMESPACE)
      .get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

    // Get default values from package.json for comparison and reset functionality
    const defaultFontStyles =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`]
        ?.default ?? {};
    const accentOptions =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];

    // --- 2. Prepare data specifically for the webview ---
    const defaultPalette = palettes[activeFlavor];
    const overridePalette = syntaxOverrides[activeFlavor] || {};
    const activeThemeBackgroundColor = defaultPalette.crust;

    // Create a map of accent names to their hex codes for the current flavor
    const accentColorPalettes = accentOptions.reduce((acc: { [key: string]: string }, option: string) => {
      if (defaultPalette[option]) {
        acc[option] = defaultPalette[option];
      }
      return acc;
    }, {});

    // Combine default and overridden settings into a single structure for the UI
    const syntaxSettings = customizableSyntaxKeys.map((key) => ({
      key: key,
      fontStyle: fontStyles[`${key}FontStyle`] ?? "none",
      color: overridePalette[key] || defaultPalette[key],
      defaultColor: defaultPalette[key],
    }));

    // --- 3. Post the complete settings payload to the webview ---
    WebviewManager.currentPanel.postMessage({
      command: C.WEBVIEW_COMMANDS.LOAD_SETTINGS,
      settings: {
        activeFlavor,
        syntaxSettings,
        currentAccent,
        accentOptions,
        customAccentColor,
        defaultFontStyles,
        activeThemeBackgroundColor,
        accentColorPalettes,
      },
    });
  }
}
