FROM mcr.microsoft.com/devcontainers/typescript-node:22

USER root
RUN apt-get update && apt-get install -y gnupg pinentry-curses
USER node

WORKDIR /workspaces/calmppuccin-vscode

# Global CLI tools for packaging
RUN npm install -g @vscode/vsce

# Copy deps files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm ci

# Copy all source code last (so dependency cache survives code changes)
COPY --chown=node:node . .
