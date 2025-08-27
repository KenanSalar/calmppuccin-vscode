/**
 * @file This file contains unit tests for the WebviewManager class.
 * It verifies the lifecycle management of the VS Code webview panel,
 * including its creation, revealing, and disposal.
 */

import * as vscode from "vscode";
import * as fs from "fs";
// Import the shared types from their new, correct location.
import { MessageToWebview } from "../../types/webview";
import { WebviewManager } from "../../src/WebviewManager";
import * as C from "../../src/constants";

// --- Mocking Dependencies ---

// Mock the 'fs' module to prevent tests from accessing the actual file system.
jest.mock("fs");

// Provide an explicit, virtual mock for the entire 'vscode' module.
// This is necessary to define the structure of the API that WebviewManager depends on,
// resolving TypeScript errors and giving full control over its behavior in tests.
jest.mock(
  "vscode",
  () => ({
    window: {
      createWebviewPanel: jest.fn(),
    },
    ViewColumn: {
      One: 1,
    },
    Uri: {
      // The `file` method is mocked to return a URI-like object.
      file: jest.fn((path) => ({
        fsPath: path,
        // Mock the 'with' method for potential scheme changes (e.g., to 'vscode-resource').
        with: jest.fn(),
      })),
    },
  }),
  // `virtual: true` is required for modules that don't exist in node_modules.
  { virtual: true }
);

// Cast the imported vscode object to its mocked type for type-safe access to mock functions.
const mockedVscode = vscode as jest.Mocked<typeof vscode>;

/**
 * @description Test suite for the WebviewManager class.
 */
describe("WebviewManager Unit Tests", () => {
  let mockContext: vscode.ExtensionContext;
  let mockPanel: vscode.WebviewPanel;
  let disposeSpy: jest.SpyInstance;

  // This setup function runs before each test in the suite.
  beforeEach(() => {
    // Reset all mock function calls to ensure test isolation.
    jest.clearAllMocks();

    // Create a mock dispose function that can be spied on to track calls.
    const mockDispose = jest.fn();
    disposeSpy = jest.spyOn({ dispose: mockDispose }, "dispose");

    // Create a mock WebviewPanel object that simulates the real VS Code panel.
    mockPanel = {
      webview: {
        html: "",
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn(),
        // The asWebviewUri function is mocked to return the URI unmodified for simplicity.
        asWebviewUri: jest.fn((uri) => uri),
      },
      onDidDispose: jest.fn(),
      reveal: jest.fn(),
      dispose: disposeSpy,
    } as any;

    // Create a mock ExtensionContext. The WebviewManager only requires `extensionPath`.
    mockContext = {
      extensionPath: "/mock/extension/path",
    } as vscode.ExtensionContext;

    // Configure the mocked `createWebviewPanel` to return our `mockPanel` instance.
    (mockedVscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockPanel);

    // Configure the mocked `readFileSync` to return a simple HTML string.
    (fs.readFileSync as jest.Mock).mockReturnValue("<html><body>webview.js style.css</body></html>");

    // Reset the static `currentPanel` property on the WebviewManager before each test.
    WebviewManager.currentPanel = undefined;
  });

  /**
   * @description Verifies that `createOrShow` correctly calls `vscode.window.createWebviewPanel`
   * when no panel currently exists.
   * @assertion It should create exactly one panel and set the static `currentPanel` instance.
   */
  it("should create a new panel if one does not exist", () => {
    // Act: Call the method to create the panel.
    WebviewManager.createOrShow(mockContext, jest.fn());

    // Assert: A new panel was created with the correct parameters.
    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledWith(
      C.WEBVIEW_COMMANDS.WEBVIEW_ID,
      C.WEBVIEW_COMMANDS.WEBVIEW_TITLE,
      vscode.ViewColumn.One,
      expect.any(Object)
    );

    // Assert: The static `currentPanel` property is now set.
    expect(WebviewManager.currentPanel).toBeInstanceOf(WebviewManager);
    // Assert: The panel's HTML content was assigned.
    expect(mockPanel.webview.html).toContain("<html>");
  });

  /**
   * @description Verifies that `createOrShow` reveals the existing panel instead of creating a new one
   * if a panel instance already exists.
   * @assertion It should not call `createWebviewPanel` again but should call `reveal()` on the existing panel.
   */
  it("should reveal the existing panel if one already exists", () => {
    // Arrange: Create a panel first.
    WebviewManager.createOrShow(mockContext, jest.fn());

    // Act: Call the method a second time.
    WebviewManager.createOrShow(mockContext, jest.fn());

    // Assert: `createWebviewPanel` was not called again.
    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    // Assert: The `reveal` method on the existing panel was called.
    expect(mockPanel.reveal).toHaveBeenCalledTimes(1);
    expect(mockPanel.reveal).toHaveBeenCalledWith(vscode.ViewColumn.One);
  });

  /**
   * @description Verifies that the optional `onReveal` callback is executed when an existing panel is shown.
   */
  it("should call the onReveal callback when revealing an existing panel", () => {
    // Arrange
    const onRevealCallback = jest.fn();
    WebviewManager.createOrShow(mockContext, jest.fn()); // Create the panel

    // Act: Reveal the panel and provide a callback.
    WebviewManager.createOrShow(mockContext, jest.fn(), onRevealCallback);

    // Assert: The callback was executed exactly once.
    expect(onRevealCallback).toHaveBeenCalledTimes(1);
  });

  /**
   * @description Ensures that the `postMessage` method correctly forwards the message
   * to the underlying webview panel instance.
   */
  it("should delegate postMessage to the underlying webview's postMessage method", () => {
    // Arrange: Define a message payload that conforms to the `MessageToWebview` type.
    const testMessage: MessageToWebview = { command: "loadSettings", settings: {} as any };
    WebviewManager.createOrShow(mockContext, jest.fn());

    // Act: Post the message through the manager.
    WebviewManager.currentPanel?.postMessage(testMessage);

    // Assert: The webview's internal postMessage method was called with the correct data.
    expect(mockPanel.webview.postMessage).toHaveBeenCalledTimes(1);
    expect(mockPanel.webview.postMessage).toHaveBeenCalledWith(testMessage);
  });

  /**
   * @description Verifies that the `dispose` method correctly cleans up resources.
   * @assertion It should call `dispose()` on the panel and clear the static instance.
   */
  it("should call dispose on the panel and reset the static instance", () => {
    // Arrange
    WebviewManager.createOrShow(mockContext, jest.fn());
    const panelInstance = WebviewManager.currentPanel;

    // Act
    panelInstance?.dispose();

    // Assert: The panel's own dispose method was called.
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    // Assert: The static singleton instance is now undefined.
    expect(WebviewManager.currentPanel).toBeUndefined();
  });
});
