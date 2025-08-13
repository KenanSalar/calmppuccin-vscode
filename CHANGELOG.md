# Changelog

## [1.5.8] - 2025-08-13

- **Improvement**: Seperation of concerns with the `WebviewManager`. The `SettingsPanel` acts as a pure controller for settings logic now while the `WebviewManager` handles all view-related resonsibilities.
- **Improvement**: Seperation of concerns with the ConfugurationService which acts as a single source of truth for all interactions with the vs code configuration api.
- **Fix**: Eliminating `any` casts for improved type safety.

## [1.5.7] - 2025-08-13

- **Fix**: Corrected the naming of the Custom UI image.

## [1.5.6] - 2025-08-13

- **Feature**: Removed the custom `iro` color picker and swapped it out for the standard one with a transparency slider.
- **Feature**: More languages for the live preview, selectable via a new dropdown menu (initially C, C++, and Python).
- **Feature**: A confirmation dialog before critical actions to prevent accidental data loss.
- **Feature**: New color tokens to the theme for enhanced customization.
- **Improvement**: You can now change types via the customization ui. Removed attribute bracket customization.
- **Improvement**: Improved syntax highlighting for types, namespaces, modules, directives, and transitions.
- **Fix**: Several minor UI behavior bugs.

## [1.5.5] - 2025-08-10

- **Improvement**: The customization ui now displays the updated accent color.

## [1.5.4] - 2025-08-10

- **Fix**: Updated the `README.md` to show the new customization ui; Replaced the `custom-ui.png` with the updated one.

## [1.5.3] - 2025-08-09

- **Improvement**: Numbers and constants can now be customized separately.
- **Improvement**: Customization UI has a new design.

## [1.5.2] - 2025-08-09

- **Fix**: Fixed a critical bug in the Customization UI where resetting a syntax color to its default value would not work correctly. The setting would incorrectly persist in `settings.json` after a reload. This was resolved by ensuring the extension works with a safe copy of the configuration, preventing direct modification of VS Code's read-only settings objects.

## [1.5.1] - 2025-08-09

- **Major Feature**: Added a live preview pane to the Customization UI. Changes to syntax colors and font styles are now reflected instantly in a C# code snippet, providing immediate visual feedback without needing to reload the editor.
- **Improvement**: Completely overhauled the layout of the Customization UI to be fully responsive. The controls and preview pane now correctly resize and stack vertically on smaller window sizes, preventing UI elements from overlapping.
- **Improvement**: The code snippet in the preview pane now wraps long lines of code, improving readability and preventing layout issues.
- **Fix**: Fixed a critical bug where the theme would appear with incorrect font styles on a fresh installation. The extension's build process now correctly includes the default font styles, ensuring the theme works perfectly out-of-the-box.

## [1.5.0] - 2025-08-08

- **Feature**: Added a custom settings UI built with a webview. Users can now run the `Calmppuccin: Customize Theme` command to open a graphical editor.
- **Feature**: The new customization UI allows users to change the accent color and all granular font styles from a single, user-friendly panel.
- **Feature**: Added a color picker for custom accent colors.
- **Improvement**: Reworked the extension's settings in the standard VS Code UI. The font style settings are now bundled into a single expandable object, and a new clickable link is provided to guide users to the custom UI.
- **Fix**: Implemented state persistence for the custom UI, so its content is no longer lost when switching tabs.
- **Fix**: Corrected the communication logic between the webview and the extension, ensuring that changes made in the UI are correctly saved and trigger a theme regeneration.
- **Major Feature**: Added granular syntax color customization. Users can now change the color of individual syntax elements (like keywords, comments, etc.) for each theme flavor directly from the custom UI.
- **Major Feature**: Implemented an advanced color picker with full alpha (transparency) support, allowing for even more personalized and subtle theme variations.
- **Feature**: Added "Reset" buttons for every individual font style and syntax color, allowing users to easily revert specific changes back to the theme's defaults.
- **Feature**: Added a "Reset All Settings" button to the custom UI, providing a one-click way to restore all customizations to their original state.
- **Improvement**: The custom UI now displays the currently active theme flavor (e.g., "Editing: Mocha") to avoid confusion.
- **Fix**: Resolved multiple minor bugs in the custom UI, including issues with the "Reset" button not triggering immediate theme rebuilds and layout problems with UI elements.

## [1.4.4] - 2025-08-06

- **Feature**: Added highly customizable font style settings. Users can now choose between `none`, `italic`, `bold`, `italic bold` and `underline` for various syntax elements like comments, keywords, classes, and more, providing granular control over the syntax font style.
- **Improvement**: Enhanced and refined syntax highlighting across the Latte theme for better code distinction. The mantle color was also adjusted to `#DCDEE1` for a softer look.
- **Fix**: Resolved an issue where the build script would not recompile on-the-fly changes, ensuring that all theme modifications are correctly packaged.
- **Fix**: Corrected a color contrast issue in the Latte theme's Git diff view, significantly improving the readability of modified file details.

## [1.4.3] - 2025-08-05

