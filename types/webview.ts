/**
 * @file This file defines the strict, shared contract for communication
 * between the VS Code extension host (backend) and the settings webview (frontend).
 */

// #region Payloads & Data Structures

/** A single setting item for the webview. */
export interface WebviewSetting {
  key: string;
  fontStyle?: string;
  color?: string;
  defaultColor: string;
}

/** The complete data payload sent from the extension to the webview upon loading. */
export interface SettingsPayload {
  activeFlavor: string;
  syntaxSettings: WebviewSetting[];
  bracketSettings: WebviewSetting[];
  jsonSettings: WebviewSetting[];
  currentAccent: string;
  accentOptions: string[];
  customAccentColor: string;
  activeThemeBackgroundColor: string;
  accentColorPalettes: { [key: string]: string };
  defaultFontStyles: { [key: string]: string };
}

// #endregion

// #region Message Contracts

/** A discriminated union of all possible messages that can be sent FROM the webview TO the extension. */
export type MessageToExtension =
  | { command: "updateSetting"; key: string; value: string }
  | { command: "resetFontStyle"; key: string }
  | { command: "updateAccent"; value: string }
  | { command: "updateCustomAccent"; value: string }
  | { command: "updateSyntaxColor"; flavor: string; key: string; value: string }
  | { command: "resetSyntaxColor"; flavor: string; key: string }
  | { command: "resetAll" };

/** A discriminated union of all possible messages that can be sent FROM the extension TO the webview. */
export type MessageToWebview = {
  command: "loadSettings";
  settings: SettingsPayload;
};

// #endregion
