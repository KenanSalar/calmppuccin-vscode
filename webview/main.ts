/**
 * @file This script is the entry point for the settings webview UI.
 * UIManager orchestrates extracted controllers for accent, controls, preview, and profiles.
 */

import { codeSnippets } from "./snippets";
import { ISettingsPayload, MessageToWebview, IVsCodeApi } from "../types/webview";
import { ProfileController } from "./ProfileController";
import { PreviewState, updatePreviewPane } from "./PreviewRenderer";
import { ControlFactory } from "./ControlFactory";
import { AccentController } from "./AccentController";

// This special function is provided by VS Code in the webview environment to allow communication back to the extension.
declare function acquireVsCodeApi(): IVsCodeApi;

/**
 * Asserts that a DOM element exists and returns it with the correct type.
 * @param element The element or null from document.getElementById
 * @param id The element ID for error messages
 * @returns The element, guaranteed non-null
 */
function assertElement<T extends HTMLElement>(element: T | null, id: string): T {
  if (!element) {
    throw new Error(`Required element #${id} not found in DOM`);
  }
  return element;
}

/**
 * Manages all UI elements, state, and interactions for the settings webview.
 * Orchestrates AccentController, ControlFactory, PreviewRenderer, and ProfileController.
 */
export class UIManager {
  private readonly vscode = acquireVsCodeApi();

  /** A single object to hold references to all necessary DOM elements, queried once on instantiation for performance. */
  private readonly elements = {
    accentContainer: assertElement(document.getElementById("accent-container"), "accent-container"),
    settingsContainer: assertElement(document.getElementById("settings-container"), "settings-container"),
    customAccentPickerContainer: assertElement(document.getElementById("custom-accent-picker-container"), "custom-accent-picker-container"),
    flavorTitle: assertElement(document.getElementById("current-flavor"), "current-flavor"),
    customAccentPicker: assertElement(document.getElementById("custom-accent-picker"), "custom-accent-picker") as HTMLInputElement,
    customAccentHexInput: assertElement(document.getElementById("custom-accent-hex-input"), "custom-accent-hex-input") as HTMLInputElement,
    previewPane: assertElement(document.getElementById("preview-pane"), "preview-pane"),
    codePreview: assertElement(document.getElementById("code-preview"), "code-preview"),
    resetAllContainer: assertElement(document.getElementById("reset-all-container"), "reset-all-container"),
    languageSelect: assertElement(document.getElementById("language-select"), "language-select") as HTMLSelectElement,
    settingsViewSelect: assertElement(document.getElementById("settings-view-select"), "settings-view-select") as HTMLSelectElement,
    dialogOverlay: assertElement(document.getElementById("reset-dialog-overlay"), "reset-dialog-overlay"),
    confirmResetButton: assertElement(document.getElementById("dialog-confirm-button"), "dialog-confirm-button") as HTMLButtonElement,
    cancelResetButton: assertElement(document.getElementById("dialog-cancel-button"), "dialog-cancel-button"),
    profileSelect: assertElement(document.getElementById("profile-select"), "profile-select") as HTMLSelectElement,
    profileNameInput: assertElement(document.getElementById("profile-name-input"), "profile-name-input") as HTMLInputElement,
    saveProfileBtn: assertElement(document.getElementById("save-profile-btn"), "save-profile-btn") as HTMLButtonElement,
    deleteProfileBtn: assertElement(document.getElementById("delete-profile-btn"), "delete-profile-btn") as HTMLButtonElement,
  };

  /** Holds the current settings payload from the extension. */
  private settings: ISettingsPayload | null = null;
  /** Holds the current styling state (color and font style) for the live preview pane. */
  private previewState: PreviewState = {};
  /** Caches the accent color palette for the active theme flavor. */
  private accentColorMap: { [key: string]: string } = {};
  /** Stores the name of the currently active theme flavor (e.g., "mocha"). */
  private activeFlavor = "mocha";

  /** Controller for profile management operations. */
  private readonly profileController: ProfileController;
  /** Controller for accent color management. */
  private readonly accentController: AccentController;
  /** Factory for creating settings controls. */
  private readonly controlFactory: ControlFactory;

  /** Reference to the message event listener for cleanup. */
  private messageListener: ((event: MessageEvent<MessageToWebview>) => void) | null = null;

