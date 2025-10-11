/**
 * @file This file contains integration tests for the main extension logic.
 * It verifies that commands are correctly registered and trigger the expected actions.
 */

import { activate } from "../../extension";
import * as build from "../../build";
import * as vscode from "vscode";
import * as C from "../../src/constants";
import { ConfigurationService } from "../../src/ConfigurationService";

// Cast the imported vscode object to its mocked type for type-safe access.
const mockedVscode = vscode as jest.Mocked<typeof vscode>;

// Mock the entire 'build' module. This is crucial for integration tests,
// as it prevents the test from actually touching the file system. We only
// want to verify that the build *function* was called, not what it *does*.
jest.mock("../../build");

/**
 * @description Test suite for the main extension activation and commands.
 */
describe("Extension Integration Tests", () => {
  // A variable to hold the mock ExtensionContext for each test.
  let mockContext: vscode.ExtensionContext;
  
  // This will hold the mock specifically for the 'calmppuccin' configuration section.
  let mockCalmppuccinConfiguration: { get: jest.Mock; update: jest.Mock };

  /**
   * This function runs before each test in this suite.
   * It resets all mocks and sets up a sophisticated mock for the VS Code
   * configuration API that can handle different configuration sections.
   */
  beforeEach(() => {
    // Reset the state of all mocks to ensure tests are isolated.
    jest.clearAllMocks();

    // --- Create separate mocks for each configuration section ---

    // 1. Mock for the 'calmppuccin' extension settings. This will be returned
    // when the code calls `getConfiguration('calmppuccin')`.
    mockCalmppuccinConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };

    // 2. Mock for the 'workbench' settings. This is necessary because the new
    // lazy-activation logic in `extension.ts` checks the current theme by calling
    // `getConfiguration('workbench').get('colorTheme')`.
    const mockWorkbenchConfiguration = {
      get: jest.fn((key: string) => {
        // If the test asks for the current color theme, we simulate that a
        // Calmppuccin theme is already active. This ensures that the
        // `ensureListenersAreActive` function is called during activation.
        if (key === "colorTheme") {
          return "Calmppuccin Mocha";
        }
        return undefined;
      }),
      update: jest.fn(),
    };

    // --- Make the main getConfiguration mock intelligent ---

    (mockedVscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      if (section === C.EXTENSION_NAMESPACE) {
        return mockCalmppuccinConfiguration;
      }
      if (section === "workbench") {
        return mockWorkbenchConfiguration;
      }
      // Provide a default fallback to prevent errors if other sections are ever requested.
      return { get: jest.fn(), update: jest.fn() };
    });

    // Create a complete, type-safe mock of the ExtensionContext.
    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn(),
      },
      workspaceState: { get: jest.fn(), update: jest.fn(), keys: jest.fn() },
      secrets: { get: jest.fn(), store: jest.fn(), onDidChange: jest.fn(), delete: jest.fn() },
      extensionUri: vscode.Uri.parse("file:///mock/extension/path"),
      extensionPath: "/mock/extension/path",
      storageUri: vscode.Uri.parse("file:///mock/storage/path"),
      storagePath: undefined,
      globalStorageUri: vscode.Uri.parse("file:///mock/global/storage/path"),
      globalStoragePath: "/mock/global/storage/path",
      logUri: vscode.Uri.parse("file:///mock/log/path"),
      logPath: "/mock/log/path",
      extensionMode: vscode.ExtensionMode.Test,
      environmentVariableCollection: {} as any, // This API is complex; 'any' is acceptable for simplicity.
      asAbsolutePath: jest.fn((relativePath) => `/mock/extension/path/${relativePath}`),
      extension: {} as any,
      languageModelAccessInformation: {
        onDidChange: jest.fn(),
        canSendRequest: jest.fn(),
      },
    };
  });

  /**
   * @description Tests that the 'calmppuccin.regenerateThemes' command
   * successfully calls the buildAllFlavors function.
   * @precondition The 'build' module and ConfigurationService methods are mocked.
   * @assertion The `buildAllFlavors` function should be called exactly once
   * after the command is executed.
   */
  it("should trigger the theme build process when the regenerateThemes command is executed", async () => {
    // 1. Arrange: Set up spies and mock return values.
    const buildSpy = jest.spyOn(build, "buildAllFlavors");

    // We still need to spy on these because the command's callback uses them directly.
    jest.spyOn(ConfigurationService, "getAccent").mockReturnValue("sapphire");
    jest.spyOn(ConfigurationService, "getFontStyles").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getSyntaxOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getUiOverrides").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getFontStyleOverrides").mockReturnValue({});

    // Capture the callback function that is passed to registerCommand.
    let commandCallback: () => Promise<void> = async () => {};
    (mockedVscode.commands.registerCommand as jest.Mock).mockImplementation(
      (command: string, callback: () => Promise<void>) => {
        if (command === C.REGENERATE_COMMAND_ID) {
          commandCallback = callback;
        }
        return { dispose: () => {} };
      }
    );

    (mockedVscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Reload Window");

    // 2. Act:
    // Run the extension's main activate function to register the commands.
    activate(mockContext);
    // Simulate a user executing the command by calling the captured callback.
    await commandCallback();

    // 3. Assert:
    expect(buildSpy).toHaveBeenCalledTimes(1);
    expect(mockedVscode.window.showInformationMessage).toHaveBeenCalled();
  });

  /**
   * @description Tests that changing a relevant configuration setting
   * automatically triggers the 'regenerateThemes' command.
   * @precondition The `vscode.workspace.onDidChangeConfiguration` is mocked to
   * capture the listener function registered by the `activate` method.
   * @assertion The `vscode.commands.executeCommand` function should be called
   * with the 'calmppuccin.regenerateThemes' command ID.
   */
  it("should trigger regenerateThemes command on configuration change", () => {
    // 1. Arrange
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation((callback) => {
      listener = callback;
      return { dispose: () => {} };
    });

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        // This simulates a user changing the accent color in their settings.
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`;
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    // 2. Act
    // Running activate now correctly sets up the listeners because our beforeEach
    // mock simulates that a Calmppuccin theme is already active.
    activate(mockContext);

    // Manually trigger the configuration change event.
    listener(mockEvent);

    // 3. Assert
    // Verify that the listener, now correctly registered, executed the command.
    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });

  /**
   * @description Tests that changing font style configuration triggers theme regeneration.
   * @precondition The configuration change listener is registered
   * @assertion The regenerateThemes command should be executed when font styles change
   */
  it("should trigger regenerateThemes when font style configuration changes", async () => {
    // Use dynamic import to get a fresh module instance
    jest.resetModules();
    
    // Re-mock vscode module
    jest.mock("vscode", () => mockedVscode, { virtual: true });
    
    const { activate: freshActivate } = require("../../extension");
    
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation((callback) => {
      listener = callback;
      return { dispose: () => {} };
    });

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_FONT_STYLES}`;
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    freshActivate(mockContext);
    listener(mockEvent);

    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });

  /**
   * @description Tests that changing syntax overrides triggers theme regeneration.
   * @precondition The configuration change listener is registered
   * @assertion The regenerateThemes command should be executed when syntax overrides change
   */
  it("should trigger regenerateThemes when syntax overrides change", async () => {
    // Use dynamic import to get a fresh module instance
    jest.resetModules();
    
    // Re-mock vscode module
    jest.mock("vscode", () => mockedVscode, { virtual: true });
    
    const { activate: freshActivate } = require("../../extension");
    
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation((callback) => {
      listener = callback;
      return { dispose: () => {} };
    });

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_SYNTAX_OVERRIDES}`;
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    freshActivate(mockContext);
    listener(mockEvent);

    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });

  /**
   * @description Tests that non-Calmppuccin configuration changes do not trigger regeneration.
   * @precondition The configuration change listener is registered
   * @assertion The regenerateThemes command should NOT be executed
   */
  it("should NOT trigger regeneration for non-Calmppuccin settings", () => {
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation((callback) => {
      listener = callback;
      return { dispose: () => {} };
    });

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        return section === "editor.fontSize"; // Unrelated setting
      }),
    };

    const executeCommandSpy = mockedVscode.commands.executeCommand;

    activate(mockContext);
    listener(mockEvent);

    expect(executeCommandSpy).not.toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });
});

/**
 * Test suite for theme regeneration error handling.
 */
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
        if (key === "colorTheme") return "Calmppuccin Mocha";
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
      secrets: { get: jest.fn(), store: jest.fn(), onDidChange: jest.fn(), delete: jest.fn() },
      extensionUri: vscode.Uri.parse("file:///mock/extension/path"),
      extensionPath: "/mock/extension/path",
      storageUri: vscode.Uri.parse("file:///mock/storage/path"),
      storagePath: undefined,
      globalStorageUri: vscode.Uri.parse("file:///mock/global/storage/path"),
      globalStoragePath: "/mock/global/storage/path",
      logUri: vscode.Uri.parse("file:///mock/log/path"),
      logPath: "/mock/log/path",
      extensionMode: vscode.ExtensionMode.Test,
      environmentVariableCollection: {} as any,
      asAbsolutePath: jest.fn((relativePath) => `/mock/extension/path/${relativePath}`),
      extension: {} as any,
      languageModelAccessInformation: {
        onDidChange: jest.fn(),
        canSendRequest: jest.fn(),
      },
    };
  });

  /**
   * @description Tests that buildAllFlavors errors show user-friendly error messages.
   * @precondition buildAllFlavors is mocked to throw an error
   * @assertion Error message should be shown to user with proper details
   */
  it("should show error message when buildAllFlavors fails", async () => {
    const errorMessage = "Template file not found";
    const buildSpy = jest.spyOn(build, "buildAllFlavors").mockRejectedValue(new Error(errorMessage));

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
      }
    );

    activate(mockContext);
    await commandCallback();

    expect(buildSpy).toHaveBeenCalled();
    expect(mockedVscode.window.showErrorMessage).toHaveBeenCalledWith(
      expect.stringContaining("Failed to update"),
      "Report Issue"
    );
  });

  /**
   * @description Tests that buildAllFlavors success shows success message.
   * @precondition buildAllFlavors is mocked to succeed
   * @assertion Success message should be shown to user
   */
  it("should show success message when buildAllFlavors succeeds", async () => {
    const buildSpy = jest.spyOn(build, "buildAllFlavors").mockResolvedValue();

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
      }
    );

    (mockedVscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Reload Window");

    activate(mockContext);
    await commandCallback();

    expect(buildSpy).toHaveBeenCalled();
    expect(mockedVscode.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining("theme updated"),
      "Reload Window"
    );
  });
});
