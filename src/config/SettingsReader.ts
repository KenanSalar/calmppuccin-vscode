/**
 * @file Typed getters for reading extension configuration settings.
 * All functions read from the active profile with fallback to global config.
 */

import * as vscode from "vscode";
import * as C from "../constants";
import { parseFlavorFromThemeName } from "../constants";
import { IPalettes } from "../palettes";
import {
  getProfileSetting,
  getProfileObjectSetting,
  isFlavor,
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
} from "./ConfigAccess";

/**
 * Gets the currently configured accent color.
 * This method resolves the 'custom' option to its validated hex value,
 * ensuring a valid color is always returned for theme generation.
 * @returns {string} The active accent color value (e.g., "sapphire" or a hex code like "#89b4fa").
 */
export function getAccent(): string {
  const accentSetting = getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);

  // If the user has selected "custom", the corresponding hex code must be fetched and validated.
  if (accentSetting === "custom") {
    const customColor = getProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

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
export function getFontStyles(): IFontStyles {
  return getProfileObjectSetting<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {});
}

/**
 * Gets the user-defined syntax color overrides from settings.json.
 * @returns {ISyntaxOverrides} The syntax overrides object. Returns an empty object if not set.
 */
export function getSyntaxOverrides(): ISyntaxOverrides {
  return getProfileObjectSetting<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
}

/**
 * Gets the user-defined UI color overrides from settings.json.
 * @returns {IUiOverrides} The UI overrides object. Returns an empty object if not set.
 */
export function getUiOverrides(): IUiOverrides {
  return getProfileObjectSetting<IUiOverrides>(C.CONFIG_KEY_UI_OVERRIDES, {});
}

/**
 * Gets the user-defined font style overrides from settings.json.
 * @returns {IFontStyleOverrides} The font style overrides object. Returns an empty object if not set.
 */
export function getFontStyleOverrides(): IFontStyleOverrides {
  return getProfileObjectSetting<IFontStyleOverrides>(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, {});
}

/**
 * Parses the active VS Code theme name to determine the current Calmppuccin flavor.
 * @returns {keyof IPalettes} The corresponding flavor key (e.g., "mocha").
 */
export function getActiveFlavor(): keyof IPalettes {
  const workbenchConfig = vscode.workspace.getConfiguration("workbench");
  const themeName = workbenchConfig.get<string>("colorTheme", "");
  const flavor = parseFlavorFromThemeName(themeName);

  if (flavor && isFlavor(flavor)) {
    return flavor;
  }
  return "mocha"; // Default fallback
}
