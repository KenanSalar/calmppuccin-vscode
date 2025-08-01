const fs = require("fs-extra");
const path = require("path");
const palette = require("./src/palette");

const THEME_DIR = path.join(__dirname, "themes");
const TEMPLATES_DIR = path.join(__dirname, "src", "templates");
const FLAVORS = Object.keys(palette);

/**
 * Generates all theme flavors based on a single accent color,
 * using a specific template for each flavor.
 * @param {string} accentName - The name of the accent color (e.g., 'sapphire').
 */
async function buildAllFlavors(accentName) {
  await fs.ensureDir(THEME_DIR);

  for (const flavor of FLAVORS) {
    // 1. Construct the path to the correct template for the current flavor.
    const templatePath = path.join(TEMPLATES_DIR, `${flavor}.json`);

    // 2. Check if the template exists before proceeding.
    if (!(await fs.pathExists(templatePath))) {
      console.warn(`Warning: Template for flavor "${flavor}" not found at ${templatePath}`);
      continue; // Skip this flavor if its template is missing
    }

    // 3. Read the flavor-specific template file.
    const templateStr = await fs.readFile(templatePath, "utf-8");
    const flavorPalette = palette[flavor];

    // 4. Get the accent color hex code from the palette.
    const accentHex = flavorPalette[accentName] || flavorPalette.mauve; // Fallback

    // 5. Replace UI placeholders. Note that syntax colors are NOT replaced.
    let themeContent = templateStr;
    const uiColors = {
      base: flavorPalette.base,
      mantle: flavorPalette.mantle,
      crust: flavorPalette.crust,
      uiText: flavorPalette.uiText,
      accent: accentHex,
    };

    for (const [colorName, colorValue] of Object.entries(uiColors)) {
      themeContent = themeContent.replace(new RegExp(`\\{\\{${colorName}\\}\\}`, "g"), colorValue);
    }

    // 6. Write the final generated theme file.
    const themePath = path.join(THEME_DIR, `calmppuccin-${flavor}-color-theme.json`);
    // Use writeJson to ensure it's formatted nicely.
    await fs.writeJson(themePath, JSON.parse(themeContent), { spaces: 2 });
  }

  console.log(`All Calmppuccin themes built with the "${accentName}" accent.`);
}

if (require.main === module) {
  const defaultAccent = "sapphire"; // Match the package.json default
  buildAllFlavors(defaultAccent);
}

module.exports = { buildAllFlavors };
