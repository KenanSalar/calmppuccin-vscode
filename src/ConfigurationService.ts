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
  parseFlavorFromThemeName,
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

/** Represents the relevant structure of the extension's package.json. */
interface IExtensionPackageJson {
  contributes?: {
    configuration?: {
      properties?: Record<string, { default?: IFontStyles; enum?: string[] }>;
    };
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
 * Creates a deep clone of a nested overrides object.
 * @param obj The object to clone.
 * @returns A deep copy of the object.
 */
function cloneOverrides<T extends Record<string, Record<string, string>>>(obj: T): T {
  const result: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = { ...value };
  }
  return result as T;
}

/**
 * Removes a key from a nested override object immutably.
 * Returns undefined if the result would be empty.
 * @param overrides The overrides object
 * @param flavor The flavor key
 * @param key The nested key to remove
 */
function removeOverrideKey<T extends { [flavor: string]: { [key: string]: string } | undefined }>(
  overrides: T,
  flavor: string,
  key: string
): T | undefined {
  const flavorOverrides = overrides[flavor];
  if (!flavorOverrides || !(key in flavorOverrides)) {
    return overrides;
  }

  // Build new flavor object without the key
  const newFlavorOverrides: Record<string, string> = {};
  for (const [k, v] of Object.entries(flavorOverrides)) {
    if (k !== key) {
      newFlavorOverrides[k] = v;
    }
  }

  // Build new overrides object
  const newOverrides: { [f: string]: { [k: string]: string } | undefined } = {};
  for (const [f, v] of Object.entries(overrides)) {
    if (f !== flavor) {
      newOverrides[f] = v;
    } else if (Object.keys(newFlavorOverrides).length > 0) {
      newOverrides[f] = newFlavorOverrides;
    }
    // If newFlavorOverrides is empty, we skip adding this flavor
  }

  return Object.keys(newOverrides).length === 0 ? undefined : newOverrides as T;
}

/**
 * A utility class for managing all Calmppuccin settings in VS Code.
 * Provides static methods for reading and writing extension configuration.
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
    // Get profiles with unknown type for runtime safety validation
    const rawProfiles: unknown = this.config.get(C.CONFIG_KEY_PROFILES);

    // Validate and return a safe default if profiles is not a valid object
    if (
      typeof rawProfiles !== "object" ||
      rawProfiles === null ||
      Array.isArray(rawProfiles)
    ) {
      return { Default: {} };
    }

    const profiles = rawProfiles as { [name: string]: IProfile };

    // Ensure Default profile exists
    if (!Object.prototype.hasOwnProperty.call(profiles, "Default")) {
      return { ...profiles, Default: {} };
    }

    return profiles;
  }

  /**
   * Migrates existing global settings to the Default profile if they exist outside profiles.
   * Only migrates settings that are different from defaults.
   * This should be called once when the extension activates.
   */
  public static async migrateGlobalSettingsToDefault() {
    const profiles = this.getProfiles();
    let needsUpdate = false;
    const defaultProfile: IProfile = profiles.Default;

    // Get global settings with explicit types
    const globalFontStyles = this.config.get<IFontStyles | undefined>(C.CONFIG_KEY_FONT_STYLES);
    const globalFontStyleOverrides = this.config.get<IFontStyleOverrides | undefined>(C.CONFIG_KEY_FONT_STYLE_OVERRIDES);
    const globalSyntaxOverrides = this.config.get<ISyntaxOverrides | undefined>(C.CONFIG_KEY_SYNTAX_OVERRIDES);
    const globalUiOverrides = this.config.get<IUiOverrides | undefined>(C.CONFIG_KEY_UI_OVERRIDES);
    const globalAccent = this.config.get<string | undefined>(C.CONFIG_KEY_ACCENT);
    const globalCustomAccent = this.config.get<string | undefined>(C.CONFIG_KEY_CUSTOM_ACCENT);

    // Only migrate fontStyles if they contain non-default values
    if (globalFontStyles && !defaultProfile.fontStyles) {
      const defaults = this.getDefaultFontStyles();
      const customizedStyles: { [key: string]: string } = {};

      // Only include styles that differ from defaults
      for (const [key, value] of Object.entries(globalFontStyles)) {
        if (defaults[key] !== value) {
          customizedStyles[key] = value;
        }
      }

      // Only add to profile if there are actually customized styles
      if (Object.keys(customizedStyles).length > 0) {
        defaultProfile.fontStyles = customizedStyles;
        needsUpdate = true;
      }
    }

    // Migrate fontStyleOverrides (these are always customizations)
    if (globalFontStyleOverrides && Object.keys(globalFontStyleOverrides).length > 0 && !defaultProfile.fontStyleOverrides) {
      defaultProfile.fontStyleOverrides = globalFontStyleOverrides;
      needsUpdate = true;
    }

    // Migrate syntaxOverrides (these are always customizations)
    if (globalSyntaxOverrides && Object.keys(globalSyntaxOverrides).length > 0 && !defaultProfile.syntaxOverrides) {
      defaultProfile.syntaxOverrides = globalSyntaxOverrides;
      needsUpdate = true;
    }

    // Migrate uiOverrides (these are always customizations)
    if (globalUiOverrides && Object.keys(globalUiOverrides).length > 0 && !defaultProfile.uiOverrides) {
      defaultProfile.uiOverrides = globalUiOverrides;
      needsUpdate = true;
    }

    // Only migrate accent if it's different from default
    if (globalAccent && globalAccent !== C.DEFAULT_ACCENT && !defaultProfile.accent) {
      defaultProfile.accent = globalAccent;
      needsUpdate = true;
    }

    // Only migrate custom accent if it's different from default
    if (globalCustomAccent && globalCustomAccent !== C.DEFAULT_CUSTOM_ACCENT && !defaultProfile.customAccentColor) {
      defaultProfile.customAccentColor = globalCustomAccent;
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
    const currentAccent = this.getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const currentCustomAccent = this.getProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

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

    // Create new profiles object without the deleted profile using object destructuring
    const { [profileName]: _removed, ...remainingProfiles } = profiles;

    // Check if any custom profiles remain (excluding Default)
    const customProfileNames = Object.keys(remainingProfiles).filter(name => name !== "Default");

    // Determine final profiles object
    let finalProfiles: { [name: string]: IProfile };
    if (customProfileNames.length > 0) {
      // Custom profiles exist, keep the full profiles object
      finalProfiles = remainingProfiles;
    } else {
      // No custom profiles exist, check if Default has any settings
      const defaultProfile = remainingProfiles["Default"];
      if (Object.keys(defaultProfile).length > 0) {
        // Default has settings, keep it
        finalProfiles = { Default: defaultProfile };
      } else {
        // Default is empty, clear the entire profiles setting
        finalProfiles = {};
      }
    }

    await this.config.update(C.CONFIG_KEY_PROFILES, finalProfiles, vscode.ConfigurationTarget.Global);
    await this.updateActiveProfile("Default"); // Switch back to default
  }

  /**
   * Resets the settings for a specific profile.
   * @param {string} profileName The name of the profile to reset.
   */
  public static async resetProfile(profileName: string) {
    const currentProfiles = this.getProfiles();

    if (Object.prototype.hasOwnProperty.call(currentProfiles, profileName)) {
      // Clear all settings but keep the profile (works for both Default and custom profiles)
      const updatedProfiles = { ...currentProfiles, [profileName]: {} };
      await this.config.update(C.CONFIG_KEY_PROFILES, updatedProfiles, vscode.ConfigurationTarget.Global);

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
   * @param {IProfile[keyof IProfile]} value The new value.
   * @private
   */
  private static async updateProfileSetting(key: string, value: IProfile[keyof IProfile]) {
    const activeProfile = this.getActiveProfile();
    const profiles = this.getProfiles();

    // Get existing profile or create empty one - use hasOwnProperty for proper key check
    const existingProfile = Object.prototype.hasOwnProperty.call(profiles, activeProfile)
      ? profiles[activeProfile]
      : undefined;
    const profile: IProfile = existingProfile ? { ...existingProfile } : {};
    profile[key] = value;

    const updatedProfiles = { ...profiles, [activeProfile]: profile };
    await this.config.update(C.CONFIG_KEY_PROFILES, updatedProfiles, vscode.ConfigurationTarget.Global);
  }

  /**
   * Gets a string setting value, respecting the current profile.
   * @param {string} key The configuration key.
   * @param {string} defaultValue The default value if not found.
   * @returns {string} The value of the setting.
   * @private
   */
  private static getProfileSetting(key: string, defaultValue: string): string {
    const activeProfile = this.getActiveProfile();
    const profiles = this.getProfiles();

    // Check if profile exists using hasOwnProperty for proper key check
    if (Object.prototype.hasOwnProperty.call(profiles, activeProfile)) {
      const profile = profiles[activeProfile];
      const value = profile[key];
      if (typeof value === "string") {
        return value;
      }
    }

    // Fallback to global config for backward compatibility
    return this.config.get<string>(key, defaultValue);
  }

  /**
   * Gets an object setting value, respecting the current profile.
   * @param {string} key The configuration key.
   * @param {T} defaultValue The default value if not found.
   * @returns {T} The value of the setting.
   * @private
   */
  private static getProfileObjectSetting<T extends Record<string, unknown>>(key: string, defaultValue: T): T {
    const activeProfile = this.getActiveProfile();
    const profiles = this.getProfiles();

    // Check if profile exists using hasOwnProperty for proper key check
    if (Object.prototype.hasOwnProperty.call(profiles, activeProfile)) {
      const profile = profiles[activeProfile];
      const value = profile[key];
      if (typeof value === "object") {
        return value as T;
      }
    }

    // Fallback to global config for backward compatibility
    const globalValue = this.config.get<T | undefined>(key);
    return globalValue ?? defaultValue;
  }

  /**
   * Gets the currently configured accent color.
   * This method resolves the 'custom' option to its validated hex value,
   * ensuring a valid color is always returned for theme generation.
   * @returns {string} The active accent color value (e.g., "sapphire" or a hex code like "#89b4fa").
   */
  public static getAccent(): string {
    const accentSetting = this.getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);

    // If the user has selected "custom", the corresponding hex code must be fetched and validated.
    if (accentSetting === "custom") {
      const customColor = this.getProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

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
    return this.getProfileObjectSetting<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {});
  }

  /**
   * Gets the user-defined syntax color overrides from settings.json.
   * @returns {ISyntaxOverrides} The syntax overrides object. Returns an empty object if not set.
   */
  public static getSyntaxOverrides(): ISyntaxOverrides {
    return this.getProfileObjectSetting<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
  }

  /**
   * Gets the user-defined UI color overrides from settings.json.
   * @returns {IUiOverrides} The UI overrides object. Returns an empty object if not set.
   */
  public static getUiOverrides(): IUiOverrides {
    return this.getProfileObjectSetting<IUiOverrides>(C.CONFIG_KEY_UI_OVERRIDES, {});
  }

  /**
   * Gets the user-defined font style overrides from settings.json.
   * @returns {IFontStyleOverrides} The font style overrides object. Returns an empty object if not set.
   */
  public static getFontStyleOverrides(): IFontStyleOverrides {
    return this.getProfileObjectSetting<IFontStyleOverrides>(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, {});
  }

  /**
   * Gets the default font styles from the extension's package.json configuration.
   * @returns {IFontStyles} The default font styles object.
   * @private
   */
  private static getDefaultFontStyles(): IFontStyles {
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON as IExtensionPackageJson | undefined;
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

    // Build new font styles object, excluding keys that match defaults
    const filteredFontStyles: IFontStyles = {};

    // Add all existing styles that differ from defaults (excluding the key being updated)
    for (const [styleKey, styleValue] of Object.entries(currentFontStyles)) {
      if (styleKey !== key && styleValue !== defaultFontStyles[styleKey]) {
        filteredFontStyles[styleKey] = styleValue;
      }
    }

    // Add the new value if it differs from the default
    if (value !== defaultFontStyles[key]) {
      filteredFontStyles[key] = value;
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
    const currentFontStyles = this.getFontStyles();
    const defaultFontStyles = this.getDefaultFontStyles();

    // Build new font styles object, excluding the key being reset and keys that match defaults
    const filteredFontStyles: IFontStyles = {};
    for (const [styleKey, styleValue] of Object.entries(currentFontStyles)) {
      if (styleKey !== key && styleValue !== defaultFontStyles[styleKey]) {
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
    // Clone the settings object to create a mutable copy
    const overrides = cloneOverrides(this.getSyntaxOverrides());
    const existingFlavor = Object.prototype.hasOwnProperty.call(overrides, flavor) ? overrides[flavor] : undefined;
    const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
    flavorOverrides[key] = value;
    const updatedOverrides: ISyntaxOverrides = { ...overrides, [flavor]: flavorOverrides };
    await this.updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, updatedOverrides);
  }

  /**
   * Resets a specific syntax color override for a given flavor.
   * @param {string} flavor The theme flavor.
   * @param {string} key The syntax key.
   */
  public static async resetSyntaxColor(flavor: string, key: string) {
    const overrides = this.getSyntaxOverrides();
    const finalOverrides = removeOverrideKey(overrides, flavor, key);
    await this.updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, finalOverrides);
  }

  /**
   * Updates a specific UI color override for a given flavor.
   * @param {string} flavor The theme flavor.
   * @param {string} key The UI key (e.g., "base").
   * @param {string} value The new hex color value.
   */
  public static async updateUiColor(flavor: string, key: string, value: string) {
    const overrides = cloneOverrides(this.getUiOverrides());
    const existingFlavor = Object.prototype.hasOwnProperty.call(overrides, flavor) ? overrides[flavor] : undefined;
    const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
    flavorOverrides[key] = value;
    const updatedOverrides: IUiOverrides = { ...overrides, [flavor]: flavorOverrides };
    await this.updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, updatedOverrides);
  }

  /**
   * Resets a specific UI color override for a given flavor.
   * @param {string} flavor The theme flavor.
   * @param {string} key The UI key.
   */
  public static async resetUiColor(flavor: string, key: string) {
    const overrides = this.getUiOverrides();
    const finalOverrides = removeOverrideKey(overrides, flavor, key);
    await this.updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, finalOverrides);
  }

  /**
   * Updates a specific font style override for a flavor in the user's global settings.json.
   * @param {string} flavor The theme flavor (e.g., "mocha").
   * @param {string} key The font style key to update (e.g., "commentFontStyle").
   * @param {string} value The new font style value (e.g., "italic").
   */
  public static async updateFontStyleOverride(flavor: string, key: string, value: string) {
    const fontStyleOverrides = cloneOverrides(this.getFontStyleOverrides());
    const defaultFontStyles = this.getDefaultFontStyles();

    // Only save if the value differs from the default
    if (value !== defaultFontStyles[key]) {
      const existingFlavor = Object.prototype.hasOwnProperty.call(fontStyleOverrides, flavor)
        ? fontStyleOverrides[flavor]
        : undefined;
      const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
      flavorOverrides[key] = value;
      const updatedOverrides: IFontStyleOverrides = { ...fontStyleOverrides, [flavor]: flavorOverrides };
      await this.updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, updatedOverrides);
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
    const overrides = this.getFontStyleOverrides();
    const finalOverrides = removeOverrideKey(overrides, flavor, key);
    await this.updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, finalOverrides);
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
    const flavor = parseFlavorFromThemeName(themeName);

    if (flavor && isFlavor(flavor)) {
      return flavor;
    }
    return "mocha"; // Default fallback
  }

