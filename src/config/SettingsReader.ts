/** @file The typed read of each setting, through the active profile. */

import * as vscode from "vscode";
import * as C from "../constants";
import { IPalettes, isFlavor } from "../palettes";
import {
  getConfig,
  getProfileSetting,
  getProfileObjectSetting,
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
} from "./ConfigAccess";

/**
 * Returns the accent as a palette key, or as a hex when it's `custom`. An invalid custom color
 * falls back to the default one, so the build always gets a color.
 */
export function getAccent(): string {
  const accentSetting = getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  if (accentSetting === C.CUSTOM_ACCENT) {
    const customColor = getProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);
    return C.HEX6_COLOR.test(customColor) ? customColor : C.DEFAULT_CUSTOM_ACCENT;
  }
  return accentSetting;
}

export function getFontStyles(config = getConfig()): IFontStyles {
  return getProfileObjectSetting<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {}, config);
}

export function getSyntaxOverrides(config = getConfig()): ISyntaxOverrides {
  return getProfileObjectSetting<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {}, config);
}

export function getUiOverrides(config = getConfig()): IUiOverrides {
  return getProfileObjectSetting<IUiOverrides>(C.CONFIG_KEY_UI_OVERRIDES, {}, config);
}

export function getFontStyleOverrides(config = getConfig()): IFontStyleOverrides {
  return getProfileObjectSetting<IFontStyleOverrides>(
    C.CONFIG_KEY_FONT_STYLE_OVERRIDES,
    {},
    config,
  );
}

/** The selected color theme's flavor, or Mocha when it isn't a Calmppuccin theme. */
export function getActiveFlavor(): keyof IPalettes {
  const themeName = vscode.workspace
    .getConfiguration(C.WORKBENCH_SECTION)
    .get<string>(C.COLOR_THEME_KEY, "");
  const flavor = C.parseFlavorFromThemeName(themeName);

  if (flavor && isFlavor(flavor)) {
    return flavor;
  }
  return "mocha";
}
