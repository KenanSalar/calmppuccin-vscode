/**
 * @file The customization webview's entry point. `UIManager` holds the page's elements and the
 * last payload, and rebuilds every control from each `loadSettings`.
 */

import { ISettingsPayload, MessageToWebview, IVsCodeApi } from "../types/webview";
import { AccentController } from "./AccentController";
import { ControlFactory } from "./ControlFactory";
import { PreviewState, updatePreviewPane } from "./PreviewRenderer";
import { ProfileController } from "./ProfileController";
import { languageSnippets, viewSnippets } from "./snippets";

// VS Code defines it in the webview, and a page may call it only once.
declare function acquireVsCodeApi(): IVsCodeApi;

const DEFAULT_LANGUAGE = "csharp";

interface ISettingsView {
  settings: "syntaxSettings" | "uiSettings" | "bracketSettings" | "jsonSettings";
  /** The preview, or `undefined` for the language dropdown's choice. */
  snippet: string | undefined;
  /** The rows have no font style, so the grid drops that column. */
  colorOnly: boolean;
}

/** What each option of the settings view dropdown shows. */
const SETTINGS_VIEWS: Readonly<Record<string, ISettingsView>> = {
  syntax: { settings: "syntaxSettings", snippet: undefined, colorOnly: false },
  ui: { settings: "uiSettings", snippet: viewSnippets.ui, colorOnly: true },
  brackets: { settings: "bracketSettings", snippet: viewSnippets.brackets, colorOnly: true },
  json: { settings: "jsonSettings", snippet: viewSnippets.json, colorOnly: false },
};

/** Returns the element with `id`, throwing when it's missing or isn't a `type`. */
function requireElement<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) {
    throw new Error(`Required element #${id} is missing or isn't a ${type.name}`);
  }
  return element;
}

export class UIManager {
  private readonly vscode = acquireVsCodeApi();

  private readonly elements = {
    accentContainer: requireElement("accent-container", HTMLElement),
    settingsContainer: requireElement("settings-container", HTMLElement),
    customAccentPickerContainer: requireElement("custom-accent-picker-container", HTMLElement),
    flavorTitle: requireElement("current-flavor", HTMLElement),
    customAccentPicker: requireElement("custom-accent-picker", HTMLInputElement),
    customAccentHexInput: requireElement("custom-accent-hex-input", HTMLInputElement),
    previewPane: requireElement("preview-pane", HTMLElement),
    codePreview: requireElement("code-preview", HTMLElement),
    resetAllContainer: requireElement("reset-all-container", HTMLElement),
    languageSelect: requireElement("language-select", HTMLSelectElement),
    settingsViewSelect: requireElement("settings-view-select", HTMLSelectElement),
    dialogOverlay: requireElement("reset-dialog-overlay", HTMLElement),
    dialogTitle: requireElement("reset-dialog-title", HTMLElement),
    dialogMessage: requireElement("reset-dialog-message", HTMLElement),
    confirmResetButton: requireElement("dialog-confirm-button", HTMLButtonElement),
    cancelResetButton: requireElement("dialog-cancel-button", HTMLElement),
    profileSelect: requireElement("profile-select", HTMLSelectElement),
    profileNameInput: requireElement("profile-name-input", HTMLInputElement),
    saveProfileBtn: requireElement("save-profile-btn", HTMLButtonElement),
    deleteProfileBtn: requireElement("delete-profile-btn", HTMLButtonElement),
  };

  /** The last payload from the host, which the controls keep current as edits are committed. */
  private settings: ISettingsPayload | null = null;
  private previewState: PreviewState = {};

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
      dialogTitle: this.elements.dialogTitle,
      dialogMessage: this.elements.dialogMessage,
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

    // Cleared in place, since `ControlFactory` holds this object.
    for (const key of Object.keys(this.previewState)) {
      // oxlint-disable-next-line typescript/no-dynamic-delete
      delete this.previewState[key];
    }

    this.elements.accentContainer.innerHTML = "";
    this.elements.resetAllContainer.innerHTML = "";

    this.elements.flavorTitle.textContent = `Editing: ${
      activeFlavor.charAt(0).toUpperCase() + activeFlavor.slice(1)
    }`;
    this.elements.previewPane.style.backgroundColor = activeThemeBackgroundColor;

    this.profileController.populateProfileDropdown(profiles, activeProfile);
    this.profileController.updateProfileUI(activeProfile);
    this.accentController.createControls(
      currentAccent,
      accentOptions,
      customAccentColor,
      accentColorPalettes,
    );
    this.controlFactory.createResetAllButton();
    this._handleViewChange();
    this.accentController.handleAccentChange(currentAccent, accentColorPalettes);
    this.updatePreviewPane();
  }

  /** Wires the page's listeners; call it once per page load. */
  public initializeEventListeners() {
    for (const language of Object.keys(languageSnippets)) {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = language;
      this.elements.languageSelect.appendChild(option);
    }
    this._showLanguage(DEFAULT_LANGUAGE);
    this.elements.languageSelect.addEventListener("change", () => {
      this._showLanguage(this.elements.languageSelect.value);
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
    const viewName = this.elements.settingsViewSelect.value;
    if (!this.settings || !Object.hasOwn(SETTINGS_VIEWS, viewName)) return;
    const view = SETTINGS_VIEWS[viewName];

    this.elements.settingsContainer.innerHTML = "";
    this.elements.settingsContainer.className = view.colorOnly
      ? "card-body view-brackets"
      : "card-body";
    this.controlFactory.createSettingsControls(
      this.settings[view.settings],
      this.settings.defaultFontStyles,
      this.settings.activeFlavor,
    );

    if (view.snippet === undefined) {
      this.elements.languageSelect.style.display = "";
      this._showLanguage(DEFAULT_LANGUAGE);
    } else {
      this.elements.languageSelect.style.display = "none";
      this.elements.codePreview.innerHTML = view.snippet;
    }
    this.updatePreviewPane();
  }

  private _showLanguage(language: string) {
    this.elements.languageSelect.value = language;
    this.elements.codePreview.innerHTML = languageSnippets[language];
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
