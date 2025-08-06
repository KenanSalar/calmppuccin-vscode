<div align="center">
    <img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/logo/icon.png" alt="Logo" width="250" height="250">
    <h3>Calmppuccin for <a href="https://code.visualstudio.com/">VSCode</a> </h3>
</div>
<hr/>
<br/>
<div align="center">
    <img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/preview/preview.png" alt="Preview" width="820" height="800">
</div>

## Previews

<details>
<summary>🌻 Latte</summary>
<img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/screenshots/latte-mauve.png" alt="Latte" width="800" height="´250">
</details>

<details>
<summary>🪴 Frappé</summary>
<img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/screenshots/frappe-green.png" alt="Frappé" width="800" height="´250">
</details>

<details>
<summary>🌺 Macchiato</summary>
<img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/screenshots/macchiato-sapphire.png" alt="Macchiato" width="800" height="´250">
</details>

<details>
<summary>🌿 Mocha</summary>
<img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/screenshots/mocha-maroon.png" alt="Mocha" width="800" height="´250">
</details>

<details>
<summary>🪻 Nitro Cold Brew</summary>
<img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/screenshots/nitro-cold-brew-teal.png" alt="Nitro Cold Brew" width="800" height="´250">
</details>

<details>
<summary>🐾 Oledppuccin</summary>
<img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/screenshots/oledppuccin-pink.png" alt="Oledppuccin" width="800" height="´250">
</details>

## Calmppuccin: A Soothing and Optimized VS Code Theme

Calmppuccin is a visually refined theme for Visual Studio Code, designed to\
offer a harmonious coding experience. Inspired by the popular
[Catppuccin theme](https://marketplace.visualstudio.com/items?itemName=Catppuccin.catppuccin-vsc)\
Calmppuccin takes the beloved pastel palette and transforms it into a gentler,\
less intense version, perfect for long coding sessions without eye strain.

## Installation

To install the Calmppuccin extension in Visual Studio Code, open the Extensions view\
by clicking the Extensions icon in the Activity Bar or pressing `Ctrl+Shift+X`. In the search bar,\
enter `Calmppuccin`, locate the extension in the results, and select Install to add it to your editor.

## Customization

You can easily tailor Calmppuccin to fit your personal preferences for both accent colors and font styles.

### 1. Using the Settings Menu (Recommended)

1.  Open your VS Code Settings (`Ctrl` + `,`).
2.  In the search bar, type `Calmppuccin`.
3.  You will see all the available settings, including **"Calmppuccin: Accent"** and the various **"Calmppuccin: ... Font Style"** options.
4.  Select your desired accent color and font styles from the dropdown menus.
5.  A notification will prompt you to reload VS Code. Click **"Reload Window"** to apply the changes.

### 2. Editing `settings.json`

For those who prefer editing JSON directly, you can add the following lines to your `settings.json` file.

```json
"calmppuccin.accent": "mauve"
```

Replace "mauve" with any of the available accent options below.

#### 🎨 Accents

- `blue`
- `flamingo`
- `green`
- `lavender`
- `maroon`
- `mauve`
- `peach`
- `pink`
- `red`
- `rosewater`
- `sapphire`
- `sky`
- `teal`
- `yellow`

#### ✒️ Font Styles

You can control the font style for various syntax elements. Here is an example of how to change the style for comments and keywords:

```json
"calmppuccin.commentFontStyle": "italic",
"calmppuccin.keywordFontStyle": "bold"
```

Each font style setting can be configured with one of the following options:

- "" (for no font style)
- `italic`
- `bold`
- `italic bold`
- `underline`

## Key Features

- **Enhanced Syntax Highlighting:**
Carefully optimized color choices ensure clear and\
distinguishable syntax elements, making code easier to read and navigate.

- **Reduced Eye Strain:**
Subtle and muted tones create a calming workspace that\
minimizes visual fatigue, ideal for developers working for extended periods.\
Also with new theme variants like `Nitro Cold Brew` (even darker and more subdued) and\
`Oledppuccin`, specifically designed for OLED screens and pitch-black rooms.

- **Aesthetic Balance:** Strikes the perfect balance between functionality and beauty,\
blending soothing colors with practical design.

- **Customizable:** Offers flexibility to tweak background colors, text shades, and\
accents to suit individual preferences.

---

\
Calmppuccin is more than just a theme, it's an invitation to code in comfort and style.\
Whether you're debugging complex codebases or crafting new projects, Calmppuccin\
ensures your workspace remains a serene and productive environment.

## Recommendations

Ensure you have semantic highlighting enabled in your `settings.json` by adding or\
verifying this line:

```json
"editor.semanticHighlighting.enabled": true
```

You could also use it witout semantic highlighting, but it's not recommended.

### Icons

- **Note:** These extensions are not required, but it provides a more consistent icon set.\

- **Recommended:** [Catppuccin Icons for VSCode](https://marketplace.visualstudio.com/items?itemName=Catppuccin.catppuccin-vsc-icons)
  - **Automatic Syncing:** Calmppuccin now automatically syncs with this icon pack! When you switch your color theme (e.g., from Mocha to Latte), the icon flavor will update to match.
  - **Note:** For the custom `Nitro Cold Brew` and `Oledppuccin` themes, the icons will sync to the `Mocha` flavor.
- **Alternative 1:** [Atom Material Icons](https://marketplace.visualstudio.com/items/?itemName=AtomMaterial.a-file-icon-vscode)
- **Alternative 2:** [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)

### Font and Font Settings

- **Editor Font:** `Monaspace Neon` or alternatively `JetBrains Mono`

  - **Note:** Font weight is set to "normal" which is the default weight for both fonts.\
  If you want to customize it, vscode supports font weight from 100 to 900 (400 is normal).\
  Change the font size to your preference (e.g. `"editor.fontSize": 15`).

  [Download Monaspace Neon](https://github.com/githubnext/monaspace)

  [Download Jetbrains Mono](https://github.com/JetBrains/JetBrainsMono)

  - Settings for Monaspace Neon:

  ```json
  "editor.fontFamily": "'Monaspace Neon', monospace",
  "editor.fontLigatures": "'calt', 'liga', 'ss01', 'ss02', 'ss03', 'ss04', 'ss05', 'ss06', 'ss07', 'ss08', 'ss09', 'cv01' 2",
  "editor.fontWeight": "normal"
  ```

  - Settings for Jetbrains Mono:

  ```json
  "editor.fontFamily": "'Jetbrains Mono', monospace",
  "editor.fontLigatures": true,
  "editor.fontWeight": "normal"
  ```
  
  ---

- **Terminal Font:** `Jetbrains Mono Nerd Font`

  [Download Jetbrains Mono Nerd Font](https://github.com/ryanoasis/nerd-fonts/tree/master/patched-fonts/JetBrainsMono)

  - Settings for Jetbrains Mono Nerd Font:
  
  ```json
  "terminal.integrated.fontFamily": "'JetbrainsMono Nerd Font', monospace",
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.fontWeight": "normal"
  ```
