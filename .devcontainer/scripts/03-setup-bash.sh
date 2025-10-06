#!/bin/bash
set -e

echo "--- Setting up Bash with ble.sh, fzf, eza, zoxide, Atuin, and Starship ---"

BASH_RC=/home/node/.bashrc
BLESH_DIR="/home/node/.local/share/blesh"

# --- Install ble.sh ---
rm -rf "$BLESH_DIR"
echo "Cloning and building ble.sh..."
git clone --recursive https://github.com/akinomyoga/ble.sh.git "$BLESH_DIR"
make -C "$BLESH_DIR"

# --- Verification Step ---
if [ ! -f "$BLESH_DIR/out/ble.sh" ]; then
    echo "FATAL: ble.sh build failed."
    exit 1
fi

# --- Create .bashrc configuration ---
cat <<'EOF' > "$BASH_RC"
# ~/.bashrc: Integration for ble.sh, fzf, eza, zoxide atuin, and starship

# ---Set up the PATH ---
export PATH="$HOME/.atuin/bin:$PATH"
if [ -d "$HOME/.local/bin" ]; then
    export PATH="$HOME/.local/bin:$PATH"
fi

# Eza (a modern 'ls') aliases
alias ls='eza --icons --group-directories-first'
alias ll='eza -l --git --icons --group-directories-first'
alias tree='eza --tree --level=2 --icons --git-ignore'

# --- Load ble.sh FIRST ---
if [ -f "$HOME/.local/share/blesh/out/ble.sh" ]; then
  source "$HOME/.local/share/blesh/out/ble.sh"
fi

# --- Load and Integrate Key Binding Tools ---

# FZF Integration (the ble.sh way)
# Use the fzf integration script that comes with ble.sh for compatibility.
if [ -f "$HOME/.local/share/blesh/contrib/integration/fzf-key-bindings.bash" ]; then
  source "$HOME/.local/share/blesh/contrib/integration/fzf-key-bindings.bash"
fi

source "/usr/share/doc/fzf/examples/completion.bash" 2> /dev/null

# Atuin Integration
eval "$(atuin init bash)"
ble-bind -m emacs -f up '__atuin_history'
ble-bind -m vi_imap -f up '__atuin_history'

# Zoxide Integration
# A smarter 'cd' command that learns your habits.
eval "$(zoxide init bash)"

# --- Configure ble.sh Features ---
bleopt complete_auto_complete=1
bleopt complete_auto_delay=0
bleopt complete_auto_history=1

# --- Initialize Starship Prompt LAST ---
export STARSHIP_CONFIG="$HOME/.config/starship.toml"
PROMPT_COMMAND='PS1="$(starship prompt --status=$? --jobs=$(jobs -p | wc -l))"'

EOF

# --- Set Correct Ownership ---
chown -R node:node /home/node/.local /home/node/.bashrc

echo "Bash setup complete."