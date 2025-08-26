#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define a name for our Docker image
IMAGE_NAME="calmppuccin-builder:local"

echo "--- Building Docker Image ---"
docker build -t $IMAGE_NAME -f ./.devcontainer/Dockerfile .

echo ""
echo "--- Running Tests Inside the Container ---"
docker run --rm $IMAGE_NAME npm test

echo ""
echo "--- Building and Packaging the Extension ---"
# Give the temporary container a name so we can copy the file from it
docker run --name builder-container $IMAGE_NAME npm run package

echo ""
echo "--- Copying .vsix file from Container ---"
# Copy the generated .vsix file to your local directory
docker cp builder-container:/workspaces/calmppuccin-vscode/calmppuccin-vscode-*.vsix .

echo ""
echo "--- Cleaning up Container ---"
docker rm builder-container

echo ""
echo "✅ CI pipeline test finished successfully."
ls ./*.vsix