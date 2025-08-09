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
  const customAccentPicker = document.getElementById("custom-accent-picker") as HTMLInputElement;
  const customAccentHexInput = document.getElementById("custom-accent-hex-input") as HTMLInputElement;

  // NEW: Get references for the preview pane
  const previewPane = document.getElementById("preview-pane");
  const resetAllContainer = document.getElementById("reset-all-container");

  // If any essential element isn't found, exit early to prevent errors.
  if (
    !settingsContainer ||
    !accentContainer ||
    !customAccentPickerContainer ||
    !flavorTitle ||
    !modal ||
    !iroPickerContainer ||
    !customAccentPicker ||
    !customAccentHexInput ||
    !previewPane ||
    !resetAllContainer
  )
    return;

  // In-memory state for the preview styles.
  let previewState: { [key: string]: { color?: string; fontStyle?: string } } = {};

  const fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];
  const hexRegex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  const hex6Regex = /^#[0-9a-fA-F]{6}$/;
  let activeColorPicker: iro.ColorPicker | null = null;

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
   * NEW: Updates the styles of the tokens in the preview pane.
   */
  function updatePreviewPane() {
    for (const tokenKey in previewState) {
      const elements = previewPane!.querySelectorAll(`[data-token="${tokenKey}"]`);
      elements.forEach((el) => {
        const element = el as HTMLElement;
        const tokenStyle = previewState[tokenKey];

        if (tokenStyle.color) {
          element.style.color = tokenStyle.color;
        }

        if (tokenStyle.fontStyle) {
          const style = tokenStyle.fontStyle;
          element.style.fontStyle = style.includes("italic") ? "italic" : "normal";
          element.style.fontWeight = style.includes("bold") ? "bold" : "normal";
          element.style.textDecoration = style.includes("underline") ? "underline" : "none";
        }
      });
    }
  }

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
    activeColorPicker!.on("input:end", onColorChange);
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
      const {
        activeFlavor,
        syntaxSettings,
        currentAccent,
        accentOptions,
        customAccentColor,
        defaultFontStyles,
        activeThemeBackgroundColor,
      } = message.settings;

      // Clear previous controls
      accentContainer.innerHTML = "";
      settingsContainer.innerHTML = "";
      resetAllContainer.innerHTML = "";
      accentContainer.appendChild(customAccentPickerContainer);

      flavorTitle.textContent = `Editing: ${activeFlavor.charAt(0).toUpperCase() + activeFlavor.slice(1)}`;
      // NEW: Set the background color of the preview pane
      previewPane.style.backgroundColor = activeThemeBackgroundColor;

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

      // --- 2. INITIALIZE CUSTOM ACCENT PICKER ---
      customAccentPicker.value = customAccentColor;
      customAccentHexInput.value = customAccentColor;
      customAccentHexInput.maxLength = 7;
      handleAccentChange(currentAccent);
      customAccentPicker.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        customAccentHexInput.value = newValue;
        vscode.postMessage({ command: "updateCustomAccent", value: newValue });
      });
      customAccentHexInput.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        if (hex6Regex.test(newValue)) {
          customAccentPicker.value = newValue;
          vscode.postMessage({ command: "updateCustomAccent", value: newValue });
        }
      });

      // --- 3. RENDER SYNTAX SETTINGS & INITIALIZE PREVIEW STATE ---
      previewState = {}; // Reset state on load
      syntaxSettings.forEach((setting: any) => {
        const { key, fontStyle, color, defaultColor } = setting;
        const fontStyleKey = `${key}FontStyle`;
        const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";

        // Initialize the in-memory state for the preview
        previewState[key] = { color: color, fontStyle: fontStyle };

        const label = document.createElement("label");
        label.textContent = key.replace(/([A-Z])/g, " $1").trim() + ":";
        label.htmlFor = key;

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
          // 1. Update state, 2. Update preview, 3. Save setting
          previewState[key].fontStyle = newValue;
          updatePreviewPane();
          vscode.postMessage({ command: "updateSetting", key: fontStyleKey, value: newValue });
        });

        const fontResetButton = document.createElement("button");
        fontResetButton.textContent = "Reset";
        fontResetButton.className = "reset-button";
        fontResetButton.addEventListener("click", () => {
          select.value = defaultFontStyle;
          // 1. Update state, 2. Update preview, 3. Save setting
          previewState[key].fontStyle = defaultFontStyle;
          updatePreviewPane();
          vscode.postMessage({ command: "resetFontStyle", key: fontStyleKey });
        });

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
        colorSwatch.addEventListener("click", () => {
          openColorPicker(hexInput.value, hexInput, (newColor) => {
            const finalColor = newColor.hex8String;
            colorSwatch.style.backgroundColor = finalColor;
            // 1. Update state, 2. Update preview, 3. Save setting
            previewState[key].color = finalColor;
            updatePreviewPane();
            vscode.postMessage({ command: "updateSyntaxColor", flavor: activeFlavor, key, value: finalColor });
          });
        });

        const colorResetButton = document.createElement("button");
        colorResetButton.textContent = "Reset";
        colorResetButton.className = "reset-button";
        colorResetButton.addEventListener("click", () => {
          colorSwatch.style.backgroundColor = defaultColor;
          hexInput.value = defaultColor;
          // 1. Update state, 2. Update preview, 3. Save setting
          previewState[key].color = defaultColor;
          updatePreviewPane();
          vscode.postMessage({ command: "resetSyntaxColor", flavor: activeFlavor, key });
        });

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

      // Perform the initial render of the preview styles
      updatePreviewPane();

      // --- 4. ADD "RESET ALL" BUTTON ---
      const resetAllButton = document.createElement("button");
      resetAllButton.textContent = "Reset All Settings to Default";
      resetAllButton.className = "reset-all-button";
      resetAllButton.addEventListener("click", () => {
        // Post the message, the backend will trigger a reload and this webview will get new default settings
        vscode.postMessage({ command: "resetAll" });
      });
      resetAllContainer.appendChild(resetAllButton);
    }
  });
}

// Start the script.
initialize();
