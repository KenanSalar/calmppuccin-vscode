---
paths:
  - "**/*.ts"
  - webview/**/*.html
  - webview/**/*.css
  - .oxlintrc.json
---

# Code style and comments

## Writing Code Like a Senior Engineer

Write every change as an experienced human engineer would — code a senior colleague
would approve without rewriting, indistinguishable from thoughtful hand-crafted work.
Optimize for the next person who reads it (usually your future self), not for looking
clever or finishing fast.

- **Clarity over cleverness** - clear beats clever every time. Expand a clever one-liner
  into a few obvious lines when it reads better. Readable code scales; clever code ages badly.
- **Write for the reader** - code is read far more than written. Make intent obvious on the
  page; don't make the reader hold state in their head or decode `u`, `s`, `tmp`.
- **Name things precisely** - intention-revealing names (`calculateTotalPrice`,
  `isSubscriptionActive`), never `d`, `x`, `foo`, or a bare `data`. A good name removes the
  need for a comment.
- **Small, single-purpose functions** - one job, one level of abstraction. If you're
  narrating "step 1… step 2…", split it into functions a reader can hold in their head.
- **Guard clauses over nesting** - return early and flatten arrow-shaped `if/else` pyramids;
  handle the edge/error case first, then the happy path.
- **No magic values** - lift magic numbers/strings into named constants or config; the name
  documents the intent.
- **Minimize side effects** - prefer functions that take input and return output; centralize
  state mutation and I/O rather than scattering it.
- **Reduce, don't just add** - seniors delete. Remove dead code, collapse duplication, prefer
  the smaller solution, and leave each file a little cleaner than you found it (boy-scout rule).
- **Match the surrounding code** - mirror the existing naming, structure, error-handling, and
  style of the file. Consistency beats personal preference.
- **Handle errors and edges deliberately** - no silent catches or ignored failures; make
  failure modes explicit and intentional.
