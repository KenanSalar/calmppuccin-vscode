/**
 * @file The writes behind the customization UI, each into the active profile. Setting a key to
 * `undefined` drops it from the profile.
 */

import * as C from "../constants";
import {
  updateProfileSetting,
  getDefaultFontStyles,
  getProfileObjectSetting,
  removeOverrideKey,
  FlavorOverrides,
} from "./ConfigAccess";

type OverrideSetting = (typeof C.OVERRIDE_SETTING_KEYS)[number];

export async function updateAccent(value: string) {
  await updateProfileSetting(C.CONFIG_KEY_ACCENT, value);
}

export async function updateCustomAccent(value: string) {
  await updateProfileSetting(C.CONFIG_KEY_CUSTOM_ACCENT, value);
}

export async function updateSyntaxColor(flavor: string, key: string, value: string) {
  await setOverride(C.CONFIG_KEY_SYNTAX_OVERRIDES, flavor, key, value);
}

export async function resetSyntaxColor(flavor: string, key: string) {
  await clearOverride(C.CONFIG_KEY_SYNTAX_OVERRIDES, flavor, key);
}

export async function updateUiColor(flavor: string, key: string, value: string) {
  await setOverride(C.CONFIG_KEY_UI_OVERRIDES, flavor, key, value);
}

export async function resetUiColor(flavor: string, key: string) {
  await clearOverride(C.CONFIG_KEY_UI_OVERRIDES, flavor, key);
}

/** Sets a flavor's font style; a value equal to the default removes the override instead. */
export async function updateFontStyleOverride(flavor: string, key: string, value: string) {
  if (value === getDefaultFontStyles()[key]) {
    await resetFontStyleOverride(flavor, key);
    return;
  }
  await setOverride(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, flavor, key, value);
}

export async function resetFontStyleOverride(flavor: string, key: string) {
  await clearOverride(C.CONFIG_KEY_FONT_STYLE_OVERRIDES, flavor, key);
}

async function setOverride(setting: OverrideSetting, flavor: string, key: string, value: string) {
  const overrides = getProfileObjectSetting<FlavorOverrides>(setting, {});
  const flavorOverrides = Object.hasOwn(overrides, flavor) ? overrides[flavor] : {};
  await updateProfileSetting(setting, {
    ...overrides,
    [flavor]: { ...flavorOverrides, [key]: value },
  });
}

async function clearOverride(setting: OverrideSetting, flavor: string, key: string) {
  const overrides = getProfileObjectSetting<FlavorOverrides>(setting, {});
  const remaining = removeOverrideKey(overrides, flavor, key);
  if (remaining !== overrides) {
    await updateProfileSetting(setting, remaining);
  }
}
