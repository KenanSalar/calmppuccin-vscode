/**
 * @file This file contains the unit tests for the theme build script.
 * It verifies that the buildAllFlavors function correctly processes templates
 * and palettes to generate valid theme JSON objects.
 */

import { buildAllFlavors } from "../../build";
import * as fs from "fs-extra";

// Mock the entire fs-extra module to isolate the test from the file system.
jest.mock("fs-extra");

/**
 * Test suite for the build script.
 */
describe("Build Script Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * @description Tests that buildAllFlavors correctly replaces all placeholders in a template string.
   * @precondition The fs-extra module is mocked. `readFile` returns a mock template.
   * @assertion The JSON object passed to `writeJson` should have its placeholder
   * values replaced with the correct data from the real palettes and settings.
   */
  it("should correctly replace placeholders in the template", async () => {
    // 1. Arrange
    const mockTemplate = JSON.stringify({
      name: "Calmppuccin {{themeName}}",
      colors: {
        "activityBar.background": "{{base}}",
        "activityBar.foreground": "{{accent}}",
      },
      tokenColors: [{ name: "comment", settings: { fontStyle: "{{commentFontStyle}}" } }],
    });

    const mockFontStyles = { commentFontStyle: "italic" };

    // Configure mocks for fs-extra, casting to 'unknown' first for overloaded functions.
    (fs.readFile as unknown as jest.Mock).mockResolvedValue(mockTemplate);
    (fs.emptyDir as unknown as jest.Mock).mockResolvedValue(undefined);
    (fs.ensureDir as unknown as jest.Mock).mockResolvedValue(undefined);
    (fs.writeJson as unknown as jest.Mock).mockResolvedValue(undefined);

    // 2. Act
    await buildAllFlavors("sapphire", mockFontStyles, {}, {});

    // 3. Assert
    expect(fs.writeJson).toHaveBeenCalled();

    // Find the call that generated the Latte theme file.
    const latteCall = (fs.writeJson as jest.Mock).mock.calls.find((call) => call[0].includes("latte"));
    expect(latteCall).toBeDefined();

    const writtenJson = latteCall[1];

    // Verify that the placeholders match the actual correct values from the palette.
    expect(writtenJson.colors["activityBar.background"]).toBe("#cfd1d4");
    expect(writtenJson.colors["activityBar.foreground"]).toBe("#1c8da1");
    expect(writtenJson.tokenColors[0].settings.fontStyle).toBe("italic");
  });

  /**
   * @description Tests that buildAllFlavors correctly handles and resolves
   * dynamic accent color recipes (e.g., "{{accent}}2f").
   * @precondition The fs-extra module is mocked. `readFile` returns a template
   * containing a color recipe.
   * @assertion The JSON object passed to `writeJson` should have the recipe
   * placeholder replaced with a correctly concatenated hex color string.
   */
  it("should handle dynamic accent color recipes", async () => {
    // 1. Arrange: Set up a template with a recipe.
    const mockTemplate = JSON.stringify({
      colors: {
        "statusBar.background": "{{accent}}", // A solid accent color
        "statusBar.dropBorder": "{{accent}}2f", // A transparent accent color
      },
    });

    // Mock the file system reads to return our test template.
    (fs.readFile as unknown as jest.Mock).mockResolvedValue(mockTemplate);
    (fs.emptyDir as unknown as jest.Mock).mockResolvedValue(undefined);
    (fs.ensureDir as unknown as jest.Mock).mockResolvedValue(undefined);
    (fs.writeJson as unknown as jest.Mock).mockResolvedValue(undefined);

    // 2. Act: Run the build process with a known accent color.
    // We'll use the 'mocha' flavor and the 'mauve' accent for this test.
    await buildAllFlavors("mauve", {}, {}, {});

    // 3. Assert: Verify the output for the Mocha theme.

    // Find the specific call to writeJson for the 'mocha' theme file.
    const mochaCall = (fs.writeJson as jest.Mock).mock.calls.find((call) => call[0].includes("mocha"));

    expect(mochaCall).toBeDefined();

    // Capture the generated JSON data.
    const writtenJson = mochaCall[1];

    // The 'mauve' accent in the Mocha palette is '#ba9ae2'.
    const mauveHex = "#ba9ae2";

    // Verify the solid accent color was replaced correctly.
    expect(writtenJson.colors["statusBar.background"]).toBe(mauveHex);

    // Verify the recipe was correctly resolved by concatenating the hex value
    // (without the '#') and the transparency value.
    expect(writtenJson.colors["statusBar.dropBorder"]).toBe(`${mauveHex}2f`);
  });
});
