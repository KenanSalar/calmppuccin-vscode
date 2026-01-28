/**
 * @file This file contains all the static string values for the extension.
 * This makes the code more maintainable by providing a single source of truth for reused strings.
 */

/** Constants primarily used in the main `extension.ts` file. */
export const EXTENSION_ID = "kenan-salar.calmppuccin-vscode";
export const EXTENSION_NAMESPACE = "calmppuccin";
export const CONFIG_KEY_ACCENT = "accent";
export const CONFIG_KEY_CUSTOM_ACCENT = "customAccentColor";
export const REGENERATE_COMMAND_ID = "calmppuccin.regenerateThemes";
export const RELOAD_COMMAND_ID = "workbench.action.reloadWindow";
export const ICON_THEME_KEY = "workbench.iconTheme";
export const CATPPUCCIN_ICON_PACK_ID = "catppuccin-";
export const PANEL_IS_OPEN_KEY = "calmppuccin.panelIsOpen";
export const CONFIG_KEY_FONT_STYLES = "fontStyles";
export const CONFIG_KEY_FONT_STYLE_OVERRIDES = "fontStyleOverrides";
export const CONFIG_KEY_SYNTAX_OVERRIDES = "syntaxOverrides";
export const CONFIG_KEY_UI_OVERRIDES = "uiOverrides";
export const CONFIG_KEY_PROFILES = "profiles";
export const CONFIG_KEY_ACTIVE_PROFILE = "activeProfile";
export const CUSTOMIZE_COMMAND_ID = "calmppuccin.customize";

/** Constants used in the `build.ts` script for theme generation. */
export const THEMES_DIR = "themes";
export const SRC_DIR = "src";
export const TEMPLATE_FILE = "template.json";
export const LIGHT_FLAVOR_NAME = "latte";
export const FALLBACK_ACCENT = "mauve";
export const DEFAULT_ACCENT = "sapphire";
export const DEFAULT_CUSTOM_ACCENT = "#89b4fa";
export const ACCENT_RECIPE_PREFIX = "{{accent}}";
export const THEME_FILE_PREFIX = "calmppuccin";
export const THEME_FILE_SUFFIX = "color-theme.json";
export const THEME_TYPE_LIGHT = "light";
export const THEME_TYPE_DARK = "dark";

/** Debounce delay (in ms) for webview settings updates during rapid changes. */
export const WEBVIEW_UPDATE_DEBOUNCE_MS = 50;

/** User-facing messages and actions used in notifications and dialogs. */
export const INFO_MESSAGE = "Calmppuccin theme updated. Reload to apply.";
export const RELOAD_ACTION = "Reload Window";
export const REPORT_ISSUE_ACTION = "Report Issue";
export const ERROR_MESSAGE_PREFIX = "Failed to update Calmppuccin themes. Error: ";
export const REPO_ISSUES_URL = "https://github.com/KenanSalar/calmppuccin-vscode/issues";

/**
 * Defines the command identifiers for communication between the webview and the extension.
 * Using `as const` ensures that the properties are read-only and their values are treated as literal types,
 * which provides stronger type-checking.
 */
export const WEBVIEW_CONSTANTS = {
  UPDATE_SETTING: "updateSetting",
  RESET_FONT_STYLE: "resetFontStyle",
  UPDATE_ACCENT: "updateAccent",
  UPDATE_CUSTOM_ACCENT: "updateCustomAccent",
  UPDATE_SYNTAX_COLOR: "updateSyntaxColor",
  RESET_SYNTAX_COLOR: "resetSyntaxColor",
  UPDATE_UI_COLOR: "updateUiColor",
  RESET_UI_COLOR: "resetUiColor",
  RESET_ALL: "resetAll",
  SWITCH_PROFILE: "switchProfile",
  SAVE_PROFILE: "saveProfile",
  DELETE_PROFILE: "deleteProfile",
  LOAD_SETTINGS: "loadSettings",
  WEBVIEW_ID: "calmppuccinSettings",
  WEBVIEW_TITLE: "Calmppuccin Customization",
} as const;

/** Defines which syntax, bracket, and JSON color keys are exposed in the Customization UI. */
export const CUSTOMIZABLE_SYNTAX_KEYS = [
  "comment",
  "keyword",
  "type",
  "typeAlias",
  "namespace",
  "namespaceAttribute",
  "module",
  "annotation",
  "directive",
  "decorator",
  "class",
  "interface",
  "struct",
  "enum",
  "enumMember",
  "fieldAndAttribute",
  "property",
  "propertyReadOnly",
  "variable",
  "variableMutable",
  "macro",
  "functionAndMethod",
  "extensionMethod",
  "delegate",
  "event",
  "parameter",
  "typeParameter",
  "number",
  "constant",
  "operator",
  "operatorOverload",
  "punctuation",
  "string",
  "stringVerbatim",
  "text",
];
export const CUSTOMIZABLE_BRACKET_KEYS = [
  "uiBracket1",
  "uiBracket2",
  "uiBracket3",
  "uiBracket4",
  "uiBracket5",
  "uiBracket6",
];
export const CUSTOMIZABLE_JSON_KEYS = [
  "jsonLvl0",
  "jsonLvl1",
  "jsonLvl2",
  "jsonLvl3",
  "jsonLvl4",
  "jsonLvl5",
  "jsonLvl6",
  "jsonLvl7",
  "jsonLvl8",
];
export const CUSTOMIZABLE_UI_KEYS = ["base", "mantle", "crust", "uiText"];

/**
 * Parses a Calmppuccin theme name to extract the flavor identifier.
 * @param {string} themeName The full theme name (e.g., "Calmppuccin Mocha", "Calmppuccin Nitro Cold Brew")
 * @returns {string | null} The normalized flavor key (e.g., "mocha", "nitro-cold-brew") or null if not a Calmppuccin theme.
 */
export function parseFlavorFromThemeName(themeName: string): string | null {
  const prefix = "calmppuccin ";
  const lowerName = themeName.toLowerCase();
  if (!lowerName.startsWith(prefix)) {
    return null;
  }
  return lowerName
    .slice(prefix.length)
    .replace(/ /g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
