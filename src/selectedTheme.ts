/**
 * @file The color theme the workbench has selected, read from `workbench.colorTheme`, and the
 * Catppuccin icon theme kept on its flavor.
 */

import * as vscode from "vscode";
import * as C from "./constants";
import { IPalettes, isFlavor } from "./palettes";

export const COLOR_THEME_SETTING = `${C.WORKBENCH_SECTION}.${C.COLOR_THEME_KEY}`;

export function isCalmppuccinThemeSelected(): boolean {
  const themeName = vscode.workspace
    .getConfiguration(C.WORKBENCH_SECTION)
    .get<string>(C.COLOR_THEME_KEY, "");
  return C.parseFlavorFromThemeName(themeName) !== null;
}

// Catppuccin Icons has only the four Catppuccin flavors.
const ICON_FLAVORS = {
  latte: "latte",
  frappe: "frappe",
  macchiato: "macchiato",
  mocha: "mocha",
  "nitro-cold-brew": "mocha",
  oledppuccin: "mocha",
} as const satisfies Record<keyof IPalettes, string>;

/**
 * Switches a Catppuccin icon theme to the flavor matching the selected color theme.
 *
 * Waits, and retries, because the workbench may not have applied a theme change yet, and reading
 * too early returns the previous theme.
 */
export function syncIconFlavor(retryCount = 0) {
  const delay = retryCount === 0 ? C.ICON_SYNC_INITIAL_DELAY_MS : C.ICON_SYNC_RETRY_DELAY_MS;

  setTimeout(() => {
    const workbenchConfig = vscode.workspace.getConfiguration(C.WORKBENCH_SECTION);
    const currentTheme = workbenchConfig.get<string>(C.COLOR_THEME_KEY, "");
    const currentIconTheme = workbenchConfig.get<string>(C.ICON_THEME_KEY);

    if (!currentIconTheme || !currentIconTheme.startsWith(C.CATPPUCCIN_ICON_PACK_ID)) {
      return;
    }
    const flavor = C.parseFlavorFromThemeName(currentTheme);
    if (!flavor && retryCount < C.ICON_SYNC_MAX_RETRIES) {
      syncIconFlavor(retryCount + 1);
      return;
    }

    if (!flavor || !isFlavor(flavor)) {
      return;
    }
    const targetIconThemeId = `${C.CATPPUCCIN_ICON_PACK_ID}${ICON_FLAVORS[flavor]}`;
    if (currentIconTheme !== targetIconThemeId) {
      workbenchConfig
        .update(C.ICON_THEME_KEY, targetIconThemeId, vscode.ConfigurationTarget.Global)
        .then(undefined, (err: unknown) => {
          console.error("Failed to sync icon theme:", err);
        });
    }
  }, delay);
}
