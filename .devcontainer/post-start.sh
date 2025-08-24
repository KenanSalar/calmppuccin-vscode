#!/bin/bash
set -e

GPG_DIR=~/.gnupg
mkdir -p "$GPG_DIR" && chmod 700 "$GPG_DIR"

# Ensure GPG_TTY is set for good measure
if ! grep -q "export GPG_TTY" ~/.bashrc; then
  echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
fi
