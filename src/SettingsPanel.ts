/**
 * @file This file manages the logic for the Calmppuccin Customization webview panel.
 * It acts as a controller, handling communication between the webview UI and the extension's configuration.
 */

import * as vscode from "vscode";
import * as C from "./constants";
import { WebviewManager } from "./WebviewManager";
import { ConfigurationService } from "./ConfigurationService";
import { MessageToExtension } from "../types/webview";

/**
 * Manages the state and logic of the settings webview panel.
 * This class follows a singleton pattern to ensure only one panel exists.
 */
export class SettingsPanel {
  private static _instance: SettingsPanel | undefined;
  private readonly _context: vscode.ExtensionContext;
  /** Timer handle for debouncing webview updates. */
  private _pendingUpdate: ReturnType<typeof setTimeout> | undefined;

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
    WebviewManager.createOrShow(context, SettingsPanel._instance._handleMessage.bind(SettingsPanel._instance))
      .then(() => {
        SettingsPanel._instance?._update();
      })
      .catch((err: unknown) => {
        console.error("Failed to create webview panel:", err);
      });
  }

  /**
   * Sends updated settings to the webview panel if it is currently visible.
   */
  public static updateIfVisible() {
    SettingsPanel._instance?._update();
  }

  /**
   * Handles incoming messages from the webview panel.
   * @param {MessageToExtension} message The deserialized message object sent from the webview.
   */
  public async _handleMessage(message: MessageToExtension) {
    // The 'command' property is used as a discriminator for the message type.
    // TypeScript correctly infers the shape of 'message' in each case block.
    switch (message.command) {
      case C.WEBVIEW_CONSTANTS.UPDATE_SETTING: {
        const activeFlavor = ConfigurationService.getActiveFlavor();
        await ConfigurationService.updateFontStyleOverride(activeFlavor, message.key, message.value);
        return;
      }
      case C.WEBVIEW_CONSTANTS.RESET_FONT_STYLE: {
        const currentFlavor = ConfigurationService.getActiveFlavor();
        await ConfigurationService.resetFontStyleOverride(currentFlavor, message.key);
        return;
      }
      case C.WEBVIEW_CONSTANTS.UPDATE_ACCENT:
        await ConfigurationService.updateAccent(message.value);
        return;
      case C.WEBVIEW_CONSTANTS.UPDATE_CUSTOM_ACCENT:
        await ConfigurationService.updateCustomAccent(message.value);
        return;
      case C.WEBVIEW_CONSTANTS.UPDATE_SYNTAX_COLOR:
        await ConfigurationService.updateSyntaxColor(message.flavor, message.key, message.value);
        return;
      case C.WEBVIEW_CONSTANTS.RESET_SYNTAX_COLOR:
        await ConfigurationService.resetSyntaxColor(message.flavor, message.key);
        return;
      case C.WEBVIEW_CONSTANTS.UPDATE_UI_COLOR:
        await ConfigurationService.updateUiColor(message.flavor, message.key, message.value);
        return;
      case C.WEBVIEW_CONSTANTS.RESET_UI_COLOR:
        await ConfigurationService.resetUiColor(message.flavor, message.key);
        return;
      case C.WEBVIEW_CONSTANTS.RESET_ALL:
        await ConfigurationService.resetAll();
        this._update();
        return;
      case C.WEBVIEW_CONSTANTS.SWITCH_PROFILE:
        await ConfigurationService.updateActiveProfile(message.profile);
        this._update();
        return;
      case C.WEBVIEW_CONSTANTS.SAVE_PROFILE:
        await ConfigurationService.saveProfile(message.profile);
        await ConfigurationService.updateActiveProfile(message.profile);
        this._update();
        return;
      case C.WEBVIEW_CONSTANTS.DELETE_PROFILE:
        await ConfigurationService.deleteProfile(message.profile);
        this._update();
        return;
      default: {
        // Exhaustive check: TypeScript will error if a new command is added to MessageToExtension
        // but not handled above.
        const _exhaustiveCheck: never = message;
        console.warn("Unhandled webview message:", _exhaustiveCheck);
      }
    }
  }

  /**
   * Gathers all current settings via the ConfigurationService and posts them to the webview.
   * This method is debounced to prevent excessive recomputation during rapid changes
   * (e.g., dragging a color picker slider).
   */
  private _update() {
    if (!WebviewManager.currentPanel) return;

    // Clear any pending update to implement debouncing.
    if (this._pendingUpdate) {
      clearTimeout(this._pendingUpdate);
    }

    // Debounce updates to coalesce rapid setting changes.
    this._pendingUpdate = setTimeout(() => {
      this._pendingUpdate = undefined;
      if (!WebviewManager.currentPanel) return;

      // The ONLY responsibility of this method now is to get the complete settings payload and post it.
      const settings = ConfigurationService.getWebViewSettings();

      WebviewManager.currentPanel.postMessage({
        command: C.WEBVIEW_CONSTANTS.LOAD_SETTINGS,
        settings: settings,
      });
    }, C.WEBVIEW_UPDATE_DEBOUNCE_MS);
  }
}
