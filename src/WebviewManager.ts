/** @file The customization panel's lifecycle, and the HTML it loads under a CSP. */

import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";
import { MessageToWebview } from "../types/webview";
import * as C from "./constants";

export class WebviewManager {
  /** The open panel, or `undefined` once it's closed; there is at most one. */
  public static currentPanel: WebviewManager | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _disposed = false;

  private constructor(
    panel: vscode.WebviewPanel,
    messageHandler: (message: unknown) => Promise<void>,
  ) {
    this._panel = panel;
    this._panel.onDidDispose(
      () => {
        // VS Code already disposed the panel, so only clean up our own resources.
        this._disposed = true;
        WebviewManager.currentPanel = undefined;
        while (this._disposables.length) {
          this._disposables.pop()?.dispose();
        }
      },
      null,
      this._disposables,
    );
    this._panel.webview.onDidReceiveMessage(messageHandler, null, this._disposables);
  }

  /**
   * Reveals the open panel, or creates one and loads its HTML.
   * @param onReveal - Runs when an open panel is revealed rather than created.
   */
  public static async createOrShow(
    context: vscode.ExtensionContext,
    messageHandler: (message: unknown) => Promise<void>,
    onReveal?: () => void,
  ): Promise<void> {
    if (WebviewManager.currentPanel) {
      WebviewManager.currentPanel._panel.reveal(vscode.ViewColumn.One);
      if (onReveal) {
        onReveal();
      }
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      C.WEBVIEW_CONSTANTS.WEBVIEW_ID,
      C.WEBVIEW_CONSTANTS.WEBVIEW_TITLE,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "dist")),
          vscode.Uri.file(path.join(context.extensionPath, "webview")),
        ],
        retainContextWhenHidden: true,
      },
    );

    // Set before the await below, so a second call during it reveals this panel.
    WebviewManager.currentPanel = new WebviewManager(panel, messageHandler);

    const htmlContent = await WebviewManager._getHtmlForWebview(
      context.extensionPath,
      panel.webview,
    );
    panel.webview.html = htmlContent;
  }

  public postMessage(message: MessageToWebview) {
    this._panel.webview.postMessage(message).then(undefined, (err: unknown) => {
      console.error("Failed to post a message to the webview:", err);
    });
  }

  /** Closes the panel; calling it again does nothing. */
  public dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    WebviewManager.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }

  /** Reads `index.html`, points its script and stylesheet at webview URIs, and adds the CSP. */
  private static async _getHtmlForWebview(
    extensionPath: string,
    webview: vscode.Webview,
  ): Promise<string> {
    const htmlPath = path.join(extensionPath, "webview", "index.html");
    let htmlContent = await fs.readFile(htmlPath, "utf8");

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(extensionPath, "dist", "webview.js")),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(extensionPath, "webview", "style.css")),
    );

    // `index.html` names each file once, by its bare name.
    htmlContent = htmlContent.replace("webview.js", scriptUri.toString());
    htmlContent = htmlContent.replace("style.css", styleUri.toString());

    // No inline script or style passes this policy: a `<script>`, `<style>` or `style=` in the
    // page is dropped.
    const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src ${webview.cspSource}; script-src ${webview.cspSource};">`;
    htmlContent = htmlContent.replace("</head>", `${csp}\n  </head>`);

    return htmlContent;
  }
}
