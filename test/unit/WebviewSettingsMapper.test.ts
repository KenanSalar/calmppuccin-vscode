/**
 * @file Contract test for getWebViewSettings (WebviewSettingsMapper).
 * Verifies that the assembled ISettingsPayload has the correct shape and values,
 * locking down the webview contract to catch regressions from the config split.
 */

import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";
import {
  CUSTOMIZABLE_SYNTAX_KEYS,
  CUSTOMIZABLE_BRACKET_KEYS,
  CUSTOMIZABLE_JSON_KEYS,
  CUSTOMIZABLE_UI_KEYS,
} from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

describe("WebviewSettingsMapper contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Sets up mocks for a full getWebViewSettings call with known profile data.
   */
  function setupMocks(overrides?: {
    profiles?: Record<string, Record<string, unknown>>;
    activeProfile?: string;
    themeName?: string;
    accent?: string;
    customAccent?: string;
  }) {
    const profiles = overrides?.profiles ?? { Default: {} };
    const activeProfile = overrides?.activeProfile ?? "Default";
    const themeName = overrides?.themeName ?? "Calmppuccin Mocha";
    const accent = overrides?.accent ?? C.DEFAULT_ACCENT;
    const customAccent = overrides?.customAccent ?? C.DEFAULT_CUSTOM_ACCENT;

    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: { commentFontStyle: "italic", keywordFontStyle: "none" },
              },
              "calmppuccin.accent": {
                enum: ["rosewater", "flamingo", "pink", "mauve", "red", "maroon",
                       "peach", "yellow", "green", "teal", "sky", "sapphire",
                       "blue", "lavender", "custom"],
              },
            },
          },
        },
      },
    });

    (mockedVscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      if (section === "workbench") {
        return {
          get: jest.fn().mockReturnValue(themeName),
          update: jest.fn(),
        };
      }
      if (section === C.EXTENSION_NAMESPACE) {
        return {
          get: jest.fn().mockImplementation((key: string, defaultValue?: unknown) => {
            if (key === C.CONFIG_KEY_PROFILES) return profiles;
            if (key === C.CONFIG_KEY_ACTIVE_PROFILE) return activeProfile;
            if (key === C.CONFIG_KEY_ACCENT) return accent;
            if (key === C.CONFIG_KEY_CUSTOM_ACCENT) return customAccent;
            return defaultValue;
          }),
          update: jest.fn(),
        };
      }
      return { get: jest.fn(), update: jest.fn() };
    });
  }

  it("should return activeFlavor matching the theme name", () => {
    setupMocks({ themeName: "Calmppuccin Mocha" });
    const result = ConfigurationService.getWebViewSettings();
    expect(result.activeFlavor).toBe("mocha");
  });

  it("should return correct activeFlavor for multi-word theme names", () => {
    setupMocks({ themeName: "Calmppuccin Nitro Cold Brew" });
    const result = ConfigurationService.getWebViewSettings();
    expect(result.activeFlavor).toBe("nitro-cold-brew");
  });

  it("should default to mocha for unknown theme names", () => {
    setupMocks({ themeName: "Some Other Theme" });
    const result = ConfigurationService.getWebViewSettings();
    expect(result.activeFlavor).toBe("mocha");
  });

  it("should have exactly CUSTOMIZABLE_SYNTAX_KEYS.length syntax settings", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    expect(result.syntaxSettings).toHaveLength(CUSTOMIZABLE_SYNTAX_KEYS.length);
  });

  it("should have exactly CUSTOMIZABLE_BRACKET_KEYS.length bracket settings", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    expect(result.bracketSettings).toHaveLength(CUSTOMIZABLE_BRACKET_KEYS.length);
  });

  it("should have exactly CUSTOMIZABLE_JSON_KEYS.length json settings", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    expect(result.jsonSettings).toHaveLength(CUSTOMIZABLE_JSON_KEYS.length);
  });

  it("should have exactly CUSTOMIZABLE_UI_KEYS.length ui settings", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    expect(result.uiSettings).toHaveLength(CUSTOMIZABLE_UI_KEYS.length);
  });

  it("each setting should have key and defaultColor properties", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    const allSettings = [
      ...result.syntaxSettings,
      ...result.bracketSettings,
      ...result.jsonSettings,
      ...result.uiSettings,
    ];

    for (const setting of allSettings) {
      expect(setting).toHaveProperty("key");
      expect(typeof setting.key).toBe("string");
      expect(setting).toHaveProperty("defaultColor");
      expect(typeof setting.defaultColor).toBe("string");
    }
  });

  it("syntax settings should include fontStyle property", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    for (const setting of result.syntaxSettings) {
      expect(setting).toHaveProperty("fontStyle");
      expect(typeof setting.fontStyle).toBe("string");
    }
  });

  it("profiles should contain Default key", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    expect(result.profiles).toHaveProperty("Default");
  });

  it("accentColorPalettes should map accent names to hex strings", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    expect(typeof result.accentColorPalettes).toBe("object");
    for (const [key, value] of Object.entries(result.accentColorPalettes)) {
      expect(typeof key).toBe("string");
      expect(typeof value).toBe("string");
      expect(value).toMatch(/^#[0-9a-fA-F]{6,8}$/);
    }
  });

  it("should reflect syntax overrides in the returned settings", () => {
    setupMocks({
      profiles: {
        Default: {
          syntaxOverrides: { mocha: { comment: "#ff0000" } },
        },
      },
    });
    const result = ConfigurationService.getWebViewSettings();
    const commentSetting = result.syntaxSettings.find(s => s.key === "comment");
    expect(commentSetting).toBeDefined();
    expect(commentSetting?.color).toBe("#ff0000");
  });

  it("should reflect UI overrides in the returned settings", () => {
    setupMocks({
      profiles: {
        Default: {
          uiOverrides: { mocha: { base: "#000000" } },
        },
      },
    });
    const result = ConfigurationService.getWebViewSettings();
    const baseSetting = result.uiSettings.find(s => s.key === "base");
    expect(baseSetting).toBeDefined();
    expect(baseSetting?.color).toBe("#000000");
  });

  it("should return complete ISettingsPayload shape", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();

    // All required fields of ISettingsPayload must be present
    expect(result).toHaveProperty("activeFlavor");
    expect(result).toHaveProperty("syntaxSettings");
    expect(result).toHaveProperty("bracketSettings");
    expect(result).toHaveProperty("jsonSettings");
    expect(result).toHaveProperty("uiSettings");
    expect(result).toHaveProperty("currentAccent");
    expect(result).toHaveProperty("accentOptions");
    expect(result).toHaveProperty("customAccentColor");
    expect(result).toHaveProperty("defaultFontStyles");
    expect(result).toHaveProperty("activeThemeBackgroundColor");
    expect(result).toHaveProperty("accentColorPalettes");
    expect(result).toHaveProperty("profiles");
    expect(result).toHaveProperty("activeProfile");
  });

  it("should return the active profile name", () => {
    setupMocks({ activeProfile: "MyCustomProfile", profiles: { Default: {}, MyCustomProfile: {} } });
    const result = ConfigurationService.getWebViewSettings();
    expect(result.activeProfile).toBe("MyCustomProfile");
  });

  it("should return accent options from extension manifest", () => {
    setupMocks();
    const result = ConfigurationService.getWebViewSettings();
    expect(result.accentOptions).toContain("sapphire");
    expect(result.accentOptions).toContain("custom");
    expect(result.accentOptions.length).toBe(15);
  });
});
