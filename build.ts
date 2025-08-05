import * as fs from "fs-extra";
import * as path from "path";
import palette from "./src/palette";

// Defines a type for what a palette object looks like.
type Palette = { [key: string]: string };

// --- Constants ---
const THEME_DIR = path.resolve(__dirname, "..", "themes");
const TEMPLATE_PATH = path.resolve(__dirname, "..", "src", "template.json");
const FLAVORS = Object.keys(palette);
const LIGHT_FLAVORS = ["latte"];

/**
 * Resolves accent color recipes in the palette.
 * e.g., "{{accent}}2f" becomes "#<accentHexValue>2f"
 * @param flavorPalette The palette for a specific flavor (e.g., mocha).
 * @param accentHexValue The hex value of the chosen accent color (without '#').
 * @returns A new palette object with all accent recipes resolved to concrete hex values.
 */
function resolveAccentRecipes(flavorPalette: Palette, accentHexValue: string): Palette {
  const resolvedPalette: Palette = {};
  for (const [key, value] of Object.entries(flavorPalette)) {
    if (typeof value === "string" && value.startsWith("{{accent}}")) {
      const transparency = value.substring(10); // Extracts "2f" from "{{accent}}2f"
      resolvedPalette[key] = `#${accentHexValue}${transparency}`;
    } else {
      resolvedPalette[key] = value;
    }
  }
  return resolvedPalette;
}

/**
 * Replaces all placeholders in the theme template with their final color values.
 * @param templateContent The raw string content of `template.json`.
 * @param colorsToReplace The fully resolved palette of colors for a flavor.
 * @returns The final theme content as a string.
 */
function replaceAllPlaceholders(templateContent: string, colorsToReplace: Palette): string {
  let themeContent = templateContent;
  for (const [colorName, colorValue] of Object.entries(colorsToReplace)) {
    const placeholder = new RegExp(`\\{\\{${colorName}\\}\\}`, "g");
    themeContent = themeContent.replace(placeholder, colorValue);
  }
  return themeContent;
}

/**
 * Builds all theme flavors (Latte, Mocha, etc.) with a specified accent color.
 * @param accentName The name of the accent color to use (e.g., "sapphire").
 */
export async function buildAllFlavors(accentName: string): Promise<void> {
  await fs.ensureDir(THEME_DIR);
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  for (const flavor of FLAVORS) {
    const flavorPalette = (palette as { [key: string]: any })[flavor];
    const accentColor = flavorPalette[accentName] || flavorPalette.mauve; // Fallback to mauve
    const accentHexValue = accentColor.substring(1);

    const resolvedPalette = resolveAccentRecipes(flavorPalette, accentHexValue);

    const colorsToReplace: Palette = {
      ...resolvedPalette,
      accent: accentColor, // The chosen accent color itself
    };

    const themeContentStr = replaceAllPlaceholders(templateStr, colorsToReplace);

    const themeJson = JSON.parse(themeContentStr);
    const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
    themeJson.name = `Calmppuccin ${flavorDisplayName}`;
    themeJson.type = LIGHT_FLAVORS.includes(flavor) ? "light" : "dark";

    const themePath = path.join(THEME_DIR, `calmppuccin-${flavor}-color-theme.json`);
    await fs.writeJson(themePath, themeJson, { spaces: 2 });
  }

  console.log(`All Calmppuccin themes built with the "${accentName}" accent.`);
}

// This check allows running the script directly from the command line for testing.
if (require.main === module) {
  const defaultAccent = "sapphire";
  buildAllFlavors(defaultAccent);
}
