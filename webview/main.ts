// Define an interface for the VS Code API object to get TypeScript support.
interface VsCodeApi {
  postMessage(message: any): void;
}
// This special function is provided by VS Code in the webview environment to get a handle to the API.
declare function acquireVsCodeApi(): VsCodeApi;
const vscode = acquireVsCodeApi();

function initialize() {
  // Get references to all the static HTML elements we'll need to interact with.
  const accentContainer = document.getElementById("accent-container");
  const settingsContainer = document.getElementById("settings-container");
  const customAccentPickerContainer = document.getElementById("custom-accent-picker-container");
  const customAccentPicker = document.getElementById("custom-accent-picker") as HTMLInputElement;
  const customAccentHexInput = document.getElementById("custom-accent-hex-input") as HTMLInputElement;
  const flavorTitle = document.getElementById("current-flavor");

  // If any essential element isn't found, exit early to prevent errors.
  if (
    !settingsContainer ||
    !accentContainer ||
    !customAccentPickerContainer ||
    !customAccentPicker ||
    !customAccentHexInput ||
    !flavorTitle
  )
    return;

  const fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];

  // A regular expression to validate a 6-digit (#RRGGBB) or 8-digit (#RRGGBBAA) hex code.
  const hexRegex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

  // Listen for messages sent from the extension's backend (SettingsPanel.ts).
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.command === "loadSettings") {
      // Destructure all the data sent from the extension.
      const { activeFlavor, syntaxSettings, currentAccent, accentOptions, customAccentColor, defaultFontStyles } =
        message.settings;

      // Clear previous content to handle re-renders when the active theme changes.
      accentContainer.innerHTML = "";
      settingsContainer.innerHTML = "";

      // The custom accent picker is part of the original HTML, so we re-append it after clearing.
      accentContainer.appendChild(customAccentPickerContainer);

      // Display the currently active theme flavor.
      flavorTitle.textContent = `Editing: ${activeFlavor.charAt(0).toUpperCase() + activeFlavor.slice(1)}`;

      // --- 1. RENDER ACCENT COLOR DROPDOWN ---
      const accentSelectContainer = document.createElement("div");
      accentSelectContainer.style.display = "grid";
      accentSelectContainer.style.gridTemplateColumns = "auto 1fr";
      accentSelectContainer.style.gap = "10px 20px";
      accentSelectContainer.style.alignItems = "center";

      const accentLabel = document.createElement("label");
      accentLabel.textContent = "Accent Color:";
      const accentSelect = document.createElement("select");

      // Populate the dropdown with all available accent colors.
      accentOptions.forEach((option: string) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (currentAccent === option) optionElement.selected = true;
        accentSelect.appendChild(optionElement);
      });

      // Shows or hides the custom color picker based on the dropdown's selection.
      const handleAccentChange = (value: string) => {
        customAccentPickerContainer.style.display = value === "custom" ? "grid" : "none";
      };

      // When the dropdown value changes, update the UI and notify the extension.
      accentSelect.addEventListener("change", (e) => {
        const newValue = (e.target as HTMLSelectElement).value;
        handleAccentChange(newValue);
        vscode.postMessage({ command: "updateAccent", value: newValue });
      });

      accentSelectContainer.appendChild(accentLabel);
      accentSelectContainer.appendChild(accentSelect);
      accentContainer.insertBefore(accentSelectContainer, customAccentPickerContainer);

      // --- 2. INITIALIZE CUSTOM ACCENT PICKER & HEX INPUT ---
      customAccentPicker.value = customAccentColor.substring(0, 7); // HTML color input only supports 6-digit hex.
      customAccentHexInput.value = customAccentColor;
      customAccentHexInput.maxLength = 9; // Allow for #RRGGBBAA.
      handleAccentChange(currentAccent);

      // Sync the color picker swatch to the text input.
      customAccentPicker.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        customAccentHexInput.value = newValue; // A change here is always a 6-digit hex.
        vscode.postMessage({ command: "updateCustomAccent", value: newValue });
      });

      // Sync the text input to the color picker swatch.
      customAccentHexInput.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        if (hexRegex.test(newValue)) {
          // Only update the color swatch if it's a valid 6-digit hex, as it doesn't understand alpha.
          if (newValue.length === 7) {
            customAccentPicker.value = newValue;
          }
          vscode.postMessage({ command: "updateCustomAccent", value: newValue });
        }
      });

      // --- 3. RENDER SYNTAX SETTINGS (FONT STYLES & COLORS) ---
      // Loop through each customizable syntax item and build its UI row.
      syntaxSettings.forEach((setting: any) => {
        const { key, fontStyle, color, defaultColor } = setting;
        const fontStyleKey = `${key}FontStyle`;
        const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";

        // Create the label for the row (e.g., "Keyword:").
        const label = document.createElement("label");
        label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
        label.htmlFor = key;

        // --- Font Style Dropdown ---
        const select = document.createElement("select");
        select.id = key;
        fontStyleOptions.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.textContent = option;
          if (fontStyle === option) opt.selected = true;
          select.appendChild(opt);
        });
        select.addEventListener("change", (e) => {
          const newValue = (e.target as HTMLSelectElement).value;
          vscode.postMessage({ command: "updateSetting", key: fontStyleKey, value: newValue });
        });

        // --- Font Style Reset Button ---
        const fontResetButton = document.createElement("button");
        fontResetButton.textContent = "Reset";
        fontResetButton.className = "reset-button";
        fontResetButton.addEventListener("click", () => {
          select.value = defaultFontStyle; // Visually reset the dropdown.
          vscode.postMessage({ command: "resetFontStyle", key: fontStyleKey });
        });

        // --- Color Picker ---
        const colorPickerWrapper = document.createElement("div");
        colorPickerWrapper.className = "color-picker-wrapper";
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = color.substring(0, 7); // The color swatch only understands 6-digit hex.
        const hexInput = document.createElement("input");
        hexInput.type = "text";
        hexInput.value = color;
        hexInput.maxLength = 9; // Allow #RRGGBBAA.

        colorInput.addEventListener("input", (e) => {
          const newColor = (e.target as HTMLInputElement).value;
          hexInput.value = newColor; // A change here always results in a 6-digit hex.
          vscode.postMessage({ command: "updateSyntaxColor", flavor: activeFlavor, key, value: newColor });
        });

        hexInput.addEventListener("input", (e) => {
          const newColor = (e.target as HTMLInputElement).value;
          if (hexRegex.test(newColor)) {
            // Only update the color swatch if it's a valid 6-digit hex.
            if (newColor.length === 7) {
              colorInput.value = newColor;
            }
            vscode.postMessage({ command: "updateSyntaxColor", flavor: activeFlavor, key, value: newColor });
          }
        });

        colorPickerWrapper.appendChild(colorInput);
        colorPickerWrapper.appendChild(hexInput);

        // --- Color Reset Button ---
        const colorResetButton = document.createElement("button");
        colorResetButton.textContent = "Reset";
        colorResetButton.className = "reset-button";
        colorResetButton.addEventListener("click", () => {
          colorInput.value = defaultColor.substring(0, 7); // Visually reset the color picker.
          hexInput.value = defaultColor;
          vscode.postMessage({ command: "resetSyntaxColor", flavor: activeFlavor, key });
        });

        // --- Assemble and Append to the Main Container ---
        settingsContainer.appendChild(label);

        // Group the font dropdown with its reset button.
        const fontContainer = document.createElement("div");
        fontContainer.className = "setting-with-reset";
        fontContainer.appendChild(select);
        fontContainer.appendChild(fontResetButton);
        settingsContainer.appendChild(fontContainer);

        // Group the color picker with its reset button.
        const colorContainer = document.createElement("div");
        colorContainer.className = "setting-with-reset";
        colorContainer.appendChild(colorPickerWrapper);
        colorContainer.appendChild(colorResetButton);
        settingsContainer.appendChild(colorContainer);
      });
    }
  });
}

// Start the script.
initialize();
