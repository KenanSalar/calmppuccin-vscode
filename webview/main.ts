import { codeSnippets } from "./snippets";

interface VsCodeApi {
  postMessage(message: any): void;
}
declare function acquireVsCodeApi(): VsCodeApi;
const vscode = acquireVsCodeApi();

// A centralized object for all commands sent to and from the webview.
const COMMANDS = {
  UPDATE_SETTING: "updateSetting",
  RESET_FONT_STYLE: "resetFontStyle",
  UPDATE_ACCENT: "updateAccent",
  UPDATE_CUSTOM_ACCENT: "updateCustomAccent",
  UPDATE_SYNTAX_COLOR: "updateSyntaxColor",
  RESET_SYNTAX_COLOR: "resetSyntaxColor",
  RESET_ALL: "resetAll",
  LOAD_SETTINGS: "loadSettings",
};

/**
 * Manages all UI elements, state, and interactions for the settings webview.
 * This class encapsulates all DOM manipulation and event handling, keeping the global scope clean.
 */
class UIManager {
  // A single object to hold references to all necessary DOM elements, queried once on instantiation.
  private readonly elements = {
    accentContainer: document.getElementById("accent-container")!,
    settingsContainer: document.getElementById("settings-container")!,
    customAccentPickerContainer: document.getElementById("custom-accent-picker-container")!,
    flavorTitle: document.getElementById("current-flavor")!,
    customAccentPicker: document.getElementById("custom-accent-picker") as HTMLInputElement,
    customAccentHexInput: document.getElementById("custom-accent-hex-input") as HTMLInputElement,
    previewPane: document.getElementById("preview-pane")!,
    codePreview: document.getElementById("code-preview")!,
    resetAllContainer: document.getElementById("reset-all-container")!,
    languageSelect: document.getElementById("language-select") as HTMLSelectElement,
    dialogOverlay: document.getElementById("reset-dialog-overlay")!,
    confirmResetButton: document.getElementById("dialog-confirm-button")!,
    cancelResetButton: document.getElementById("dialog-cancel-button")!,
  };

  // Holds the current styling state for the live preview pane.
  private previewState: { [key: string]: { color?: string; fontStyle?: string } } = {};
  // Caches the accent color palette for the active theme flavor.
  private accentColorMap: { [key: string]: string } = {};
  // Stores the name of the currently active theme flavor (e.g., "mocha").
  private activeFlavor = "mocha";

