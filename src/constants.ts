/**
 * @file This file contains all the static string values for the extension.
 * This makes the code more maintainable by providing a single source of truth.
 */

// For extension.ts
export const EXTENSION_NAMESPACE = "calmppuccin";
export const CONFIG_KEY_ACCENT = "accent";
export const REGENERATE_COMMAND_ID = "calmppuccin.regenerateThemes";
export const RELOAD_COMMAND_ID = "workbench.action.reloadWindow";
export const ICON_THEME_KEY = "workbench.iconTheme";
export const CATPPUCCIN_ICON_PACK_ID = "catppuccin-";

// For build.ts
export const THEMES_DIR = "themes";
export const SRC_DIR = "src";
export const TEMPLATE_FILE = "template.json";
export const LIGHT_FLAVOR_NAME = "latte";
export const FALLBACK_ACCENT = "mauve";
export const DEFAULT_ACCENT = "sapphire";
export const ACCENT_RECIPE_PREFIX = "{{accent}}";
export const THEME_FILE_PREFIX = "calmppuccin";
export const THEME_FILE_SUFFIX = "color-theme.json";
export const THEME_TYPE_LIGHT = "light";
export const THEME_TYPE_DARK = "dark";

// User-facing messages
export const INFO_MESSAGE = (accent: string) =>
  `Calmppuccin accent updated to ${accent}. Reload to apply.`;
export const RELOAD_ACTION = "Reload Window";
export const REPORT_ISSUE_ACTION = "Report Issue";
export const ERROR_MESSAGE_PREFIX = "Failed to update Calmppuccin themes. Error: ";
export const REPO_ISSUES_URL = "https://github.com/KenanSalar/calmppuccin-vscode/issues";