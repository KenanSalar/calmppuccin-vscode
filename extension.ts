import * as vscode from "vscode";
import { buildAllFlavors } from "./build";

export function activate(context: vscode.ExtensionContext) {
  console.log("Calmppuccin theme is now active!");

  const regenerateThemesCommand = vscode.commands.registerCommand("calmppuccin.regenerateThemes", async () => {
    try {
      const config = vscode.workspace.getConfiguration("calmppuccin");
      // Explicitly get the value as a string, providing a default.
      const accent = config.get<string>("accent", "sapphire");

      await buildAllFlavors(accent);

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

  const settingsChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
    if (event.affectsConfiguration("calmppuccin.accent")) {
      vscode.commands.executeCommand("calmppuccin.regenerateThemes");
    }
  });

  context.subscriptions.push(regenerateThemesCommand, settingsChangeListener);
}

export function deactivate() {}
