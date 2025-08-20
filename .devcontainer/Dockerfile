# Start from Microsoft's official Dev Container image for TypeScript and Node.js.
# This image comes with Node.js, npm, TypeScript, and many useful tools pre-installed.
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# The base image already has a non-root user named 'node'.
# Add any extra OS-level dependencies here if needed in the future.
# For example: RUN sudo apt-get update && sudo apt-get install -y some-tool

# Install the VS Code Extension command-line tool (vsce) globally.
# This is essential for packaging the extension into a .vsix file.
RUN su node -c "npm install -g @vscode/vsce"