/**
 * @file Builds the settings grid's controls and the Reset All button. A control repaints the
 * preview on `input` and posts to the host only on `change`, so a drag writes the settings once.
 */

import {
  BACKGROUND_UI_KEYS,
  FONT_STYLE_OPTIONS,
  HEX6_COLOR,
  HEX_COLOR_WITH_ALPHA,
  WEBVIEW_CONSTANTS as COMMANDS,
} from "../src/constants";
import { IVsCodeApi } from "../types/webview";
import { IWebviewSetting } from "../types/webview";
import { PreviewState } from "./PreviewRenderer";

export interface IControlFactoryDeps {
  vscode: IVsCodeApi;
  previewState: PreviewState;
  onPreviewUpdate: () => void;
  settingsContainer: HTMLElement;
  resetAllContainer: HTMLElement;
  dialogOverlay: HTMLElement;
}

export class ControlFactory {
  constructor(private readonly deps: IControlFactoryDeps) {}

  /**
   * Appends a label, a font style control when the setting has a font style, and a color control
   * for each setting.
   *
   * Each control records a committed edit on its setting, since the host doesn't echo writes back
   * and a view is rebuilt from these settings when it's shown again.
   */
  public createSettingsControls(
    settings: IWebviewSetting[],
    defaultFontStyles: { [key: string]: string },
    activeFlavor: string,
  ): void {
    settings.forEach((setting) => {
      const { key, fontStyle, color } = setting;
      this.deps.previewState[key] = { color, fontStyle };

      const label = document.createElement("label");
      label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
      label.htmlFor = key;
      this.deps.settingsContainer.appendChild(label);

      if (fontStyle !== undefined) {
        const fontStyleKey = `${key}FontStyle`;
        const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";
        this.deps.settingsContainer.appendChild(
          this._createFontStyleControl(setting, defaultFontStyle, fontStyleKey),
        );
      }
      this.deps.settingsContainer.appendChild(
        this._createColorPickerControl(setting, activeFlavor),
      );
    });
  }

  /** Its click opens the confirmation dialog, which `ProfileController` answers. */
  public createResetAllButton(): void {
    const resetAllButton = document.createElement("button");
    resetAllButton.textContent = "Reset All Settings to Default";
    resetAllButton.className = "reset-all-button";
    resetAllButton.addEventListener("click", () => {
      this.deps.dialogOverlay.classList.remove("hidden");
    });
    this.deps.resetAllContainer.appendChild(resetAllButton);
  }

  private _createFontStyleControl(
    setting: IWebviewSetting,
    defaultFontStyle: string,
    fontStyleKey: string,
  ): HTMLElement {
    const { key } = setting;
    const container = document.createElement("div");
    container.className = "setting-with-reset";

    const select = document.createElement("select");
    select.id = key;
    FONT_STYLE_OPTIONS.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      if (setting.fontStyle === option) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      const newValue = select.value;
      setting.fontStyle = newValue;
      this.deps.previewState[key].fontStyle = newValue;
      this.deps.onPreviewUpdate();
      this.deps.vscode.postMessage({
        command: COMMANDS.UPDATE_SETTING,
        key: fontStyleKey,
        value: newValue,
      });
    });

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "reset-button";
    resetButton.addEventListener("click", () => {
      select.value = defaultFontStyle;
      setting.fontStyle = defaultFontStyle;
      this.deps.previewState[key].fontStyle = defaultFontStyle;
      this.deps.onPreviewUpdate();
      this.deps.vscode.postMessage({ command: COMMANDS.RESET_FONT_STYLE, key: fontStyleKey });
    });

    container.appendChild(select);
    container.appendChild(resetButton);
    return container;
  }

  private _createColorPickerControl(setting: IWebviewSetting, activeFlavor: string): HTMLElement {
    const { key, defaultColor } = setting;
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
    const isUiColor = BACKGROUND_UI_KEYS.has(key);
    if (isUiColor) {
      alphaSlider.style.display = "none";
      hexInput.maxLength = 7;
    }
    const colorPattern = isUiColor ? HEX6_COLOR : HEX_COLOR_WITH_ALPHA;

    const showColor = (color: string) => {
      const rgb = color.substring(0, 7);
      const alphaHex = color.length === 9 ? color.substring(7, 9) : "ff";
      colorInput.value = rgb;
      alphaSlider.value = parseInt(alphaHex, 16).toString();
      hexInput.value = isUiColor ? rgb : color;
    };
    showColor(setting.color || defaultColor || "#ffffffff");

    const updateFromPickers = () => {
      const newRgb = colorInput.value;
      const newAlpha = parseInt(alphaSlider.value);
      const newAlphaHex = newAlpha.toString(16).padStart(2, "0");

      const finalColor = isUiColor ? newRgb : `${newRgb}${newAlphaHex}`;

      hexInput.value = finalColor;
      this.deps.previewState[key].color = finalColor;
      this.deps.onPreviewUpdate();
    };

    const sendFinalColorToVSCode = () => {
      setting.color = hexInput.value;
      const command = isUiColor ? COMMANDS.UPDATE_UI_COLOR : COMMANDS.UPDATE_SYNTAX_COLOR;
      this.deps.vscode.postMessage({
        command: command,
        flavor: activeFlavor,
        key,
        value: hexInput.value,
      });
    };

    colorInput.addEventListener("input", updateFromPickers);
    alphaSlider.addEventListener("input", updateFromPickers);
    colorInput.addEventListener("change", sendFinalColorToVSCode);
    alphaSlider.addEventListener("change", sendFinalColorToVSCode);

    hexInput.addEventListener("input", () => {
      const typedValue = hexInput.value;
      const match = typedValue.match(colorPattern);

      if (match) {
        hexInput.style.borderColor = "";
        hexInput.style.outlineColor = "";

        const rgb = `#${match[1]}`;
        // An optional group that didn't match is `undefined`, which the match's type leaves out.
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
      if (colorPattern.test(hexInput.value)) {
        sendFinalColorToVSCode();
      }
    });

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "reset-button";
    resetButton.addEventListener("click", () => {
      showColor(defaultColor);
      setting.color = defaultColor;
      this.deps.previewState[key].color = defaultColor;
      this.deps.onPreviewUpdate();
      const command = isUiColor ? COMMANDS.RESET_UI_COLOR : COMMANDS.RESET_SYNTAX_COLOR;
      this.deps.vscode.postMessage({ command, flavor: activeFlavor, key });
    });

    topRow.appendChild(colorInput);
    topRow.appendChild(hexInput);
    wrapper.appendChild(topRow);
    wrapper.appendChild(alphaSlider);
    container.appendChild(wrapper);
    container.appendChild(resetButton);

    return container;
  }
}
