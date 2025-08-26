/**
 * @file This file contains the WebviewManager class, which is responsible for creating,
 * managing, and communicating with the extension's webview panel.
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as C from "./constants";
import { WebviewMessage } from "./SettingsPanel";
import { WebViewSettings } from "./ConfigurationService";

/** Defines the shape of messages sent from the extension *to* the webview. */
export type MessageToWebview = {
  command: "loadSettings";
  settings: WebViewSettings;
};

/**
 * Manages the lifecycle and communication of the Calmppuccin settings webview panel.
 * This class implements a singleton pattern to ensure only one instance of the panel exists at a time.
 */
export class WebviewManager {
  /** Holds the single, active instance of the WebviewManager. */
  public static currentPanel: WebviewManager | undefined;
  /** The underlying VS Code WebviewPanel instance. */
  private readonly _panel: vscode.WebviewPanel;
  /** A list of disposables to be cleaned up when the panel is closed. */
  private _disposables: vscode.Disposable[] = [];

  /**
   * Creates a new WebviewManager instance. This is private to enforce the singleton pattern.
   * @param {vscode.ExtensionContext} context The extension's context.
   * @param {(message: WebviewMessage) => void} messageHandler The callback function to handle messages received from the webview.
   */
  private constructor(context: vscode.ExtensionContext, messageHandler: (message: WebviewMessage) => void) {
    this._panel = vscode.window.createWebviewPanel(
      C.WEBVIEW_COMMANDS.WEBVIEW_ID,
      C.WEBVIEW_COMMANDS.WEBVIEW_TITLE,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        // Restrict the webview to only loading resources from our extension's directories.
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "dist")),
          vscode.Uri.file(path.join(context.extensionPath, "webview")),
        ],
        // Keep the webview's state even when it's not visible.
        retainContextWhenHidden: true,
      }
    );

    // Set the webview's initial HTML content and set up listeners for its lifecycle events.
    this._panel.webview.html = this._getHtmlForWebview(context.extensionPath);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.onDidReceiveMessage(messageHandler, null, this._disposables);
  }

  /**
   * The static method to either create a new webview panel or show the existing one.
   * @param {vscode.ExtensionContext} context The extension's context.
   * @param {(message: WebviewMessage) => void} messageHandler The callback for messages from the webview.
   * @param {() => void} [onReveal] An optional callback to run when an existing panel is revealed.
   */
  public static createOrShow(
    context: vscode.ExtensionContext,
    messageHandler: (message: WebviewMessage) => void,
    onReveal?: () => void
  ) {
    if (WebviewManager.currentPanel) {
      WebviewManager.currentPanel._panel.reveal(vscode.ViewColumn.One);
      if (onReveal) {
        onReveal();
      }
    } else {
      WebviewManager.currentPanel = new WebviewManager(context, messageHandler);
    }
  }

  /**
   * Sends a strongly-typed message to the webview script.
   * @param {MessageToWebview} message The message object to send.
   */
  public postMessage(message: MessageToWebview) {
    this._panel.webview.postMessage(message);
  }

  /**
   * Cleans up all resources associated with the panel when it is closed.
   */
  public dispose() {
    WebviewManager.currentPanel = undefined;
    this._panel.dispose();
    // Dispose all registered event listeners and other resources.
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }

  /**
   * Reads the webview's HTML file from disk and injects the correct URIs for styles and scripts.
   * @param {string} extensionPath The root path of the extension.
   * @returns {string} The HTML content with correctly resolved resource paths.
   * @private
   */
  private _getHtmlForWebview(extensionPath: string): string {
    const htmlPath = path.join(extensionPath, "webview", "index.html");
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Use `asWebviewUri` to create a special URI that VS Code allows the webview to load.
    const scriptUri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "dist", "webview.js")));
    const styleUri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "webview", "style.css")));

    // Replace the placeholder paths in the HTML with the generated URIs.
    htmlContent = htmlContent.replace("webview.js", scriptUri.toString());
    htmlContent = htmlContent.replace("style.css", styleUri.toString());

    return htmlContent;
  }
}
