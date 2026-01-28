/**
 * @file icon-sync.test.ts
 * @description Integration tests for the icon theme synchronization feature.
 * Verifies that icon themes are correctly synced with color theme flavors.
 */

import { activate } from "../../extension";
import * as vscode from "vscode";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

/**
 * Test suite for icon theme synchronization logic.
 */
describe("Icon Theme Synchronization", () => {
  let mockContext: vscode.ExtensionContext;
  let mockWorkbenchConfig: { get: jest.Mock; update: jest.Mock };
  let themeChangeListener: (event: vscode.ConfigurationChangeEvent) => void = () => {};

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock workbench configuration
    mockWorkbenchConfig = {
      get: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };

    // Setup workspace configuration mocking
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      if (section === "workbench") {
        return mockWorkbenchConfig;
      }
      if (section === C.EXTENSION_NAMESPACE) {
        return { get: jest.fn(), update: jest.fn() };
      }
      return { get: jest.fn(), update: jest.fn() };
    });

    // Capture the theme change listener
    (mockedVscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation(
      (callback: (event: vscode.ConfigurationChangeEvent) => void) => {
        themeChangeListener = callback;
        return { dispose: jest.fn() };
      }
    );

    // Create mock extension context
    mockContext = {
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn(),
        setKeysForSync: jest.fn(),
      },
      workspaceState: { get: jest.fn(), update: jest.fn(), keys: jest.fn() },
      secrets: { get: jest.fn(), store: jest.fn(), onDidChange: jest.fn(), delete: jest.fn(), keys: jest.fn() },
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

  /**
   * @description Tests that icon flavor syncs when theme changes to a Calmppuccin theme.
   * @precondition Color theme is Calmppuccin Mocha, icon theme is wrong flavor
   * @assertion Icon theme should be updated to catppuccin-mocha
   */
  it("should sync icon flavor when theme changes to Calmppuccin Mocha", async () => {
    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return "Calmppuccin Mocha";
      if (key === "iconTheme") return "catppuccin-latte"; // Wrong flavor
      return undefined;
    });

    activate(mockContext);

    // The theme listener is automatically triggered because "Calmppuccin Mocha" is set
    // Wait for the initial icon sync (100ms timeout in syncIconFlavor)
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
      "iconTheme",
      "catppuccin-mocha",
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that icon sync does not run if icon pack is not installed.
   * @precondition Icon theme is not a Catppuccin theme
   * @assertion Icon theme should NOT be updated
   */
  it("should NOT sync if Catppuccin icon pack is not installed", async () => {
    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return "Calmppuccin Mocha";
      if (key === "iconTheme") return "vscode-icons"; // Different icon pack
      return undefined;
    });

    activate(mockContext);

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => section === "workbench.colorTheme"),
    };
    themeChangeListener(mockEvent);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(mockWorkbenchConfig.update).not.toHaveBeenCalled();
  });

  /**
   * @description Tests that custom flavors (Nitro Cold Brew, Oledppuccin) map to mocha icons.
   * @precondition Color theme is Calmppuccin Nitro Cold Brew
   * @assertion Icon theme should be updated to catppuccin-mocha
   */
  it("should map custom flavors (Nitro Cold Brew) to mocha icons", async () => {
    // Use dynamic import to get a fresh module instance
    jest.resetModules();
    jest.mock("vscode", () => mockedVscode, { virtual: true });
    const { activate: freshActivate } = await import("../../extension");

    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return "Calmppuccin Nitro Cold Brew";
      if (key === "iconTheme") return "catppuccin-frappe"; // Different flavor
      return undefined;
    });

    freshActivate(mockContext);

    // Wait for the initial icon sync
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
      "iconTheme",
      "catppuccin-mocha", // Maps to mocha
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that Oledppuccin flavor maps to mocha icons.
   * @precondition Color theme is Calmppuccin Oledppuccin
   * @assertion Icon theme should be updated to catppuccin-mocha
   */
  it("should map Oledppuccin flavor to mocha icons", async () => {
    // Use dynamic import to get a fresh module instance
    jest.resetModules();
    jest.mock("vscode", () => mockedVscode, { virtual: true });
    const { activate: freshActivate } = await import("../../extension");
    
    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return "Calmppuccin Oledppuccin";
      if (key === "iconTheme") return "catppuccin-latte"; // Different flavor
      return undefined;
    });

    freshActivate(mockContext);

    // Wait for the initial icon sync
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
      "iconTheme",
      "catppuccin-mocha",
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that sync handles invalid theme name gracefully.
   * @precondition Color theme is not a valid Calmppuccin theme
   * @assertion Icon theme should NOT be updated
   */
  it("should handle non-Calmppuccin theme gracefully", async () => {
    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return "Dark+ (default dark)";
      if (key === "iconTheme") return "catppuccin-mocha";
      return undefined;
    });

    activate(mockContext);

    const mockEvent: vscode.ConfigurationChangeEvent = {
      affectsConfiguration: jest.fn((section: string) => section === "workbench.colorTheme"),
    };
    themeChangeListener(mockEvent);

    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should not update (not a Calmppuccin theme)
    expect(mockWorkbenchConfig.update).not.toHaveBeenCalled();
  });

  /**
   * @description Tests that sync correctly handles all standard flavors.
   * @precondition Each standard flavor is tested
   * @assertion Each flavor should map to correct icon theme
   */
  it("should correctly sync all standard Calmppuccin flavors", async () => {
    const flavorsMap: Record<string, {theme: string, wrongIcon: string, rightIcon: string}> = {
      "latte": { theme: "Calmppuccin Latte", wrongIcon: "catppuccin-mocha", rightIcon: "catppuccin-latte" },
      "frappe": { theme: "Calmppuccin Frappe", wrongIcon: "catppuccin-latte", rightIcon: "catppuccin-frappe" },
      "macchiato": { theme: "Calmppuccin Macchiato", wrongIcon: "catppuccin-latte", rightIcon: "catppuccin-macchiato" },
      "mocha": { theme: "Calmppuccin Mocha", wrongIcon: "catppuccin-latte", rightIcon: "catppuccin-mocha" },
    };

    for (const [, config] of Object.entries(flavorsMap)) {
      jest.clearAllMocks();

      // Reset modules for each iteration to get fresh module state
      jest.resetModules();
      jest.mock("vscode", () => mockedVscode, { virtual: true });
      const { activate: freshActivate } = await import("../../extension");

      mockWorkbenchConfig.get.mockImplementation((key: string) => {
        if (key === "colorTheme") return config.theme;
        if (key === "iconTheme") return config.wrongIcon; // Start with wrong flavor
        return undefined;
      });

      freshActivate(mockContext);

      // Wait for the initial icon sync
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
        "iconTheme",
        config.rightIcon,
        vscode.ConfigurationTarget.Global
      );
    }
  });
});
