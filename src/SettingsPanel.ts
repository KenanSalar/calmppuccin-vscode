import * as vscode from "vscode";
import * as C from "./constants";
import palettes from "./palette";
import { WebviewManager } from "./WebviewManager";
import { ConfigurationService, SyntaxOverrides } from "./ConfigurationService";

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
  private static _instance: SettingsPanel | undefined;
  private readonly _context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  public static createOrShow(context: vscode.ExtensionContext) {
    if (!SettingsPanel._instance) {
      SettingsPanel._instance = new SettingsPanel(context);
    }

    WebviewManager.createOrShow(context, SettingsPanel._instance._handleMessage.bind(SettingsPanel._instance));

    SettingsPanel._instance._update();
  }

  public static updateIfVisible() {
    SettingsPanel._instance?._update();
  }

  private async _handleMessage(message: any) {
    switch (message.command) {
      case C.WEBVIEW_COMMANDS.UPDATE_SETTING: {
        await ConfigurationService.updateFontStyle(message.key, message.value);
        return;
      }
      case C.WEBVIEW_COMMANDS.RESET_FONT_STYLE: {
        await ConfigurationService.resetFontStyle(message.key);
        return;
      }
      case C.WEBVIEW_COMMANDS.UPDATE_ACCENT:
        await ConfigurationService.updateAccent(message.value);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_CUSTOM_ACCENT:
        await ConfigurationService.updateCustomAccent(message.value);
        return;
      case C.WEBVIEW_COMMANDS.UPDATE_SYNTAX_COLOR: {
        await ConfigurationService.updateSyntaxColor(message.flavor, message.key, message.value);
        return;
      }
      case C.WEBVIEW_COMMANDS.RESET_SYNTAX_COLOR: {
        await ConfigurationService.resetSyntaxColor(message.flavor, message.key);
        return;
      }
      case C.WEBVIEW_COMMANDS.RESET_ALL: {
        await ConfigurationService.resetAll();
        this._update();
        return;
      }
    }
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
    return "mocha";
  }

  private _update() {
    if (!WebviewManager.currentPanel) return;

    const config = vscode.workspace.getConfiguration(C.EXTENSION_NAMESPACE);
    const workbenchConfig = vscode.workspace.getConfiguration("workbench");
    const extensionConfig = vscode.extensions.getExtension("kenan-salar.calmppuccin-vscode")?.packageJSON;
    const activeTheme = workbenchConfig.get<string>("colorTheme", "Calmppuccin Mocha");
    const activeFlavor = this._getFlavorFromTheme(activeTheme);
    const fontStyles = ConfigurationService.getFontStyles();
    const syntaxOverrides: SyntaxOverrides = ConfigurationService.getSyntaxOverrides() as SyntaxOverrides;
    const currentAccent = vscode.workspace
      .getConfiguration(C.EXTENSION_NAMESPACE)
      .get<string>(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    const customAccentColor = vscode.workspace
      .getConfiguration(C.EXTENSION_NAMESPACE)
      .get<string>(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);
    const defaultFontStyles =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`]
        ?.default ?? {};
    const accentOptions =
      extensionConfig?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`]?.enum ??
      [];
    const defaultPalette = (palettes as any)[activeFlavor];
    const overridePalette = syntaxOverrides[activeFlavor] || {};
    const activeThemeBackgroundColor = defaultPalette.crust;

    const accentColorPalettes = accentOptions.reduce((acc: any, option: string) => {
      if (defaultPalette[option]) acc[option] = defaultPalette[option];
      return acc;
    }, {});

    const syntaxSettings = customizableSyntaxKeys.map((key) => ({
      key: key,
      fontStyle: (fontStyles as any)?.[`${key}FontStyle`] ?? "none",
      color: overridePalette[key] || defaultPalette[key],
      defaultColor: defaultPalette[key],
    }));

    WebviewManager.currentPanel.postMessage({
      command: C.WEBVIEW_COMMANDS.LOAD_SETTINGS,
      settings: {
        activeFlavor,
        syntaxSettings,
        currentAccent,
        accentOptions,
        customAccentColor,
        defaultFontStyles,
        activeThemeBackgroundColor,
        accentColorPalettes,
      },
    });
  }
}
