/**
 * @file ProfileController handles profile management UI operations in the webview.
 * @description Extracted from UIManager to follow Single Responsibility Principle.
 * Manages profile dropdown population, UI state updates, and delete confirmation dialogs.
 */

import { IProfile, IVsCodeApi } from "../types/webview";
import { WEBVIEW_CONSTANTS } from "../src/constants";

/** Interface for DOM element references needed by ProfileController. */
export interface IProfileElements {
  profileSelect: HTMLSelectElement;
  profileNameInput: HTMLInputElement;
  saveProfileBtn: HTMLButtonElement;
  deleteProfileBtn: HTMLButtonElement;
  dialogOverlay: HTMLElement;
  confirmResetButton: HTMLButtonElement;
  cancelResetButton: HTMLElement;
}

/**
 * Manages profile-related UI operations including dropdown population,
 * state management, and delete confirmation dialogs.
 */
export class ProfileController {
  private readonly vscode: IVsCodeApi;
  private readonly elements: IProfileElements;

  /** When non-null, the confirm button dispatches deleteProfile instead of resetAll. */
  private _pendingDeleteProfile: string | null = null;

  /** Cached original dialog text, read once from the DOM in the constructor. */
  private readonly _originalDialogTitle: string;
  private readonly _originalDialogMessage: string;
  private readonly _originalConfirmText: string;

  /**
   * Creates a new ProfileController instance.
   * @param {IVsCodeApi} vscode The VS Code API for messaging.
   * @param {IProfileElements} elements DOM element references.
   */
  constructor(vscode: IVsCodeApi, elements: IProfileElements) {
    this.vscode = vscode;
    this.elements = elements;

    // Cache the original dialog text so we can restore it after delete confirmations.
    this._originalDialogTitle = elements.dialogOverlay.querySelector("h3")?.textContent ?? "Confirm Reset";
    this._originalDialogMessage = elements.dialogOverlay.querySelector("p")?.textContent ?? "";
    this._originalConfirmText = elements.confirmResetButton.textContent;
  }

  /**
   * Sets up event listeners for profile management controls.
   */
  public initializeEventListeners(): void {
    this.elements.profileSelect.addEventListener("change", (e) => {
      const selectedProfile = (e.target as HTMLSelectElement).value;
      this.updateProfileUI(selectedProfile);
      this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.SWITCH_PROFILE, profile: selectedProfile });
    });

    this.elements.saveProfileBtn.addEventListener("click", () => {
      const profileName = this.elements.profileNameInput.value.trim();
      if (profileName && profileName !== "Default") {
        this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.SAVE_PROFILE, profile: profileName });
      }
    });

    this.elements.deleteProfileBtn.addEventListener("click", () => {
      const currentProfile = this.elements.profileSelect.value;
      if (currentProfile !== "Default") {
        this.showDeleteConfirmation(currentProfile);
      }
    });

    // Dialog confirm button: dispatches deleteProfile or resetAll based on state.
    this.elements.confirmResetButton.addEventListener("click", () => {
      if (this._pendingDeleteProfile) {
        this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.DELETE_PROFILE, profile: this._pendingDeleteProfile });
      } else {
        this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.RESET_ALL });
      }
      this.elements.dialogOverlay.classList.add("hidden");
      this._resetDialogState();
    });

    // Dialog cancel button.
    this.elements.cancelResetButton.addEventListener("click", () => {
      this.elements.dialogOverlay.classList.add("hidden");
      this._resetDialogState();
    });

    // Click-outside dismissal.
    this.elements.dialogOverlay.addEventListener("click", (e) => {
      if (e.target === this.elements.dialogOverlay) {
        this.elements.dialogOverlay.classList.add("hidden");
        this._resetDialogState();
      }
    });
  }

  /**
   * Populates the profile dropdown with available profiles.
   * @param {Object} profiles The profiles object from settings.
   * @param {string} activeProfile The currently active profile name.
   */
  public populateProfileDropdown(profiles: { [name: string]: IProfile }, activeProfile: string): void {
    // Clear existing options
    this.elements.profileSelect.innerHTML = "";

    // Add Default profile option (only if it's not already in profiles)
    if (!Object.prototype.hasOwnProperty.call(profiles, "Default")) {
      const defaultOption = document.createElement("option");
      defaultOption.value = "Default";
      defaultOption.textContent = "Default";
      this.elements.profileSelect.appendChild(defaultOption);
    }

    // Add all profiles (including Default if it exists in profiles)
    Object.keys(profiles).sort().forEach((profileName) => {
      const option = document.createElement("option");
      option.value = profileName;
      option.textContent = profileName;
      this.elements.profileSelect.appendChild(option);
    });

    // Set the selected profile
    this.elements.profileSelect.value = activeProfile;
  }

  /**
   * Updates the profile management UI based on the selected profile.
   * @param {string} selectedProfile The currently selected profile name.
   */
  public updateProfileUI(selectedProfile: string): void {
    const isDefaultProfile = selectedProfile === "Default";

    // Show/hide delete button based on profile type
    this.elements.deleteProfileBtn.style.display = isDefaultProfile ? "none" : "inline-block";

    // Clear the profile name input when switching profiles
    this.elements.profileNameInput.value = "";
  }

  /**
   * Shows delete confirmation by modifying the existing reset dialog.
   * Uses state-based dispatch instead of cloning buttons.
   * @param {string} profileName The name of the profile to delete.
   */
  public showDeleteConfirmation(profileName: string): void {
    const dialogTitle = this.elements.dialogOverlay.querySelector("h3");
    const dialogMessage = this.elements.dialogOverlay.querySelector("p");

    if (!dialogTitle || !dialogMessage) {
      throw new Error("Dialog elements not found");
    }

    // Set pending state so the confirm handler dispatches deleteProfile.
    this._pendingDeleteProfile = profileName;

    // Modify dialog text for delete confirmation.
    dialogTitle.textContent = "Delete Profile";
    dialogMessage.textContent = `Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`;
    this.elements.confirmResetButton.textContent = "Delete Profile";

    // Show the dialog.
    this.elements.dialogOverlay.classList.remove("hidden");
  }

  /**
   * Clears the pending delete state and restores original dialog text if needed.
   */
  private _resetDialogState(): void {
    if (this._pendingDeleteProfile === null) return;

    this._pendingDeleteProfile = null;

    const dialogTitle = this.elements.dialogOverlay.querySelector("h3");
    const dialogMessage = this.elements.dialogOverlay.querySelector("p");

    if (dialogTitle) dialogTitle.textContent = this._originalDialogTitle;
    if (dialogMessage) dialogMessage.textContent = this._originalDialogMessage;
    this.elements.confirmResetButton.textContent = this._originalConfirmText;
  }
}