- **Feature**: Added automatic synchronization with the Catppuccin Icons extension. The icon pack's flavor will now automatically update to match the selected Calmppuccin theme.
- **Improvement**: The icon-syncing feature is now more robust and will only activate if the user is already using a Catppuccin icon theme, preventing it from overriding other icon pack choices.
- **Fix**: Corrected the theme name parsing logic to properly handle flavors with special characters (e.g., Frappé) and multiple words (e.g., Nitro Cold Brew).

## [1.4.2] - 2025-08-05

- **Improvement**: Enhanced error handling significantly. If building the themes fails, users now see a more descriptive error message.
- **Feature**: Added a "Report Issue" button to the error notification, which directly opens the project's GitHub issues page to make bug reporting easier for users.
- **Refactor**: Centralized all static values and "magic strings" (e.g., command IDs, configuration keys) into a constants file to improve code maintainability.
- **Info**: Be aware that the theme is now only available at version 1.102.0 and onwards because of a package version issue.

## [1.4.1] - 2025-08-05

- **Major Refactor**: Migrated the entire extension and build process from JavaScript to TypeScript, providing strong typing for improved robustness and maintainability.
- **Build Process**: Integrated webpack to compile and bundle the TypeScript source, creating an optimized and efficient extension.
- **Refactor**: Centralized all UI and syntax colors into individual, strongly-typed palette files (`latte.ts`, `mocha.ts`, etc.) for better organization.
- **Refactor**: Consolidated the theme structure to use a single, universal `template.json`, making structural changes a one-time edit.
- **Improvement**: The build script is now fully dynamic and type-safe, capable of generating all theme variations from the single template and applying palette-specific metadata.
- **Feature**: Added support for dynamic transparent color variations. Colors can now be defined in the palette as recipes (e.g., `{{accent}}2f`) to be automatically generated by the build script.
- **Syntax**: Adjusted keyword, constant and property colors to differentiate them better.

## [1.4.0] - 2025-08-01

- **Major Refactor:** Completely rebuilt the theme from over 80 static files into a modern, dynamic VSIX extension. This massively improves the theme's maintainability and reduces its footprint.
- **Feature:** Added a new setting, `calmppuccin.accent`. Users can now choose a single accent color from the settings dropdown, which is then applied across all theme flavors for a consistent, personalized look.
- **Improvement:** The theme selection menu has been streamlined. It now cleanly displays only the 6 main flavors (Latte, Frappe, Mocha, etc.), removing the clutter of dozens of accent variations.
- **Improvement:** The unique syntax highlighting for each flavor (Latte's, Mocha's, etc.) has been preserved, while UI elements now dynamically adapt to the user's chosen accent color.

## [1.3.9] - 2025-06-09

- Removed `source.dockerfile` because of inconsistencies.

## [1.3.8] - 2025-06-09

- Added highlighting for shell control flow keywords (if, then, else, for, while, case, etc.)highlighting
- Added highlighting for special methods and shell commands
- Included `source.dockerfile` in the scope for text highlighting to improve Dockerfile readability.

## [1.3.7] - 2025-05-17

- Added `entity.name.section.group-title.editorconfig` and `keyword.other.definition` to the keyword scope for .ediotrconfig highlighting
- Added `source.ignore` to the text scope for igonre file highlighting (e.g. .gitignore)

## [1.3.6] - 2025-05-16

- Added scopes for log files
- Improved info and error colors across all themes
- Adjusted debug colors for latte themes

## [1.3.5] - 2025-05-13

- Resolved an issue where the interfaces in the `Mocha` and `Nitro Cold Brew` themes appeared excessively bright
- Fixed frappe theme's escape character color

## [1.3.4] - 2025-05-10

- Major improvements to the latte themes
- Added `Oledppuccin` theme, including all accent variations; providing users with more options for darker, OLED-friendly color palettes (perfect for OLED screens and pitch black room setups)
- Adjusted `tree.indentGuidesStroke` and `tree.inactiveIndentGuidesStroke` on all themes to match the accent colors
- Updated screenshots and the preview image

## [1.3.3] - 2025-05-06

- Fixed scope for `support.variable`

## [1.3.2] - 2025-05-06

- Delegates and type parameters are not itlaic anymore
- Parameters are now using the `Rosewater` accent color
- Type parameter colors are now a blend of the parameter color and the type color (quite fitting, don’t you think?)
- Added various commands to the corresponding scopes for better highlighting
- Improved the brightness of syntax highlighting for all dark themes
- Updated screenshots and the preview image

## [1.3.1] - 2025-05-05

- Delegates are now displayed in italic style and use the `Flamingo` accent color

## [1.3.0] - 2025-05-04

- Expanding the scope of the namespace token to include `support.other.namespace` and `punctuation.separator.namespace.access` for better identification of namespace-related code
- Adding `support.class.builtin` and `entity.other.inherited-class` to the class token scope, improving the highlighting of built-in and inherited classes
- Adding `storage.type.numeric` to the type token scope
- Adding several keywords such as `use`, `new`, `namespace`, `type`, and `typedef` to the keyword token scope for improved keyword highlighting
- Adding several control keywords for C, C++, php, python, etc.
- Improved punctuation highlighting
- These changes provide a more consistent and accurate syntax highlighting experience across different languages and code structures

