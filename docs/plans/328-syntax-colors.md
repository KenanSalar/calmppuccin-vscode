# Issue #328: syntax colors that disagree, fixed one selector at a time

Sections 1.1 to 2.3 land in one pass with no commits between them. The gates and the hand test run
once over the whole change. Tests are a separate task, not part of this plan. A step is marked
"(done)" when it lands.

## Context

**What you see today.** With semantic highlighting on, the editor colors a lot of tokens by what
the language server says. Hovers, fenced code in Markdown, the first moments before a server is
ready, and every language without a server get only the grammar's colors, and those disagree:

- **Rust:** `u32` is number-colored and `bool`/`str` keyword-colored in a hover, but type-colored in
  the editor. The `;` of a `use` line is keyword-colored while every other `;` is plain. Lifetimes
  are keyword-colored in the editor, and in a hover they split: the `'` is plain and the name
  class-colored. `println!` is function-colored, `Some`/`Ok` class-colored, `type Output`
  class-colored, and `{total:>8.2}` string-colored.
- **Python:** `int`, `str` and `ValueError` are keyword-colored in both places. `cls` takes the
  parameter color while `self` takes the keyword color.
- **TS/JS:** a parameter's type annotation is keyword-colored, while the same type as a return type
  is class-colored. Without semantic highlighting, `namespace X` and `type X` are class-colored, and
  so is every object in front of a `.` (`text.split`).
- **Data files:** every format colors its keys differently. YAML keys use the keyword color, TOML
  keys and `[tables]` the function color, INI keys and `[sections]` the keyword color, and `.env`
  keys the variable color.
- **Elsewhere:** GraphQL's `query` and GDScript's `extends` are plain, and so is Julia's `const`.
  Haskell and Julia types use the decorator color. `~~struck~~` text has no style. In a `.diff`,
  removed lines are keyword-colored, and the headers and hunk ranges are plain.

**Why.** Each one is a selector in `src/template/tokenColors.json` that catches the wrong scope, or
a semantic token type with no rule in `src/template/semanticTokenColors.json`. VS Code picks the
innermost scope that any rule matches. Within that scope, the longest dotted prefix wins, then a
selector with parent scopes beats one without, then the later rule wins. So adding a language's own
scope (`entity.name.tag.yaml`) overrides a shared one (`entity.name.tag`) without moving HTML.

**What you'll see after.** Built-in types take the type color in the editor and in hovers.
YAML, TOML, INI and `.env` keys share JSON's top-level key color, and TOML tables and INI sections
share the Markdown heading color. Each smaller item in the issue takes the color its language
server already uses. Nothing new goes into the six palettes, and the customization UI doesn't
change.

## Structure

- **`src/template/tokenColors.json`** owns every TextMate change. It stays one monolithic file,
  because rule order breaks ties (`theme-generation.md`). It gets six new rules: macro, type alias,
  data-file key, data-file section, strikethrough, and a diff header plus range pair.
- **`src/template/semanticTokenColors.json`** owns four new keys: `class.builtin:python`, `clsParameter`,
  `lifetime` and `label:rust`.
- **`package.json`**: the `jsonLvl0` and `jsonLvl0FontStyle` descriptions, since YAML, TOML, INI
  and `.env` keys now follow that setting too.
- No palette, constant, webview, `build.ts` or CHANGELOG change. CHANGELOG is written with the
  version bump.
- **Duplication collapsed first:** every fix moves a scope rather than copying it, so each touched
  scope ends up in exactly one rule. For example, `variable.key.dotenv` leaves the variable rule,
  `support.type.exception.python` and `markup.deleted.diff` leave the tag rule, and the Go, Groovy,
  Haskell, Julia, VB and GraphQL types leave the annotation rule. The dead
  `entity.name.lifetime.rust` is deleted, since no installed grammar emits it.

Line numbers below are `src/template/tokenColors.json` and `semanticTokenColors.json` at `8e2d1cf`.
The issue's numbers predate the template split (`23209aa`). Every scope below was grepped from
VS Code 1.146's built-in grammars or the installed Pylance 2026.4.1, rust-analyzer, Even Better TOML
0.21.2 and redhat.vscode-yaml grammars. The one exception is GraphQL, whose grammar was read from
upstream `graphql/graphiql`.

## Prior art

- **Catppuccin upstream** `packages/catppuccin-vsc/src/theme/tokens/diff.ts:16-23` colors
  `meta.diff.header.from-file`, `meta.diff.header.to-file` and their `---`/`+++` punctuation blue,
  and has no hunk-range rule. *Not copied:* its explicit `markup.deleted.diff` red, because our
  "Deleted" rule already covers removed lines once the tag rule lets go.
