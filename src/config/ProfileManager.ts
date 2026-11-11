/**
 * @file Saving, switching, deleting and resetting profiles, and moving the legacy top-level
 * settings into `Default`.
 */

import * as vscode from "vscode";
import { IProfile } from "../../types/webview";
import * as C from "../constants";
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

export async function updateActiveProfile(profileName: string) {
  await getConfig().update(
    C.CONFIG_KEY_ACTIVE_PROFILE,
    profileName,
    vscode.ConfigurationTarget.Global,
  );
}

/** Saves what the active profile resolves to as `profileName`, minus values left at default. */
export async function saveProfile(profileName: string) {
  const profiles = getProfiles();

  const currentFontStyles = getFontStyles();
  const defaultFontStyles = getDefaultFontStyles();
  const customizedFontStyles: IFontStyles = {};
  for (const [key, value] of Object.entries(currentFontStyles)) {
    if (defaultFontStyles[key] !== value) {
      customizedFontStyles[key] = value;
    }
  }

  const currentAccent = getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  const currentCustomAccent = getProfileSetting(
    C.CONFIG_KEY_CUSTOM_ACCENT,
    C.DEFAULT_CUSTOM_ACCENT,
  );

  const currentSettings: IProfile = {};
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

  const updatedProfiles = { ...profiles, [profileName]: currentSettings };
  await getConfig().update(
    C.CONFIG_KEY_PROFILES,
    updatedProfiles,
    vscode.ConfigurationTarget.Global,
  );
}

/**
 * Deletes a profile other than `Default` and switches to `Default`. With no other profile left,
 * an empty `Default` goes too, clearing the setting.
 */
export async function deleteProfile(profileName: string) {
  if (profileName === "Default") return;

  const profiles = getProfiles();
  const { [profileName]: _removed, ...remainingProfiles } = profiles;
  const customProfileNames = Object.keys(remainingProfiles).filter((name) => name !== "Default");

  let finalProfiles: { [name: string]: IProfile };
  if (customProfileNames.length > 0) {
    finalProfiles = remainingProfiles;
  } else {
    const defaultProfile = remainingProfiles["Default"];
    if (Object.keys(defaultProfile).length > 0) {
      finalProfiles = { Default: defaultProfile };
    } else {
      finalProfiles = {};
    }
  }

  await getConfig().update(C.CONFIG_KEY_PROFILES, finalProfiles, vscode.ConfigurationTarget.Global);
  await updateActiveProfile("Default");
}

/** Empties a profile; emptying `Default` also clears the legacy top-level settings. */
export async function resetProfile(profileName: string) {
  const currentProfiles = getProfiles();

  if (Object.hasOwn(currentProfiles, profileName)) {
    const updatedProfiles = { ...currentProfiles, [profileName]: {} };
    await getConfig().update(
      C.CONFIG_KEY_PROFILES,
      updatedProfiles,
      vscode.ConfigurationTarget.Global,
    );

    if (profileName === "Default") {
      await clearLegacySettings();
    }
  }
}

export async function resetAll() {
  const activeProfile = getActiveProfile();
  await resetProfile(activeProfile);
}

/**
 * Moves the legacy top-level settings into `Default` and clears them. A value left at its default
 * isn't moved, and one `Default` already holds isn't overwritten; with nothing to move, nothing
 * is written.
 */
export async function migrateGlobalSettingsToDefault() {
  const config = getConfig();
  const profiles = getProfiles();
  let needsUpdate = false;
  const defaultProfile: IProfile = profiles.Default;

  const globalFontStyles = config.get<IFontStyles | undefined>(C.CONFIG_KEY_FONT_STYLES);
  const globalFontStyleOverrides = config.get<IFontStyleOverrides | undefined>(
    C.CONFIG_KEY_FONT_STYLE_OVERRIDES,
  );
  const globalSyntaxOverrides = config.get<ISyntaxOverrides | undefined>(
    C.CONFIG_KEY_SYNTAX_OVERRIDES,
  );
  const globalUiOverrides = config.get<IUiOverrides | undefined>(C.CONFIG_KEY_UI_OVERRIDES);
  const globalAccent = config.get<string | undefined>(C.CONFIG_KEY_ACCENT);
  const globalCustomAccent = config.get<string | undefined>(C.CONFIG_KEY_CUSTOM_ACCENT);

  if (globalFontStyles && !defaultProfile.fontStyles) {
    const defaults = getDefaultFontStyles();
    const customizedStyles: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(globalFontStyles)) {
      if (defaults[key] !== value) {
        customizedStyles[key] = value;
      }
    }
    if (Object.keys(customizedStyles).length > 0) {
      defaultProfile.fontStyles = customizedStyles;
      needsUpdate = true;
    }
  }

  // An override has no default to compare with: any entry is a customization.
  if (
    globalFontStyleOverrides &&
    Object.keys(globalFontStyleOverrides).length > 0 &&
    !defaultProfile.fontStyleOverrides
  ) {
    defaultProfile.fontStyleOverrides = globalFontStyleOverrides;
    needsUpdate = true;
  }

  if (
    globalSyntaxOverrides &&
    Object.keys(globalSyntaxOverrides).length > 0 &&
    !defaultProfile.syntaxOverrides
  ) {
    defaultProfile.syntaxOverrides = globalSyntaxOverrides;
    needsUpdate = true;
  }

  if (
    globalUiOverrides &&
    Object.keys(globalUiOverrides).length > 0 &&
    !defaultProfile.uiOverrides
  ) {
    defaultProfile.uiOverrides = globalUiOverrides;
    needsUpdate = true;
  }

  if (globalAccent && globalAccent !== C.DEFAULT_ACCENT && !defaultProfile.accent) {
    defaultProfile.accent = globalAccent;
    needsUpdate = true;
  }

  if (
    globalCustomAccent &&
    globalCustomAccent !== C.DEFAULT_CUSTOM_ACCENT &&
    !defaultProfile.customAccentColor
  ) {
    defaultProfile.customAccentColor = globalCustomAccent;
    needsUpdate = true;
  }

  if (needsUpdate) {
    await config.update(C.CONFIG_KEY_PROFILES, profiles, vscode.ConfigurationTarget.Global);
    await clearLegacySettings();
  }
}

/** The top-level settings that predate profiles, which every read still falls back to. */
const LEGACY_KEYS = [
  C.CONFIG_KEY_FONT_STYLES,
  C.CONFIG_KEY_FONT_STYLE_OVERRIDES,
  C.CONFIG_KEY_SYNTAX_OVERRIDES,
  C.CONFIG_KEY_UI_OVERRIDES,
  C.CONFIG_KEY_ACCENT,
  C.CONFIG_KEY_CUSTOM_ACCENT,
] as const;

async function clearLegacySettings() {
  const config = getConfig();
  for (const key of LEGACY_KEYS) {
    await config.update(key, undefined, vscode.ConfigurationTarget.Global);
  }
}
