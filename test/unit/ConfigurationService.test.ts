/**
 * @file This file contains the unit tests for the ConfigurationService.
 * It verifies that the service correctly interacts with the mocked VS Code
 * configuration API to retrieve settings under various conditions.
 */

import * as vscode from "vscode";
import { ConfigurationService } from "../../src/ConfigurationService";
import * as C from "../../src/constants";

// Cast the imported vscode object to its mocked type at the top level.
// This gives us type-safe access to Jest's mock functions like .mockReturnValue()
// and makes it available to all describe blocks in this file.
const mockedVscode = vscode as jest.Mocked<typeof vscode>;

/**
 * Test suite for the main ConfigurationService methods.
 */
describe("ConfigurationService", () => {
  // A variable to hold the mock configuration object for each test.
  let mockConfiguration: { get: jest.Mock; update: jest.Mock };

  /**
   * This function runs before each test in this suite.
   * Its purpose is to reset the state and ensure tests are isolated.
   */
  beforeEach(() => {
    // jest.clearAllMocks() resets the call history of all mocks.
    // This prevents a call in one test from affecting the assertions in another.
    jest.clearAllMocks();

    // Create a fresh, blank mock for the configuration object for each test.
    // The specific behavior (e.g., what .get() returns) will be defined in each test.
    mockConfiguration = {
      get: jest.fn(),
      update: jest.fn(),
    };

    // Configure the global vscode mock to return our test-specific mockConfiguration.
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfiguration);
  });

  /**
   * @description Tests that getAccent() returns the default accent color
   * if no user setting is found in the configuration.
   * @precondition The mocked `getConfiguration().get()` is set up to simulate
   * the real API's behavior by returning the default value passed to it.
   * @assertion It should return the `DEFAULT_ACCENT` constant ("sapphire").
   */
  it("getAccent() should return the default accent color when no user setting is present", () => {
    // Arrange: Configure the mock for this specific test case.
    // We simulate the behavior of the real get() method, which returns the
    // second argument if the first (the key) is not found.
    mockConfiguration.get.mockImplementation((_key: string, defaultValue: unknown) => defaultValue);

    // Act: Call the method we are testing.
    const accent = ConfigurationService.getAccent();

    // Assert: Verify the outcome.
    expect(accent).toBe(C.DEFAULT_ACCENT);

    // Also, verify that the underlying VS Code API was called with the correct parameters.
    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  });

  /**
   * @description Tests that getAccent() returns a user-defined accent color
   * when it is present in the configuration.
   * @precondition The mocked `getConfiguration().get()` is set up to return a
   * specific string ("mauve"), simulating a user's setting.
   * @assertion It should return the exact string that the mock was configured to return.
   */
  it("getAccent() should return the user-configured accent color when present", () => {
    // Arrange: Define a test value and configure the mock to return it.
    const userAccent = "mauve";
    mockConfiguration.get.mockReturnValue(userAccent);

    // Act: Call the method.
    const accent = ConfigurationService.getAccent();

    // Assert: Verify that the service returned the user's value.
    expect(accent).toBe(userAccent);

    // Verify that the get method was still called with the correct default value as a fallback.
    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
  });

  /**
   * @description Tests that getAccent() returns the custom hex color when the
   * accent setting is explicitly set to "custom".
   * @precondition The mocked `getConfiguration().get()` is configured to return
   * "custom" for the first call (the accent setting) and a specific hex code
   * for the second call (the custom accent color setting).
   * @assertion It should return the exact hex code, not the word "custom".
   */
  it('getAccent() should return the customAccentColor when accent is "custom"', () => {
    // Arrange: Define the custom hex color we expect.
    const customHexColor = "#abcdef";

    // Arrange: Configure the mock to handle two different calls to .get().
    // This simulates a more complex user configuration.
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_ACCENT) {
        // When asked for the main accent, return "custom".
        return "custom";
      }
      if (key === C.CONFIG_KEY_CUSTOM_ACCENT) {
        // When asked for the custom color, return our test hex code.
        return customHexColor;
      }
      return undefined; // Default return for any other key.
    });

    // Act: Call the method.
    const accent = ConfigurationService.getAccent();

    // Assert: Verify that the final result is the hex code.
    expect(accent).toBe(customHexColor);

    // Assert that the API was called twice with the correct keys.
    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_ACCENT, C.DEFAULT_ACCENT);
    expect(mockConfiguration.get).toHaveBeenCalledWith(C.CONFIG_KEY_CUSTOM_ACCENT, C.DEFAULT_CUSTOM_ACCENT);
  });

  /**
   * @description Tests that updateFontStyle only saves font styles that differ from defaults.
   * @precondition The mocked `getConfiguration().get()` is set up to return existing profiles,
   * and the extension mock returns default font styles.
   * @assertion The `update` method should be called with a profiles object that contains only
   * non-default font styles within the Default profile.
   */
  it("updateFontStyle() should only save non-default font styles to the configuration", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        fontStyles: { keywordFontStyle: "bold" }
      }
    };
    const newKey = "commentFontStyle";
    const newValue = "bold"; // This is different from the default "italic"

    // Mock the extension package.json to provide default font styles
    (mockedVscode.extensions.getExtension as jest.Mock).mockReturnValue({
      packageJSON: {
        contributes: {
          configuration: {
            properties: {
              "calmppuccin.fontStyles": {
                default: {
                  commentFontStyle: "italic", // Default for comment is italic
                  keywordFontStyle: "none",   // Default for keyword is none
                },
              },
            },
          },
        },
      },
    });

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // The expected result: profiles with updated fontStyles in Default profile
    const expectedUpdatedProfiles = {
      "Default": {
        fontStyles: {
          keywordFontStyle: "bold", // This differs from default "none", so keep it
          commentFontStyle: "bold", // This differs from default "italic", so save it
        }
      }
    };

    // 2. Act
    await ConfigurationService.updateFontStyle(newKey, newValue);

    // 3. Assert
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that updateFontStyle filters out existing default values.
   * @precondition Existing font styles include both custom and default values.
   * @assertion Only the truly custom values should remain after update.
   */
  it("updateFontStyle() should filter out existing default values from configuration", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        fontStyles: {
          keywordFontStyle: "bold",   // Custom (default is "none")
          commentFontStyle: "italic", // This is the default value
          typeFontStyle: "underline"  // Custom (default is "italic")
        }
      }
    };
    const newKey = "stringFontStyle";
    const newValue = "bold"; // Custom value

    // Mock the extension package.json
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

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // Expected: only non-default values should remain
    const expectedUpdatedProfiles = {
      "Default": {
        fontStyles: {
          keywordFontStyle: "bold",    // Custom
          typeFontStyle: "underline",  // Custom
          stringFontStyle: "bold"      // New custom value
          // commentFontStyle removed because it matches default "italic"
        }
      }
    };

    // 2. Act
    await ConfigurationService.updateFontStyle(newKey, newValue);

    // 3. Assert
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that updateFontStyle removes a setting when it matches the default.
   * @precondition A font style is set to a custom value, then updated to match the default.
   * @assertion The font style should be removed from the saved configuration.
   */
  it("updateFontStyle() should remove a setting when it matches the default value", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        fontStyles: {
          keywordFontStyle: "bold",
          commentFontStyle: "bold"
        }
      }
    };
    const keyToUpdate = "commentFontStyle";
    const newValue = "italic"; // This matches the default

    // Mock the extension package.json to provide default font styles
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

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // Expected: only the keyword style remains since comment matches default
    const expectedUpdatedProfiles = {
      "Default": {
        fontStyles: {
          keywordFontStyle: "bold",
        }
      }
    };

    // 2. Act
    await ConfigurationService.updateFontStyle(keyToUpdate, newValue);

    // 3. Assert
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that updateFontStyle removes the entire fontStyles setting when all styles match defaults.
   * @precondition Only one custom font style exists, and it's updated to match the default.
   * @assertion The fontStyles setting should be removed from the profile.
   */
  it("updateFontStyle() should remove the entire setting when all styles match defaults", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        fontStyles: { commentFontStyle: "bold" }
      }
    };
    const keyToUpdate = "commentFontStyle";
    const newValue = "italic"; // This matches the default

    // Mock the extension package.json
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

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // Expected: Default profile with no fontStyles setting
    const expectedUpdatedProfiles = {
      "Default": {}
    };

    // 2. Act
    await ConfigurationService.updateFontStyle(keyToUpdate, newValue);

    // 3. Assert
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that resetFontStyle removes a specific key and filters out default values.
   * @precondition The mocked `getConfiguration().get()` returns profiles with multiple font styles.
   * @assertion The `update` method should be called with profiles that only contain
   * non-default values, excluding the reset key.
   */
  it("resetFontStyle() should remove a specific font style and filter out defaults", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        fontStyles: {
          keywordFontStyle: "bold",    // Custom (default is "none")
          commentFontStyle: "italic",  // This is the style we will reset
          typeFontStyle: "italic",     // This matches default, should be filtered out
        }
      }
    };
    const keyToReset = "commentFontStyle";

    // Mock the extension package.json to provide default font styles
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

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // Expected: only truly custom values should remain
    const expectedUpdatedProfiles = {
      "Default": {
        fontStyles: {
          keywordFontStyle: "bold", // Custom value, should remain
          // commentFontStyle removed (reset)
          // typeFontStyle removed (matches default)
        }
      }
    };

    // 2. Act
    await ConfigurationService.resetFontStyle(keyToReset);

    // 3. Assert
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests the edge case where resetting the last remaining custom font style
   * removes the entire 'fontStyles' setting from the profile.
   * @precondition The mocked `getConfiguration().get()` returns profiles with only custom styles.
   * @assertion The `update` method should be called with profiles that no longer contain
   * the fontStyles setting.
   */
  it("resetFontStyle() should remove the entire setting if no custom styles remain", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        fontStyles: {
          commentFontStyle: "bold", // This is the only custom style.
          typeFontStyle: "italic",  // This matches default, so it's not truly custom
        }
      }
    };
    const keyToReset = "commentFontStyle";

    // Mock the extension package.json
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

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // Expected: Default profile with no fontStyles setting
    const expectedUpdatedProfiles = {
      "Default": {}
    };

    // 2. Act
    await ConfigurationService.resetFontStyle(keyToReset);

    // 3. Assert
    // Verify that the update method was called with profiles that no longer contain fontStyles.
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that updateSyntaxColor correctly adds a new color override to a nested object.
   * @precondition The mocked `getConfiguration().get()` returns existing profiles with syntax overrides.
   * @assertion The `update` method should be called with profiles that include both
   * the original overrides and the newly added color override.
   */
  it("updateSyntaxColor() should add a new color override for a specific flavor", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        syntaxOverrides: {
          // Simulate that the user has already customized the 'latte' theme.
          latte: {
            keyword: "#ff0000",
          },
        }
      }
    };
    const flavorToUpdate = "mocha";
    const keyToUpdate = "comment";
    const newValue = "#00ff00";

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // This is the final, deeply merged object we expect to be written back.
    const expectedUpdatedProfiles = {
      "Default": {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000", // This should remain untouched.
          },
          mocha: {
            comment: "#00ff00", // This is the new override.
          },
        }
      }
    };

    // 2. Act
    // Call the method to add the new syntax color.
    await ConfigurationService.updateSyntaxColor(flavorToUpdate, keyToUpdate, newValue);

    // 3. Assert
    // Verify that the update method was called with the correctly merged nested object.
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests that resetAll() correctly clears all user-defined settings
   * by calling the update method with the appropriate values.
   * @precondition The `update` method on the mock configuration is spied on.
   * @assertion The `update` method should be called to clear profiles and reset accent.
   */
  it("resetAll() should call the update method with undefined for all settings", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        fontStyles: { keywordFontStyle: "bold" },
        syntaxOverrides: { mocha: { comment: "#ff0000" } }
      }
    };

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // 2. Act
    // Call the method that resets all configuration.
    await ConfigurationService.resetAll();

    // 3. Assert
    // Verify that the update method was called six times: once for profiles and five for legacy cleanup.
    expect(mockConfiguration.update).toHaveBeenCalledTimes(6);

    // Verify that the 'profiles' setting was updated to clear the Default profile.
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      { "Default": {} },
      vscode.ConfigurationTarget.Global
    );

    // Verify that legacy global settings were cleared
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_FONT_STYLES,
      undefined,
      vscode.ConfigurationTarget.Global
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_FONT_STYLE_OVERRIDES,
      undefined,
      vscode.ConfigurationTarget.Global
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_SYNTAX_OVERRIDES,
      undefined,
      vscode.ConfigurationTarget.Global
    );

    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_UI_OVERRIDES,
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
   * @description Tests that resetSyntaxColor correctly removes a single color override
   * while leaving other overrides for the same flavor and other flavors intact.
   * @precondition The mocked `getConfiguration().get()` returns profiles with
   * multiple existing syntax overrides.
   * @assertion The `update` method should be called with profiles that are missing
   * only the specified override.
   */
  it("resetSyntaxColor() should remove a specific color override from a flavor", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000",
          },
          mocha: {
            comment: "#00ff00", // This is the override we will reset.
            string: "#0000ff", // This override should remain.
          },
        }
      }
    };
    const flavorToReset = "mocha";
    const keyToReset = "comment";

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // This is the final state we expect to be written back to the settings.
    const expectedUpdatedProfiles = {
      "Default": {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000", // Should be untouched.
          },
          mocha: {
            string: "#0000ff", // Should remain.
          },
        }
      }
    };

    // 2. Act
    // Call the method to reset the specific syntax color.
    await ConfigurationService.resetSyntaxColor(flavorToReset, keyToReset);

    // 3. Assert
    // Verify that the update method was called with the correctly modified nested object.
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });

  /**
   * @description Tests the edge case where resetting the last remaining color override for a flavor
   * removes the entire flavor object from the configuration.
   * @precondition The mocked `getConfiguration().get()` returns profiles with one flavor
   * containing a single override, alongside another flavor with its own overrides.
   * @assertion The `update` method should be called with profiles that no longer
   * contain the key for the flavor whose last override was removed.
   */
  it("resetSyntaxColor() should remove the entire flavor object if the last override is reset", async () => {
    // 1. Arrange
    const existingProfiles = {
      "Default": {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000", // This flavor should remain untouched.
          },
          mocha: {
            comment: "#00ff00", // This is the single, last override for this flavor.
          },
        }
      }
    };
    const flavorToReset = "mocha";
    const keyToReset = "comment";

    // Mock the configuration to return profiles and activeProfile
    mockConfiguration.get.mockImplementation((key: string) => {
      if (key === C.CONFIG_KEY_PROFILES) {
        return existingProfiles;
      }
      if (key === C.CONFIG_KEY_ACTIVE_PROFILE) {
        return "Default";
      }
      return undefined;
    });

    // This is the final state we expect. The 'mocha' object should be gone entirely.
    const expectedUpdatedProfiles = {
      "Default": {
        syntaxOverrides: {
          latte: {
            keyword: "#ff0000",
          },
        }
      }
    };

    // 2. Act
    // Call the method to reset the last syntax color for the 'mocha' flavor.
    await ConfigurationService.resetSyntaxColor(flavorToReset, keyToReset);

    // 3. Assert
    // Verify that the update method was called with the correctly pruned object.
    expect(mockConfiguration.update).toHaveBeenCalledWith(
      C.CONFIG_KEY_PROFILES,
      expectedUpdatedProfiles,
      vscode.ConfigurationTarget.Global
    );
  });
});

