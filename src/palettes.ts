/** @file Every flavor's palette, keyed by flavor. */

/** One flavor's colors, keyed as `src/template.json`'s placeholders name them. */
export interface IPalette {
  /** The theme's label, such as "Calmppuccin Mocha". */
  themeName: string;
  themeType: "light" | "dark";
  [colorName: string]: string;
}

export interface IPalettes {
  latte: IPalette;
  frappe: IPalette;
  macchiato: IPalette;
  mocha: IPalette;
  "nitro-cold-brew": IPalette;
  oledppuccin: IPalette;
}

import frappe from "./palettes/frappe";
import latte from "./palettes/latte";
import macchiato from "./palettes/macchiato";
import mocha from "./palettes/mocha";
import nitroColdBrew from "./palettes/nitro-cold-brew";
import oledppuccin from "./palettes/oledppuccin";

const palettes: IPalettes = {
  latte,
  frappe,
  macchiato,
  mocha,
  "nitro-cold-brew": nitroColdBrew,
  oledppuccin,
};

export default palettes;

export function isFlavor(key: string): key is keyof IPalettes {
  return Object.hasOwn(palettes, key);
}
