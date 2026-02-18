/**
 * @file Manages accent color selection and the custom accent color picker.
 * Extracted from UIManager to follow Single Responsibility Principle.
 */

import { IVsCodeApi } from "../types/webview";
import { WEBVIEW_CONSTANTS as COMMANDS } from "../src/constants";

/** DOM element references needed by AccentController. */
export interface IAccentElements {
  accentContainer: HTMLElement;
  customAccentPickerContainer: HTMLElement;
  customAccentPicker: HTMLInputElement;
  customAccentHexInput: HTMLInputElement;
}

/**
 * Handles accent color dropdown creation, custom accent picker events,
 * and live accent color updates.
 */
export class AccentController {
  private readonly hex6Regex = /^#[0-9a-fA-F]{6}$/;

  constructor(
    private readonly vscode: IVsCodeApi,
    private readonly elements: IAccentElements
  ) {}

  /**
   * Dynamically creates the Accent Color dropdown and the custom color picker controls.
   * @param currentAccent The currently selected accent value.
   * @param accentOptions Available accent options from the extension manifest.
   * @param customAccentColor The current custom accent hex color.
   * @param accentColorMap Map of accent names to their hex color values.
   */
  public createControls(
    currentAccent: string,
    accentOptions: string[],
    customAccentColor: string,
    accentColorMap: { [key: string]: string }
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

    accentSelect.addEventListener("change", (e) => {
      const newValue = (e.target as HTMLSelectElement).value;
      this.handleAccentChange(newValue, accentColorMap);
      this.vscode.postMessage({ command: COMMANDS.UPDATE_ACCENT, value: newValue });
    });

    accentSelectContainer.appendChild(accentLabel);
    accentSelectContainer.appendChild(accentSelect);
    this.elements.accentContainer.insertBefore(accentSelectContainer, this.elements.customAccentPickerContainer);

    this.elements.customAccentPicker.value = customAccentColor;
    this.elements.customAccentHexInput.value = customAccentColor;
    this.elements.customAccentHexInput.maxLength = 7;
  }

  /**
   * Handles the logic for showing/hiding the custom accent picker and updating the UI's accent color.
   * @param accentValue The newly selected accent value.
   * @param accentColorMap Map of accent names to hex colors.
   */
  public handleAccentChange(accentValue: string, accentColorMap: { [key: string]: string }): void {
    const isCustom = accentValue === "custom";
    this.elements.customAccentPickerContainer.style.display = isCustom ? "grid" : "none";
    const newColor = isCustom ? this.elements.customAccentPicker.value : accentColorMap[accentValue];
    this.updateAccentColor(newColor);
  }

  /**
   * Updates the `--dynamic-accent-color` CSS variable to change the UI's theme in real-time.
   * @param newColor The new hex color to apply.
   */
  public updateAccentColor(newColor: string): void {
    document.documentElement.style.setProperty("--dynamic-accent-color", newColor);
  }

  /**
   * Sets up event listeners for the custom accent color picker and hex input.
   */
  public initializeEventListeners(): void {
    // Use 'input' for immediate UI updates and 'change' for sending to VS Code
    this.elements.customAccentPicker.addEventListener("input", (e) => {
      const newValue = (e.target as HTMLInputElement).value;
      this.elements.customAccentHexInput.value = newValue;
      this.updateAccentColor(newValue);
    });

    this.elements.customAccentPicker.addEventListener("change", (e) => {
      const newValue = (e.target as HTMLInputElement).value;
      this.vscode.postMessage({ command: COMMANDS.UPDATE_CUSTOM_ACCENT, value: newValue });
    });

    this.elements.customAccentHexInput.addEventListener("input", (e) => {
      const inputElement = e.target as HTMLInputElement;
      const newValue = inputElement.value;

      if (this.hex6Regex.test(newValue)) {
        inputElement.style.borderColor = "";
        inputElement.style.outlineColor = "";
        this.elements.customAccentPicker.value = newValue;
        this.updateAccentColor(newValue);
      } else {
        inputElement.style.borderColor = "var(--danger-color)";
        inputElement.style.outlineColor = "var(--danger-color)";
      }
    });

    this.elements.customAccentHexInput.addEventListener("change", (e) => {
      const inputElement = e.target as HTMLInputElement;
      const newValue = inputElement.value;

      if (this.hex6Regex.test(newValue)) {
        this.vscode.postMessage({ command: COMMANDS.UPDATE_CUSTOM_ACCENT, value: newValue });
      }
    });
  }
}
