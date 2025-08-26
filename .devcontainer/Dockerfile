# Start from Microsoft's official Dev Container image for TypeScript and Node.js.
# This image comes with Node.js, npm, TypeScript, and many useful tools pre-installed.
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# Install git, gnupg, and sudo for GPG forwarding and permissions
RUN apt-get update && apt-get install -y gnupg pinentry-curses

# Install the VS Code Extension command-line tool (vsce) globally.
# This is essential for packaging the extension into a .vsix file.
RUN su node -c "npm install -g @vscode/vsce"

# Switch to the node user to avoid permission issues
USER node

# Set the working directory inside the container
WORKDIR /workspaces/calmppuccin-vscode

# Copy only the package files first.
# This creates a separate layer that will only be rebuilt if package.json or package-lock.json changes.
COPY --chown=node:node package*.json ./

# Install npm dependencies. The result of this command will be cached as its own layer.
RUN npm install

# Now, copy the rest of the application source code.
# If only the source code changes, Docker will reuse all the layers above this line.
COPY --chown=node:node . .