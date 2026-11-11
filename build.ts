/**
 * @file Fills `src/template.json`'s placeholders from each flavor's palette and the user's
 * settings, and writes the theme files.
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  IFontStyles,
  ISyntaxOverrides,
  IUiOverrides,
  IFontStyleOverrides,
} from "./src/ConfigurationService";
import * as C from "./src/constants";
import { generateErrorLensColors } from "./src/extensions/errorLens";
import { generateGitHubPullRequestColors } from "./src/extensions/githubPullRequest";
import { generateGitLensColors } from "./src/extensions/gitlens";
import palette, { IPalettes } from "./src/palettes";

/** The part of a theme file the build sets or reads. */
interface IThemeJson {
  name: string;
  type: string;
  colors?: Record<string, string>;
  tokenColors?: unknown[];
  semanticTokenColors?: Record<string, string>;
}

/** The part of `package.json` the build reads. */
interface IPackageJson {
  contributes?: {
    configuration?: {
      properties?: Record<string, { default?: IFontStyles }>;
    };
  };
}

/** The settings a build applies; packaging passes the defaults. */
export interface IBuildOptions {
  accentIdentifier: string;
  fontStyles: IFontStyles;
  syntaxOverrides: ISyntaxOverrides;
  uiOverrides: IUiOverrides;
  fontStyleOverrides: IFontStyleOverrides;
}

// Resolved from `dist/`, where both bundles that run the build live.
const THEME_DIR = path.resolve(__dirname, "..", C.THEMES_DIR);
const TEMPLATE_PATH = path.resolve(__dirname, "..", C.SRC_DIR, C.TEMPLATE_FILE);
const FLAVORS = Object.keys(palette) as Array<keyof IPalettes>;

/**
 * Builds one flavor's theme file.
 * @returns Whether the file changed.
 */
async function buildFlavor(
  flavor: keyof IPalettes,
  templateStr: string,
  options: IBuildOptions,
): Promise<boolean> {
  const { accentIdentifier, fontStyles, syntaxOverrides, uiOverrides, fontStyleOverrides } =
    options;
  const basePalette = palette[flavor];
  const flavorSyntaxOverrides = syntaxOverrides[flavor] ?? {};
  const flavorUiOverrides = uiOverrides[flavor] ?? {};
  const flavorFontStyleOverrides = fontStyleOverrides[flavor] ?? {};
  const finalPalette = { ...basePalette, ...flavorSyntaxOverrides, ...flavorUiOverrides };

  const accentColor = accentIdentifier.startsWith("#")
    ? accentIdentifier
    : (finalPalette[accentIdentifier] ?? finalPalette[C.FALLBACK_ACCENT]);
  const accentHexValue = accentColor.substring(1);

  // A recipe such as "{{accent}}2f" is the accent's hex with that alpha.
  const resolvedPalette: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(finalPalette)) {
    if (typeof value === "string" && value.startsWith(C.ACCENT_RECIPE_PREFIX)) {
      const transparency = value.substring(C.ACCENT_RECIPE_PREFIX.length);
      resolvedPalette[key] = `#${accentHexValue}${transparency}`;
    } else {
      resolvedPalette[key] = value;
    }
  }

  const finalFontStyles = { ...fontStyles, ...flavorFontStyleOverrides };

  const replacementMap = new Map<string, string>();
  for (const [key, value] of Object.entries(resolvedPalette)) {
    replacementMap.set(key, value);
  }
  replacementMap.set("accent", accentColor);
  for (const [key, value] of Object.entries(finalFontStyles)) {
    // The settings spell "no style" as "none", a theme as "".
    replacementMap.set(key, value === "none" ? "" : value);
  }

  // One pass over the template, rather than a rescan per key.
  const allKeysPattern = new RegExp(
    `\\{\\{(${[...replacementMap.keys()].map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\}\\}`,
    "g",
  );
  const themeContent = templateStr.replace(allKeysPattern, (_, key: string) => {
    const value = replacementMap.get(key);
    if (value === undefined) {
      console.warn(
        `[Calmppuccin] Placeholder key "{{${key}}}" not found in replacement map for flavor "${flavor}".`,
      );
    }
    // JSON-escaped, so a setting can't break out of its string.
    return JSON.stringify(value ?? "").slice(1, -1);
  });

  let themeJson: IThemeJson;
  try {
    themeJson = JSON.parse(themeContent) as IThemeJson;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse theme JSON for flavor "${flavor}": ${message}`, {
      cause: err,
    });
  }
  const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
  themeJson.name = `Calmppuccin ${flavorDisplayName}`;
  themeJson.type = flavor === C.LIGHT_FLAVOR_NAME ? C.THEME_TYPE_LIGHT : C.THEME_TYPE_DARK;

  // A test template may have no "colors".
  if (themeJson.colors) {
    const errorLensColors = generateErrorLensColors(basePalette);
    const githubPRColors = generateGitHubPullRequestColors(basePalette);
    const gitLensColors = generateGitLensColors(basePalette);
    Object.assign(themeJson.colors, errorLensColors, githubPRColors, gitLensColors);
  }

  const themeFileName = `${C.THEME_FILE_PREFIX}-${flavor}-${C.THEME_FILE_SUFFIX}`;
  const themePath = path.join(THEME_DIR, themeFileName);
  return writeIfChanged(themePath, JSON.stringify(themeJson, null, 2) + "\n");
}

/**
 * Builds every flavor's theme file.
 * @returns Whether any file changed, which is when a window needs a reload to show it.
 */
export async function buildAllFlavors(options: IBuildOptions): Promise<boolean> {
  await fs.mkdir(THEME_DIR, { recursive: true });
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  // Each flavor writes its own file, so they can build concurrently.
  const changed = await Promise.all(
    FLAVORS.map((flavor) => buildFlavor(flavor, templateStr, options)),
  );

  console.log(`All Calmppuccin themes built with the "${options.accentIdentifier}" accent.`);
  return changed.includes(true);
}

/**
 * Writes `content` to `filePath` unless the file already holds exactly that.
 *
 * Every open window rebuilds the same files after a settings change, and VS Code may load a theme
 * meanwhile, so the content lands through a rename: a reader sees the old file or the new one,
 * never a half-written one.
 * @returns Whether the file was written.
 */
async function writeIfChanged(filePath: string, content: string): Promise<boolean> {
  if ((await readIfExists(filePath)) === content) {
    return false;
  }
  // One temp file per extension host, since every window's host may be writing this file.
  const tempPath = `${filePath}.${String(process.pid)}.tmp`;
  await fs.writeFile(tempPath, content);
  await fs.rename(tempPath, filePath);
  return true;
}

async function readIfExists(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err: unknown) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw err;
  }
}

/** Reads the `calmppuccin.fontStyles` default from `package.json`. */
async function getDefaultFontStyles(): Promise<IFontStyles> {
  const packageJsonPath = path.resolve(__dirname, "..", "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as IPackageJson;
  return (
    packageJson.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.fontStyles`]
      ?.default ?? {}
  );
}

// `node dist/build.js`, as packaging runs it: the themes with default settings.
if (require.main === module) {
  void (async () => {
    const defaultFontStyles = await getDefaultFontStyles();
    await buildAllFlavors({
      accentIdentifier: C.DEFAULT_ACCENT,
      fontStyles: defaultFontStyles,
      syntaxOverrides: {},
      uiOverrides: {},
      fontStyleOverrides: {},
    });
  })();
}
