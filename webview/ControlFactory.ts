/**
 * @file Factory for creating settings controls (font style dropdowns, color pickers, reset button).
 * Extracted from UIManager to follow Single Responsibility Principle.
 */

import { IVsCodeApi } from "../types/webview";
import { IWebviewSetting } from "../types/webview";
import { WEBVIEW_CONSTANTS as COMMANDS } from "../src/constants";
import { PreviewState } from "./PreviewRenderer";

/** Dependencies injected into the ControlFactory. */
export interface IControlFactoryDeps {
  vscode: IVsCodeApi;
  previewState: PreviewState;
  onPreviewUpdate: () => void;
  settingsContainer: HTMLElement;
  resetAllContainer: HTMLElement;
  dialogOverlay: HTMLElement;
}

/**
 * Creates DOM controls for settings (font style dropdowns, color pickers)
 * and the "Reset All" button.
 */
export class ControlFactory {
  private readonly fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];
  private readonly hex6Regex = /^#[0-9a-fA-F]{6}$/;
  private readonly hex8Regex = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;

  constructor(private readonly deps: IControlFactoryDeps) {}

  /**
   * Dynamically creates the grid of controls for font styles and syntax colors.
   * @param settings An array of the syntax settings to build controls for.
   * @param defaultFontStyles An object containing the default font styles.
   * @param includeFontStyles Whether to include font style controls.
   * @param activeFlavor The currently active theme flavor name.
   */
  public createSettingsControls(
    settings: IWebviewSetting[],
    defaultFontStyles: { [key: string]: string },
    includeFontStyles: boolean,
    activeFlavor: string
  ): void {
    settings.forEach((setting) => {
      const { key, fontStyle, color, defaultColor } = setting;
      const fontStyleKey = `${key}FontStyle`;
      const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";

      // Initialize the live preview state for this syntax token.
      this.deps.previewState[key] = { color, fontStyle };

      // Create and configure the label for this setting.
      const label = document.createElement("label");
      label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
      label.htmlFor = key;

      let fontContainer: HTMLElement | null = null;
      if (includeFontStyles && fontStyle !== undefined) {
        fontContainer = this._createFontStyleControl(key, fontStyle, defaultFontStyle, fontStyleKey);
      }

      const colorContainer = this._createColorPickerControl(key, color || "", defaultColor, activeFlavor);

      // Add the new elements to the settings grid in the DOM.
      this.deps.settingsContainer.appendChild(label);
      if (fontContainer) {
        this.deps.settingsContainer.appendChild(fontContainer);
      }
      this.deps.settingsContainer.appendChild(colorContainer);
    });
  }

  /**
   * Creates the "Reset All" button in the Danger Zone.
   */
  public createResetAllButton(): void {
    const resetAllButton = document.createElement("button");
    resetAllButton.textContent = "Reset All Settings to Default";
    resetAllButton.className = "reset-all-button";
    resetAllButton.addEventListener("click", () => {
      this.deps.dialogOverlay.classList.remove("hidden");
    });
    this.deps.resetAllContainer.appendChild(resetAllButton);
  }

  /**
   * Creates an individual font style dropdown control with its associated reset button.
   * @returns The container element for the font style control.
   */
  private _createFontStyleControl(
    key: string,
    fontStyle: string,
    defaultFontStyle: string,
    fontStyleKey: string
  ): HTMLElement {
    const container = document.createElement("div");
    container.className = "setting-with-reset";

    const select = document.createElement("select");
    select.id = key;
    this.fontStyleOptions.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      if (fontStyle === option) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", (e) => {
      const newValue = (e.target as HTMLSelectElement).value;
      this.deps.previewState[key].fontStyle = newValue;
      this.deps.onPreviewUpdate();
      this.deps.vscode.postMessage({ command: COMMANDS.UPDATE_SETTING, key: fontStyleKey, value: newValue });
    });

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "reset-button";
    resetButton.addEventListener("click", () => {
      select.value = defaultFontStyle;
      this.deps.previewState[key].fontStyle = defaultFontStyle;
      this.deps.onPreviewUpdate();
      this.deps.vscode.postMessage({ command: COMMANDS.RESET_FONT_STYLE, key: fontStyleKey });
    });

    container.appendChild(select);
    container.appendChild(resetButton);
    return container;
  }

  /**
   * Creates an individual color picker control with its alpha slider and reset button.
   * @returns The container element for the color picker.
   */
  private _createColorPickerControl(key: string, color: string, defaultColor: string, activeFlavor: string): HTMLElement {
    const container = document.createElement("div");
    container.className = "setting-with-reset";

    const wrapper = document.createElement("div");
    wrapper.className = "syntax-picker-wrapper";
    const topRow = document.createElement("div");
    topRow.className = "syntax-picker-top-row";
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    const hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.className = "hex-input-display";
    hexInput.maxLength = 9; // Allow for #RRGGBBAA
    const alphaSlider = document.createElement("input");
    alphaSlider.type = "range";
    alphaSlider.min = "0";
    alphaSlider.max = "255";
    alphaSlider.step = "1";
    const isUiColor = ["base", "mantle", "crust"].includes(key);
    if (isUiColor) {
      alphaSlider.style.display = "none";
      hexInput.maxLength = 7;
    }

    // --- Set initial values from settings ---
    const initialColor = color || defaultColor || "#ffffffff";
    const initialRgb = initialColor.substring(0, 7);
    const initialAlphaHex = initialColor.length === 9 ? initialColor.substring(7, 9) : "ff";
    colorInput.value = initialRgb;
    alphaSlider.value = parseInt(initialAlphaHex, 16).toString();
    hexInput.value = isUiColor ? initialRgb : initialColor;

    // --- Helper function to update the UI from the color picker & slider ---
    const updateFromPickers = () => {
      const newRgb = colorInput.value;
      const newAlpha = parseInt(alphaSlider.value);
      const newAlphaHex = newAlpha.toString(16).padStart(2, "0");

      const finalColor = isUiColor ? newRgb : `${newRgb}${newAlphaHex}`;

      hexInput.value = finalColor;
      this.deps.previewState[key].color = finalColor;
      this.deps.onPreviewUpdate();
    };

    // --- Helper function to send the final color to the extension backend ---
    const sendFinalColorToVSCode = () => {
      const command = isUiColor ? COMMANDS.UPDATE_UI_COLOR : COMMANDS.UPDATE_SYNTAX_COLOR;
      this.deps.vscode.postMessage({
        command: command,
        flavor: activeFlavor,
        key,
        value: hexInput.value,
      });
    };

    // --- Event Listeners ---
    colorInput.addEventListener("input", updateFromPickers);
    alphaSlider.addEventListener("input", updateFromPickers);
    colorInput.addEventListener("change", sendFinalColorToVSCode);
    alphaSlider.addEventListener("change", sendFinalColorToVSCode);

    // --- Add event listener for the text input ---
    hexInput.addEventListener("input", () => {
      const typedValue = hexInput.value;
      const regex = isUiColor ? this.hex6Regex : this.hex8Regex;
      const match = typedValue.match(regex);

      if (match) {
        hexInput.style.borderColor = "";
        hexInput.style.outlineColor = "";

        const rgb = match[1] ? `#${match[1]}` : "#000000";
        const alphaHex = (match[2] as string | undefined) ?? "ff";
        const alphaDecimal = parseInt(alphaHex, 16);

        colorInput.value = rgb;
        if (!isUiColor) {
          alphaSlider.value = alphaDecimal.toString();
        }

        this.deps.previewState[key].color = typedValue;
        this.deps.onPreviewUpdate();
      } else {
        hexInput.style.borderColor = "var(--danger-color)";
        hexInput.style.outlineColor = "var(--danger-color)";
      }
    });

    hexInput.addEventListener("change", () => {
      const regex = isUiColor ? this.hex6Regex : this.hex8Regex;
      if (regex.test(hexInput.value)) {
        sendFinalColorToVSCode();
      }
    });

    // --- Reset Button Logic ---
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "reset-button";
    resetButton.addEventListener("click", () => {
      const defaultRgb = defaultColor.substring(0, 7);
      const defaultAlphaHex = defaultColor.length === 9 ? defaultColor.substring(7, 9) : "ff";
      colorInput.value = defaultRgb;
      alphaSlider.value = parseInt(defaultAlphaHex, 16).toString();
      hexInput.value = isUiColor ? defaultRgb : defaultColor;
      this.deps.previewState[key].color = defaultColor;
      this.deps.onPreviewUpdate();
      const command = isUiColor ? COMMANDS.RESET_UI_COLOR : COMMANDS.RESET_SYNTAX_COLOR;
      this.deps.vscode.postMessage({ command, flavor: activeFlavor, key });
    });

    // --- DOM Assembly ---
    topRow.appendChild(colorInput);
    topRow.appendChild(hexInput);
    wrapper.appendChild(topRow);
    wrapper.appendChild(alphaSlider);
    container.appendChild(wrapper);
    container.appendChild(resetButton);

    return container;
  }
}
