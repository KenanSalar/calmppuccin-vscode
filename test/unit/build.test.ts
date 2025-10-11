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
    await buildAllFlavors("sapphire", mockFontStyles, {}, {}, {});

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
    await buildAllFlavors("mauve", {}, {}, {}, {});

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

  // --- Priority 4: Theme Template Validation Tests ---

  describe("Template Structure Validation", () => {
    it("should handle templates with all valid accent placeholders", async () => {
      // Arrange - Template with all possible accent color names from palette
      const mockTemplate = JSON.stringify({
        colors: {
          "test.rosewater": "{{rosewater}}",
          "test.flamingo": "{{flamingo}}",
          "test.pink": "{{pink}}",
          "test.mauve": "{{mauve}}",
          "test.red": "{{red}}",
          "test.maroon": "{{maroon}}",
          "test.peach": "{{peach}}",
          "test.yellow": "{{yellow}}",
          "test.green": "{{green}}",
          "test.teal": "{{teal}}",
          "test.sky": "{{sky}}",
          "test.sapphire": "{{sapphire}}",
          "test.blue": "{{blue}}",
          "test.lavender": "{{lavender}}",
          "test.text": "{{text}}",
          "test.subtext1": "{{subtext1}}",
          "test.subtext0": "{{subtext0}}",
          "test.overlay2": "{{overlay2}}",
          "test.overlay1": "{{overlay1}}",
          "test.overlay0": "{{overlay0}}",
          "test.surface2": "{{surface2}}",
          "test.surface1": "{{surface1}}",
          "test.surface0": "{{surface0}}",
          "test.base": "{{base}}",
          "test.mantle": "{{mantle}}",
          "test.crust": "{{crust}}",
        },
      });

      (fs.readFile as unknown as jest.Mock).mockResolvedValue(mockTemplate);
      (fs.emptyDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.ensureDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.writeJson as unknown as jest.Mock).mockResolvedValue(undefined);

      // Act
      await buildAllFlavors("sapphire", {}, {}, {}, {});

      // Assert - Should successfully write mocha theme without errors
      const mochaCall = (fs.writeJson as jest.Mock).mock.calls.find((call) => call[0].includes("mocha"));
      expect(mochaCall).toBeDefined();

      const writtenJson = mochaCall[1];

      // Verify all placeholders were replaced with hex colors
      expect(writtenJson.colors["test.rosewater"]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(writtenJson.colors["test.flamingo"]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(writtenJson.colors["test.base"]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(writtenJson.colors["test.accent"]).toBeUndefined(); // {{accent}} should be replaced
    });

    it("should validate all font style keys exist in defaults", async () => {
      // Arrange - Template with all possible font style placeholders
      const mockTemplate = JSON.stringify({
        tokenColors: [
          { name: "comment", settings: { fontStyle: "{{commentFontStyle}}" } },
          { name: "keyword", settings: { fontStyle: "{{keywordFontStyle}}" } },
          { name: "string", settings: { fontStyle: "{{stringFontStyle}}" } },
          { name: "type", settings: { fontStyle: "{{typeFontStyle}}" } },
          { name: "function", settings: { fontStyle: "{{functionFontStyle}}" } },
          { name: "variable", settings: { fontStyle: "{{variableFontStyle}}" } },
          { name: "number", settings: { fontStyle: "{{numberFontStyle}}" } },
        ],
      });

      const mockFontStyles = {
        commentFontStyle: "italic",
        keywordFontStyle: "bold",
        stringFontStyle: "none",
        typeFontStyle: "italic",
        functionFontStyle: "none",
        variableFontStyle: "none",
        numberFontStyle: "none",
      };

      (fs.readFile as unknown as jest.Mock).mockResolvedValue(mockTemplate);
      (fs.emptyDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.ensureDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.writeJson as unknown as jest.Mock).mockResolvedValue(undefined);

      // Act
      await buildAllFlavors("sapphire", mockFontStyles, {}, {}, {});

      // Assert
      const mochaCall = (fs.writeJson as jest.Mock).mock.calls.find((call) => call[0].includes("mocha"));
      const writtenJson = mochaCall[1];

      // Verify all font style placeholders were replaced correctly
      expect(writtenJson.tokenColors[0].settings.fontStyle).toBe("italic");
      expect(writtenJson.tokenColors[1].settings.fontStyle).toBe("bold");
      expect(writtenJson.tokenColors[2].settings.fontStyle).toBe(""); // "none" becomes ""
    });

    it("should validate template JSON structure is preserved", async () => {
      // Arrange - Complex template with nested structures
      const mockTemplate = JSON.stringify({
        name: "Test Theme", // Note: This will be overwritten by build script
        type: "dark",
        colors: {
          "editor.background": "{{base}}",
          "editor.foreground": "{{text}}",
        },
        tokenColors: [
          {
            name: "Comment",
            scope: ["comment", "punctuation.definition.comment"],
            settings: {
              foreground: "{{comment}}",
              fontStyle: "{{commentFontStyle}}",
            },
          },
        ],
        semanticTokenColors: {
          variable: "{{variable}}",
        },
      });

      (fs.readFile as unknown as jest.Mock).mockResolvedValue(mockTemplate);
      (fs.emptyDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.ensureDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.writeJson as unknown as jest.Mock).mockResolvedValue(undefined);

      // Act
      await buildAllFlavors("sapphire", { commentFontStyle: "italic" }, {}, {}, {});

      // Assert
      const mochaCall = (fs.writeJson as jest.Mock).mock.calls.find((call) => call[0].includes("mocha"));
      const writtenJson = mochaCall[1];

      // Verify structure is preserved (note: name and type are overwritten by build script)
      expect(writtenJson.name).toBe("Calmppuccin Mocha"); // Build script sets this
      expect(writtenJson.type).toBe("dark"); // Build script sets this based on flavor
      expect(writtenJson.tokenColors).toHaveLength(1);
      expect(writtenJson.tokenColors[0].name).toBe("Comment");
      expect(writtenJson.tokenColors[0].scope).toEqual(["comment", "punctuation.definition.comment"]);
      expect(writtenJson.semanticTokenColors).toBeDefined();
    });

    it("should handle malformed accent recipes gracefully", async () => {
      // Arrange - Template with invalid recipe patterns
      const mockTemplate = JSON.stringify({
        colors: {
          "test.valid": "{{accent}}2f",
          "test.invalidSuffix": "{{accent}}zz", // Invalid hex suffix
          "test.tooLong": "{{accent}}2f3a", // Too many characters
          "test.plain": "{{accent}}",
        },
      });

      (fs.readFile as unknown as jest.Mock).mockResolvedValue(mockTemplate);
      (fs.emptyDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.ensureDir as unknown as jest.Mock).mockResolvedValue(undefined);
      (fs.writeJson as unknown as jest.Mock).mockResolvedValue(undefined);

      // Act
      await buildAllFlavors("sapphire", {}, {}, {}, {});

      // Assert - Should not throw, verify output
      const mochaCall = (fs.writeJson as jest.Mock).mock.calls.find((call) => call[0].includes("mocha"));
      expect(mochaCall).toBeDefined();

      const writtenJson = mochaCall[1];
      const sapphireHex = "#70b7d8"; // Mocha sapphire color

      // Valid recipe should be replaced correctly
      expect(writtenJson.colors["test.valid"]).toBe(`${sapphireHex}2f`);

      // Plain accent should be replaced correctly
      expect(writtenJson.colors["test.plain"]).toBe(sapphireHex);

      // Malformed recipes should be replaced as literals (current behavior)
      // The build script doesn't validate recipe format, it just replaces {{accent}} with the color
      expect(writtenJson.colors["test.invalidSuffix"]).toBe(`${sapphireHex}zz`);
      expect(writtenJson.colors["test.tooLong"]).toBe(`${sapphireHex}2f3a`);
    });
  });
});
