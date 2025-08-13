/**
 * @file This file contains all the static string values for the extension.
 * This makes the code more maintainable by providing a single source of truth.
 */

// For extension.ts
export const EXTENSION_NAMESPACE = "calmppuccin";
export const CONFIG_KEY_ACCENT = "accent";
export const CONFIG_KEY_CUSTOM_ACCENT = "customAccentColor";
export const REGENERATE_COMMAND_ID = "calmppuccin.regenerateThemes";
export const RELOAD_COMMAND_ID = "workbench.action.reloadWindow";
export const ICON_THEME_KEY = "workbench.iconTheme";
export const CATPPUCCIN_ICON_PACK_ID = "catppuccin-";
export const PANEL_IS_OPEN_KEY = "calmppuccin.panelIsOpen";
export const CONFIG_KEY_FONT_STYLES = "fontStyles";
export const CONFIG_KEY_SYNTAX_OVERRIDES = "syntaxOverrides";
export const CUSTOMIZE_COMMAND_ID = "calmppuccin.customize";

// For build.ts
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

// User-facing messages
export const INFO_MESSAGE = "Calmppuccin theme updated. Reload to apply.";
export const RELOAD_ACTION = "Reload Window";
export const REPORT_ISSUE_ACTION = "Report Issue";
export const ERROR_MESSAGE_PREFIX = "Failed to update Calmppuccin themes. Error: ";
export const REPO_ISSUES_URL = "https://github.com/KenanSalar/calmppuccin-vscode/issues";

// For SettingsPanel.ts
export const WEBVIEW_COMMANDS = {
  UPDATE_SETTING: "updateSetting",
  RESET_FONT_STYLE: "resetFontStyle",
  UPDATE_ACCENT: "updateAccent",
  UPDATE_CUSTOM_ACCENT: "updateCustomAccent",
  UPDATE_SYNTAX_COLOR: "updateSyntaxColor",
  RESET_SYNTAX_COLOR: "resetSyntaxColor",
  RESET_ALL: "resetAll",
  LOAD_SETTINGS: "loadSettings",
  WEBVIEW_ID: "calmppuccinSettings",
  WEBVIEW_TITLE: "Calmppuccin Customization",
} as const;
