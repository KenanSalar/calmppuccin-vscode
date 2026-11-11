/**
 * @file The settings primitives the other `src/config/` modules build on: profile reads and
 * writes, and the defaults `package.json` contributes.
 */

import * as vscode from "vscode";
import { IProfile } from "../../types/webview";
import * as C from "../constants";
import palettes, { IPalettes } from "../palettes";

/** `calmppuccin.fontStyles`, keyed `<token>FontStyle`. */
export interface IFontStyles {
  [key: string]: string;
}

/** `calmppuccin.syntaxOverrides`: colors by flavor, then token. */
export interface ISyntaxOverrides {
  [flavor: string]: {
    [token: string]: string;
  };
}

/** `calmppuccin.uiOverrides`: colors by flavor, then UI key. */
export interface IUiOverrides {
  [flavor: string]: {
    [token: string]: string;
  };
}

/** `calmppuccin.fontStyleOverrides`: styles by flavor, then `<token>FontStyle` key. */
export interface IFontStyleOverrides {
  [flavor: string]: {
    [fontStyleKey: string]: string;
  };
}

/** The part of `package.json` the contributed defaults are read from. */
export interface IExtensionPackageJson {
  contributes?: {
    configuration?: {
      properties?: Record<string, { default?: IFontStyles; enum?: string[] }>;
    };
  };
}

export function isFlavor(key: string): key is keyof IPalettes {
  return Object.hasOwn(palettes, key);
}

/** Copies an overrides object two levels deep, which is as deep as one goes. */
export function cloneOverrides<T extends Record<string, Record<string, string>>>(obj: T): T {
  const result: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = { ...value };
  }
  return result as T;
}

/**
 * Returns `overrides` without `flavor`'s `key`, dropping the flavor once it's empty. Returns
 * `undefined` when nothing is left, which clears the setting, and `overrides` itself when the key
 * isn't there.
 */
export function removeOverrideKey<
  T extends { [flavor: string]: { [key: string]: string } | undefined },
>(overrides: T, flavor: string, key: string): T | undefined {
  const flavorOverrides = overrides[flavor];
  if (!flavorOverrides || !(key in flavorOverrides)) {
    return overrides;
  }

  const newFlavorOverrides: Record<string, string> = {};
  for (const [k, v] of Object.entries(flavorOverrides)) {
    if (k !== key) {
      newFlavorOverrides[k] = v;
    }
  }

  const newOverrides: { [f: string]: { [k: string]: string } | undefined } = {};
  for (const [f, v] of Object.entries(overrides)) {
    if (f !== flavor) {
      newOverrides[f] = v;
    } else if (Object.keys(newFlavorOverrides).length > 0) {
      newOverrides[f] = newFlavorOverrides;
    }
  }

  return Object.keys(newOverrides).length === 0 ? undefined : (newOverrides as T);
}

/** A fresh snapshot of the `calmppuccin` settings; one taken before an `update` doesn't see it. */
export function getConfig() {
  return vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
}

export function getProfiles(): { [name: string]: IProfile } {
  return toProfiles(getConfig().get(C.CONFIG_KEY_PROFILES));
}

/**
 * Narrows the user-edited `calmppuccin.profiles` value to its profiles, guaranteeing `Default`.
 * An entry that isn't an object, such as `"Default": null`, is dropped.
 */
export function toProfiles(rawProfiles: unknown): { [name: string]: IProfile } {
  const profiles: { [name: string]: IProfile } = {};
  if (isPlainObject(rawProfiles)) {
    for (const [name, profile] of Object.entries(rawProfiles)) {
      if (isPlainObject(profile)) {
        // Only the entry is checked: each reader tests the type of the value it takes.
        profiles[name] = profile as IProfile;
      }
    }
  }
  if (!Object.hasOwn(profiles, "Default")) {
    profiles.Default = {};
  }
  return profiles;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getActiveProfile(): string {
  return getConfig().get(C.CONFIG_KEY_ACTIVE_PROFILE, "Default");
}

/** Reads `key` from the active profile, then from the legacy top-level setting. */
export function getProfileSetting(key: string, defaultValue: string): string {
  const activeProfile = getActiveProfile();
  const profiles = getProfiles();

  if (Object.prototype.hasOwnProperty.call(profiles, activeProfile)) {
    const profile = profiles[activeProfile];
    const value = profile[key];
    if (typeof value === "string") {
      return value;
    }
  }

  return getConfig().get<string>(key, defaultValue);
}

/** {@link getProfileSetting} for an object setting. */
export function getProfileObjectSetting<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
): T {
  const activeProfile = getActiveProfile();
  const profiles = getProfiles();

  if (Object.prototype.hasOwnProperty.call(profiles, activeProfile)) {
    const profile = profiles[activeProfile];
    // The profile is user-edited JSON, so the value can be null or any other type.
    const value: unknown = profile[key];
    if (typeof value === "object" && value !== null) {
      return value as T;
    }
  }

  const globalValue = getConfig().get<T | undefined>(key);
  return globalValue ?? defaultValue;
}

/** Writes `key` into the active profile, creating the profile when it's missing. */
export async function updateProfileSetting(key: string, value: IProfile[keyof IProfile]) {
  const activeProfile = getActiveProfile();
  const profiles = getProfiles();

  const existingProfile = Object.prototype.hasOwnProperty.call(profiles, activeProfile)
    ? profiles[activeProfile]
    : undefined;
  const profile: IProfile = existingProfile ? { ...existingProfile } : {};
  profile[key] = value;

  const updatedProfiles = { ...profiles, [activeProfile]: profile };
  await getConfig().update(
    C.CONFIG_KEY_PROFILES,
    updatedProfiles,
    vscode.ConfigurationTarget.Global,
  );
}

/** The `calmppuccin.fontStyles` default `package.json` contributes. */
export function getDefaultFontStyles(): IFontStyles {
  return getContributedSetting(C.CONFIG_KEY_FONT_STYLES)?.default ?? {};
}

/**
 * Gets the accent names `calmppuccin.accent` accepts, `custom` included.
 */
export function getAccentOptions(): string[] {
  return getContributedSetting(C.CONFIG_KEY_ACCENT)?.enum ?? [];
}

function getContributedSetting(key: string) {
  const extensionConfig = vscode.extensions.getExtension(C.EXTENSION_ID)?.packageJSON as
    | IExtensionPackageJson
    | undefined;
  return extensionConfig?.contributes?.configuration?.properties?.[
    `${C.EXTENSION_NAMESPACE}.${key}`
  ];
}
