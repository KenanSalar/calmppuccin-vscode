/**
 * @file Unit tests for the Error Lens extension color generator.
 * Tests that the generateErrorLensColors function produces correct color mappings
 * for all diagnostic categories (error, warning, info, hint).
 */

import { generateErrorLensColors, IErrorLensColors } from "../../src/extensions/errorLens";
import { EXTENSION_OPACITY_BACKGROUND } from "../../src/constants";
import { hexWithAlpha } from "../../src/utils/color";
import { mockPalette } from "../__fixtures__/mockPalette";

describe("Error Lens Color Generator", () => {
  let colors: IErrorLensColors;

  beforeAll(() => {
    colors = generateErrorLensColors(mockPalette);
  });

  describe("Error colors", () => {
    it("should use red for error foreground", () => {
      expect(colors["errorLens.errorForeground"]).toBe(mockPalette.red);
      expect(colors["errorLens.errorForegroundLight"]).toBe(mockPalette.red);
    });

    it("should use red with background opacity for error backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.red, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.errorBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.errorBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.errorMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.errorRangeBackground"]).toBe(expectedBackground);
    });

    it("should use red for status bar error icons", () => {
      expect(colors["errorLens.statusBarErrorForeground"]).toBe(mockPalette.red);
      expect(colors["errorLens.statusBarIconErrorForeground"]).toBe(mockPalette.red);
    });
  });

  describe("Warning colors", () => {
    it("should use peach for warning foreground", () => {
      expect(colors["errorLens.warningForeground"]).toBe(mockPalette.peach);
      expect(colors["errorLens.warningForegroundLight"]).toBe(mockPalette.peach);
    });

    it("should use peach with background opacity for warning backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.peach, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.warningBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.warningBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.warningMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.warningRangeBackground"]).toBe(expectedBackground);
    });

    it("should use peach for status bar warning icons", () => {
      expect(colors["errorLens.statusBarWarningForeground"]).toBe(mockPalette.peach);
      expect(colors["errorLens.statusBarIconWarningForeground"]).toBe(mockPalette.peach);
    });
  });

  describe("Info colors", () => {
    it("should use blue for info foreground", () => {
      expect(colors["errorLens.infoForeground"]).toBe(mockPalette.blue);
      expect(colors["errorLens.infoForegroundLight"]).toBe(mockPalette.blue);
    });

    it("should use blue with background opacity for info backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.blue, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.infoBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.infoBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.infoMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.infoRangeBackground"]).toBe(expectedBackground);
    });

    it("should use blue for status bar info foreground", () => {
      expect(colors["errorLens.statusBarInfoForeground"]).toBe(mockPalette.blue);
    });
  });

  describe("Hint colors", () => {
    it("should use green for hint foreground", () => {
      expect(colors["errorLens.hintForeground"]).toBe(mockPalette.green);
      expect(colors["errorLens.hintForegroundLight"]).toBe(mockPalette.green);
    });

    it("should use green with background opacity for hint backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.green, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.hintBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.hintBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.hintMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.hintRangeBackground"]).toBe(expectedBackground);
    });

    it("should use green for status bar hint foreground", () => {
      expect(colors["errorLens.statusBarHintForeground"]).toBe(mockPalette.green);
    });
  });

  describe("Color format validation", () => {
    it("should return all expected color keys", () => {
      const expectedKeys = [
        "errorLens.errorBackground",
        "errorLens.errorBackgroundLight",
        "errorLens.errorForeground",
        "errorLens.errorForegroundLight",
        "errorLens.errorMessageBackground",
        "errorLens.errorRangeBackground",
        "errorLens.warningBackground",
        "errorLens.warningBackgroundLight",
        "errorLens.warningForeground",
        "errorLens.warningForegroundLight",
        "errorLens.warningMessageBackground",
        "errorLens.warningRangeBackground",
        "errorLens.infoBackground",
        "errorLens.infoBackgroundLight",
        "errorLens.infoForeground",
        "errorLens.infoForegroundLight",
        "errorLens.infoMessageBackground",
        "errorLens.infoRangeBackground",
        "errorLens.hintBackground",
        "errorLens.hintBackgroundLight",
        "errorLens.hintForeground",
        "errorLens.hintForegroundLight",
        "errorLens.hintMessageBackground",
        "errorLens.hintRangeBackground",
        "errorLens.statusBarErrorForeground",
        "errorLens.statusBarWarningForeground",
        "errorLens.statusBarInfoForeground",
        "errorLens.statusBarHintForeground",
        "errorLens.statusBarIconErrorForeground",
        "errorLens.statusBarIconWarningForeground",
      ];

      expectedKeys.forEach((key) => {
        expect(key in colors).toBe(true);
      });
    });

    it("should return valid hex colors for all values", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;
      Object.values(colors).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });
  });
});
