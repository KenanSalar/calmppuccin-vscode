/** @file What the palettes in `src/palettes.ts` have to agree on among themselves. */

import palettes, { isFlavor } from "../../src/palettes";

const REFERENCE_FLAVOR = "mocha";

describe("palettes", () => {
  const referenceKeys = Object.keys(palettes[REFERENCE_FLAVOR]).toSorted();
  const otherFlavors = Object.keys(palettes)
    .filter(isFlavor)
    .filter((flavor) => flavor !== REFERENCE_FLAVOR);

  /**
   * `IPalette`'s index signature lets one palette lack a key the others have, without a warning:
   * that flavor's theme keeps the literal `{{key}}`, and a generator reads `undefined`.
   */
  it.each(otherFlavors)(`gives %s exactly ${REFERENCE_FLAVOR}'s keys`, (flavor) => {
    expect(Object.keys(palettes[flavor]).toSorted()).toStrictEqual(referenceKeys);
  });
});
