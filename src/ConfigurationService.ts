/**
 * @file This file serves as a centralized service for all interactions with the VS Code configuration API.
 * It provides a clean, static interface for getting and setting all extension-related options,
 * abstracting the direct `vscode.workspace.getConfiguration` calls away from other parts of the extension.
 */

import * as vscode from "vscode";
import * as C from "./constants";
import palettes, { IPalettes as IPalettes } from "./palettes";
import { CUSTOMIZABLE_BRACKET_KEYS, CUSTOMIZABLE_JSON_KEYS, CUSTOMIZABLE_SYNTAX_KEYS } from "./constants";
import { ISettingsPayload, IWebviewSetting } from "../types/webview";

/** Defines the shape of the font styles configuration object in settings.json. */
export interface IFontStyles {
  [key: string]: string;
}

/** Defines the shape of the syntax color overrides object in settings.json. */
export interface ISyntaxOverrides {
  [flavor: string]: {
    [token: string]: string;
  };
}

/**
 * A type guard to check if a string is a valid flavor key from the palettes.
 * @param key The string to check.
 * @returns {boolean} True if the key is a valid flavor name.
 */
function isFlavor(key: string): key is keyof IPalettes {
  return key in palettes;
}

/**
 * A static utility class for managing all Calmppuccin settings in VS Code.
 */
export class ConfigurationService {
  /**
   * Gets the VS Code configuration object scoped to the Calmppuccin extension.
   * @private
   */
  private static get config() {
    return vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
  }

  /**
   * Gets the currently configured accent color.
   * This method resolves the 'custom' option to its validated hex value,
   * ensuring a valid color is always returned for theme generation.
   * @returns {string} The active accent color value (e.g., "sapphire" or a hex code like "#89b4fa").
   */
  public static getAccent(): string {
    const accentSetting = this.config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);

