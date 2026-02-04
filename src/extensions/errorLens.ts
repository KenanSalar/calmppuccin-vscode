/**
 * @file errorLens.ts
 * @description Generates Error Lens extension color customizations for all Calmppuccin flavors.
 * This module provides color mappings for the Error Lens extension to integrate seamlessly
 * with the Calmppuccin theme aesthetic.
 *
 * Error Lens extension: https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens
 */

import { IPalette } from "../palettes";
import { hexWithAlpha } from "../utils/color";

/**
 * Interface defining all Error Lens color customization points.
 * These colors control how diagnostic messages (errors, warnings, info, hints)
 * are displayed inline in the editor and in the status bar.
 */
export interface IErrorLensColors {
  // Error colors (using red from palette)
  "errorLens.errorBackground": string;
  "errorLens.errorBackgroundLight": string;
  "errorLens.errorForeground": string;
  "errorLens.errorForegroundLight": string;
  "errorLens.errorMessageBackground": string;
  "errorLens.errorRangeBackground": string;

  // Warning colors (using peach from palette)
  "errorLens.warningBackground": string;
  "errorLens.warningBackgroundLight": string;
  "errorLens.warningForeground": string;
  "errorLens.warningForegroundLight": string;
  "errorLens.warningMessageBackground": string;
  "errorLens.warningRangeBackground": string;

  // Info colors (using blue from palette)
  "errorLens.infoBackground": string;
  "errorLens.infoBackgroundLight": string;
  "errorLens.infoForeground": string;
  "errorLens.infoForegroundLight": string;
  "errorLens.infoMessageBackground": string;
  "errorLens.infoRangeBackground": string;

  // Hint colors (using green from palette)
  "errorLens.hintBackground": string;
  "errorLens.hintBackgroundLight": string;
  "errorLens.hintForeground": string;
  "errorLens.hintForegroundLight": string;
  "errorLens.hintMessageBackground": string;
  "errorLens.hintRangeBackground": string;

  // Status bar colors
  "errorLens.statusBarErrorForeground": string;
  "errorLens.statusBarWarningForeground": string;
  "errorLens.statusBarInfoForeground": string;
  "errorLens.statusBarHintForeground": string;
  "errorLens.statusBarIconErrorForeground": string;
  "errorLens.statusBarIconWarningForeground": string;
}

/**
 * Generates Error Lens color mappings for a given Calmppuccin flavor palette.
 *
 * Color mapping strategy:
 * - Errors: red (strong, attention-grabbing for critical issues)
 * - Warnings: peach (warm, noticeable but less urgent than errors)
 * - Info: blue (calm, informative)
 * - Hints: green (positive, suggestive)
 *
 * @param {IPalette} palette - The color palette for a specific Calmppuccin flavor.
 * @returns {IErrorLensColors} An object containing all Error Lens color customizations.
 */
export function generateErrorLensColors(palette: IPalette): IErrorLensColors {
  // Background opacity for subtle inline highlighting
  const backgroundOpacity = 0.15;

  return {
    // Error colors - using red
    "errorLens.errorBackground": hexWithAlpha(palette.red, backgroundOpacity),
    "errorLens.errorBackgroundLight": hexWithAlpha(palette.red, backgroundOpacity),
    "errorLens.errorForeground": palette.red,
    "errorLens.errorForegroundLight": palette.red,
    "errorLens.errorMessageBackground": hexWithAlpha(palette.red, backgroundOpacity),
    "errorLens.errorRangeBackground": hexWithAlpha(palette.red, backgroundOpacity),

    // Warning colors - using peach
    "errorLens.warningBackground": hexWithAlpha(palette.peach, backgroundOpacity),
    "errorLens.warningBackgroundLight": hexWithAlpha(palette.peach, backgroundOpacity),
    "errorLens.warningForeground": palette.peach,
    "errorLens.warningForegroundLight": palette.peach,
    "errorLens.warningMessageBackground": hexWithAlpha(palette.peach, backgroundOpacity),
    "errorLens.warningRangeBackground": hexWithAlpha(palette.peach, backgroundOpacity),

    // Info colors - using blue
    "errorLens.infoBackground": hexWithAlpha(palette.blue, backgroundOpacity),
    "errorLens.infoBackgroundLight": hexWithAlpha(palette.blue, backgroundOpacity),
    "errorLens.infoForeground": palette.blue,
    "errorLens.infoForegroundLight": palette.blue,
    "errorLens.infoMessageBackground": hexWithAlpha(palette.blue, backgroundOpacity),
    "errorLens.infoRangeBackground": hexWithAlpha(palette.blue, backgroundOpacity),

    // Hint colors - using green
    "errorLens.hintBackground": hexWithAlpha(palette.green, backgroundOpacity),
    "errorLens.hintBackgroundLight": hexWithAlpha(palette.green, backgroundOpacity),
    "errorLens.hintForeground": palette.green,
    "errorLens.hintForegroundLight": palette.green,
    "errorLens.hintMessageBackground": hexWithAlpha(palette.green, backgroundOpacity),
    "errorLens.hintRangeBackground": hexWithAlpha(palette.green, backgroundOpacity),

    // Status bar colors
    "errorLens.statusBarErrorForeground": palette.red,
    "errorLens.statusBarWarningForeground": palette.peach,
    "errorLens.statusBarInfoForeground": palette.blue,
    "errorLens.statusBarHintForeground": palette.green,
    "errorLens.statusBarIconErrorForeground": palette.red,
    "errorLens.statusBarIconWarningForeground": palette.peach,
  };
}
