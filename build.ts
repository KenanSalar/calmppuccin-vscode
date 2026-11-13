/**
 * @file Fills the placeholders in `src/template/` from each flavor's palette and the user's
 * settings, and writes the theme files.
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  IExtensionPackageJson,
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

type TemplatePart = keyof typeof C.TEMPLATE_FILES;
type TemplateSources = Readonly<Record<TemplatePart, string>>;

interface IFilledTemplate {
  colors: Record<string, string>;
  tokenColors: unknown[];
  semanticTokenColors: Record<string, unknown>;
}

/** The settings a build applies; packaging passes the defaults. */
export interface IBuildOptions {
  accentIdentifier: string;
  fontStyles: IFontStyles;
  syntaxOverrides: ISyntaxOverrides;
  uiOverrides: IUiOverrides;
  fontStyleOverrides: IFontStyleOverrides;
}

/** A theme file as a build found it, `undefined` when there was none, and as it left it. */
export interface IThemeBuild {
  previous: string | undefined;
  generated: string;
}

export type ThemeBuilds = ReadonlyMap<keyof IPalettes, IThemeBuild>;

// Resolved from `dist/`, where both bundles that run the build live.
const THEME_DIR = path.resolve(__dirname, "..", C.THEMES_DIR);
const TEMPLATE_PATH = path.resolve(__dirname, "..", C.SRC_DIR, C.TEMPLATE_DIR);
const FLAVORS = Object.keys(palette) as Array<keyof IPalettes>;

/** Builds one flavor's theme file, writing it only when its content changes. */
async function buildFlavor(
  flavor: keyof IPalettes,
  template: TemplateSources,
  options: IBuildOptions,
): Promise<IThemeBuild> {
  const { colors, tokenColors, semanticTokenColors } = fillTemplate(
    template,
    getReplacements(flavor, options),
    flavor,
  );
  const basePalette = palette[flavor];
  const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
  const themeJson = {
    name: `Calmppuccin ${flavorDisplayName}`,
    type: flavor === C.LIGHT_FLAVOR_NAME ? C.THEME_TYPE_LIGHT : C.THEME_TYPE_DARK,
    colors: {
      ...colors,
      ...generateErrorLensColors(basePalette),
      ...generateGitHubPullRequestColors(basePalette),
      ...generateGitLensColors(basePalette),
    },
    tokenColors,
    semanticHighlighting: true,
    semanticTokenColors,
  };

  const themeFileName = `${C.THEME_FILE_PREFIX}-${flavor}-${C.THEME_FILE_SUFFIX}`;
  const themePath = path.join(THEME_DIR, themeFileName);
  const generated = JSON.stringify(themeJson, null, 2) + "\n";
  const previous = await readIfExists(themePath);
  if (generated !== previous) {
    await replaceFile(themePath, generated);
  }
  return { previous, generated };
}

/** The value each `{{key}}` takes in `flavor`'s theme: palette colors, the accent, font styles. */
function getReplacements(flavor: keyof IPalettes, options: IBuildOptions): Map<string, string> {
  const flavorPalette = {
    ...palette[flavor],
    ...options.syntaxOverrides[flavor],
    ...options.uiOverrides[flavor],
  };
  const { accentIdentifier } = options;
  const accentColor = accentIdentifier.startsWith("#")
    ? accentIdentifier
    : (flavorPalette[accentIdentifier] ?? flavorPalette[C.FALLBACK_ACCENT]);

  const replacements = new Map<string, string>();
  for (const [key, value] of Object.entries(flavorPalette)) {
    // A recipe such as "{{accent}}2f" is the accent's hex with that alpha.
    if (typeof value === "string" && value.startsWith(C.ACCENT_RECIPE_PREFIX)) {
      const alpha = value.substring(C.ACCENT_RECIPE_PREFIX.length);
      replacements.set(key, `#${accentColor.substring(1)}${alpha}`);
    } else {
      replacements.set(key, value);
    }
  }
  replacements.set("accent", accentColor);

  const fontStyles = { ...options.fontStyles, ...options.fontStyleOverrides[flavor] };
  for (const [key, value] of Object.entries(fontStyles)) {
    // The settings spell "no style" as "none", a theme as "".
    replacements.set(key, value === "none" ? "" : value);
  }
  return replacements;
}

