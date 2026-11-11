/**
 * @file This file is the main entry point for the Calmppuccin VS Code extension.
 * It activates once startup finishes, since VS Code has no activation event for selecting a
 * color theme, and stays behind one theme-change listener until a Calmppuccin theme is selected
 * or the customizer opens.
 */

import * as vscode from "vscode";
import { buildAllFlavors } from "./build";
import { ConfigurationService } from "./src/ConfigurationService";
import * as C from "./src/constants";
import { SettingsPanel } from "./src/SettingsPanel";

// This disposable will hold the main settings listener. It's defined here
// to track its state and ensure it only registers it once.
let settingsChangeListener: vscode.Disposable | undefined;

// This disposable holds the lightweight "tripwire" listener that detects when
// a user switches to a Calmppuccin theme. It is disposed after full activation.
let tripwireListener: vscode.Disposable | undefined;
let regenerateTimer: ReturnType<typeof setTimeout> | undefined;
let latestBuild: Promise<unknown> = Promise.resolve();

/**
 * Maps Calmppuccin theme flavors to their corresponding Catppuccin Icon flavors.
 */
const flavorIconMap: Record<string, string> = {
  latte: "latte",
  frappe: "frappe",
  macchiato: "macchiato",
  mocha: "mocha",
  "nitro-cold-brew": "mocha",
  oledppuccin: "mocha",
};

/**
 * Checks the user's current color theme and icon theme to sync them.
 * If the user has a Catppuccin icon theme installed, this function
 * automatically syncs the icon theme flavor to match the color theme flavor.
 *
 * @remarks
 * Uses a retry mechanism because VS Code's workbench needs time to finish
 * applying the theme change before we can reliably read the new color theme.
 * Without this delay, we may read the previous theme value.
 *
 * @param {number} retryCount - Internal counter for retry attempts (default: 0).
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

    // If flavor is not detected yet and we haven't exhausted retries, try again
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
        .then(
          () => {
            /* success - no action needed */
          },
          (err: unknown) => {
            console.error("Failed to sync icon theme:", err);
          },
        );
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
      vscode.commands.executeCommand(C.RELOAD_COMMAND_ID).then(
        () => {
          /* success - no action needed */
        },
        (err: unknown) => {
          console.error("Failed to reload window:", err);
        },
      );
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

/**
 * This is the main activation function for the extension.
 * @param {vscode.ExtensionContext} context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("Calmppuccin extension activated.");

  // Migrate existing global settings to Default profile (skip in test environment)
  if (typeof process === "undefined" || process.env.JEST_WORKER_ID === undefined) {
    ConfigurationService.migrateGlobalSettingsToDefault().catch((err: unknown) => {
      console.error("Failed to migrate settings:", err);
    });
  }

  // This internal command is used by the extension itself to regenerate themes.
  const regenerateThemesCommand = vscode.commands.registerCommand(
    C.REGENERATE_COMMAND_ID,
    regenerateThemes,
  );

  // This is the command that opens the customization UI. Because it's declared in `package.json`,
  // running it will activate the extension for the first time.
  const customizeCommand = vscode.commands.registerCommand(C.CUSTOMIZE_COMMAND_ID, () => {
    SettingsPanel.createOrShow(context);
    // When the user opens the UI, we ensure all our powerful listeners are running.
    ensureListenersAreActive();
  });

  context.subscriptions.push(regenerateThemesCommand, customizeCommand);

  /**
   * Sets up the "heavy" listeners that react to settings changes and theme switches.
   * This function is designed to run only once.
   */
  function ensureListenersAreActive() {
    // If the listener has already been registered, do nothing.
    if (settingsChangeListener) {
      return;
    }

    // Dispose the tripwire listener now that we're fully activating.
    // This prevents redundant theme checks on every configuration change.
    if (tripwireListener) {
      tripwireListener.dispose();
      tripwireListener = undefined;
    }

    // This is the main listener that handles automatic theme regeneration and icon syncing.
    settingsChangeListener = vscode.workspace.onDidChangeConfiguration(
      (event: vscode.ConfigurationChangeEvent) => {
        // If a Calmppuccin-specific setting changed, regenerate the themes (debounced).
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
            vscode.commands.executeCommand(C.REGENERATE_COMMAND_ID).then(
              () => {
                /* success */
              },
              (err: unknown) => {
                console.error("Failed to regenerate themes:", err);
              },
            );
          }, C.REGENERATE_DEBOUNCE_MS);
        }

        // If the user changed their color theme, sync the icons and update the webview.
        if (event.affectsConfiguration("workbench.colorTheme")) {
          syncIconFlavor();
          SettingsPanel.updateIfVisible();
        }
      },
    );

    context.subscriptions.push(settingsChangeListener);
    // Run an initial icon sync now that the listeners are active.
    syncIconFlavor();
    regenerateThemes().catch((err: unknown) => {
      console.error("Failed to regenerate themes:", err);
    });
  }

  // This lightweight, always-on listener acts as a "tripwire". Its only job is to
  // fully activate our extension's features if a user switches TO a Calmppuccin theme.
  // It is disposed after full activation to avoid redundant checks.
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

  // Finally, check if the user is already using our theme when VS Code starts.
  // This ensures that features like icon syncing work correctly from the get-go
  // for existing users.
  const currentTheme = vscode.workspace.getConfiguration("workbench").get<string>("colorTheme", "");
  if (currentTheme.toLowerCase().startsWith("calmppuccin")) {
    ensureListenersAreActive();
  }
}

/**
 * This method is called when the extension is deactivated.
 */
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
