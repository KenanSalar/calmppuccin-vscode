/**
 * @file The customization webview's entry point. `UIManager` holds the page's elements and the
 * last payload, and rebuilds every control from each `loadSettings`.
 */

import { ISettingsPayload, MessageToWebview, IVsCodeApi } from "../types/webview";
import { AccentController } from "./AccentController";
import { ControlFactory } from "./ControlFactory";
import { PreviewState, updatePreviewPane } from "./PreviewRenderer";
import { ProfileController } from "./ProfileController";
import { codeSnippets } from "./snippets";

// VS Code defines it in the webview, and a page may call it only once.
declare function acquireVsCodeApi(): IVsCodeApi;

/** Returns `element`, throwing with its `id` when the lookup found nothing. */
function assertElement<T extends HTMLElement>(element: T | null, id: string): T {
  if (!element) {
    throw new Error(`Required element #${id} not found in DOM`);
  }
  return element;
}

export class UIManager {
  private readonly vscode = acquireVsCodeApi();

  private readonly elements = {
    accentContainer: assertElement(document.getElementById("accent-container"), "accent-container"),
    settingsContainer: assertElement(
      document.getElementById("settings-container"),
      "settings-container",
    ),
    customAccentPickerContainer: assertElement(
      document.getElementById("custom-accent-picker-container"),
      "custom-accent-picker-container",
    ),
    flavorTitle: assertElement(document.getElementById("current-flavor"), "current-flavor"),
    customAccentPicker: assertElement(
      document.getElementById("custom-accent-picker"),
      "custom-accent-picker",
    ) as HTMLInputElement,
    customAccentHexInput: assertElement(
      document.getElementById("custom-accent-hex-input"),
      "custom-accent-hex-input",
    ) as HTMLInputElement,
    previewPane: assertElement(document.getElementById("preview-pane"), "preview-pane"),
    codePreview: assertElement(document.getElementById("code-preview"), "code-preview"),
    resetAllContainer: assertElement(
      document.getElementById("reset-all-container"),
      "reset-all-container",
    ),
    languageSelect: assertElement(
      document.getElementById("language-select"),
      "language-select",
    ) as HTMLSelectElement,
    settingsViewSelect: assertElement(
      document.getElementById("settings-view-select"),
      "settings-view-select",
    ) as HTMLSelectElement,
    dialogOverlay: assertElement(
      document.getElementById("reset-dialog-overlay"),
      "reset-dialog-overlay",
    ),
    confirmResetButton: assertElement(
      document.getElementById("dialog-confirm-button"),
      "dialog-confirm-button",
    ) as HTMLButtonElement,
    cancelResetButton: assertElement(
      document.getElementById("dialog-cancel-button"),
      "dialog-cancel-button",
    ),
    profileSelect: assertElement(
      document.getElementById("profile-select"),
      "profile-select",
    ) as HTMLSelectElement,
    profileNameInput: assertElement(
      document.getElementById("profile-name-input"),
      "profile-name-input",
    ) as HTMLInputElement,
    saveProfileBtn: assertElement(
      document.getElementById("save-profile-btn"),
      "save-profile-btn",
    ) as HTMLButtonElement,
    deleteProfileBtn: assertElement(
      document.getElementById("delete-profile-btn"),
      "delete-profile-btn",
    ) as HTMLButtonElement,
  };

  /** The last payload from the host, which the controls keep current as edits are committed. */
  private settings: ISettingsPayload | null = null;
  private previewState: PreviewState = {};
  private accentColorMap: { [key: string]: string } = {};
  private activeFlavor = "mocha";

