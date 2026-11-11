/** @file Assembles the `ISettingsPayload` the webview builds its controls from. */

import { ISettingsPayload, IWebviewSetting } from "../../types/webview";
import * as C from "../constants";
import palettes from "../palettes";
import {
  getAccentOptions,
  getActiveProfile,
  getConfig,
  getDefaultFontStyles,
  getProfiles,
  getProfileSetting,
} from "./ConfigAccess";
import {
  getActiveFlavor,
  getFontStyleOverrides,
  getFontStyles,
  getSyntaxOverrides,
  getUiOverrides,
} from "./SettingsReader";

/** Builds the payload from one configuration snapshot rather than one per setting. */
export function getWebViewSettings(): ISettingsPayload {
  const config = getConfig();
  const activeFlavor = getActiveFlavor();
  const defaultPalette = palettes[activeFlavor];
  const fontStyles = getFontStyles(config);
  const flavorFontStyles = getFontStyleOverrides(config)[activeFlavor] ?? {};
  const flavorSyntaxColors = getSyntaxOverrides(config)[activeFlavor] ?? {};
  const flavorUiColors = getUiOverrides(config)[activeFlavor] ?? {};
  const accentOptions = getAccentOptions();

  const accentColorPalettes = accentOptions.reduce<{ [key: string]: string }>((acc, option) => {
    if (defaultPalette[option]) {
      acc[option] = defaultPalette[option];
    }
    return acc;
  }, {});

  const styledColorSetting = (key: string): IWebviewSetting => ({
    key,
    fontStyle: flavorFontStyles[`${key}FontStyle`] || fontStyles[`${key}FontStyle`] || "none",
    color: flavorSyntaxColors[key] || defaultPalette[key],
    defaultColor: defaultPalette[key],
  });

  const colorSetting = (key: string, overrides: { [key: string]: string }): IWebviewSetting => ({
    key,
    color: overrides[key] || defaultPalette[key],
    defaultColor: defaultPalette[key],
  });

  return {
    activeFlavor,
    syntaxSettings: C.CUSTOMIZABLE_SYNTAX_KEYS.map((key) => styledColorSetting(key)),
    bracketSettings: C.CUSTOMIZABLE_BRACKET_KEYS.map((key) =>
      colorSetting(key, flavorSyntaxColors),
    ),
    jsonSettings: C.CUSTOMIZABLE_JSON_KEYS.map((key) => styledColorSetting(key)),
    uiSettings: C.CUSTOMIZABLE_UI_KEYS.map((key) => colorSetting(key, flavorUiColors)),
    currentAccent: getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT, config),
    accentOptions,
    customAccentColor: getProfileSetting(
      C.CONFIG_KEY_CUSTOM_ACCENT,
      C.DEFAULT_CUSTOM_ACCENT,
      config,
    ),
    defaultFontStyles: getDefaultFontStyles(),
    activeThemeBackgroundColor: defaultPalette.crust,
    accentColorPalettes,
    profiles: getProfiles(config),
    activeProfile: getActiveProfile(config),
  };
}
