/**
 * @file This file defines the strict, shared contract for communication
 * between the VS Code extension host (backend) and the settings webview (frontend).
 */

/** A single setting item for the webview. */
export interface IWebviewSetting {
  key: string;
  fontStyle?: string;
  color?: string;
  defaultColor: string;
}

/** A profile containing theme configuration. */
export interface IProfile {
  accent?: string;
  customAccentColor?: string;
  fontStyles?: Record<string, string>;
  fontStyleOverrides?: Record<string, Record<string, string>>;
  syntaxOverrides?: Record<string, Record<string, string>>;
  uiOverrides?: Record<string, Record<string, string>>;
  // Index signature for dynamic key access in internal methods
  [key: string]: string | Record<string, string> | Record<string, Record<string, string>> | undefined;
}

/** The complete data payload sent from the extension to the webview upon loading. */
export interface ISettingsPayload {
  activeFlavor: string;
  syntaxSettings: IWebviewSetting[];
  bracketSettings: IWebviewSetting[];
  jsonSettings: IWebviewSetting[];
  uiSettings: IWebviewSetting[];
  currentAccent: string;
  accentOptions: string[];
  customAccentColor: string;
  activeThemeBackgroundColor: string;
  accentColorPalettes: { [key: string]: string };
  defaultFontStyles: { [key: string]: string };
  profiles: { [name: string]: IProfile };
  activeProfile: string;
}

/** A discriminated union of all possible messages that can be sent FROM the webview TO the extension. */
export type MessageToExtension =
  | { command: "updateSetting"; key: string; value: string }
  | { command: "resetFontStyle"; key: string }
  | { command: "updateAccent"; value: string }
  | { command: "updateCustomAccent"; value: string }
  | { command: "updateSyntaxColor"; flavor: string; key: string; value: string }
  | { command: "resetSyntaxColor"; flavor: string; key: string }
  | { command: "updateUiColor"; flavor: string; key: string; value: string }
  | { command: "resetUiColor"; flavor: string; key: string }
  | { command: "resetAll" }
  | { command: "switchProfile"; profile: string }
  | { command: "saveProfile"; profile: string }
  | { command: "deleteProfile"; profile: string };

/** A discriminated union of all possible messages that can be sent FROM the extension TO the webview. */
export type MessageToWebview = {
  command: "loadSettings";
  settings: ISettingsPayload;
};

/**
 * Defines the shape of the VS Code API object provided by `acquireVsCodeApi`.
 */
export interface IVsCodeApi {
  /**
   * Posts a message from the webview to the extension host.
   * @param {MessageToExtension} message The strongly-typed message object to send.
   */
  postMessage(message: MessageToExtension): void;
}
