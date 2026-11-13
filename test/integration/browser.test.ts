/**
 * @file The web entry's note and icon sync, through `activate` and the settings listener it
 * registers on the `vscode` mock, with the real settings reads behind them.
 */

import * as vscode from "vscode";
import { activate, deactivate } from "../../browser";
import * as C from "../../src/constants";
import { createConfiguration } from "../__fixtures__/configuration";
import { createExtensionContext } from "../__fixtures__/extensionContext";

const CALMPPUCCIN_THEME = "Calmppuccin Mocha";
const OTHER_THEME = "Default Dark Modern";
const CUSTOMIZED_ACCENT = "mauve";
const AUTOMATIC_NOTE = [C.WEB_CUSTOMIZATION_NOTE, C.DONT_SHOW_AGAIN_ACTION];
const NOTE_ON_PRESS = [C.WEB_CUSTOMIZATION_NOTE];

// The overload taking string items, which the note calls.
const showInformationMessage = jest.mocked(
  vscode.window.showInformationMessage as (
    message: string,
    ...items: string[]
  ) => Thenable<string | undefined>,
);

let context: vscode.ExtensionContext;
let colorTheme: string;
let iconTheme: string | undefined;
let accent: string;
let updateWorkbench: jest.Mock;
let settingsListener: ((event: vscode.ConfigurationChangeEvent) => void) | undefined;
let customizeCommand: (() => void) | undefined;

beforeEach(() => {
  jest.useFakeTimers();
  context = createExtensionContext();
  colorTheme = CALMPPUCCIN_THEME;
  iconTheme = undefined;
  accent = C.DEFAULT_ACCENT;
  updateWorkbench = jest.fn().mockResolvedValue(undefined);
  settingsListener = undefined;
  customizeCommand = undefined;

  jest
    .mocked(vscode.workspace.getConfiguration)
    .mockImplementation((section) =>
      section === C.WORKBENCH_SECTION
        ? createConfiguration(
            { [C.COLOR_THEME_KEY]: colorTheme, [C.ICON_THEME_KEY]: iconTheme },
            updateWorkbench,
          )
        : createConfiguration({ [C.CONFIG_KEY_ACCENT]: accent }),
    );
  jest.mocked(vscode.workspace.onDidChangeConfiguration).mockImplementation((listener) => {
    settingsListener = listener;
    return { dispose: () => {} };
  });
  jest.mocked(vscode.commands.registerCommand).mockImplementation((command, callback) => {
    if (command === C.CUSTOMIZE_COMMAND_ID) {
      customizeCommand = callback;
    }
    return { dispose: () => {} };
  });
  showInformationMessage.mockResolvedValue(undefined);
});

afterEach(() => {
  deactivate();
  jest.useRealTimers();
});

function changeSetting(setting: string) {
  if (!settingsListener) {
    throw new Error("activate registered no settings listener");
  }
  settingsListener({ affectsConfiguration: (section) => section === setting });
}

function pressCustomize() {
  if (!customizeCommand) {
    throw new Error("activate registered no Customize Theme command");
  }
  customizeCommand();
}

describe("activate", () => {
  it("shows the note with Don't Show Again when a Calmppuccin theme starts customized", () => {
    accent = CUSTOMIZED_ACCENT;

    activate(context);

    expect(showInformationMessage.mock.calls).toStrictEqual([AUTOMATIC_NOTE]);
  });

  it.each([
    ["the settings customize nothing", CALMPPUCCIN_THEME, C.DEFAULT_ACCENT],
    ["another theme is selected", OTHER_THEME, CUSTOMIZED_ACCENT],
  ])("shows nothing at start when %s", (_label, themeAtStart, accentAtStart) => {
    colorTheme = themeAtStart;
    accent = accentAtStart;

    activate(context);

    expect(showInformationMessage).not.toHaveBeenCalled();
  });

  it("moves a Catppuccin icon theme to the selected flavor", async () => {
    iconTheme = "catppuccin-latte";

    activate(context);
    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    expect(updateWorkbench).toHaveBeenCalledWith(
      C.ICON_THEME_KEY,
      "catppuccin-mocha",
      vscode.ConfigurationTarget.Global,
    );
  });
});

