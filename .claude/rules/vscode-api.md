---
paths:
  - extension.ts
  - build.ts
  - package.json
  - src/SettingsPanel.ts
  - src/WebviewManager.ts
  - src/config/**
---

# VS Code Extension API

The extension host API at this repo's floor. `webview.md` owns the message protocol and the CSP's
inline rule, `configuration.md` the profile model, `performance.md` activation cost and debouncing,
and `testing.md` the Jest `vscode` mock.

## The API floor

- **An API is available only if it type-checks against the pinned `@types/vscode`.**
  `npm run type-check` is the test. The website and the samples track the newest release, so read
  `node_modules/@types/vscode/index.d.ts`, not the docs, to see what 1.125 has.
- **No proposed APIs.** `enabledApiProposals` and `vscode.proposed.*.d.ts` run only in Insiders
  behind a flag, and the docs say not to publish with them.
- **A deprecated API fails lint** (`typescript/no-deprecated`); use what its `@deprecated` names.

## Manifest

- **An activation event has to be on VS Code's documented list**, since `vsce package` accepts any
  string. There is none for selecting a color theme, so this extension starts on
  `onStartupFinished`. Confirm an event fires with Developer: Show Running Extensions.
- **A contributed command needs no `onCommand:` entry** (implicit since 1.74). An internal command
  such as `calmppuccin.regenerateThemes` stays out of `contributes.commands`, which would put it
  in the Command Palette.
- **A theme's `label` is its settings ID** while no `id` is declared, so renaming a label breaks
  every user's `workbench.colorTheme`. `uiTheme` is `vs`, `vs-dark`, `hc-black` or `hc-light`.
- **With `main` and no `extensionKind`, VS Code runs the extension as `["workspace"]`.** In an SSH,
  WSL or container window it installs and runs on the remote host and rewrites that host's copy of
  the themes. Nothing here reads the workspace, so `["ui", "workspace"]` would keep it local; the
  manifest declares no `extensionKind` today.
- **With `main` and no `capabilities.untrustedWorkspaces`, the extension is disabled in
  Restricted Mode**, and its themes with it. It reads no workspace content, so `supported: true`
  is the honest declaration, and the manifest has none today.
- **A contributed setting defaults to `"scope": "window"`**, which lets workspace and remote
  settings override it. `configuration.md` says which settings take `application` instead.

## Configuration

- **`get` returns the merged value, and objects merge across every layer.** `get` on
  `calmppuccin.profiles` holds the `package.json` default, the user value and the workspace value
  at once, so writing it back at `ConfigurationTarget.Global` copies workspace profiles into user
  settings. Read what you'll write back to one target with `inspect(key)?.globalValue`.
- **`update(key, undefined, target)` removes the key from that target only**; a value set at
  another level still wins.
- **A `WorkspaceConfiguration` is a snapshot taken at `getConfiguration`.** Re-read through a fresh
  `getConfig()` after an `update`, never through an object fetched before it.
- **`update` rejects** when the settings file has errors or unsaved changes, or the key isn't
  contributed, so each call sits on a path that reports the failure to the user.
- **A user-settings change reaches every window's extension host.** With several windows open each
  one regenerates the same `themes/` folder at once while VS Code may be loading a theme, so
  `replaceFile` (`build.ts`) lands each file through a rename and `queueBuild`
  (`extension.ts`) runs one build at a time per host. Only the first window writes, so each
  decides on a reload against the files it loaded (`loadedThemes`), not against what it wrote.
- **The API gives the active theme's kind, never its name.** `window.activeColorTheme` has only
  `kind`. The name is a setting, and with `window.autoDetectColorScheme` on it is
  `workbench.preferredDarkColorTheme` or `workbench.preferredLightColorTheme`, not the
  `workbench.colorTheme` every flavor lookup here reads. `window.onDidChangeActiveColorTheme` also
  fires on an OS-driven switch, which changes no setting.

## Install folder and storage

- **The generated themes are the one write into the install folder.** A theme `path` resolves
  against the extension's folder, and VS Code warns on one outside it. Anything else the extension
  keeps goes to `context.globalState` or `context.globalStorageUri`, the documented writable
  locations.
- **Each update installs into a new `<publisher>.<name>-<version>` folder** holding the packaged
  default themes, so `regenerateThemes` (`extension.ts`) rebuilds once a Calmppuccin theme is
  active and offers a reload only when the files differ from what the window loaded.
- **The folder can be read-only** (Nix Home Manager, an admin's `--extensions-dir`). A failed
  build reaches the user through `showErrorMessage`, as the regenerate command's `catch` does.
- **Extension files are addressed as `vscode.Uri.joinPath(context.extensionUri, …)`.**
  `extensionPath` is only `extensionUri.fsPath`, and `Uri.file(path.join(extensionPath, …))`
  assumes the `file` scheme where the samples build every path with `Uri.joinPath`.

## Async and errors

- **An unhandled `Thenable` fails lint**, as `.oxlintrc.json` turns on `checkThenables`, which
  `typescript/no-floating-promises` leaves off by default. Await the call, give `.then` a
  rejection handler, or mark a deliberate fire-and-forget `void`.
- **VS Code ignores what a listener returns.** An async `onDidChangeConfiguration` or
  `onDidReceiveMessage` handler that rejects leaves "rejected promise not handled within 1 second"
  in the extension host log and nothing for the user, so the handler catches its own failures.
- **`context.subscriptions` is disposed on deactivation and async disposers aren't awaited.** A
  `setTimeout` isn't a disposable: `deactivate` clears it, as it does `regenerateTimer`, or it is
  wrapped in `new vscode.Disposable(() => clearTimeout(timer))`. Disposing twice is harmless, so
  the tripwire stays in `subscriptions` after `ensureListenersAreActive` disposes it.

## User-facing surface

- **No notification repeats per edit.** The UX guidelines say not to send repeated notifications
  and to offer "Do not show again". The reload prompt in `extension.ts` follows every build that
  leaves the files other than the window loaded them, so it still returns after each edit.
- **A rebuilt theme applies on reload.** VS Code watches a theme file only during extension
  development (or under the unsupported `_watch` contribution flag), so the prompt offers
  `workbench.action.reloadWindow`.
- **Diagnostics go to a `LogOutputChannel`** (`window.createOutputChannel(name, { log: true })`),
  which honours the user's log level and shows in the Output panel. `console.*`, which the code
  uses today, lands only in the extension host log.
- **User-facing strings are English constants in `src/constants.ts`.** Localizing them means
  `vscode.l10n.t` with an `l10n` manifest field, plus `package.nls.json` for manifest strings.

## Webview panel

- **A message posted before the webview listens is dropped, and `postMessage` still resolves
  `true`**, which means posted, not received. The first `loadSettings` relies on the 50 ms
  debounce outrunning the script's load. A `ready` message from the webview, answered with the
  payload, removes the race.
- **`retainContextWhenHidden` costs memory the docs reserve for state that can't be restored
  quickly.** This panel's state is one `ISettingsPayload` the host can re-send when
  `onDidChangeViewState` reports the panel visible.
- **A panel survives a reload only through `registerWebviewPanelSerializer`** called in
  `activate`, plus an `onWebviewPanel:calmppuccinSettings` activation event. Neither exists, so a
  reload closes the customizer.
- **An `onDidReceiveMessage` payload is untrusted input.** It arrives as `any`, and
  `MessageToExtension` is a cast, not a check. Validate the flavor, key and value (`isFlavor`, the
  `CUSTOMIZABLE_*_KEYS` lists, the hex pattern) before they reach settings, or an injection in the
  page writes whatever it likes into the user's settings and themes. `parseWebviewMessage`
  (`src/webviewMessages.ts`) does this before `_handleMessage` sees anything.
- **The samples gate scripts with a per-load nonce**: `script-src 'nonce-<random>'` and the same
  `nonce` on the one `<script>`. `script-src ${webview.cspSource}`, which the guide also shows,
  admits any script under `localResourceRoots`.
