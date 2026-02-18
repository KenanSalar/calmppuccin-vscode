/**
 * @file Handles live preview pane updates for the settings webview.
 * Applies color and font style changes to code preview tokens in real time.
 */

/** Maps token keys to their current styling state. */
export type PreviewState = { [key: string]: { color?: string; fontStyle?: string } };

/**
 * Iterates through the preview state and applies the current color and font styles
 * to all matching tokens in the code preview pane.
 * @param codePreview The code preview element containing token spans.
 * @param previewPane The preview pane element (used for background color on crust changes).
 * @param previewState The current styling state for each token key.
 */
export function updatePreviewPane(
  codePreview: HTMLElement,
  previewPane: HTMLElement,
  previewState: PreviewState
): void {
  for (const tokenKey in previewState) {
    const elements = codePreview.querySelectorAll<HTMLElement>(`[data-token="${tokenKey}"]`);
    elements.forEach((el) => {
      const tokenStyle = previewState[tokenKey];
      if (tokenStyle.color) {
        if (["base", "mantle", "crust"].includes(tokenKey)) {
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
