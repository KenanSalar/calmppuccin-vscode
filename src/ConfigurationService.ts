/**
 * @file One import for the modules under `src/config/`: host code reaches every setting through
 * these statics, which a test can replace one by one with `jest.spyOn`.
 */

import { affectsThemeSettings } from "./config/ConfigAccess";
import {
  updateActiveProfile,
  saveProfile,
  deleteProfile,
  resetAll,
  migrateGlobalSettingsToDefault,
} from "./config/ProfileManager";
import {
  getAccent,
  getFontStyles,
  getSyntaxOverrides,
  getUiOverrides,
  getFontStyleOverrides,
  getActiveFlavor,
} from "./config/SettingsReader";
import {
  updateAccent,
  updateCustomAccent,
  updateSyntaxColor,
  resetSyntaxColor,
  updateUiColor,
  resetUiColor,
  updateFontStyleOverride,
  resetFontStyleOverride,
} from "./config/SettingsWriter";
import { getWebViewSettings } from "./config/WebviewSettingsMapper";

export type {
  IExtensionPackageJson,
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
} from "./config/ConfigAccess";

export class ConfigurationService {
  static getAccent = getAccent;
  static getFontStyles = getFontStyles;
  static getSyntaxOverrides = getSyntaxOverrides;
  static getUiOverrides = getUiOverrides;
  static getFontStyleOverrides = getFontStyleOverrides;
  static getActiveFlavor = getActiveFlavor;
  static updateAccent = updateAccent;
  static updateCustomAccent = updateCustomAccent;
  static updateSyntaxColor = updateSyntaxColor;
  static resetSyntaxColor = resetSyntaxColor;
  static updateUiColor = updateUiColor;
  static resetUiColor = resetUiColor;
  static updateFontStyleOverride = updateFontStyleOverride;
  static resetFontStyleOverride = resetFontStyleOverride;
  static updateActiveProfile = updateActiveProfile;
  static saveProfile = saveProfile;
  static deleteProfile = deleteProfile;
  static resetAll = resetAll;
  static migrateGlobalSettingsToDefault = migrateGlobalSettingsToDefault;
  static getWebViewSettings = getWebViewSettings;
  static affectsThemeSettings = affectsThemeSettings;
}
