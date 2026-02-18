/**
 * @file Thin facade that preserves the original ConfigurationService public API.
 * All logic has been split into focused modules under src/config/.
 * Callers continue importing from this file with zero changes.
 */

import { getProfiles, getActiveProfile } from "./config/ConfigAccess";
import { getAccent, getFontStyles, getSyntaxOverrides, getUiOverrides, getFontStyleOverrides, getActiveFlavor } from "./config/SettingsReader";
import { updateFontStyle, resetFontStyle, updateAccent, updateCustomAccent, updateSyntaxColor, resetSyntaxColor, updateUiColor, resetUiColor, updateFontStyleOverride, resetFontStyleOverride } from "./config/SettingsWriter";
import { updateActiveProfile, saveProfile, deleteProfile, resetProfile, resetAll, migrateGlobalSettingsToDefault } from "./config/ProfileManager";
import { getWebViewSettings } from "./config/WebviewSettingsMapper";

export type { IFontStyles, ISyntaxOverrides, IUiOverrides, IFontStyleOverrides } from "./config/ConfigAccess";

/**
 * A utility class for managing all Calmppuccin settings in VS Code.
 * Provides static methods for reading and writing extension configuration.
 */
export class ConfigurationService {
  static getProfiles = getProfiles;
  static getActiveProfile = getActiveProfile;
  static getAccent = getAccent;
  static getFontStyles = getFontStyles;
  static getSyntaxOverrides = getSyntaxOverrides;
  static getUiOverrides = getUiOverrides;
  static getFontStyleOverrides = getFontStyleOverrides;
  static getActiveFlavor = getActiveFlavor;
  static updateFontStyle = updateFontStyle;
  static resetFontStyle = resetFontStyle;
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
  static resetProfile = resetProfile;
  static resetAll = resetAll;
  static migrateGlobalSettingsToDefault = migrateGlobalSettingsToDefault;
  static getWebViewSettings = getWebViewSettings;
}
