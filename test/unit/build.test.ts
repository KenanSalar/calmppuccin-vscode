/** @file `buildAllFlavors` over the real palettes, with `fs/promises` mocked. */

import * as fs from "fs/promises";
import { buildAllFlavors } from "../../build";

// Under Jest the themes directory resolves outside the repo.
jest.mock("fs/promises");

interface ITestThemeJson {
  name: string;
  type?: string;
  colors: Record<string, string>;
  tokenColors?: Array<{
    name: string;
    scope?: string[];
    settings: { foreground?: string; fontStyle?: string };
  }>;
  semanticTokenColors?: Record<string, string>;
}

/** A theme write as [filePath, themeJson], with the written JSON parsed back */
type ThemeWrite = [string, ITestThemeJson];

function findThemeCall(flavor: string): ThemeWrite | undefined {
  const calls = jest.mocked(fs.writeFile).mock.calls as unknown as Array<[string, string]>;
  const call = calls.find(([filePath]) => filePath.includes(flavor));
  return call && [call[0], JSON.parse(call[1]) as ITestThemeJson];
}

/** Serves `template` as the theme template, and an empty themes directory. */
function mockFileSystem(template: string): void {
  jest.mocked(fs.readFile).mockResolvedValue(template);
  jest.mocked(fs.readdir).mockResolvedValue([]);
}

