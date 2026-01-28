/**
 * @file ProfileController handles profile management UI operations in the webview.
 * @description Extracted from UIManager to follow Single Responsibility Principle.
 * Manages profile dropdown population, UI state updates, and delete confirmation dialogs.
 */

import { IProfile, MessageToExtension } from "../types/webview";
import { WEBVIEW_CONSTANTS } from "../src/constants";

/** Interface for the VS Code API messaging. */
interface IVsCodeApi {
  postMessage(message: MessageToExtension): void;
}

/** Interface for DOM element references needed by ProfileController. */
export interface IProfileElements {
  profileSelect: HTMLSelectElement;
  profileNameInput: HTMLInputElement;
  saveProfileBtn: HTMLButtonElement;
  deleteProfileBtn: HTMLButtonElement;
  dialogOverlay: HTMLElement;
  confirmResetButton: HTMLButtonElement;
}

/**
 * Manages profile-related UI operations including dropdown population,
 * state management, and delete confirmation dialogs.
 */
export class ProfileController {
  private readonly vscode: IVsCodeApi;
  private readonly elements: IProfileElements;

  /**
   * Creates a new ProfileController instance.
   * @param {IVsCodeApi} vscode The VS Code API for messaging.
   * @param {IProfileElements} elements DOM element references.
   */
  constructor(vscode: IVsCodeApi, elements: IProfileElements) {
    this.vscode = vscode;
    this.elements = elements;
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
   * @param {string} profileName The name of the profile to delete.
   */
  public showDeleteConfirmation(profileName: string): void {
    // Store original dialog content to restore later
    const dialogTitle = this.elements.dialogOverlay.querySelector("h3");
    const dialogMessage = this.elements.dialogOverlay.querySelector("p");
    const confirmButton = this.elements.confirmResetButton;

    if (!dialogTitle || !dialogMessage) {
      throw new Error("Dialog elements not found");
    }

    const originalTitle = dialogTitle.textContent;
    const originalMessage = dialogMessage.textContent;
    const originalButtonText = confirmButton.textContent;

    // Modify dialog for delete confirmation
    dialogTitle.textContent = "Delete Profile";
    dialogMessage.textContent = `Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`;
    confirmButton.textContent = "Delete Profile";

    // Replace the confirm button's event handler by cloning to remove existing listeners
    const newConfirmButton = confirmButton.cloneNode(true) as HTMLButtonElement;
    confirmButton.parentNode?.replaceChild(newConfirmButton, confirmButton);
    // Update the reference to prevent stale node issues on subsequent calls
    this.elements.confirmResetButton = newConfirmButton;

    // Add delete-specific event handler
    newConfirmButton.addEventListener("click", () => {
      this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.DELETE_PROFILE, profile: profileName });
      this.elements.dialogOverlay.classList.add("hidden");

      // Restore original dialog content
      dialogTitle.textContent = originalTitle;
      dialogMessage.textContent = originalMessage;
      newConfirmButton.textContent = originalButtonText;

      // Restore original reset button functionality by cloning to remove delete handler
      const finalConfirmButton = newConfirmButton.cloneNode(true) as HTMLButtonElement;
      newConfirmButton.parentNode?.replaceChild(finalConfirmButton, newConfirmButton);
      // Update the reference to prevent stale node issues
      this.elements.confirmResetButton = finalConfirmButton;
      finalConfirmButton.addEventListener("click", () => {
        this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.RESET_ALL });
        this.elements.dialogOverlay.classList.add("hidden");
      });
    });

    // Show the dialog
    this.elements.dialogOverlay.classList.remove("hidden");
  }
}
