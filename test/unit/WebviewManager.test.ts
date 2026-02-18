/**
 * @file This file contains unit tests for the WebviewManager class.
 * It verifies the lifecycle management of the VS Code webview panel,
 * including its creation, revealing, and disposal.
 */

import * as vscode from "vscode";
import * as fs from "fs/promises";
// Import the shared types from their new, correct location.
import { MessageToWebview } from "../../types/webview";
import { WebviewManager } from "../../src/WebviewManager";
import * as C from "../../src/constants";

// --- Mocking Dependencies ---

// Mock the 'fs/promises' module to prevent tests from accessing the actual file system.
jest.mock("fs/promises");

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
      file: jest.fn((filePath: string) => ({
        fsPath: filePath,
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
  let revealMock: jest.Mock;
  let postMessageMock: jest.Mock;

  // This setup function runs before each test in the suite.
  beforeEach(() => {
    // Reset all mock function calls to ensure test isolation.
    jest.clearAllMocks();

    // Create a mock dispose function that can be spied on to track calls.
    const mockDispose = jest.fn();
    disposeSpy = jest.spyOn({ dispose: mockDispose }, "dispose");

    // Create mock functions that we'll reference directly in tests
    revealMock = jest.fn();
    postMessageMock = jest.fn();

    // Create a mock WebviewPanel object that simulates the real VS Code panel.
    mockPanel = {
      webview: {
        html: "",
        onDidReceiveMessage: jest.fn(),
        postMessage: postMessageMock,
        // The asWebviewUri function is mocked to return the URI unmodified for simplicity.
        asWebviewUri: jest.fn((uri: vscode.Uri) => uri),
        cspSource: "https://mock.csp.source",
      },
      onDidDispose: jest.fn(),
      reveal: revealMock,
      dispose: disposeSpy,
    } as unknown as vscode.WebviewPanel;

    // Create a mock ExtensionContext. The WebviewManager only requires `extensionPath`.
    mockContext = {
      extensionPath: "/mock/extension/path",
    } as vscode.ExtensionContext;

    // Configure the mocked `createWebviewPanel` to return our `mockPanel` instance.
    (mockedVscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockPanel);

    // Configure the mocked `readFile` to return a simple HTML string (async version).
    // Includes <head>...</head> so that CSP injection can be tested.
    (fs.readFile as jest.Mock).mockResolvedValue("<html><head></head><body>webview.js style.css</body></html>");

    // Reset the static `currentPanel` property on the WebviewManager before each test.
    WebviewManager.currentPanel = undefined;
  });

  /**
   * @description Verifies that `createOrShow` correctly calls `vscode.window.createWebviewPanel`
   * when no panel currently exists.
   * @assertion It should create exactly one panel and set the static `currentPanel` instance.
   */
  it("should create a new panel if one does not exist", async () => {
    // Act: Call the method to create the panel.
    await WebviewManager.createOrShow(mockContext, jest.fn());

    // Assert: A new panel was created with the correct parameters.
    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledWith(
      C.WEBVIEW_CONSTANTS.WEBVIEW_ID,
      C.WEBVIEW_CONSTANTS.WEBVIEW_TITLE,
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
  it("should reveal the existing panel if one already exists", async () => {
    // Arrange: Create a panel first.
    await WebviewManager.createOrShow(mockContext, jest.fn());

    // Act: Call the method a second time.
    await WebviewManager.createOrShow(mockContext, jest.fn());

    // Assert: `createWebviewPanel` was not called again.
    expect(mockedVscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    // Assert: The `reveal` method on the existing panel was called.
    expect(revealMock).toHaveBeenCalledTimes(1);
    expect(revealMock).toHaveBeenCalledWith(vscode.ViewColumn.One);
  });

  /**
   * @description Verifies that the optional `onReveal` callback is executed when an existing panel is shown.
   */
  it("should call the onReveal callback when revealing an existing panel", async () => {
    // Arrange
    const onRevealCallback = jest.fn();
    await WebviewManager.createOrShow(mockContext, jest.fn()); // Create the panel

    // Act: Reveal the panel and provide a callback.
    await WebviewManager.createOrShow(mockContext, jest.fn(), onRevealCallback);

    // Assert: The callback was executed exactly once.
    expect(onRevealCallback).toHaveBeenCalledTimes(1);
  });

  /**
   * @description Ensures that the `postMessage` method correctly forwards the message
   * to the underlying webview panel instance.
   */
  it("should delegate postMessage to the underlying webview's postMessage method", async () => {
    // Arrange: Define a message payload that conforms to the `MessageToWebview` type.
    const testMessage: MessageToWebview = { command: "loadSettings", settings: {} as unknown as import("../../types/webview").ISettingsPayload };
    await WebviewManager.createOrShow(mockContext, jest.fn());

    // Act: Post the message through the manager.
    WebviewManager.currentPanel?.postMessage(testMessage);

    // Assert: The webview's internal postMessage method was called with the correct data.
    expect(postMessageMock).toHaveBeenCalledTimes(1);
    expect(postMessageMock).toHaveBeenCalledWith(testMessage);
  });

  /**
   * @description Verifies that the generated HTML includes a Content-Security-Policy meta tag.
   */
  it("should inject a Content-Security-Policy meta tag into the HTML", async () => {
    // Act
    await WebviewManager.createOrShow(mockContext, jest.fn());

    // Assert: The HTML contains a CSP meta tag with the webview's cspSource.
    expect(mockPanel.webview.html).toContain("Content-Security-Policy");
    expect(mockPanel.webview.html).toContain("img-src data:");
    expect(mockPanel.webview.html).toContain("https://mock.csp.source");
  });

  /**
   * @description Verifies that the `dispose` method correctly cleans up resources.
   * @assertion It should call `dispose()` on the panel and clear the static instance.
   */
  it("should call dispose on the panel and reset the static instance", async () => {
    // Arrange
    await WebviewManager.createOrShow(mockContext, jest.fn());
    const panelInstance = WebviewManager.currentPanel;

    // Act
    panelInstance?.dispose();

    // Assert: The panel's own dispose method was called.
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    // Assert: The static singleton instance is now undefined.
    expect(WebviewManager.currentPanel).toBeUndefined();
  });

  /**
   * @description Verifies that calling dispose() twice does not throw or double-dispose.
   */
  it("should be safe to call dispose() twice (idempotent)", async () => {
    // Arrange
    await WebviewManager.createOrShow(mockContext, jest.fn());
    const panelInstance = WebviewManager.currentPanel;

    // Act: Call dispose twice — the second call should be a no-op.
    panelInstance?.dispose();
    panelInstance?.dispose();

    // Assert: The panel's own dispose method was called only once.
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    expect(WebviewManager.currentPanel).toBeUndefined();
  });
});