- **VS Code `theme-defaults/themes/dark_vs.json`** has a `markup.strikethrough` rule that sets only
  the font style, a blue `meta.diff.header` rule, and a bare `keyword` rule. *Not copied:* its bare
  `keyword` also colors Python's `TODO` codetags inside comments and F#'s `:`, `->` and `|` as
  keywords. Step 2.2 exempts both.

## Implementation, one pass

The numbering only groups the changes, it doesn't order them. Everything below is edited before
any gate runs.

## 1. Types and declarations

### 1.1 Built-in types take the type color (done)

- **Type rule (:393) gains these scopes:**
  - `entity.name.type.numeric` (moved from number :549) and `entity.name.type.primitive` (moved from
    keyword :297). Only Rust emits either.
  - Rust also scopes a literal's suffix (`10u32`, `0xffu8`) as `entity.name.type.numeric.rust`
    inside `constant.numeric`, so the number rule keeps `constant.numeric entity.name.type.numeric`
    and the suffix stays the literal's color.
  - Python: `support.type.python`, `support.type.builtin.python` (Pylance's `list[`/`dict[`),
    `support.type.exception.python` (moved from tag :802), and `support.type.metaclass.python`
    (`type`, which wasn't in the issue).
  - The "want a look" scopes, all moved from annotation (:744-753): `source.haskell storage.type`,
    `support.type.julia`, `source.go storage.type`, `source.groovy storage.type`, `support.type.vb`
    and `source.graphql support.type`. Also `support.type.builtin.graphql`.
  - `storage.type.error` leaves the keyword rule (:367) without joining this one. Only Go emits
    it, and `source.go storage.type` then covers it.
- **TS:** delete `meta.type.annotation entity.name.type` (keyword :316). Annotation types then fall
  to `entity.name.type` (class), as return types already do.
- **Decorators rule (:953) gains `meta.function.decorator.python support.type.python`**, so
  `@classmethod` and `@property` keep the decorator color that Pylance's `class.decorator` gives
  them in the editor.
- **semanticTokenColors gains `class.builtin:python` → `{{type}}`**, placed next to
  `class.typeHint` (:62). `builtin` is Pylance's own modifier, and the language suffix keeps a
  future server that declares one from picking the rule up unchecked. It must sit *above*
  `class.decorator` (:94): a decorated builtin matches both rules with equal score, and VS Code
  lets the later rule win the tie.
- **What else moves:**
  - Go: `bool`, `byte`, `rune` and `uintptr` (annotation today) and `error` (keyword today) join
    `int` and `string` in the type color.
  - Groovy: class types such as `String` go from the annotation color to the type color. `def`
    stays keyword (:808).
  - VB/ASP: the type after `As` goes from the annotation color to the type color.
  - GraphQL: type, enum and directive-location names go from the annotation color to the type
    color. Built-in scalars go from the keyword color to the type color.

### 1.2 Rust (done)

- **`use` lines:** delete `meta.use` (:317). Only Rust and PHP emit it. In Rust, the `;` and a
  trailing path segment (`io` in `use std::io;`) go plain. In PHP, `meta.use.php` is the trait `use`
  inside a class body, and its `{ }` lose the keyword color.
- **Lifetimes and labels:**
  - The type parameter rule (:411) gains `entity.name.type.lifetime.rust` and
    `punctuation.definition.lifetime.rust`. The grammar scopes labels the same way.
  - semanticTokenColors gains `lifetime` and `label:rust` → `{{typeParameter}}`. `label` is a
    standard VS Code token type that any language server can emit, so the language suffix keeps
    other languages' labels where they are.
  - Delete the dead `entity.name.lifetime.rust` (:294).
  - *Departure from the issue:* `storage.modifier.lifetime.rust` is not added. It is only
    rust-analyzer's fallback scope for `lifetime`, and VS Code's `getTokenStyle` probes a fallback
    scope only for style properties that the theme's own semantic rules leave unset. With a
    `lifetime` rule in place, VS Code never reaches it.
- **Macros:** a new "macro" rule goes after "function, method", with `entity.name.function.macro`
  (covers `.rust` and `.rules.rust`; only Rust emits it) and `entity.name.type.macro.rust` (a
  capitalized `Foo!`). It uses `{{macro}}` and `{{macroFontStyle}}`.
- **`Some`, `None`, `Ok`, `Err`:** the enum member rule (:224) gains `entity.name.type.option.rust`
  and `entity.name.type.result.rust`.
- **Type aliases:** a new "type alias" rule goes after "type", with
  `entity.name.type.declaration.rust` and `{{typeAlias}}`/`{{typeAliasFontStyle}}`. It is also
  rust-analyzer's fallback scope for `typeAlias`, so both sides agree.
- **Format strings:**
  - The punctuation rule (:693) gains `punctuation.definition.interpolation.rust`.
  - The variable rule (:23) gains `meta.interpolation.rust`. The grammar can't split a name from
    its spec, and a bare name is the common case.

### 1.3 TS/JS and Python (done)

- **Namespace rule (:158) gains `entity.name.type.module`.** It covers TS/JS `namespace X` and
  `X.Y` qualifiers, and also Java module declarations, Ruby `module Foo` and Swift module names.
  Ruby LSP colors those as namespaces too.
- **Type rule gains `entity.name.type.alias.ts`, `.tsx` and `.js`** for TS/JS `type X`, which the
  TypeScript server colors as a type. C++ and C# share the `entity.name.type.alias` prefix for
  `using X = …`, and Roslyn colors that alias by its target, so they stay on the class color.
- **Class rule loses `variable.other.object` (:185)**, so those tokens fall to `variable.other`
  (:74). This also reaches:
  - Java, C# and CoffeeScript objects in front of a `.`.
  - C, C++ and ObjC `variable.other.object.access`.
  - C++ declared names (`variable.other.object.declare.cpp`), which are class-colored today.
- **Python `cls`: semanticTokenColors gains `clsParameter` → `{{keyword}}`**, next to
  `selfParameter` (:22). The grammar side already resolves to keyword through
  `variable.parameter.function.language.special` (:380) and `variable.language` (:374), so no
  TextMate entry is added.

## 2. Data files, keywords, Markdown and diff

### 2.1 Data-file keys and sections (done)

- **A new "Data file key" rule goes after "JSON Key - Level 8" (:1062)**, using `{{jsonLvl0}}` and
  `{{jsonLvl0FontStyle}}`. Its scopes:
  - `entity.name.tag.yaml`, emitted by both the built-in and the redhat grammar.
  - `support.type.property-name.toml`.
  - `keyword.other.definition.ini`.
  - `variable.key.dotenv`, moved out of the variable rule (:69).
- **A new "Data file section" rule** uses `{{markdownSection}}`. Its scopes:
  - `support.type.property-name.table.toml` and `support.type.property-name.array.toml`. Even
    Better TOML's `tomlTableKey` and `tomlArrayKey` semantic tokens fall back to these.
  - `punctuation.definition.table.toml` and `punctuation.definition.array.table.toml`, the
    brackets. INI's brackets sit inside its section scope and take the color already.
  - `entity.name.section.group-title.ini`.
- **Why `markdownSection` and not `heading`:** `markdownSection` is the color Markdown heading text
  actually renders in (`entity.name.section.markdown`, :1108), and each flavor has its own value.
  `{{heading}}` colors only the `#`, and it is one olive in all six palettes, Latte included.
- **`package.json`:** the `jsonLvl0` and `jsonLvl0FontStyle` descriptions also name YAML, TOML, INI
  and `.env` keys.
- `jsonLvl0` equals `functionAndMethod` in every default palette. So TOML keys look the same by
  default, and only tables change.

### 2.2 Keywords (done)

- **The keyword rule gains a bare `keyword`.** Every deeper `keyword.*` rule still wins, including
  operator, CSS unit, regexp and directive.
- **Exemptions, so the bare selector leaves alone what isn't a keyword.** Each prefix below is
  emitted by exactly one installed grammar:
  - The comment rule gains `keyword.codetag`, so Python's `TODO` and `FIXME` stay comment-colored.
  - The operator rule gains `keyword.symbol` (F#'s `:`, `->`, `|`, `=`, `?`) and `keyword.accessor`
    (R's `$`). The tag rule's parent-scoped `function.anonymous keyword.symbol.fsharp` still wins
    inside lambdas.
  - The constant rule gains `keyword.format.specifier` (F#'s `%d`), next to
    `constant.other.placeholder` (:128).
- **Newly keyword-colored, as intended:**
  - The issue's GraphQL keywords (`query`, `fragment`, `enum`, `implements`, `on`), GDScript's
    `extends` and `class_name`, and Julia's `const`.
  - Dart's `as` and `new`, the `*` in TS/JS `function*`, Batch commands, and Java and CoffeeScript
    reserved words.
  - `.env`'s `export` and `${ }`, and Python's illegal names.
- Rust's `struct`, `enum`, `trait` and `type` don't change: their innermost scope is
  `storage.type.rust`.

### 2.3 Markdown and diff (done)

- **A new "Markup - Strikethrough" rule** goes after "Markup - Underline" (:1151):
  `markup.strikethrough`, with only `fontStyle: strikethrough`. That matches "Markup - Quote" and
  Dark VS.
- **The tag rule loses `markup.deleted.diff` (:828)**, so the Deleted rule (:923) colors removed
  lines.
- **A new "Diff header" rule:** `meta.diff.header` → `{{info}}`, foreground only, matching
  Inserted, Deleted and Changed. It covers `---` and `+++`, and also the `diff --git` and command
  lines, so a git diff's header block reads as one. It's blue, as in Catppuccin upstream and
  Dark VS.
- **A new "Diff range" rule:** `meta.diff.range` → `{{annotation}}`, also foreground only. The teal
  matches git's cyan for hunk headers.

### 2.4 C# grammar follows Roslyn (done)

Roslyn's semantic tokens for a .NET sample, resolved the way VS Code's `getTokenStyle` does, were
compared with the C# grammar's colors. Each fix below has a C#-only scope, so no other language
moves.

- **The keyword rule gains `source.cs keyword.type`, `source.cs constant.language.boolean` and
  `source.cs constant.language.null`.** Roslyn sends `int`, `string`, `null` and `true` as plain
  `keyword` tokens, the same as `public`, so the editor can only show them keyword-colored. In C#
  these are reserved keywords. The two constant entries name the depth the constant rule uses, so
  they outrank it.
- **The operator rule loses `keyword.operator.expression.pattern`**, which only C# emits, so `is`,
  `not`, `and` and `or` fall to the keyword color with `keyword.operator.expression`. The keyword
  rule's `keyword.operator.expression.pattern.if` went with it, since no grammar emits it.
- **The macro rule gains `source.cs keyword.preprocessor`, `source.cs punctuation.separator.hash`
  and `source.cs meta.preprocessor`**: Roslyn colors a whole directive such as `#nullable enable`
  as a macro.
- **The punctuation rule gains `punctuation.definition.interpolation.begin.cs` and `.end.cs`**, the
  braces of `$"…{x}…"`. SCSS shares the prefix for `#{ }`, so the names stay exact.
- **`punctuation.separator.question-mark` moves from punctuation to operator, and
  `punctuation.separator.asterisk` joins it.** Only C# emits either, for the `?` of `string?` and
  the `*` of `byte*`, and Roslyn calls both operators.
- **XML doc comments:** the comment rule gains `source.cs comment.block.documentation
  punctuation.definition.tag` and `… punctuation.separator.equals`, and the Attributes rule gains
  `source.cs comment.block.documentation entity.other.attribute-name`, matching Roslyn's
  `xmlDocCommentDelimiter` and `xmlDocCommentAttributeName`.
- **Left as they are:** Roslyn calls the ternary `:` and the range `..` punctuation while it calls
  `?` an operator, and the grammar misreads the `u8` suffix as a member.

## Not in this change

- **C/C++ `size_t`, `pthread_t` and `u_char`** (`support.type.sys-types`,
  `support.type.posix-reserved`) stay keyword-colored while `int` is type-colored. It's the same
  kind of fix, but none of this issue's samples covers C, so it's worth a separate issue.
- **The legacy TOML selectors** (`source.toml keyword` :62, `source.toml constant` :149,
  `source.toml entity.other.attribute-name` :341) serve a TOML grammar nothing here runs, so they're
  left as they are.

## Verification, once over the whole change

- `npm run build-themes && grep -l '{{' themes/` prints nothing.
- Run `npm run format:check`, `npm run lint`, `npm run type-check` and `npm test`.
  `manifest.test.ts` covers the `package.json` edit in 2.1.
- **Static check:** a `jq` over `themes/calmppuccin-mocha-color-theme.json` and `-latte-` prints,
  for each scope the change touched, every rule that lists it. Each scope must appear in exactly
  one rule, with that rule's resolved hex.
- **Hand test, on Mocha and Latte.** Run the issue's list, plus:
  - A PHP class with a trait `use { … }` block.
  - C++ declarations.
  - A Go file using `bool` and `error`.
  - An F# file with `->` and `%d`.
  - A Python `# TODO` comment.
  - The C# sample: `int` and `null` keyword-colored in a hover as in the editor, `#region` in the
    macro color, and the braces of `$"…"` in the punctuation color.
  - Real `git diff` output saved as `.diff`.
