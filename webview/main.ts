/**
 * @file This script is the entry point for the settings webview UI.
 * It handles all DOM manipulation, event listening, and communication with the VS Code extension host.
 */

import { codeSnippets } from "./snippets";
// Import the shared types from the new central location.
import { ISettingsPayload, MessageToWebview, MessageToExtension, IWebviewSetting } from "../types/webview";

/**
 * @interface IVsCodeApi
 * Defines the shape of the VS Code API object provided by `acquireVsCodeApi`.
 */
interface IVsCodeApi {
  /**
   * Posts a message from the webview to the extension host.
   * @param {MessageToExtension} message The strongly-typed message object to send.
   */
  postMessage(message: MessageToExtension): void;
}

// This special function is provided by VS Code in the webview environment to allow communication back to the extension.
declare function acquireVsCodeApi(): IVsCodeApi;

/**
 * A centralized object for all command identifiers sent to and from the webview.
 */
const COMMANDS = {
  UPDATE_SETTING: "updateSetting",
  RESET_FONT_STYLE: "resetFontStyle",
  UPDATE_ACCENT: "updateAccent",
  UPDATE_CUSTOM_ACCENT: "updateCustomAccent",
  UPDATE_SYNTAX_COLOR: "updateSyntaxColor",
  RESET_SYNTAX_COLOR: "resetSyntaxColor",
  UPDATE_UI_COLOR: "updateUiColor",
  RESET_UI_COLOR: "resetUiColor",
  RESET_ALL: "resetAll",
  LOAD_SETTINGS: "loadSettings",
} as const;

/**
 * Manages all UI elements, state, and interactions for the settings webview.
 * This class encapsulates all DOM manipulation and event handling, keeping the global scope clean.
 */
export class UIManager {
  private readonly vscode = acquireVsCodeApi();

