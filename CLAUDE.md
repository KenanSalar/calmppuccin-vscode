# CLAUDE.md

Calmppuccin, a VS Code color theme extension (`kenan-salar.calmppuccin-vscode` on the Marketplace
and Open VSX): six softened Catppuccin flavors and a webview for customizing them. TypeScript 6
(strict), bundled by webpack 5, tested by Jest 30 on jsdom, linted by oxlint and formatted by
oxfmt, on Node 24.

- **Themes are generated, never edited.** `build.ts` fills the `{{key}}` placeholders in
  `src/template/` from a flavor's palette in `src/palettes/`, adds the third-party colors from
  `src/extensions/`, and writes `themes/calmppuccin-<flavor>-color-theme.json`.
- **It runs twice**: at package time (`buildDefaultThemes`, default settings), and inside the
  extension host whenever a Calmppuccin theme becomes active or a setting in
  `THEME_AFFECTING_KEYS` changes, rewriting the installed extension's own `themes/` and offering
  a window reload when the files differ from what that window loaded (`regenerateThemes` says
  why both).
- **The customization UI** (`webview/`) reaches the host only through the message unions in
  `types/webview.ts`. `src/SettingsPanel.ts` hands each message to `ConfigurationService`, which
  writes the active profile in `calmppuccin.profiles`; the settings listener in `extension.ts`
  then regenerates the themes.
- **Activation is `onStartupFinished`**, as VS Code has no event for selecting a color theme. One
  theme-change listener then waits; the settings listener and the rebuild start only once a
  Calmppuccin theme is active or the UI has opened.

`webpack.config.js` builds three bundles: `extension.ts` → `dist/extension.js` (`vscode`
external), `build.ts` → `dist/build.js`, `webview/main.ts` → `dist/webview.js`.

## Where things go

Rules load only when Claude *reads* a file their `paths:` glob matches, never on a grep hit or a
failing test, so this table finds them.

| file | covers |
|------|--------|
| `.claude/rules/theme-generation.md` | the placeholder and accent-recipe contract, adding a color key, a font-style key or a flavor, the third-party generators |
| `.claude/rules/configuration.md` | the profile model, the `ConfigurationService` facade, empty-override cleanup, legacy migration |
| `.claude/rules/webview.md` | the message protocol, the CSP, controller injection and the shared preview state, preview snippets |
| `.claude/rules/ci-packaging.md` | what the VSIX ships, action pinning, the PR path filter, the release workflow |
| `.claude/rules/code-style.md` | writing code and comments, the comment budget and its audit, the doc-comment format |
| `.claude/rules/typescript.md` | what checks types, narrowing settings JSON, key guards, `satisfies` and `as const` tables, no enums, the ES2025 runtime |
| `.claude/rules/vscode-api.md` | the API floor, manifest defaults (activation, `extensionKind`, trust, setting scope), configuration reads and writes, the install folder, Thenables, notifications, the webview panel |
| `.claude/rules/performance.md` | measuring first, activation cost, theme regeneration, webview input handling, bundle size |
| `.claude/rules/testing.md` | testing practice: the ISTQB principles, case design, walks over a collection, async tests and expected failures, Jest 30 assertions, doubles and seams, isolation and determinism, coverage, naming |

- **A fact goes at its anchor**, the doc comment on what it constrains. A rule names that code
  rather than restating it, and holds only what crosses files.
- **A code comment never cites a rule or this file**; it states its own reason.
- **Re-read `.claude/rules/code-style.md` before writing comments, and run its "Auditing a
  change" before reporting the work done**: only this file survives `/compact`.

## Commands

```bash
npm ci
npm run compile          # webpack production build of all three bundles
npm run build-themes     # compile, then write themes/ with default settings
npm run watch            # webpack in watch mode; it doesn't regenerate themes/
npm run format           # oxfmt; CI runs format:check
npm run lint             # oxlint, type-aware; a warning fails it
npm run type-check       # tsc --noEmit: the only type check, as Jest and webpack transpile only
npm test                 # Jest; `npm test -- <pattern>` runs matching files
npm run test:coverage    # report in coverage/
npm run update-vscode-colors  # refetch VS Code's color keys into test/__fixtures__/
npm run package          # .vsix; vscode:prepublish runs build-themes first
```

