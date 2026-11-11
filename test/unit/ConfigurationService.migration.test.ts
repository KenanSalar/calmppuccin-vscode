/** @file `migrateGlobalSettingsToDefault`, against the `vscode` mock's configuration. */

import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

describe("ConfigurationService Migration Logic", () => {
  let mockConfiguration: { get: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration);

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

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {
          fontStyles: { commentFontStyle: "bold" }, // Only non-default
          accent: "mauve",
          syntaxOverrides: { mocha: { comment: "#ff0000" } },
        },
      },
      vscode.ConfigurationTarget.Global,
    );

    // The profiles, then the six legacy top-level keys.
    expect(mockConfiguration.update).toHaveBeenCalledTimes(7);
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_FONT_STYLES,
      undefined,
      vscode.ConfigurationTarget.Global,
    );
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_ACCENT,
      undefined,
      vscode.ConfigurationTarget.Global,
    );
  });

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

    // The global fontStyles moves in; the profile's own accent stays.
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      {
        Default: {
          accent: "mauve", // Existing
          fontStyles: { commentFontStyle: "bold" }, // Migrated
        },
      },
      vscode.ConfigurationTarget.Global,
    );
  });

  it("should handle clean install (no global settings)", async () => {
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) return { Default: {} };
      return undefined; // No global settings
    });

    await ConfigurationService.migrateGlobalSettingsToDefault();

    expect(mockConfiguration.update).not.toHaveBeenCalled();
  });

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
      vscode.ConfigurationTarget.Global,
    );
  });

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
      vscode.ConfigurationTarget.Global,
    );

    // The profiles, then the six legacy top-level keys.
    expect(mockConfiguration.update).toHaveBeenCalledTimes(7);
  });
});
