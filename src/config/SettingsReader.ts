/** @file The typed read of each setting, through the active profile. */

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
 * Returns the accent as a palette key, or as a hex when it's `custom`. An invalid custom color
 * falls back to the default one, so the build always gets a color.
 */
export function getAccent(): string {
  const accentSetting = getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  if (accentSetting === "custom") {
    const customColor = getProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);
    const hex6Regex = /^#([A-Fa-f0-9]{6})$/;
    return hex6Regex.test(customColor) ? customColor : C.DEFAULT_CUSTOM_ACCENT;
  }
  return accentSetting;
}

export function getFontStyles(): IFontStyles {
  return getProfileObjectSetting<IFontStyles>(C.CONFIG_KEY_FONT_STYLES, {});
}

export function getSyntaxOverrides(): ISyntaxOverrides {
  return getProfileObjectSetting<ISyntaxOverrides>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
}

export function getUiOverrides(): IUiOverrides {
  return getProfileObjectSetting<IUiOverrides>(C.CONFIG_KEY_UI_OVERRIDES, {});
}

export function getFontStyleOverrides(): IFontStyleOverrides {
  return getProfileObjectSetting<IFontStyleOverrides>(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, {});
}

/** The selected color theme's flavor, or Mocha when it isn't a Calmppuccin theme. */
export function getActiveFlavor(): keyof IPalettes {
  const workbenchConfig = vscode.workspace.getConfiguration("workbench");
  const themeName = workbenchConfig.get<string>("colorTheme", "");
  const flavor = parseFlavorFromThemeName(themeName);

  if (flavor && isFlavor(flavor)) {
    return flavor;
  }
  return "mocha";
}