Ctrl+F5 (Run Without Debugging, `.vscode/launch.json`) opens an Extension Development Host
without building anything: run `npm run build-themes` once, then `npm run compile` after each
change. Suggest F5 only for breakpoints; Known gaps says why.

## Prohibitions violable from anywhere

### Versions

- **`engines.vscode` never exceeds the VS Code API Cursor declares**: 1.128.0 since Cursor 3.12
  (July 2026). Help → About in Cursor is the source, as web pages lag. Past it, Cursor users on
  Open VSX lose the extension.
- **`@types/vscode` is pinned to exactly the `engines.vscode` minimum**, so an API newer than the
  floor fails to type-check. 1.125 is the newest with published typings at or below 1.128.
- **Moving `engines.vscode` comes with `npm run update-vscode-colors`**, which refreshes the
  newest VS Code release's color keys and deprecations in `test/__fixtures__/workbenchColors.json`.
- **`@types/node` stays on `~24.13`**, the newest typings line not past the Node 24.15 in that
  minimum's extension host.
- **TypeScript stays on 6.x**: ts-jest requires `typescript <7`, and ts-loader needs the classic
  compiler API that 7.0 dropped.

### Code

- **Setting keys, command ids, message commands and file names live in `src/constants.ts`**,
  never as literals at the use site.
- **A new `vscode` API call needs its entry in `test/__mocks__/vscode.ts`**: Jest maps `vscode`
  to that file, which mocks only what the code uses.
- **Code that runs on import and must not run under Jest sits behind
  `process.env.JEST_WORKER_ID === undefined`**, as the webview start-up in `webview/main.ts` and
  the migration in `extension.ts` do.
- **A new file under `src/` ships in the VSIX unless `.vscodeignore` lists it**
  (`.claude/rules/ci-packaging.md`).
- **Never edit `themes/` or `dist/`**: both are build output.
- **Suppress a lint only with `// oxlint-disable-next-line <plugin>/<rule>`** on the line, and
  never leave one unused: `.oxlintrc.json` makes that an error.
- **Interfaces take an `I` prefix, private members a leading `_`**, constants `UPPER_SNAKE_CASE`,
  flavor keys kebab-case (`nitro-cold-brew`).

### Tests

- **Tests live in `test/unit/` and `test/integration/`** as `*.test.ts`. The color generators
  share `test/__fixtures__/mockPalette.ts`.
- **A type error in a test shows only in `npm run type-check`**: ts-jest transpiles each file in
  isolation (`isolatedModules`).

### Git and releases

- **A release is a pushed `v*.*.*` tag on `main` matching `package.json`'s version, never a
  merge.** Land the version bump as a PR, then tag its merge commit; `release.yml` publishes to
  the Marketplace, Open VSX and a GitHub release.
- **`pr-validation` is the only required check**, aggregating type-check, lint, format, test and
  package.

## Known gaps

- **Nothing checks that every template placeholder has a value.** `build.ts` builds its
  placeholder pattern only from keys it has values for, so a `{{key}}` that no palette, accent or
  font style defines ships literally in every theme without a warning. After touching the
  template, `npm run build-themes && grep -l '{{' themes/` should print nothing.
- **Reloading a Development Host started with F5 can kill its extension host** (exit code 134)
  before any extension loads: the debugger's `Network.enable` trips an assertion in Node's
  network inspection ([nodejs/node#64308](https://github.com/nodejs/node/issues/64308)). It is
  not this extension's code, and the customization UI asks for a reload after every theme change,
  so anything that reloads is tested under Ctrl+F5, or the debug session is restarted instead.
  
## User Conventions

- Always call big files/objects/functions **'monolithic'** — no synonyms.
