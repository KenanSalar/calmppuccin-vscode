import iro from "@jaames/iro";

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
  const flavorTitle = document.getElementById("current-flavor");
  const modal = document.getElementById("color-picker-modal");
  const iroPickerContainer = document.getElementById("iro-picker-container");
  const modalHexInput = document.getElementById("modal-hex-input") as HTMLInputElement;

  // Get specific references for the standard HTML accent color inputs
  const customAccentPicker = document.getElementById("custom-accent-picker") as HTMLInputElement;
  const customAccentHexInput = document.getElementById("custom-accent-hex-input") as HTMLInputElement;

  // If any essential element isn't found, exit early to prevent errors.
  if (
    !settingsContainer ||
    !accentContainer ||
    !customAccentPickerContainer ||
    !flavorTitle ||
    !modal ||
    !iroPickerContainer ||
    !customAccentPicker ||
    !customAccentHexInput
  )
    return;

  const fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];
  const hexRegex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  const hex6Regex = /^#[0-9a-fA-F]{6}$/; // Regex for 6-digit hex only for the accent color
  let activeColorPicker: iro.ColorPicker | null = null;

  // When the user clicks on the dark overlay, hide the modal and clean up the color picker.
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      if (activeColorPicker) {
        (activeColorPicker.base as HTMLElement).remove();
        activeColorPicker = null;
      }
    }
  });

  /**
   * Creates and displays the iro.js color picker in a modal.
   * This is now ONLY used for syntax colors.
   */
  const openColorPicker = (
    initialColor: string,
    targetHexInput: HTMLInputElement,
    onColorChange: (color: iro.Color) => void
  ) => {
    if (activeColorPicker) {
      (activeColorPicker.base as HTMLElement).remove();
    }
    modal.style.display = "flex";

    activeColorPicker = new (iro.ColorPicker as any)(iroPickerContainer, {
      width: 240,
      color: initialColor,
      borderWidth: 1,
      borderColor: "var(--vscode-input-border)",
      layout: [
        { component: (iro.ui as any).Wheel },
        { component: (iro.ui as any).Slider, options: { sliderType: "alpha" } },
      ],
    });

    activeColorPicker!.on("color:change", (color: iro.Color) => {
      const newHex = color.hex8String;
      modalHexInput.value = newHex;
      targetHexInput.value = newHex;
    });

    activeColorPicker!.on("input:end", (color: iro.Color) => {
      onColorChange(color);
    });

    modalHexInput.value = activeColorPicker!.color.hex8String;
    modalHexInput.oninput = () => {
      if (hexRegex.test(modalHexInput.value)) {
        activeColorPicker!.color.hexString = modalHexInput.value;
      }
    };
  };

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.command === "loadSettings") {
      const { activeFlavor, syntaxSettings, currentAccent, accentOptions, customAccentColor, defaultFontStyles } =
        message.settings;

      accentContainer.innerHTML = "";
      settingsContainer.innerHTML = "";
      accentContainer.appendChild(customAccentPickerContainer);
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
      accentOptions.forEach((option: string) => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (currentAccent === option) optionElement.selected = true;
        accentSelect.appendChild(optionElement);
      });
      const handleAccentChange = (value: string) => {
        customAccentPickerContainer.style.display = value === "custom" ? "grid" : "none";
      };
      accentSelect.addEventListener("change", (e) => {
        const newValue = (e.target as HTMLSelectElement).value;
        handleAccentChange(newValue);
        vscode.postMessage({ command: "updateAccent", value: newValue });
      });
      accentSelectContainer.appendChild(accentLabel);
      accentSelectContainer.appendChild(accentSelect);
      accentContainer.insertBefore(accentSelectContainer, customAccentPickerContainer);

      // --- 2. INITIALIZE CUSTOM ACCENT PICKER (STANDARD HTML VERSION) ---
      // This logic is now fully restored to its simple, original state.
      customAccentPicker.value = customAccentColor;
      customAccentHexInput.value = customAccentColor;
      customAccentHexInput.maxLength = 7; // Only allow 6-digit hex + #

      handleAccentChange(currentAccent);

      // Simple event listener for the standard color picker
      customAccentPicker.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        customAccentHexInput.value = newValue;
        vscode.postMessage({ command: "updateCustomAccent", value: newValue });
      });

      // Simple event listener for the hex input
      customAccentHexInput.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        // Use the 6-digit regex here
        if (hex6Regex.test(newValue)) {
          customAccentPicker.value = newValue;
          vscode.postMessage({ command: "updateCustomAccent", value: newValue });
        }
      });

      // --- 3. RENDER SYNTAX SETTINGS ROWS (IRO.JS VERSION) ---
      syntaxSettings.forEach((setting: any) => {
        const { key, fontStyle, color, defaultColor } = setting;
        const fontStyleKey = `${key}FontStyle`;
        const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";

        const label = document.createElement("label");
        label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
        label.htmlFor = key;

        // --- Font Style Dropdown & Reset ---
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

        const fontResetButton = document.createElement("button");
        fontResetButton.textContent = "Reset";
        fontResetButton.className = "reset-button";
        fontResetButton.addEventListener("click", () => {
          select.value = defaultFontStyle;
          vscode.postMessage({ command: "resetFontStyle", key: fontStyleKey });
        });

        // --- Color Control Group (Swatch + Hex Input) ---
        const colorInputWrapper = document.createElement("div");
        colorInputWrapper.className = "color-input-wrapper";
        const colorSwatch = document.createElement("div");
        colorSwatch.className = "color-swatch";
        colorSwatch.style.backgroundColor = color;
        const hexInput = document.createElement("input");
        hexInput.type = "text";
        hexInput.className = "hex-input-display";
        hexInput.value = color;
        hexInput.readOnly = true;
        colorInputWrapper.appendChild(colorSwatch);
        colorInputWrapper.appendChild(hexInput);

        // This click listener correctly opens the iro.js modal for syntax colors
        colorSwatch.addEventListener("click", () => {
          openColorPicker(hexInput.value, hexInput, (newColor) => {
            const finalColor = newColor.hex8String;
            colorSwatch.style.backgroundColor = finalColor;
            vscode.postMessage({ command: "updateSyntaxColor", flavor: activeFlavor, key, value: finalColor });
          });
        });

        // --- Color Reset Button ---
        const colorResetButton = document.createElement("button");
        colorResetButton.textContent = "Reset";
        colorResetButton.className = "reset-button";
        colorResetButton.addEventListener("click", () => {
          colorSwatch.style.backgroundColor = defaultColor;
          hexInput.value = defaultColor;
          vscode.postMessage({ command: "resetSyntaxColor", flavor: activeFlavor, key });
        });

        // --- Assemble and Append Everything ---
        settingsContainer.appendChild(label);

        const fontContainer = document.createElement("div");
        fontContainer.className = "setting-with-reset";
        fontContainer.appendChild(select);
        fontContainer.appendChild(fontResetButton);
        settingsContainer.appendChild(fontContainer);

        const colorContainer = document.createElement("div");
        colorContainer.className = "setting-with-reset";
        colorContainer.appendChild(colorInputWrapper);
        colorContainer.appendChild(colorResetButton);
        settingsContainer.appendChild(colorContainer);
      });

      // --- Add "Reset All" Button ---
      const resetButtonContainer = document.createElement("div");
      resetButtonContainer.className = "reset-all-container";
      const resetAllButton = document.createElement("button");
      resetAllButton.textContent = "Reset All Settings to Default";
      resetAllButton.style.width = "100%";
      resetAllButton.style.padding = "10px";
      resetAllButton.style.cursor = "pointer";
      resetAllButton.style.backgroundColor = "var(--vscode-button-secondaryBackground)";
      resetAllButton.style.color = "var(--vscode-button-secondaryForeground)";
      resetAllButton.style.border = "1px solid var(--vscode-input-border)";
      resetAllButton.addEventListener("click", () => {
        vscode.postMessage({ command: "resetAll" });
      });
      resetButtonContainer.appendChild(resetAllButton);
      settingsContainer.appendChild(resetButtonContainer);
    }
  });
}

// Start the script.
initialize();
