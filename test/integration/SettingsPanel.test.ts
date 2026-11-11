/**
 * @file `SettingsPanel`'s message handling, with `ConfigurationService` spied on and the `vscode`
 * mock.
 */

import * as vscode from "vscode";
import * as manifest from "../../package.json";
import { ConfigurationService } from "../../src/ConfigurationService";
import { SettingsPanel } from "../../src/SettingsPanel";
import { WebviewManager } from "../../src/WebviewManager";
import { MessageToExtension as WebviewMessage } from "../../types/webview";

jest.mock("../../src/ConfigurationService");

describe("SettingsPanel Integration Tests", () => {
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn(),
      },
    } as unknown as vscode.ExtensionContext;
  });

  it("should call updateAccent on the ConfigurationService when receiving an updateAccent message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);

    const updateAccentSpy = jest.spyOn(ConfigurationService, "updateAccent");

    const mockMessage: WebviewMessage = {
      command: "updateAccent",
      value: "mauve",
    };

    await panel._handleMessage(mockMessage);

    expect(updateAccentSpy).toHaveBeenCalledTimes(1);
    expect(updateAccentSpy).toHaveBeenCalledWith("mauve");
  });

  it("should call updateFontStyleOverride on the ConfigurationService when receiving an updateSetting message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);

    const getActiveFlavorSpy = jest
      .spyOn(ConfigurationService, "getActiveFlavor")
      .mockReturnValue("macchiato");

    const updateFontStyleOverrideSpy = jest.spyOn(ConfigurationService, "updateFontStyleOverride");

    const mockMessage: WebviewMessage = {
      command: "updateSetting",
      key: "commentFontStyle",
      value: "italic",
    };

    await panel._handleMessage(mockMessage);

    expect(getActiveFlavorSpy).toHaveBeenCalledTimes(1);
    expect(updateFontStyleOverrideSpy).toHaveBeenCalledTimes(1);
    expect(updateFontStyleOverrideSpy).toHaveBeenCalledWith(
      "macchiato",
      "commentFontStyle",
      "italic",
    );
  });

  it("should call resetFontStyleOverride on the ConfigurationService when receiving a resetFontStyle message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);

    const getActiveFlavorSpy = jest
      .spyOn(ConfigurationService, "getActiveFlavor")
      .mockReturnValue("macchiato");

    const resetFontStyleOverrideSpy = jest.spyOn(ConfigurationService, "resetFontStyleOverride");

    const mockMessage: WebviewMessage = {
      command: "resetFontStyle",
      key: "keywordFontStyle",
    };

    await panel._handleMessage(mockMessage);

    expect(getActiveFlavorSpy).toHaveBeenCalledTimes(1);
    expect(resetFontStyleOverrideSpy).toHaveBeenCalledTimes(1);
    expect(resetFontStyleOverrideSpy).toHaveBeenCalledWith("macchiato", "keywordFontStyle");
  });

  it("should call updateSyntaxColor on the ConfigurationService when receiving an updateSyntaxColor message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);

    const updateSyntaxColorSpy = jest.spyOn(ConfigurationService, "updateSyntaxColor");

    const mockMessage: WebviewMessage = {
      command: "updateSyntaxColor",
      flavor: "mocha",
      key: "comment",
      value: "#8c93b1",
    };

    await panel._handleMessage(mockMessage);

    expect(updateSyntaxColorSpy).toHaveBeenCalledTimes(1);
    expect(updateSyntaxColorSpy).toHaveBeenCalledWith("mocha", "comment", "#8c93b1");
  });

  it("should call updateUiColor on the ConfigurationService when receiving an updateUiColor message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const updateUiColorSpy = jest.spyOn(ConfigurationService, "updateUiColor");
    const mockMessage: WebviewMessage = {
      command: "updateUiColor",
      flavor: "latte",
      key: "base",
      value: "#ffffff",
    };

    await panel._handleMessage(mockMessage);

    expect(updateUiColorSpy).toHaveBeenCalledTimes(1);
    expect(updateUiColorSpy).toHaveBeenCalledWith("latte", "base", "#ffffff");
  });

  it("should call resetUiColor on the ConfigurationService when receiving a resetUiColor message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const resetUiColorSpy = jest.spyOn(ConfigurationService, "resetUiColor");
    const mockMessage: WebviewMessage = {
      command: "resetUiColor",
      flavor: "mocha",
      key: "crust",
    };

    await panel._handleMessage(mockMessage);

    expect(resetUiColorSpy).toHaveBeenCalledTimes(1);
    expect(resetUiColorSpy).toHaveBeenCalledWith("mocha", "crust");
  });

  it("should call resetAll on the ConfigurationService when receiving a resetAll message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);

    const resetAllSpy = jest
      .spyOn(ConfigurationService, "resetAll")
      .mockImplementation(() => Promise.resolve());

    const mockMessage: WebviewMessage = {
      command: "resetAll",
    };

    await panel._handleMessage(mockMessage);

    expect(resetAllSpy).toHaveBeenCalledTimes(1);
  });

  it("should call updateActiveProfile and refresh webview when receiving switchProfile message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const updateActiveProfileSpy = jest
      .spyOn(ConfigurationService, "updateActiveProfile")
      .mockResolvedValue();
    const updateSpy = jest
      .spyOn(panel as unknown as { _update: () => void }, "_update")
      .mockImplementation();

    const mockMessage: WebviewMessage = {
      command: "switchProfile",
      profile: "CustomProfile",
    };

    await panel._handleMessage(mockMessage);

    expect(updateActiveProfileSpy).toHaveBeenCalledWith("CustomProfile");
    expect(updateSpy).toHaveBeenCalled();
  });

  it("should call saveProfile when receiving saveProfile message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const saveProfileSpy = jest.spyOn(ConfigurationService, "saveProfile").mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "saveProfile",
      profile: "NewProfile",
    };

    await panel._handleMessage(mockMessage);

    expect(saveProfileSpy).toHaveBeenCalledWith("NewProfile");
  });

  it("should call deleteProfile and refresh webview when receiving deleteProfile message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const deleteProfileSpy = jest.spyOn(ConfigurationService, "deleteProfile").mockResolvedValue();
    const updateSpy = jest
      .spyOn(panel as unknown as { _update: () => void }, "_update")
      .mockImplementation();

    const mockMessage: WebviewMessage = {
      command: "deleteProfile",
      profile: "OldProfile",
    };

    await panel._handleMessage(mockMessage);

    expect(deleteProfileSpy).toHaveBeenCalledWith("OldProfile");
    expect(updateSpy).toHaveBeenCalled();
  });

  it("should attempt to delete Default profile (ConfigurationService handles protection)", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const deleteProfileSpy = jest.spyOn(ConfigurationService, "deleteProfile").mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "deleteProfile",
      profile: "Default",
    };

    await panel._handleMessage(mockMessage);

    // The service, not the panel, refuses to delete `Default`.
    expect(deleteProfileSpy).toHaveBeenCalledWith("Default");
  });

  it("should call updateFontStyleOverride when receiving updateSetting message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    jest.spyOn(ConfigurationService, "getActiveFlavor").mockReturnValue("mocha");
    const updateFontStyleOverrideSpy = jest
      .spyOn(ConfigurationService, "updateFontStyleOverride")
      .mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "updateSetting",
      key: "commentFontStyle",
      value: "bold",
    };

    await panel._handleMessage(mockMessage);

    expect(updateFontStyleOverrideSpy).toHaveBeenCalledWith("mocha", "commentFontStyle", "bold");
  });

  it("should call resetSyntaxColor when receiving resetSyntaxColor message", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const resetSyntaxColorSpy = jest
      .spyOn(ConfigurationService, "resetSyntaxColor")
      .mockResolvedValue();

    const mockMessage: WebviewMessage = {
      command: "resetSyntaxColor",
      flavor: "mocha",
      key: "string",
    };

    await panel._handleMessage(mockMessage);

    expect(resetSyntaxColorSpy).toHaveBeenCalledWith("mocha", "string");
  });

  it("should handle multiple sequential messages correctly", async () => {
    const panel = new (SettingsPanel as unknown as new (
      context: vscode.ExtensionContext,
    ) => SettingsPanel)(mockContext);
    const updateAccentSpy = jest.spyOn(ConfigurationService, "updateAccent").mockResolvedValue();
    jest.spyOn(ConfigurationService, "getActiveFlavor").mockReturnValue("mocha");
    const updateFontStyleOverrideSpy = jest
      .spyOn(ConfigurationService, "updateFontStyleOverride")
      .mockResolvedValue();
    const saveProfileSpy = jest.spyOn(ConfigurationService, "saveProfile").mockResolvedValue();
    jest.spyOn(ConfigurationService, "updateActiveProfile").mockResolvedValue();
    jest.spyOn(panel as unknown as { _update: () => void }, "_update").mockImplementation();

    const message1: WebviewMessage = { command: "updateAccent", value: "mauve" };
    const message2: WebviewMessage = {
      command: "updateSetting",
      key: "commentFontStyle",
      value: "bold",
    };
    const message3: WebviewMessage = { command: "saveProfile", profile: "TestProfile" };

    await panel._handleMessage(message1);
    await panel._handleMessage(message2);
    await panel._handleMessage(message3);

    expect(updateAccentSpy).toHaveBeenCalledWith("mauve");
    expect(updateFontStyleOverrideSpy).toHaveBeenCalledWith("mocha", "commentFontStyle", "bold");
    expect(saveProfileSpy).toHaveBeenCalledWith("TestProfile");
  });

  describe("messages arriving from the webview", () => {
    let receive: (raw: unknown) => Promise<void> = () => {
      throw new Error("SettingsPanel never registered a message handler");
    };

    beforeEach(() => {
      jest.mocked(vscode.extensions.getExtension).mockReturnValue({
        packageJSON: manifest,
      } as unknown as vscode.Extension<unknown>);
      jest.spyOn(WebviewManager, "createOrShow").mockImplementation((_context, handler) => {
        receive = handler;
        return Promise.resolve();
      });
      SettingsPanel.createOrShow(mockContext);
    });

    it("should apply a valid message", async () => {
      await receive({ command: "updateAccent", value: "mauve" });

      expect(ConfigurationService.updateAccent).toHaveBeenCalledWith("mauve");
    });

    it("should ignore a message that fails validation", async () => {
      await receive({ command: "updateAccent", value: "<img src=x>" });

      expect(ConfigurationService.updateAccent).not.toHaveBeenCalled();
    });

    /** VS Code ignores the promise a message listener returns, so nobody else would report it. */
    it("should tell the user when a settings write fails", async () => {
      jest
        .mocked(ConfigurationService.updateAccent)
        .mockRejectedValue(new Error("settings.json has errors"));

      await receive({ command: "updateAccent", value: "mauve" });

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "Failed to save Calmppuccin settings. Error: settings.json has errors",
      );
    });
  });
});
