/**
 * @file Profile CRUD operations and legacy settings migration.
 * Handles profile creation, deletion, reset, and migration from global settings.
 */

import * as vscode from "vscode";
import * as C from "../constants";
import { IProfile } from "../../types/webview";
import {
  getConfig,
  getProfiles,
  getActiveProfile,
  getProfileSetting,
  getDefaultFontStyles,
  IFontStyles,
  IFontStyleOverrides,
  ISyntaxOverrides,
  IUiOverrides,
} from "./ConfigAccess";
import {
  getFontStyles,
  getSyntaxOverrides,
  getUiOverrides,
  getFontStyleOverrides,
} from "./SettingsReader";

/**
 * Updates the active profile setting.
 * @param {string} profileName The name of the profile to set as active.
 */
export async function updateActiveProfile(profileName: string) {
  await getConfig().update(C.CONFIG_KEY_ACTIVE_PROFILE, profileName, vscode.ConfigurationTarget.Global);
}

/**
 * Saves the current configuration as a new profile.
 * @param {string} profileName The name for the new profile.
 */
export async function saveProfile(profileName: string) {
  const profiles = getProfiles();

  // Get current font styles and filter out defaults
  const currentFontStyles = getFontStyles();
  const defaultFontStyles = getDefaultFontStyles();
  const customizedFontStyles: IFontStyles = {};

  // Only include font styles that differ from defaults
  for (const [key, value] of Object.entries(currentFontStyles)) {
    if (defaultFontStyles[key] !== value) {
      customizedFontStyles[key] = value;
    }
  }

  // Get current accent and custom accent, only include if different from defaults
  const currentAccent = getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  const currentCustomAccent = getProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

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

  const syntaxOverrides = getSyntaxOverrides();
  if (Object.keys(syntaxOverrides).length > 0) {
    currentSettings[C.CONFIG_KEY_SYNTAX_OVERRIDES] = syntaxOverrides;
  }

  const uiOverrides = getUiOverrides();
  if (Object.keys(uiOverrides).length > 0) {
    currentSettings[C.CONFIG_KEY_UI_OVERRIDES] = uiOverrides;
  }

  const fontStyleOverrides = getFontStyleOverrides();
  if (Object.keys(fontStyleOverrides).length > 0) {
    currentSettings[C.CONFIG_KEY_FONT_STYLE_OVERRIDES] = fontStyleOverrides;
  }

  profiles[profileName] = currentSettings;
  await getConfig().update(C.CONFIG_KEY_PROFILES, profiles, vscode.ConfigurationTarget.Global);
}

/**
 * Deletes a specified profile.
 * @param {string} profileName The name of the profile to delete.
 */
export async function deleteProfile(profileName: string) {
  if (profileName === "Default") return; // Cannot delete the default profile

  const profiles = getProfiles();

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

  await getConfig().update(C.CONFIG_KEY_PROFILES, finalProfiles, vscode.ConfigurationTarget.Global);
  await updateActiveProfile("Default"); // Switch back to default
}

/**
 * Resets the settings for a specific profile.
 * @param {string} profileName The name of the profile to reset.
 */
export async function resetProfile(profileName: string) {
  const currentProfiles = getProfiles();

  if (Object.prototype.hasOwnProperty.call(currentProfiles, profileName)) {
    // Clear all settings but keep the profile (works for both Default and custom profiles)
    const updatedProfiles = { ...currentProfiles, [profileName]: {} };
    await getConfig().update(C.CONFIG_KEY_PROFILES, updatedProfiles, vscode.ConfigurationTarget.Global);

    // If resetting Default profile, also clear any legacy global settings for cleanup
    if (profileName === "Default") {
      await getConfig().update(C.CONFIG_KEY_FONT_STYLES, undefined, vscode.ConfigurationTarget.Global);
      await getConfig().update(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
      await getConfig().update(C.CONFIG_KEY_SYNTAX_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
      await getConfig().update(C.CONFIG_KEY_UI_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
      await getConfig().update(C.CONFIG_KEY_ACCENT, undefined, vscode.ConfigurationTarget.Global);
    }
  }
}

/**
 * Resets all user-defined settings for the current active profile to their default values.
 */
export async function resetAll() {
  const activeProfile = getActiveProfile();
  await resetProfile(activeProfile);
}

/**
 * Migrates existing global settings to the Default profile if they exist outside profiles.
 * Only migrates settings that are different from defaults.
 * This should be called once when the extension activates.
 */
export async function migrateGlobalSettingsToDefault() {
  const config = getConfig();
  const profiles = getProfiles();
  let needsUpdate = false;
  const defaultProfile: IProfile = profiles.Default;

  // Get global settings with explicit types
  const globalFontStyles = config.get<IFontStyles | undefined>(C.CONFIG_KEY_FONT_STYLES);
  const globalFontStyleOverrides = config.get<IFontStyleOverrides | undefined>(C.CONFIG_KEY_FONT_STYLE_OVERRIDES);
  const globalSyntaxOverrides = config.get<ISyntaxOverrides | undefined>(C.CONFIG_KEY_SYNTAX_OVERRIDES);
  const globalUiOverrides = config.get<IUiOverrides | undefined>(C.CONFIG_KEY_UI_OVERRIDES);
  const globalAccent = config.get<string | undefined>(C.CONFIG_KEY_ACCENT);
  const globalCustomAccent = config.get<string | undefined>(C.CONFIG_KEY_CUSTOM_ACCENT);

  // Only migrate fontStyles if they contain non-default values
  if (globalFontStyles && !defaultProfile.fontStyles) {
    const defaults = getDefaultFontStyles();
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
    await config.update(C.CONFIG_KEY_PROFILES, profiles, vscode.ConfigurationTarget.Global);

    // Clean up the old global settings after migration
    await config.update(C.CONFIG_KEY_FONT_STYLES, undefined, vscode.ConfigurationTarget.Global);
    await config.update(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
    await config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
    await config.update(C.CONFIG_KEY_UI_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
    await config.update(C.CONFIG_KEY_ACCENT, undefined, vscode.ConfigurationTarget.Global);
    await config.update(C.CONFIG_KEY_CUSTOM_ACCENT, undefined, vscode.ConfigurationTarget.Global);
  }
}
