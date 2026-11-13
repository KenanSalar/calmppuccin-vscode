/** @file The typed read of each setting, through the active profile. */

import * as C from "../constants";
import { IPalettes } from "../palettes";
import { getSelectedFlavor } from "../selectedTheme";
import {
  customizedFontStyles,
  getConfig,
  getProfileSetting,
  getProfileObjectSetting,
  isPlainObject,
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
} from "./ConfigAccess";

/**
 * Returns the accent as a palette key, or as a hex when it's `custom`. An invalid custom color
 * falls back to the default one, so the build always gets a color.
 */
export function getAccent(config = getConfig()): string {
  const accentSetting = getProfileSetting(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT, config);
  if (accentSetting === C.CUSTOM_ACCENT) {
    const customColor = getProfileSetting(
      C.CONFIG_KEY_CUSTOM_ACCENT,
      C.DEFAULT_CUSTOM_ACCENT,
      config,
    );
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

/**
 * Whether the inputs the theme build reads differ from their defaults, so a custom accent color
 * counts only while the accent is `custom`.
 */
export function isThemeCustomized(): boolean {
  const config = getConfig();
  const overrides = [
    getSyntaxOverrides(config),
    getUiOverrides(config),
    getFontStyleOverrides(config),
  ];
  return (
    getAccent(config) !== C.DEFAULT_ACCENT ||
    Object.keys(customizedFontStyles(getFontStyles(config))).length > 0 ||
    overrides.some(hasFlavorOverride)
  );
}

// User JSON can hold `{}` or `null` for a flavor, which overrides nothing.
function hasFlavorOverride(overrides: Record<string, unknown>): boolean {
  return Object.values(overrides).some(
    (flavorOverrides) => isPlainObject(flavorOverrides) && Object.keys(flavorOverrides).length > 0,
  );
}

/** The selected color theme's flavor, or Mocha when it isn't a Calmppuccin theme. */
export function getActiveFlavor(): keyof IPalettes {
  return getSelectedFlavor() ?? "mocha";
}
