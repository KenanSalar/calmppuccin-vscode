/**
 * @file This file imports all individual flavor palettes and combines them into a single,
 * strongly-typed object. It also defines the core types for the palette structure.
 */

/**
 * @interface Palette
 * Defines the structure for a single theme flavor's color palette.
 */
export interface Palette {
  /** The display name of the theme (e.g., "Calmppuccin Mocha"). */
  themeName: string;
  /** The UI theme type, used by VS Code to determine workbench styling. */
  themeType: "light" | "dark";
  /** An index signature to allow any number of color key-value pairs. */
  [colorName: string]: string;
}

/**
 * @interface Palettes
 * Defines the main object that aggregates all individual flavor palettes.
 * Each key corresponds to a specific Calmppuccin flavor.
 */
export interface Palettes {
  latte: Palette;
  frappe: Palette;
  macchiato: Palette;
  mocha: Palette;
  "nitro-cold-brew": Palette;
  oledppuccin: Palette;
}

// Import the raw color objects for each individual flavor.
import latte from "./palettes/latte";
import frappe from "./palettes/frappe";
import macchiato from "./palettes/macchiato";
import mocha from "./palettes/mocha";
import nitroColdBrew from "./palettes/nitro-cold-brew";
import oledppuccin from "./palettes/oledppuccin";

/**
 * The main palettes object that assembles all imported flavors.
 * This constant is strongly typed with the `Palettes` interface to ensure
 * all required flavors are present.
 */
const palettes: Palettes = {
  latte,
  frappe,
  macchiato,
  mocha,
  "nitro-cold-brew": nitroColdBrew,
  oledppuccin,
};

export default palettes;
