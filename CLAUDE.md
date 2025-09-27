# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Calmppuccin is a VSCode extension that provides a customizable color theme inspired by Catppuccin. The extension allows users to customize accent colors, font styles, and specific syntax highlighting colors through both a settings UI and a graphical webview interface.

## Architecture

### Core Components

- **Extension Entry Point**: `extension.ts` - Main activation and command registration
- **Configuration Service**: `src/ConfigurationService.ts` - Centralized service for all VS Code configuration interactions
- **WebView Manager**: `src/WebviewManager.ts` - Manages the custom settings UI webview panel (singleton pattern)
- **Settings Panel**: `src/SettingsPanel.ts` - Handles webview communication and message routing
- **Color Palettes**: `src/palettes/` - Individual flavor definitions (latte, frappé, macchiato, mocha, nitro-cold-brew, oledppuccin)

### Theme Generation

- **Build Script**: `build.ts` - Generates JSON theme files from TypeScript palette definitions
- **Theme Files**: `themes/` directory contains the generated JSON color theme files
- **Webpack Config**: Multi-target build (extension, build script, webview)

### Key Patterns

- **Configuration Management**: All settings operations go through `ConfigurationService` static methods
- **Type Safety**: Extensive use of TypeScript interfaces for settings payloads and webview communication
- **Singleton Pattern**: WebviewManager ensures only one settings panel exists at a time
- **Message-based Communication**: Strongly-typed message interfaces between extension and webview

## Common Development Commands

### Build & Package
```bash
# Compile TypeScript and build themes
npm run compile

# Build themes from palette definitions
npm run build-themes

# Package extension for distribution
npm run package

# Publish to marketplace (CI only)
npm run publish:ci
```

### Development
```bash
# Watch mode for development
npm run watch

# Run tests
npm test
```

### Project Structure

- `src/` - Extension source code (TypeScript)
- `webview/` - Custom settings UI (HTML/CSS/TypeScript)
- `themes/` - Generated JSON theme files
- `types/` - TypeScript type definitions for webview communication
- `dist/` - Compiled JavaScript output
- `assets/` - Static assets (images, screenshots)

### Key Settings

The extension manages these main configuration areas:
- `calmppuccin.accent` - Accent color selection (predefined colors or custom hex)
- `calmppuccin.fontStyles` - Font styling for syntax elements
- `calmppuccin.syntaxOverrides` - Per-flavor syntax color overrides
- `calmppuccin.uiOverrides` - Per-flavor UI color overrides

### Customization UI

The extension provides a webview-based settings panel accessible via:
- Command Palette: "Calmppuccin: Customize Theme"
- Settings UI: Search for "Calmppuccin" and use the customization link

The webview uses message-based communication between the extension host and webview context, with all message types defined in `types/webview.ts`.