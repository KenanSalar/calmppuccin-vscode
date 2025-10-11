/**
 * @file ConfigurationService.migration.test.ts
 * @description Tests for the migration logic that converts pre-v1.8.0 global settings
 * to the new profile-based system. These tests verify data integrity during upgrades.
 */

import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

/**
 * Test suite for migration logic from global settings to profile-based system.
 */
describe("ConfigurationService Migration Logic", () => {
  let mockConfiguration: { get: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration);

    // Mock extension package.json with default values
    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: {
                  commentFontStyle: "italic",
                  keywordFontStyle: "none",
                  typeFontStyle: "italic",
                  stringFontStyle: "none",
                },
              },
              "calmppuccin.accent": {
                default: "sapphire",
              },
            },
          },
        },
      },
    });
  });

  /**
   * @description Tests that migrateGlobalSettingsToDefault migrates non-default global settings
   * to the Default profile while filtering out default values.
   * @precondition Global settings exist with mixed default and custom values
   * @assertion Only non-default values should be migrated to Default profile
   */
  it("should migrate non-default global settings to Default profile", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) return { Default: {} };
      if (key === C.CONFIG_KEY_FONT_STYLES) {
        return { commentFontStyle: "bold" }; // Different from default "italic"
      }
      if (key === C.CONFIG_KEY_ACCENT) return "mauve"; // Different from default "sapphire"
      if (key === C.CONFIG_KEY_SYNTAX_OVERRIDES) {
        return { mocha: { comment: "#ff0000" } };
      }
      return undefined;
    });

    await ConfigurationService.migrateGlobalSettingsToDefault();

    // Should save profiles with only non-default values
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {
          fontStyles: { commentFontStyle: "bold" }, // Only non-default
          accent: "mauve",
          syntaxOverrides: { mocha: { comment: "#ff0000" } },
        },
      },
      vscode.ConfigurationTarget.Global
    );

    // Should clean up global settings (7 calls total: 1 profiles + 6 cleanups)
    expect(mockConfiguration.update).toHaveBeenCalledTimes(7);
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_FONT_STYLES,
      undefined,
      vscode.ConfigurationTarget.Global
    );
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_ACCENT,
      undefined,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that migration does not overwrite existing Default profile settings.
   * @precondition Default profile already contains customizations + global settings exist
   * @assertion Migration should add global settings that don't exist in profile yet
   */
  it("should add new global settings but not overwrite existing Default profile settings", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return { Default: { accent: "mauve" } }; // Already has accent
      }
      if (key === C.CONFIG_KEY_FONT_STYLES) {
        return { commentFontStyle: "bold" }; // New global setting not in profile
      }
      return undefined;
    });

    await ConfigurationService.migrateGlobalSettingsToDefault();

    // Should migrate fontStyles (not in profile yet) but keep existing accent
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {
          accent: "mauve", // Existing
          fontStyles: { commentFontStyle: "bold" }, // Migrated
        },
      },
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that migration handles clean installations with no global settings.
   * @precondition No global settings exist, only empty Default profile
   * @assertion No updates should be made to configuration
   */
  it("should handle clean install (no global settings)", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) return { Default: {} };
      return undefined; // No global settings
    });

    await ConfigurationService.migrateGlobalSettingsToDefault();

    expect(mockConfiguration.update).not.toHaveBeenCalled();
  });

  /**
   * @description Tests that migration filters out default-valued font styles.
   * @precondition Font styles exist with both default and custom values
   * @assertion Only custom values should be migrated
   */
  it("should filter out default-valued font styles during migration", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) return { Default: {} };
      if (key === C.CONFIG_KEY_FONT_STYLES) {
        return {
          commentFontStyle: "italic", // Matches default
          keywordFontStyle: "bold", // Different from default "none"
        };
      }
      return undefined;
    });

    await ConfigurationService.migrateGlobalSettingsToDefault();

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {
          fontStyles: { keywordFontStyle: "bold" }, // Only non-default
        },
      },
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that migration skips if all global settings match defaults.
   * @precondition Global settings exist but all values are defaults
   * @assertion No updates should be made to configuration
   */
  it("should skip migration if global settings are all defaults", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) return { Default: {} };
      if (key === C.CONFIG_KEY_FONT_STYLES) {
        return { commentFontStyle: "italic" }; // Default value
      }
      if (key === C.CONFIG_KEY_ACCENT) return "sapphire"; // Default value
      return undefined;
    });

    await ConfigurationService.migrateGlobalSettingsToDefault();

    expect(mockConfiguration.update).not.toHaveBeenCalled();
  });

  /**
   * @description Tests that migration handles complex nested objects correctly.
   * @precondition Multiple types of settings exist with nested structures
   * @assertion All nested structures should be migrated correctly
   */
  it("should handle complex nested objects (syntax overrides, UI overrides)", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) return { Default: {} };
      if (key === C.CONFIG_KEY_SYNTAX_OVERRIDES) {
        return {
          mocha: { comment: "#ff0000", string: "#00ff00" },
          latte: { keyword: "#0000ff" },
        };
      }
      if (key === C.CONFIG_KEY_UI_OVERRIDES) {
        return {
          mocha: { base: "#000000", mantle: "#111111" },
        };
      }
      if (key === C.CONFIG_KEY_FONT_STYLE_OVERRIDES) {
        return {
          mocha: { comment: "bold" },
        };
      }
      return undefined;
    });

    await ConfigurationService.migrateGlobalSettingsToDefault();

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {
          syntaxOverrides: {
            mocha: { comment: "#ff0000", string: "#00ff00" },
            latte: { keyword: "#0000ff" },
          },
          uiOverrides: {
            mocha: { base: "#000000", mantle: "#111111" },
          },
          fontStyleOverrides: {
            mocha: { comment: "bold" },
          },
        },
      },
      vscode.ConfigurationTarget.Global
    );

    // Should clean up all 6 global settings
    expect(mockConfiguration.update).toHaveBeenCalledTimes(7);
  });
});
