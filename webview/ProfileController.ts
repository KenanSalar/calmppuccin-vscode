/**
 * @file The profile controls, and the confirmation dialog they share with Reset All: confirming
 * deletes the profile awaiting deletion, or resets everything when none is.
 */

import { DEFAULT_PROFILE_NAME, WEBVIEW_CONSTANTS } from "../src/constants";
import { IProfile, IVsCodeApi } from "../types/webview";

export interface IProfileElements {
  profileSelect: HTMLSelectElement;
  profileNameInput: HTMLInputElement;
  saveProfileBtn: HTMLButtonElement;
  deleteProfileBtn: HTMLButtonElement;
  dialogOverlay: HTMLElement;
  dialogTitle: HTMLElement;
  dialogMessage: HTMLElement;
  confirmResetButton: HTMLButtonElement;
  cancelResetButton: HTMLElement;
}

export class ProfileController {
  private readonly vscode: IVsCodeApi;
  private readonly elements: IProfileElements;

  /** When non-null, the confirm button dispatches deleteProfile instead of resetAll. */
  private _pendingDeleteProfile: string | null = null;

  /** The Reset All wording, restored after a delete confirmation borrows the dialog. */
  private readonly _originalDialogTitle: string;
  private readonly _originalDialogMessage: string;
  private readonly _originalConfirmText: string;

  constructor(vscode: IVsCodeApi, elements: IProfileElements) {
    this.vscode = vscode;
    this.elements = elements;

    this._originalDialogTitle = elements.dialogTitle.textContent;
    this._originalDialogMessage = elements.dialogMessage.textContent;
    this._originalConfirmText = elements.confirmResetButton.textContent;
  }

  public initializeEventListeners(): void {
    this.elements.profileSelect.addEventListener("change", () => {
      const selectedProfile = this.elements.profileSelect.value;
      this.updateProfileUI(selectedProfile);
      this.vscode.postMessage({
        command: WEBVIEW_CONSTANTS.SWITCH_PROFILE,
        profile: selectedProfile,
      });
    });

    this.elements.saveProfileBtn.addEventListener("click", () => {
      const profileName = this.elements.profileNameInput.value.trim();
      if (profileName && profileName !== DEFAULT_PROFILE_NAME) {
        this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.SAVE_PROFILE, profile: profileName });
      }
    });

    this.elements.deleteProfileBtn.addEventListener("click", () => {
      const currentProfile = this.elements.profileSelect.value;
      if (currentProfile !== DEFAULT_PROFILE_NAME) {
        this.showDeleteConfirmation(currentProfile);
      }
    });

    this.elements.confirmResetButton.addEventListener("click", () => {
      if (this._pendingDeleteProfile) {
        this.vscode.postMessage({
          command: WEBVIEW_CONSTANTS.DELETE_PROFILE,
          profile: this._pendingDeleteProfile,
        });
      } else {
        this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.RESET_ALL });
      }
      this._closeDialog();
    });

    this.elements.cancelResetButton.addEventListener("click", () => {
      this._closeDialog();
    });

    // Click-outside dismissal.
    this.elements.dialogOverlay.addEventListener("click", (e) => {
      if (e.target === this.elements.dialogOverlay) {
        this._closeDialog();
      }
    });
  }

  public populateProfileDropdown(
    profiles: { [name: string]: IProfile },
    activeProfile: string,
  ): void {
    this.elements.profileSelect.innerHTML = "";

    if (!Object.hasOwn(profiles, DEFAULT_PROFILE_NAME)) {
      const defaultOption = document.createElement("option");
      defaultOption.value = DEFAULT_PROFILE_NAME;
      defaultOption.textContent = DEFAULT_PROFILE_NAME;
      this.elements.profileSelect.appendChild(defaultOption);
    }

    Object.keys(profiles)
      .toSorted()
      .forEach((profileName) => {
        const option = document.createElement("option");
        option.value = profileName;
        option.textContent = profileName;
        this.elements.profileSelect.appendChild(option);
      });

    this.elements.profileSelect.value = activeProfile;
  }

  /** Hides Delete for `Default` and clears the name field. */
  public updateProfileUI(selectedProfile: string): void {
    const isDefaultProfile = selectedProfile === DEFAULT_PROFILE_NAME;
    this.elements.deleteProfileBtn.style.display = isDefaultProfile ? "none" : "inline-block";
    this.elements.profileNameInput.value = "";
  }

  /** Opens the Reset All dialog, reworded to delete `profileName`. */
  public showDeleteConfirmation(profileName: string): void {
    this._pendingDeleteProfile = profileName;
    this.elements.dialogTitle.textContent = "Delete Profile";
    this.elements.dialogMessage.textContent = `Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`;
    this.elements.confirmResetButton.textContent = "Delete Profile";
    this.elements.dialogOverlay.classList.remove("hidden");
  }

  /** Hides the dialog, clearing a pending delete and restoring the Reset All wording. */
  private _closeDialog(): void {
    this.elements.dialogOverlay.classList.add("hidden");
    if (this._pendingDeleteProfile === null) return;

    this._pendingDeleteProfile = null;
    this.elements.dialogTitle.textContent = this._originalDialogTitle;
    this.elements.dialogMessage.textContent = this._originalDialogMessage;
    this.elements.confirmResetButton.textContent = this._originalConfirmText;
  }
}