- **Be pragmatic, not dogmatic** - these are defaults, not laws; knowing when to bend one for
  clarity or simplicity is what separates senior from junior. (Complements **Principles** and
  **Antipatterns to Avoid** in the global `CLAUDE.md` — don't duplicate them.)

Avoid the tells of machine-generated code: comments that restate the code, defensive
boilerplate nobody asked for, needless abstraction, over-verbose names, and style that drifts
within a file. The result should look like a thoughtful human wrote it.

## Clean code

The list above is the half of clean code that gets quoted: names, small functions, guard
clauses, no magic values, no duplication. What follows is the rest of it, and it is the half
that bites in review. The frame underneath both is that code is finished when it passes its
tests, holds no duplication, says what it means, and has no more parts than that.

**Signatures**

- **Few parameters** - none, one or two read at a glance; three is worth a second look and
  four wants an options object, as `buildAllFlavors` takes `IBuildOptions`. A list long enough
  to count is usually two functions, or one type that hasn't been named yet.
- **No flag parameters** - a `boolean` argument splits the body before the reader reaches it,
  and `render(settings, true)` says nothing at the call site. Ship the two functions the
  branches already are; where it genuinely is one operation, name the choice with a union of
  string literals (`typescript.md` says why not an `enum`).
- **Meaning belongs in the type, not the primitive** - a bare `string` at a boundary lets the
  wrong one through in silence, and a flavor, a color key, a hex color and a profile name are
  all `string` here. A literal union (`keyof IPalettes`, `MessageToExtension["command"]`) or a
  branded type makes that a type error and retires the comment explaining the value.
- **A brand is minted only where it's checked** - a branded type
  (`string & { readonly __brand: "HexColor" }`) comes out of the one guard or parser that tests
  the value. An `as HexColor` anywhere else mints one unchecked, and the brand proves nothing.
- **Parse at the boundary, once** - a value from outside the program becomes its type in one
  function that checks every field and returns the typed value or `undefined`, as
  `parseWebviewMessage` and `toProfiles` do; past it, code trusts the type. A check repeated at
  each use is a parser nobody wrote. `typescript.md` says how deep to narrow.
- **`readonly` what you only read** - an array, set or map the body only reads is typed
  `readonly T[]`, `ReadonlySet` or `ReadonlyMap`, so the signature promises the caller's value
  comes back untouched and a stray `push` fails type-check. A function that does mutate its
  argument says so in its name.
- **Take the value, not its holder** - a parameter read for one field takes that field:
  `_getHtmlForWebview` takes the extension's path, not the `vscode.ExtensionContext` it came
  from. Naming the holder ties every caller and every test to building one; the context is right
  only where the body keeps it or pushes into `subscriptions`.
- **Command or query, never both** - a function either changes state or answers a question.
  One that does both leaves every call site working out whether calling it twice is safe.
- **Don't reach through** - `a.b().c().d()` couples the caller to the shape of everything in
  the middle, and an optional chain four links deep is the same coupling with `?.` between the
  links. Ask the neighbour for the answer instead of walking its internals; the function you
  want usually belongs beside the type you already hold.
- **A function unless it needs `this`** - a method that never reads `this` is a module-level
  function, and a class is for state its methods share. A class of statics is a module with an
  extra name to type; `.oxlintrc.json` allows one for the `ConfigurationService` facade.

**Reading order**

- **Newspaper order** - a file opens with what it is and descends into detail: exports above
  the helpers they call, related functions adjacent, blank lines separating concepts rather
  than decorating them.
- **Declare close to first use** - a binding introduced far above the line that reads it is
  state the reader has to carry until then.
- **Name the sub-expression** - lift a dense condition or a nested call into a `const` whose
  name is the explanation. That is the comment you never have to keep true.
- **Say it positively** - `if (!notReady)` costs a mental flip at every read. Name the positive
  condition and negate at the one site that needs it.

**Vocabulary and shape**

- **One word per concept** - this tree reads with `get`, writes with `update` and clears with
  `reset`. `fetch` or `load` for the same act, or two names for one thing, force the reader to
  check whether the difference means something. Rename it; never add the synonym.
- **A distinction that isn't in the name isn't a distinction** - `data`, `info`, `manager`,
  `helper` and a trailing `2` name nothing. If two things need telling apart, the names do it.
- **One home per boundary condition** - the cap, the clamp, the off-by-one, the list of keys
  that are backgrounds rather than foregrounds. A named place that owns it beats the literal
  repeated at each call: tuning is one edit, reviewing is one read.
- **A dispatch repeated is a table missing** - the same `switch` on a union spelled in three
  files wants one table keyed by that union and checked with `satisfies Record<Union, …>`, as
  `PARSERS` in `src/webviewMessages.ts` is. Adding a member should fail type-check in one file,
  not hide in three.

Test practice, including what all of this means for a test, is `.claude/rules/testing.md`.

## Comments

Comments are a liability, not an asset — each one is prose you must keep true. Write few, make
each earn its place, and re-read every comment before moving on.

- **Explain *why*, not *what*** - the code already shows what it does; a comment justifies a
  non-obvious choice, trade-off, or gotcha. If you're narrating the code, delete it.
- **`/** */` for whoever calls it, `//` for whoever edits it** - VS Code shows TSDoc in hover and
  completion wherever the symbol is used, while a `//` is read only in the file. The contract
  goes in TSDoc on the declaration; a note on how the body works goes in a `//` beside the line
  it explains.
- **Prefer self-documenting code** - clear names and small functions beat comments. If a comment
  has to explain "step 1… step 2…", the function is too big — split it instead.
- **No redundant comments** - never restate a name, type, or the obvious: `/** Gets the accent. */`
  on `getAccent`, `@param key The key`, `// Clear existing options` over `innerHTML = ""`.
- **Be terse** - one line where one line works; no decorative banners, ASCII art, or boilerplate.
- **Sound like a senior engineer, not a generator** - write comments in plain, natural prose,
  the way a human colleague jots a note: terse, direct, peer-to-peer. Avoid the machine tells —
  restating the signature, "This function…", robotic step-by-step narration, hedging, and
  decorative filler. Assume the reader knows the language.
- **Double-check every comment** - confirm it is accurate and *still* true. When you touch code,
  update or delete the comments around it; a stale or wrong comment is worse than none.
- **Comment the genuinely non-obvious** - empty catch blocks, an `as` the compiler can't check,
  workarounds (link the issue/PR), non-trivial regexes, magic constants, and ordering
  assumptions such as a debounce or a promise queue.
- **No commented-out code** - delete it; version control remembers.
- **Match the file** - follow the surrounding code's existing comment *style*. Not its density:
  a dense neighbour is not a budget, and the rules above outrank it.
- **Document the exported surface** in the doc-comment format below: a single-sentence summary
  that says what the name can't. An export its name and types already explain gets none, rather
  than a rephrasing.
- **No changelog** - no "used to", "no longer", "previously" or "now", no bug story, and no
  refactor story ("extracted from", "split into", "preserves the original API"). Nothing about
  what shipped before; git holds the history.
- **No second copy** - an argument lives at its anchor, the doc comment on what it constrains,
  and a setting's meaning in its `package.json` description, which the Settings editor shows.
  Anywhere else names the anchor rather than arguing it again.
- **A `@file` block is the module's contract and its one non-obvious why** - not its history,
  not a tour of the functions below it, and not "This file…".
- **One or two sentences carry a rationale** - a paragraph means a name, a type or a split should
  be saying it.
- **Don't overstate** - no "never", "always" or "forever" without the mechanism that makes it so;
  no benchmark figures, which go stale with the next change; a tunable's doc says what it does,
  not the value or rank it has today.
- **Some comments are kept whole** - the reason above an `oxlint-disable-next-line`, a
  `@ts-expect-error`'s description (`ban-ts-comment` requires one), and a comment a rule or test
  points at, condensed with the pointer kept true.
- **`webview/snippets/` is sample source, not code** - a comment inside a snippet's template
  string is preview content, colored as a `comment` token, and none of this applies to it.

**The budget is about 0.25 comment lines per line of code**, production code only:

```bash
# tests, build output and the preview snippets left out
cloc --include-lang=TypeScript,CSS,HTML \
  --exclude-dir=test,node_modules,dist,coverage,themes,snippets \
  --not-match-f='^jest\.config\.ts$' .
```

It holds across the corpus, not per file: a module of tuned constants can sit above it while a
plain one sits well below. It shows drift and is never an allowance; a comment the rules above
don't justify goes whatever the count says.

**Auditing a change.** After `npm run format` and `npm run lint` pass, and before the work is
reported done (oxlint runs no JSDoc plugin here, so nothing else reads a doc comment):

```bash
# every comment line the change adds; `main...` in place of `HEAD` for a whole branch
git diff -U0 HEAD -- '*.ts' '*.css' '*.html' ':!webview/snippets' |
  rg '^\+\s*(//|/\*|\*|<!--)'
# each file the change created, against the budget
cloc --by-file <new files>
```

- Each listed line passes the rules above or goes. A reworded or moved comment counts as new, so
  a rename that pushes a comment onto a second line gets rewritten back to one.
- The corpus command above confirms the tree-wide figure hasn't drifted.

**Doc comments in this tree:**

| Language | Doc syntax | Notes |
|----------|-----------|-------|
| TypeScript | `/** */` (TSDoc) | Read in hover and completion; nothing generates a docs site. The summary is everything before the first tag, so no `@description`. `@param name - text`, with TSDoc's hyphen and no `{type}`, only for a parameter its name and type leave unexplained; `@typeParam` for a type parameter; `@returns` only when the summary doesn't say it; `@throws` for a failure the caller has to handle; `{@link name}` to point at a symbol. No tag the code already states: `@private`, `@interface`, `@class`, `@type`, `@template`, `@async`. A module opens with a `@file` block |
| CSS | `/* */` | No doc form. A comment earns its place on what the sheet answers to from outside it: script-set state a selector matches, the `!important` that beats it, a size matched to VS Code's chrome. A long sheet's section labels stay one line |
| HTML | `<!-- -->` | No doc form, and `index.html` ships as it is, so a comment reaches every user's webview |
| JSONC | `//` | `.oxlintrc.json` and `tsconfig.json` take comments; `package.json` and `src/template.json` are strict JSON |
