---
paths:
  - extension.ts
  - build.ts
  - package.json
  - webpack.config.js
  - src/SettingsPanel.ts
  - src/WebviewManager.ts
  - src/config/SettingsWriter.ts
  - webview/**/*.ts
---

# Performance

Where this extension spends time and memory, and what keeps it cheap. `vscode-api.md` owns API
correctness, `webview.md` the message protocol and CSP, `ci-packaging.md` what the VSIX ships.

## Measure first

- **No change for speed without a profile that names the cost.** An unmeasured fix is likelier
  to add code than to save time. The PR says what was measured, with which tool, before and after.
- **Extension host: `Developer: Show Running Extensions`.** It lists each extension's activation
  time, and its title-bar control records an extension-host CPU profile while you reproduce the
  slow path. `Developer: Startup Performance` and `Help: Start Extension Bisect` rule the
  extension in or out of a startup complaint.
- **Webview: `Developer: Open Webview Developer Tools`, Performance panel.** Record a picker drag;
  each Recalculate Style entry says how many elements the tick touched.
- **Memory: `Help: Open Process Explorer`.** Compare the window's memory with the panel open,
  hidden and closed.
- **Bundles: the module list `npm run compile` prints.** For the whole graph,
  `npx webpack --config-node-env production --json=<scratch>/stats.json`.
- **Theme build: time `buildAllFlavors` from a scratch script** that requires `dist/build.js`
  after `npm run compile`, rather than adding timing code to `build.ts`. It rewrites `themes/`.

## Activation and the extension host

- **Activation is `onStartupFinished`, never `*`, and does nothing heavy.** The tripwire has to
  watch every window, VS Code having no theme activation event, but the extension host is
  shared, so time in `activate` is time other extensions wait.
- **`activate` registers and returns.** No awaited I/O, theme build or webview work on that path;
  `migrateGlobalSettingsToDefault` runs un-awaited and writes only when there's something to
  migrate. Anything else waits behind `ensureListenersAreActive` or a command.
- **A new listener joins the heavy tier.** The tripwire is the one always-on listener and checks
  one key; anything else registers in `ensureListenersAreActive` and filters with
  `affectsConfiguration` before it reads a setting.
- **No synchronous `fs` in host code.** `readFileSync` and its kin block the extension host's one
  thread for every extension in the window; `build.ts` and `WebviewManager.ts` use
  `fs/promises`, which runs on libuv's threadpool.
- **Static imports are fine at this size.** All of `dist/extension.js`, palettes included,
  evaluates on activation. A lazy `import()` of `build.ts` earns its place only once Show Running
  Extensions shows activation time growing.

## Theme regeneration

- **A theme-affecting write is a full rebuild.** Writing any `THEME_AFFECTING_KEYS` setting fires
  `onDidChangeConfiguration`, and `REGENERATE_DEBOUNCE_MS` later `buildAllFlavors` rewrites all
  six theme files and offers a reload. Writes happen once per committed user action (`change`,
  a button), never per keystroke or drag tick.
- **Builds in one host run one at a time** (`queueBuild`), and a file that comes out the same
  is left alone, so the rebuild every activation under a Calmppuccin theme triggers usually
  writes nothing, and with the files as the window loaded them, offers no reload.
- **One pass per flavor over the template.** The template is read once per build and shared; each
  flavor does one combined-regex replace, one `JSON.parse` and one `JSON.stringify`. A per-key
  `replaceAll` loop rescans the whole template once per key.
- **Flavors build concurrently because each writes its own file.** Node's promise `fs` calls
  aren't synchronized, and concurrent writes to one file can corrupt it.
- **The build stays on the host thread.** `worker_threads` adds a bundle entry and message
  passing for nothing until a CPU profile shows the build blocking.

## Webview

- **`input` repaints the preview; `change` crosses to the host.** `ControlFactory` and
  `AccentController` update `previewState` and repaint on `input`, and post only on `change`. A
  new control keeps that split: a message per tick is a settings write and a six-theme rebuild
  per tick.
- **The host doesn't echo a write back.** `SettingsPanel._handleMessage` calls `_update()` only
  where the webview can't know the outcome: reset, profile switch, save and delete. Echoing a
  per-key write reruns `populateAllSettings`, which clears and recreates every control and drops
  focus.
- **Per-tick work scales with what changed.** `updatePreviewPane` restyles every key in
  `previewState`, one `querySelectorAll` each, on every `input` tick. That's cheap at today's
  snippet sizes; when a profile says otherwise, repaint only the changed key before reaching for
  throttling.
- **Handlers write styles and read no layout.** Reading `offsetHeight`, `getBoundingClientRect`
  or `getComputedStyle` between `el.style` writes forces a synchronous layout per element. A
  handler that needs a read does every read first, or defers the visual work to one
  `requestAnimationFrame` behind a pending flag.
- **`innerHTML` swaps whole regions.** Snippet changes and container clears use it; a single
  token or control is updated in place.
- **`retainContextWhenHidden` keeps the panel's whole renderer alive while it's hidden.** VS Code
  reserves it for state that can't be saved and restored quickly, and this panel's state is an
  `ISettingsPayload` plus two dropdowns. Dropping it means re-posting the payload from
  `onDidChangeViewState` (a hidden webview gets no messages), keeping the dropdowns in
  `vscode.setState`, and re-running `webview.js` on each reveal. Decide with Process Explorer and
  the Performance panel, and leave it off any new panel.

## Bundles

- **Snippet HTML is most of `dist/webview.js`**, and the webview parses all of it each time the
  panel opens. A new language is fine; a generated or very long sample is not.
- **`"sideEffects": false` in `package.json` covers this repo's own modules.** A module imported
  only for what it does on load is dropped from the production bundle without a warning, and
  Jest, running the sources, won't notice. Start-up side effects live in entry modules:
  `extension.ts`, the guarded start at the foot of `webview/main.ts`, `build.ts`'s
  `require.main` block.
- **Don't count on tree shaking to remove a new import.** ts-loader emits CommonJS
  (`"module": "commonjs"` in `tsconfig.json`, which Jest needs), so webpack prunes exports only
  partly and each module carries TypeScript's interop helpers. Read the cost in the module list.
- **A runtime dependency is bundled, not shipped.** `vsce package --no-dependencies` leaves
  `node_modules` out, so a new package goes through webpack: check its size in the module list
  before adding it, and keep it out of `webview/` unless the webview needs it.
