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
(global as any).acquireVsCodeApi = jest.fn(() => mockVscode);

// --- HTML Fixture ---
const htmlFixture = `
  <h2 id="current-flavor"></h2>
  <select id="profile-select"></select>
  <input type="text" id="profile-name-input" />
  <button id="save-profile-btn"></button>
  <button id="delete-profile-btn"></button>
  <button id="reset-profile-btn"></button>
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
    <button id="dialog-confirm-button"></button>
    <button id="dialog-cancel-button"></button>
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
    (global as any).acquireVsCodeApi.mockClear();
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

    const content = codePreview!.innerHTML;

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
});
