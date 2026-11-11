---
paths:
  - webview/**
  - types/webview.ts
  - src/SettingsPanel.ts
  - src/WebviewManager.ts
---

# Customization webview

- **Host and webview speak only the unions in `types/webview.ts`.** A new message is a variant of
  `MessageToExtension` or `MessageToWebview`, its command string in `WEBVIEW_CONSTANTS`
  (`src/constants.ts`), a parser in `src/webviewMessages.ts`, and a case in
  `SettingsPanel._handleMessage`. The parser table's `satisfies` and the switch's `never` default
  each fail type-check until their entry exists.
- **Nothing from the webview acts before `parseWebviewMessage` accepts it**:
  `SettingsPanel._receiveMessage` drops the rest and reports a failed settings write to the user.
- **The webview gets state only as a whole `ISettingsPayload`** in `loadSettings`, debounced by
  `SettingsPanel._update`.
- **No inline `<script>`, `<style>` or `style=` in `webview/index.html`**: the CSP that
  `WebviewManager._getHtmlForWebview` injects drops them silently. The `style=` attributes there
  today do nothing, and script sets that state. Setting `element.style` from script is allowed.
- **`webview/` imports nothing from outside itself but `src/constants.ts` and
  `types/webview.ts`**, so `src/constants.ts` imports nothing. Anything more pulls host code into
  `dist/webview.js` or breaks its web build; the module list `npm run compile` prints shows it.
- **The panel loads only from `dist/` and `webview/`** (`localResourceRoots`): `index.html` and
  `style.css` ship as they are, the `.ts` sources only as `dist/webview.js`.
- **Controllers take typed dependencies** (`IAccentElements`, `IControlFactoryDeps`,
  `IProfileElements`), never the whole DOM or the `UIManager`.
- **`ControlFactory` holds `UIManager`'s `previewState` by reference**, so it's cleared key by
  key, never reassigned (`webview/main.ts` says so where it clears it).
- **A preview snippet is static HTML assigned through `innerHTML`**, each token wrapped in
  `<span data-token="<key>">` for `PreviewRenderer` to color. Never interpolate a setting into
  one. A new language is `webview/snippets/<lang>.ts` plus its entry in `webview/snippets.ts`,
  whose keys fill the language dropdown (`brackets`, `json` and `ui` excepted).
- **`webview/main.ts` starts the UI only outside Jest** (the guard at its foot), so tests import
  `UIManager` and drive it themselves.
