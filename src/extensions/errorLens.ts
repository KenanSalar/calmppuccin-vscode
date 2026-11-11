/**
 * @file Error Lens colors from the base palette: red errors, peach warnings, blue info and green
 * hints.
 * @see https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens
 */

import { EXTENSION_OPACITY_BACKGROUND } from "../constants";
import { IPalette } from "../palettes";
import { hexWithAlpha } from "../utils/color";

export interface IErrorLensColors {
  "errorLens.errorBackground": string;
  "errorLens.errorBackgroundLight": string;
  "errorLens.errorForeground": string;
  "errorLens.errorForegroundLight": string;
  "errorLens.errorMessageBackground": string;
  "errorLens.errorRangeBackground": string;

  "errorLens.warningBackground": string;
  "errorLens.warningBackgroundLight": string;
  "errorLens.warningForeground": string;
  "errorLens.warningForegroundLight": string;
  "errorLens.warningMessageBackground": string;
  "errorLens.warningRangeBackground": string;

  "errorLens.infoBackground": string;
  "errorLens.infoBackgroundLight": string;
  "errorLens.infoForeground": string;
  "errorLens.infoForegroundLight": string;
  "errorLens.infoMessageBackground": string;
  "errorLens.infoRangeBackground": string;

  "errorLens.hintBackground": string;
  "errorLens.hintBackgroundLight": string;
  "errorLens.hintForeground": string;
  "errorLens.hintForegroundLight": string;
  "errorLens.hintMessageBackground": string;
  "errorLens.hintRangeBackground": string;

  "errorLens.statusBarErrorForeground": string;
  "errorLens.statusBarWarningForeground": string;
  "errorLens.statusBarInfoForeground": string;
  "errorLens.statusBarHintForeground": string;
  "errorLens.statusBarIconErrorForeground": string;
  "errorLens.statusBarIconWarningForeground": string;
}

export function generateErrorLensColors(palette: IPalette): IErrorLensColors {
  return {
    "errorLens.errorBackground": hexWithAlpha(palette.red, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.errorBackgroundLight": hexWithAlpha(palette.red, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.errorForeground": palette.red,
    "errorLens.errorForegroundLight": palette.red,
    "errorLens.errorMessageBackground": hexWithAlpha(palette.red, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.errorRangeBackground": hexWithAlpha(palette.red, EXTENSION_OPACITY_BACKGROUND),

    "errorLens.warningBackground": hexWithAlpha(palette.peach, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.warningBackgroundLight": hexWithAlpha(palette.peach, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.warningForeground": palette.peach,
    "errorLens.warningForegroundLight": palette.peach,
    "errorLens.warningMessageBackground": hexWithAlpha(palette.peach, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.warningRangeBackground": hexWithAlpha(palette.peach, EXTENSION_OPACITY_BACKGROUND),

    "errorLens.infoBackground": hexWithAlpha(palette.blue, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.infoBackgroundLight": hexWithAlpha(palette.blue, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.infoForeground": palette.blue,
    "errorLens.infoForegroundLight": palette.blue,
    "errorLens.infoMessageBackground": hexWithAlpha(palette.blue, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.infoRangeBackground": hexWithAlpha(palette.blue, EXTENSION_OPACITY_BACKGROUND),

    "errorLens.hintBackground": hexWithAlpha(palette.green, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.hintBackgroundLight": hexWithAlpha(palette.green, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.hintForeground": palette.green,
    "errorLens.hintForegroundLight": palette.green,
    "errorLens.hintMessageBackground": hexWithAlpha(palette.green, EXTENSION_OPACITY_BACKGROUND),
    "errorLens.hintRangeBackground": hexWithAlpha(palette.green, EXTENSION_OPACITY_BACKGROUND),

    "errorLens.statusBarErrorForeground": palette.red,
    "errorLens.statusBarWarningForeground": palette.peach,
    "errorLens.statusBarInfoForeground": palette.blue,
    "errorLens.statusBarHintForeground": palette.green,
    "errorLens.statusBarIconErrorForeground": palette.red,
    "errorLens.statusBarIconWarningForeground": palette.peach,
  };
}
