// build.js
const fs = require("fs-extra");
const path = require("path");
const palette = require("./src/palette");

const THEME_DIR = path.join(__dirname, "themes");
const TEMPLATE_PATH = path.join(__dirname, "src", "template.json");
const FLAVORS = Object.keys(palette);
const LIGHT_FLAVORS = ["latte"];

async function buildAllFlavors(accentName) {
  await fs.ensureDir(THEME_DIR);
  const templateStr = await fs.readFile(TEMPLATE_PATH, "utf-8");

  for (const flavor of FLAVORS) {
    const flavorPalette = palette[flavor];
    // Get the chosen accent's hex value, without the '#'
    const accentHexValue = (flavorPalette[accentName] || flavorPalette.mauve).substring(1);

    const resolvedPalette = {};
    for (const [key, value] of Object.entries(flavorPalette)) {
      if (typeof value === "string" && value.startsWith("{{accent}}")) {
        // If the value is a recipe like "{{accent}}2f", resolve it
        const transparency = value.substring(10); // Grabs the "2f" part
        resolvedPalette[key] = `#${accentHexValue}${transparency}`;
      } else {
        // Otherwise, use the value as is
        resolvedPalette[key] = value;
      }
    }

    // Use the fully resolved palette for replacements
    const colorsToReplace = { ...resolvedPalette, accent: `#${accentHexValue}` };

    let themeContent = templateStr;
    for (const [colorName, colorValue] of Object.entries(colorsToReplace)) {
      const placeholder = new RegExp(`\\{\\{${colorName}\\}\\}`, "g");
      themeContent = themeContent.replace(placeholder, colorValue);
    }

    const themeJson = JSON.parse(themeContent);
    const flavorDisplayName = flavor.charAt(0).toUpperCase() + flavor.slice(1);
    themeJson.name = `Calmppuccin ${flavorDisplayName}`;
    themeJson.type = LIGHT_FLAVORS.includes(flavor) ? "light" : "dark";

    const themePath = path.join(THEME_DIR, `calmppuccin-${flavor}-color-theme.json`);
    await fs.writeJson(themePath, themeJson, { spaces: 2 });
  }

  console.log(`All Calmppuccin themes built with the "${accentName}" accent.`);
}

if (require.main === module) {
  const defaultAccent = "sapphire";
  buildAllFlavors(defaultAccent);
}

module.exports = { buildAllFlavors };
