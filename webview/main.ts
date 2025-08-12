import { codeSnippets } from "./snippets";

interface VsCodeApi {
  postMessage(message: any): void;
}
declare function acquireVsCodeApi(): VsCodeApi;
const vscode = acquireVsCodeApi();

function initialize() {
  const accentContainer = document.getElementById("accent-container");
  const settingsContainer = document.getElementById("settings-container");
  const customAccentPickerContainer = document.getElementById("custom-accent-picker-container");
  const flavorTitle = document.getElementById("current-flavor");
  const customAccentPicker = document.getElementById("custom-accent-picker") as HTMLInputElement;
  const customAccentHexInput = document.getElementById("custom-accent-hex-input") as HTMLInputElement;
  const previewPane = document.getElementById("preview-pane");
  const codePreview = document.getElementById("code-preview");
  const resetAllContainer = document.getElementById("reset-all-container");
  const languageSelect = document.getElementById("language-select") as HTMLSelectElement;

  if (
    !settingsContainer ||
    !accentContainer ||
    !customAccentPickerContainer ||
    !flavorTitle ||
    !customAccentPicker ||
    !customAccentHexInput ||
    !previewPane ||
    !resetAllContainer ||
    !codePreview ||
    !languageSelect
  )
    return;

  let previewState: { [key: string]: { color?: string; fontStyle?: string } } = {};
  let accentColorMap: { [key: string]: string } = {};

  const fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];
  const hex6Regex = /^#[0-9a-fA-F]{6}$/;

  function updateAccentColor(newColor: string) {
    document.documentElement.style.setProperty("--dynamic-accent-color", newColor);
  }

  function updatePreviewPane() {
    for (const tokenKey in previewState) {
      const elements = codePreview!.querySelectorAll(`[data-token="${tokenKey}"]`);
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

  for (const lang in codeSnippets) {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang;
    languageSelect.appendChild(option);
  }

  languageSelect.value = "csharp";
  codePreview.innerHTML = codeSnippets.csharp;

  languageSelect.addEventListener("change", (e) => {
    const selectedLanguage = (e.target as HTMLSelectElement).value;
    codePreview.innerHTML = codeSnippets[selectedLanguage];
    updatePreviewPane();
  });

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
        accentColorPalettes,
      } = message.settings;

      accentColorMap = accentColorPalettes;
      accentContainer.innerHTML = "";
      settingsContainer.innerHTML = "";
      resetAllContainer.innerHTML = "";
      accentContainer.appendChild(customAccentPickerContainer);

      flavorTitle.textContent = `Editing: ${activeFlavor.charAt(0).toUpperCase() + activeFlavor.slice(1)}`;
      previewPane.style.backgroundColor = activeThemeBackgroundColor;

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
        if (value === "custom") {
          updateAccentColor(customAccentPicker.value);
        } else {
          updateAccentColor(accentColorMap[value]);
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

      customAccentPicker.value = customAccentColor;
      customAccentHexInput.value = customAccentColor;
      customAccentHexInput.maxLength = 7;
      handleAccentChange(currentAccent);
      customAccentPicker.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        customAccentHexInput.value = newValue;
        updateAccentColor(newValue);
        vscode.postMessage({ command: "updateCustomAccent", value: newValue });
      });
      customAccentHexInput.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        if (hex6Regex.test(newValue)) {
          customAccentPicker.value = newValue;
          updateAccentColor(newValue);
          vscode.postMessage({ command: "updateCustomAccent", value: newValue });
        }
      });

      previewState = {};
      syntaxSettings.forEach((setting: any) => {
        const { key, fontStyle, color, defaultColor } = setting;
        const fontStyleKey = `${key}FontStyle`;
        const defaultFontStyle = defaultFontStyles[fontStyleKey] || "none";

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
          previewState[key].fontStyle = newValue;
          updatePreviewPane();
          vscode.postMessage({ command: "updateSetting", key: fontStyleKey, value: newValue });
        });

        const fontResetButton = document.createElement("button");
        fontResetButton.textContent = "Reset";
        fontResetButton.className = "reset-button";
        fontResetButton.addEventListener("click", () => {
          select.value = defaultFontStyle;
          previewState[key].fontStyle = defaultFontStyle;
          updatePreviewPane();
          vscode.postMessage({ command: "resetFontStyle", key: fontStyleKey });
        });

        // --- NEW LIBRARY-FREE PICKER LOGIC ---
        const wrapper = document.createElement("div");
        wrapper.className = "syntax-picker-wrapper";

        const topRow = document.createElement("div");
        topRow.className = "syntax-picker-top-row";

        const colorInput = document.createElement("input");
        colorInput.type = "color";

        const hexInput = document.createElement("input");
        hexInput.type = "text";
        hexInput.className = "hex-input-display";
        hexInput.readOnly = true;

        const alphaSlider = document.createElement("input");
        alphaSlider.type = "range";
        alphaSlider.min = "0";
        alphaSlider.max = "255";
        alphaSlider.step = "1";

        const initialColor = color || "#ffffffff";
        const rgb = initialColor.substring(0, 7);
        const alphaHex = initialColor.length === 9 ? initialColor.substring(7, 9) : "ff";
        const alphaInt = parseInt(alphaHex, 16);

        colorInput.value = rgb;
        alphaSlider.value = alphaInt.toString();
        hexInput.value = initialColor;

        // This function ONLY updates the live preview inside the webview
        const updateLivePreview = () => {
          const newRgb = colorInput.value;
          const newAlphaInt = parseInt(alphaSlider.value);
          const newAlphaHex = newAlphaInt.toString(16).padStart(2, "0");
          const finalColor = `${newRgb}${newAlphaHex}`;

          hexInput.value = finalColor;
          previewState[key].color = finalColor;
          updatePreviewPane();
        };

        // This function ONLY sends the final color to VS Code
        const sendFinalColorToVSCode = () => {
          const finalColor = hexInput.value;
          vscode.postMessage({ command: "updateSyntaxColor", flavor: activeFlavor, key, value: finalColor });
        };

        // Update the live preview instantly on the 'input' event
        colorInput.addEventListener("input", updateLivePreview);
        alphaSlider.addEventListener("input", updateLivePreview);

        // Send the final value to VS Code only on the 'change' event (when the user releases the mouse)
        colorInput.addEventListener("change", sendFinalColorToVSCode);
        alphaSlider.addEventListener("change", sendFinalColorToVSCode);

        const colorResetButton = document.createElement("button");
        colorResetButton.textContent = "Reset";
        colorResetButton.className = "reset-button";
        colorResetButton.addEventListener("click", () => {
          const defaultRgb = defaultColor.substring(0, 7);
          const defaultAlphaHex = defaultColor.length === 9 ? defaultColor.substring(7, 9) : "ff";
          const defaultAlphaInt = parseInt(defaultAlphaHex, 16);

          colorInput.value = defaultRgb;
          alphaSlider.value = defaultAlphaInt.toString();
          hexInput.value = defaultColor;

          previewState[key].color = defaultColor;
          updatePreviewPane();
          vscode.postMessage({ command: "resetSyntaxColor", flavor: activeFlavor, key });
        });

        topRow.appendChild(colorInput);
        topRow.appendChild(hexInput);
        wrapper.appendChild(topRow);
        wrapper.appendChild(alphaSlider);

        settingsContainer.appendChild(label);
        const fontContainer = document.createElement("div");
        fontContainer.className = "setting-with-reset";
        fontContainer.appendChild(select);
        fontContainer.appendChild(fontResetButton);
        settingsContainer.appendChild(fontContainer);
        const colorContainer = document.createElement("div");
        colorContainer.className = "setting-with-reset";
        colorContainer.appendChild(wrapper);
        colorContainer.appendChild(colorResetButton);
        settingsContainer.appendChild(colorContainer);
      });

      updatePreviewPane();
      handleAccentChange(currentAccent);

      const resetAllButton = document.createElement("button");
      resetAllButton.textContent = "Reset All Settings to Default";
      resetAllButton.className = "reset-all-button";
      resetAllButton.addEventListener("click", () => {
        vscode.postMessage({ command: "resetAll" });
      });
      resetAllContainer.appendChild(resetAllButton);
    }
  });
}

initialize();
