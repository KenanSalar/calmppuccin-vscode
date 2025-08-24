/**
 * @file This file contains integration tests for the SettingsPanel.
 * It verifies that the panel correctly handles messages from the webview
 * and calls the appropriate service methods.
 */

import * as vscode from "vscode";
import { SettingsPanel, WebviewMessage } from "../../src/SettingsPanel";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

// We only need to mock the parts of ConfigurationService we intend to spy on.
jest.mock("../../src/ConfigurationService");

describe("SettingsPanel Integration Tests", () => {
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock context, as SettingsPanel requires it.
    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn(),
      },
    } as any; // Using 'as any' is acceptable here as the full context is complex
    // and not needed for this specific test.
  });

  /**
   * @description Tests that a 'updateAccent' message from the webview
   * correctly triggers the ConfigurationService.updateAccent method.
   * @precondition The ConfigurationService is mocked.
   * @assertion The spy on `ConfigurationService.updateAccent` should be called
   * with the exact value from the mock message.
   */
  it("should call updateAccent on the ConfigurationService when receiving an updateAccent message", async () => {
    // 1. Arrange

    // Create an instance of the panel. Note that we don't need to create a real webview.
    // We are testing the panel's internal logic directly.
    const panel = new (SettingsPanel as any)(mockContext);

    // Create a spy on the specific service method we expect to be called.
    const updateAccentSpy = jest.spyOn(ConfigurationService, "updateAccent");

    // This is our simulated message, as if it came from the webview UI.
    const mockMessage: WebviewMessage = {
      command: "updateAccent",
      value: "mauve",
    };

    // 2. Act
    // Manually call the message handler with our simulated message.
    await panel._handleMessage(mockMessage);

    // 3. Assert
    // Verify that the correct service method was called, and with the correct data.
    expect(updateAccentSpy).toHaveBeenCalledTimes(1);
    expect(updateAccentSpy).toHaveBeenCalledWith("mauve");
  });

  /**
   * @description Tests that an 'updateSetting' message (for font styles) from the webview
   * correctly triggers the ConfigurationService.updateFontStyle method.
   * @precondition The ConfigurationService is mocked.
   * @assertion The spy on `ConfigurationService.updateFontStyle` should be called
   * with the exact key and value from the mock message.
   */
  it("should call updateFontStyle on the ConfigurationService when receiving an updateSetting message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);

    // Create a spy on the specific service method we expect to be called.
    const updateFontStyleSpy = jest.spyOn(ConfigurationService, "updateFontStyle");

    // This is our simulated message, as if a user changed the 'comment' font style.
    const mockMessage: WebviewMessage = {
      command: "updateSetting",
      key: "commentFontStyle",
      value: "italic",
    };

    // 2. Act
    // Manually call the message handler with our simulated message.
    await panel._handleMessage(mockMessage);

    // 3. Assert
    // Verify that the correct service method was called, and with the correct data.
    expect(updateFontStyleSpy).toHaveBeenCalledTimes(1);
    expect(updateFontStyleSpy).toHaveBeenCalledWith("commentFontStyle", "italic");
  });

  /**
   * @description Tests that a 'resetFontStyle' message from the webview
   * correctly triggers the ConfigurationService.resetFontStyle method.
   * @precondition The ConfigurationService is mocked.
   * @assertion The spy on `ConfigurationService.resetFontStyle` should be called
   * with the exact key from the mock message.
   */
  it("should call resetFontStyle on the ConfigurationService when receiving a resetFontStyle message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);

    // Create a spy on the specific service method we expect to be called.
    const resetFontStyleSpy = jest.spyOn(ConfigurationService, "resetFontStyle");

    // This is our simulated message, as if a user clicked the "Reset" button for a font style.
    const mockMessage: WebviewMessage = {
      command: "resetFontStyle",
      key: "keywordFontStyle",
    };

    // 2. Act
    // Manually call the message handler with our simulated message.
    await panel._handleMessage(mockMessage);

    // 3. Assert
    // Verify that the correct service method was called, and with the correct data.
    expect(resetFontStyleSpy).toHaveBeenCalledTimes(1);
    expect(resetFontStyleSpy).toHaveBeenCalledWith("keywordFontStyle");
  });

  /**
   * @description Tests that an 'updateSyntaxColor' message from the webview
   * correctly triggers the ConfigurationService.updateSyntaxColor method.
   * @precondition The ConfigurationService is mocked.
   * @assertion The spy on `ConfigurationService.updateSyntaxColor` should be called
   * with the exact flavor, key, and value from the mock message.
   */
  it("should call updateSyntaxColor on the ConfigurationService when receiving an updateSyntaxColor message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);

    // Create a spy on the specific service method we expect to be called.
    const updateSyntaxColorSpy = jest.spyOn(ConfigurationService, "updateSyntaxColor");

    // This is our simulated message, as if a user changed the 'comment' color for the 'mocha' theme.
    const mockMessage: WebviewMessage = {
      command: "updateSyntaxColor",
      flavor: "mocha",
      key: "comment",
      value: "#8c93b1", // A new color value
    };

    // 2. Act
    // Manually call the message handler with our simulated message.
    await panel._handleMessage(mockMessage);

    // 3. Assert
    // Verify that the correct service method was called with the correct data.
    expect(updateSyntaxColorSpy).toHaveBeenCalledTimes(1);
    expect(updateSyntaxColorSpy).toHaveBeenCalledWith("mocha", "comment", "#8c93b1");
  });

  /**
   * @description Tests that a 'resetAll' message from the webview
   * correctly triggers the ConfigurationService.resetAll method.
   * @precondition The ConfigurationService is mocked.
   * @assertion The spy on `ConfigurationService.resetAll` should be called exactly once.
   */
  it("should call resetAll on the ConfigurationService when receiving a resetAll message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);

    // Create a spy on the service method we expect to be called.
    const resetAllSpy = jest.spyOn(ConfigurationService, "resetAll");

    // This is our simulated message, as if a user clicked the "Reset All" button.
    const mockMessage: WebviewMessage = {
      command: "resetAll",
    };

    // 2. Act
    // Manually call the message handler with our simulated message.
    await panel._handleMessage(mockMessage);

    // 3. Assert
    // Verify that the correct service method was called.
    expect(resetAllSpy).toHaveBeenCalledTimes(1);
  });
});
