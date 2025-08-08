interface VsCodeApi {
  postMessage(message: any): void;
}
declare function acquireVsCodeApi(): VsCodeApi;
const vscode = acquireVsCodeApi();

function initialize() {
  const accentContainer = document.getElementById("accent-container");
  const settingsContainer = document.getElementById("settings-container");
  const customAccentPickerContainer = document.getElementById("custom-accent-picker-container");
  const customAccentPicker = document.getElementById("custom-accent-picker") as HTMLInputElement;
  const customAccentHexInput = document.getElementById("custom-accent-hex-input") as HTMLInputElement;
  const flavorTitle = document.getElementById("current-flavor");

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

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.command === "loadSettings") {
      const { activeFlavor, syntaxSettings, currentAccent, accentOptions, customAccentColor, defaultFontStyles } =
        message.settings;

      // Clear previous content to handle re-renders when the theme changes
      accentContainer.innerHTML = ""; // Clear accent container
      settingsContainer.innerHTML = ""; // Clear settings container

      // Restore the custom accent picker container to its original state
      accentContainer.appendChild(customAccentPickerContainer);

      // Update flavor title
      flavorTitle.textContent = `Editing: ${activeFlavor.charAt(0).toUpperCase() + activeFlavor.slice(1)}`;

      // --- 1. Render Accent Color Dropdown ---
      const accentSelectContainer = document.createElement("div");
      accentSelectContainer.style.display = "grid";
      accentSelectContainer.style.gridTemplateColumns = "auto 1fr";
      accentSelectContainer.style.gap = "10px 20px";
      accentSelectContainer.style.alignItems = "center";

      const accentLabel = document.createElement("label");
      accentLabel.textContent = "Accent Color:";
      const accentSelect = document.createElement("select");

      accentOptions.forEach((option: string) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (currentAccent === option) {
          optionElement.selected = true;
        }
        accentSelect.appendChild(optionElement);
      });

      const handleAccentChange = (value: string) => {
        if (value === "custom") {
          customAccentPickerContainer.style.display = "grid";
        } else {
          customAccentPickerContainer.style.display = "none";
        }
      };

      accentSelect.addEventListener("change", (e) => {
        const newValue = (e.target as HTMLSelectElement).value;
        handleAccentChange(newValue);
        vscode.postMessage({ command: "updateAccent", value: newValue });
      });

      accentSelectContainer.appendChild(accentLabel);
      accentSelectContainer.appendChild(accentSelect);
      accentContainer.insertBefore(accentSelectContainer, customAccentPickerContainer);

      // --- 2. Initialize Custom Accent Picker & Hex Input ---
      customAccentPicker.value = customAccentColor;
      customAccentHexInput.value = customAccentColor;
      handleAccentChange(currentAccent);

      customAccentPicker.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        customAccentHexInput.value = newValue;
        vscode.postMessage({ command: "updateCustomAccent", value: newValue });
      });

      customAccentHexInput.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        if (/^#[0-9a-fA-F]{6}$/.test(newValue)) {
          customAccentPicker.value = newValue;
          vscode.postMessage({ command: "updateCustomAccent", value: newValue });
        }
      });

      // --- 3. Render Syntax Settings ---
      syntaxSettings.forEach((setting: any) => {
        const { key, fontStyle, color, defaultColor } = setting;

        // Label
        const label = document.createElement("label");
        label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
        label.htmlFor = key;

        // Font Style Dropdown
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
          vscode.postMessage({ command: "updateSetting", key: `${key}FontStyle`, value: newValue });
        });

        // Color Picker
        const colorPickerWrapper = document.createElement("div");
        colorPickerWrapper.className = "color-picker-wrapper";
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = color;
        const hexInput = document.createElement("input");
        hexInput.type = "text";
        hexInput.value = color;
        hexInput.maxLength = 7;

        colorInput.addEventListener("input", (e) => {
          const newColor = (e.target as HTMLInputElement).value;
          hexInput.value = newColor;
          vscode.postMessage({ command: "updateSyntaxColor", flavor: activeFlavor, key, value: newColor });
        });

        hexInput.addEventListener("input", (e) => {
          const newColor = (e.target as HTMLInputElement).value;
          if (/^#[0-9a-fA-F]{6}$/.test(newColor)) {
            colorInput.value = newColor;
            vscode.postMessage({ command: "updateSyntaxColor", flavor: activeFlavor, key, value: newColor });
          }
        });

        colorPickerWrapper.appendChild(colorInput);
        colorPickerWrapper.appendChild(hexInput);

        // Reset Button
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset";
        resetButton.className = "reset-button";
        resetButton.addEventListener("click", () => {
          colorInput.value = defaultColor;
          hexInput.value = defaultColor;
          vscode.postMessage({ command: "resetSyntaxColor", flavor: activeFlavor, key });
        });

        // Append all to container
        settingsContainer.appendChild(label);
        settingsContainer.appendChild(select);
        settingsContainer.appendChild(colorPickerWrapper);
        settingsContainer.appendChild(resetButton);
      });
    }
  });
}

initialize();