  /**
   * Gathers all settings required by the webview into a single object.
   * This method is optimized to read the VS Code configuration once and reuse it
   * for all internal lookups, reducing redundant configuration API calls.
   * @returns {ISettingsPayload} The complete settings payload for the webview.
   */
  public static getWebViewSettings(): ISettingsPayload {
    // Cache the configuration snapshot once to avoid repeated VS Code API calls.
    const configSnapshot = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON as IExtensionPackageJson | undefined;

    // Get profiles from cached config
    const rawProfiles: unknown = configSnapshot.get(C.CONFIG_KEY_PROFILES);
    let profiles: { [name: string]: IProfile };
    if (typeof rawProfiles !== "object" || rawProfiles === null || Array.isArray(rawProfiles)) {
      profiles = { Default: {} };
    } else {
      profiles = rawProfiles as { [name: string]: IProfile };
      if (!Object.prototype.hasOwnProperty.call(profiles, "Default")) {
        profiles = { ...profiles, Default: {} };
      }
    }

    const activeProfile = configSnapshot.get(C.CONFIG_KEY_ACTIVE_PROFILE, "Default");
    const profile = Object.prototype.hasOwnProperty.call(profiles, activeProfile) ? profiles[activeProfile] : {};

    // Helper to get string setting from profile with fallback to global config
    const getProfileString = (key: string, defaultValue: string): string => {
      const value = profile[key];
      if (typeof value === "string") return value;
      return configSnapshot.get<string>(key, defaultValue);
    };

    // Helper to get object setting from profile with fallback to global config
    const getProfileObject = <T extends Record<string, unknown>>(key: string, defaultValue: T): T => {
      const value = profile[key];
      if (typeof value === "object") return value as T;
      const globalValue = configSnapshot.get<T | undefined>(key);
      return globalValue ?? defaultValue;
    };

    // Get active flavor from workbench config
    const themeName = workbenchConfig.get<string>("colorTheme", "");
    let activeFlavor: keyof typeof palettes = "mocha";
    const parsedFlavor = parseFlavorFromThemeName(themeName);
    if (parsedFlavor && parsedFlavor in palettes) {
      activeFlavor = parsedFlavor as keyof typeof palettes;
    }

    // Get all settings using cached helpers
    const fontStyles = getProfileObject<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {});
    const syntaxOverrides = getProfileObject<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
    const uiOverrides = getProfileObject<IUiOverrides>(C.CONFIG_KEY_UI_OVERRIDES, {});
    const fontStyleOverrides = getProfileObject<IFontStyleOverrides>(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, {});
    const currentAccent = getProfileString(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const customAccentColor = getProfileString(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

    const defaultFontStyles = extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`]?.default ?? {};
    const accentOptions: string[] =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];

    const defaultPalette = palettes[activeFlavor];
    const overrideSyntaxPalette = syntaxOverrides[activeFlavor] ?? {};
    const overrideUiPalette = uiOverrides[activeFlavor] ?? {};
    const overrideFontStylePalette = fontStyleOverrides[activeFlavor] ?? {};
    const activeThemeBackgroundColor = defaultPalette.crust;

    const accentColorPalettes = accentOptions.reduce<{ [key: string]: string }>((acc, option) => {
      if (defaultPalette[option]) {
        acc[option] = defaultPalette[option];
      }
      return acc;
    }, {});

    const syntaxSettings = CUSTOMIZABLE_SYNTAX_KEYS.map(
      (key): IWebviewSetting => ({
        key: key,
        fontStyle: overrideFontStylePalette[`${key}FontStyle`] || fontStyles[`${key}FontStyle`] || "none",
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
        fontStyle: overrideFontStylePalette[`${key}FontStyle`] || fontStyles[`${key}FontStyle`] || "none",
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
