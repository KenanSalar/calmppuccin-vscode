#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define names for our Docker image and the temporary container
IMAGE_NAME="calmppuccin-builder:local"
CONTAINER_NAME="builder-container"

echo "--- Cleaning up previous run (if any) ---"
# Forcefully remove the container if it exists, and ignore errors if it doesn't.
docker rm -f $CONTAINER_NAME > /dev/null 2>&1 || true

echo ""
echo "--- Building Docker Image ---"
docker build -t $IMAGE_NAME -f ./.devcontainer/Dockerfile .

echo ""
echo "--- Running Tests Inside the Container ---"
# This container is temporary and is removed automatically with --rm
docker run --rm $IMAGE_NAME npm test

echo ""
echo "--- Building and Packaging the Extension ---"
# Give the temporary container a name so we can copy the file from it
docker run --name $CONTAINER_NAME $IMAGE_NAME npm run package

echo ""
echo "--- Copying .vsix file from Container ---"
# First, find the exact name of the .vsix file inside the container
VSIX_FILE=$(docker exec $CONTAINER_NAME find /workspaces/calmppuccin-vscode -name "*.vsix" -print -quit)

# Now, copy the file using its exact name
docker cp "${CONTAINER_NAME}:${VSIX_FILE}" .

echo ""
echo "--- Cleaning up Container ---"
docker rm -f $CONTAINER_NAME

echo ""
echo "✅ CI pipeline test finished successfully."
ls ./*.vsix