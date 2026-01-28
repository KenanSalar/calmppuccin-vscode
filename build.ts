/**
 * @file This script handles the dynamic generation of all Calmppuccin theme flavors.
 * It reads a single template file and combines it with various color palettes
 * to produce the final theme JSON files.
 */

import * as fs from "fs-extra";
import * as path from "path";
import palette, { IPalettes } from "./src/palettes";
import * as C from "./src/constants";
import { IFontStyles, ISyntaxOverrides, IUiOverrides, IFontStyleOverrides } from "./src/ConfigurationService";
import { generateErrorLensColors } from "./src/extensions/errorLens";
import { generateGitHubPullRequestColors } from "./src/extensions/githubPullRequest";
import { generateGitLensColors } from "./src/extensions/gitlens";

/** Represents the structure of a VS Code theme JSON file. */
interface IThemeJson {
  name: string;
  type: string;
  colors?: Record<string, string>;
  tokenColors?: unknown[];
  semanticTokenColors?: Record<string, string>;
}

/** Represents the relevant structure of the extension's package.json. */
interface IPackageJson {
  contributes?: {
    configuration?: {
      properties?: Record<string, { default?: IFontStyles }>;
    };
  };
}

const THEME_DIR = path.resolve(__dirname, "..", C.THEMES_DIR);
const TEMPLATE_PATH = path.resolve(__dirname, "..", C.SRC_DIR, C.TEMPLATE_FILE);
const FLAVORS = Object.keys(palette) as Array<keyof IPalettes>;

/**
 * Generates a single theme file for a given flavor.
 * @param {keyof IPalettes} flavor The flavor to generate (e.g., "mocha").
 * @param {string} templateStr The raw template string.
 * @param {string} accentIdentifier The name of the accent color or a custom hex code.
 * @param {IFontStyles} editorSettings The user's configured font style settings.
 * @param {ISyntaxOverrides} syntaxOverrides The user's configured syntax color overrides.
 * @param {IUiOverrides} uiOverrides The user's configured UI color overrides.
 * @param {IFontStyleOverrides} fontStyleOverrides The user's configured theme-specific font style overrides.
 * @returns {Promise<void>} A promise that resolves when the theme file has been written.
 */
async function buildFlavor(
  flavor: keyof IPalettes,
  templateStr: string,
  accentIdentifier: string,
  editorSettings: IFontStyles,
  syntaxOverrides: ISyntaxOverrides,
  uiOverrides: IUiOverrides,
  fontStyleOverrides: IFontStyleOverrides
): Promise<void> {
  const basePalette = palette[flavor];
  const flavorSyntaxOverrides = syntaxOverrides[flavor] ?? {};
  const flavorUiOverrides = uiOverrides[flavor] ?? {};
  const flavorFontStyleOverrides = fontStyleOverrides[flavor] ?? {};
  // Merge the base flavor palette with any user-defined color overrides.
  const finalPalette = { ...basePalette, ...flavorSyntaxOverrides, ...flavorUiOverrides };

  // Resolve the accent color. If it's a hex code, use it directly. Otherwise, look it up in the palette.
  const accentColor = accentIdentifier.startsWith("#")
    ? accentIdentifier
    : finalPalette[accentIdentifier] ?? finalPalette[C.FALLBACK_ACCENT];
  const accentHexValue = accentColor.substring(1);

  // Create the final resolved palette by processing color recipes (e.g., "{{accent}}2f").
  const resolvedPalette: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(finalPalette)) {
    if (typeof value === "string" && value.startsWith(C.ACCENT_RECIPE_PREFIX)) {
      // This is a dynamic color. Construct it by combining the accent hex with a transparency value.
      const transparency = value.substring(C.ACCENT_RECIPE_PREFIX.length);
      resolvedPalette[key] = `#${accentHexValue}${transparency}`;
    } else {
      resolvedPalette[key] = value;
    }
  }

  // Merge global font styles with flavor-specific font style overrides, with overrides taking precedence.
  const finalFontStyles = { ...editorSettings, ...flavorFontStyleOverrides };

  // Combine all colors, the resolved accent, and font styles into a single replacement map.
  const replacementMap = new Map<string, string>();
  for (const [key, value] of Object.entries(resolvedPalette)) {
    replacementMap.set(key, value);
  }
  replacementMap.set("accent", accentColor);
  for (const [key, value] of Object.entries(finalFontStyles)) {
    // Handle the special case for font styles where "none" should be an empty string.
    replacementMap.set(key, value === "none" ? "" : value);
  }

  // Build a single regex pattern to match all placeholders and replace in one pass.
  const allKeysPattern = new RegExp(
    `\\{\\{(${[...replacementMap.keys()].map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\}\\}`,
    "g"
  );
  const themeContent = templateStr.replace(allKeysPattern, (_, key: string) => {
    const value = replacementMap.get(key) ?? "";
    // Escape special JSON characters to prevent injection from malformed settings.
    return JSON.stringify(value).slice(1, -1);
  });

  const themeJson: IThemeJson = JSON.parse(themeContent) as IThemeJson;
  const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
  themeJson.name = `Calmppuccin ${flavorDisplayName}`;
  themeJson.type = flavor === C.LIGHT_FLAVOR_NAME ? C.THEME_TYPE_LIGHT : C.THEME_TYPE_DARK;

  // Add all extension color customizations in a single assignment.
  // Ensure colors object exists for test templates that may omit it.
  if (themeJson.colors) {
    const errorLensColors = generateErrorLensColors(basePalette);
    const githubPRColors = generateGitHubPullRequestColors(basePalette);
    const gitLensColors = generateGitLensColors(basePalette);
    Object.assign(themeJson.colors, errorLensColors, githubPRColors, gitLensColors);
  }

  // Write the generated theme object to a JSON file in the /themes directory.
  const themeFileName = `${C.THEME_FILE_PREFIX}-${flavor}-${C.THEME_FILE_SUFFIX}`;
  const themePath = path.join(THEME_DIR, themeFileName);
  await fs.writeJson(themePath, themeJson, { spaces: 2 });
}

