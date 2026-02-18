/**
 * @file Core configuration primitives for accessing VS Code settings.
 * Provides low-level helpers shared by all other config modules.
 */

import * as vscode from "vscode";
import * as C from "../constants";
import palettes, { IPalettes } from "../palettes";
import { IProfile } from "../../types/webview";

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
export interface IExtensionPackageJson {
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
export function isFlavor(key: string): key is keyof IPalettes {
  return key in palettes;
}

/**
 * Creates a deep clone of a nested overrides object.
 * @param obj The object to clone.
 * @returns A deep copy of the object.
 */
export function cloneOverrides<T extends Record<string, Record<string, string>>>(obj: T): T {
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
export function removeOverrideKey<T extends { [flavor: string]: { [key: string]: string } | undefined }>(
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
 * Gets the VS Code configuration object scoped to the Calmppuccin extension.
 */
export function getConfig() {
  return vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
}

/**
 * Gets the user-defined profiles from settings.json.
 * @returns {{ [name: string]: IProfile }} The profiles object.
 */
export function getProfiles(): { [name: string]: IProfile } {
  // Get profiles with unknown type for runtime safety validation
  const rawProfiles: unknown = getConfig().get(C.CONFIG_KEY_PROFILES);

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
 * Gets the name of the currently active profile.
 * @returns {string} The active profile name.
 */
export function getActiveProfile(): string {
  return getConfig().get(C.CONFIG_KEY_ACTIVE_PROFILE, "Default");
}

/**
 * Gets a string setting value, respecting the current profile.
 * @param {string} key The configuration key.
 * @param {string} defaultValue The default value if not found.
 * @returns {string} The value of the setting.
 */
export function getProfileSetting(key: string, defaultValue: string): string {
  const activeProfile = getActiveProfile();
  const profiles = getProfiles();

  // Check if profile exists using hasOwnProperty for proper key check
  if (Object.prototype.hasOwnProperty.call(profiles, activeProfile)) {
    const profile = profiles[activeProfile];
    const value = profile[key];
    if (typeof value === "string") {
      return value;
    }
  }

  // Fallback to global config for backward compatibility
  return getConfig().get<string>(key, defaultValue);
}

/**
 * Gets an object setting value, respecting the current profile.
 * @param {string} key The configuration key.
 * @param {T} defaultValue The default value if not found.
 * @returns {T} The value of the setting.
 */
export function getProfileObjectSetting<T extends Record<string, unknown>>(key: string, defaultValue: T): T {
  const activeProfile = getActiveProfile();
  const profiles = getProfiles();

  // Check if profile exists using hasOwnProperty for proper key check
  if (Object.prototype.hasOwnProperty.call(profiles, activeProfile)) {
    const profile = profiles[activeProfile];
    // Cast to unknown for runtime safety — user-edited JSON may contain null.
    const value: unknown = profile[key];
    if (typeof value === "object" && value !== null) {
      return value as T;
    }
  }

  // Fallback to global config for backward compatibility
  const globalValue = getConfig().get<T | undefined>(key);
  return globalValue ?? defaultValue;
}

/**
 * Updates a setting, respecting the current profile.
 * @param {string} key The configuration key.
 * @param {IProfile[keyof IProfile]} value The new value.
 */
export async function updateProfileSetting(key: string, value: IProfile[keyof IProfile]) {
  const activeProfile = getActiveProfile();
  const profiles = getProfiles();

  // Get existing profile or create empty one - use hasOwnProperty for proper key check
  const existingProfile = Object.prototype.hasOwnProperty.call(profiles, activeProfile)
    ? profiles[activeProfile]
    : undefined;
  const profile: IProfile = existingProfile ? { ...existingProfile } : {};
  profile[key] = value;

  const updatedProfiles = { ...profiles, [activeProfile]: profile };
  await getConfig().update(C.CONFIG_KEY_PROFILES, updatedProfiles, vscode.ConfigurationTarget.Global);
}

/**
 * Gets the default font styles from the extension's package.json configuration.
 * @returns {IFontStyles} The default font styles object.
 */
export function getDefaultFontStyles(): IFontStyles {
  const extensionConfig = vscode.extensions.getExtension(C.EXTENSION_ID)?.packageJSON as IExtensionPackageJson | undefined;
  return extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`]?.default ?? {};
}
