/**
 * @file Update and reset operations for extension configuration settings.
 * Handles font styles, accent colors, syntax overrides, UI overrides, and font style overrides.
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

/**
 * Updates a specific font style setting in the user's global settings.json.
 * Only saves font styles that differ from the default values.
 * @param {string} key The font style key to update (e.g., "commentFontStyle").
 * @param {string} value The new font style value (e.g., "italic").
 */
export async function updateFontStyle(key: string, value: string) {
  const currentFontStyles = getFontStyles();
  const defaultFontStyles = getDefaultFontStyles();

  // Build new font styles object, excluding keys that match defaults
  const filteredFontStyles: IFontStyles = {};

  // Add all existing styles that differ from defaults (excluding the key being updated)
  for (const [styleKey, styleValue] of Object.entries(currentFontStyles)) {
    if (styleKey !== key && styleValue !== defaultFontStyles[styleKey]) {
      filteredFontStyles[styleKey] = styleValue;
    }
  }

  // Add the new value if it differs from the default
  if (value !== defaultFontStyles[key]) {
    filteredFontStyles[key] = value;
  }

  // If no custom font styles remain, remove the entire setting
  const finalFontStyles = Object.keys(filteredFontStyles).length === 0 ? undefined : filteredFontStyles;
  await updateProfileSetting(C.CONFIG_KEY_FONT_STYLES, finalFontStyles);
}

/**
 * Resets a specific font style to its default by removing it from the user's settings.json.
 * @param {string} key The font style key to reset.
 */
export async function resetFontStyle(key: string) {
  const currentFontStyles = getFontStyles();
  const defaultFontStyles = getDefaultFontStyles();

  // Build new font styles object, excluding the key being reset and keys that match defaults
  const filteredFontStyles: IFontStyles = {};
  for (const [styleKey, styleValue] of Object.entries(currentFontStyles)) {
    if (styleKey !== key && styleValue !== defaultFontStyles[styleKey]) {
      filteredFontStyles[styleKey] = styleValue;
    }
  }

  // If no custom font styles remain, remove the entire setting
  const finalFontStyles = Object.keys(filteredFontStyles).length === 0 ? undefined : filteredFontStyles;
  await updateProfileSetting(C.CONFIG_KEY_FONT_STYLES, finalFontStyles);
}

/**
 * Updates the accent color setting.
 * @param {string} value The new accent color name (e.g., "mauve").
 */
export async function updateAccent(value: string) {
  await updateProfileSetting(C.CONFIG_KEY_ACCENT, value);
}

/**
 * Updates the custom accent color hex code.
 * @param {string} value The new hex color value (e.g., "#89b4fa").
 */
export async function updateCustomAccent(value: string) {
  await updateProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, value);
}

/**
 * Updates a specific syntax color override for a given flavor.
 * @param {string} flavor The theme flavor (e.g., "mocha").
 * @param {string} key The syntax key (e.g., "comment").
 * @param {string} value The new hex color value.
 */
export async function updateSyntaxColor(flavor: string, key: string, value: string) {
  // Clone the settings object to create a mutable copy
  const overrides = cloneOverrides(getSyntaxOverrides());
  const existingFlavor = Object.prototype.hasOwnProperty.call(overrides, flavor) ? overrides[flavor] : undefined;
  const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
  flavorOverrides[key] = value;
  const updatedOverrides: ISyntaxOverrides = { ...overrides, [flavor]: flavorOverrides };
  await updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, updatedOverrides);
}

/**
 * Resets a specific syntax color override for a given flavor.
 * @param {string} flavor The theme flavor.
 * @param {string} key The syntax key.
 */
export async function resetSyntaxColor(flavor: string, key: string) {
  const overrides = getSyntaxOverrides();
  const finalOverrides = removeOverrideKey(overrides, flavor, key);
  await updateProfileSetting(C.CONFIG_KEY_SYNTAX_OVERRIDES, finalOverrides);
}

/**
 * Updates a specific UI color override for a given flavor.
 * @param {string} flavor The theme flavor.
 * @param {string} key The UI key (e.g., "base").
 * @param {string} value The new hex color value.
 */
export async function updateUiColor(flavor: string, key: string, value: string) {
  const overrides = cloneOverrides(getUiOverrides());
  const existingFlavor = Object.prototype.hasOwnProperty.call(overrides, flavor) ? overrides[flavor] : undefined;
  const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
  flavorOverrides[key] = value;
  const updatedOverrides: IUiOverrides = { ...overrides, [flavor]: flavorOverrides };
  await updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, updatedOverrides);
}

/**
 * Resets a specific UI color override for a given flavor.
 * @param {string} flavor The theme flavor.
 * @param {string} key The UI key.
 */
export async function resetUiColor(flavor: string, key: string) {
  const overrides = getUiOverrides();
  const finalOverrides = removeOverrideKey(overrides, flavor, key);
  await updateProfileSetting(C.CONFIG_KEY_UI_OVERRIDES, finalOverrides);
}

/**
 * Updates a specific font style override for a flavor in the user's global settings.json.
 * @param {string} flavor The theme flavor (e.g., "mocha").
 * @param {string} key The font style key to update (e.g., "commentFontStyle").
 * @param {string} value The new font style value (e.g., "italic").
 */
export async function updateFontStyleOverride(flavor: string, key: string, value: string) {
  const fontStyleOverrides = cloneOverrides(getFontStyleOverrides());
  const defaultFontStyles = getDefaultFontStyles();

  // Only save if the value differs from the default
  if (value !== defaultFontStyles[key]) {
    const existingFlavor = Object.prototype.hasOwnProperty.call(fontStyleOverrides, flavor)
      ? fontStyleOverrides[flavor]
      : undefined;
    const flavorOverrides = existingFlavor ? { ...existingFlavor } : {};
    flavorOverrides[key] = value;
    const updatedOverrides: IFontStyleOverrides = { ...fontStyleOverrides, [flavor]: flavorOverrides };
    await updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, updatedOverrides);
  } else {
    // If setting to default, remove it (same as resetting)
    await resetFontStyleOverride(flavor, key);
  }
}

/**
 * Resets a font style override for a specific flavor by removing it from the user's settings.json.
 * @param {string} flavor The theme flavor (e.g., "mocha").
 * @param {string} key The font style key to reset.
 */
export async function resetFontStyleOverride(flavor: string, key: string) {
  const overrides = getFontStyleOverrides();
  const finalOverrides = removeOverrideKey(overrides, flavor, key);
  await updateProfileSetting(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, finalOverrides);
}