  /** A single object to hold references to all necessary DOM elements, queried once on instantiation for performance. */
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
    settingsViewSelect: document.getElementById("settings-view-select") as HTMLSelectElement,
    dialogOverlay: document.getElementById("reset-dialog-overlay")!,
    confirmResetButton: document.getElementById("dialog-confirm-button")!,
    cancelResetButton: document.getElementById("dialog-cancel-button")!,
  };

  /** Holds the current settings payload from the extension. */
  private settings: ISettingsPayload | null = null;
  /** Holds the current styling state (color and font style) for the live preview pane. */
  private previewState: { [key: string]: { color?: string; fontStyle?: string } } = {};
  /** Caches the accent color palette for the active theme flavor. */
  private accentColorMap: { [key: string]: string } = {};
  /** Stores the name of the currently active theme flavor (e.g., "mocha"). */
  private activeFlavor = "mocha";

  private readonly fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];
  private readonly hex6Regex = /^#[0-9a-fA-F]{6}$/;
  private readonly hex8Regex = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/;

  /**
   * Builds the entire UI from scratch when settings are received from the extension.
   * @param {ISettingsPayload} settings The settings object from the VS Code extension host.
   */
  public populateAllSettings(settings: ISettingsPayload) {
    this.settings = settings;
    const {
      activeFlavor,
      currentAccent,
      accentOptions,
      customAccentColor,
      activeThemeBackgroundColor,
      accentColorPalettes,
    } = settings;

    // 1. Update internal state with the new settings.
    this.accentColorMap = accentColorPalettes;
    this.activeFlavor = activeFlavor;
    this.previewState = {};

    // 2. Clear previous UI elements to ensure a clean slate on theme change.
    this.elements.accentContainer.innerHTML = "";
    this.elements.resetAllContainer.innerHTML = "";

    // 3. Set flavor-specific UI elements.
    this.elements.flavorTitle.textContent = `Editing: ${
      this.activeFlavor.charAt(0).toUpperCase() + this.activeFlavor.slice(1)
    }`;
    this.elements.previewPane.style.backgroundColor = activeThemeBackgroundColor;

    // 4. Build each section of the UI dynamically.
    this._createAccentColorControls(currentAccent, accentOptions, customAccentColor);
    this._createResetAllButton();
    this._handleViewChange(); // This will now render the correct initial view based on the dropdown

    // 5. Apply the initial state to the UI.
    this._handleAccentChange(currentAccent);
  }

  /**
   * Sets up all initial event listeners for the webview's interactive elements.
   * This method is called only once when the script is first loaded.
   */
  public initializeEventListeners() {
    // Populate the language selector dropdown and set up its change event.
    for (const lang in codeSnippets) {
      if (lang !== "brackets" && lang !== "json" && lang !== "ui") {
        const option = document.createElement("option");
        option.value = lang;
        option.textContent = lang;
        this.elements.languageSelect.appendChild(option);
      }
    }
    this.elements.languageSelect.value = "csharp";
    this.elements.codePreview.innerHTML = codeSnippets.csharp;
    this.elements.languageSelect.addEventListener("change", (e) => {
      const selectedLanguage = (e.target as HTMLSelectElement).value as keyof typeof codeSnippets;
      this.elements.codePreview.innerHTML = codeSnippets[selectedLanguage];
      this.updatePreviewPane();
    });

    // Listen for changes on the settings view dropdown.
    this.elements.settingsViewSelect.addEventListener("change", () => {
      this._handleViewChange();
    });

    // Listen for changes on the custom accent color pickers.
    this.elements.customAccentPicker.addEventListener("input", (e) => {
      const newValue = (e.target as HTMLInputElement).value;
      this.elements.customAccentHexInput.value = newValue;
      this.updateAccentColor(newValue);
      this.vscode.postMessage({ command: COMMANDS.UPDATE_CUSTOM_ACCENT, value: newValue });
    });

    this.elements.customAccentHexInput.addEventListener("input", (e) => {
      const inputElement = e.target as HTMLInputElement;
      const newValue = inputElement.value;

      // Validate the input against a 6-digit hex regex.
      if (this.hex6Regex.test(newValue)) {
        // If valid, remove any error styling.
        inputElement.style.borderColor = "";
        inputElement.style.outlineColor = "";

        // Sync the color picker swatch with the typed value.
        this.elements.customAccentPicker.value = newValue;
        // Update the live UI accent color.
        this.updateAccentColor(newValue);
        // Send the valid color to the extension host to be saved.
        this.vscode.postMessage({ command: COMMANDS.UPDATE_CUSTOM_ACCENT, value: newValue });
      } else {
        // If invalid, apply error styling for immediate user feedback.
        inputElement.style.borderColor = "var(--danger-color)";
        inputElement.style.outlineColor = "var(--danger-color)";
      }
    });

    // Set up listeners for the confirmation dialog.
    this.elements.cancelResetButton.addEventListener("click", () => this.elements.dialogOverlay.classList.add("hidden"));
    this.elements.dialogOverlay.addEventListener("click", (e) => {
      if (e.target === this.elements.dialogOverlay) this.elements.dialogOverlay.classList.add("hidden");
    });
    this.elements.confirmResetButton.addEventListener("click", () => {
      this.vscode.postMessage({ command: COMMANDS.RESET_ALL });
      this.elements.dialogOverlay.classList.add("hidden");
    });

    // Primary listener for messages coming from the VS Code extension host.
    window.addEventListener("message", (event: MessageEvent<MessageToWebview>) => {
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
   * Iterates through the `previewState` object and applies the current color and font styles
   * to all matching tokens in the code preview pane.
   */
  public updatePreviewPane() {
    for (const tokenKey in this.previewState) {
      const elements = this.elements.codePreview.querySelectorAll<HTMLElement>(`[data-token="${tokenKey}"]`);
      elements.forEach((el) => {
        const tokenStyle = this.previewState[tokenKey];
        if (tokenStyle.color) {
          if (["base", "mantle", "crust"].includes(tokenKey)) {
            el.style.backgroundColor = tokenStyle.color;
            if (tokenKey === "crust") {
              this.elements.previewPane.style.backgroundColor = tokenStyle.color;
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

  /**
   * Handles the logic for showing/hiding the custom accent picker and updating the UI's accent color.
   * @param {string} accentValue The newly selected accent value.
   * @private
   */
  private _handleAccentChange(accentValue: string) {
    const isCustom = accentValue === "custom";
    this.elements.customAccentPickerContainer.style.display = isCustom ? "grid" : "none";
    const newColor = isCustom ? this.elements.customAccentPicker.value : this.accentColorMap[accentValue];
    this.updateAccentColor(newColor);
  }

  /**
   * Updates the `--dynamic-accent-color` CSS variable to change the UI's theme in real-time.
   * @param {string} newColor The new hex color to apply.
   * @private
   */
  private updateAccentColor(newColor: string) {
    document.documentElement.style.setProperty("--dynamic-accent-color", newColor);
  }

  /**
   * Dynamically creates the Accent Color dropdown and the custom color picker controls.
   * @private
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
      if (currentAccent === option) {
        optionElement.selected = true;
      }
      accentSelect.appendChild(optionElement);
    });

    accentSelect.addEventListener("change", (e) => {
      const newValue = (e.target as HTMLSelectElement).value;
      this._handleAccentChange(newValue);
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
   * Handles the change of the settings view dropdown, rebuilding the settings grid and updating the preview.
   * @private
   */
  private _handleViewChange() {
    if (!this.settings) return;
    const { defaultFontStyles } = this.settings;
    const selectedView = this.elements.settingsViewSelect.value;

    // Clear the container and reset its classes to the default
    this.elements.settingsContainer.innerHTML = "";
    this.elements.settingsContainer.className = "card-body";
    (document.getElementById("settings-container") as HTMLElement).id = "settings-container"; // Ensure base ID is present

    switch (selectedView) {
      case "syntax":
        // Uses the default 3-column layout, no extra class needed.
        this._createSyntaxControls(this.settings.syntaxSettings, defaultFontStyles, true);
        this.elements.languageSelect.style.display = ""; // Show language selector
        this.elements.languageSelect.value = "csharp";
        this.elements.codePreview.innerHTML = codeSnippets.csharp;
        break;
      case "ui":
        this.elements.settingsContainer.classList.add("view-brackets");
        this._createSyntaxControls(this.settings.uiSettings, {}, false);
        this.elements.languageSelect.style.display = "none";
        this.elements.codePreview.innerHTML = codeSnippets.ui;
        break;
      case "brackets":
        // Add a class to switch to a 2-column layout.
        this.elements.settingsContainer.classList.add("view-brackets");
        // Create controls without font styles.
        this._createSyntaxControls(this.settings.bracketSettings, {}, false);
        this.elements.languageSelect.style.display = "none"; // Hide language selector
        this.elements.codePreview.innerHTML = codeSnippets.brackets;
        break;
      case "json":
        // Uses the default 3-column layout.
        this._createSyntaxControls(this.settings.jsonSettings, defaultFontStyles, true);
        this.elements.languageSelect.style.display = "none"; // Hide language selector
        this.elements.codePreview.innerHTML = codeSnippets.json;
        break;
    }
    // Update the preview pane after changing the view and its content
    this.updatePreviewPane();
  }

  /**
   * Dynamically creates the grid of controls for font styles and syntax colors.
   * @param {IWebviewSetting[]} settings An array of the syntax settings to build controls for.
   * @param {{ [key: string]: string }} defaultFontStyles An object containing the default font styles.
   * @param {boolean} includeFontStyles Whether to include font style controls.
   * @private
   */
  private _createSyntaxControls(
    settings: IWebviewSetting[],
    defaultFontStyles: { [key: string]: string },
    includeFontStyles: boolean
  ) {
    // Loop through each customizable syntax item (e.g., comment, keyword, etc.).
    settings.forEach((setting) => {
      const { key, fontStyle, color, defaultColor } = setting;
      const fontStyleKey = `${key}FontStyle`;
      const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";

      // Initialize the live preview state for this syntax token.
      this.previewState[key] = { color, fontStyle };

      // Create and configure the label for this setting.
      const label = document.createElement("label");
      label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
      label.htmlFor = key;

      let fontContainer: HTMLElement | null = null;
      if (includeFontStyles && fontStyle !== undefined) {
        fontContainer = this._createFontStyleControl(key, fontStyle, defaultFontStyle, fontStyleKey);
      }

      const colorContainer = this._createColorPickerControl(key, color || "", defaultColor);

      // Add the new elements to the settings grid in the DOM.
      this.elements.settingsContainer.appendChild(label);
      if (fontContainer) {
        this.elements.settingsContainer.appendChild(fontContainer);
      }
      this.elements.settingsContainer.appendChild(colorContainer);
    });
  }

  /**
   * Creates an individual font style dropdown control with its associated reset button.
   * @returns {HTMLElement} The container element for the font style control.
   * @private
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
      this.vscode.postMessage({ command: COMMANDS.UPDATE_SETTING, key: fontStyleKey, value: newValue });
    });

    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "reset-button";
    resetButton.addEventListener("click", () => {
      select.value = defaultFontStyle;
      this.previewState[key].fontStyle = defaultFontStyle;
      this.updatePreviewPane();
      this.vscode.postMessage({ command: COMMANDS.RESET_FONT_STYLE, key: fontStyleKey });
    });

    container.appendChild(select);
    container.appendChild(resetButton);
    return container;
  }

  /**
   * Creates an individual color picker control with its alpha slider and reset button.
   * @returns {HTMLElement} The container element for the color picker.
   * @private
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
      this.previewState[key].color = finalColor;
      this.updatePreviewPane();
    };

    // --- Helper function to send the final color to the extension backend ---
    const sendFinalColorToVSCode = () => {
      const command = isUiColor ? COMMANDS.UPDATE_UI_COLOR : COMMANDS.UPDATE_SYNTAX_COLOR;
      this.vscode.postMessage({
        command: command,
        flavor: this.activeFlavor,
        key,
        value: hexInput.value,
      });
    };

    // --- Event Listeners ---

    // Listen for changes on the color swatch and alpha slider
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
        // If the typed value is a valid hex code
        hexInput.style.borderColor = "";
        hexInput.style.outlineColor = "";

        const rgb = match[1] ? `#${match[1]}` : "#000000";
        const alphaHex = match[2] ?? "ff"; // Default to 'ff' (opaque) if alpha is not provided
        const alphaDecimal = parseInt(alphaHex, 16);

        // Update the color picker and slider to match the typed input
        colorInput.value = rgb;
        if (!isUiColor) {
          alphaSlider.value = alphaDecimal.toString();
        }

        // Update the live preview
        this.previewState[key].color = typedValue;
        this.updatePreviewPane();
      } else {
        // If the typed value is invalid, show an error state
        hexInput.style.borderColor = "var(--danger-color)";
        hexInput.style.outlineColor = "var(--danger-color)";
      }
    });

    // --- NEW: Send the final value to the backend when the user is done editing ---
    hexInput.addEventListener("change", () => {
      const regex = isUiColor ? this.hex6Regex : this.hex8Regex;
      // Only send the message if the final value is valid
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
      this.previewState[key].color = defaultColor;
      this.updatePreviewPane();
      const command = isUiColor ? COMMANDS.RESET_UI_COLOR : COMMANDS.RESET_SYNTAX_COLOR;
      this.vscode.postMessage({ command, flavor: this.activeFlavor, key });
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

  /**
   * Creates the "Reset All" button in the Danger Zone.
   * @private
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
}

// This conditional check ensures this block of code ONLY runs in the browser/webview context
// and is completely ignored when the file is imported by Jest.
if (typeof process === "undefined" || process.env.JEST_WORKER_ID === undefined) {
  /**
   * Main entry point for the webview script.
   * This function instantiates the UIManager and sets up all event listeners.
   */
  function initialize() {
    const uiManager = new UIManager();
    uiManager.initializeEventListeners();
  }

  // Start the application.
  initialize();
}
