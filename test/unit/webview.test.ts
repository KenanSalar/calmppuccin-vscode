/**
 * @file `UIManager` and its controllers in jsdom, on a fixture of the page's elements, with
 * `acquireVsCodeApi` stubbed.
 * @jest-environment jsdom
 */

import { ISettingsPayload } from "../../types/webview";
import { UIManager } from "../../webview/main";
import { codeSnippets } from "../../webview/snippets";

const mockPostMessage = jest.fn();
const mockVscode = {
  postMessage: mockPostMessage,
};
(global as unknown as { acquireVsCodeApi: () => typeof mockVscode }).acquireVsCodeApi = jest.fn(
  () => mockVscode,
);

const htmlFixture = `
  <h2 id="current-flavor"></h2>
  <select id="profile-select"></select>
  <input type="text" id="profile-name-input" />
  <button id="save-profile-btn"></button>
  <button id="delete-profile-btn"></button>
  <div id="accent-container"></div>
  <div id="custom-accent-picker-container">
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

// Built per test: the controls record committed edits on the payload they were built from.
const createSettingsPayload = (): ISettingsPayload => ({
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
  defaultFontStyles: {
    commentFontStyle: "italic",
    keywordFontStyle: "none",
    jsonLvl0FontStyle: "none",
  },
  profiles: { "Custom Profile 1": {}, "Work Theme": {} },
  activeProfile: "Default",
});

describe("UIManager Unit Tests", () => {
  let uiManager: UIManager;
  let mockSettingsPayload: ISettingsPayload;

  beforeEach(() => {
    mockSettingsPayload = createSettingsPayload();
    document.body.innerHTML = htmlFixture;
    mockPostMessage.mockClear();
    (global as unknown as { acquireVsCodeApi: jest.Mock }).acquireVsCodeApi.mockClear();
    uiManager = new UIManager();
    uiManager.initializeEventListeners();
  });

  it("should initialize event listeners and populate the language selector", () => {
    const languageSelect = document.getElementById("language-select") as HTMLSelectElement;
    // `brackets`, `json` and `ui` aren't languages.
    const expectedOptions = Object.keys(codeSnippets).length - 3;
    expect(languageSelect.options.length).toBe(expectedOptions);
    expect(languageSelect.value).toBe("csharp");

    const codePreview = document.getElementById("code-preview");
    expect(codePreview).not.toBeNull();
    if (!codePreview) return; // Type guard for TypeScript

    const content = codePreview.innerHTML;

    expect(content.length).toBeGreaterThan(100);

    expect(content).toContain(
      'namespace</span> <span data-token="namespace">MyApp<span data-token="operator">.</span>Core</span>',
    );

    expect(content).toContain(
      'GetTypeName</span><span data-token="punctuation">(</span><span data-token="keyword">this</span>',
    );
  });

  it("should populate all settings when receiving a 'loadSettings' message", () => {
    const event = new MessageEvent("message", {
      data: { command: "loadSettings", settings: mockSettingsPayload },
    });
    window.dispatchEvent(event);

    const flavorTitle = document.getElementById("current-flavor");
    expect(flavorTitle?.textContent).toBe("Editing: Mocha");

    const settingsContainer = document.getElementById("settings-container");
    const expectedChildren = mockSettingsPayload.syntaxSettings.length * 3;
    expect(settingsContainer?.children.length).toBe(expectedChildren);

    const accentSelect = document.querySelector("#accent-container select") as HTMLSelectElement;
    expect(accentSelect).not.toBeNull();
    expect(accentSelect.value).toBe("sapphire");
  });

  it("should send an 'updateSetting' message when a font style is changed", () => {
    uiManager.populateAllSettings(mockSettingsPayload);
    const keywordFontStyleSelect = document.getElementById("keyword") as HTMLSelectElement;
    expect(keywordFontStyleSelect).not.toBeNull();

    keywordFontStyleSelect.value = "bold";
    keywordFontStyleSelect.dispatchEvent(new Event("change"));

    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({
      command: "updateSetting",
      key: "keywordFontStyle",
      value: "bold",
    });
  });

  it("should send an 'updateSyntaxColor' message when a color hex input is changed", () => {
    uiManager.populateAllSettings(mockSettingsPayload);
    const keywordColorControl =
      document.querySelector("label[for='keyword']")?.nextElementSibling?.nextElementSibling;
    const hexInput = keywordColorControl?.querySelector(".hex-input-display") as HTMLInputElement;
    expect(hexInput).not.toBeNull();

    const newColor = "#FF00FF";
    hexInput.value = newColor;
    hexInput.dispatchEvent(new Event("input"));
    hexInput.dispatchEvent(new Event("change"));

    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({
      command: "updateSyntaxColor",
      flavor: "mocha",
      key: "keyword",
      value: newColor,
    });

    const keywordTokenInPreview = document.querySelector(
      "#code-preview [data-token='keyword']",
    ) as HTMLElement;
    expect(keywordTokenInPreview.style.color).toBe("rgb(255, 0, 255)");
  });

  it("should send a 'resetAll' message when the reset dialog is confirmed", () => {
    uiManager.populateAllSettings(mockSettingsPayload);
    const resetAllButton = document.querySelector(".reset-all-button") as HTMLButtonElement;
    const dialogOverlay = document.getElementById("reset-dialog-overlay");
    const confirmButton = document.getElementById("dialog-confirm-button") as HTMLButtonElement;
    expect(dialogOverlay?.classList.contains("hidden")).toBe(true);

    resetAllButton.click();
    expect(dialogOverlay?.classList.contains("hidden")).toBe(false); // Dialog is visible
    confirmButton.click();

    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({ command: "resetAll" });
    expect(dialogOverlay?.classList.contains("hidden")).toBe(true); // Dialog is hidden again
  });

  it("should send 'resetAll' (not 'deleteProfile') after cancelling a delete dialog", () => {
    // A cancelled delete must leave the confirm button resetting, not deleting.
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

    // Open the delete dialog, then cancel.
    deleteProfileBtn.click();
    expect(dialogOverlay.classList.contains("hidden")).toBe(false);
    cancelButton.click();
    expect(dialogOverlay.classList.contains("hidden")).toBe(true);

    // Then open the reset dialog and confirm.
    resetAllButton.click();
    expect(dialogOverlay.classList.contains("hidden")).toBe(false);
    confirmButton.click();

    expect(mockPostMessage).toHaveBeenCalledTimes(1);
    expect(mockPostMessage).toHaveBeenCalledWith({ command: "resetAll" });
    expect(dialogOverlay.classList.contains("hidden")).toBe(true);
  });

  describe("Hex Color Input Validation", () => {
    it("should validate hex color input and reject invalid values", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      const customAccentHexInput = document.getElementById(
        "custom-accent-hex-input",
      ) as HTMLInputElement;
      const accentSelect = document.querySelector("#accent-container select") as HTMLSelectElement;

      // Switch to custom accent to show the hex input
      accentSelect.value = "custom";
      accentSelect.dispatchEvent(new Event("change"));

      customAccentHexInput.value = "invalid";
      customAccentHexInput.dispatchEvent(new Event("input"));

      expect(customAccentHexInput.style.borderColor).toBe("var(--danger-color)");
      expect(customAccentHexInput.style.outlineColor).toBe("var(--danger-color)");

      customAccentHexInput.value = "#89b4fa";
      customAccentHexInput.dispatchEvent(new Event("input"));

      expect(customAccentHexInput.style.borderColor).toBe("");
      expect(customAccentHexInput.style.outlineColor).toBe("");
    });

    it("should only send valid hex colors to VS Code on change event", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      const customAccentHexInput = document.getElementById(
        "custom-accent-hex-input",
      ) as HTMLInputElement;
      const accentSelect = document.querySelector("#accent-container select") as HTMLSelectElement;

      accentSelect.value = "custom";
      accentSelect.dispatchEvent(new Event("change"));
      mockPostMessage.mockClear();

      customAccentHexInput.value = "not-a-color";
      customAccentHexInput.dispatchEvent(new Event("input"));
      customAccentHexInput.dispatchEvent(new Event("change"));

      expect(mockPostMessage).not.toHaveBeenCalled();

      customAccentHexInput.value = "#ff00ff";
      customAccentHexInput.dispatchEvent(new Event("input"));
      customAccentHexInput.dispatchEvent(new Event("change"));

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        command: "updateCustomAccent",
        value: "#ff00ff",
      });
    });

    it("should validate syntax color hex input with 8-digit support", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      const keywordColorControl =
        document.querySelector("label[for='keyword']")?.nextElementSibling?.nextElementSibling;
      const hexInput = keywordColorControl?.querySelector(".hex-input-display") as HTMLInputElement;

      hexInput.value = "#89b4fa";
      hexInput.dispatchEvent(new Event("input"));

      expect(hexInput.style.borderColor).toBe("");
      expect(hexInput.style.outlineColor).toBe("");

      hexInput.value = "#89b4fa80";
      hexInput.dispatchEvent(new Event("input"));

      expect(hexInput.style.borderColor).toBe("");
      expect(hexInput.style.outlineColor).toBe("");

      hexInput.value = "#zzzzzz";
      hexInput.dispatchEvent(new Event("input"));

      expect(hexInput.style.borderColor).toBe("var(--danger-color)");
      expect(hexInput.style.outlineColor).toBe("var(--danger-color)");
    });
  });

  describe("Committed edits across view switches", () => {
    function getKeywordColorControl(): Element {
      const control =
        document.querySelector("label[for='keyword']")?.nextElementSibling?.nextElementSibling;
      if (!control) {
        throw new Error("The keyword setting has no color control");
      }
      return control;
    }

    function getKeywordHexInput(): HTMLInputElement {
      const hexInput = getKeywordColorControl().querySelector(".hex-input-display");
      if (!(hexInput instanceof HTMLInputElement)) {
        throw new Error("The keyword color control has no hex input");
      }
      return hexInput;
    }

    function getKeywordFontStyleSelect(): HTMLSelectElement {
      const select = document.getElementById("keyword");
      if (!(select instanceof HTMLSelectElement)) {
        throw new Error("The keyword setting has no font style select");
      }
      return select;
    }

    function commitKeywordColor(color: string) {
      const hexInput = getKeywordHexInput();
      hexInput.value = color;
      hexInput.dispatchEvent(new Event("input"));
      hexInput.dispatchEvent(new Event("change"));
    }

    function showSyntaxViewAgain() {
      const viewSelect = document.getElementById("settings-view-select") as HTMLSelectElement;
      viewSelect.value = "ui";
      viewSelect.dispatchEvent(new Event("change"));
      viewSelect.value = "syntax";
      viewSelect.dispatchEvent(new Event("change"));
    }

    it("should keep a committed color in its control", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      commitKeywordColor("#ff00ff");

      showSyntaxViewAgain();

      expect(getKeywordHexInput().value).toBe("#ff00ff");
    });

    it("should keep a committed color in the preview", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      commitKeywordColor("#ff00ff");

      showSyntaxViewAgain();

      const keywordToken = document.querySelector(
        "#code-preview [data-token='keyword']",
      ) as HTMLElement;
      expect(keywordToken.style.color).toBe("rgb(255, 0, 255)");
    });

    it("should keep a committed font style", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      const select = getKeywordFontStyleSelect();
      select.value = "bold";
      select.dispatchEvent(new Event("change"));

      showSyntaxViewAgain();

      expect(getKeywordFontStyleSelect().value).toBe("bold");
    });

    it("should keep a color reset", () => {
      uiManager.populateAllSettings({
        ...mockSettingsPayload,
        syntaxSettings: [
          { key: "keyword", fontStyle: "none", color: "#ff00ff", defaultColor: "#B2AADD" },
        ],
      });
      const resetButton = getKeywordColorControl().querySelector(".reset-button") as HTMLElement;
      resetButton.click();

      showSyntaxViewAgain();

      expect(getKeywordHexInput().value).toBe("#B2AADD");
    });
  });

  describe("Profile Management Validation", () => {
    it("should prevent profile save with empty string", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      const profileNameInput = document.getElementById("profile-name-input") as HTMLInputElement;
      const saveProfileBtn = document.getElementById("save-profile-btn") as HTMLButtonElement;

      profileNameInput.value = "";
      saveProfileBtn.click();

      expect(mockPostMessage).not.toHaveBeenCalled();

      profileNameInput.value = "   ";
      saveProfileBtn.click();

      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("should prevent saving profile with name 'Default'", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      const profileNameInput = document.getElementById("profile-name-input") as HTMLInputElement;
      const saveProfileBtn = document.getElementById("save-profile-btn") as HTMLButtonElement;

      profileNameInput.value = "Default";
      saveProfileBtn.click();

      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("should handle rapid profile switches correctly", () => {
      uiManager.populateAllSettings(mockSettingsPayload);
      const profileSelect = document.getElementById("profile-select") as HTMLSelectElement;
      mockPostMessage.mockClear();

      profileSelect.value = "Custom Profile 1";
      profileSelect.dispatchEvent(new Event("change"));

      profileSelect.value = "Work Theme";
      profileSelect.dispatchEvent(new Event("change"));

      profileSelect.value = "Default";
      profileSelect.dispatchEvent(new Event("change"));

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
