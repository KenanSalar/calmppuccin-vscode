# Changelog

## [1.3.6] - 2025-05-17

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