  private readonly profileController: ProfileController;
  private readonly accentController: AccentController;
  private readonly controlFactory: ControlFactory;

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
      onPreviewUpdate: () => {
        this.updatePreviewPane();
      },
      settingsContainer: this.elements.settingsContainer,
      resetAllContainer: this.elements.resetAllContainer,
      dialogOverlay: this.elements.dialogOverlay,
    });
  }

  /** Rebuilds every control from a payload, as each `loadSettings` does. */
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

    this.accentColorMap = accentColorPalettes;
    this.activeFlavor = activeFlavor;

    // Cleared in place, since `ControlFactory` holds this object.
    for (const key of Object.keys(this.previewState)) {
      // oxlint-disable-next-line typescript/no-dynamic-delete
      delete this.previewState[key];
    }

    this.elements.accentContainer.innerHTML = "";
    this.elements.resetAllContainer.innerHTML = "";

    this.elements.flavorTitle.textContent = `Editing: ${
      this.activeFlavor.charAt(0).toUpperCase() + this.activeFlavor.slice(1)
    }`;
    this.elements.previewPane.style.backgroundColor = activeThemeBackgroundColor;

    this.profileController.populateProfileDropdown(profiles, activeProfile);
    this.profileController.updateProfileUI(activeProfile);
    this.accentController.createControls(
      currentAccent,
      accentOptions,
      customAccentColor,
      this.accentColorMap,
    );
    this.controlFactory.createResetAllButton();
    this._handleViewChange();
    this.accentController.handleAccentChange(currentAccent, this.accentColorMap);
    this.updatePreviewPane();
  }

  /** Wires the page's listeners; call it once per page load. */
  public initializeEventListeners() {
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

    this.elements.settingsViewSelect.addEventListener("change", () => {
      this._handleViewChange();
    });

    this.accentController.initializeEventListeners();
    this.profileController.initializeEventListeners();

    this.messageListener = (event: MessageEvent<MessageToWebview>) => {
      const message = event.data;
      this.populateAllSettings(message.settings);
    };
    window.addEventListener("message", this.messageListener);
  }

  public updatePreviewPane() {
    updatePreviewPane(this.elements.codePreview, this.elements.previewPane, this.previewState);
  }

  /** Rebuilds the settings grid and the preview for the selected settings view. */
  private _handleViewChange() {
    if (!this.settings) return;
    const { defaultFontStyles } = this.settings;
    const selectedView = this.elements.settingsViewSelect.value;

    this.elements.settingsContainer.innerHTML = "";
    this.elements.settingsContainer.className = "card-body";

    switch (selectedView) {
      case "syntax":
        this.controlFactory.createSettingsControls(
          this.settings.syntaxSettings,
          defaultFontStyles,
          true,
          this.activeFlavor,
        );
        this.elements.languageSelect.style.display = "";
        this.elements.languageSelect.value = "csharp";
        this.elements.codePreview.innerHTML = codeSnippets.csharp;
        break;
      case "ui":
        this.elements.settingsContainer.classList.add("view-brackets");
        this.controlFactory.createSettingsControls(
          this.settings.uiSettings,
          {},
          false,
          this.activeFlavor,
        );
        this.elements.languageSelect.style.display = "none";
        this.elements.codePreview.innerHTML = codeSnippets.ui;
        break;
      case "brackets":
        this.elements.settingsContainer.classList.add("view-brackets");
        this.controlFactory.createSettingsControls(
          this.settings.bracketSettings,
          {},
          false,
          this.activeFlavor,
        );
        this.elements.languageSelect.style.display = "none";
        this.elements.codePreview.innerHTML = codeSnippets.brackets;
        break;
      case "json":
        this.controlFactory.createSettingsControls(
          this.settings.jsonSettings,
          defaultFontStyles,
          true,
          this.activeFlavor,
        );
        this.elements.languageSelect.style.display = "none";
        this.elements.codePreview.innerHTML = codeSnippets.json;
        break;
    }
    this.updatePreviewPane();
  }

  /** Removes the message listener `initializeEventListeners` added. */
  public dispose() {
    if (this.messageListener) {
      window.removeEventListener("message", this.messageListener);
      this.messageListener = null;
    }
  }
}

// Under Jest, each test builds its own UIManager.
if (typeof process === "undefined" || process.env.JEST_WORKER_ID === undefined) {
  function initialize() {
    const uiManager = new UIManager();
    uiManager.initializeEventListeners();
  }

  initialize();
}
