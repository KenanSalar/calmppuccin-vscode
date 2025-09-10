#!/bin/bash
set -e

# This script runs all other setup scripts in order.
# The DIR variable ensures that we can call the other scripts relative to this one's location.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "--- Running all setup scripts ---"

# --- INSTALL TOOLS ---
bash "$DIR/01-install-and-configure-starship.sh"
bash "$DIR/02-install-atuin.sh"

# --- CONFIGURE SHELL ---
bash "$DIR/03-setup-bash.sh"

# --- GPG Directory Setup ---
GPG_DIR=~/.gnupg
mkdir -p "$GPG_DIR" && chmod 700 "$GPG_DIR"
chown -R node:node "$GPG_DIR"

echo "--- Installing Node.js dependencies ---"
# Navigate to the workspace folder to run npm install
cd /workspaces/calmppuccin-vscode && npm install

echo "--- All setup scripts complete ---"