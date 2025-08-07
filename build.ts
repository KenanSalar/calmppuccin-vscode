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
// Defines a generic type for editor settings to handle any configuration.
type GenericSettings = { [key: string]: string | boolean };

// Define file system paths and theme constants.
const THEME_DIR = path.resolve(__dirname, "..", C.THEMES_DIR);
const TEMPLATE_PATH = path.resolve(__dirname, "..", C.SRC_DIR, C.TEMPLATE_FILE);
const FLAVORS = Object.keys(palette);

/**
 * Builds all theme flavors (Latte, Mocha, etc.) with a specified accent color and user settings.
 * It generates a complete theme file for each flavor and writes it to the /themes directory.
 * @param accentIdentifier The accent to use. Can be a named color (e.g., "sapphire") or a hex code.
 * @param editorSettings A generic object containing all user-configurable settings (e.g., italics).
 */
export async function buildAllFlavors(accentIdentifier: string, editorSettings: GenericSettings): Promise<void> {
  // Deleting old theme files to ensure a clean build
  await fs.emptyDir(THEME_DIR);
  // Ensure the output directory exists.
  await fs.ensureDir(THEME_DIR);
  // Read the master template file.
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  for (const flavor of FLAVORS) {
    const flavorPalette = (palette as { [key: string]: any })[flavor];

    // FIX: Check if the identifier is a hex code. If so, use it directly.
    // Otherwise, look it up in the palette.
    const accentColor = accentIdentifier.startsWith("#")
      ? accentIdentifier
      : flavorPalette[accentIdentifier] || flavorPalette[C.FALLBACK_ACCENT];

    const accentHexValue = accentColor.substring(1);

    const resolvedPalette: Palette = {};
    for (const [key, value] of Object.entries(flavorPalette)) {
      if (typeof value === "string" && value.startsWith(C.ACCENT_RECIPE_PREFIX)) {
        const transparency = value.substring(C.ACCENT_RECIPE_PREFIX.length);
        resolvedPalette[key] = `#${accentHexValue}${transparency}`;
      } else {
        resolvedPalette[key] = value as string;
      }
    }

    // Combine all placeholders (colors and settings) into one object for replacement.
    const replacements: GenericSettings = {
      ...resolvedPalette,
      accent: accentColor,
      ...editorSettings,
    };

    let themeContent = templateStr;

    // Dynamically replace all placeholders in the template.
    for (const [key, value] of Object.entries(replacements)) {
      // If a setting's value is "none", convert it to an empty string for VS Code.
      // Otherwise, use the value directly (e.g., "italic", "bold").
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
 * This check allows the script to be executed directly from the command line
 * with `node ./dist/build.js`, which is useful for testing and development.
 */
if (require.main === module) {
  buildAllFlavors(C.DEFAULT_ACCENT, {});
}