## [1.2.9] - 2025-05-03

- Added some commands for different scopes for better highlighting

## [1.2.8] - 2025-05-02

- Removed a redundant scope and commands
- Added `Nitro Cold Brew` theme, including all accent variations
  - Nitro Cold Brew offers an even darker palette with more subdued syntax highlighting.
  - Perfect for coding at night or in extremely dark environments like pitch black rooms (or cellars, if you’re one of those people 😄)

## [1.2.7] - 2025-05-01

- Changed many scopes to represent the palette accents better with a less or more intense color
  - classes -> `peach`
  - interfaces/traits -> `yellow`
  - enums -> `maroon`
  - structs -> `red`
  - functions/methods -> `blue`
  - parameters -> `sapphire`
  - fields/attributes -> `pink`
  - properties -> `mauve`
  - constants -> `lavender` (but far more intense)
  - strings -> `green`
  - text -> `sky`
- Improved highlighting for razor files (directives, transitions, attributes and comments)
- Changed JSON highlighting

## [1.2.6] - 2025-04-30

- Fixed numerous highlighting issues
- Added amodule and attribute italic to the texMate scope
- Added namespace.attribute, attribute and attributeBracket to the semantic scope
- Annotations are now italic

## [1.2.5] - 2025-04-30

- Added keyword.local and keyword.control.lua to the keyword scope

## [1.2.4] - 2025-04-29

- Consolidated class-related scopes under a single "class" name, including variable.other.object, variable.other.class, entity.name.type, entity.name.type.class, and support.class
- Removed entity.name.type from the keyword scope to avoid conflicts
- Added several scopes to the keyword control scope for better highlighting of control flow elements, including support.type.sys-types, support.type, support.other.namespace, and support.other.namespace.use
- Now even with this command set to false:

    ```json
    "editor.semanticHighlighting.enabled": false
    ```

    you can code with ease (but I highly recommend setting it to true in your settings.json, as instructed in the README)

## [1.2.3] - 2025-04-29

- Added keyword.other.directive to the keyword scope

## [1.2.2] - 2025-04-29

- Removed unnecessary ".cs" scopes
- entity.name.type.namespace is now working for any language
- Updated screenshots
- Increased the size of the cat in the logo

## [1.2.1] - 2025-04-28

- Switched "variable.other.object" to the variable scope because it makes more sense

## [1.2.0] - 2025-04-28

- Deleted entity.name.type.cs from the class scope and added variable.other.object to the class scope

## [1.1.9] - 2025-04-28

- Added keyword.control.context in the keyword section of all themes (for example it affects the color of the keyword 'using')

## [1.1.8] - 2025-04-27

- Fixed event color for macchiato themes
- Incresed brighness for enums, classes, structs and interfaces on all dark themes

## [1.1.7] - 2025-04-27

- Changed event and delegate highlighting (delegates are now dark blue)
- Adjusted interface, class, enum and struct colors
  
## [1.1.6] - 2025-04-26

- Changed event and delegage highlighting

## [1.1.5] - 2025-04-26

- Added debugTokenExpression.type to all themes

## [1.1.4] - 2025-04-26

- Fixed boolean and null symbol colors in all themes

## [1.1.3] - 2025-04-24

- Updated the highlighting for type parameters. The new color now sits precisely between the keyword color and the parameter color
- The function and method color has been made more prominent for dark themes to enhance visibility

## [1.1.2] - 2025-04-24

- More granular highlighting for types (meta.type.parameters entity.name.type; meta.type.annotation entity.name.type)

## [1.1.1] - 2025-04-24

- Added trycatch keyword

## [1.1.0] - 2025-04-23

- Added semantic highlighting for types
- Changed entitiy.name.type from annotation to keywords

## [1.0.9] - 2025-04-23

- Added string template expression highligghting
- Improved bracket and bracket pair highlighting
- Added control flow keyword for correct syntax highlighting

## [1.0.8] - 2025-04-23

- Changed button hover color
- Changed secondary button background and hover color
- Sidebar section header border is now more visible
- Panel border is now matching the theme accents
- Welcomepage title hover is now matching the theme

## [1.0.7] - 2025-04-23

- Added keywords for control, flow and type
- Booleans are now highlighted as constants

## [1.0.6] - 2025-04-23

- Changed syntax highlightinh for variables, parameters, typeparameters, comments, punctuation, regexcharacterclass, operators and text
- Fixed boolean syntax highlighting
- Changed bracked highlighting, inlay hints and symbol icon colors

## [1.0.5] - 2025-04-19

- Changed editor hover widget colors to match the theme better.

## [1.0.4] - 2025-04-18

- Fixed token colors for certain keywords and constants

## [1.0.3] - 2025-04-18

- Updated the README file to add a command to the settings.json to enable semantic highlighting.

## [1.0.2] - 2025-04-18

- Fixed highlighting for properties and keywords beeing in the wrong token color category.

## [1.0.1] - 2025-04-15

- Fixed preview of the mocha theme in the README file.

## [1.0.0] - 2025-04-15

- Initial release
