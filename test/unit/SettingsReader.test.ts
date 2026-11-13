/** @file `isThemeCustomized`, reading each test's user settings through the `vscode` mock. */

import * as vscode from "vscode";
import { isThemeCustomized } from "../../src/config/SettingsReader";
import * as C from "../../src/constants";
import { createConfiguration } from "../__fixtures__/configuration";

const CONTRIBUTED_FONT_STYLES = { commentFontStyle: "italic" };

/** User settings whose only profile, `Default`, is `profile`. */
function inDefaultProfile(profile: Record<string, unknown>) {
  return { [C.CONFIG_KEY_PROFILES]: { Default: profile } };
}

describe("isThemeCustomized", () => {
  beforeEach(() => {
    // The code reads nothing from the extension but its `packageJSON`.
    jest.mocked(vscode.extensions.getExtension).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: { "calmppuccin.fontStyles": { default: CONTRIBUTED_FONT_STYLES } },
          },
        },
      },
    } as vscode.Extension<unknown>);
  });

  it.each([
    ["an accent other than the default", inDefaultProfile({ accent: "mauve" })],
    ["the custom accent, whatever its color", inDefaultProfile({ accent: C.CUSTOM_ACCENT })],
    [
      "a font style off its default",
      inDefaultProfile({ fontStyles: { commentFontStyle: "bold" } }),
    ],
    ["a syntax override", inDefaultProfile({ syntaxOverrides: { mocha: { comment: "#ff0000" } } })],
    ["a UI override", inDefaultProfile({ uiOverrides: { latte: { base: "#ffffff" } } })],
    [
      "a font style override",
      inDefaultProfile({ fontStyleOverrides: { mocha: { commentFontStyle: "bold" } } }),
    ],
    [
      "a top-level accent under an empty profile",
      { ...inDefaultProfile({}), [C.CONFIG_KEY_ACCENT]: "mauve" },
    ],
    [
      "the active profile while Default is empty",
      {
        [C.CONFIG_KEY_PROFILES]: { Default: {}, Work: { accent: "mauve" } },
        [C.CONFIG_KEY_ACTIVE_PROFILE]: "Work",
      },
    ],
  ])("reports a customization for %s", (_label, userSettings) => {
    jest
      .mocked(vscode.workspace.getConfiguration)
      .mockReturnValue(createConfiguration(userSettings));

    expect(isThemeCustomized()).toBe(true);
  });

  /** Reset All, a deleted profile and a profile switch each leave user values like these. */
  it.each([
    ["no settings", {}],
    ["a profile Reset All emptied", inDefaultProfile({})],
    ["the default accent chosen explicitly", inDefaultProfile({ accent: C.DEFAULT_ACCENT })],
    [
      "a custom color the accent doesn't select",
      inDefaultProfile({ customAccentColor: "#ff0000" }),
    ],
    [
      "font styles at their contributed defaults",
      { [C.CONFIG_KEY_FONT_STYLES]: { commentFontStyle: "italic" } },
    ],
    ["a flavor whose overrides are empty", inDefaultProfile({ syntaxOverrides: { mocha: {} } })],
    ["a flavor whose overrides are null", inDefaultProfile({ uiOverrides: { mocha: null } })],
    [
      "a customized profile that isn't active",
      { [C.CONFIG_KEY_PROFILES]: { Default: {}, Work: { accent: "mauve" } } },
    ],
  ])("reports no customization for %s", (_label, userSettings) => {
    jest
      .mocked(vscode.workspace.getConfiguration)
      .mockReturnValue(createConfiguration(userSettings));

    expect(isThemeCustomized()).toBe(false);
  });
});
