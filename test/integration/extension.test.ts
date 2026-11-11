/**
 * @file Activation, the regenerate command and the settings listener, against the `vscode` mock
 * with the build mocked out.
 */

import * as vscode from "vscode";
import * as build from "../../build";
import { activate, deactivate } from "../../extension";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

// Activating under a Calmppuccin theme rebuilds the themes, which would write to disk.
jest.mock("../../build");

describe("Extension Integration Tests", () => {
  let mockContext: vscode.ExtensionContext;

  let mockCalmppuccinConfiguration: { get: jest.Mock; update: jest.Mock };
  let currentColorTheme: string;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    currentColorTheme = "Calmppuccin Mocha";

    mockCalmppuccinConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };

    const mockWorkbenchConfiguration = {
      get: jest.fn((key: string) => {
        // A Calmppuccin theme, so `activate` registers the settings listener. A command test
        // picks another, so activation doesn't build as well.
        if (key === "colorTheme") {
          return currentColorTheme;
        }
        return undefined;
      }),
      update: jest.fn(),
    };

    (mockedVscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      if (section === C.EXTENSION_NAMESPACE) {
        return mockCalmppuccinConfiguration;
      }
      if (section === "workbench") {
        return mockWorkbenchConfiguration;
      }
      return { get: jest.fn(), update: jest.fn() };
    });

    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn(),
      },
      workspaceState: { get: jest.fn(), update: jest.fn(), keys: jest.fn() },
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        onDidChange: jest.fn(),
        delete: jest.fn(),
        keys: jest.fn(),
      },
      extensionUri: vscode.Uri.parse("file:///mock/extension/path"),
      extensionPath: "/mock/extension/path",
      storageUri: vscode.Uri.parse("file:///mock/storage/path"),
      storagePath: undefined,
      globalStorageUri: vscode.Uri.parse("file:///mock/global/storage/path"),
      globalStoragePath: "/mock/global/storage/path",
      logUri: vscode.Uri.parse("file:///mock/log/path"),
      logPath: "/mock/log/path",
      extensionMode: vscode.ExtensionMode.Test,
      environmentVariableCollection: {} as unknown as vscode.GlobalEnvironmentVariableCollection,
      asAbsolutePath: jest.fn((relativePath) => `/mock/extension/path/${relativePath}`),
      extension: {} as unknown as vscode.Extension<unknown>,
      languageModelAccessInformation: {
        onDidChange: jest.fn(),
        canSendRequest: jest.fn(),
      },
    };
  });

  afterEach(() => {
    deactivate();
    jest.useRealTimers();
  });

  it("should trigger the theme build process when the regenerateThemes command is executed", async () => {
    currentColorTheme = "Default Dark Modern";
    const buildSpy = jest.spyOn(build, "buildAllFlavors").mockResolvedValue(true);

    // `queueBuild` reads the settings through these.
    jest.spyOn(ConfigurationService, "getAccent").mockReturnValue("sapphire");
    jest.spyOn(ConfigurationService, "getFontStyles").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getSyntaxOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getUiOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getFontStyleOverrides").mockReturnValue({});

    let commandCallback: () => Promise<void> = async () => {};
    (mockedVscode.commands.registerCommand as jest.Mock).mockImplementation(
      (command: string, callback: () => Promise<void>) => {
        if (command === C.REGENERATE_COMMAND_ID) {
          commandCallback = callback;
        }
        return { dispose: () => {} };
      },
    );

    (mockedVscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Reload Window");

    activate(mockContext);
    await commandCallback();

    expect(buildSpy).toHaveBeenCalledTimes(1);
    expect(mockedVscode.window.showInformationMessage).toHaveBeenCalled();
  });

  /** An update installs the packaged default themes, and settings may change while inactive. */
  it("should rebuild the themes when activated with a Calmppuccin theme", async () => {
    const buildSpy = jest.spyOn(build, "buildAllFlavors").mockResolvedValue(false);

    activate(mockContext);
    await jest.advanceTimersByTimeAsync(0);

    expect(buildSpy).toHaveBeenCalledTimes(1);
  });

  it("should not rebuild on activation under another theme", async () => {
    currentColorTheme = "Default Dark Modern";
    const buildSpy = jest.spyOn(build, "buildAllFlavors").mockResolvedValue(false);

    activate(mockContext);
    await jest.advanceTimersByTimeAsync(0);

    expect(buildSpy).not.toHaveBeenCalled();
  });

  it("should not offer a reload when no theme file changed", async () => {
    jest.spyOn(build, "buildAllFlavors").mockResolvedValue(false);

    activate(mockContext);
    await jest.advanceTimersByTimeAsync(0);

    expect(mockedVscode.window.showInformationMessage).not.toHaveBeenCalled();
  });

  /** Two builds in flight could land the older settings' files last. */
  it("should not start a build before the previous one settles", async () => {
    currentColorTheme = "Default Dark Modern";
    let finishFirstBuild: (changed: boolean) => void = () => {
      throw new Error("the first build never started");
    };
    const buildSpy = jest
      .spyOn(build, "buildAllFlavors")
      .mockImplementationOnce(
        () =>
          new Promise<boolean>((resolve) => {
            finishFirstBuild = resolve;
          }),
      )
      .mockResolvedValue(false);
    let regenerate: () => Promise<void> = () => {
      throw new Error("the regenerate command was never registered");
    };
    jest
      .mocked(mockedVscode.commands.registerCommand)
      .mockImplementation((command: string, callback: () => Promise<void>) => {
        if (command === C.REGENERATE_COMMAND_ID) {
          regenerate = callback;
        }
        return { dispose: () => {} };
      });

    activate(mockContext);
    const regenerations = [regenerate(), regenerate()];
    await jest.advanceTimersByTimeAsync(0);
    const callsWhileFirstRuns = buildSpy.mock.calls.length;
    finishFirstBuild(false);
    await Promise.all(regenerations);

    expect(callsWhileFirstRuns).toBe(1);
    expect(buildSpy).toHaveBeenCalledTimes(2);
  });

  it("should trigger regenerateThemes command on configuration change", () => {
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation(
      (callback: (event: vscode.ConfigurationChangeEvent) => void) => {
        listener = callback;
        return { dispose: () => {} };
      },
    );

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`;
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    activate(mockContext);

    listener(mockEvent);

    jest.advanceTimersByTime(C.REGENERATE_DEBOUNCE_MS);
    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });

  it("should trigger regenerateThemes when font style configuration changes", () => {
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation(
      (callback: (event: vscode.ConfigurationChangeEvent) => void) => {
        listener = callback;
        return { dispose: () => {} };
      },
    );

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`;
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    activate(mockContext);
    listener(mockEvent);
    jest.advanceTimersByTime(C.REGENERATE_DEBOUNCE_MS);

    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });

  it("should trigger regenerateThemes when syntax overrides change", () => {
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation(
      (callback: (event: vscode.ConfigurationChangeEvent) => void) => {
        listener = callback;
        return { dispose: () => {} };
      },
    );

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_SYNTAX_OVERRIDES}`;
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    activate(mockContext);
    listener(mockEvent);
    jest.advanceTimersByTime(C.REGENERATE_DEBOUNCE_MS);

    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });

  it("should NOT trigger regeneration for non-Calmppuccin settings", () => {
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation(
      (callback: (event: vscode.ConfigurationChangeEvent) => void) => {
        listener = callback;
        return { dispose: () => {} };
      },
    );

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === "editor.fontSize"; // Unrelated setting
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    activate(mockContext);
    listener(mockEvent);
    jest.advanceTimersByTime(C.REGENERATE_DEBOUNCE_MS);

    expect(executeCommandSpy).not.toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });

  it("should debounce rapid config changes into a single regeneration", () => {
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation(
      (callback: (event: vscode.ConfigurationChangeEvent) => void) => {
        listener = callback;
        return { dispose: () => {} };
      },
    );

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`;
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    activate(mockContext);

    for (let i = 0; i < 5; i++) {
      listener(mockEvent);
    }

    jest.advanceTimersByTime(C.REGENERATE_DEBOUNCE_MS);

    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
    expect(executeCommandSpy).toHaveBeenCalledTimes(1);
  });
});