describe("the settings listener", () => {
  beforeEach(() => {
    colorTheme = OTHER_THEME;
    activate(context);
  });

  /** A switch to Calmppuccin can find settings that Settings Sync customized under another theme. */
  it.each(["workbench.colorTheme", "calmppuccin.accent"])(
    "shows the note when a change of %s leaves a Calmppuccin theme customized",
    (setting) => {
      colorTheme = CALMPPUCCIN_THEME;
      accent = CUSTOMIZED_ACCENT;

      changeSetting(setting);

      expect(showInformationMessage.mock.calls).toStrictEqual([AUTOMATIC_NOTE]);
    },
  );

  it.each([
    [
      "a theme setting changes but customizes nothing",
      "calmppuccin.accent",
      CALMPPUCCIN_THEME,
      C.DEFAULT_ACCENT,
    ],
    [
      "a theme setting changes under another theme",
      "calmppuccin.accent",
      OTHER_THEME,
      CUSTOMIZED_ACCENT,
    ],
    [
      "the theme changes to one that isn't Calmppuccin",
      "workbench.colorTheme",
      OTHER_THEME,
      CUSTOMIZED_ACCENT,
    ],
    [
      "a setting outside the theme changes",
      "editor.fontSize",
      CALMPPUCCIN_THEME,
      CUSTOMIZED_ACCENT,
    ],
  ])("shows nothing when %s", (_label, setting, themeAfterChange, accentAfterChange) => {
    colorTheme = themeAfterChange;
    accent = accentAfterChange;

    changeSetting(setting);

    expect(showInformationMessage).not.toHaveBeenCalled();
  });

  it("shows the note at most once per window", () => {
    colorTheme = CALMPPUCCIN_THEME;
    accent = CUSTOMIZED_ACCENT;
    changeSetting("calmppuccin.accent");

    changeSetting("calmppuccin.accent");

    expect(showInformationMessage.mock.calls).toStrictEqual([AUTOMATIC_NOTE]);
  });

  it("moves a Catppuccin icon theme to the new flavor on a theme change", async () => {
    colorTheme = CALMPPUCCIN_THEME;
    iconTheme = "catppuccin-latte";

    changeSetting("workbench.colorTheme");
    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    expect(updateWorkbench).toHaveBeenCalledWith(
      C.ICON_THEME_KEY,
      "catppuccin-mocha",
      vscode.ConfigurationTarget.Global,
    );
  });
});

describe("Don't Show Again", () => {
  beforeEach(() => {
    accent = CUSTOMIZED_ACCENT;
  });

  it("keeps the note from showing at the next start once chosen", async () => {
    showInformationMessage.mockResolvedValueOnce(C.DONT_SHOW_AGAIN_ACTION);
    activate(context);
    await jest.advanceTimersByTimeAsync(0);
    deactivate();

    activate(context);

    expect(showInformationMessage.mock.calls).toStrictEqual([AUTOMATIC_NOTE]);
  });

  it("shows the note again at the next start when it was only closed", async () => {
    activate(context);
    await jest.advanceTimersByTimeAsync(0);
    deactivate();

    activate(context);

    expect(showInformationMessage.mock.calls).toStrictEqual([AUTOMATIC_NOTE, AUTOMATIC_NOTE]);
  });
});

describe("Customize Theme", () => {
  beforeEach(() => {
    accent = CUSTOMIZED_ACCENT;
  });

  it("answers every press with the note, past the one at start", () => {
    activate(context);
    pressCustomize();

    pressCustomize();

    expect(showInformationMessage.mock.calls).toStrictEqual([
      AUTOMATIC_NOTE,
      NOTE_ON_PRESS,
      NOTE_ON_PRESS,
    ]);
  });

  it("answers a press with the note after Don't Show Again", async () => {
    await context.globalState.update(C.WEB_NOTE_DISMISSED_KEY, true);
    activate(context);

    pressCustomize();

    expect(showInformationMessage.mock.calls).toStrictEqual([NOTE_ON_PRESS]);
  });
});
