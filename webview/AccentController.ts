/**
 * @file The accent dropdown and the custom accent picker. Both recolor the page through
 * `--dynamic-accent-color` as the user picks, and the picker posts only on `change`.
 */

import { CUSTOM_ACCENT, HEX6_COLOR, WEBVIEW_CONSTANTS as COMMANDS } from "../src/constants";
import { IVsCodeApi } from "../types/webview";

export interface IAccentElements {
  accentContainer: HTMLElement;
  customAccentPickerContainer: HTMLElement;
  customAccentPicker: HTMLInputElement;
  customAccentHexInput: HTMLInputElement;
}

export class AccentController {
  constructor(
    private readonly vscode: IVsCodeApi,
    private readonly elements: IAccentElements,
  ) {}

  /** Builds the accent dropdown above the custom picker, and fills the picker in. */
  public createControls(
    currentAccent: string,
    accentOptions: string[],
    customAccentColor: string,
    accentColorMap: { [key: string]: string },
  ): void {
    this.elements.accentContainer.appendChild(this.elements.customAccentPickerContainer);

    const accentSelectContainer = document.createElement("div");
    accentSelectContainer.style.display = "grid";
    accentSelectContainer.style.gridTemplateColumns = "auto 1fr";
    accentSelectContainer.style.gap = "10px 20px";
    accentSelectContainer.style.alignItems = "center";

    const accentLabel = document.createElement("label");
    accentLabel.textContent = "Accent Color:";
    const accentSelect = document.createElement("select");

    accentOptions.forEach((option: string) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.textContent = option;
      if (currentAccent === option) {
        optionElement.selected = true;
      }
      accentSelect.appendChild(optionElement);
    });

    accentSelect.addEventListener("change", () => {
      const newValue = accentSelect.value;
      this.handleAccentChange(newValue, accentColorMap);
      this.vscode.postMessage({ command: COMMANDS.UPDATE_ACCENT, value: newValue });
    });

    accentSelectContainer.appendChild(accentLabel);
    accentSelectContainer.appendChild(accentSelect);
    this.elements.accentContainer.insertBefore(
      accentSelectContainer,
      this.elements.customAccentPickerContainer,
    );

    this.elements.customAccentPicker.value = customAccentColor;
    this.elements.customAccentHexInput.value = customAccentColor;
    this.elements.customAccentHexInput.maxLength = 7;
  }

  /** Shows the custom picker only for `custom`, and recolors the page with the chosen accent. */
  public handleAccentChange(accentValue: string, accentColorMap: { [key: string]: string }): void {
    const isCustom = accentValue === CUSTOM_ACCENT;
    this.elements.customAccentPickerContainer.style.display = isCustom ? "grid" : "none";
    const newColor = isCustom
      ? this.elements.customAccentPicker.value
      : accentColorMap[accentValue];
    this.updateAccentColor(newColor);
  }

  public updateAccentColor(newColor: string): void {
    document.documentElement.style.setProperty("--dynamic-accent-color", newColor);
  }

  public initializeEventListeners(): void {
    const { customAccentPicker, customAccentHexInput } = this.elements;

    customAccentPicker.addEventListener("input", () => {
      customAccentHexInput.value = customAccentPicker.value;
      this.updateAccentColor(customAccentPicker.value);
    });

    customAccentPicker.addEventListener("change", () => {
      this.vscode.postMessage({
        command: COMMANDS.UPDATE_CUSTOM_ACCENT,
        value: customAccentPicker.value,
      });
    });

    customAccentHexInput.addEventListener("input", () => {
      const newValue = customAccentHexInput.value;

      if (HEX6_COLOR.test(newValue)) {
        customAccentHexInput.style.borderColor = "";
        customAccentHexInput.style.outlineColor = "";
        customAccentPicker.value = newValue;
        this.updateAccentColor(newValue);
      } else {
        customAccentHexInput.style.borderColor = "var(--danger-color)";
        customAccentHexInput.style.outlineColor = "var(--danger-color)";
      }
    });

    customAccentHexInput.addEventListener("change", () => {
      const newValue = customAccentHexInput.value;

      if (HEX6_COLOR.test(newValue)) {
        this.vscode.postMessage({ command: COMMANDS.UPDATE_CUSTOM_ACCENT, value: newValue });
      }
    });
  }
}
