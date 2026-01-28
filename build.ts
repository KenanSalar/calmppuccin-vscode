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
  colors: Record<string, string>;
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
  await fs.emptyDir(THEME_DIR);
  await fs.ensureDir(THEME_DIR);
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  // Iterate over each flavor (latte, frappe, mocha, etc.) to generate a theme for it.
  for (const flavor of FLAVORS) {
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

    // Combine all colors, the resolved accent, and font styles into a single object for replacement.
    const replacements = { ...resolvedPalette, accent: accentColor, ...finalFontStyles };
    let themeContent = templateStr;

    // Replace all placeholders (e.g., "{{base}}", "{{mauve}}", "{{commentFontStyle}}") in the template.
    for (const [key, value] of Object.entries(replacements)) {
      // Handle the special case for font styles where "none" should be an empty string.
      const finalValue = value === "none" ? "" : value;
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      themeContent = themeContent.replace(placeholder, finalValue);
    }

    const themeJson: IThemeJson = JSON.parse(themeContent) as IThemeJson;
    const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
    themeJson.name = `Calmppuccin ${flavorDisplayName}`;
    themeJson.type = flavor === C.LIGHT_FLAVOR_NAME ? C.THEME_TYPE_LIGHT : C.THEME_TYPE_DARK;

    // Add Error Lens extension color customizations
    const errorLensColors = generateErrorLensColors(basePalette);
    themeJson.colors = { ...themeJson.colors, ...errorLensColors };

    // Add GitHub Pull Requests extension color customizations
    const githubPRColors = generateGitHubPullRequestColors(basePalette);
    themeJson.colors = { ...themeJson.colors, ...githubPRColors };

    // Add GitLens extension color customizations
    const gitLensColors = generateGitLensColors(basePalette);
    themeJson.colors = { ...themeJson.colors, ...gitLensColors };

    // Write the generated theme object to a JSON file in the /themes directory.
    const themeFileName = `${C.THEME_FILE_PREFIX}-${flavor}-${C.THEME_FILE_SUFFIX}`;
    const themePath = path.join(THEME_DIR, themeFileName);
    await fs.writeJson(themePath, themeJson, { spaces: 2 });
  }

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
