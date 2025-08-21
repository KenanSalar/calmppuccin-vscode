// This file imports all the partial palettes and combines them into one object.
export interface Palette {
  themeName: string;
  themeType: "light" | "dark";
  [colorName: string]: string;
}

export interface Palettes {
  latte: Palette;
  frappe: Palette;
  macchiato: Palette;
  mocha: Palette;
  "nitro-cold-brew": Palette;
  oledppuccin: Palette;
}

import latte from "./palettes/latte";
import frappe from "./palettes/frappe";
import macchiato from "./palettes/macchiato";
import mocha from "./palettes/mocha";
import nitroColdBrew from "./palettes/nitro-cold-brew";
import oledppuccin from "./palettes/oledppuccin";

const palettes: Palettes = {
  latte,
  frappe,
  macchiato,
  mocha,
  "nitro-cold-brew": nitroColdBrew,
  oledppuccin,
};

export default palettes;