import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as C from "./constants";

export class SettingsPanel {
  public static currentPanel: SettingsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext; // Store context
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._context = context; // Assign context

    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.onDidChangeViewState(() => this._update(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
        switch (message.command) {
          case "updateSetting": {
            const { key, value } = message;
            const fontStyles = config.get("fontStyles", {});
            const newFontStyles = { ...fontStyles, [key]: value };
            await config.update("fontStyles", newFontStyles, vscode.ConfigurationTarget.Global);
            return;
          }
          case "updateAccent":
            await config.update(C.CONFIG_KEY_ACCENT, message.value, vscode.ConfigurationTarget.Global);
            return;
          case "updateCustomAccent":
            await config.update(C.CONFIG_KEY_CUSTOM_ACCENT, message.value, vscode.ConfigurationTarget.Global);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    const extensionPath = context.extensionPath;

    if (SettingsPanel.currentPanel) {
      SettingsPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "calmppuccinSettings",
      "Calmppuccin Settings",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, "dist")),
          vscode.Uri.file(path.join(extensionPath, "webview")),
        ],
        retainContextWhenHidden: true,
      }
    );

    // Create the panel and set the state to true
    SettingsPanel.currentPanel = new SettingsPanel(panel, context);
    context.globalState.update(C.PANEL_IS_OPEN_KEY, true);
  }

  private _update() {
    if (!this._panel.visible) return;

    const webview = this._panel.webview;
    const extensionPath = this._context.extensionPath;

    this._panel.title = "Calmppuccin Customization";
    webview.html = this._getHtmlForWebview(extensionPath);

    const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
    const fontStyles = config.get("fontStyles");

    const currentAccent = config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const customAccentColor = config.get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;
    const accentOptions =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];

    webview.postMessage({
      command: "loadSettings",
      settings: {
        fontStyles,
        currentAccent,
        accentOptions,
        customAccentColor,
      },
    });
  }

  private _getHtmlForWebview(extensionPath: string): string {
    const htmlPath = path.join(extensionPath, "webview", "index.html");
    let htmlContent = fs.readFileSync(htmlPath, "utf8");
    const scriptPath = vscode.Uri.file(path.join(extensionPath, "dist", "webview.js"));
    const scriptUri = this._panel.webview.asWebviewUri(scriptPath);
    const stylePath = vscode.Uri.file(path.join(extensionPath, "webview", "style.css"));
    const styleUri = this._panel.webview.asWebviewUri(stylePath);
    htmlContent = htmlContent.replace("webview.js", scriptUri.toString());
    htmlContent = htmlContent.replace("style.css", styleUri.toString());
    return htmlContent;
  }

  public dispose() {
    // When the panel is disposed (closed by user), set the state to false
    this._context.globalState.update(C.PANEL_IS_OPEN_KEY, false);

    SettingsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
