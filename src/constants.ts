/**
 * @file The setting keys, command ids, message commands, file names and tunables, so none is a
 * literal at its use site. The webview bundles this file, so it imports nothing.
 */

export const EXTENSION_ID = "kenan-salar.calmppuccin-vscode";
export const EXTENSION_NAMESPACE = "calmppuccin";
export const CONFIG_KEY_ACCENT = "accent";
export const CONFIG_KEY_CUSTOM_ACCENT = "customAccentColor";
export const REGENERATE_COMMAND_ID = "calmppuccin.regenerateThemes";
export const RELOAD_COMMAND_ID = "workbench.action.reloadWindow";
export const WORKBENCH_SECTION = "workbench";
export const COLOR_THEME_KEY = "colorTheme";
export const ICON_THEME_KEY = "iconTheme";
export const CATPPUCCIN_ICON_PACK_ID = "catppuccin-";
export const CONFIG_KEY_FONT_STYLES = "fontStyles";
export const CONFIG_KEY_FONT_STYLE_OVERRIDES = "fontStyleOverrides";
export const CONFIG_KEY_SYNTAX_OVERRIDES = "syntaxOverrides";
export const CONFIG_KEY_UI_OVERRIDES = "uiOverrides";
export const CONFIG_KEY_PROFILES = "profiles";
export const CONFIG_KEY_ACTIVE_PROFILE = "activeProfile";
/** The settings that hold overrides by flavor, then key. */
export const OVERRIDE_SETTING_KEYS = [
  CONFIG_KEY_SYNTAX_OVERRIDES,
  CONFIG_KEY_UI_OVERRIDES,
  CONFIG_KEY_FONT_STYLE_OVERRIDES,
] as const;
/** The settings whose change rebuilds the themes. */
export const THEME_AFFECTING_KEYS: readonly string[] = [
  CONFIG_KEY_ACCENT,
  CONFIG_KEY_CUSTOM_ACCENT,
  CONFIG_KEY_FONT_STYLES,
  CONFIG_KEY_FONT_STYLE_OVERRIDES,
  CONFIG_KEY_SYNTAX_OVERRIDES,
  CONFIG_KEY_UI_OVERRIDES,
  CONFIG_KEY_PROFILES,
  CONFIG_KEY_ACTIVE_PROFILE,
] as const;
export const CUSTOMIZE_COMMAND_ID = "calmppuccin.customize";
export const DEFAULT_PROFILE_NAME = "Default";

export const THEMES_DIR = "themes";
export const SRC_DIR = "src";
export const TEMPLATE_DIR = "template";
/** The file under `TEMPLATE_DIR` holding each theme key's value. */
export const TEMPLATE_FILES = {
  colors: "colors.json",
  tokenColors: "tokenColors.json",
  semanticTokenColors: "semanticTokenColors.json",
} as const;
export const LIGHT_FLAVOR_NAME = "latte";
export const FALLBACK_ACCENT = "mauve";
export const DEFAULT_ACCENT = "sapphire";
export const DEFAULT_CUSTOM_ACCENT = "#89b4fa";
/** The `calmppuccin.accent` value that selects `calmppuccin.customAccentColor`. */
export const CUSTOM_ACCENT = "custom";
export const ACCENT_RECIPE_PREFIX = "{{accent}}";
export const THEME_FILE_PREFIX = "calmppuccin";
export const THEME_FILE_SUFFIX = "color-theme.json";
export const THEME_TYPE_LIGHT = "light";
export const THEME_TYPE_DARK = "dark";

/**
 * How long the panel waits for further changes before sending the settings. A new panel's script
 * has to be listening by then, or the first payload is lost.
 */
export const WEBVIEW_UPDATE_DEBOUNCE_MS = 50;

/** How long the settings listener waits for further changes before rebuilding the themes. */
export const REGENERATE_DEBOUNCE_MS = 200;

export const ICON_SYNC_INITIAL_DELAY_MS = 100;
export const ICON_SYNC_RETRY_DELAY_MS = 150;
export const ICON_SYNC_MAX_RETRIES = 3;

// The alphas the third-party color generators in `src/extensions/` blend palette colors at.
export const EXTENSION_OPACITY_BACKGROUND = 0.15;
export const EXTENSION_OPACITY_GUTTER = 0.3;
export const EXTENSION_OPACITY_HIGHLIGHT = 0.8;
export const EXTENSION_OPACITY_TRAILING = 0.3;

export const INFO_MESSAGE = "Calmppuccin theme updated. Reload to apply.";
export const RELOAD_ACTION = "Reload Window";
export const REPORT_ISSUE_ACTION = "Report Issue";
export const ERROR_MESSAGE_PREFIX = "Failed to update Calmppuccin themes. Error: ";
export const SETTINGS_ERROR_MESSAGE_PREFIX = "Failed to save Calmppuccin settings. Error: ";
export const REPO_ISSUES_URL = "https://github.com/KenanSalar/calmppuccin-vscode/issues";

/** The webview message commands, and the panel's id and title. */
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

// The palette keys the customization UI offers, by settings view.
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

/** A `#rrggbb` color, its hex digits in group 1. */
export const HEX6_COLOR = /^#([0-9A-Fa-f]{6})$/;
/** A `#rrggbb` or `#rrggbbaa` color: the RGB digits in group 1, the alpha in group 2. */
export const HEX_COLOR_WITH_ALPHA = /^#([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;

/** The UI keys that color a background rather than text, so they take no alpha. */
export const BACKGROUND_UI_KEYS: ReadonlySet<string> = new Set(["base", "mantle", "crust"]);

/** The font style values the customization UI offers, matching `calmppuccin.fontStyleOverrides`. */
export const FONT_STYLE_OPTIONS = ["none", "italic", "bold", "italic bold", "underline"] as const;

/**
 * Turns a theme label such as "Calmppuccin Nitro Cold Brew" into its flavor key, or `null` for
 * any other theme.
 */
export function parseFlavorFromThemeName(themeName: string): string | null {
  const prefix = "calmppuccin ";
  const lowerName = themeName.toLowerCase();
  if (!lowerName.startsWith(prefix)) {
    return null;
  }
  // Decomposing and dropping the combining marks turns "Frappé" into "frappe".
  return lowerName
    .slice(prefix.length)
    .replace(/ /g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
