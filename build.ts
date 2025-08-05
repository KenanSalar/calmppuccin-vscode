import * as fs from "fs-extra";
import * as path from "path";
import palette from "./src/palette";

// Define a type for what a palette object looks like.
// It can have any string key with a string value.
type Palette = { [key: string]: string };

const THEME_DIR: string = path.resolve(__dirname, "..", "themes");
const TEMPLATE_PATH: string = path.resolve(__dirname, "..", "src", "template.json");
const FLAVORS: string[] = Object.keys(palette);
const LIGHT_FLAVORS: string[] = ["latte"];

export async function buildAllFlavors(accentName: string): Promise<void> {
  await fs.ensureDir(THEME_DIR);
  const templateStr: string = await fs.readFile(TEMPLATE_PATH, "utf-8");

  for (const flavor of FLAVORS) {
    const flavorPalette = (palette as { [key: string]: any })[flavor];
    const accentHexValue: string = (flavorPalette[accentName] || flavorPalette.mauve).substring(1);

    const resolvedPalette: Palette = {};
    for (const [key, value] of Object.entries(flavorPalette)) {
      if (typeof value === "string" && value.startsWith("{{accent}}")) {
        const transparency: string = value.substring(10);
        resolvedPalette[key] = `#${accentHexValue}${transparency}`;
      } else {
        resolvedPalette[key] = value as string;
      }
    }

    const colorsToReplace: Palette = {
      ...resolvedPalette,
      accent: `#${accentHexValue}`,
    };

    let themeContent: string = templateStr;
    for (const [colorName, colorValue] of Object.entries(colorsToReplace)) {
      const placeholder = new RegExp(`\\{\\{${colorName}\\}\\}`, "g");
      themeContent = themeContent.replace(placeholder, colorValue);
    }

    const themeJson = JSON.parse(themeContent);
    const flavorDisplayName: string = flavor.charAt(0).toUpperCase() + flavor.slice(1);
    themeJson.name = `Calmppuccin ${flavorDisplayName}`;
    themeJson.type = LIGHT_FLAVORS.includes(flavor) ? "light" : "dark";

    const themePath: string = path.join(THEME_DIR, `calmppuccin-${flavor}-color-theme.json`);
    await fs.writeJson(themePath, themeJson, { spaces: 2 });
  }

  console.log(`All Calmppuccin themes built with the "${accentName}" accent.`);
}

// This check is to allow running the script directly from the command line for testing.
if (require.main === module) {
  const defaultAccent = "sapphire";
  buildAllFlavors(defaultAccent);
}