    // If the user has selected "custom", the corresponding hex code must be fetched and validated.
    if (accentSetting === "custom") {
      const customColor = this.config.get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

      // A simple regex to validate that the color is a 6-digit hex code.
      const hex6Regex = /^#([A-Fa-f0-9]{6})$/;

      // If the stored custom color is valid, use it. Otherwise, fall back to the default
      // custom color to prevent errors during theme generation.
      return hex6Regex.test(customColor) ? customColor : C.DEFAULT_CUSTOM_ACCENT;
    }
    return accentSetting;
  }

  /**
   * Gets the user-defined font styles from settings.json.
   * @returns {IFontStyles} The font styles object. Returns an empty object if not set.
   */
  public static getFontStyles(): IFontStyles {
    return this.config.get<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {});
  }

  /**
   * Gets the user-defined syntax color overrides from settings.json.
   * @returns {ISyntaxOverrides} The syntax overrides object. Returns an empty object if not set.
   */
  public static getSyntaxOverrides(): ISyntaxOverrides {
    return this.config.get<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
  }

  /**
   * Updates a specific font style setting in the user's global settings.json.
   * @param {string} key The font style key to update (e.g., "commentFontStyle").
   * @param {string} value The new font style value (e.g., "italic").
   */
  public static async updateFontStyle(key: string, value: string) {
    const fontStyles = this.getFontStyles();
    await this.config.update(C.CONFIG_KEY_FONT_STYLES, { ...fontStyles, [key]: value }, vscode.ConfigurationTarget.Global);
  }

  /**
   * Resets a specific font style to its default by removing it from the user's settings.json.
   * @param {string} key The font style key to reset.
   */
  public static async resetFontStyle(key: string) {
    const fontStyles: IFontStyles = { ...this.getFontStyles() };
    delete fontStyles[key];
    // If the fontStyles object is empty after deletion, set it to 'undefined'.
    // This completely removes the "calmppuccin.fontStyles" entry from settings.json.
    const finalFontStyles = Object.keys(fontStyles).length === 0 ? undefined : fontStyles;
    await this.config.update(C.CONFIG_KEY_FONT_STYLES, finalFontStyles, vscode.ConfigurationTarget.Global);
  }

  /**
   * Updates the accent color setting.
   * @param {string} value The new accent color name (e.g., "mauve").
   */
  public static async updateAccent(value: string) {
    await this.config.update(C.CONFIG_KEY_ACCENT, value, vscode.ConfigurationTarget.Global);
  }

  /**
   * Updates the custom accent color hex code.
   * @param {string} value The new hex color value (e.g., "#89b4fa").
   */
  public static async updateCustomAccent(value: string) {
    await this.config.update(C.CONFIG_KEY_CUSTOM_ACCENT, value, vscode.ConfigurationTarget.Global);
  }

  /**
   * Updates a specific syntax color override for a given flavor.
   * @param {string} flavor The theme flavor (e.g., "mocha").
   * @param {string} key The syntax key (e.g., "comment").
   * @param {string} value The new hex color value.
   */
  public static async updateSyntaxColor(flavor: string, key: string, value: string) {
    // We deep-clone the settings object because the object returned by .get() is read-only.
    // This creates a mutable copy that we can safely modify before updating the configuration.
    const overrides: ISyntaxOverrides = JSON.parse(JSON.stringify(this.getSyntaxOverrides()));
    if (!overrides[flavor]) {
      overrides[flavor] = {};
    }
    overrides[flavor][key] = value;
    await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, overrides, vscode.ConfigurationTarget.Global);
  }

  /**
   * Resets a specific syntax color override for a given flavor.
   * @param {string} flavor The theme flavor.
   * @param {string} key The syntax key.
   */
  public static async resetSyntaxColor(flavor: string, key: string) {
    const overrides: ISyntaxOverrides = JSON.parse(JSON.stringify(this.getSyntaxOverrides()));
    if (overrides[flavor]?.[key]) {
      delete overrides[flavor][key];
      // If a flavor object becomes empty, remove it entirely.
      if (Object.keys(overrides[flavor]).length === 0) {
        delete overrides[flavor];
      }
      // If the top-level overrides object is now empty, remove the entire setting.
      const finalOverrides = Object.keys(overrides).length === 0 ? undefined : overrides;
      await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, finalOverrides, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * Resets all user-defined settings for the extension to their default values.
   */
  public static async resetAll() {
    await this.config.update(C.CONFIG_KEY_FONT_STYLES, undefined, vscode.ConfigurationTarget.Global);
    await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
    await this.config.update(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT, vscode.ConfigurationTarget.Global);
  }

  /**
   * Parses the active VS Code theme name to determine the current Calmppuccin flavor.
   * @returns {keyof IPalettes} The corresponding flavor key (e.g., "mocha").
   * @private
   */
  private static getActiveFlavor(): keyof IPalettes {
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const themeName = workbenchConfig.get<string>("colorTheme", "");
    const calmppuccinPrefix = "calmppuccin ";

    if (themeName.toLowerCase().startsWith(calmppuccinPrefix)) {
      const flavor = themeName
        .slice(calmppuccinPrefix.length)
        .toLowerCase()
        .replace(/ /g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (isFlavor(flavor)) {
        return flavor;
      }
    }
    return "mocha"; // Default fallback
  }

  /**
   * Gathers all settings required by the webview into a single object.
   * @returns {ISettingsPayload} The complete settings payload for the webview.
   */
  public static getWebViewSettings(): ISettingsPayload {
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;

    const activeFlavor = this.getActiveFlavor();
    const fontStyles = this.getFontStyles();
    const syntaxOverrides = this.getSyntaxOverrides();
    const currentAccent = this.config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const customAccentColor = this.config.get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

    const defaultFontStyles =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`]
        ?.default ?? {};
    const accentOptions =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];

    const defaultPalette = palettes[activeFlavor];
    const overridePalette = syntaxOverrides[activeFlavor] || {};
    const activeThemeBackgroundColor = defaultPalette.crust;

    const accentColorPalettes = accentOptions.reduce((acc: { [key: string]: string }, option: string) => {
      if (defaultPalette[option]) {
        acc[option] = defaultPalette[option];
      }
      return acc;
    }, {});

    const syntaxSettings = CUSTOMIZABLE_SYNTAX_KEYS.map(
      (key): IWebviewSetting => ({
        key: key,
        fontStyle: fontStyles[`${key}FontStyle`] ?? "none",
        color: overridePalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      })
    );

    const bracketSettings = CUSTOMIZABLE_BRACKET_KEYS.map(
      (key): IWebviewSetting => ({
        key: key,
        color: overridePalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      })
    );

    const jsonSettings = CUSTOMIZABLE_JSON_KEYS.map(
      (key): IWebviewSetting => ({
        key: key,
        fontStyle: fontStyles[`${key}FontStyle`] ?? "none",
        color: overridePalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      })
    );

    return {
      activeFlavor,
      syntaxSettings,
      bracketSettings,
      jsonSettings,
      currentAccent,
      accentOptions,
      customAccentColor,
      defaultFontStyles,
      activeThemeBackgroundColor,
      accentColorPalettes,
    };
  }
}
