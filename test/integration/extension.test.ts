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

  /**
   * This function runs before each test in this suite.
   * Its purpose is to reset all mocks and create a fresh, type-safe
   * mock of the VS Code ExtensionContext.
   */
  beforeEach(() => {
    // Reset the state of all mocks to ensure tests are isolated.
    jest.clearAllMocks();

    // Create a complete, type-safe mock of the ExtensionContext.
    // This satisfies all the properties that the 'activate' function uses,
    // preventing TypeScript errors without needing 'as any' or 'as unknown'.
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

    // Create a spy on the buildAllFlavors function to track its calls.
    const buildSpy = jest.spyOn(build, "buildAllFlavors");

    // Spy on the ConfigurationService methods that the command depends on.
    // This isolates our test from the service's internal logic, which is
    // already tested in its own unit test file.
    jest.spyOn(ConfigurationService, "getAccent").mockReturnValue("sapphire");
    jest.spyOn(ConfigurationService, "getFontStyles").mockReturnValue({});
    jest.spyOn(ConfigurationService, "getSyntaxOverrides").mockReturnValue({});

    // Capture the callback function that is passed to registerCommand.
    let commandCallback: () => Promise<void> = async () => {};
    (mockedVscode.commands.registerCommand as jest.Mock).mockImplementation(
      (command: string, callback: () => Promise<void>) => {
        // We only care about the command we're testing.
        if (command === C.REGENERATE_COMMAND_ID) {
          commandCallback = callback;
        }
        // The real API returns a disposable, so our mock should too.
        return { dispose: () => {} };
      }
    );

    // Mock the user interaction to prevent the test from hanging.
    (mockedVscode.window.showInformationMessage as jest.Mock).mockResolvedValue("Reload Window");

    // 2. Act:
    // Run the extension's main activate function to register the commands.
    activate(mockContext);
    // Simulate a user executing the command by calling the captured callback.
    await commandCallback();

    // 3. Assert:
    // Verify that our build function was called, confirming the command is wired up correctly.
    expect(buildSpy).toHaveBeenCalledTimes(1);
    // Verify that the user was prompted to reload the window after the build.
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

    // Capture the listener function that is passed to onDidChangeConfiguration.
    let listener: (event: vscode.ConfigurationChangeEvent) => void = () => {};
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation((callback) => {
      listener = callback;
      // The real API returns a disposable, so our mock should too.
      return { dispose: () => {} };
    });

    // Create a mock event object that simulates a change to our accent color setting.
    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => {
        // We only care if the changed section is one of ours.
        return section === `${C.EXTENSION_NAMESPACE}.${C.CONFIG_KEY_ACCENT}`;
      }),
    };

    // Spy on executeCommand to verify it gets called.
    const executeCommandSpy = mockedVscode.commands.executeCommand;

    // 2. Act
    // Run the extension's activate function to register the listener.
    activate(mockContext);

    // Simulate a user changing a setting by manually calling the captured listener.
    listener(mockEvent);

    // 3. Assert
    // Verify that the correct command was executed as a result of the event.
    expect(executeCommandSpy).toHaveBeenCalledWith(C.REGENERATE_COMMAND_ID);
  });
});
