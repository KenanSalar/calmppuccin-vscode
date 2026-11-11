/** @file Paints the preview's `data-token` spans. */

import { BACKGROUND_UI_KEYS } from "../src/constants";

/** The color and font style each key shows in the preview, whether committed or not. */
export type PreviewState = { [key: string]: { color?: string; fontStyle?: string } };

/**
 * Applies every key in `previewState` to its spans. Base, mantle and crust color backgrounds,
 * and crust colors `previewPane` as well.
 */
export function updatePreviewPane(
  codePreview: HTMLElement,
  previewPane: HTMLElement,
  previewState: PreviewState,
): void {
  for (const tokenKey in previewState) {
    const elements = codePreview.querySelectorAll<HTMLElement>(`[data-token="${tokenKey}"]`);
    elements.forEach((el) => {
      const tokenStyle = previewState[tokenKey];
      if (tokenStyle.color) {
        if (BACKGROUND_UI_KEYS.has(tokenKey)) {
          el.style.backgroundColor = tokenStyle.color;
          if (tokenKey === "crust") {
            previewPane.style.backgroundColor = tokenStyle.color;
          }
        } else {
          el.style.color = tokenStyle.color;
        }
      }
      if (tokenStyle.fontStyle) {
        const style = tokenStyle.fontStyle;
        el.style.fontStyle = style.includes("italic") ? "italic" : "normal";
        el.style.fontWeight = style.includes("bold") ? "bold" : "normal";
        el.style.textDecoration = style.includes("underline") ? "underline" : "none";
      }
    });
  }
}
