/**
 * @file This script handles the dynamic generation of all Calmppuccin theme flavors.
 * It reads a single template file and combines it with various color palettes
 * to produce the final theme JSON files.
 */

import * as fs from "fs-extra";
import * as path from "path";
import palette from "./src/palette";
import * as C from "./src/constants";

type Palette = { [key: string]: string };
type GenericSettings = { [key: string]: any };
type SyntaxOverrides = { [flavor: string]: Palette };

const THEME_DIR = path.resolve(__dirname, "..", C.THEMES_DIR);
const TEMPLATE_PATH = path.resolve(__dirname, "..", C.SRC_DIR, C.TEMPLATE_FILE);
const FLAVORS = Object.keys(palette);

export async function buildAllFlavors(
  accentIdentifier: string,
  editorSettings: GenericSettings,
  syntaxOverrides: SyntaxOverrides
): Promise<void> {
  await fs.emptyDir(THEME_DIR);
  await fs.ensureDir(THEME_DIR);
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  for (const flavor of FLAVORS) {
    const basePalette = (palette as { [key: string]: any })[flavor];
    const flavorOverrides = syntaxOverrides[flavor] || {};
    const finalPalette = { ...basePalette, ...flavorOverrides };
    const accentColor = accentIdentifier.startsWith("#")
      ? accentIdentifier
      : finalPalette[accentIdentifier] || finalPalette[C.FALLBACK_ACCENT];
    const accentHexValue = accentColor.substring(1);
    const resolvedPalette: Palette = {};

    for (const [key, value] of Object.entries(finalPalette)) {
      if (typeof value === "string" && value.startsWith(C.ACCENT_RECIPE_PREFIX)) {
        const transparency = value.substring(C.ACCENT_RECIPE_PREFIX.length);
        resolvedPalette[key] = `#${accentHexValue}${transparency}`;
      } else {
        resolvedPalette[key] = value as string;
      }
    }

    const replacements: GenericSettings = { ...resolvedPalette, accent: accentColor, ...editorSettings };
    let themeContent = templateStr;

    for (const [key, value] of Object.entries(replacements)) {
      const finalValue = value === "none" ? "" : value;
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      themeContent = themeContent.replace(placeholder, finalValue as string);
    }

    const themeJson = JSON.parse(themeContent);
    const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
    themeJson.name = `Calmppuccin ${flavorDisplayName}`;
    themeJson.type = flavor === C.LIGHT_FLAVOR_NAME ? C.THEME_TYPE_LIGHT : C.THEME_TYPE_DARK;

    const themeFileName = `${C.THEME_FILE_PREFIX}-${flavor}-${C.THEME_FILE_SUFFIX}`;
    const themePath = path.join(THEME_DIR, themeFileName);
    await fs.writeJson(themePath, themeJson, { spaces: 2 });
  }

  console.log(`All Calmppuccin themes built with the "${accentIdentifier}" accent.`);
}

/**
 * Reads the package.json to get the default font styles.
 */
function getDefaultFontStyles() {
  const packageJsonPath = path.resolve(__dirname, "..", "package.json");
  const packageJson = fs.readJsonSync(packageJsonPath);
  return packageJson?.contributes?.configuration?.properties?.[`${C.EXTENSION_NAMESPACE}.fontStyles`]?.default ?? {};
}

/**
 * This check allows the script to be executed directly from the command line.
 */
if (require.main === module) {
  const defaultFontStyles = getDefaultFontStyles();
  buildAllFlavors(C.DEFAULT_ACCENT, defaultFontStyles, {});
}
