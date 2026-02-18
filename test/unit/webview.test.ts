/**
 * @file This file contains unit tests for the UIManager class in the webview.
 * It verifies DOM manipulation, event handling, and communication with the extension host.
 */

import { UIManager } from "../../webview/main";
import { codeSnippets } from "../../webview/snippets";

// --- Mocking the VS Code API ---
const mockPostMessage = jest.fn();
const mockVscode = {
  postMessage: mockPostMessage,
};
(global as unknown as { acquireVsCodeApi: () => typeof mockVscode }).acquireVsCodeApi = jest.fn(() => mockVscode);

// --- HTML Fixture ---
const htmlFixture = `
  <h2 id="current-flavor"></h2>
  <select id="profile-select"></select>
  <input type="text" id="profile-name-input" />
  <button id="save-profile-btn"></button>
  <button id="delete-profile-btn"></button>
  <div id="accent-container"></div>
  <div id="custom-accent-picker-container" style="display: none;">
    <input type="color" id="custom-accent-picker" />
    <input type="text" id="custom-accent-hex-input" />
  </div>
  <select id="settings-view-select">
    <option value="syntax">Syntax</option>
    <option value="ui">UI</option>
    <option value="brackets">Brackets</option>
    <option value="json">JSON</option>
  </select>
  <div id="settings-container"></div>
  <div id="reset-all-container"></div>
  <div class="preview-container">
    <div id="preview-pane">
      <pre><code id="code-preview"></code></pre>
    </div>
  </div>
  <select id="language-select"></select>
  <div id="reset-dialog-overlay" class="hidden">
    <div class="dialog-box">
      <h3>Confirm Reset</h3>
      <p>Are you sure you want to reset all Calmppuccin settings to their defaults? This action cannot be undone.</p>
      <div class="dialog-buttons">
        <button id="dialog-cancel-button"></button>
        <button id="dialog-confirm-button">Reset Settings</button>
      </div>
    </div>
  </div>
`;

// --- Mock Settings Payload ---
const mockSettingsPayload = {
  activeFlavor: "mocha",
  syntaxSettings: [
    { key: "comment", fontStyle: "italic", color: "#858aa0", defaultColor: "#858aa0" },
    { key: "keyword", fontStyle: "none", color: "#B2AADD", defaultColor: "#B2AADD" },
  ],
  bracketSettings: [{ key: "uiBracket1", color: "#6cb3c0", defaultColor: "#6cb3c0" }],
  jsonSettings: [{ key: "jsonLvl0", fontStyle: "none", color: "#8eb4f0", defaultColor: "#8eb4f0" }],
  uiSettings: [
    { key: "base", color: "#11111a", defaultColor: "#11111a" },
    { key: "mantle", color: "#171724", defaultColor: "#171724" },
    { key: "crust", color: "#1d1d2c", defaultColor: "#1d1d2c" },
  ],
  currentAccent: "sapphire",
  accentOptions: ["sapphire", "mauve", "custom"],
  customAccentColor: "#89b4fa",
  activeThemeBackgroundColor: "#1d1d2c",
  accentColorPalettes: { sapphire: "#70b7d8", mauve: "#ba9ae2" },
  defaultFontStyles: { commentFontStyle: "italic", keywordFontStyle: "none", jsonLvl0FontStyle: "none" },
  profiles: { "Custom Profile 1": {}, "Work Theme": {} },
  activeProfile: "Default",
};

