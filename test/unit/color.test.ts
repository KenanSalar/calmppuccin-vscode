/**
 * @file Unit tests for the color utility functions.
 * Tests the hexWithAlpha function which converts hex colors to hex format with alpha channel.
 */

import { hexWithAlpha } from "../../src/utils/color";

describe("Color Utility Functions", () => {
  describe("hexWithAlpha", () => {
    it("should add full opacity (ff) when opacity is 1", () => {
      const result = hexWithAlpha("#e4829e", 1);
      expect(result).toBe("#e4829eff");
    });

    it("should add zero opacity (00) when opacity is 0", () => {
      const result = hexWithAlpha("#e4829e", 0);
      expect(result).toBe("#e4829e00");
    });

    it("should correctly calculate 50% opacity (80)", () => {
      const result = hexWithAlpha("#e4829e", 0.5);
      // 0.5 * 255 = 127.5, rounded = 128 = 0x80
      expect(result).toBe("#e4829e80");
    });

    it("should correctly calculate 15% opacity (26)", () => {
      const result = hexWithAlpha("#e4829e", 0.15);
      // 0.15 * 255 = 38.25, rounded = 38 = 0x26
      expect(result).toBe("#e4829e26");
    });

    it("should correctly calculate 30% opacity (4d)", () => {
      const result = hexWithAlpha("#ffffff", 0.3);
      // 0.3 * 255 = 76.5, rounded = 77 = 0x4d
      expect(result).toBe("#ffffff4d");
    });

    it("should correctly calculate 80% opacity (cc)", () => {
      const result = hexWithAlpha("#000000", 0.8);
      // 0.8 * 255 = 204 = 0xcc
      expect(result).toBe("#000000cc");
    });

    it("should handle hex colors without hash prefix", () => {
      const result = hexWithAlpha("e4829e", 0.5);
      expect(result).toBe("#e4829e80");
    });

    it("should handle lowercase hex colors", () => {
      const result = hexWithAlpha("#aabbcc", 1);
      expect(result).toBe("#aabbccff");
    });

    it("should handle uppercase hex colors", () => {
      const result = hexWithAlpha("#AABBCC", 1);
      expect(result).toBe("#AABBCCff");
    });

    it("should pad single-digit alpha values with leading zero", () => {
      const result = hexWithAlpha("#e4829e", 0.01);
      // 0.01 * 255 = 2.55, rounded = 3 = 0x03
      expect(result).toBe("#e4829e03");
    });

    it("should handle very small opacity values", () => {
      const result = hexWithAlpha("#e4829e", 0.001);
      // 0.001 * 255 = 0.255, rounded = 0 = 0x00
      expect(result).toBe("#e4829e00");
    });

    it("should handle opacity slightly below 1", () => {
      const result = hexWithAlpha("#e4829e", 0.99);
      // 0.99 * 255 = 252.45, rounded = 252 = 0xfc
      expect(result).toBe("#e4829efc");
    });
  });
});
