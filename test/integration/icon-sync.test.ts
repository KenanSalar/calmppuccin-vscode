/**
 * @file icon-sync.test.ts
 * @description Integration tests for the icon theme synchronization feature.
 * Verifies that icon themes are correctly synced with color theme flavors.
 */

import * as vscode from "vscode";
import { activate, deactivate } from "../../extension";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

// Activating under a Calmppuccin theme rebuilds the themes, which these tests leave out.
jest.mock("../../build");

/**
 * Test suite for icon theme synchronization logic.
 */
describe("Icon Theme Synchronization", () => {
  let mockContext: vscode.ExtensionContext;
  let mockWorkbenchConfig: { get: jest.Mock; update: jest.Mock };
  let themeChangeListener: (event: vscode.ConfigurationChangeEvent) => void = () => {};

  beforeEach(() => {
    jest.useFakeTimers();
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
      },
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

    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
      "iconTheme",
      "catppuccin-mocha",
      vscode.ConfigurationTarget.Global,
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

    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    expect(mockWorkbenchConfig.update).not.toHaveBeenCalled();
  });

  /**
   * @description Tests that custom flavors (Nitro Cold Brew, Oledppuccin) map to mocha icons.
   * @precondition Color theme is Calmppuccin Nitro Cold Brew
   * @assertion Icon theme should be updated to catppuccin-mocha
   */
  it("should map custom flavors (Nitro Cold Brew) to mocha icons", async () => {
    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return "Calmppuccin Nitro Cold Brew";
      if (key === "iconTheme") return "catppuccin-frappe"; // Different flavor
      return undefined;
    });

    activate(mockContext);

    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
      "iconTheme",
      "catppuccin-mocha", // Maps to mocha
      vscode.ConfigurationTarget.Global,
    );
  });

  /**
   * @description Tests that Oledppuccin flavor maps to mocha icons.
   * @precondition Color theme is Calmppuccin Oledppuccin
   * @assertion Icon theme should be updated to catppuccin-mocha
   */
  it("should map Oledppuccin flavor to mocha icons", async () => {
    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return "Calmppuccin Oledppuccin";
      if (key === "iconTheme") return "catppuccin-latte"; // Different flavor
      return undefined;
    });

    activate(mockContext);

    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
      "iconTheme",
      "catppuccin-mocha",
      vscode.ConfigurationTarget.Global,
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

    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    // Should not update (not a Calmppuccin theme)
    expect(mockWorkbenchConfig.update).not.toHaveBeenCalled();
  });

  it.each([
    { theme: "Calmppuccin Latte", wrongIcon: "catppuccin-mocha", rightIcon: "catppuccin-latte" },
    { theme: "Calmppuccin Frappe", wrongIcon: "catppuccin-latte", rightIcon: "catppuccin-frappe" },
    {
      theme: "Calmppuccin Macchiato",
      wrongIcon: "catppuccin-latte",
      rightIcon: "catppuccin-macchiato",
    },
    { theme: "Calmppuccin Mocha", wrongIcon: "catppuccin-latte", rightIcon: "catppuccin-mocha" },
  ])("should sync $theme to $rightIcon", async ({ theme, wrongIcon, rightIcon }) => {
    mockWorkbenchConfig.get.mockImplementation((key: string) => {
      if (key === "colorTheme") return theme;
      if (key === "iconTheme") return wrongIcon;
      return undefined;
    });

    activate(mockContext);
    await jest.advanceTimersByTimeAsync(C.ICON_SYNC_INITIAL_DELAY_MS);

    expect(mockWorkbenchConfig.update).toHaveBeenCalledWith(
      "iconTheme",
      rightIcon,
      vscode.ConfigurationTarget.Global,
    );
  });
});
