/** @file Assembles the `ISettingsPayload` the webview builds its controls from. */

import * as vscode from "vscode";
import { ISettingsPayload, IWebviewSetting, IProfile } from "../../types/webview";
import * as C from "../constants";
import {
  CUSTOMIZABLE_BRACKET_KEYS,
  CUSTOMIZABLE_JSON_KEYS,
  CUSTOMIZABLE_SYNTAX_KEYS,
  CUSTOMIZABLE_UI_KEYS,
  parseFlavorFromThemeName,
} from "../constants";
import palettes from "../palettes";
import {
  IExtensionPackageJson,
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
  isFlavor,
  toProfiles,
} from "./ConfigAccess";

/**
 * Builds the payload from one configuration snapshot. It reads the profile the way `ConfigAccess`
 * does rather than through its getters, which take a fresh snapshot per setting.
 */
export function getWebViewSettings(): ISettingsPayload {
  const configSnapshot = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
  const workbenchConfig = vscode.workspace.getConfiguration("workbench");
  const extensionConfig = vscode.extensions.getExtension(C.EXTENSION_ID)?.packageJSON as
    | IExtensionPackageJson
    | undefined;

  const profiles = toProfiles(configSnapshot.get(C.CONFIG_KEY_PROFILES));
  const activeProfile = configSnapshot.get(C.CONFIG_KEY_ACTIVE_PROFILE, "Default");
  const profile: IProfile = Object.hasOwn(profiles, activeProfile) ? profiles[activeProfile] : {};

  const getProfileString = (key: string, defaultValue: string): string => {
    const value = profile[key];
    if (typeof value === "string") return value;
    return configSnapshot.get<string>(key, defaultValue);
  };

  const getProfileObject = <T extends Record<string, unknown>>(key: string, defaultValue: T): T => {
    // The profile is user-edited JSON, so the value can be null or any other type.
    const value: unknown = profile[key];
    if (typeof value === "object" && value !== null) return value as T;
    const globalValue = configSnapshot.get<T | undefined>(key);
    return globalValue ?? defaultValue;
  };

  const themeName = workbenchConfig.get<string>("colorTheme", "");
  let activeFlavor: keyof typeof palettes = "mocha";
  const parsedFlavor = parseFlavorFromThemeName(themeName);
  if (parsedFlavor && isFlavor(parsedFlavor)) {
    activeFlavor = parsedFlavor;
  }

  const fontStyles = getProfileObject<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {});
  const syntaxOverrides = getProfileObject<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
  const uiOverrides = getProfileObject<IUiOverrides>(C.CONFIG_KEY_UI_OVERRIDES, {});
  const fontStyleOverrides = getProfileObject<IFontStyleOverrides>(
    C.CONFIG_KEY_FONT_STYLE_OVERRIDES,
    {},
  );
  const currentAccent = getProfileString(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  const customAccentColor = getProfileString(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

  const defaultFontStyles =
    extensionConfig?.contributes?.configuration?.properties?.[
      `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`
    ]?.default ?? {};
  const accentOptions: string[] =
    extensionConfig?.contributes?.configuration?.properties?.[
      `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`
    ]?.enum ?? [];

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

  const syntaxSettings = CUSTOMIZABLE_SYNTAX_KEYS.map((key): IWebviewSetting => ({
    key: key,
    fontStyle:
      overrideFontStylePalette[`${key}FontStyle`] || fontStyles[`${key}FontStyle`] || "none",
    color: overrideSyntaxPalette[key] || defaultPalette[key],
    defaultColor: defaultPalette[key],
  }));

  const bracketSettings = CUSTOMIZABLE_BRACKET_KEYS.map((key): IWebviewSetting => ({
    key: key,
    color: overrideSyntaxPalette[key] || defaultPalette[key],
    defaultColor: defaultPalette[key],
  }));

  const jsonSettings = CUSTOMIZABLE_JSON_KEYS.map((key): IWebviewSetting => ({
    key: key,
    fontStyle:
      overrideFontStylePalette[`${key}FontStyle`] || fontStyles[`${key}FontStyle`] || "none",
    color: overrideSyntaxPalette[key] || defaultPalette[key],
    defaultColor: defaultPalette[key],
  }));

  const uiSettings = CUSTOMIZABLE_UI_KEYS.map((key): IWebviewSetting => ({
    key: key,
    color: overrideUiPalette[key] || defaultPalette[key],
    defaultColor: defaultPalette[key],
  }));

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
