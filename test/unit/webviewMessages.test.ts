/**
 * @file Tests `parseWebviewMessage` against the real manifest's accent and font-style lists,
 * reached through the `vscode` mock's `extensions.getExtension`.
 */

import * as vscode from "vscode";
import * as manifest from "../../package.json";
import { parseWebviewMessage } from "../../src/webviewMessages";

beforeEach(() => {
  jest.mocked(vscode.extensions.getExtension).mockReturnValue({
    packageJSON: manifest,
  } as unknown as vscode.Extension<unknown>);
});

describe("parseWebviewMessage", () => {
  it.each([
    { command: "updateSetting", key: "commentFontStyle", value: "italic bold" },
    { command: "resetFontStyle", key: "jsonLvl3FontStyle" },
    { command: "updateAccent", value: "custom" },
    { command: "updateCustomAccent", value: "#89b4fa" },
    { command: "updateSyntaxColor", flavor: "nitro-cold-brew", key: "keyword", value: "#a1b2c3d4" },
    { command: "updateSyntaxColor", flavor: "mocha", key: "uiText", value: "#a1b2c3" },
    { command: "resetSyntaxColor", flavor: "latte", key: "uiBracket2" },
    { command: "updateUiColor", flavor: "frappe", key: "crust", value: "#101010" },
    { command: "resetUiColor", flavor: "oledppuccin", key: "base" },
    { command: "resetAll" },
    { command: "switchProfile", profile: "Default" },
    { command: "saveProfile", profile: "Work" },
    { command: "deleteProfile", profile: "Work" },
  ])("accepts $command as the webview sends it", (message) => {
    expect(parseWebviewMessage(message)).toStrictEqual(message);
  });

  it("returns only the fields the command defines", () => {
    const raw = { command: "updateAccent", value: "mauve", extra: "dropped" };

    expect(parseWebviewMessage(raw)).toStrictEqual({ command: "updateAccent", value: "mauve" });
  });

  it.each([
    ["undefined", undefined],
    ["a string", "resetAll"],
    ["an unknown command", { command: "deleteEverything" }],
    ["a command inherited from Object", { command: "toString" }],
    ["an unknown font style key", { command: "resetFontStyle", key: "__proto__" }],
    [
      "a font style outside the options",
      { command: "updateSetting", key: "commentFontStyle", value: "oblique" },
    ],
    ["an unknown accent", { command: "updateAccent", value: "chartreuse" }],
    ["a custom accent with alpha", { command: "updateCustomAccent", value: "#89b4faff" }],
    [
      "a flavor inherited from Object",
      { command: "resetSyntaxColor", flavor: "constructor", key: "keyword" },
    ],
    [
      "an unknown color key",
      { command: "updateSyntaxColor", flavor: "mocha", key: "accent", value: "#000000" },
    ],
    [
      "a color that isn't hex",
      { command: "updateSyntaxColor", flavor: "mocha", key: "keyword", value: "red" },
    ],
    [
      "a UI color with alpha",
      { command: "updateUiColor", flavor: "mocha", key: "base", value: "#00000080" },
    ],
    ["a missing field", { command: "updateUiColor", flavor: "mocha", key: "base" }],
    ["a blank profile name", { command: "saveProfile", profile: "  " }],
    ["a profile name that isn't a string", { command: "switchProfile", profile: 3 }],
  ])("rejects %s", (_label, raw) => {
    expect(parseWebviewMessage(raw)).toBeUndefined();
  });
});
