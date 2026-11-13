# #326 Web: make the themes installable in vscode.dev and github.dev

Branch `326-web-make-the-themes-installable-in-vscodedev-and-githubdev`. This file goes when
Phase 4 lands.

## Context

**Today.** On desktop, Remote (SSH, WSL, containers) and Codespaces, Calmppuccin works: six
flavors, the Customize Theme UI, rebuilt themes and a reload prompt. In vscode.dev and github.dev
the Extensions view doesn't list it.

**Why.** VS Code deduces a manifest with `main` and no `browser` as `["workspace"]`, never `web`,
so the web extension host ignores it. The theme JSONs would work there unchanged; `build.ts` and
`src/WebviewManager.ts`, both on `fs/promises` and `path`, can't.

**After.** In vscode.dev and github.dev, Calmppuccin installs and all six flavors show the packaged
default colors. Customize Theme answers with a note that Calmppuccin can't apply customizations
in VS Code for the Web. While a Calmppuccin theme is selected and settings customize it, as
Settings Sync can bring them along, that note shows at most once per window, at startup or after a
settings or theme change, with Don't Show Again. Catppuccin Icons still follow the flavor. Nothing
changes where a Node extension host exists.

**What keeps working**, read in `microsoft/vscode` at `05a07ce` (main, 2026-11-13):

- **Desktop.** Outside a web workbench `getExtensionKind` adds no `web` kind
  (`src/vs/workbench/services/extensions/common/extensionManifestPropertiesService.ts:353`), so
  the local Node host runs `main` as today.
- **Codespaces in the browser.** In a web workbench our kinds become `["ui", "workspace", "web"]`,
  `web` appended after the declared ones (same file, `:334-358`).
  `BrowserExtensionHostKindPicker.pickRunningLocation`
  (`src/vs/workbench/services/extensions/browser/extensionService.ts:325-357`) walks them in order:
  `ui` installed remotely only marks the remote host as a last resort, then `workspace` installed
  remotely returns `Remote`. The codespace copy keeps the Node build and customization. Only
  `["ui"]` alone reaches `web` first. `extensionKind` stays as it is.
- **github.dev's virtual workspace.** Support defaults to `true` for an extension with no
  `capabilities.virtualWorkspaces` (`extensionManifestPropertiesService.ts:412-444`).

## Prior art

Theme extensions with a configurable `main` and a `browser` entry (catppuccin/vscode,
sainnhe/everforest-vscode, sainnhe/gruvbox-material-vscode) register only a listener that shows a
message on each change of their namespace. Not to copy:

- an error-level message for an expected limit;
- the message on every change, with nothing on activation, so a synced user gets stock colors
  unexplained;
- no icon sync on the web;
- a browser bundle built for the Node platform, where a stray `fs` or `Buffer` import passes the
  build;
- one source for both entries with Node polyfills, writing through `__dirname` on the web.

## Structure

| file | owns |
|---|---|
| `src/selectedTheme.ts` (new) | reading `workbench.colorTheme`: `COLOR_THEME_SETTING`, `isCalmppuccinThemeSelected`, `syncIconFlavor` and its private `ICON_FLAVORS`, moved verbatim from `extension.ts`. Imports `vscode`, `src/constants.ts` and `isFlavor` only |
| `extension.ts` | the Node entry, importing those three names |
| `browser.ts` (new, beside `extension.ts`) | the web entry: the Customize command, one settings listener, the startup check, the note. Imports `vscode`, `src/constants.ts`, `src/selectedTheme.ts`, `affectsThemeSettings` (`src/config/ConfigAccess.ts`) and `isThemeCustomized` (`src/config/SettingsReader.ts`), never `build.ts`, `ConfigurationService` or `SettingsPanel` |
| `src/config/ConfigAccess.ts` | `affectsThemeSettings(event)`, the `THEME_AFFECTING_KEYS` filter both entries' listeners run; `extension.ts` reaches it through the `ConfigurationService` facade. `customizedFontStyles`, moved from `ProfileManager.ts`, and `isPlainObject`, now exported |
| `src/config/SettingsReader.ts` | `getActiveCustomizations()`, what the active profile resolves to minus defaults, which `saveProfile` saves; `isThemeCustomized()`, whether the inputs the build reads differ from their defaults, which the note asks |
| `src/constants.ts` | the note's text, its Don't Show Again action, the `globalState` key |
| `webpack.config.js` | a fourth config, `browser.ts` → `dist/browser.js`, `target: "webworker"` |
| `package.json` | `"browser": "./dist/browser.js"` |

