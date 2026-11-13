/** @file `buildAllFlavors` over the real palettes, with `fs/promises` mocked. */

import * as fs from "fs/promises";
import * as path from "path";
import { buildAllFlavors, ThemeBuilds } from "../../build";
import * as C from "../../src/constants";

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
  const call = findWrite(flavor);
  return call && [call[0], JSON.parse(call[1]) as ITestThemeJson];
}

/** A theme write as [temporary path, content]. */
function findWrite(flavor: string): [string, string] | undefined {
  const calls = jest.mocked(fs.writeFile).mock.calls as unknown as Array<[string, string]>;
  return calls.find(([filePath]) => filePath.includes(flavor));
}

/** The template's files as values; a file left out is served empty. */
interface ITemplateFixture {
  colors?: Record<string, string>;
  tokenColors?: unknown[];
  semanticTokenColors?: Record<string, unknown>;
}

/**
 * Serves `template` as the template's files and `themes` as the theme files found, by file name.
 * Any other read fails as a missing file, and a temporary file can be removed.
 */
function mockFileSystem(
  template: ITemplateFixture,
  themes: ReadonlyMap<string, string> = new Map(),
): void {
  const files = new Map<string, string>([
    [C.TEMPLATE_FILES.colors, JSON.stringify(template.colors ?? {})],
    [C.TEMPLATE_FILES.tokenColors, JSON.stringify(template.tokenColors ?? [])],
    [C.TEMPLATE_FILES.semanticTokenColors, JSON.stringify(template.semanticTokenColors ?? {})],
    ...themes,
  ]);
  const missing = Object.assign(new Error("no such file"), { code: "ENOENT" });
  jest.mocked(fs.readFile).mockImplementation((filePath) => {
    const content = typeof filePath === "string" ? files.get(path.basename(filePath)) : undefined;
    return content === undefined ? Promise.reject(missing) : Promise.resolve(content);
  });
  jest.mocked(fs.rm).mockResolvedValue(undefined);
}

describe("Build Script Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly replace placeholders in the template", async () => {
    const mockTemplate = {
      colors: {
        "activityBar.background": "{{base}}",
        "activityBar.foreground": "{{accent}}",
      },
      tokenColors: [{ name: "comment", settings: { fontStyle: "{{commentFontStyle}}" } }],
    };

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
    const mockTemplate = {
      colors: {
        "statusBar.background": "{{accent}}", // A solid accent color
        "statusBar.dropBorder": "{{accent}}2f", // A transparent accent color
      },
    };

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
      const mockTemplate = {
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
      };

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
      const mockTemplate = {
        tokenColors: [
          { name: "comment", settings: { fontStyle: "{{commentFontStyle}}" } },
          { name: "keyword", settings: { fontStyle: "{{keywordFontStyle}}" } },
          { name: "string", settings: { fontStyle: "{{stringFontStyle}}" } },
          { name: "type", settings: { fontStyle: "{{typeFontStyle}}" } },
          { name: "function", settings: { fontStyle: "{{functionFontStyle}}" } },
          { name: "variable", settings: { fontStyle: "{{variableFontStyle}}" } },
          { name: "number", settings: { fontStyle: "{{numberFontStyle}}" } },
        ],
      };

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
      const mockTemplate = {
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
      };

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
      const mockTemplate = {
        colors: {
          "test.valid": "{{accent}}2f",
          "test.invalidSuffix": "{{accent}}zz", // Invalid hex suffix
          "test.tooLong": "{{accent}}2f3a", // Too many characters
          "test.plain": "{{accent}}",
        },
      };

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
    const template = { colors: { "editor.background": "{{base}}" } };
    const options = {
      accentIdentifier: "sapphire",
      fontStyles: {},
      syntaxOverrides: {},
      uiOverrides: {},
      fontStyleOverrides: {},
    };

    /** Records each theme the first build writes, then serves those files back as they'd be. */
    async function buildTwiceUnchanged(): Promise<ThemeBuilds> {
      mockFileSystem(template);
      await buildAllFlavors(options);
      const written = new Map(
        (jest.mocked(fs.writeFile).mock.calls as unknown as Array<[string, string]>).map(
          ([tempPath, content]) => [path.basename(tempPath.replace(/\.\d+\.tmp$/, "")), content],
        ),
      );
      mockFileSystem(template, written);
      jest.mocked(fs.writeFile).mockClear();
      return buildAllFlavors(options);
    }

    /** The host compares what a build generated with what its window loaded. */
    it("should report a theme file as it found it and as it wrote it", async () => {
      const found = '{ "name": "An earlier build" }\n';
      mockFileSystem(template, new Map([["calmppuccin-mocha-color-theme.json", found]]));

      const themes = await buildAllFlavors(options);

      const [, written] = findWrite("mocha") ?? [];
      expect(themes.get("mocha")).toStrictEqual({ previous: found, generated: written });
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

      const themes = await buildAllFlavors(options);

      expect(themes.get("mocha")?.previous).toBeUndefined();
      expect(findThemeCall("mocha")).toBeDefined();
    });

    it("should leave a theme file alone when it already holds what the build generates", async () => {
      const themes = await buildTwiceUnchanged();

      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(themes.get("mocha")?.previous).toBe(themes.get("mocha")?.generated);
    });

    /** On Windows a rename fails while another process holds the theme file open. */
    it("should remove the temporary file when replacing a theme file fails", async () => {
      mockFileSystem(template);
      const locked = Object.assign(new Error("operation not permitted"), { code: "EPERM" });
      jest.mocked(fs.rename).mockRejectedValueOnce(locked);

      await expect(buildAllFlavors(options)).rejects.toThrow("operation not permitted");

      const [failedTempPath] = jest.mocked(fs.rename).mock.calls[0];
      expect(jest.mocked(fs.rm).mock.calls).toStrictEqual([[failedTempPath, { force: true }]]);
    });

    /** A virus scanner can hold the new temporary file open too, so removing it fails. */
    it("should report the failed replace when removing the temporary file fails too", async () => {
      mockFileSystem(template);
      const locked = Object.assign(new Error("operation not permitted"), { code: "EPERM" });
      jest.mocked(fs.rename).mockRejectedValueOnce(locked);
      jest.mocked(fs.rm).mockRejectedValueOnce(new Error("resource busy or locked"));
      jest.spyOn(console, "error").mockImplementation(() => {});

      await expect(buildAllFlavors(options)).rejects.toBe(locked);
    });
  });
});
