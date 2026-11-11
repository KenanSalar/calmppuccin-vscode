/**
 * @file The writes behind the customization UI, each into the active profile. Setting a key to
 * `undefined` drops it from the profile.
 */

import * as C from "../constants";
import {
  updateProfileSetting,
  getDefaultFontStyles,
  cloneOverrides,
  removeOverrideKey,
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
} from "./ConfigAccess";
import {
  getFontStyles,
  getSyntaxOverrides,
  getUiOverrides,
  getFontStyleOverrides,
} from "./SettingsReader";

/** Sets one font style, and prunes every style that matches its default. */
export async function updateFontStyle(key: string, value: string) {
  const currentFontStyles = getFontStyles();
  const defaultFontStyles = getDefaultFontStyles();

  const filteredFontStyles: IFontStyles = {};
  for (const [styleKey, styleValue] of Object.entries(currentFontStyles)) {
    if (styleKey !== key && styleValue !== defaultFontStyles[styleKey]) {
      filteredFontStyles[styleKey] = styleValue;
    }
  }
  if (value !== defaultFontStyles[key]) {
    filteredFontStyles[key] = value;
  }

  const finalFontStyles =
    Object.keys(filteredFontStyles).length === 0 ? undefined : filteredFontStyles;
  await updateProfileSetting(C.CONFIG_KEY_FONT_STYLES, finalFontStyles);
}

export async function resetFontStyle(key: string) {
  const currentFontStyles = getFontStyles();
  const defaultFontStyles = getDefaultFontStyles();

  const filteredFontStyles: IFontStyles = {};
  for (const [styleKey, styleValue] of Object.entries(currentFontStyles)) {
    if (styleKey !== key && styleValue !== defaultFontStyles[styleKey]) {
      filteredFontStyles[styleKey] = styleValue;
    }
  }

  const finalFontStyles =
    Object.keys(filteredFontStyles).length === 0 ? undefined : filteredFontStyles;
  await updateProfileSetting(C.CONFIG_KEY_FONT_STYLES, finalFontStyles);
}

export async function updateAccent(value: string) {
  await updateProfileSetting(C.CONFIG_KEY_ACCENT, value);
}

export async function updateCustomAccent(value: string) {
  await updateProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, value);
}

export async function updateSyntaxColor(flavor: string, key: string, value: string) {
  const overrides = cloneOverrides(getSyntaxOverrides());
  const existingFlavor = Object.hasOwn(overrides, flavor) ? overrides[flavor] : undefined;
  const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
  flavorOverrides[key] = value;
  const updatedOverrides: ISyntaxOverrides = { ...overrides, [flavor]: flavorOverrides };
  await updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, updatedOverrides);
}

export async function resetSyntaxColor(flavor: string, key: string) {
  const overrides = getSyntaxOverrides();
  const finalOverrides = removeOverrideKey(overrides, flavor, key);
  if (finalOverrides === overrides) {
    return;
  }
  await updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, finalOverrides);
}

export async function updateUiColor(flavor: string, key: string, value: string) {
  const overrides = cloneOverrides(getUiOverrides());
  const existingFlavor = Object.hasOwn(overrides, flavor) ? overrides[flavor] : undefined;
  const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
  flavorOverrides[key] = value;
  const updatedOverrides: IUiOverrides = { ...overrides, [flavor]: flavorOverrides };
  await updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, updatedOverrides);
}

export async function resetUiColor(flavor: string, key: string) {
  const overrides = getUiOverrides();
  const finalOverrides = removeOverrideKey(overrides, flavor, key);
  if (finalOverrides === overrides) {
    return;
  }
  await updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, finalOverrides);
}

/** Sets a flavor's font style; a value equal to the default removes the override instead. */
export async function updateFontStyleOverride(flavor: string, key: string, value: string) {
  const fontStyleOverrides = cloneOverrides(getFontStyleOverrides());
  const defaultFontStyles = getDefaultFontStyles();

  if (value !== defaultFontStyles[key]) {
    const existingFlavor = Object.hasOwn(fontStyleOverrides, flavor)
      ? fontStyleOverrides[flavor]
      : undefined;
    const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
    flavorOverrides[key] = value;
    const updatedOverrides: IFontStyleOverrides = {
      ...fontStyleOverrides,
      [flavor]: flavorOverrides,
    };
    await updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, updatedOverrides);
  } else {
    await resetFontStyleOverride(flavor, key);
  }
}

export async function resetFontStyleOverride(flavor: string, key: string) {
  const overrides = getFontStyleOverrides();
  const finalOverrides = removeOverrideKey(overrides, flavor, key);
  if (finalOverrides === overrides) {
    return;
  }
  await updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, finalOverrides);
}
