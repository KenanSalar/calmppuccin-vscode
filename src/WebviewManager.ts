/**
 * @file This file contains the WebviewManager class, which is responsible for creating,
 * managing, and communicating with the extension's webview panel.
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import * as C from "./constants";
import { MessageToExtension, MessageToWebview } from "../types/webview";

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
   * Use the static createOrShow method instead.
   * @param {vscode.WebviewPanel} panel The webview panel instance.
   * @param {(message: MessageToExtension) => void} messageHandler The callback function to handle messages received from the webview.
   */
  private constructor(panel: vscode.WebviewPanel, messageHandler: (message: MessageToExtension) => void | Promise<void>) {
    this._panel = panel;
    this._panel.onDidDispose(() => { this.dispose(); }, null, this._disposables);
    this._panel.webview.onDidReceiveMessage(messageHandler, null, this._disposables);
  }

  /**
   * The static method to either create a new webview panel or show the existing one.
   * Uses async file reading to avoid blocking the extension host thread.
   * @param {vscode.ExtensionContext} context The extension's context.
   * @param {(message: MessageToExtension) => void} messageHandler The callback for messages from the webview.
   * @param {() => void} [onReveal] An optional callback to run when an existing panel is revealed.
   */
  public static async createOrShow(
    context: vscode.ExtensionContext,
    messageHandler: (message: MessageToExtension) => void | Promise<void>,
    onReveal?: () => void
  ): Promise<void> {
    if (WebviewManager.currentPanel) {
      WebviewManager.currentPanel._panel.reveal(vscode.ViewColumn.One);
      if (onReveal) {
        onReveal();
      }
      return;
    }

    // Create the panel first so it appears immediately.
    const panel = vscode.window.createWebviewPanel(
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

    // Set currentPanel IMMEDIATELY after panel creation to prevent race conditions.
    // The constructor only sets up dispose/message handlers, not HTML content.
    WebviewManager.currentPanel = new WebviewManager(panel, messageHandler);

    // Load HTML asynchronously to avoid blocking the extension host.
    const htmlContent = await WebviewManager._getHtmlForWebview(context.extensionPath, panel.webview);
    panel.webview.html = htmlContent;
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
   * Reads the webview's HTML file from disk asynchronously and injects the correct URIs for styles and scripts.
   * @param {string} extensionPath The root path of the extension.
   * @param {vscode.Webview} webview The webview instance for URI generation.
   * @returns {Promise<string>} The HTML content with correctly resolved resource paths.
   * @private
   */
  private static async _getHtmlForWebview(extensionPath: string, webview: vscode.Webview): Promise<string> {
    const htmlPath = path.join(extensionPath, "webview", "index.html");
    let htmlContent = await fs.readFile(htmlPath, "utf8");

    // Use `asWebviewUri` to create a special URI that VS Code allows the webview to load.
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "dist", "webview.js")));
    const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "webview", "style.css")));

    // Replace the placeholder paths in the HTML with the generated URIs.
    htmlContent = htmlContent.replace("webview.js", scriptUri.toString());
    htmlContent = htmlContent.replace("style.css", styleUri.toString());

    return htmlContent;
  }
}
