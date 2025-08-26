#!/usr/bin/env bash

# This is a linux script which works for me on fedora kde

set -euo pipefail

IMAGE_NAME="calmppuccin-builder:local"
CONTAINER_NAME="calmppuccin-builder-local"
WORKDIR="/workspaces/calmppuccin-vscode"

log() { printf "\n--- %s ---\n" "$*"; }

log "Cleaning up previous run (if any)"
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

log "Building Docker Image"
docker build -t "$IMAGE_NAME" -f ./.devcontainer/Dockerfile .

log "Running Tests Inside the Container"
docker run --rm --workdir "$WORKDIR" "$IMAGE_NAME" npm test

log "Building and Packaging the Extension (bind-mounting host to collect VSIX)"
mkdir -p ./out

docker run --rm \
  -v "$PWD/out":/out \
  --workdir "$WORKDIR" \
  "$IMAGE_NAME" \
  sh -lc 'npm run package && cp /workspaces/calmppuccin-vscode/calmppuccin-vscode-*.vsix /out/'

ls -l ./out

log "Moving VSIX next to this script"
cp ./out/*.vsix .
ls -l ./*.vsix

echo ""
echo "✅ CI pipeline test finished successfully."
