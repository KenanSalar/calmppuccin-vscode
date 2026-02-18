/**
 * @file Assembles the complete settings DTO for the webview.
 * Reads configuration once and maps it to the ISettingsPayload shape.
 */

import * as vscode from "vscode";
import * as C from "../constants";
import {
  CUSTOMIZABLE_BRACKET_KEYS,
  CUSTOMIZABLE_JSON_KEYS,
  CUSTOMIZABLE_SYNTAX_KEYS,
  CUSTOMIZABLE_UI_KEYS,
  parseFlavorFromThemeName,
} from "../constants";
import palettes from "../palettes";
import { ISettingsPayload, IWebviewSetting, IProfile } from "../../types/webview";
import {
  IExtensionPackageJson,
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
} from "./ConfigAccess";

/**
 * Gathers all settings required by the webview into a single object.
 * This method is optimized to read the VS Code configuration once and reuse it
 * for all internal lookups, reducing redundant configuration API calls.
 * @returns {ISettingsPayload} The complete settings payload for the webview.
 */
export function getWebViewSettings(): ISettingsPayload {
  // Cache the configuration snapshot once to avoid repeated VS Code API calls.
  const configSnapshot = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
  const workbenchConfig = vscode.workspace.getConfiguration("workbench");
  const extensionConfig = vscode.extensions.getExtension(C.EXTENSION_ID)?.packageJSON as IExtensionPackageJson | undefined;

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
    // Cast to unknown for runtime safety — user-edited JSON may contain null.
    const value: unknown = profile[key];
    if (typeof value === "object" && value !== null) return value as T;
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
