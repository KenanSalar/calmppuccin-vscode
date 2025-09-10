#!/bin/bash
set -e

echo "--- Installing and configuring Atuin ---"

# Install Atuin if it's not already on the PATH
if ! command -v atuin &> /dev/null; then
    echo "Atuin not found, installing..."
    # The -y flag accepts the default installation location (~/.atuin)
    bash <(curl https://raw.githubusercontent.com/atuinsh/atuin/main/install.sh) -y
else
    echo "Atuin already installed. Skipping installation."
fi

# Configure Atuin to provide autosuggestions
ATUIN_CONFIG_DIR="/home/node/.config/atuin"
mkdir -p "$ATUIN_CONFIG_DIR"
cat <<'EOF' > "$ATUIN_CONFIG_DIR/config.toml"
# Use fuzzy searching for commands
search_mode = "fuzzy"
# Use a compact UI for Ctrl+R
style = "compact"
# Enable inline autosuggestions that appear as you type
inline_height = 10
# How to accept a suggestion. "shell" means use the shell's binding (usually right arrow or tab).
suggestion_accept_key = "shell"
# When to show suggestions. "auto" is the default.
suggestion_mode = "auto"
EOF

# Ensure Atuin's binary directory exists and has the right permissions
mkdir -p /home/node/.atuin
chown -R node:node /home/node/.atuin /home/node/.config/atuin

echo "Atuin setup complete."