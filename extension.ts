/**
 * @file The entry point on a Node extension host. It activates once startup finishes, since
 * VS Code has no activation event for selecting a color theme, and stays behind one theme-change
 * listener until a Calmppuccin theme is selected or the customizer opens.
 */

import * as vscode from "vscode";
import { buildAllFlavors, ThemeBuilds } from "./build";
import { ConfigurationService } from "./src/ConfigurationService";
import * as C from "./src/constants";
import { IPalettes } from "./src/palettes";
import {
  COLOR_THEME_SETTING,
  isCalmppuccinThemeSelected,
  syncIconFlavor,
} from "./src/selectedTheme";
import { SettingsPanel } from "./src/SettingsPanel";

let settingsChangeListener: vscode.Disposable | undefined;
let tripwireListener: vscode.Disposable | undefined;
let regenerateTimer: ReturnType<typeof setTimeout> | undefined;
let latestBuild: Promise<unknown> = Promise.resolve();

// Each theme file as this host's first build found it, which is what the window shows until it
// reloads. Every window rebuilds the same files and only the first writes them, so a window asks
// whether they differ from these, not whether it wrote. A first build that follows another
// window's write, as when windows restart after an update, takes the new files as loaded.
let loadedThemes: ReadonlyMap<keyof IPalettes, string | undefined> | undefined;

/**
 * Rebuilds the themes from the current settings and offers a reload when they no longer match
 * what this window loaded.
 *
 * Runs whenever a Calmppuccin theme becomes relevant as well as after a settings change, because
 * an update installs the packaged default themes and settings can change while the extension is
 * inactive.
 */
async function regenerateThemes(): Promise<void> {
  try {
    const outdated = await queueBuild();
    if (!outdated) {
      return;
    }
    const selection = await vscode.window.showInformationMessage(C.INFO_MESSAGE, C.RELOAD_ACTION);
    if (selection === C.RELOAD_ACTION) {
      vscode.commands.executeCommand(C.RELOAD_COMMAND_ID).then(undefined, (err: unknown) => {
        console.error("Failed to reload window:", err);
      });
    }
  } catch (error) {
    console.error(error);
    const reason = error instanceof Error ? error.message : String(error);
    const selection = await vscode.window.showErrorMessage(
      C.ERROR_MESSAGE_PREFIX + reason,
      C.REPORT_ISSUE_ACTION,
    );
    if (selection === C.REPORT_ISSUE_ACTION) {
      await vscode.env.openExternal(vscode.Uri.parse(C.REPO_ISSUES_URL));
    }
  }
}

/**
 * Starts a build once the previous one has settled, reading the settings only then, so the files
 * a later build writes always land last.
 * @returns Whether a theme file now differs from the one this window loaded.
 */
function queueBuild(): Promise<boolean> {
  const build = latestBuild.then(async () => {
    const themes = await buildAllFlavors({
      accentIdentifier: ConfigurationService.getAccent(),
      fontStyles: ConfigurationService.getFontStyles(),
      syntaxOverrides: ConfigurationService.getSyntaxOverrides(),
      uiOverrides: ConfigurationService.getUiOverrides(),
      fontStyleOverrides: ConfigurationService.getFontStyleOverrides(),
    });
    loadedThemes ??= new Map(themes.entries().map(([flavor, theme]) => [flavor, theme.previous]));
    return differsFromLoaded(themes, loadedThemes);
  });
  // The caller reports a failure; the queue only needs to know the build settled.
  latestBuild = build.catch(() => undefined);
  return build;
}

function differsFromLoaded(
  themes: ThemeBuilds,
  loaded: ReadonlyMap<keyof IPalettes, string | undefined>,
): boolean {
  return themes.entries().some(([flavor, theme]) => theme.generated !== loaded.get(flavor));
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Calmppuccin extension activated.");

  if (typeof process === "undefined" || process.env.JEST_WORKER_ID === undefined) {
    ConfigurationService.migrateGlobalSettingsToDefault().catch((err: unknown) => {
      console.error("Failed to migrate settings:", err);
    });
  }

  const regenerateThemesCommand = vscode.commands.registerCommand(
    C.REGENERATE_COMMAND_ID,
    regenerateThemes,
  );
  const customizeCommand = vscode.commands.registerCommand(C.CUSTOMIZE_COMMAND_ID, () => {
    SettingsPanel.createOrShow(context);
    ensureListenersAreActive();
  });

  context.subscriptions.push(regenerateThemesCommand, customizeCommand);

  /** Swaps the tripwire for the settings listener, then rebuilds; later calls do nothing. */
  function ensureListenersAreActive() {
    if (settingsChangeListener) {
      return;
    }

    // The settings listener below watches the color theme too.
    if (tripwireListener) {
      tripwireListener.dispose();
      tripwireListener = undefined;
    }

    settingsChangeListener = vscode.workspace.onDidChangeConfiguration(
      (event: vscode.ConfigurationChangeEvent) => {
        if (ConfigurationService.affectsThemeSettings(event)) {
          if (regenerateTimer) {
            clearTimeout(regenerateTimer);
          }
          regenerateTimer = setTimeout(() => {
            regenerateTimer = undefined;
            vscode.commands
              .executeCommand(C.REGENERATE_COMMAND_ID)
              .then(undefined, (err: unknown) => {
                console.error("Failed to regenerate themes:", err);
              });
          }, C.REGENERATE_DEBOUNCE_MS);
        }

        if (event.affectsConfiguration(COLOR_THEME_SETTING)) {
          syncIconFlavor();
          SettingsPanel.updateIfVisible();
        }
      },
    );

    context.subscriptions.push(settingsChangeListener);
    syncIconFlavor();
    regenerateThemes().catch((err: unknown) => {
      console.error("Failed to regenerate themes:", err);
    });
  }

  // The tripwire: the one listener every window pays for until a Calmppuccin theme is selected.
  tripwireListener = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(COLOR_THEME_SETTING) && isCalmppuccinThemeSelected()) {
      ensureListenersAreActive();
    }
  });

  context.subscriptions.push(tripwireListener);

  // A window that starts under a Calmppuccin theme fires no theme change.
  if (isCalmppuccinThemeSelected()) {
    ensureListenersAreActive();
  }
}

export function deactivate() {
  if (regenerateTimer) {
    clearTimeout(regenerateTimer);
    regenerateTimer = undefined;
  }
  // VS Code disposes the listeners through `context.subscriptions`; forgetting them and the loaded
  // themes here lets a later activation in the same host start over.
  settingsChangeListener = undefined;
  tripwireListener = undefined;
  loadedThemes = undefined;
}
