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

  if (!settingsContainer || !accentContainer || !customAccentPickerContainer || !customAccentPicker || !customAccentHexInput)
    return;

  const fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.command === "loadSettings") {
      const { currentAccent, accentOptions, customAccentColor, fontStyles } = message.settings;

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
      accentContainer.insertBefore(accentSelectContainer, accentContainer.firstChild);

      // --- 2. Initialize Custom Accent Picker & Hex Input ---
      customAccentPicker.value = customAccentColor;
      customAccentHexInput.value = customAccentColor;
      handleAccentChange(currentAccent);

      // Sync color picker to hex input
      customAccentPicker.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        customAccentHexInput.value = newValue;
        vscode.postMessage({ command: "updateCustomAccent", value: newValue });
      });

      // Sync hex input to color picker
      customAccentHexInput.addEventListener("input", (e) => {
        const newValue = (e.target as HTMLInputElement).value;
        if (/^#[0-9a-fA-F]{6}$/.test(newValue)) {
          customAccentPicker.value = newValue;
          vscode.postMessage({ command: "updateCustomAccent", value: newValue });
        }
      });

      // --- 3. Render Font Style Dropdowns ---
      settingsContainer.innerHTML = ""; // Clear previous
      for (const key in fontStyles) {
        const label = document.createElement("label");
        label.textContent =
          key
            .replace(/([A-Z])/g, " $1")
            .replace("Font Style", "")
            .trim() + ":";
        label.htmlFor = key;

        const select = document.createElement("select");
        select.id = key;

        fontStyleOptions.forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.value = option;
          optionElement.textContent = option;
          if (fontStyles[key] === option) {
            optionElement.selected = true;
          }
          select.appendChild(optionElement);
        });

        select.addEventListener("change", (e) => {
          const newValue = (e.target as HTMLSelectElement).value;
          vscode.postMessage({ command: "updateSetting", key: key, value: newValue });
        });

        settingsContainer.appendChild(label);
        settingsContainer.appendChild(select);
      }
    }
  });
}

initialize();