Duplication collapsed before the second entry lands:

- **Icon sync.** `syncIconFlavor` and the theme-selection read move to `src/selectedTheme.ts`
  rather than being copied into `browser.ts`.
- **Webpack.** The configs repeat `mode`, `resolve`, `module` and `devtool`; one shared base is
  spread into each, as `typescriptRules` already is.
- **`.vscodeignore`.** It names every `.ts` source, so each new module is one more line or it
  ships. One `**/*.ts` replaces them; `src/template/*.json`, `webview/index.html` and
  `webview/style.css` still ship.
- **The settings filter** (Phase 2). `extension.ts` spelled the `THEME_AFFECTING_KEYS` walk
  inline; it moves to `affectsThemeSettings` rather than being copied into `browser.ts`.
- **What counts as customized** (Phase 2). `saveProfile` computed it inline; it moves to
  `getActiveCustomizations`. The note asks a different question, whether the themes look
  different, so `isThemeCustomized` reads it through the getters the build takes: a custom accent
  color the accent doesn't select keeps its place in a saved profile and shows no note. Reset,
  delete and profile switches leave user values that customize nothing.

## Behaviour of `browser.ts`

- **Activation** registers `calmppuccin.customize` and one `onDidChangeConfiguration` listener,
  pushes both to `context.subscriptions`, and calls `syncIconFlavor()` when a Calmppuccin theme is
  selected. No `calmppuccin.regenerateThemes`, no migration.
- **Listener.** A `workbench.colorTheme` change runs `syncIconFlavor()`. That change or a
  `THEME_AFFECTING_KEYS` change reruns the startup check while a Calmppuccin theme is selected, so
  a synced reset, or a value set back to its default, shows nothing.
- **Startup.** A Calmppuccin theme selected and `isThemeCustomized()` show the note once per
  window. Settings Sync can apply settings before this extension activates, or while another theme
  is selected, so a change event alone misses a synced user.
- **The note** is `showInformationMessage`. Its automatic showings share one per-window flag and
  offer Don't Show Again, kept in `context.globalState` and passed to `setKeysForSync` so Settings
  Sync carries a dismissal to the other web origin.
- **Customize Theme** answers with the note every time, past the flag and Don't Show Again: a
  second press answered with silence reads as broken. This departs from the issue's "once per
  window", which covers the automatic showings.
- **`deactivate`** resets the per-window flag.

## Phases

### Phase 1: Share before the second entry (done)

A pure refactor; desktop behaviour unchanged.

1. Extract `src/selectedTheme.ts` from `extension.ts`.
2. Collapse `webpack.config.js` into a shared base plus each bundle's `target`, `entry`, `output`
   and, for the extension bundle, `externals`.
3. Replace the `.ts` lines in `.vscodeignore` with `**/*.ts`.
4. Update what this makes wrong: the `ICON_FLAVORS` location in `.claude/rules/typescript.md` and
   `.claude/rules/theme-generation.md`, and the `.vscodeignore` bullets in
   `.claude/rules/ci-packaging.md` and `CLAUDE.md` (a new `.ts` needs no line; a new non-TS file
   under `src/` still ships).

Evidence: `npx vsce ls --no-dependencies` before step 3 and after, identical; the `npm run compile`
module lists unchanged; format, lint, type-check and `npm test` green with no test edits.

### Phase 2: The web entry (done)

1. `browser.ts`, its constants, the fourth webpack config and the `browser` field. No
   `resolve.fallback`: webpack 5 polyfills no Node core module, so anything in the web graph that
   reaches `fs` or `path` fails `npm run compile`.