describe("Theme Regeneration Error Handling", () => {
  let mockContext: vscode.ExtensionContext;
  let mockCalmppuccinConfiguration: { get: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCalmppuccinConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };

    const mockWorkbenchConfiguration = {
      get: jest.fn((key: string) => {
        if (key === "colorTheme") return "Default Dark Modern";
        return undefined;
      }),
      update: jest.fn(),
    };

    (mockedVscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      if (section === C.EXTENSION_NAMESPACE) {
        return mockCalmppuccinConfiguration;
      }
      if (section === "workbench") {
        return mockWorkbenchConfiguration;
      }
      return { get: jest.fn(), update: jest.fn() };
    });

    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn(),
      },
      workspaceState: { get: jest.fn(), update: jest.fn(), keys: jest.fn() },
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        onDidChange: jest.fn(),
        delete: jest.fn(),
        keys: jest.fn(),
      },
      extensionUri: vscode.Uri.parse("file:///mock/extension/path"),
      extensionPath: "/mock/extension/path",
      storageUri: vscode.Uri.parse("file:///mock/storage/path"),
      storagePath: undefined,
      globalStorageUri: vscode.Uri.parse("file:///mock/global/storage/path"),
      globalStoragePath: "/mock/global/storage/path",
      logUri: vscode.Uri.parse("file:///mock/log/path"),
      logPath: "/mock/log/path",
      extensionMode: vscode.ExtensionMode.Test,
      environmentVariableCollection: {} as unknown as vscode.GlobalEnvironmentVariableCollection,
      asAbsolutePath: jest.fn((relativePath) => `/mock/extension/path/${relativePath}`),
      extension: {} as unknown as vscode.Extension<unknown>,
      languageModelAccessInformation: {
        onDidChange: jest.fn(),
        canSendRequest: jest.fn(),
      },
    };
  });

  afterEach(() => {
    deactivate();
  });

  it("should show error message when buildAllFlavors fails", async () => {
    const errorMessage = "Template file not found";
    const buildSpy = jest
      .spyOn(build, "buildAllFlavors")
      .mockRejectedValue(new Error(errorMessage));

    jest.spyOn(ConfigurationService, "getAccent").mockReturnValue("sapphire");
    jest.spyOn(ConfigurationService, "getFontStyles").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getSyntaxOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getUiOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getFontStyleOverrides").mockReturnValue({});

    let commandCallback: () => Promise<void> = async () => {};
    (mockedVscode.commands.registerCommand as jest.Mock).mockImplementation(
      (command: string, callback: () => Promise<void>) => {
        if (command === C.REGENERATE_COMMAND_ID) {
          commandCallback = callback;
        }
        return { dispose: () => {} };
      },
    );

    activate(mockContext);
    await commandCallback();

    expect(buildSpy).toHaveBeenCalled();
    expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining("Failed to update"),
      "Report Issue",
    );
  });

  it("should show success message when buildAllFlavors succeeds", async () => {
    const buildSpy = jest.spyOn(build, "buildAllFlavors").mockResolvedValue(true);

    jest.spyOn(ConfigurationService, "getAccent").mockReturnValue("sapphire");
    jest.spyOn(ConfigurationService, "getFontStyles").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getSyntaxOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getUiOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getFontStyleOverrides").mockReturnValue({});

    let commandCallback: () => Promise<void> = async () => {};
    (mockedVscode.commands.registerCommand as jest.Mock).mockImplementation(
      (command: string, callback: () => Promise<void>) => {
        if (command === C.REGENERATE_COMMAND_ID) {
          commandCallback = callback;
        }
        return { dispose: () => {} };
      },
    );

    (mockedVscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Reload Window");

    activate(mockContext);
    await commandCallback();

    expect(buildSpy).toHaveBeenCalled();
    expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining("theme updated"),
      "Reload Window",
    );
  });
});
