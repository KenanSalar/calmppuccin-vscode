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
  let mockConfiguration: { get: jest.Mock };

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
    mockConfiguration.get.mockImplementation((_key, defaultValue) => defaultValue);

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
    const mockActiveFlavor = "mocha";

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

    // Use jest.spyOn to mock other methods *within* the ConfigurationService.
    // This isolates our test to only the logic inside getWebViewSettings itself.
    jest.spyOn(ConfigurationService, "getAccent").mockReturnValue(mockAccent);
    jest.spyOn(ConfigurationService, "getFontStyles").mockReturnValue(mockFontStyles);
    jest.spyOn(ConfigurationService, "getSyntaxOverrides").mockReturnValue(mockSyntaxOverrides);

    // We can't spy on getActiveFlavor because it's private, so we mock its dependency.
    (mockedVscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue("Calmppuccin Mocha"),
    });

    // 2. Act: Call the method we are testing.
    const settings = ConfigurationService.getWebViewSettings();

    // 3. Assert: Verify that the assembled object is correct.
    expect(settings.activeFlavor).toBe(mockActiveFlavor);
    expect(settings.currentAccent).toBe(mockAccent);
    expect(settings.accentOptions).toEqual(["rosewater", "flamingo", "lavender"]);

    // Check that syntaxSettings are correctly merged and calculated.
    // We'll check the 'comment' setting as an example.
    const commentSetting = settings.syntaxSettings.find((s) => s.key === "comment");
    expect(commentSetting).toBeDefined();
    expect(commentSetting?.fontStyle).toBe("italic"); // From mockFontStyles
    expect(commentSetting?.color).toBe("#ff0000"); // From mockSyntaxOverrides
    expect(commentSetting?.defaultColor).toBeDefined(); // Should be read from the palette
  });
});