describe("Build Script Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly replace placeholders in the template", async () => {
    const mockTemplate = JSON.stringify({
      name: "Calmppuccin {{themeName}}",
      colors: {
        "activityBar.background": "{{base}}",
        "activityBar.foreground": "{{accent}}",
      },
      tokenColors: [{ name: "comment", settings: { fontStyle: "{{commentFontStyle}}" } }],
    });

    const mockFontStyles = { commentFontStyle: "italic" };

    mockFileSystem(mockTemplate);

    await buildAllFlavors({
      accentIdentifier: "sapphire",
      fontStyles: mockFontStyles,
      syntaxOverrides: {},
      uiOverrides: {},
      fontStyleOverrides: {},
    });

    expect(fs.writeFile).toHaveBeenCalled();

    const latteCall = findThemeCall("latte");
    expect(latteCall).toBeDefined();

    const writtenJson = latteCall?.[1];
    expect(writtenJson).toBeDefined();

    expect(writtenJson?.colors["activityBar.background"]).toBe("#cfd1d4");
    expect(writtenJson?.colors["activityBar.foreground"]).toBe("#1c8da1");
    expect(writtenJson?.tokenColors?.[0].settings.fontStyle).toBe("italic");
  });

  it("should handle dynamic accent color recipes", async () => {
    const mockTemplate = JSON.stringify({
      colors: {
        "statusBar.background": "{{accent}}", // A solid accent color
        "statusBar.dropBorder": "{{accent}}2f", // A transparent accent color
      },
    });

    mockFileSystem(mockTemplate);

    await buildAllFlavors({
      accentIdentifier: "mauve",
      fontStyles: {},
      syntaxOverrides: {},
      uiOverrides: {},
      fontStyleOverrides: {},
    });

    const mochaCall = findThemeCall("mocha");

    expect(mochaCall).toBeDefined();

    const writtenJson = mochaCall?.[1];
    expect(writtenJson).toBeDefined();

    // The 'mauve' accent in the Mocha palette is '#ba9ae2'.
    const mauveHex = "#ba9ae2";

    expect(writtenJson?.colors["statusBar.background"]).toBe(mauveHex);

    expect(writtenJson?.colors["statusBar.dropBorder"]).toBe(`${mauveHex}2f`);
  });

  describe("Template Structure Validation", () => {
    it("should handle templates with all valid accent placeholders", async () => {
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

      mockFileSystem(mockTemplate);

      await buildAllFlavors({
        accentIdentifier: "sapphire",
        fontStyles: {},
        syntaxOverrides: {},
        uiOverrides: {},
        fontStyleOverrides: {},
      });

      const mochaCall = findThemeCall("mocha");
      expect(mochaCall).toBeDefined();

      const writtenJson = mochaCall?.[1];
      expect(writtenJson).toBeDefined();

      expect(writtenJson?.colors["test.rosewater"]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(writtenJson?.colors["test.flamingo"]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(writtenJson?.colors["test.base"]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(writtenJson?.colors["test.accent"]).toBeUndefined(); // {{accent}} should be replaced
    });

    it("should validate all font style keys exist in defaults", async () => {
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

      mockFileSystem(mockTemplate);

      await buildAllFlavors({
        accentIdentifier: "sapphire",
        fontStyles: mockFontStyles,
        syntaxOverrides: {},
        uiOverrides: {},
        fontStyleOverrides: {},
      });

      const mochaCall = findThemeCall("mocha");
      const writtenJson = mochaCall?.[1];
      expect(writtenJson).toBeDefined();

      expect(writtenJson?.tokenColors?.[0].settings.fontStyle).toBe("italic");
      expect(writtenJson?.tokenColors?.[1].settings.fontStyle).toBe("bold");
      expect(writtenJson?.tokenColors?.[2].settings.fontStyle).toBe(""); // "none" becomes ""
    });

    it("should validate template JSON structure is preserved", async () => {
      const mockTemplate = JSON.stringify({
        name: "Test Theme", // The build overwrites this.
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

      mockFileSystem(mockTemplate);

      await buildAllFlavors({
        accentIdentifier: "sapphire",
        fontStyles: { commentFontStyle: "italic" },
        syntaxOverrides: {},
        uiOverrides: {},
        fontStyleOverrides: {},
      });

      const mochaCall = findThemeCall("mocha");
      const writtenJson = mochaCall?.[1];
      expect(writtenJson).toBeDefined();

      expect(writtenJson?.name).toBe("Calmppuccin Mocha"); // Build script sets this
      expect(writtenJson?.type).toBe("dark"); // Build script sets this based on flavor
      expect(writtenJson?.tokenColors).toHaveLength(1);
      expect(writtenJson?.tokenColors?.[0].name).toBe("Comment");
      expect(writtenJson?.tokenColors?.[0].scope).toEqual([
        "comment",
        "punctuation.definition.comment",
      ]);
      expect(writtenJson?.semanticTokenColors).toBeDefined();
    });

    it("should handle malformed accent recipes gracefully", async () => {
      const mockTemplate = JSON.stringify({
        colors: {
          "test.valid": "{{accent}}2f",
          "test.invalidSuffix": "{{accent}}zz", // Invalid hex suffix
          "test.tooLong": "{{accent}}2f3a", // Too many characters
          "test.plain": "{{accent}}",
        },
      });

      mockFileSystem(mockTemplate);

      await buildAllFlavors({
        accentIdentifier: "sapphire",
        fontStyles: {},
        syntaxOverrides: {},
        uiOverrides: {},
        fontStyleOverrides: {},
      });

      const mochaCall = findThemeCall("mocha");
      expect(mochaCall).toBeDefined();

      const writtenJson = mochaCall?.[1];
      expect(writtenJson).toBeDefined();
      const sapphireHex = "#70b7d8"; // Mocha sapphire color

      expect(writtenJson?.colors["test.valid"]).toBe(`${sapphireHex}2f`);

      expect(writtenJson?.colors["test.plain"]).toBe(sapphireHex);

      // A recipe's suffix isn't validated: the accent replaces {{accent}} and the rest stays.
      expect(writtenJson?.colors["test.invalidSuffix"]).toBe(`${sapphireHex}zz`);
      expect(writtenJson?.colors["test.tooLong"]).toBe(`${sapphireHex}2f3a`);
    });
  });

  describe("Writing theme files", () => {
    const template = JSON.stringify({ colors: { "editor.background": "{{base}}" } });
    const options = {
      accentIdentifier: "sapphire",
      fontStyles: {},
      syntaxOverrides: {},
      uiOverrides: {},
      fontStyleOverrides: {},
    };

    /** Records each theme the first build writes, then serves those files back as they'd be. */
    async function buildTwiceUnchanged(): Promise<boolean> {
      mockFileSystem(template);
      await buildAllFlavors(options);
      const written = new Map(
        (jest.mocked(fs.writeFile).mock.calls as unknown as Array<[string, string]>).map(
          ([tempPath, content]) => [tempPath.replace(/\.\d+\.tmp$/, ""), content],
        ),
      );
      jest
        .mocked(fs.readFile)
        .mockImplementation((filePath) =>
          Promise.resolve((typeof filePath === "string" && written.get(filePath)) || template),
        );
      jest.mocked(fs.writeFile).mockClear();
      return buildAllFlavors(options);
    }

    it("should report a change when a theme file differs", async () => {
      mockFileSystem(template);

      await expect(buildAllFlavors(options)).resolves.toBe(true);
    });

    /** VS Code may load a theme while another window rebuilds it. */
    it("should replace a theme file by renaming a finished temporary file over it", async () => {
      mockFileSystem(template);

      await buildAllFlavors(options);

      const [tempPath] = findThemeCall("mocha") ?? [""];
      expect(tempPath).toMatch(/calmppuccin-mocha-color-theme\.json\.\d+\.tmp$/);
      expect(fs.rename).toHaveBeenCalledWith(tempPath, tempPath.replace(/\.\d+\.tmp$/, ""));
    });

    it("should write a theme file that doesn't exist yet", async () => {
      mockFileSystem(template);
      const missing = Object.assign(new Error("no such file"), { code: "ENOENT" });
      jest
        .mocked(fs.readFile)
        .mockImplementation((filePath) =>
          typeof filePath === "string" && filePath.endsWith("template.json")
            ? Promise.resolve(template)
            : Promise.reject(missing),
        );

      await expect(buildAllFlavors(options)).resolves.toBe(true);
      expect(findThemeCall("mocha")).toBeDefined();
    });

    it("should leave theme files alone and report no change when nothing differs", async () => {
      await expect(buildTwiceUnchanged()).resolves.toBe(false);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});
