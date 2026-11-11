/**
 * @file The extension's entry point. It activates once startup finishes, since VS Code has no
 * activation event for selecting a color theme, and stays behind one theme-change listener until
 * a Calmppuccin theme is selected or the customizer opens.
 */

import * as vscode from "vscode";
import { buildAllFlavors } from "./build";
import { ConfigurationService } from "./src/ConfigurationService";
import * as C from "./src/constants";
import { SettingsPanel } from "./src/SettingsPanel";

let settingsChangeListener: vscode.Disposable | undefined;
let tripwireListener: vscode.Disposable | undefined;
let regenerateTimer: ReturnType<typeof setTimeout> | undefined;
let latestBuild: Promise<unknown> = Promise.resolve();

// Catppuccin Icons has only the four Catppuccin flavors.
const flavorIconMap: Record<string, string> = {
  latte: "latte",
  frappe: "frappe",
  macchiato: "macchiato",
  mocha: "mocha",
  "nitro-cold-brew": "mocha",
  oledppuccin: "mocha",
};

/**
 * Switches a Catppuccin icon theme to the flavor matching the selected color theme.
 *
 * Waits, and retries, because the workbench may not have applied a theme change yet, and reading
 * too early returns the previous theme.
 */
function syncIconFlavor(retryCount = 0) {
  const delay = retryCount === 0 ? C.ICON_SYNC_INITIAL_DELAY_MS : C.ICON_SYNC_RETRY_DELAY_MS;

  setTimeout(() => {
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const currentTheme = workbenchConfig.get<string>("colorTheme", "");
    const currentIconTheme = workbenchConfig.get<string>("iconTheme");

    if (!currentIconTheme || !currentIconTheme.startsWith(C.CATPPUCCIN_ICON_PACK_ID)) {
      return;
    }
    const flavor = C.parseFlavorFromThemeName(currentTheme);
    if (!flavor && retryCount < C.ICON_SYNC_MAX_RETRIES) {
      syncIconFlavor(retryCount + 1);
      return;
    }

    if (!flavor || !flavorIconMap[flavor]) {
      return;
    }
    const targetIconFlavor = flavorIconMap[flavor];
    const targetIconThemeId = `${C.CATPPUCCIN_ICON_PACK_ID}${targetIconFlavor}`;
    if (currentIconTheme !== targetIconThemeId) {
      workbenchConfig
        .update("iconTheme", targetIconThemeId, vscode.ConfigurationTarget.Global)
        .then(undefined, (err: unknown) => {
          console.error("Failed to sync icon theme:", err);
        });
    }
  }, delay);
}

/**
 * Rebuilds the themes from the current settings and offers a reload when a file changed.
 *
 * Runs whenever a Calmppuccin theme becomes relevant as well as after a settings change, because
 * an update installs the packaged default themes and settings can change while the extension is
 * inactive.
 */
async function regenerateThemes(): Promise<void> {
  try {
    const changed = await queueBuild();
    if (!changed) {
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
    let errorMessage = C.ERROR_MESSAGE_PREFIX;
    if (error instanceof Error) {
      errorMessage += error.message;
    } else {
      errorMessage += String(error);
    }
    const selection = await vscode.window.showErrorMessage(errorMessage, C.REPORT_ISSUE_ACTION);
    if (selection === C.REPORT_ISSUE_ACTION) {
      await vscode.env.openExternal(vscode.Uri.parse(C.REPO_ISSUES_URL));
    }
  }
}

/**
 * Starts a build once the previous one has settled, reading the settings only then, so the files
 * a later build writes always land last.
 * @returns Whether any theme file changed.
 */
function queueBuild(): Promise<boolean> {
  const build = latestBuild.then(() =>
    buildAllFlavors({
      accentIdentifier: ConfigurationService.getAccent(),
      fontStyles: ConfigurationService.getFontStyles(),
      syntaxOverrides: ConfigurationService.getSyntaxOverrides(),
      uiOverrides: ConfigurationService.getUiOverrides(),
      fontStyleOverrides: ConfigurationService.getFontStyleOverrides(),
    }),
  );
  // The caller reports a failure; the queue only needs to know the build settled.
  latestBuild = build.catch(() => undefined);
  return build;
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
        if (
          C.THEME_AFFECTING_KEYS.some((key) =>
            event.affectsConfiguration(`${C.EXTENSION_NAMESPACE}.${key}`),
          )
        ) {
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

        if (event.affectsConfiguration("workbench.colorTheme")) {
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
    if (event.affectsConfiguration("workbench.colorTheme")) {
      const currentTheme = vscode.workspace
        .getConfiguration("workbench")
        .get<string>("colorTheme", "");
      if (currentTheme.toLowerCase().startsWith("calmppuccin")) {
        ensureListenersAreActive();
      }
    }
  });

  context.subscriptions.push(tripwireListener);

  // A window that starts under a Calmppuccin theme fires no theme change.
  const currentTheme = vscode.workspace.getConfiguration("workbench").get<string>("colorTheme", "");
  if (currentTheme.toLowerCase().startsWith("calmppuccin")) {
    ensureListenersAreActive();
  }
}

export function deactivate() {
  if (regenerateTimer) {
    clearTimeout(regenerateTimer);
    regenerateTimer = undefined;
  }
  // VS Code disposes the listeners through `context.subscriptions`; forgetting them here lets a
  // later activation in the same host register them again.
  settingsChangeListener = undefined;
  tripwireListener = undefined;
}
