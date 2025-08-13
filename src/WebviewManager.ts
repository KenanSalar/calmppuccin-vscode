import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as C from "./constants";

export class WebviewManager {
  public static currentPanel: WebviewManager | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(context: vscode.ExtensionContext, messageHandler: (message: any) => void) {
    this._panel = vscode.window.createWebviewPanel(
      C.WEBVIEW_COMMANDS.WEBVIEW_ID,
      C.WEBVIEW_COMMANDS.WEBVIEW_TITLE,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "dist")),
          vscode.Uri.file(path.join(context.extensionPath, "webview")),
        ],
        retainContextWhenHidden: true,
      }
    );

    this._panel.webview.html = this._getHtmlForWebview(context.extensionPath);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.onDidReceiveMessage(messageHandler, null, this._disposables);
  }

  public static createOrShow(context: vscode.ExtensionContext, messageHandler: (message: any) => void) {
    if (WebviewManager.currentPanel) {
      WebviewManager.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      WebviewManager.currentPanel = new WebviewManager(context, messageHandler);
    }
  }

  public postMessage(message: any) {
    this._panel.webview.postMessage(message);
  }

  public dispose() {
    WebviewManager.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }

  private _getHtmlForWebview(extensionPath: string): string {
    const htmlPath = path.join(extensionPath, "webview", "index.html");
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    const scriptUri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "dist", "webview.js")));
    const styleUri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "webview", "style.css")));

    htmlContent = htmlContent.replace("webview.js", scriptUri.toString());
    htmlContent = htmlContent.replace("style.css", styleUri.toString());

    return htmlContent;
  }
}
