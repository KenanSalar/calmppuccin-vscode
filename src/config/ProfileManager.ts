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
  getProfileObjectSetting,
  customizedFontStyles,
  FlavorOverrides,
  IFontStyles,
} from "./ConfigAccess";
import { getFontStyles } from "./SettingsReader";

export async function updateActiveProfile(profileName: string) {
  await getConfig().update(
    C.CONFIG_KEY_ACTIVE_PROFILE,
    profileName,
    vscode.ConfigurationTarget.Global,
  );
}

/** Saves what the active profile resolves to as `profileName`, minus values left at default. */
export async function saveProfile(profileName: string) {
  const savedProfile: IProfile = {};

  const accent = getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  if (accent !== C.DEFAULT_ACCENT) {
    savedProfile[C.CONFIG_KEY_ACCENT] = accent;
  }

  const customAccent = getProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);
  if (customAccent !== C.DEFAULT_CUSTOM_ACCENT) {
    savedProfile[C.CONFIG_KEY_CUSTOM_ACCENT] = customAccent;
  }

  const fontStyles = customizedFontStyles(getFontStyles());
  if (Object.keys(fontStyles).length > 0) {
    savedProfile[C.CONFIG_KEY_FONT_STYLES] = fontStyles;
  }

  for (const key of C.OVERRIDE_SETTING_KEYS) {
    const overrides = getProfileObjectSetting<FlavorOverrides>(key, {});
    if (Object.keys(overrides).length > 0) {
      savedProfile[key] = overrides;
    }
  }

  const updatedProfiles = { ...getProfiles(), [profileName]: savedProfile };
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
  if (profileName === C.DEFAULT_PROFILE_NAME) return;

  const profiles = getProfiles();
  const { [profileName]: _removed, ...remainingProfiles } = profiles;
  const customProfileNames = Object.keys(remainingProfiles).filter(
    (name) => name !== C.DEFAULT_PROFILE_NAME,
  );

  let finalProfiles: { [name: string]: IProfile };
  if (customProfileNames.length > 0) {
    finalProfiles = remainingProfiles;
  } else {
    const defaultProfile = remainingProfiles[C.DEFAULT_PROFILE_NAME];
    if (Object.keys(defaultProfile).length > 0) {
      finalProfiles = { [C.DEFAULT_PROFILE_NAME]: defaultProfile };
    } else {
      finalProfiles = {};
    }
  }

  await getConfig().update(C.CONFIG_KEY_PROFILES, finalProfiles, vscode.ConfigurationTarget.Global);
  await updateActiveProfile(C.DEFAULT_PROFILE_NAME);
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

    if (profileName === C.DEFAULT_PROFILE_NAME) {
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
  const profiles = getProfiles(config);
  const defaultProfile = profiles[C.DEFAULT_PROFILE_NAME];
  let needsUpdate = false;

  const globalFontStyles = config.get<IFontStyles | undefined>(C.CONFIG_KEY_FONT_STYLES);
  if (globalFontStyles && !defaultProfile.fontStyles) {
    const fontStyles = customizedFontStyles(globalFontStyles);
    if (Object.keys(fontStyles).length > 0) {
      defaultProfile.fontStyles = fontStyles;
      needsUpdate = true;
    }
  }

  // An override has no default to compare with: any entry is a customization.
  for (const key of C.OVERRIDE_SETTING_KEYS) {
    const globalOverrides = config.get<FlavorOverrides | undefined>(key);
    if (globalOverrides && Object.keys(globalOverrides).length > 0 && !defaultProfile[key]) {
      defaultProfile[key] = globalOverrides;
      needsUpdate = true;
    }
  }

  const globalAccent = config.get<string | undefined>(C.CONFIG_KEY_ACCENT);
  if (globalAccent && globalAccent !== C.DEFAULT_ACCENT && !defaultProfile.accent) {
    defaultProfile.accent = globalAccent;
    needsUpdate = true;
  }

  const globalCustomAccent = config.get<string | undefined>(C.CONFIG_KEY_CUSTOM_ACCENT);
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
