/**
 * @file The profile controls, and the confirmation dialog they share with Reset All: confirming
 * deletes the profile awaiting deletion, or resets everything when none is.
 */

import { WEBVIEW_CONSTANTS } from "../src/constants";
import { IProfile, IVsCodeApi } from "../types/webview";

export interface IProfileElements {
  profileSelect: HTMLSelectElement;
  profileNameInput: HTMLInputElement;
  saveProfileBtn: HTMLButtonElement;
  deleteProfileBtn: HTMLButtonElement;
  dialogOverlay: HTMLElement;
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

    this._originalDialogTitle =
      elements.dialogOverlay.querySelector("h3")?.textContent ?? "Confirm Reset";
    this._originalDialogMessage = elements.dialogOverlay.querySelector("p")?.textContent ?? "";
    this._originalConfirmText = elements.confirmResetButton.textContent;
  }

  public initializeEventListeners(): void {
    this.elements.profileSelect.addEventListener("change", (e) => {
      const selectedProfile = (e.target as HTMLSelectElement).value;
      this.updateProfileUI(selectedProfile);
      this.vscode.postMessage({
        command: WEBVIEW_CONSTANTS.SWITCH_PROFILE,
        profile: selectedProfile,
      });
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

    this.elements.confirmResetButton.addEventListener("click", () => {
      if (this._pendingDeleteProfile) {
        this.vscode.postMessage({
          command: WEBVIEW_CONSTANTS.DELETE_PROFILE,
          profile: this._pendingDeleteProfile,
        });
      } else {
        this.vscode.postMessage({ command: WEBVIEW_CONSTANTS.RESET_ALL });
      }
      this.elements.dialogOverlay.classList.add("hidden");
      this._resetDialogState();
    });

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

  public populateProfileDropdown(
    profiles: { [name: string]: IProfile },
    activeProfile: string,
  ): void {
    this.elements.profileSelect.innerHTML = "";

    if (!Object.hasOwn(profiles, "Default")) {
      const defaultOption = document.createElement("option");
      defaultOption.value = "Default";
      defaultOption.textContent = "Default";
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
    const isDefaultProfile = selectedProfile === "Default";
    this.elements.deleteProfileBtn.style.display = isDefaultProfile ? "none" : "inline-block";
    this.elements.profileNameInput.value = "";
  }

  /** Opens the Reset All dialog, reworded to delete `profileName`. */
  public showDeleteConfirmation(profileName: string): void {
    const dialogTitle = this.elements.dialogOverlay.querySelector("h3");
    const dialogMessage = this.elements.dialogOverlay.querySelector("p");

    if (!dialogTitle || !dialogMessage) {
      throw new Error("Dialog elements not found");
    }

    this._pendingDeleteProfile = profileName;
    dialogTitle.textContent = "Delete Profile";
    dialogMessage.textContent = `Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`;
    this.elements.confirmResetButton.textContent = "Delete Profile";
    this.elements.dialogOverlay.classList.remove("hidden");
  }

  /** Clears a pending delete and restores the Reset All wording. */
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
