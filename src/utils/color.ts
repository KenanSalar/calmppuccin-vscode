/**
 * @file Color utility functions shared across the extension.
 * @description Provides helper functions for color manipulation, including alpha channel operations.
 */

/**
 * Converts a hex color to hex format with alpha channel.
 * @param {string} hex - The hex color code (e.g., "#e4829e").
 * @param {number} opacity - The opacity value between 0 and 1.
 * @returns {string} The color in hex format with alpha (e.g., "#e4829e26").
 */
export function hexWithAlpha(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${cleanHex}${alpha}`;
}