/** Fills each `{{key}}` that has a replacement in one pass per file, not a rescan per key. */
function fillTemplate(
  template: TemplateSources,
  replacements: ReadonlyMap<string, string>,
  flavor: keyof IPalettes,
): IFilledTemplate {
  const keys = [...replacements.keys()].map((key) => RegExp.escape(key));
  // `replace` starts a global pattern from the beginning each call, so the files can share it.
  const placeholderPattern = new RegExp(`\\{\\{(${keys.join("|")})\\}\\}`, "g");

  const fill = (part: TemplatePart): unknown => {
    const filledJson = template[part].replace(placeholderPattern, (_, key: string) =>
      // JSON-escaped, so a setting can't break out of its string.
      JSON.stringify(replacements.get(key) ?? "").slice(1, -1),
    );
    try {
      return JSON.parse(filledJson);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const file = C.TEMPLATE_FILES[part];
      throw new Error(`Failed to parse ${file} for flavor "${flavor}": ${message}`, {
        cause: err,
      });
    }
  };

  return {
    colors: fill("colors"),
    tokenColors: fill("tokenColors"),
    semanticTokenColors: fill("semanticTokenColors"),
  } as IFilledTemplate;
}

export async function buildAllFlavors(options: IBuildOptions): Promise<ThemeBuilds> {
  await fs.mkdir(THEME_DIR, { recursive: true });
  const template = await readTemplate();

  // Each flavor writes its own file, so they can build concurrently.
  const builds = await Promise.all(
    FLAVORS.map(async (flavor) => [flavor, await buildFlavor(flavor, template, options)] as const),
  );

  console.log(`All Calmppuccin themes built with the "${options.accentIdentifier}" accent.`);
  return new Map(builds);
}

/**
 * Builds the themes packaging ships, every setting at its default. `npm run build-themes` calls it
 * because webpack makes a `require.main === module` guard true however `dist/build.js` is loaded.
 */
export async function buildDefaultThemes(): Promise<ThemeBuilds> {
  return buildAllFlavors({
    accentIdentifier: C.DEFAULT_ACCENT,
    fontStyles: await getDefaultFontStyles(),
    syntaxOverrides: {},
    uiOverrides: {},
    fontStyleOverrides: {},
  });
}

async function readTemplate(): Promise<TemplateSources> {
  const read = (part: TemplatePart) =>
    fs.readFile(path.join(TEMPLATE_PATH, C.TEMPLATE_FILES[part]), "utf-8");
  const [colors, tokenColors, semanticTokenColors] = await Promise.all([
    read("colors"),
    read("tokenColors"),
    read("semanticTokenColors"),
  ]);
  return { colors, tokenColors, semanticTokenColors };
}

/**
 * Replaces `filePath` with `content` through a rename.
 *
 * Every open window rebuilds the same files after a settings change, and VS Code may load a theme
 * meanwhile, so a reader sees the old file or the new one, never a half-written one.
 */
async function replaceFile(filePath: string, content: string): Promise<void> {
  // One temp file per extension host, since every window's host may be writing this file.
  const tempPath = `${filePath}.${String(process.pid)}.tmp`;
  try {
    await fs.writeFile(tempPath, content);
    await fs.rename(tempPath, filePath);
  } catch (err: unknown) {
    // The replace's failure is the one to report, not the cleanup's.
    await fs.rm(tempPath, { force: true }).catch((cleanupErr: unknown) => {
      console.error("Failed to remove a temporary theme file:", cleanupErr);
    });
    throw err;
  }
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
  const packageJson = JSON.parse(
    await fs.readFile(packageJsonPath, "utf8"),
  ) as IExtensionPackageJson;
  return (
    packageJson.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.fontStyles`]
      ?.default ?? {}
  );
}