  private readonly fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];
  private readonly hex6Regex = /^#[0-9a-fA-F]{6}$/;

  /**
   * Main method to build the entire UI when settings are received from the extension.
   * @param settings - The settings object from the VS Code extension.
   */
  public populateAllSettings(settings: any) {
    const {
      activeFlavor,
      syntaxSettings,
      currentAccent,
      accentOptions,
      customAccentColor,
      activeThemeBackgroundColor,
      accentColorPalettes,
    } = settings;

    // 1. Update internal state
    this.accentColorMap = accentColorPalettes;
    this.activeFlavor = activeFlavor;
    this.previewState = {};

    // 2. Clear previous UI elements to ensure a clean slate
    this.elements.accentContainer.innerHTML = "";
    this.elements.settingsContainer.innerHTML = "";
    this.elements.resetAllContainer.innerHTML = "";

    // 3. Set flavor-specific UI elements
    this.elements.flavorTitle.textContent = `Editing: ${
      this.activeFlavor.charAt(0).toUpperCase() + this.activeFlavor.slice(1)
    }`;
    this.elements.previewPane.style.backgroundColor = activeThemeBackgroundColor;

    // 4. Build each section of the UI
    this._createAccentColorControls(currentAccent, accentOptions, customAccentColor);
    this._createSyntaxControls(syntaxSettings, settings.defaultFontStyles);
    this._createResetAllButton();

    // 5. Apply the initial state to the UI
    this.updatePreviewPane();
    this._handleAccentChange(currentAccent);
  }

  /**
   * Sets up all initial event listeners for the webview.
   */
  public initializeEventListeners() {
    // Populate language selector and set up its change event
    for (const lang in codeSnippets) {
      const option = document.createElement("option");
      option.value = lang;
      option.textContent = lang;
      this.elements.languageSelect.appendChild(option);
    }
    this.elements.languageSelect.value = "csharp";
    this.elements.codePreview.innerHTML = codeSnippets.csharp;
    this.elements.languageSelect.addEventListener("change", (e) => {
      const selectedLanguage = (e.target as HTMLSelectElement).value;
      this.elements.codePreview.innerHTML = codeSnippets[selectedLanguage];
      this.updatePreviewPane();
    });

    // Listen for changes on the custom accent color pickers
    this.elements.customAccentPicker.addEventListener("input", (e) => {
      const newValue = (e.target as HTMLInputElement).value;
      this.elements.customAccentHexInput.value = newValue;
      this.updateAccentColor(newValue);
      vscode.postMessage({ command: COMMANDS.UPDATE_CUSTOM_ACCENT, value: newValue });
    });
    this.elements.customAccentHexInput.addEventListener("input", (e) => {
      const newValue = (e.target as HTMLInputElement).value;
      if (this.hex6Regex.test(newValue)) {
        this.elements.customAccentPicker.value = newValue;
        this.updateAccentColor(newValue);
        vscode.postMessage({ command: COMMANDS.UPDATE_CUSTOM_ACCENT, value: newValue });
      }
    });

    // Set up listeners for the confirmation dialog
    this.elements.cancelResetButton.addEventListener("click", () => this.elements.dialogOverlay.classList.add("hidden"));
    this.elements.dialogOverlay.addEventListener("click", (e) => {
      if (e.target === this.elements.dialogOverlay) this.elements.dialogOverlay.classList.add("hidden");
    });
    this.elements.confirmResetButton.addEventListener("click", () => {
      vscode.postMessage({ command: COMMANDS.RESET_ALL });
      this.elements.dialogOverlay.classList.add("hidden");
    });

    // Primary listener for messages coming from the VS Code extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === COMMANDS.LOAD_SETTINGS) {
        this.populateAllSettings(message.settings);
      }
    });

    // Trigger the initial fade-in animation for the dialog overlay
    setTimeout(() => {
      this.elements.dialogOverlay.style.opacity = "";
      this.elements.dialogOverlay.style.pointerEvents = "";
    }, 50);
  }

  /**
   * Iterates through the previewState and applies the current color and font styles
   * to all matching tokens in the code preview pane.
   */
  public updatePreviewPane() {
    for (const tokenKey in this.previewState) {
      const elements = this.elements.codePreview.querySelectorAll<HTMLElement>(`[data-token="${tokenKey}"]`);
      elements.forEach((el) => {
        const tokenStyle = this.previewState[tokenKey];
        if (tokenStyle.color) {
          el.style.color = tokenStyle.color;
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

  /**
   * Helper method to create the Accent Color dropdown and the custom color picker.
   */
  private _createAccentColorControls(currentAccent: string, accentOptions: string[], customAccentColor: string) {
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
      if (currentAccent === option) optionElement.selected = true;
      accentSelect.appendChild(optionElement);
    });

    accentSelect.addEventListener("change", (e) => {
      const newValue = (e.target as HTMLSelectElement).value;
      this._handleAccentChange(newValue);
      vscode.postMessage({ command: COMMANDS.UPDATE_ACCENT, value: newValue });
    });

    accentSelectContainer.appendChild(accentLabel);
    accentSelectContainer.appendChild(accentSelect);
    this.elements.accentContainer.insertBefore(accentSelectContainer, this.elements.customAccentPickerContainer);

    this.elements.customAccentPicker.value = customAccentColor;
    this.elements.customAccentHexInput.value = customAccentColor;
    this.elements.customAccentHexInput.maxLength = 7;
  }

  /**
   * Helper method to create the grid of controls for font styles and syntax colors.
   */
  private _createSyntaxControls(syntaxSettings: any[], defaultFontStyles: any) {
    syntaxSettings.forEach((setting: any) => {
      const { key, fontStyle, color, defaultColor } = setting;
      const fontStyleKey = `${key}FontStyle`;
      const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";

      this.previewState[key] = { color, fontStyle };

      const label = document.createElement("label");
      label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
      label.htmlFor = key;

      const fontContainer = this._createFontStyleControl(key, fontStyle, defaultFontStyle, fontStyleKey);
      const colorContainer = this._createColorPickerControl(key, color, defaultColor);

      this.elements.settingsContainer.appendChild(label);
      this.elements.settingsContainer.appendChild(fontContainer);
      this.elements.settingsContainer.appendChild(colorContainer);
    });
  }

  /**
   * Helper method that creates an individual font style dropdown with its reset button.
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
      this.previewState[key].fontStyle = newValue;
      this.updatePreviewPane();
      vscode.postMessage({ command: COMMANDS.UPDATE_SETTING, key: fontStyleKey, value: newValue });
    });

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "reset-button";
    resetButton.addEventListener("click", () => {
      select.value = defaultFontStyle;
      this.previewState[key].fontStyle = defaultFontStyle;
      this.updatePreviewPane();
      vscode.postMessage({ command: COMMANDS.RESET_FONT_STYLE, key: fontStyleKey });
    });

    container.appendChild(select);
    container.appendChild(resetButton);
    return container;
  }

  /**
   * Helper method that creates an individual color picker with its alpha slider and reset button.
   */
  private _createColorPickerControl(key: string, color: string, defaultColor: string): HTMLElement {
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
    hexInput.readOnly = true;
    const alphaSlider = document.createElement("input");
    alphaSlider.type = "range";
    alphaSlider.min = "0";
    alphaSlider.max = "255";
    alphaSlider.step = "1";

    const initialColor = color || "#ffffffff";
    const rgb = initialColor.substring(0, 7);
    const alphaHex = initialColor.length === 9 ? initialColor.substring(7, 9) : "ff";
    colorInput.value = rgb;
    alphaSlider.value = parseInt(alphaHex, 16).toString();
    hexInput.value = initialColor;

    const updateLivePreview = () => {
      const newRgb = colorInput.value;
      const newAlphaHex = parseInt(alphaSlider.value).toString(16).padStart(2, "0");
      const finalColor = `${newRgb}${newAlphaHex}`;
      hexInput.value = finalColor;
      this.previewState[key].color = finalColor;
      this.updatePreviewPane();
    };

    const sendFinalColorToVSCode = () => {
      vscode.postMessage({ command: COMMANDS.UPDATE_SYNTAX_COLOR, flavor: this.activeFlavor, key, value: hexInput.value });
    };

    colorInput.addEventListener("input", updateLivePreview);
    alphaSlider.addEventListener("input", updateLivePreview);
    colorInput.addEventListener("change", sendFinalColorToVSCode);
    alphaSlider.addEventListener("change", sendFinalColorToVSCode);

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "reset-button";
    resetButton.addEventListener("click", () => {
      const defaultRgb = defaultColor.substring(0, 7);
      const defaultAlphaHex = defaultColor.length === 9 ? defaultColor.substring(7, 9) : "ff";
      colorInput.value = defaultRgb;
      alphaSlider.value = parseInt(defaultAlphaHex, 16).toString();
      hexInput.value = defaultColor;
      this.previewState[key].color = defaultColor;
      this.updatePreviewPane();
      vscode.postMessage({ command: COMMANDS.RESET_SYNTAX_COLOR, flavor: this.activeFlavor, key });
    });

    topRow.appendChild(colorInput);
    topRow.appendChild(hexInput);
    wrapper.appendChild(topRow);
    wrapper.appendChild(alphaSlider);
    container.appendChild(wrapper);
    container.appendChild(resetButton);

    return container;
  }

  /**
   * Helper method to create the "Reset All" button in the Danger Zone.
   */
  private _createResetAllButton() {
    const resetAllButton = document.createElement("button");
    resetAllButton.textContent = "Reset All Settings to Default";
    resetAllButton.className = "reset-all-button";
    resetAllButton.addEventListener("click", () => {
      this.elements.dialogOverlay.classList.remove("hidden");
    });
    this.elements.resetAllContainer.appendChild(resetAllButton);
  }

  /**
   * Handles the logic for showing/hiding the custom accent picker and updating the UI's accent color.
   */
  private _handleAccentChange(accentValue: string) {
    const isCustom = accentValue === "custom";
    this.elements.customAccentPickerContainer.style.display = isCustom ? "grid" : "none";
    const newColor = isCustom ? this.elements.customAccentPicker.value : this.accentColorMap[accentValue];
    this.updateAccentColor(newColor);
  }

  /**
   * Updates the --dynamic-accent-color CSS variable to change the UI's theme in real-time.
   */
  private updateAccentColor(newColor: string) {
    document.documentElement.style.setProperty("--dynamic-accent-color", newColor);
  }
}

/**
 * Main entry point for the webview script.
 * This function instantiates the UIManager and sets up all event listeners.
 */
function initialize() {
  const uiManager = new UIManager();
  uiManager.initializeEventListeners();
}

initialize();
