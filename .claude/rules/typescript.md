---
paths:
  - "**/*.ts"
  - tsconfig.json
  - .oxlintrc.json
---

# TypeScript

TypeScript 6.0 as `tsconfig.json` sets it up, linted by oxlint's type-aware `strictTypeChecked`
set. Naming and doc comments belong to `code-style.md`, the extension API to `vscode-api.md`,
tests to `testing.md` and speed to `performance.md`. What the linter already rejects isn't
repeated here.

## What checks what

- **`npm run type-check` is the only type check.** ts-loader (`transpileOnly`) and ts-jest
  (`isolatedModules`) compile one file at a time and drop type errors, so a green
  `npm run compile` or `npm test` says nothing about types. Run it before calling work done.
- **Probe a compiler flag with `npx tsc --noEmit -p . --<flag>`.** TypeScript 6 refuses
  `tsc file.ts` next to a `tsconfig.json` (TS5112). The error count is what the flag costs.
- **`tsconfig.json` keeps to options 6.0 doesn't deprecate.** `baseUrl`,
  `moduleResolution: node10`, `downlevelIteration` and `esModuleInterop: false` are removed in
  7.0, and `ignoreDeprecations: "6.0"` only silences them until then. `types` defaults to `[]`,
  so a package that adds globals has to be listed there by name.
- **One tsconfig types two runtimes.** With no `lib` set, `es2025` gives host code the DOM, and
  `types: ["node"]` gives the webview `process` and `fs`. The compiler stops neither: `document`
  in `src/` fails only at runtime in the extension host, and a Node or `vscode` import in
  `webview/` fails only at `npm run compile` (`webview.md` says what the webview may import).

## Values from outside the program

- **User JSON is narrowed as deep as it's read.** A `typeof v === "object"` test on a map says
  nothing about its members: `getProfiles` checks `calmppuccin.profiles` but not each profile, so
  `"Default": null` reaches `profile[key]` and throws. Check each level before indexing into it,
  and rule out arrays and `null`, which are objects too.
- **`get<T>()`, `JSON.parse(…) as T` and a generic that returns `value as T` assert; they don't
  check.** The caller picks `T` and nothing verifies it. That's fine for files this repo writes
  (`src/template.json`, `package.json`) and wrong for settings, which reach a type-guard function
  (`(v: unknown): v is IFontStyles`) that tests what callers will touch.
- **A key guard uses `Object.hasOwn`, never `in`.** `in` walks the prototype chain, so
  `isFlavor("constructor")` is true and yields a `keyof IPalettes` that indexes a function.
  `Object.hasOwn` also replaces `Object.prototype.hasOwnProperty.call`.
- **An `as` is a claim nothing re-checks.** `typescript/no-unsafe-type-assertion` is off here and
  `no-non-null-assertion` is on, so narrow instead: `instanceof HTMLSelectElement` on a DOM
  lookup, the element already in the closure rather than `e.target as …`, and a guard that throws
  with a message (`requireElement` in `webview/main.ts`) where `!` would go.
- **Rethrow with `{ cause }`.** A `catch` binding is `unknown`; take the message after
  `instanceof Error` and pass the original as `cause` so its stack survives, as `fillTemplate` does.

## Shaping types

- **An index signature is for an open map only.** With `noUncheckedIndexedAccess` off, a read
  through one is typed `string`, never `undefined`, and any name compiles: `palette.rde` passes,
  and a key one palette lacks compiles too, left to `palettes.test.ts` to catch.
  User-keyed maps (overrides by flavor, then token) take one; a fixed key set is a union of
  literals or a declared shape.
- **Reading through an index signature, write the `undefined` case yourself**: `?? fallback`, or
  `Object.hasOwn` first, as `getWebViewSettings`' `getSyntaxOverrides(config)[activeFlavor] ?? {}`
  does. The type says the value is there and the user's settings.json decides whether it is.
- **Check a table with `satisfies`, don't annotate it.** `const t: T = {…}` widens to `T` and
  drops the keys and literal values; `{…} satisfies T` checks the shape and keeps both. A
  widening annotation over `as const` throws the `as const` away (`THEME_AFFECTING_KEYS`). A
  per-flavor table written `satisfies Record<keyof IPalettes, …>` fails type-check until a new
  flavor has its entry, as `ICON_FLAVORS` in `extension.ts` does.
- **Shared lists are `as const`.** A module-level `string[]` can be pushed to by any importer and
  its entries widen to `string`; `as const` makes it readonly, and `(typeof KEYS)[number]` is the
  union of its entries with no second copy to keep in step.
- **No `enum`.** Use a union of literals, or an `as const` object where the values want names, as
  `WEBVIEW_CONSTANTS` does. An enum is runtime code, which `erasableSyntaxOnly` and Node's type
  stripping reject, and `isolatedModules` keeps even a `const enum` as an object.
- **A `switch` over a union ends in `const _exhaustive: never = value`** in its `default`, so a
  new member fails type-check until it's handled (`SettingsPanel._handleMessage`). A `switch` on a
  bare `string` gets no such check; narrow the value to a union first.

## The ES2025 runtime

- **Use the platform before writing a helper.** `target: es2025` emits these as written, and the
  floor, VS Code 1.125's extension host on Node 24.15, runs them: `RegExp.escape`,
  `Object.hasOwn`, `Object.groupBy`, `Array.prototype.toSorted`, the `Set` methods, iterator
  helpers and `Promise.try`. `esnext` APIs such as `Map.prototype.getOrInsert` and `Temporal`
  are neither typed nor in Node 24.
- **`using` takes an object with `[Symbol.dispose]`**, which Node 24 has. `vscode.Disposable` in
  the pinned 1.125 typings has only `dispose()`, so VS Code resources still go to
  `context.subscriptions` (`vscode-api.md`); `using` is for scoped resources of our own.
