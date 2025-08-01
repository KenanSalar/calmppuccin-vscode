const vscode = require("vscode");
const { buildAllFlavors } = require("./build");

function activate(context) {
  console.log("Calmppuccin theme is now active!");

  // The command that will regenerate themes when the accent color changes.
  const regenerateThemesCommand = vscode.commands.registerCommand("calmppuccin.regenerateThemes", async () => {
    try {
      // Get the user's chosen accent color from settings.
      const config = vscode.workspace.getConfiguration("calmppuccin");
      const accent = config.get("accent", "sapphire"); // Use the same default as package.json

      // Run the build script to update all theme files.
      await buildAllFlavors(accent);

      // Prompt the user to reload to apply the changes.
      const selection = await vscode.window.showInformationMessage(
        `Calmppuccin accent updated to ${accent}. Reload to apply.`,
        "Reload Window"
      );

      if (selection === "Reload Window") {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("Failed to update Calmppuccin themes.");
    }
  });

  // Create a listener that watches for changes to the user's settings.
  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
    // If the setting that changed is 'calmppuccin.accent', run our command.
    if (event.affectsConfiguration("calmppuccin.accent")) {
      vscode.commands.executeCommand("calmppuccin.regenerateThemes");
    }
  });

  // Add the command and the listener to the extension's subscriptions so they get cleaned up on deactivation.
  context.subscriptions.push(regenerateThemesCommand, settingsChangeListener);

  // On first-time activation, we run the build immediately.
  // This ensures the theme files exist right after the user installs the extension.
  const initialConfig = vscode.workspace.getConfiguration("calmppuccin");
  const initialAccent = initialConfig.get("accent", "sapphire");
  buildAllFlavors(initialAccent);
}

// This function is called when the extension is deactivated.
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