/**
 * @description Test suite for the getWebViewSettings method.
 */
describe("ConfigurationService.getWebViewSettings", () => {
  // No need to redefine mockedVscode here, it's available from the top level.

  beforeEach(() => {
    // We still want to clear mocks between these tests too.
    jest.clearAllMocks();
  });

  /**
   * @description Tests that getWebViewSettings correctly orchestrates calls to other
   * methods and assembles the complete settings payload for the webview.
   * @precondition Mocks are set up for getAccent, getFontStyles, getSyntaxOverrides,
   * getActiveFlavor, and the vscode.extensions API.
   * @assertion The returned object should have the correct structure and contain
   * the exact data provided by the mocks.
   */
  it("should correctly assemble the settings payload", () => {
    // 1. Arrange: Set up all the mock data we'll need for the payload.
    const mockAccent = "lavender";
    const mockFontStyles = { commentFontStyle: "italic", keywordFontStyle: "bold" };
    const mockSyntaxOverrides = { mocha: { comment: "#ff0000" } };
    const mockUiOverrides = { mocha: { base: "#000000" } };
    const mockFontStyleOverrides = { mocha: { comment: "italic" } };
    const mockActiveFlavor = "mocha";
    const mockProfiles = {
      "Default": {
        fontStyles: mockFontStyles,
        syntaxOverrides: mockSyntaxOverrides,
        uiOverrides: mockUiOverrides,
        fontStyleOverrides: mockFontStyleOverrides
      }
    };

    // Mock the return value of the real package.json structure
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

    // Spy on other public methods of the ConfigurationService that getWebViewSettings
    // depends on. This provides controlled return values for these dependencies,
    // isolating the test to the logic within getWebViewSettings itself.
    jest.spyOn(ConfigurationService, "getFontStyles").mockReturnValue(mockFontStyles);
    jest.spyOn(ConfigurationService, "getSyntaxOverrides").mockReturnValue(mockSyntaxOverrides);
    jest.spyOn(ConfigurationService, "getUiOverrides").mockReturnValue(mockUiOverrides);
    jest.spyOn(ConfigurationService, "getFontStyleOverrides").mockReturnValue(mockFontStyleOverrides);
    jest.spyOn(ConfigurationService, "getProfiles").mockReturnValue(mockProfiles);

    // Since `getActiveFlavor` is a private method, it cannot be spied on directly.
    // Instead, its underlying dependency, the `vscode.workspace.getConfiguration` API, is mocked.
    // The mock is implemented as a function to dynamically return different configuration
    // objects based on the `section` argument.
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockImplementation((section: string) => {
      // Handle requests for the 'workbench' configuration, used for getting the active theme.
      if (section === "workbench") {
        return {
          // Return a mock object that provides a simulated theme name.
          get: jest.fn().mockReturnValue("Calmppuccin Mocha"),
          update: jest.fn(),
        };
      }
      // Handle requests for the extension's specific configuration.
      if (section === C.EXTENSION_NAMESPACE) {
        return {
          // Return a mock object that provides the test-specific data.
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
      // A generic empty mock is returned for any other unhandled configuration sections.
      return { get: jest.fn(), update: jest.fn() };
    });

    // 2. Act: Call the method we are testing.
    const settings = ConfigurationService.getWebViewSettings();

    // 3. Assert: Verify that the assembled object is correct.
    expect(settings.activeFlavor).toBe(mockActiveFlavor);
    expect(settings.currentAccent).toBe(mockAccent);
    expect(settings.accentOptions).toEqual(["rosewater", "flamingo", "lavender"]);
    expect(settings.profiles).toEqual(mockProfiles);
    expect(settings.activeProfile).toBe("Default");

    // Check that syntaxSettings are correctly merged and calculated.
    // We'll check the 'comment' setting as an example.
    const commentSetting = settings.syntaxSettings.find((s) => s.key === "comment");
    expect(commentSetting).toBeDefined();
    expect(commentSetting?.fontStyle).toBe("italic"); // From mockFontStyles
    expect(commentSetting?.color).toBe("#ff0000"); // From mockSyntaxOverrides
    expect(commentSetting?.defaultColor).toBeDefined(); // Should be read from the palette

    // Check that uiSettings are correctly merged and calculated
    const baseSetting = settings.uiSettings.find((s) => s.key === "base");
    expect(baseSetting).toBeDefined();
    expect(baseSetting?.color).toBe("#000000"); // From mockUiOverrides
    expect(baseSetting?.defaultColor).toBeDefined();
  });
});

