#!/bin/bash
# works on linux (i only used it on fedora kde)
set -e

GPG_DIR=~/.gnupg
mkdir -p "$GPG_DIR" && chmod 700 "$GPG_DIR"

# Good terminal behavior for GPG
if ! grep -q "export GPG_TTY" ~/.bashrc; then
  echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
fi