  constructor() {
    this.profileController = new ProfileController(this.vscode, {
      profileSelect: this.elements.profileSelect,
      profileNameInput: this.elements.profileNameInput,
      saveProfileBtn: this.elements.saveProfileBtn,
      deleteProfileBtn: this.elements.deleteProfileBtn,
      dialogOverlay: this.elements.dialogOverlay,
      confirmResetButton: this.elements.confirmResetButton,
      cancelResetButton: this.elements.cancelResetButton,
    });

    this.accentController = new AccentController(this.vscode, {
      accentContainer: this.elements.accentContainer,
      customAccentPickerContainer: this.elements.customAccentPickerContainer,
      customAccentPicker: this.elements.customAccentPicker,
      customAccentHexInput: this.elements.customAccentHexInput,
    });

    this.controlFactory = new ControlFactory({
      vscode: this.vscode,
      previewState: this.previewState,
      onPreviewUpdate: () => { this.updatePreviewPane(); },
      settingsContainer: this.elements.settingsContainer,
      resetAllContainer: this.elements.resetAllContainer,
      dialogOverlay: this.elements.dialogOverlay,
    });
  }

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
      profiles,
      activeProfile,
    } = settings;

    // 1. Update internal state with the new settings.
    this.accentColorMap = accentColorPalettes;
    this.activeFlavor = activeFlavor;

    // Reset previewState by clearing all keys and keeping the same object reference
    // (ControlFactory holds a reference to this.previewState).
    for (const key of Object.keys(this.previewState)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.previewState[key];
    }

    // 2. Clear previous UI elements to ensure a clean slate on theme change.
    this.elements.accentContainer.innerHTML = "";
    this.elements.resetAllContainer.innerHTML = "";

    // 3. Set flavor-specific UI elements.
    this.elements.flavorTitle.textContent = `Editing: ${
      this.activeFlavor.charAt(0).toUpperCase() + this.activeFlavor.slice(1)
    }`;
    this.elements.previewPane.style.backgroundColor = activeThemeBackgroundColor;

    // 4. Build each section of the UI dynamically.
    this.profileController.populateProfileDropdown(profiles, activeProfile);
    this.profileController.updateProfileUI(activeProfile);
    this.accentController.createControls(currentAccent, accentOptions, customAccentColor, this.accentColorMap);
    this.controlFactory.createResetAllButton();
    this._handleViewChange();

    // 5. Apply the initial state to the UI.
    this.accentController.handleAccentChange(currentAccent, this.accentColorMap);

    // 6. Ensure the preview pane is updated with the new settings
    this.updatePreviewPane();
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

    // Delegate accent event listeners to AccentController.
    this.accentController.initializeEventListeners();

    // Set up profile management event listeners (delegated to ProfileController).
    // This includes dialog confirm/cancel/dismiss handlers.
    this.profileController.initializeEventListeners();

    // Primary listener for messages coming from the VS Code extension host.
    this.messageListener = (event: MessageEvent<MessageToWebview>) => {
      const message = event.data;
      this.populateAllSettings(message.settings);
    };
    window.addEventListener("message", this.messageListener);

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
    updatePreviewPane(this.elements.codePreview, this.elements.previewPane, this.previewState);
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
        this.controlFactory.createSettingsControls(this.settings.syntaxSettings, defaultFontStyles, true, this.activeFlavor);
        this.elements.languageSelect.style.display = "";
        this.elements.languageSelect.value = "csharp";
        this.elements.codePreview.innerHTML = codeSnippets.csharp;
        break;
      case "ui":
        this.elements.settingsContainer.classList.add("view-brackets");
        this.controlFactory.createSettingsControls(this.settings.uiSettings, {}, false, this.activeFlavor);
        this.elements.languageSelect.style.display = "none";
        this.elements.codePreview.innerHTML = codeSnippets.ui;
        break;
      case "brackets":
        this.elements.settingsContainer.classList.add("view-brackets");
        this.controlFactory.createSettingsControls(this.settings.bracketSettings, {}, false, this.activeFlavor);
        this.elements.languageSelect.style.display = "none";
        this.elements.codePreview.innerHTML = codeSnippets.brackets;
        break;
      case "json":
        this.controlFactory.createSettingsControls(this.settings.jsonSettings, defaultFontStyles, true, this.activeFlavor);
        this.elements.languageSelect.style.display = "none";
        this.elements.codePreview.innerHTML = codeSnippets.json;
        break;
    }
    // Update the preview pane after changing the view and its content
    this.updatePreviewPane();
  }

  /**
   * Cleans up event listeners to prevent memory leaks.
   * Should be called when the webview is disposed.
   */
  public dispose() {
    if (this.messageListener) {
      window.removeEventListener("message", this.messageListener);
      this.messageListener = null;
    }
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
