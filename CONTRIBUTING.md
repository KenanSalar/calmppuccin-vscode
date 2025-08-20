# Contributing to Calmppuccin for VS Code

First off, thank you for considering contributing to Calmppuccin! Your help is greatly appreciated. This guide will help you get your development environment set up and ready to go.

## Getting Started

The recommended and easiest way to contribute to this project is by using the included VS Code Dev Container. This ensures that you have the exact same development environment as the project maintainers, avoiding any "it works on my machine" issues.

### Prerequisites

Before you begin, please make sure you have the following installed on your system:

1. **Visual Studio Code**: The editor this theme is built for.
2. **Docker Desktop**: Or another OCI-compliant container runtime like Podman. This is required to build and run the dev container.
3. **VS Code "Dev Containers" Extension**: This extension allows VS Code to connect to and work inside the container.

### Setup

1. **Fork and Clone the Repository**:
    First, create a fork of the repository. You can do this by clicking the "Fork" button on the top right of the main repository's GitHub page.

    Then, clone **your forked repository** to your local machine. You can use HTTPS, SSH, or the GitHub CLI. Make sure to replace `<your-username>` with your own GitHub username.

    **HTTPS:**

    ```bash
    git clone https://github.com/<your-username>/calmppuccin-vscode.git
    ```

    **SSH:**

    ```bash
    git clone git@github.com:<your-username>/calmppuccin-vscode.git
    ```

    **GitHub CLI:**

    ```bash
    gh repo clone <your-username>/calmppuccin-vscode
    ```

    Finally, navigate into the project directory:

    ```bash
    cd calmppuccin-vscode
    ```

2. **Open in Dev Container**:
    Open the cloned project folder in VS Code. A notification will pop up in the bottom-right corner asking if you want to **"Reopen in Container"**. Click it.

    VS Code will then build the Docker image and start the container. The first time you do this, it may take a few minutes. Once it's done, VS Code will reload, and you'll be developing inside the container.

## Development Workflow

Once you are inside the dev container, your environment is ready.

### Debugging

To see your changes live, you can launch a debugging session.

1. Open the "Run and Debug" view (`Ctrl` + `Shift` + `D`).
2. Press the green "play" button at the top, or simply press `F5`.

This will open a new "Extension Development Host" window with your development version of the theme loaded. You can select your theme from the color theme picker and open any project to test the syntax highlighting.

#### A Note on Adding New Language Snippets

Due to the isolated nature of the dev container, testing syntax highlighting for a **new language** can be tricky, as the debug environment may not have the necessary language grammar installed.

For the specific task of creating and testing a new code snippet, it is recommended to **work on your local machine** where you have all the required VS Code language extensions already installed. This is because local project folders are not accessible from within the container's file system by default.

All other tasks, especially building and packaging, should still be done inside the dev container to ensure consistency.

### Building and Packaging

The theme files and the final extension package (`.vsix`) are generated from the source code.

To create the final `.vsix` file, run the following command in the terminal:

```bash
npm run package
```

This is the main command you'll need. It automatically runs the build script first to generate the theme files and then packages everything into a .vsix file (e.g., calmppuccin-vscode-1.6.1.vsix) in the root of your project.

If you only want to generate the theme files for debugging without creating the .vsix package, you can run:

```bash
npm run build-themes
```

### Submitting Changes

When you're ready to submit your contribution, please open a pull request against the dev branch of the main repository. Provide a clear description of the changes you've made.

Thank you again for your contribution!
