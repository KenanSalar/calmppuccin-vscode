/** @file Color arithmetic for the third-party color generators. */

/** Appends `opacity`, from 0 to 1, to a `#rrggbb` color as its alpha: 0.15 makes `26`. */
export function hexWithAlpha(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${cleanHex}${alpha}`;
}
