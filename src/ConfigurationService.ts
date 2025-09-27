/**
 * @file This file serves as a centralized service for all interactions with the VS Code configuration API.
 * It provides a clean, static interface for getting and setting all extension-related options,
 * abstracting the direct `vscode.workspace.getConfiguration` calls away from other parts of the extension.
 */

import * as vscode from "vscode";
import * as C from "./constants";
import palettes, { IPalettes as IPalettes } from "./palettes";
import {
  CUSTOMIZABLE_BRACKET_KEYS,
  CUSTOMIZABLE_JSON_KEYS,
  CUSTOMIZABLE_SYNTAX_KEYS,
  CUSTOMIZABLE_UI_KEYS,
} from "./constants";
import { ISettingsPayload, IWebviewSetting, IProfile } from "../types/webview";

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

/** Defines the shape of the UI color overrides object in settings.json. */
export interface IUiOverrides {
  [flavor: string]: {
    [token: string]: string;
  };
}

/** Defines the shape of the font style overrides object in settings.json. */
export interface IFontStyleOverrides {
  [flavor: string]: {
    [fontStyleKey: string]: string;
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
   * Gets the user-defined profiles from settings.json.
   * @returns {{ [name: string]: IProfile }} The profiles object.
   */
  public static getProfiles(): { [name: string]: IProfile } {
    let profiles = this.config.get(C.CONFIG_KEY_PROFILES, { Default: {} });

    // Handle cases where profiles might not be an object (e.g., in tests)
    if (typeof profiles !== 'object' || profiles === null || Array.isArray(profiles)) {
      profiles = { Default: {} };
    }

    // Ensure Default profile exists
    if (!profiles.Default) {
      profiles.Default = {};
    }

    return profiles;
  }

  /**
   * Migrates existing global settings to the Default profile if they exist outside profiles.
   * Only migrates settings that are different from defaults.
   * This should be called once when the extension activates.
   */
  public static async migrateGlobalSettingsToDefault() {
    const profiles = this.config.get(C.CONFIG_KEY_PROFILES, { Default: {} });

    // Ensure Default profile exists
    if (!profiles.Default) {
      profiles.Default = {};
    }

    let needsUpdate = false;
    const defaultProfile = profiles.Default;

    // Get global settings
    const globalFontStyles = this.config.get(C.CONFIG_KEY_FONT_STYLES);
    const globalFontStyleOverrides = this.config.get(C.CONFIG_KEY_FONT_STYLE_OVERRIDES);
    const globalSyntaxOverrides = this.config.get(C.CONFIG_KEY_SYNTAX_OVERRIDES);
    const globalUiOverrides = this.config.get(C.CONFIG_KEY_UI_OVERRIDES);
    const globalAccent = this.config.get(C.CONFIG_KEY_ACCENT);
    const globalCustomAccent = this.config.get(C.CONFIG_KEY_CUSTOM_ACCENT);

    // Only migrate fontStyles if they contain non-default values
    if (globalFontStyles && !(C.CONFIG_KEY_FONT_STYLES in defaultProfile)) {
      const defaults = this.getDefaultFontStyles();
      const customizedStyles: { [key: string]: string } = {};

      // Only include styles that differ from defaults
      for (const [key, value] of Object.entries(globalFontStyles)) {
        if (defaults[key] !== value) {
          customizedStyles[key] = value as string;
        }
      }

      // Only add to profile if there are actually customized styles
      if (Object.keys(customizedStyles).length > 0) {
        (defaultProfile as any)[C.CONFIG_KEY_FONT_STYLES] = customizedStyles;
        needsUpdate = true;
      }
    }

    // Migrate fontStyleOverrides (these are always customizations)
    if (globalFontStyleOverrides && Object.keys(globalFontStyleOverrides).length > 0 && !(C.CONFIG_KEY_FONT_STYLE_OVERRIDES in defaultProfile)) {
      (defaultProfile as any)[C.CONFIG_KEY_FONT_STYLE_OVERRIDES] = globalFontStyleOverrides;
      needsUpdate = true;
    }

    // Migrate syntaxOverrides (these are always customizations)
    if (globalSyntaxOverrides && Object.keys(globalSyntaxOverrides).length > 0 && !(C.CONFIG_KEY_SYNTAX_OVERRIDES in defaultProfile)) {
      (defaultProfile as any)[C.CONFIG_KEY_SYNTAX_OVERRIDES] = globalSyntaxOverrides;
      needsUpdate = true;
    }

    // Migrate uiOverrides (these are always customizations)
    if (globalUiOverrides && Object.keys(globalUiOverrides).length > 0 && !(C.CONFIG_KEY_UI_OVERRIDES in defaultProfile)) {
      (defaultProfile as any)[C.CONFIG_KEY_UI_OVERRIDES] = globalUiOverrides;
      needsUpdate = true;
    }

    // Only migrate accent if it's different from default
    if (globalAccent && globalAccent !== C.DEFAULT_ACCENT && !(C.CONFIG_KEY_ACCENT in defaultProfile)) {
      (defaultProfile as any)[C.CONFIG_KEY_ACCENT] = globalAccent;
      needsUpdate = true;
    }

    // Only migrate custom accent if it's different from default
    if (globalCustomAccent && globalCustomAccent !== C.DEFAULT_CUSTOM_ACCENT && !(C.CONFIG_KEY_CUSTOM_ACCENT in defaultProfile)) {
      (defaultProfile as any)[C.CONFIG_KEY_CUSTOM_ACCENT] = globalCustomAccent;
      needsUpdate = true;
    }

    // Update profiles if migration occurred
    if (needsUpdate) {
      await this.config.update(C.CONFIG_KEY_PROFILES, profiles, vscode.ConfigurationTarget.Global);

      // Clean up the old global settings after migration
      await this.config.update(C.CONFIG_KEY_FONT_STYLES, undefined, vscode.ConfigurationTarget.Global);
      await this.config.update(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
      await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
      await this.config.update(C.CONFIG_KEY_UI_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
      await this.config.update(C.CONFIG_KEY_ACCENT, undefined, vscode.ConfigurationTarget.Global);
      await this.config.update(C.CONFIG_KEY_CUSTOM_ACCENT, undefined, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * Gets the name of the currently active profile.
   * @returns {string} The active profile name.
   */
  public static getActiveProfile(): string {
    return this.config.get(C.CONFIG_KEY_ACTIVE_PROFILE, "Default");
  }

  /**
   * Updates the active profile setting.
   * @param {string} profileName The name of the profile to set as active.
   */
  public static async updateActiveProfile(profileName: string) {
    await this.config.update(C.CONFIG_KEY_ACTIVE_PROFILE, profileName, vscode.ConfigurationTarget.Global);
  }

  /**
   * Saves the current configuration as a new profile.
   * @param {string} profileName The name for the new profile.
   */
  public static async saveProfile(profileName: string) {
    const profiles = this.getProfiles();

    // Get current font styles and filter out defaults
    const currentFontStyles = this.getFontStyles();
    const defaultFontStyles = this.getDefaultFontStyles();
    const customizedFontStyles: IFontStyles = {};

    // Only include font styles that differ from defaults
    for (const [key, value] of Object.entries(currentFontStyles)) {
      if (defaultFontStyles[key] !== value) {
        customizedFontStyles[key] = value;
      }
    }

    // Get current accent and custom accent, only include if different from defaults
    const currentAccent = this.getProfileSetting<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const currentCustomAccent = this.getProfileSetting<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

    const currentSettings: IProfile = {};

    // Only include settings that are different from defaults
    if (currentAccent !== C.DEFAULT_ACCENT) {
      currentSettings[C.CONFIG_KEY_ACCENT] = currentAccent;
    }

    if (currentCustomAccent !== C.DEFAULT_CUSTOM_ACCENT) {
      currentSettings[C.CONFIG_KEY_CUSTOM_ACCENT] = currentCustomAccent;
    }

    if (Object.keys(customizedFontStyles).length > 0) {
      currentSettings[C.CONFIG_KEY_FONT_STYLES] = customizedFontStyles;
    }

    const syntaxOverrides = this.getSyntaxOverrides();
    if (Object.keys(syntaxOverrides).length > 0) {
      currentSettings[C.CONFIG_KEY_SYNTAX_OVERRIDES] = syntaxOverrides;
    }

    const uiOverrides = this.getUiOverrides();
    if (Object.keys(uiOverrides).length > 0) {
      currentSettings[C.CONFIG_KEY_UI_OVERRIDES] = uiOverrides;
    }

    const fontStyleOverrides = this.getFontStyleOverrides();
    if (Object.keys(fontStyleOverrides).length > 0) {
      currentSettings[C.CONFIG_KEY_FONT_STYLE_OVERRIDES] = fontStyleOverrides;
    }

    profiles[profileName] = currentSettings;
    await this.config.update(C.CONFIG_KEY_PROFILES, profiles, vscode.ConfigurationTarget.Global);
  }

  /**
   * Deletes a specified profile.
   * @param {string} profileName The name of the profile to delete.
   */
  public static async deleteProfile(profileName: string) {
    if (profileName === "Default") return; // Cannot delete the default profile

    const profiles = this.getProfiles();
    delete profiles[profileName];

    // If no custom profiles remain, clear the profiles setting entirely
    const customProfiles = Object.keys(profiles).filter(name => name !== "Default");
    const finalProfiles = customProfiles.length > 0 ? profiles : {};

    await this.config.update(C.CONFIG_KEY_PROFILES, finalProfiles, vscode.ConfigurationTarget.Global);
    await this.updateActiveProfile("Default"); // Switch back to default
  }

  /**
   * Resets the settings for a specific profile.
   * @param {string} profileName The name of the profile to reset.
   */
  public static async resetProfile(profileName: string) {
    const currentProfiles: { [name: string]: IProfile } = this.config.get(C.CONFIG_KEY_PROFILES, {});

    if (currentProfiles[profileName]) {
      // Clear all settings but keep the profile (works for both Default and custom profiles)
      currentProfiles[profileName] = {};
      await this.config.update(C.CONFIG_KEY_PROFILES, currentProfiles, vscode.ConfigurationTarget.Global);

      // If resetting Default profile, also clear any legacy global settings for cleanup
      if (profileName === "Default") {
        await this.config.update(C.CONFIG_KEY_FONT_STYLES, undefined, vscode.ConfigurationTarget.Global);
        await this.config.update(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
        await this.config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
        await this.config.update(C.CONFIG_KEY_UI_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
        await this.config.update(C.CONFIG_KEY_ACCENT, undefined, vscode.ConfigurationTarget.Global);
      }
    }
  }

  /**
   * Updates a setting, respecting the current profile.
   * @param {string} key The configuration key.
   * @param {T} value The new value.
   * @private
   */
  private static async updateProfileSetting<T>(key: string, value: T) {
    const activeProfile = this.getActiveProfile();
    const profiles = this.getProfiles();

    // Ensure Default profile exists
    if (!profiles["Default"]) {
      profiles["Default"] = {};
    }

    // Store setting in the appropriate profile (including Default)
    const profile = profiles[activeProfile] || {};
    profile[key] = value;
    profiles[activeProfile] = profile;

    await this.config.update(C.CONFIG_KEY_PROFILES, profiles, vscode.ConfigurationTarget.Global);
  }

  /**
   * Gets a setting value, respecting the current profile.
   * @param {string} key The configuration key.
   * @param {T} defaultValue The default value if not found.
   * @returns {T} The value of the setting.
   * @private
   */
  private static getProfileSetting<T>(key: string, defaultValue: T): T {
    const activeProfile = this.getActiveProfile();
    const profiles = this.getProfiles();

    if (activeProfile && profiles[activeProfile]) {
      const profile = profiles[activeProfile];
      if (typeof profile[key] !== "undefined") {
        return profile[key] as T;
      }
    }

    // Fallback to global config for backward compatibility
    return this.config.get<T>(key, defaultValue);
  }

  /**
   * Gets the currently configured accent color.
   * This method resolves the 'custom' option to its validated hex value,
   * ensuring a valid color is always returned for theme generation.
   * @returns {string} The active accent color value (e.g., "sapphire" or a hex code like "#89b4fa").
   */
  public static getAccent(): string {
    const accentSetting = this.getProfileSetting<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);

    // If the user has selected "custom", the corresponding hex code must be fetched and validated.
    if (accentSetting === "custom") {
      const customColor = this.getProfileSetting<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

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
    return this.getProfileSetting<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {});
  }

  /**
   * Gets the user-defined syntax color overrides from settings.json.
   * @returns {ISyntaxOverrides} The syntax overrides object. Returns an empty object if not set.
   */
  public static getSyntaxOverrides(): ISyntaxOverrides {
    return this.getProfileSetting<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
  }

  /**
   * Gets the user-defined UI color overrides from settings.json.
   * @returns {IUiOverrides} The UI overrides object. Returns an empty object if not set.
   */
  public static getUiOverrides(): IUiOverrides {
    return this.getProfileSetting<IUiOverrides>(C.CONFIG_KEY_UI_OVERRIDES, {});
  }

  /**
   * Gets the user-defined font style overrides from settings.json.
   * @returns {IFontStyleOverrides} The font style overrides object. Returns an empty object if not set.
   */
  public static getFontStyleOverrides(): IFontStyleOverrides {
    return this.getProfileSetting<IFontStyleOverrides>(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, {});
  }

  /**
   * Gets the default font styles from the extension's package.json configuration.
   * @returns {IFontStyles} The default font styles object.
   * @private
   */
  private static getDefaultFontStyles(): IFontStyles {
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;
    return extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`]?.default ?? {};
  }

  /**
   * Updates a specific font style setting in the user's global settings.json.
   * Only saves font styles that differ from the default values.
   * @param {string} key The font style key to update (e.g., "commentFontStyle").
   * @param {string} value The new font style value (e.g., "italic").
   */
  public static async updateFontStyle(key: string, value: string) {
    const currentFontStyles = this.getFontStyles();
    const defaultFontStyles = this.getDefaultFontStyles();

    // Start with current font styles and update the specific key
    const updatedFontStyles: IFontStyles = { ...currentFontStyles };

    // Update or remove the specific key
    if (value !== defaultFontStyles[key]) {
      updatedFontStyles[key] = value;
    } else {
      delete updatedFontStyles[key];
    }

    // Filter out all font styles that match their default values
    const filteredFontStyles: IFontStyles = {};
    for (const [styleKey, styleValue] of Object.entries(updatedFontStyles)) {
      if (styleValue !== defaultFontStyles[styleKey]) {
        filteredFontStyles[styleKey] = styleValue;
      }
    }

    // If no custom font styles remain, remove the entire setting
    const finalFontStyles = Object.keys(filteredFontStyles).length === 0 ? undefined : filteredFontStyles;
    await this.updateProfileSetting(C.CONFIG_KEY_FONT_STYLES, finalFontStyles);
  }

  /**
   * Resets a specific font style to its default by removing it from the user's settings.json.
   * @param {string} key The font style key to reset.
   */
  public static async resetFontStyle(key: string) {
    const currentFontStyles: IFontStyles = { ...this.getFontStyles() };
    const defaultFontStyles = this.getDefaultFontStyles();

    // Remove the specific key being reset
    delete currentFontStyles[key];

    // Filter out all font styles that match their default values
    const filteredFontStyles: IFontStyles = {};
    for (const [styleKey, styleValue] of Object.entries(currentFontStyles)) {
      if (styleValue !== defaultFontStyles[styleKey]) {
        filteredFontStyles[styleKey] = styleValue;
      }
    }

    // If no custom font styles remain, remove the entire setting
    const finalFontStyles = Object.keys(filteredFontStyles).length === 0 ? undefined : filteredFontStyles;
    await this.updateProfileSetting(C.CONFIG_KEY_FONT_STYLES, finalFontStyles);
  }

  /**
   * Updates the accent color setting.
   * @param {string} value The new accent color name (e.g., "mauve").
   */
  public static async updateAccent(value: string) {
    await this.updateProfileSetting(C.CONFIG_KEY_ACCENT, value);
  }

  /**
   * Updates the custom accent color hex code.
   * @param {string} value The new hex color value (e.g., "#89b4fa").
   */
  public static async updateCustomAccent(value: string) {
    await this.updateProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, value);
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
    await this.updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, overrides);
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
      await this.updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, finalOverrides);
    }
  }

  /**
   * Updates a specific UI color override for a given flavor.
   * @param {string} flavor The theme flavor.
   * @param {string} key The UI key (e.g., "base").
   * @param {string} value The new hex color value.
   */
  public static async updateUiColor(flavor: string, key: string, value: string) {
    const overrides: IUiOverrides = JSON.parse(JSON.stringify(this.getUiOverrides()));
    if (!overrides[flavor]) {
      overrides[flavor] = {};
    }
    overrides[flavor][key] = value;
    await this.updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, overrides);
  }

  /**
   * Resets a specific UI color override for a given flavor.
   * @param {string} flavor The theme flavor.
   * @param {string} key The UI key.
   */
  public static async resetUiColor(flavor: string, key: string) {
    const overrides: IUiOverrides = JSON.parse(JSON.stringify(this.getUiOverrides()));
    if (overrides[flavor]?.[key]) {
      delete overrides[flavor][key];
      if (Object.keys(overrides[flavor]).length === 0) {
        delete overrides[flavor];
      }
      const finalOverrides = Object.keys(overrides).length === 0 ? undefined : overrides;
      await this.updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, finalOverrides);
    }
  }

  /**
   * Updates a specific font style override for a flavor in the user's global settings.json.
   * @param {string} flavor The theme flavor (e.g., "mocha").
   * @param {string} key The font style key to update (e.g., "commentFontStyle").
   * @param {string} value The new font style value (e.g., "italic").
   */
  public static async updateFontStyleOverride(flavor: string, key: string, value: string) {
    const fontStyleOverrides = this.getFontStyleOverrides();
    const defaultFontStyles = this.getDefaultFontStyles();

    // Only save if the value differs from the default
    if (value !== defaultFontStyles[key]) {
      if (!fontStyleOverrides[flavor]) {
        fontStyleOverrides[flavor] = {};
      }
      fontStyleOverrides[flavor][key] = value;
      await this.updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, fontStyleOverrides);
    } else {
      // If setting to default, remove it (same as resetting)
      await this.resetFontStyleOverride(flavor, key);
    }
  }

  /**
   * Resets a font style override for a specific flavor by removing it from the user's settings.json.
   * @param {string} flavor The theme flavor (e.g., "mocha").
   * @param {string} key The font style key to reset.
   */
  public static async resetFontStyleOverride(flavor: string, key: string) {
    const overrides: IFontStyleOverrides = JSON.parse(JSON.stringify(this.getFontStyleOverrides()));
    if (overrides[flavor]?.[key]) {
      delete overrides[flavor][key];
      if (Object.keys(overrides[flavor]).length === 0) {
        delete overrides[flavor];
      }
      const finalOverrides = Object.keys(overrides).length === 0 ? undefined : overrides;
      await this.updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, finalOverrides);
    }
  }

  /**
   * Resets all user-defined settings for the current active profile to their default values.
   */
  public static async resetAll() {
    const activeProfile = this.getActiveProfile();
    await this.resetProfile(activeProfile);
  }

  /**
   * Parses the active VS Code theme name to determine the current Calmppuccin flavor.
   * @returns {keyof IPalettes} The corresponding flavor key (e.g., "mocha").
   */
  public static getActiveFlavor(): keyof IPalettes {
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
    const uiOverrides = this.getUiOverrides();
    const fontStyleOverrides = this.getFontStyleOverrides();
    const currentAccent = this.getProfileSetting<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const customAccentColor = this.getProfileSetting<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);
    const profiles = this.getProfiles();
    const activeProfile = this.getActiveProfile();

    const defaultFontStyles = this.getDefaultFontStyles();
    const accentOptions =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];

    const defaultPalette = palettes[activeFlavor];
    const overrideSyntaxPalette = syntaxOverrides[activeFlavor] || {};
    const overrideUiPalette = uiOverrides[activeFlavor] || {};
    const overrideFontStylePalette = fontStyleOverrides[activeFlavor] || {};
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
        fontStyle: overrideFontStylePalette[`${key}FontStyle`] ?? fontStyles[`${key}FontStyle`] ?? "none",
        color: overrideSyntaxPalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      })
    );

    const bracketSettings = CUSTOMIZABLE_BRACKET_KEYS.map(
      (key): IWebviewSetting => ({
        key: key,
        color: overrideSyntaxPalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      })
    );

    const jsonSettings = CUSTOMIZABLE_JSON_KEYS.map(
      (key): IWebviewSetting => ({
        key: key,
        fontStyle: overrideFontStylePalette[`${key}FontStyle`] ?? fontStyles[`${key}FontStyle`] ?? "none",
        color: overrideSyntaxPalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      })
    );

    const uiSettings = CUSTOMIZABLE_UI_KEYS.map(
      (key): IWebviewSetting => ({
        key: key,
        color: overrideUiPalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      })
    );

    return {
      activeFlavor,
      syntaxSettings,
      bracketSettings,
      jsonSettings,
      uiSettings,
      currentAccent,
      accentOptions,
      customAccentColor,
      defaultFontStyles,
      activeThemeBackgroundColor,
      accentColorPalettes,
      profiles,
      activeProfile,
    };
  }
}
