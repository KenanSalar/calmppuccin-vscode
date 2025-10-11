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

<br/>

## Calmppuccin: A Soothing and Optimized VS Code Theme

Calmppuccin is a visually refined theme for Visual Studio Code, designed to\
offer a harmonious coding experience. Inspired by the popular
[Catppuccin theme](https://marketplace.visualstudio.com/items?itemName=Catppuccin.catppuccin-vsc)\
Calmppuccin takes the beloved pastel palette and transforms it into a gentler,\
less intense version, perfect for long coding sessions without eye strain.

<br/>

## Installation

To install the Calmppuccin extension in Visual Studio Code, open the Extensions view\
by clicking the Extensions icon in the Activity Bar or pressing `Ctrl+Shift+X`. In the search bar,\
enter `Calmppuccin`, locate the extension in the results, and select Install to add it to your editor.

<br/>

## Customization

You can easily tailor Calmppuccin to fit your personal preferences using the\
built-in graphical interface or by editing your `settings.json` directly.

### 1. Using the Customization UI (Recommended)

This is the easiest and most powerful way to configure everything in one place. The UI gives you full control over accent colors,  
font styles, granular syntax colors, and profile management, with a live preview pane that updates instantly as you make changes.

<details>
<summary>🛠️ <b>Customization UI</b></summary>
<img src="https://raw.githubusercontent.com/KenanSalar/calmppuccin-vscode/refs/heads/main/assets/images/customUI/custom-ui.png" alt="customUI" width="800" height="2100">
</details>

<br/>

You can open the custom UI in two main ways:

<details>
<summary><b>Via the Command Palette (Quickest Method):</b></summary>

1. Open the Command Palette (`Ctrl` + `Shift` + `P`, `Cmd` + `Shift` + `P` or `F1`).
2. Type `Calmppuccin` and select Calmppuccin: Customize Theme.
</details>


<br/>

<details>
<summary><b>Via the Settings Menu:</b></summary>

1. Open VS Code Settings (`Crtl` + `,`)
2. Seach for `Calmppuccin`.
3. Find the setting titled `Calmppuccin: Open Customization UI` and click the link within its description to open the panel.
</details>

<br/>

Changes are saved automatically. A notification will appear prompting you to reload VS Code to apply them.

#### Profile Management

The Customization UI includes a powerful profile management system that allows you to save, switch between, and manage multiple configuration sets:

- **Save Profile**: Create new profiles with your current customizations. Only settings that differ from defaults are saved, keeping profiles clean and focused.
- **Switch Profile**: Instantly switch between saved profiles using the dropdown selector.
- **Delete Profile**: Remove profiles you no longer need. The system ensures profiles are completely removed from your settings.
- **Default Profile**: Your existing settings are automatically migrated to a "Default" profile, preserving your current setup.

Profiles store all your customizations including:

- Accent colors and custom accent settings
- Font style preferences
- Syntax color overrides
- UI color customizations
- Theme-specific font style overrides

This allows you to create different configurations for different projects, moods, or lighting conditions, and switch between them effortlessly.

### 2. Using the Standard Settings UI

<details>
<summary>This is a quick way to change <b>only the accent color</b></summary>


1. Open your VS Code Settings (`Ctrl` + `,`).
2. In the search bar, type `Calmppuccin Accent`.
3. Use the dropdown menu to select your desired accent color.
</details>


### 3. Editing `settings.json` (For Power Users)

For those who prefer editing JSON directly, you can modify your settings.json file.

#### 🎨 Accent Color

Add the following line to set your accent color. Replace `mauve` with any of the available options below.

```json
// Use a predefined accent
"calmppuccin.accent": "mauve",

// Use a custom hex color
"calmppuccin.accent": "custom",
"calmppuccin.customAccentColor": "#36d9ce"
```

<details>
<summary><b>🎨 Available Accents:</b></summary>

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
- `custom`
</details>

<br/>

#### ✒️ Font Styles

You can control the font style for each syntax element directly in the JSON.

A helpful shortcut:

1. Go to the standard Settings UI and search for `Calmppuccin: Font Styles`.
2. Click the `Edit in settings.json` link.
3. This will automatically add the entire `calmppuccin.fontStyles` object with all default values to your file, making it easy to edit.

Here is an example of the structure:

```json
"calmppuccin.fontStyles": {
  "commentFontStyle": "italic",
  "variableFontStyle": "none",
  "keywordFontStyle": "none",
  // ... and so on for all other elements
}
```

##### **Available Font Style Options:**

- `none` (will be replaced with an empty string)
- `italic`
- `bold`
- `italic bold`
- `underline`

<br/>

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

- **Highly Customizable:** Personalize your coding environment by selecting from a palette of\
14 accent colors and applying unique font styles (like italic or bold) to individual syntax elements.

<br/>

Calmppuccin is more than just a theme, it's an invitation to code in comfort and style.\
Whether you're debugging complex codebases or crafting new projects, Calmppuccin\
ensures your workspace remains a serene and productive environment.

<br/>

## Recommendations

Ensure you have semantic highlighting enabled in your `settings.json` by adding or\
verifying this line:

```json
"editor.semanticHighlighting.enabled": true
```

You could also use it witout semantic highlighting, but it's not recommended.

### Extension Integrations

Calmppuccin includes seamless color theming for popular VSCode extensions to provide a consistent visual experience:

#### Error Lens

[Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) displays diagnostic messages inline in your code.

Calmppuccin automatically themes Error Lens with colors that match each flavor:
- **Errors:** Red - For critical issues requiring immediate attention
- **Warnings:** Peach - For important but non-critical issues
- **Info:** Blue - For informational messages
- **Hints:** Green - For suggestions and improvements

The integration is automatic - just install Error Lens and Calmppuccin will handle the theming across all 6 flavors (Latte, Frappé, Macchiato, Mocha, Nitro Cold Brew, and Oledppuccin).

#### GitHub Pull Requests and Issues

[GitHub Pull Requests and Issues](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) brings GitHub workflow integration directly into VSCode.

Calmppuccin automatically themes GitHub PR states with intuitive colors:
- **Open (PR/Issue):** Green - Active and awaiting attention
- **Closed PR:** Red - Rejected or closed without merging
- **Closed Issue:** Mauve - Successfully resolved
- **Merged PR:** Mauve - Successfully integrated
- **Draft PR:** Muted gray - Work in progress
- **New Issue Decoration:** Rosewater - Subtle attention indicator

The integration is automatic and adapts to each flavor's palette.

### Icons

- **Note:** These extensions are not required, but it provides a more consistent icon set.\

- **Recommended:** [Catppuccin Icons for VSCode](https://marketplace.visualstudio.com/items?itemName=Catppuccin.catppuccin-vsc-icons)
  - **Automatic Syncing:** Calmppuccin now automatically syncs with this icon pack! When you switch your color theme (e.g., from Mocha to Latte), the icon flavor will update to match.
  - **Note:** For the custom `Nitro Cold Brew` and `Oledppuccin` themes, the icons will sync to the `Mocha` flavor.
- **Alternative 1:** [Atom Material Icons](https://marketplace.visualstudio.com/items/?itemName=AtomMaterial.a-file-icon-vscode)
- **Alternative 2:** [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)

---



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
  
<br/>

- **Terminal Font:** `Jetbrains Mono Nerd Font`

  [Download Jetbrains Mono Nerd Font](https://github.com/ryanoasis/nerd-fonts/tree/master/patched-fonts/JetBrainsMono)

  - Settings for Jetbrains Mono Nerd Font:
  
  ```json
  "terminal.integrated.fontFamily": "'JetbrainsMono Nerd Font', monospace",
  "terminal.integrated.cursorStyle": "line",
  "terminal.integrated.fontWeight": "normal"
  ```

<br/>

## Acknowledgements

This theme was built from the ground up and is heavily inspired by the amazing [Catppuccin](https://github.com/catppuccin/vscode) theme.\
While Calmppuccin aims for a gentler, more subdued palette, it would not exist without the incredible\
foundation and color philosophy established by the Catppuccin team.
