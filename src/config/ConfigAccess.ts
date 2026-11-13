/**
 * @file The settings primitives the other `src/config/` modules build on: profile reads and
 * writes, and the defaults `package.json` contributes.
 */

import * as vscode from "vscode";
import { IProfile } from "../../types/webview";
import * as C from "../constants";

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

export type FlavorOverrides = Record<string, Record<string, string>>;

/** The part of `package.json` the contributed defaults are read from. */
export interface IExtensionPackageJson {
  contributes?: {
    configuration?: {
      properties?: Record<string, { default?: IFontStyles; enum?: string[] }>;
    };
  };
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
  if (!flavorOverrides || !Object.hasOwn(flavorOverrides, key)) {
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

/** Whether `event` changes a setting in `THEME_AFFECTING_KEYS`. */
export function affectsThemeSettings(event: vscode.ConfigurationChangeEvent): boolean {
  return C.THEME_AFFECTING_KEYS.some((key) =>
    event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${key}`),
  );
}

export function getProfiles(config = getConfig()): { [name: string]: IProfile } {
  return toProfiles(config.get(C.CONFIG_KEY_PROFILES));
}

/**
 * Narrows the user-edited `calmppuccin.profiles` value to its profiles, guaranteeing `Default`.
 * An entry that isn't an object, such as `"Default": null`, is dropped.
 */
export function toProfiles(rawProfiles: unknown): { [name: string]: IProfile } {
  const entries = isPlainObject(rawProfiles) ? Object.entries(rawProfiles) : [];
  // Only the entry is checked: each reader tests the type of the value it takes. `fromEntries`
  // keeps a profile named `__proto__`, which assigning it would turn into the prototype.
  const profiles: { [name: string]: IProfile } = Object.fromEntries(
    entries.filter((entry): entry is [string, IProfile] => isPlainObject(entry[1])),
  );
  if (!Object.hasOwn(profiles, C.DEFAULT_PROFILE_NAME)) {
    profiles[C.DEFAULT_PROFILE_NAME] = {};
  }
  return profiles;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getActiveProfile(config = getConfig()): string {
  return config.get(C.CONFIG_KEY_ACTIVE_PROFILE, C.DEFAULT_PROFILE_NAME);
}

/** Reads `key` from the active profile, then from the legacy top-level setting. */
export function getProfileSetting(key: string, defaultValue: string, config = getConfig()): string {
  const value = getActiveProfileEntry(config)[key];
  if (typeof value === "string") {
    return value;
  }
  return config.get<string>(key, defaultValue);
}

/** {@link getProfileSetting} for an object setting. */
export function getProfileObjectSetting<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
  config = getConfig(),
): T {
  // The profile is user-edited JSON, so the value can be null or any other type.
  const value: unknown = getActiveProfileEntry(config)[key];
  if (typeof value === "object" && value !== null) {
    return value as T;
  }
  return config.get<T | undefined>(key) ?? defaultValue;
}

function getActiveProfileEntry(config: vscode.WorkspaceConfiguration): IProfile {
  const profiles = getProfiles(config);
  const activeProfile = getActiveProfile(config);
  return Object.hasOwn(profiles, activeProfile) ? profiles[activeProfile] : {};
}

/** Writes `key` into the active profile, creating the profile when it's missing. */
export async function updateProfileSetting(key: string, value: IProfile[keyof IProfile]) {
  const activeProfile = getActiveProfile();
  const profiles = getProfiles();

  const existingProfile = Object.hasOwn(profiles, activeProfile)
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

/** The styles in `fontStyles` that differ from the contributed defaults. */
export function customizedFontStyles(fontStyles: IFontStyles): IFontStyles {
  const defaults = getDefaultFontStyles();
  return Object.fromEntries(
    Object.entries(fontStyles).filter(([key, value]) => defaults[key] !== value),
  );
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