2. Update what this makes wrong or incomplete: `CLAUDE.md` (four bundles; the "It runs twice"
   paragraph is the Node entry's, plus a bullet for the web entry; Jest runs on `node`, with only
   the webview test on jsdom), the `extensionKind` bullet in `.claude/rules/vscode-api.md` (the
   picker facts above), `README.md` Installation and Customization (the web gets the default themes,
   and customizing isn't available there), and `CONTRIBUTING.md` (trying the web build). The
   `CHANGELOG.md` entry lands with the version bump.

Evidence: the module list for `browser.js` names only `browser.ts`, `src/selectedTheme.ts`,
`src/constants.ts`, `src/config/ConfigAccess.ts`, `src/config/SettingsReader.ts` and the palettes
(`types/webview.ts` is a type-only import, erased); no `process`, `Buffer`, `__dirname` or
`require(` in those files, and
`require("vscode")` the bundle's only `require`; format, lint, type-check and tests green (825, no
test edits); `npm run package` ships `dist/browser.js`; the `/doc-style` audit.

Also updated: the `paths:` of `.claude/rules/vscode-api.md` and `performance.md` (now loading for
`browser.ts`), the listener bullet in `performance.md`, and the facade bullet in
`configuration.md` (why `browser.ts` imports `ConfigAccess` and `SettingsReader` directly).

### Phase 3: Hand test (pending: Codespaces, Settings Sync)

Results, 2026-11-13, VS Code 1.146.0 (`69047191`) in test-web, on vscode.dev and on desktop:

- **Local browser VS Code**: all checks pass. Web worker host; the six flavors' 552 registered
  workbench colors equal the packaged JSON; Customize answers three presses; after one note, edits
  stay silent with the notification center cleared; note at start with a user value; after Don't
  Show Again none at start or on an edit, Customize still answers; icons follow all six flavors.
- **vscode.dev**: the same checks pass from the packaged VSIX served over plain
  `http://localhost:5000`. Chromium allows a local-network request from an https page, so no
  certificate is needed. github.dev redirects a signed-out browser to
  `vscode.dev/github/<repo>`; in that virtual workspace, in Restricted Mode, it runs on the web
  worker with Latte applied and Customize answers. Settings Sync needs an account sign-in, not
  done; the startup check ran through a reload with a user value instead.
- **The customization check**, in test-web: reset values, a leftover custom color and an accent
  set to its default give no note, saved in a fresh window or at a reload; a mauve accent saved
  under Dark Modern gives none until Mocha is picked, then one; saved under a Calmppuccin theme it
  gives one, and a second edit none. Startup, Don't Show Again, Customize and icon sync pass.
- **Codespaces in the browser**: not done. It needs a codespace on the owner's account.
- **Desktop** (`code --extensionDevelopmentPath`, as Ctrl+F5): an accent edit rebuilt the themes
  and offered Reload Window, the reload showed the rebuilt colors, and Customize opened the UI.

- **Local browser VS Code.** `npm run build-themes`, then
  `npx @vscode/test-web@0.0.81 --browser=chromium --quality=stable --extensionDevelopmentPath=.`
  Check: listed in the Extensions view; six flavors matching desktop; Developer: Show Running
  Extensions puts it on the Web Worker host; Customize answers each time; two `calmppuccin.accent`
  edits give one note; a reload with that user value set gives the note at start; after Don't Show
  Again a reload shows none and Customize still answers; Catppuccin Icons follow a flavor switch.
  With Don't Show Again cleared: under Mocha, user settings holding only
  `"calmppuccin.profiles": {"Default": {}}` and `"calmppuccin.activeProfile": "Default"` give no
  note, neither on saving them nor on reload; a profile holding only a `customAccentColor` gives
  none; with `{"Default": {"accent": "mauve"}}` under Dark Modern, saving it and a reload give
  none, and picking Calmppuccin Mocha gives one.
- **vscode.dev and github.dev**, from the packaged VSIX. `npm run package`, unzip its `extension/`
  folder into a scratch directory, add a `serve.json` setting `Cross-Origin-Resource-Policy:
  cross-origin`, then `npx serve@14.2.7 --cors -l 5000` from that folder, and Developer: Install
  Extension from Location… with `http://localhost:5000`. The same checks, with and without
  customized settings arriving through Settings Sync.
- **Codespaces in the browser.** With the VSIX installed in a codespace, Show Running Extensions
  says Remote and Customize Theme opens the UI.
- **Desktop under Ctrl+F5.** Customizing still rebuilds and offers a reload.

### Phase 4: Tests (pending)
