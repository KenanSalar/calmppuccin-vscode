import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as C from "./constants";
import palettes from "./palette";

/**
 * An array of syntax keys that are customizable in the UI.
 * This acts as a single source of truth for which options to display.
 */
const customizableSyntaxKeys = [
  "comment",
  "variable",
  "keyword",
  "namespace",
  "namespaceAttribute",
  "module",
  "annotation",
  "class",
  "interface",
  "struct",
  "enum",
  "enumMember",
  "fieldAndAttribute",
  "attributeBracket",
  "property",
  "propertyReadOnly",
  "functionAndMethod",
  "extensionMethod",
  "delegate",
  "event",
  "parameter",
  "typeParameter",
  "numberAndConstant",
  "operator",
  "operatorOverload",
  "punctuation",
  "string",
  "stringTemplateExpression",
  "stringVerbatim",
  "text",
];

export class SettingsPanel {
  public static currentPanel: SettingsPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._context = context;

    // Set up initial state and listeners
    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.onDidChangeViewState(() => this._update(), null, this._disposables);

    // Listen for messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);

        switch (message.command) {
          // Handles updates to any font style dropdown
          case "updateSetting": {
            const { key, value } = message;
            const fontStyles = config.get("fontStyles", {});
            const newFontStyles = { ...fontStyles, [key]: value };
            await config.update("fontStyles", newFontStyles, vscode.ConfigurationTarget.Global);
            return;
          }
          // Handles resetting a specific font style to its default
          case "resetFontStyle": {
            const { key } = message;
            const currentFontStyles = config.get<any>("fontStyles", {});
            // Create a deep copy to ensure VS Code detects the change
            const newFontStyles = JSON.parse(JSON.stringify(currentFontStyles));

            if (newFontStyles[key]) {
              delete newFontStyles[key];
              await config.update("fontStyles", newFontStyles, vscode.ConfigurationTarget.Global);
            }
            return;
          }
          // Handles updates to the accent color dropdown
          case "updateAccent":
            await config.update(C.CONFIG_KEY_ACCENT, message.value, vscode.ConfigurationTarget.Global);
            return;
          // Handles updates to the custom accent color picker
          case "updateCustomAccent":
            await config.update(C.CONFIG_KEY_CUSTOM_ACCENT, message.value, vscode.ConfigurationTarget.Global);
            return;
          // Handles updates to any syntax color picker
          case "updateSyntaxColor": {
            const { flavor, key, value } = message;
            const syntaxOverrides = config.get<any>("syntaxOverrides", {});
            if (!syntaxOverrides[flavor]) {
              syntaxOverrides[flavor] = {};
            }
            syntaxOverrides[flavor][key] = value;
            await config.update("syntaxOverrides", syntaxOverrides, vscode.ConfigurationTarget.Global);
            return;
          }
          // Handles resetting a specific syntax color to its default for the active theme
          case "resetSyntaxColor": {
            const { flavor, key } = message;
            const currentOverrides = config.get<any>("syntaxOverrides", {});
            // Create a deep copy to ensure the change is detected
            const newOverrides = JSON.parse(JSON.stringify(currentOverrides));

            if (newOverrides[flavor] && newOverrides[flavor][key]) {
              delete newOverrides[flavor][key];
              // If the flavor object is now empty, remove it completely for a clean config
              if (Object.keys(newOverrides[flavor]).length === 0) {
                delete newOverrides[flavor];
              }
              await config.update("syntaxOverrides", newOverrides, vscode.ConfigurationTarget.Global);
            }
            return;
          }
        }
      },
      null,
      this._disposables
    );
  }

  // Creates a new panel or shows an existing one
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

    SettingsPanel.currentPanel = new SettingsPanel(panel, context);
    context.globalState.update(C.PANEL_IS_OPEN_KEY, true);
  }

  // Allows the main extension to trigger a webview update (e.g., when the theme changes)
  public static updateIfVisible() {
    if (SettingsPanel.currentPanel) {
      SettingsPanel.currentPanel._update();
    }
  }

  // Helper to parse the flavor name from the full theme name
  private _getFlavorFromTheme(themeName: string): string | null {
    const calmppuccinPrefix = "calmppuccin ";
    if (themeName.toLowerCase().startsWith(calmppuccinPrefix)) {
      return themeName
        .slice(calmppuccinPrefix.length)
        .toLowerCase()
        .replace(" ", "-") // Handle multi-word names like "Nitro Cold Brew"
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
    return null;
  }

  // Main method to gather all data and send it to the webview
  private _update() {
    if (!this._panel.visible) return;

    const webview = this._panel.webview;
    const extensionPath = this._context.extensionPath;

    this._panel.title = "Calmppuccin Customization";
    webview.html = this._getHtmlForWebview(extensionPath);

    // Get all necessary configuration objects
    const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;

    // Determine the active theme flavor to show the correct colors
    const activeTheme = workbenchConfig.get<string>("colorTheme", "Calmppuccin Mocha");
    const activeFlavor = this._getFlavorFromTheme(activeTheme) || "mocha";

    // Get all current user settings and overrides
    const fontStyles = config.get("fontStyles");
    const syntaxOverrides = config.get<any>("syntaxOverrides", {});
    const currentAccent = config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const customAccentColor = config.get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

    // Get default values from package.json to compare against for the "Reset" functionality
    const defaultFontStyles =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.fontStyles`]?.default ?? {};
    const accentOptions =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];

    // Prepare the data payload for the webview
    const defaultPalette = (palettes as any)[activeFlavor];
    const overridePalette = syntaxOverrides[activeFlavor] || {};

    const syntaxSettings = customizableSyntaxKeys.map((key) => {
      const fontStyleKey = `${key}FontStyle`;
      return {
        key: key,
        fontStyle: (fontStyles as any)[fontStyleKey] || "none",
        color: overridePalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      };
    });

    // Post the complete settings object to the webview
    webview.postMessage({
      command: "loadSettings",
      settings: {
        activeFlavor,
        syntaxSettings,
        currentAccent,
        accentOptions,
        customAccentColor,
        defaultFontStyles, // Pass defaults for the reset button logic
      },
    });
  }

  // Generates the HTML content for the webview, injecting script and style URIs
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

  // Cleans up resources when the panel is closed
  public dispose() {
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