describe("UIManager Unit Tests", () => {
  let uiManager: UIManager;

  beforeEach(() => {
    document.body.innerHTML = htmlFixture;
    mockPostMessage.mockClear();
    ((global as unknown as { acquireVsCodeApi: jest.Mock }).acquireVsCodeApi).mockClear();
    uiManager = new UIManager();
    // Initialize event listeners before every single test
    uiManager.initializeEventListeners();
  });

  it("should initialize event listeners and populate the language selector", () => {
    // Act is performed in beforeEach, so it just asserts here.

    // Assert
    const languageSelect = document.getElementById("language-select") as HTMLSelectElement;
    // We filter out brackets and json from the main language selector
    const expectedOptions = Object.keys(codeSnippets).length - 3;
    expect(languageSelect.options.length).toBe(expectedOptions);
    expect(languageSelect.value).toBe("csharp");

    const codePreview = document.getElementById("code-preview");
    expect(codePreview).not.toBeNull(); // Ensure the element exists
    if (!codePreview) return; // Type guard for TypeScript

    const content = codePreview.innerHTML;

    // 1. Check that the content is not empty
    expect(content.length).toBeGreaterThan(100);

    // 2. Check for a unique string from the beginning of the C# snippet
    expect(content).toContain(
      'namespace</span> <span data-token="namespace">MyApp<span data-token="operator">.</span>Core</span>'
    );

    // 3. Check for a unique string from the end of the C# snippet
    expect(content).toContain(
      'GetTypeName</span><span data-token="punctuation">(</span><span data-token="keyword">this</span>'
    );
  });

  it("should populate all settings when receiving a 'loadSettings' message", () => {
    // Act
    const event = new MessageEvent("message", {
      data: { command: "loadSettings", settings: mockSettingsPayload },
    });
    window.dispatchEvent(event);

    // Assert
    const flavorTitle = document.getElementById("current-flavor");
    expect(flavorTitle?.textContent).toBe("Editing: Mocha");

    const settingsContainer = document.getElementById("settings-container");
    // Should render the 'syntax' view by default
    const expectedChildren = mockSettingsPayload.syntaxSettings.length * 3;
    expect(settingsContainer?.children.length).toBe(expectedChildren);

    const accentSelect = document.querySelector("#accent-container select") as HTMLSelectElement;
    expect(accentSelect).not.toBeNull();
    expect(accentSelect.value).toBe("sapphire");
  });

  it("should send an 'updateSetting' message when a font style is changed", () => {
    // Arrange
    uiManager.populateAllSettings(mockSettingsPayload);
    const keywordFontStyleSelect = document.getElementById("keyword") as HTMLSelectElement;
    expect(keywordFontStyleSelect).not.toBeNull();

    // Act
    keywordFontStyleSelect.value = "bold";
    keywordFontStyleSelect.dispatchEvent(new Event("change"));

    // Assert
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({
      command: "updateSetting",
      key: "keywordFontStyle",
      value: "bold",
    });
  });

  it("should send an 'updateSyntaxColor' message when a color hex input is changed", () => {
    // Arrange
    uiManager.populateAllSettings(mockSettingsPayload);
    const keywordColorControl = document.querySelector("label[for='keyword']")?.nextElementSibling?.nextElementSibling;
    const hexInput = keywordColorControl?.querySelector(".hex-input-display") as HTMLInputElement;
    expect(hexInput).not.toBeNull();

    // Act
    const newColor = "#FF00FF";
    hexInput.value = newColor;
    hexInput.dispatchEvent(new Event("input"));
    hexInput.dispatchEvent(new Event("change"));

    // Assert
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({
      command: "updateSyntaxColor",
      flavor: "mocha",
      key: "keyword",
      value: newColor,
    });

    const keywordTokenInPreview = document.querySelector("#code-preview [data-token='keyword']") as HTMLElement;
    expect(keywordTokenInPreview.style.color).toBe("rgb(255, 0, 255)");
  });

  it("should send a 'resetAll' message when the reset dialog is confirmed", () => {
    // Arrange
    uiManager.populateAllSettings(mockSettingsPayload);
    const resetAllButton = document.querySelector(".reset-all-button") as HTMLButtonElement;
    const dialogOverlay = document.getElementById("reset-dialog-overlay");
    const confirmButton = document.getElementById("dialog-confirm-button") as HTMLButtonElement;
    expect(dialogOverlay?.classList.contains("hidden")).toBe(true);

    // Act
    resetAllButton.click();
    expect(dialogOverlay?.classList.contains("hidden")).toBe(false); // Dialog is visible
    confirmButton.click();

    // Assert
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({ command: "resetAll" });
    expect(dialogOverlay?.classList.contains("hidden")).toBe(true); // Dialog is hidden again
  });

  it("should send 'resetAll' (not 'deleteProfile') after cancelling a delete dialog", () => {
    // This test validates the fix for the cloneNode bug where cancelling a delete
    // dialog would leave the delete handler on the confirm button.
    const settingsWithProfiles = {
      ...mockSettingsPayload,
      profiles: { Default: {}, "My Profile": {} },
      activeProfile: "My Profile",
    };
    uiManager.populateAllSettings(settingsWithProfiles);
    mockPostMessage.mockClear();

    const dialogOverlay = document.getElementById("reset-dialog-overlay") as HTMLElement;
    const confirmButton = document.getElementById("dialog-confirm-button") as HTMLButtonElement;
    const cancelButton = document.getElementById("dialog-cancel-button") as HTMLButtonElement;
    const deleteProfileBtn = document.getElementById("delete-profile-btn") as HTMLButtonElement;
    const resetAllButton = document.querySelector(".reset-all-button") as HTMLButtonElement;

    // Step 1: Open delete dialog, then cancel.
    deleteProfileBtn.click();
    expect(dialogOverlay.classList.contains("hidden")).toBe(false);
    cancelButton.click();
    expect(dialogOverlay.classList.contains("hidden")).toBe(true);

    // Step 2: Open reset dialog and confirm.
    resetAllButton.click();
    expect(dialogOverlay.classList.contains("hidden")).toBe(false);
    confirmButton.click();

    // Assert: should send resetAll, NOT deleteProfile.
    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({ command: "resetAll" });
    expect(dialogOverlay.classList.contains("hidden")).toBe(true);
  });

  // --- Priority 3: Webview UI Validation Tests ---

  describe("Hex Color Input Validation", () => {
    it("should validate hex color input and reject invalid values", () => {
      // Arrange
      uiManager.populateAllSettings(mockSettingsPayload);
      const customAccentHexInput = document.getElementById("custom-accent-hex-input") as HTMLInputElement;
      const accentSelect = document.querySelector("#accent-container select") as HTMLSelectElement;

      // Switch to custom accent to show the hex input
      accentSelect.value = "custom";
      accentSelect.dispatchEvent(new Event("change"));

      // Act - Test invalid hex value
      customAccentHexInput.value = "invalid";
      customAccentHexInput.dispatchEvent(new Event("input"));

      // Assert - Should show error styling
      expect(customAccentHexInput.style.borderColor).toBe("var(--danger-color)");
      expect(customAccentHexInput.style.outlineColor).toBe("var(--danger-color)");

      // Act - Test valid hex value
      customAccentHexInput.value = "#89b4fa";
      customAccentHexInput.dispatchEvent(new Event("input"));

      // Assert - Should remove error styling
      expect(customAccentHexInput.style.borderColor).toBe("");
      expect(customAccentHexInput.style.outlineColor).toBe("");
    });

    it("should only send valid hex colors to VS Code on change event", () => {
      // Arrange
      uiManager.populateAllSettings(mockSettingsPayload);
      const customAccentHexInput = document.getElementById("custom-accent-hex-input") as HTMLInputElement;
      const accentSelect = document.querySelector("#accent-container select") as HTMLSelectElement;

      accentSelect.value = "custom";
      accentSelect.dispatchEvent(new Event("change"));
      mockPostMessage.mockClear();

      // Act - Enter invalid hex and trigger change
      customAccentHexInput.value = "not-a-color";
      customAccentHexInput.dispatchEvent(new Event("input"));
      customAccentHexInput.dispatchEvent(new Event("change"));

      // Assert - Should NOT send message for invalid color
      expect(mockPostMessage).not.toHaveBeenCalled();

      // Act - Enter valid hex and trigger change
      customAccentHexInput.value = "#ff00ff";
      customAccentHexInput.dispatchEvent(new Event("input"));
      customAccentHexInput.dispatchEvent(new Event("change"));

      // Assert - Should send message for valid color
      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: "updateCustomAccent",
        value: "#ff00ff",
      });
    });

    it("should validate syntax color hex input with 8-digit support", () => {
      // Arrange
      uiManager.populateAllSettings(mockSettingsPayload);
      const keywordColorControl = document.querySelector("label[for='keyword']")?.nextElementSibling?.nextElementSibling;
      const hexInput = keywordColorControl?.querySelector(".hex-input-display") as HTMLInputElement;

      // Act - Test valid 6-digit hex
      hexInput.value = "#89b4fa";
      hexInput.dispatchEvent(new Event("input"));

      // Assert
      expect(hexInput.style.borderColor).toBe("");
      expect(hexInput.style.outlineColor).toBe("");

      // Act - Test valid 8-digit hex (with alpha)
      hexInput.value = "#89b4fa80";
      hexInput.dispatchEvent(new Event("input"));

      // Assert
      expect(hexInput.style.borderColor).toBe("");
      expect(hexInput.style.outlineColor).toBe("");

      // Act - Test invalid hex
      hexInput.value = "#zzzzzz";
      hexInput.dispatchEvent(new Event("input"));

      // Assert
      expect(hexInput.style.borderColor).toBe("var(--danger-color)");
      expect(hexInput.style.outlineColor).toBe("var(--danger-color)");
    });
  });

  describe("Profile Management Validation", () => {
    it("should prevent profile save with empty string", () => {
      // Arrange
      uiManager.populateAllSettings(mockSettingsPayload);
      const profileNameInput = document.getElementById("profile-name-input") as HTMLInputElement;
      const saveProfileBtn = document.getElementById("save-profile-btn") as HTMLButtonElement;

      // Act - Try to save with empty name
      profileNameInput.value = "";
      saveProfileBtn.click();

      // Assert - Should NOT send message
      expect(mockPostMessage).not.toHaveBeenCalled();

      // Act - Try to save with whitespace only
      profileNameInput.value = "   ";
      saveProfileBtn.click();

      // Assert - Should NOT send message
      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("should prevent saving profile with name 'Default'", () => {
      // Arrange
      uiManager.populateAllSettings(mockSettingsPayload);
      const profileNameInput = document.getElementById("profile-name-input") as HTMLInputElement;
      const saveProfileBtn = document.getElementById("save-profile-btn") as HTMLButtonElement;

      // Act - Try to save with name "Default"
      profileNameInput.value = "Default";
      saveProfileBtn.click();

      // Assert - Should NOT send message
      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("should handle rapid profile switches correctly", () => {
      // Arrange
      uiManager.populateAllSettings(mockSettingsPayload);
      const profileSelect = document.getElementById("profile-select") as HTMLSelectElement;
      mockPostMessage.mockClear();

      // Act - Rapidly switch profiles
      profileSelect.value = "Custom Profile 1";
      profileSelect.dispatchEvent(new Event("change"));

      profileSelect.value = "Work Theme";
      profileSelect.dispatchEvent(new Event("change"));

      profileSelect.value = "Default";
      profileSelect.dispatchEvent(new Event("change"));

      // Assert - All messages should be sent
      expect(mockPostMessage).toHaveBeenCalledTimes(3);
      expect(mockPostMessage).toHaveBeenNthCalledWith(1, {
        command: "switchProfile",
        profile: "Custom Profile 1",
      });
      expect(mockPostMessage).toHaveBeenNthCalledWith(2, {
        command: "switchProfile",
        profile: "Work Theme",
      });
      expect(mockPostMessage).toHaveBeenNthCalledWith(3, {
        command: "switchProfile",
        profile: "Default",
      });
    });
  });
});
