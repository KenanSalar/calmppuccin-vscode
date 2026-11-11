/** @file `ConfigurationService`'s reads and writes, against the `vscode` mock's configuration. */

import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

const mockedVscode = vscode as jest.Mocked<typeof vscode>;

describe("ConfigurationService", () => {
  let mockConfiguration: { get: jest.Mock; update: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };

    (mockedVscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration);
  });

  it("getAccent() should return the default accent color when no user setting is present", () => {
    mockConfiguration.get.mockImplementation((_key: string, defaultValue: unknown) => defaultValue);

    const accent = ConfigurationService.getAccent();

    expect(accent).toBe(C.DEFAULT_ACCENT);

    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  });

  it("getAccent() should return the user-configured accent color when present", () => {
    const userAccent = "mauve";
    mockConfiguration.get.mockReturnValue(userAccent);

    const accent = ConfigurationService.getAccent();

    expect(accent).toBe(userAccent);

    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  });

  it('getAccent() should return the customAccentColor when accent is "custom"', () => {
    const customHexColor = "#abcdef";

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_ACCENT) {
        return "custom";
      }
      if (key === C.CONFIG_KEY_CUSTOM_ACCENT) {
        return customHexColor;
      }
      return undefined;
    });

    const accent = ConfigurationService.getAccent();

    expect(accent).toBe(customHexColor);

    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    expect(mockConfiguration.get).toHaveBeenCalledWith(
      C.CONFIG_KEY_CUSTOM_ACCENT,
      C.DEFAULT_CUSTOM_ACCENT,
    );
  });

  it("updateFontStyle() should only save non-default font styles to the configuration", async () => {
    const existingProfiles = {
      Default: {
        fontStyles: { keywordFontStyle: "bold" },
      },
    };
    const newKey = "commentFontStyle";
    const newValue = "bold"; // This is different from the default "italic"

    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: {
                  commentFontStyle: "italic",
                  keywordFontStyle: "none",
                },
              },
            },
          },
        },
      },
    });

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {
        fontStyles: {
          keywordFontStyle: "bold", // This differs from default "none", so keep it
          commentFontStyle: "bold", // This differs from default "italic", so save it
        },
      },
    };

    await ConfigurationService.updateFontStyle(newKey, newValue);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("updateFontStyle() should filter out existing default values from configuration", async () => {
    const existingProfiles = {
      Default: {
        fontStyles: {
          keywordFontStyle: "bold", // Custom (default is "none")
          commentFontStyle: "italic", // This is the default value
          typeFontStyle: "underline", // Custom (default is "italic")
        },
      },
    };
    const newKey = "stringFontStyle";
    const newValue = "bold";

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
            },
          },
        },
      },
    });

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {
        fontStyles: {
          keywordFontStyle: "bold",
          typeFontStyle: "underline",
          stringFontStyle: "bold",
          // commentFontStyle removed because it matches default "italic"
        },
      },
    };

    await ConfigurationService.updateFontStyle(newKey, newValue);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("updateFontStyle() should remove a setting when it matches the default value", async () => {
    const existingProfiles = {
      Default: {
        fontStyles: {
          keywordFontStyle: "bold",
          commentFontStyle: "bold",
        },
      },
    };
    const keyToUpdate = "commentFontStyle";
    const newValue = "italic"; // This matches the default

    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: {
                  commentFontStyle: "italic",
                  keywordFontStyle: "none",
                },
              },
            },
          },
        },
      },
    });

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {
        fontStyles: {
          keywordFontStyle: "bold",
        },
      },
    };

    await ConfigurationService.updateFontStyle(keyToUpdate, newValue);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("updateFontStyle() should remove the entire setting when all styles match defaults", async () => {
    const existingProfiles = {
      Default: {
        fontStyles: { commentFontStyle: "bold" },
      },
    };
    const keyToUpdate = "commentFontStyle";
    const newValue = "italic"; // This matches the default

    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: {
                  commentFontStyle: "italic",
                },
              },
            },
          },
        },
      },
    });

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {},
    };

    await ConfigurationService.updateFontStyle(keyToUpdate, newValue);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("resetFontStyle() should remove a specific font style and filter out defaults", async () => {
    const existingProfiles = {
      Default: {
        fontStyles: {
          keywordFontStyle: "bold", // Custom (default is "none")
          commentFontStyle: "italic", // This is the style we will reset
          typeFontStyle: "italic", // This matches default, should be filtered out
        },
      },
    };
    const keyToReset = "commentFontStyle";

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
                },
              },
            },
          },
        },
      },
    });

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {
        fontStyles: {
          keywordFontStyle: "bold", // Custom value, should remain
          // commentFontStyle removed (reset)
          // typeFontStyle removed (matches default)
        },
      },
    };

    await ConfigurationService.resetFontStyle(keyToReset);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("resetFontStyle() should remove the entire setting if no custom styles remain", async () => {
    const existingProfiles = {
      Default: {
        fontStyles: {
          commentFontStyle: "bold", // This is the only custom style.
          typeFontStyle: "italic", // This matches default, so it's not truly custom
        },
      },
    };
    const keyToReset = "commentFontStyle";

    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: {
                  commentFontStyle: "italic",
                  typeFontStyle: "italic",
                },
              },
            },
          },
        },
      },
    });

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {},
    };

    await ConfigurationService.resetFontStyle(keyToReset);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("updateSyntaxColor() should add a new color override for a specific flavor", async () => {
    const existingProfiles = {
      Default: {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000",
          },
        },
      },
    };
    const flavorToUpdate = "mocha";
    const keyToUpdate = "comment";
    const newValue = "#00ff00";

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000", // This should remain untouched.
          },
          mocha: {
            comment: "#00ff00", // This is the new override.
          },
        },
      },
    };

    await ConfigurationService.updateSyntaxColor(flavorToUpdate, keyToUpdate, newValue);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("resetAll() should call the update method with undefined for all settings", async () => {
    const existingProfiles = {
      Default: {
        fontStyles: { keywordFontStyle: "bold" },
        syntaxOverrides: { mocha: { comment: "#ff0000" } },
      },
    };

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    await ConfigurationService.resetAll();

    // The profiles, then the six legacy top-level keys.
    expect(mockConfiguration.update).toHaveBeenCalledTimes(7);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      { Default: {} },
      vscode.ConfigurationTarget.Global,
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_FONT_STYLES,
      undefined,
      vscode.ConfigurationTarget.Global,
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_FONT_STYLE_OVERRIDES,
      undefined,
      vscode.ConfigurationTarget.Global,
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_SYNTAX_OVERRIDES,
      undefined,
      vscode.ConfigurationTarget.Global,
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_UI_OVERRIDES,
      undefined,
      vscode.ConfigurationTarget.Global,
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_ACCENT,
      undefined,
      vscode.ConfigurationTarget.Global,
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_CUSTOM_ACCENT,
      undefined,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("resetSyntaxColor() should remove a specific color override from a flavor", async () => {
    const existingProfiles = {
      Default: {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000",
          },
          mocha: {
            comment: "#00ff00", // This is the override we will reset.
            string: "#0000ff", // This override should remain.
          },
        },
      },
    };
    const flavorToReset = "mocha";
    const keyToReset = "comment";

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const expectedUpdatedProfiles = {
      Default: {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000", // Should be untouched.
          },
          mocha: {
            string: "#0000ff", // Should remain.
          },
        },
      },
    };

    await ConfigurationService.resetSyntaxColor(flavorToReset, keyToReset);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  it("resetSyntaxColor() should remove the entire flavor object if the last override is reset", async () => {
    const existingProfiles = {
      Default: {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000", // This flavor should remain untouched.
          },
          mocha: {
            comment: "#00ff00", // This is the single, last override for this flavor.
          },
        },
      },
    };
    const flavorToReset = "mocha";
    const keyToReset = "comment";

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // No `mocha` key: its last override went.
    const expectedUpdatedProfiles = {
      Default: {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000",
          },
        },
      },
    };

    await ConfigurationService.resetSyntaxColor(flavorToReset, keyToReset);

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global,
    );
  });

  /**
   * Every control has a Reset button, and writing an unchanged profile would still leave an empty
   * override object behind and trigger a theme rebuild.
   */
  it.each([
    ["resetSyntaxColor", ConfigurationService.resetSyntaxColor, "comment"],
    ["resetUiColor", ConfigurationService.resetUiColor, "base"],
    ["resetFontStyleOverride", ConfigurationService.resetFontStyleOverride, "commentFontStyle"],
  ])("%s() should write nothing when the key isn't overridden", async (_name, reset, key) => {
    mockConfiguration.get.mockImplementation((configKey: string) => {
      if (configKey === C.CONFIG_KEY_PROFILES) {
        return { Default: {} };
      }
      if (configKey === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    await reset("mocha", key);

    expect(mockConfiguration.update).not.toHaveBeenCalled();
  });

  it("getFontStyles() should return default when profile contains null for the key", () => {
    const profilesWithNull = {
      Default: {
        fontStyles: null,
      },
    };

    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return profilesWithNull;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    const result = ConfigurationService.getFontStyles();

    expect(result).toEqual({});
  });
});

describe("ConfigurationService.getWebViewSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly assemble the settings payload", () => {
    const mockAccent = "lavender";
    const mockFontStyles = { commentFontStyle: "italic", keywordFontStyle: "bold" };
    const mockSyntaxOverrides = { mocha: { comment: "#ff0000" } };
    const mockUiOverrides = { mocha: { base: "#000000" } };
    const mockFontStyleOverrides = { mocha: { comment: "italic" } };
    const mockActiveFlavor = "mocha";
    const mockProfiles = {
      Default: {
        fontStyles: mockFontStyles,
        syntaxOverrides: mockSyntaxOverrides,
        uiOverrides: mockUiOverrides,
        fontStyleOverrides: mockFontStyleOverrides,
      },
    };

    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: { commentFontStyle: "italic", keywordFontStyle: "none" },
              },
              "calmppuccin.accent": {
                enum: ["rosewater", "flamingo", "lavender"],
              },
            },
          },
        },
      },
    });

    (mockedVscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      if (section === "workbench") {
        return {
          get: jest.fn().mockReturnValue("Calmppuccin Mocha"),
          update: jest.fn(),
        };
      }
      if (section === C.EXTENSION_NAMESPACE) {
        return {
          get: jest.fn().mockImplementation((key: string) => {
            if (key === C.CONFIG_KEY_ACCENT) {
              return mockAccent;
            }
            if (key === C.CONFIG_KEY_PROFILES) {
              return mockProfiles;
            }
            if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
              return "Default";
            }
            return undefined;
          }),
          update: jest.fn(),
        };
      }
      return { get: jest.fn(), update: jest.fn() };
    });

    const settings = ConfigurationService.getWebViewSettings();

    expect(settings.activeFlavor).toBe(mockActiveFlavor);
    expect(settings.currentAccent).toBe(mockAccent);
    expect(settings.accentOptions).toEqual(["rosewater", "flamingo", "lavender"]);
    expect(settings.profiles).toEqual(mockProfiles);
    expect(settings.activeProfile).toBe("Default");

    const commentSetting = settings.syntaxSettings.find((s) => s.key === "comment");
    expect(commentSetting).toBeDefined();
    expect(commentSetting?.fontStyle).toBe("italic"); // From mockFontStyles
    expect(commentSetting?.color).toBe("#ff0000"); // From mockSyntaxOverrides
    expect(commentSetting?.defaultColor).toBeDefined(); // Should be read from the palette

    const baseSetting = settings.uiSettings.find((s) => s.key === "base");
    expect(baseSetting).toBeDefined();
    expect(baseSetting?.color).toBe("#000000"); // From mockUiOverrides
    expect(baseSetting?.defaultColor).toBeDefined();
  });
});