/**
 * Generates all Calmppuccin theme files based on the template, palettes, and user settings.
 * @param {string} accentIdentifier The name of the accent color (e.g., "sapphire") or a custom hex code.
 * @param {IFontStyles} editorSettings The user's configured font style settings.
 * @param {ISyntaxOverrides} syntaxOverrides The user's configured syntax color overrides.
 * @param {IUiOverrides} uiOverrides The user's configured UI color overrides.
 * @param {IFontStyleOverrides} fontStyleOverrides The user's configured theme-specific font style overrides.
 * @returns {Promise<void>} A promise that resolves when all theme files have been written to disk.
 */
export async function buildAllFlavors(
  accentIdentifier: string,
  editorSettings: IFontStyles,
  syntaxOverrides: ISyntaxOverrides,
  uiOverrides: IUiOverrides,
  fontStyleOverrides: IFontStyleOverrides
): Promise<void> {
  // Ensure the output directory is clean and ready.
  // Note: emptyDir() creates the directory if it doesn't exist.
  await fs.emptyDir(THEME_DIR);
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  // Generate all flavors in parallel for faster theme regeneration.
  await Promise.all(
    FLAVORS.map(flavor =>
      buildFlavor(flavor, templateStr, accentIdentifier, editorSettings, syntaxOverrides, uiOverrides, fontStyleOverrides)
    )
  );

  console.log(`All Calmppuccin themes built with the "${accentIdentifier}" accent.`);
}

/**
 * Reads the project's package.json to get the default font styles defined in the contribution points.
 * @returns {IFontStyles} The default font styles object.
 */
function getDefaultFontStyles(): IFontStyles {
  const packageJsonPath = path.resolve(__dirname, "..", "package.json");
  const packageJson = fs.readJsonSync(packageJsonPath) as IPackageJson;
  return packageJson.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.fontStyles`]?.default ?? {};
}

/**
 * This block allows the script to be executed directly from the command line (e.g., `node dist/build.js`),
 * which is useful for development and testing purposes. It generates the themes using default values.
 */
if (require.main === module) {
  const defaultFontStyles = getDefaultFontStyles();
  void buildAllFlavors(C.DEFAULT_ACCENT, defaultFontStyles, {}, {}, {});
}
