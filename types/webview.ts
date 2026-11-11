/**
 * @file Everything the host and the customization webview exchange. Both sides post through
 * these types, so a message that isn't here doesn't type-check.
 */

/** One row of the settings grid: a key's color and, for syntax and JSON keys, its font style. */
export interface IWebviewSetting {
  key: string;
  fontStyle?: string;
  color?: string;
  defaultColor: string;
}

/** One entry of `calmppuccin.profiles`. */
export interface IProfile {
  accent?: string;
  customAccentColor?: string;
  fontStyles?: Record<string, string>;
  fontStyleOverrides?: Record<string, Record<string, string>>;
  syntaxOverrides?: Record<string, Record<string, string>>;
  uiOverrides?: Record<string, Record<string, string>>;
  // `updateProfileSetting` writes through a key held in a string.
  [key: string]:
    | string
    | Record<string, string>
    | Record<string, Record<string, string>>
    | undefined;
}

/** Everything the webview builds its controls from, sent whole in `loadSettings`. */
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

/** What the webview may post; `parseWebviewMessage` checks each before the host acts on it. */
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

export type MessageToWebview = {
  command: "loadSettings";
  settings: ISettingsPayload;
};

/** The part of the object `acquireVsCodeApi()` returns that the webview uses. */
export interface IVsCodeApi {
  postMessage(message: MessageToExtension): void;
}
