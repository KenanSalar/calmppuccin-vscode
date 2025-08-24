/**
 * @file This file manages the logic for the Calmppuccin Customization webview panel.
 * It acts as a controller, handling communication between the webview UI and the extension's configuration.
 */

import * as vscode from "vscode";
import * as C from "./constants";
import { WebviewManager } from "./WebviewManager";
import { ConfigurationService } from "./ConfigurationService";

// #region Webview Message Types
/** Defines a message to update a font style setting. */
type UpdateSettingMessage = { command: "updateSetting"; key: string; value: string };
/** Defines a message to reset a font style setting to its default. */
type ResetFontStyleMessage = { command: "resetFontStyle"; key: string };
/** Defines a message to update the active accent color. */
type UpdateAccentMessage = { command: "updateAccent"; value: string };
/** Defines a message to update the custom accent color hex code. */
type UpdateCustomAccentMessage = { command: "updateCustomAccent"; value: string };
/** Defines a message to update a specific syntax color for a flavor. */
type UpdateSyntaxColorMessage = { command: "updateSyntaxColor"; flavor: string; key: string; value: string };
/** Defines a message to reset a specific syntax color for a flavor. */
type ResetSyntaxColorMessage = { command: "resetSyntaxColor"; flavor: string; key: string };
/** Defines a message to reset all extension settings to their defaults. */
type ResetAllMessage = { command: "resetAll" };

/** A discriminated union of all possible messages that can be sent from the webview to the extension. */
export type WebviewMessage =
  | UpdateSettingMessage
  | ResetFontStyleMessage
  | UpdateAccentMessage
  | UpdateCustomAccentMessage
  | UpdateSyntaxColorMessage
  | ResetSyntaxColorMessage
  | ResetAllMessage;
// #endregion

/**
 * Manages the state and logic of the settings webview panel.
 * This class follows a singleton pattern to ensure only one panel exists.
 */
export class SettingsPanel {
  private static _instance: SettingsPanel | undefined;
  private readonly _context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  /**
   * Creates a new settings panel or reveals the existing one.
   * @param {vscode.ExtensionContext} context The extension context from VS Code.
   */
  public static createOrShow(context: vscode.ExtensionContext) {
    if (!SettingsPanel._instance) {
      SettingsPanel._instance = new SettingsPanel(context);
    }
    WebviewManager.createOrShow(context, SettingsPanel._instance._handleMessage.bind(SettingsPanel._instance));
    SettingsPanel._instance._update();
  }

  /**
   * Sends updated settings to the webview panel if it is currently visible.
   */
  public static updateIfVisible() {
    SettingsPanel._instance?._update();
  }

  /**
   * Handles incoming messages from the webview panel.
   * @param {WebviewMessage} message The deserialized message object sent from the webview.
   */
  public async _handleMessage(message: WebviewMessage) {
    // The 'command' property is used as a discriminator for the message type.
    // TypeScript correctly infers the shape of 'message' in each case block.
    switch (message.command) {
      case C.WEBVIEW_COMMANDS.UPDATE_SETTING:
        await ConfigurationService.updateFontStyle(message.key, message.value);
        return;
      case C.WEBVIEW_COMMANDS.RESET_FONT_STYLE:
        await ConfigurationService.resetFontStyle(message.key);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_ACCENT:
        await ConfigurationService.updateAccent(message.value);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_CUSTOM_ACCENT:
        await ConfigurationService.updateCustomAccent(message.value);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_SYNTAX_COLOR:
        await ConfigurationService.updateSyntaxColor(message.flavor, message.key, message.value);
        return;
      case C.WEBVIEW_COMMANDS.RESET_SYNTAX_COLOR:
        await ConfigurationService.resetSyntaxColor(message.flavor, message.key);
        return;
      case C.WEBVIEW_COMMANDS.RESET_ALL:
        await ConfigurationService.resetAll();
        this._update();
        return;
    }
  }

  /**
   * Gathers all current settings via the ConfigurationService and posts them to the webview.
   */
  private _update() {
    if (!WebviewManager.currentPanel) return;

    // The ONLY responsibility of this method now is to get the complete settings payload and post it.
    const settings = ConfigurationService.getWebViewSettings();

    WebviewManager.currentPanel.postMessage({
      command: C.WEBVIEW_COMMANDS.LOAD_SETTINGS,
      settings: settings,
    });
  }
}
