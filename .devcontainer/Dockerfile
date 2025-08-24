# Start from Microsoft's official Dev Container image for TypeScript and Node.js.
# This image comes with Node.js, npm, TypeScript, and many useful tools pre-installed.
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install git, gnupg, and sudo for GPG forwarding and permissions
RUN apt-get update && apt-get install -y gnupg pinentry-curses

# Install the VS Code Extension command-line tool (vsce) globally.
# This is essential for packaging the extension into a .vsix file.
RUN su node -c "npm install -g @vscode/vsce"