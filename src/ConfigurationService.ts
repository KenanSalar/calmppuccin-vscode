import * as vscode from "vscode";
import * as C from "./constants";

// Define a type for the font styles configuration object
export interface FontStyles {
  [key: string]: string;
}

// Define a type for the syntax overrides configuration object
export interface SyntaxOverrides {
  [flavor: string]: {
    [token: string]: string;
  };
}

export class ConfigurationService {
  /**
   * Gets the VS Code configuration object for the Calmppuccin extension.
   */
  private static get config() {
    return vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
  }

  /**
   * Gets the currently configured accent color.
   * @returns {string} The active accent color value.
   */
  public static getAccent(): string {
    const accentSetting = this.config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    if (accentSetting === "custom") {
      return this.config.get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);
    }
    return accentSetting;
  }

  /**
   * Gets the user-defined font styles.
   * @returns {{ [key: string]: string } | undefined} The font styles object.
   */
  public static getFontStyles() {
    return this.config.get<{ [key: string]: string }>(C.CONFIG_KEY_FONT_STYLES);
  }

  /**
   * Gets the user-defined syntax color overrides.
   * @returns {object} The syntax overrides object.
   */
  public static getSyntaxOverrides() {
    return this.config.get<object>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
  }

  /**
   * Updates a specific font style setting.
   * @param {string} key The font style key to update (e.g., "commentFontStyle").
   * @param {string} value The new font style value.
   */
  public static async updateFontStyle(key: string, value: string) {
    const fontStyles = this.getFontStyles() || {};
    await this.config.update(C.CONFIG_KEY_FONT_STYLES, { ...fontStyles, [key]: value }, vscode.ConfigurationTarget.Global);
  }

  /**
   * Resets a specific font style to its default by removing it from the settings.
   * @param {string} key The font style key to reset.
   */
  public static async resetFontStyle(key: string) {
    const fontStyles: FontStyles = { ...this.getFontStyles() };
    delete fontStyles[key];
    const finalFontStyles = Object.keys(fontStyles).length === 0 ? undefined : fontStyles;
    await this.config.update(C.CONFIG_KEY_FONT_STYLES, finalFontStyles, vscode.ConfigurationTarget.Global);
  }

  /**
   * Updates the accent color setting.
   * @param {string} value The new accent color name.
   */
  public static async updateAccent(value: string) {
    await this.config.update(C.CONFIG_KEY_ACCENT, value, vscode.ConfigurationTarget.Global);
  }

  /**
   * Updates the custom accent color hex code.
   * @param {string} value The new hex color value.
   */
  public static async updateCustomAccent(value: string) {
    await this.config.update(C.CONFIG_KEY_CUSTOM_ACCENT, value, vscode.ConfigurationTarget.Global);
  }

  /**
   * Updates a specific syntax color override.
   * @param {string} flavor The theme flavor (e.g., "mocha").
   * @param {string} key The syntax key (e.g., "comment").
   * @param {string} value The new hex color value.
   */
  public static async updateSyntaxColor(flavor: string, key: string, value: string) {
    const overrides: SyntaxOverrides = JSON.parse(JSON.stringify(this.getSyntaxOverrides()));
    if (!overrides[flavor]) {
      overrides[flavor] = {};
    }
    overrides[flavor][key] = value;
    await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, overrides, vscode.ConfigurationTarget.Global);
  }

  /**
   * Resets a specific syntax color override.
   * @param {string} flavor The theme flavor.
   * @param {string} key The syntax key.
   */
  public static async resetSyntaxColor(flavor: string, key: string) {
    const overrides: SyntaxOverrides = JSON.parse(JSON.stringify(this.getSyntaxOverrides()));
    if (overrides[flavor]?.[key]) {
      delete overrides[flavor][key];
      if (Object.keys(overrides[flavor]).length === 0) {
        delete overrides[flavor];
      }
      const finalOverrides = Object.keys(overrides).length === 0 ? undefined : overrides;
      await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, finalOverrides, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * Resets all user-defined settings for the extension to their defaults.
   */
  public static async resetAll() {
    await this.config.update(C.CONFIG_KEY_FONT_STYLES, undefined, vscode.ConfigurationTarget.Global);
    await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
    await this.config.update(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT, vscode.ConfigurationTarget.Global);
  }
}
