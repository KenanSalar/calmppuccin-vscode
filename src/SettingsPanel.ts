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
  "type",
  "namespace",
  "namespaceAttribute",
  "module",
  "annotation",
  "decorator",
  "class",
  "interface",
  "struct",
  "enum",
  "enumMember",
  "fieldAndAttribute",
  "property",
  "propertyReadOnly",
  "functionAndMethod",
  "extensionMethod",
  "delegate",
  "event",
  "parameter",
  "typeParameter",
  "number",
  "constant",
  "operator",
  "operatorOverload",
  "punctuation",
  "string",
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

    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Listen for messages from the webview to save settings
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);

        switch (message.command) {
          case C.WEBVIEW_COMMANDS.UPDATE_SETTING: {
            const { key, value } = message;
            const fontStyles = config.get(C.CONFIG_KEY_FONT_STYLES, {});
            await config.update(C.CONFIG_KEY_FONT_STYLES, { ...fontStyles, [key]: value }, vscode.ConfigurationTarget.Global);
            return;
          }
          case C.WEBVIEW_COMMANDS.RESET_FONT_STYLE: {
            const { key } = message;
            const fontStyles = { ...config.get<any>(C.CONFIG_KEY_FONT_STYLES, {}) };
            delete fontStyles[key];

            // If the object is now empty, update with `undefined` to remove it from settings.json
            const finalFontStyles = Object.keys(fontStyles).length === 0 ? undefined : fontStyles;

            await config.update(C.CONFIG_KEY_FONT_STYLES, finalFontStyles, vscode.ConfigurationTarget.Global);
            return;
          }
          case C.WEBVIEW_COMMANDS.UPDATE_ACCENT:
            await config.update(C.CONFIG_KEY_ACCENT, message.value, vscode.ConfigurationTarget.Global);
            return;
          case C.WEBVIEW_COMMANDS.UPDATE_CUSTOM_ACCENT:
            await config.update(C.CONFIG_KEY_CUSTOM_ACCENT, message.value, vscode.ConfigurationTarget.Global);
            return;
          case C.WEBVIEW_COMMANDS.UPDATE_SYNTAX_COLOR: {
            const { flavor, key, value } = message;
            // Create a deep copy to safely mutate
            const overrides = JSON.parse(JSON.stringify(config.get<any>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {})));

            if (!overrides[flavor]) {
              overrides[flavor] = {};
            }
            overrides[flavor][key] = value;

            await config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, overrides, vscode.ConfigurationTarget.Global);
            return;
          }
          case C.WEBVIEW_COMMANDS.RESET_SYNTAX_COLOR: {
            const { flavor, key } = message;
            // Create a deep copy to safely mutate
            const overrides = JSON.parse(JSON.stringify(config.get<any>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {})));

            if (overrides[flavor]?.[key]) {
              delete overrides[flavor][key];

              if (Object.keys(overrides[flavor]).length === 0) {
                delete overrides[flavor];
              }

              // If the object is empty, update with `undefined` to remove it from settings.json
              const finalOverrides = Object.keys(overrides).length === 0 ? undefined : overrides;

              await config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, finalOverrides, vscode.ConfigurationTarget.Global);
            }
            return;
          }
          case C.WEBVIEW_COMMANDS.RESET_ALL: {
            await config.update(C.CONFIG_KEY_FONT_STYLES, undefined, vscode.ConfigurationTarget.Global);
            await config.update(C.CONFIG_KEY_SYNTAX_OVERRIDES, undefined, vscode.ConfigurationTarget.Global);
            await config.update(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT, vscode.ConfigurationTarget.Global);
            this._update();
            return;
          }
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor?.viewColumn;
    if (SettingsPanel.currentPanel) {
      SettingsPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      C.WEBVIEW_COMMANDS.WEBVIEW_ID,
      C.WEBVIEW_COMMANDS.WEBVIEW_TITLE,
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "dist")),
          vscode.Uri.file(path.join(context.extensionPath, "webview")),
        ],
        retainContextWhenHidden: true,
      }
    );

    SettingsPanel.currentPanel = new SettingsPanel(panel, context);
  }

  public static updateIfVisible() {
    SettingsPanel.currentPanel?._update();
  }

  private _getFlavorFromTheme(themeName: string): string {
    const calmppuccinPrefix = "calmppuccin ";
    if (themeName.toLowerCase().startsWith(calmppuccinPrefix)) {
      return themeName
        .slice(calmppuccinPrefix.length)
        .toLowerCase()
        .replace(/ /g, "-")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
    return "mocha"; // Default fallback
  }

  private _update() {
    if (!this._panel.visible) return;

    const webview = this._panel.webview;
    this._panel.title = C.WEBVIEW_COMMANDS.WEBVIEW_TITLE;
    webview.html = this._getHtmlForWebview(this._context.extensionPath);

    const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;

    const activeTheme = workbenchConfig.get<string>("colorTheme", "Calmppuccin Mocha");
    const activeFlavor = this._getFlavorFromTheme(activeTheme);

    const fontStyles = config.get(C.CONFIG_KEY_FONT_STYLES);
    const syntaxOverrides = config.get<any>(C.CONFIG_KEY_SYNTAX_OVERRIDES, {});
    const currentAccent = config.get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const customAccentColor = config.get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);

    const defaultFontStyles =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.fontStyles`]?.default ?? {};
    const accentOptions =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];

    const defaultPalette = (palettes as any)[activeFlavor];
    const overridePalette = syntaxOverrides[activeFlavor] || {};

    const activeThemeBackgroundColor = defaultPalette.crust;

    // Extract accent colors from the active flavor's palette
    const accentColorPalettes = accentOptions.reduce((acc: any, option: string) => {
      if (defaultPalette[option]) {
        acc[option] = defaultPalette[option];
      }
      return acc;
    }, {});

    const syntaxSettings = customizableSyntaxKeys.map((key) => {
      const fontStyleKey = `${key}FontStyle`;
      return {
        key: key,
        fontStyle: (fontStyles as any)?.[fontStyleKey] ?? "none",
        color: overridePalette[key] || defaultPalette[key],
        defaultColor: defaultPalette[key],
      };
    });

    webview.postMessage({
      command: C.WEBVIEW_COMMANDS.LOAD_SETTINGS,
      settings: {
        activeFlavor,
        syntaxSettings,
        currentAccent,
        accentOptions,
        customAccentColor,
        defaultFontStyles,
        activeThemeBackgroundColor,
        accentColorPalettes, // Pass the accent colors
      },
    });
  }

  private _getHtmlForWebview(extensionPath: string): string {
    const htmlPath = path.join(extensionPath, "webview", "index.html");
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Create URIs for our local scripts and stylesheets
    const scriptUri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "dist", "webview.js")));
    const styleUri = this._panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "webview", "style.css")));

    // Replace all placeholders in the HTML
    htmlContent = htmlContent.replace("webview.js", scriptUri.toString());
    htmlContent = htmlContent.replace("style.css", styleUri.toString());

    return htmlContent;
  }

  public dispose() {
    SettingsPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }
}
