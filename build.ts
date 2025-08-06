/**
 * @file This script handles the dynamic generation of all Calmppuccin theme flavors.
 * It reads a single template file and combines it with various color palettes
 * to produce the final theme JSON files.
 */

import * as fs from "fs-extra";
import * as path from "path";
import palette from "./src/palette";
import * as C from "./src/constants";

// Defines a generic type for a palette object.
type Palette = { [key: string]: string };

// Define file system paths and theme constants.
const THEME_DIR = path.resolve(__dirname, "..", C.THEMES_DIR);
const TEMPLATE_PATH = path.resolve(__dirname, "..", C.SRC_DIR, C.TEMPLATE_FILE);
const FLAVORS = Object.keys(palette);

/**
 * Builds all theme flavors (Latte, Mocha, etc.) with a specified accent color.
 * It generates a complete theme file for each flavor and writes it to the /themes directory.
 * @param accentName The name of the accent color to use (e.g., "sapphire").
 */
export async function buildAllFlavors(accentName: string): Promise<void> {
  // Deleting old theme files
  await fs.emptyDir(THEME_DIR);
  // Ensure the output directory exists.
  await fs.ensureDir(THEME_DIR);
  // Read the master template file.
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  for (const flavor of FLAVORS) {
    const flavorPalette = (palette as { [key: string]: any })[flavor];
    // Get the accent color from the palette, or use the fallback if it's not defined.
    const accentColor = flavorPalette[accentName] || flavorPalette[C.FALLBACK_ACCENT];
    const accentHexValue = accentColor.substring(1);

    // Resolve color "recipes" (e.g., "{{accent}}33" becomes "#<hex>33").
    const resolvedPalette: Palette = {};
    for (const [key, value] of Object.entries(flavorPalette)) {
      if (typeof value === "string" && value.startsWith(C.ACCENT_RECIPE_PREFIX)) {
        const transparency = value.substring(C.ACCENT_RECIPE_PREFIX.length);
        resolvedPalette[key] = `#${accentHexValue}${transparency}`;
      } else {
        resolvedPalette[key] = value as string;
      }
    }

    // Prepare the final map of all colors to be replaced in the template.
    const colorsToReplace: Palette = {
      ...resolvedPalette,
      accent: accentColor,
    };

    // Replace all placeholders (e.g., "{{base}}") in the template string with actual color values.
    let themeContent = templateStr;
    for (const [colorName, colorValue] of Object.entries(colorsToReplace)) {
      const placeholder = new RegExp(`\\{\\{${colorName}\\}\\}`, "g");
      themeContent = themeContent.replace(placeholder, colorValue);
    }

    // Parse the resulting string as JSON and inject metadata.
    const themeJson = JSON.parse(themeContent);
    const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
    themeJson.name = `Calmppuccin ${flavorDisplayName}`;
    themeJson.type = flavor === C.LIGHT_FLAVOR_NAME ? C.THEME_TYPE_LIGHT : C.THEME_TYPE_DARK;

    // Construct the final file path and write the theme file.
    const themeFileName = `${C.THEME_FILE_PREFIX}-${flavor}-${C.THEME_FILE_SUFFIX}`;
    const themePath = path.join(THEME_DIR, themeFileName);
    await fs.writeJson(themePath, themeJson, { spaces: 2 });
  }

  console.log(`All Calmppuccin themes built with the "${accentName}" accent.`);
}

/**
 * This check allows the script to be executed directly from the command line
 * with `node ./dist/build.js`, which is useful for testing and development.
 */
if (require.main === module) {
  buildAllFlavors(C.DEFAULT_ACCENT);
}
