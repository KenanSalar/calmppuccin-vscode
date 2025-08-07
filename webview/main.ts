interface VsCodeApi {
  postMessage(message: any): void;
}
declare function acquireVsCodeApi(): VsCodeApi;
const vscode = acquireVsCodeApi();

function initialize() {
  const accentContainer = document.getElementById("accent-container");
  const settingsContainer = document.getElementById("settings-container");
  if (!settingsContainer || !accentContainer) return;

  const fontStyleOptions = ["none", "italic", "bold", "italic bold", "underline"];

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message.command === "loadSettings") {
      const { currentAccent, accentOptions, fontStyles } = message.settings;

      // --- 1. Render Accent Color Dropdown ---
      accentContainer.innerHTML = ""; // Clear previous
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

      accentSelect.addEventListener("change", (e) => {
        const newValue = (e.target as HTMLSelectElement).value;
        vscode.postMessage({ command: "updateAccent", value: newValue });
      });

      accentContainer.appendChild(accentLabel);
      accentContainer.appendChild(accentSelect);

      // --- 2. Render Font Style Dropdowns ---
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
