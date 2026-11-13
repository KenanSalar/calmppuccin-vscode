/**
 * @file The entry point on VS Code for the Web, whose extension files are served read-only and
 * whose host has no Node modules. The packaged default themes apply, and customizing gets a note.
 */

import * as vscode from "vscode";
import { affectsThemeSettings } from "./src/config/ConfigAccess";
import { isThemeCustomized } from "./src/config/SettingsReader";
import * as C from "./src/constants";
import {
  COLOR_THEME_SETTING,
  isCalmppuccinThemeSelected,
  syncIconFlavor,
} from "./src/selectedTheme";

// At most one automatic showing per window; Customize Theme shows the note regardless.
let noteShownThisWindow = false;

export function activate(context: vscode.ExtensionContext) {
  // vscode.dev and github.dev keep separate storage; Settings Sync carries a dismissal across.
  context.globalState.setKeysForSync([C.WEB_NOTE_DISMISSED_KEY]);

  const customizeCommand = vscode.commands.registerCommand(C.CUSTOMIZE_COMMAND_ID, showNote);
  const settingsListener = vscode.workspace.onDidChangeConfiguration((event) => {
    const themeChanged = event.affectsConfiguration(COLOR_THEME_SETTING);
    if (themeChanged) {
      syncIconFlavor();
    }
    // The startup check again, as either of its inputs can change after activation.
    if ((themeChanged || affectsThemeSettings(event)) && isCalmppuccinThemeSelected()) {
      showNoteIfCustomized(context.globalState);
    }
  });
  context.subscriptions.push(customizeCommand, settingsListener);

  if (!isCalmppuccinThemeSelected()) {
    return;
  }
  syncIconFlavor();
  // Settings Sync can apply customized settings before activation, which fires no change event.
  showNoteIfCustomized(context.globalState);
}

export function deactivate() {
  noteShownThisWindow = false;
}

/** Answers every press of Customize Theme, as a press met with silence reads as broken. */
function showNote() {
  void vscode.window.showInformationMessage(C.WEB_CUSTOMIZATION_NOTE);
}

function showNoteIfCustomized(globalState: vscode.Memento) {
  if (isThemeCustomized()) {
    showNoteOncePerWindow(globalState);
  }
}

function showNoteOncePerWindow(globalState: vscode.Memento) {
  if (noteShownThisWindow || globalState.get(C.WEB_NOTE_DISMISSED_KEY, false)) {
    return;
  }
  noteShownThisWindow = true;
  showDismissibleNote(globalState).catch((err: unknown) => {
    console.error("Failed to save the note's dismissal:", err);
  });
}

async function showDismissibleNote(globalState: vscode.Memento) {
  const selection = await vscode.window.showInformationMessage(
    C.WEB_CUSTOMIZATION_NOTE,
    C.DONT_SHOW_AGAIN_ACTION,
  );
  if (selection === C.DONT_SHOW_AGAIN_ACTION) {
    await globalState.update(C.WEB_NOTE_DISMISSED_KEY, true);
  }
}
