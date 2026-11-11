/**
 * @file The host side of the customization UI: it checks each webview message, applies it through
 * `ConfigurationService`, and sends the settings back where the webview can't know the outcome.
 */

import * as vscode from "vscode";
import { MessageToExtension } from "../types/webview";
import { ConfigurationService } from "./ConfigurationService";
import * as C from "./constants";
import { WebviewManager } from "./WebviewManager";
import { parseWebviewMessage } from "./webviewMessages";

export class SettingsPanel {
  private static _instance: SettingsPanel | undefined;
  private _pendingUpdate: ReturnType<typeof setTimeout> | undefined;

  private constructor() {}

  /** Opens the customization UI, or reveals it, and sends it the settings. */
  public static createOrShow(context: vscode.ExtensionContext) {
    if (!SettingsPanel._instance) {
      SettingsPanel._instance = new SettingsPanel();
    }
    WebviewManager.createOrShow(
      context,
      SettingsPanel._instance._receiveMessage.bind(SettingsPanel._instance),
    )
      .then(() => {
        SettingsPanel._instance?._update();
      })
      .catch((err: unknown) => {
        console.error("Failed to create webview panel:", err);
      });
  }

  /** Sends the settings again if the panel is open, as after a theme switch changes the flavor. */
  public static updateIfVisible() {
    SettingsPanel._instance?._update();
  }

  /**
   * Checks a message from the webview and acts on it, reporting a failed settings write to the
   * user: VS Code ignores the promise a message listener returns.
   */
  private async _receiveMessage(raw: unknown) {
    const message = parseWebviewMessage(raw);
    if (!message) {
      console.warn("Ignored an invalid webview message:", raw);
      return;
    }
    try {
      await this._handleMessage(message);
    } catch (error) {
      console.error("Failed to apply a webview message:", error);
      const reason = error instanceof Error ? error.message : String(error);
      void vscode.window.showErrorMessage(C.SETTINGS_ERROR_MESSAGE_PREFIX + reason);
    }
  }

  /**
   * Applies a checked message. Only the commands whose outcome the webview can't know send the
   * settings back, since rebuilding the controls drops the user's focus.
   */
  public async _handleMessage(message: MessageToExtension) {
    switch (message.command) {
      case C.WEBVIEW_CONSTANTS.UPDATE_SETTING: {
        const activeFlavor = ConfigurationService.getActiveFlavor();
        await ConfigurationService.updateFontStyleOverride(
          activeFlavor,
          message.key,
          message.value,
        );
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
        const _exhaustiveCheck: never = message;
        console.warn("Unhandled webview message:", _exhaustiveCheck);
      }
    }
  }

  /** Posts the settings to the panel, debounced so a burst of calls sends one payload. */
  private _update() {
    if (!WebviewManager.currentPanel) return;

    if (this._pendingUpdate) {
      clearTimeout(this._pendingUpdate);
    }
    this._pendingUpdate = setTimeout(() => {
      this._pendingUpdate = undefined;
      if (!WebviewManager.currentPanel) return;

      const settings = ConfigurationService.getWebViewSettings();

      WebviewManager.currentPanel.postMessage({
        command: C.WEBVIEW_CONSTANTS.LOAD_SETTINGS,
        settings: settings,
      });
    }, C.WEBVIEW_UPDATE_DEBOUNCE_MS);
  }
}
