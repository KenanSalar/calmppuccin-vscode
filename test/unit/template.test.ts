/**
 * @file What `src/template.json` has to agree with VS Code on, against the color list in
 * `test/__fixtures__/workbenchColors.json`.
 */

import * as template from "../../src/template.json";
import * as workbenchColors from "../__fixtures__/workbenchColors.json";

describe("src/template.json", () => {
  const knownColors = new Set(workbenchColors.colors);

  /**
   * VS Code skips a color key it doesn't know without a word. A key newer than the fixture's VS
   * Code fails here until `npm run update-vscode-colors` refreshes the list.
   */
  it.each(Object.keys(template.colors))("names %s, a color VS Code knows", (key) => {
    expect(knownColors.has(key)).toBe(true);
  });

  /** A deprecated key is unused or superseded, and VS Code's message names the one to use. */
  it.each(workbenchColors.deprecated)("leaves out %s, which VS Code has deprecated", (key) => {
    expect(template.colors).not.toHaveProperty([key]);
  });
});
