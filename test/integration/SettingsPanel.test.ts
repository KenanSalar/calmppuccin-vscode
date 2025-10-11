/**
 * @file This file contains integration tests for the SettingsPanel.
 * It verifies that the panel correctly handles messages from the webview
 * and calls the appropriate service methods.
 */

import * as vscode from "vscode";
import { SettingsPanel } from "../../src/SettingsPanel";
// Import the shared types from their new, correct location.
import { MessageToExtension as WebviewMessage } from "../../types/webview";
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
   * correctly triggers the ConfigurationService.updateFontStyleOverride method.
   * @precondition The ConfigurationService is mocked.
   * @assertion The spy on `ConfigurationService.updateFontStyleOverride` should be called
   * with the exact flavor, key and value from the mock message.
   */
  it("should call updateFontStyleOverride on the ConfigurationService when receiving an updateSetting message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);

    // Mock getActiveFlavor to return a specific flavor
    const getActiveFlavorSpy = jest.spyOn(ConfigurationService, "getActiveFlavor").mockReturnValue("macchiato");

    // Create a spy on the specific service method we expect to be called.
    const updateFontStyleOverrideSpy = jest.spyOn(ConfigurationService, "updateFontStyleOverride");

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
    expect(getActiveFlavorSpy).toHaveBeenCalledTimes(1);
    expect(updateFontStyleOverrideSpy).toHaveBeenCalledTimes(1);
    expect(updateFontStyleOverrideSpy).toHaveBeenCalledWith("macchiato", "commentFontStyle", "italic");
  });

  /**
   * @description Tests that a 'resetFontStyle' message from the webview
   * correctly triggers the ConfigurationService.resetFontStyleOverride method.
   * @precondition The ConfigurationService is mocked.
   * @assertion The spy on `ConfigurationService.resetFontStyleOverride` should be called
   * with the exact flavor and key from the mock message.
   */
  it("should call resetFontStyleOverride on the ConfigurationService when receiving a resetFontStyle message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);

    // Mock getActiveFlavor to return a specific flavor
    const getActiveFlavorSpy = jest.spyOn(ConfigurationService, "getActiveFlavor").mockReturnValue("macchiato");

    // Create a spy on the specific service method we expect to be called.
    const resetFontStyleOverrideSpy = jest.spyOn(ConfigurationService, "resetFontStyleOverride");

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
    expect(getActiveFlavorSpy).toHaveBeenCalledTimes(1);
    expect(resetFontStyleOverrideSpy).toHaveBeenCalledTimes(1);
    expect(resetFontStyleOverrideSpy).toHaveBeenCalledWith("macchiato", "keywordFontStyle");
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
   * @description Tests that an 'updateUiColor' message from the webview
   * correctly triggers the ConfigurationService.updateUiColor method.
   */
  it("should call updateUiColor on the ConfigurationService when receiving an updateUiColor message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);
    const updateUiColorSpy = jest.spyOn(ConfigurationService, "updateUiColor");
    const mockMessage: WebviewMessage = {
      command: "updateUiColor",
      flavor: "latte",
      key: "base",
      value: "#ffffff",
    };

    // 2. Act
    await panel._handleMessage(mockMessage);

    // 3. Assert
    expect(updateUiColorSpy).toHaveBeenCalledTimes(1);
    expect(updateUiColorSpy).toHaveBeenCalledWith("latte", "base", "#ffffff");
  });

  /**
   * @description Tests that a 'resetUiColor' message from the webview
   * correctly triggers the ConfigurationService.resetUiColor method.
   */
  it("should call resetUiColor on the ConfigurationService when receiving a resetUiColor message", async () => {
    // 1. Arrange
    const panel = new (SettingsPanel as any)(mockContext);
    const resetUiColorSpy = jest.spyOn(ConfigurationService, "resetUiColor");
    const mockMessage: WebviewMessage = {
      command: "resetUiColor",
      flavor: "mocha",
      key: "crust",
    };

    // 2. Act
    await panel._handleMessage(mockMessage);

    // 3. Assert
    expect(resetUiColorSpy).toHaveBeenCalledTimes(1);
    expect(resetUiColorSpy).toHaveBeenCalledWith("mocha", "crust");
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
    const resetAllSpy = jest.spyOn(ConfigurationService, "resetAll").mockImplementation(() => Promise.resolve());

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

  /**
   * @description Tests that a 'switchProfile' message triggers profile switch and refreshes webview.
   * @precondition The ConfigurationService is mocked
   * @assertion updateActiveProfile should be called and _update should be called
   */
  it("should call updateActiveProfile and refresh webview when receiving switchProfile message", async () => {
    const panel = new (SettingsPanel as any)(mockContext);
    const updateActiveProfileSpy = jest.spyOn(ConfigurationService, "updateActiveProfile").mockResolvedValue();
    const updateSpy = jest.spyOn(panel, "_update" as any).mockImplementation();

    const mockMessage: WebviewMessage = {
      command: "switchProfile",
      profile: "CustomProfile",
    };

    await panel._handleMessage(mockMessage);

    expect(updateActiveProfileSpy).toHaveBeenCalledWith("CustomProfile");
    expect(updateSpy).toHaveBeenCalled();
  });

  /**
   * @description Tests that a 'saveProfile' message triggers profile save.
   * @precondition The ConfigurationService is mocked
   * @assertion saveProfile should be called with profile name
   */
  it("should call saveProfile when receiving saveProfile message", async () => {
    const panel = new (SettingsPanel as any)(mockContext);
    const saveProfileSpy = jest.spyOn(ConfigurationService, "saveProfile").mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "saveProfile",
      profile: "NewProfile",
    };

    await panel._handleMessage(mockMessage);

    expect(saveProfileSpy).toHaveBeenCalledWith("NewProfile");
  });

  /**
   * @description Tests that a 'deleteProfile' message triggers profile deletion and refresh.
   * @precondition The ConfigurationService is mocked
   * @assertion deleteProfile should be called and _update should be called
   */
  it("should call deleteProfile and refresh webview when receiving deleteProfile message", async () => {
    const panel = new (SettingsPanel as any)(mockContext);
    const deleteProfileSpy = jest.spyOn(ConfigurationService, "deleteProfile").mockResolvedValue();
    const updateSpy = jest.spyOn(panel, "_update" as any).mockImplementation();

    const mockMessage: WebviewMessage = {
      command: "deleteProfile",
      profile: "OldProfile",
    };

    await panel._handleMessage(mockMessage);

    expect(deleteProfileSpy).toHaveBeenCalledWith("OldProfile");
    expect(updateSpy).toHaveBeenCalled();
  });

  /**
   * @description Tests that deleteProfile with Default profile is handled.
   * @precondition The ConfigurationService prevents Default profile deletion
   * @assertion deleteProfile should be called even for Default (service handles protection)
   */
  it("should attempt to delete Default profile (ConfigurationService handles protection)", async () => {
    const panel = new (SettingsPanel as any)(mockContext);
    const deleteProfileSpy = jest.spyOn(ConfigurationService, "deleteProfile").mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "deleteProfile",
      profile: "Default",
    };

    await panel._handleMessage(mockMessage);

    // Panel passes request to service, service handles protection
    expect(deleteProfileSpy).toHaveBeenCalledWith("Default");
  });

  /**
   * @description Tests that updating font style works correctly.
   * @precondition The ConfigurationService is mocked
   * @assertion updateFontStyleOverride should be called with flavor, key and value
   */
  it("should call updateFontStyleOverride when receiving updateSetting message", async () => {
    const panel = new (SettingsPanel as any)(mockContext);
    jest.spyOn(ConfigurationService, "getActiveFlavor").mockReturnValue("mocha");
    const updateFontStyleOverrideSpy = jest.spyOn(ConfigurationService, "updateFontStyleOverride").mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "updateSetting",
      key: "commentFontStyle",
      value: "bold",
    };

    await panel._handleMessage(mockMessage);

    expect(updateFontStyleOverrideSpy).toHaveBeenCalledWith("mocha", "commentFontStyle", "bold");
  });

  /**
   * @description Tests that a 'resetSyntaxColor' message triggers syntax color reset.
   * @precondition The ConfigurationService is mocked
   * @assertion resetSyntaxColor should be called with flavor and key
   */
  it("should call resetSyntaxColor when receiving resetSyntaxColor message", async () => {
    const panel = new (SettingsPanel as any)(mockContext);
    const resetSyntaxColorSpy = jest.spyOn(ConfigurationService, "resetSyntaxColor").mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "resetSyntaxColor",
      flavor: "mocha",
      key: "string",
    };

    await panel._handleMessage(mockMessage);

    expect(resetSyntaxColorSpy).toHaveBeenCalledWith("mocha", "string");
  });

  /**
   * @description Tests that multiple sequential messages are handled correctly.
   * @precondition The ConfigurationService is mocked
   * @assertion All messages should be processed in order
   */
  it("should handle multiple sequential messages correctly", async () => {
    const panel = new (SettingsPanel as any)(mockContext);
    const updateAccentSpy = jest.spyOn(ConfigurationService, "updateAccent").mockResolvedValue();
    jest.spyOn(ConfigurationService, "getActiveFlavor").mockReturnValue("mocha");
    const updateFontStyleOverrideSpy = jest.spyOn(ConfigurationService, "updateFontStyleOverride").mockResolvedValue();
    const saveProfileSpy = jest.spyOn(ConfigurationService, "saveProfile").mockResolvedValue();
    jest.spyOn(ConfigurationService, "updateActiveProfile").mockResolvedValue();
    jest.spyOn(panel, "_update" as any).mockImplementation();

    const message1: WebviewMessage = { command: "updateAccent", value: "mauve" };
    const message2: WebviewMessage = { command: "updateSetting", key: "commentFontStyle", value: "bold" };
    const message3: WebviewMessage = { command: "saveProfile", profile: "TestProfile" };

    await panel._handleMessage(message1);
    await panel._handleMessage(message2);
    await panel._handleMessage(message3);

    expect(updateAccentSpy).toHaveBeenCalledWith("mauve");
    expect(updateFontStyleOverrideSpy).toHaveBeenCalledWith("mocha", "commentFontStyle", "bold");
    expect(saveProfileSpy).toHaveBeenCalledWith("TestProfile");
  });
});
