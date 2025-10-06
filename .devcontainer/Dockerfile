FROM mcr.microsoft.com/devcontainers/typescript-node:22

USER root
# Install build tools for ble.sh, plus fzf and other utilities.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    make \
    gawk \
    gnupg \
    pinentry-curses \
    fzf \
    git \
    zoxide

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates wget gpg
# Add eza's apt repository and install eza
RUN mkdir -p /etc/apt/keyrings \
    && wget -qO- https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | gpg --dearmor -o /etc/apt/keyrings/eza-archive-keyring.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/eza-archive-keyring.gpg] http://deb.gierens.de stable main" > /etc/apt/sources.list.d/eza.list \
    && chmod 644 /etc/apt/keyrings/eza-archive-keyring.gpg /etc/apt/sources.list.d/eza.list \
    && apt-get update \
    && apt-get install -y eza

WORKDIR /workspaces/calmppuccin-vscode

# Global CLI tools for packaging
RUN npm install -g @vscode/vsce

# Copy deps files and install dependencies
COPY --chown=node:node package*.json ./
RUN npm ci

# Copy all source code last (so dependency cache survives code changes)
COPY --chown=node:node . .
