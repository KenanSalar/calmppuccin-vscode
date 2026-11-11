---
paths:
  - test/**
  - jest.config.ts
---

# Testing Best Practices

Siblings own the slices this file does not: `code-style.md` binds a test's comments like any
other, `webview.md` has the Jest guard at the foot of `webview/main.ts`, and `ci-packaging.md`
the gate. Which change earns a test at all is the `/add-tests` skill's call.

## Principles

The seven ISTQB principles, as they bear on writing a test:

- **Testing shows the presence of defects, not their absence.** A green suite is evidence,
  never proof. Report "no failures found", not "it works".
- **Exhaustive testing is impossible.** The input space always exceeds the budget, so
  choose by risk rather than by what is easy to reach.
- **Test early.** A defect costs more the later it is found. Write the test with the code.
- **Defects cluster.** A minority of modules holds the majority of defects. Put new effort
  where failures have already happened.
- **Tests wear out.** Run unchanged, a test finds less and less that is new. Revise and
  extend the suite as the code moves; repetition still earns its keep as regression protection.
- **Testing is context dependent.** Rigour follows risk: a path that destroys user data and
  one that misaligns a label do not earn the same coverage.
- **Absence of defects is a fallacy.** Code that passes every test can still be the wrong
  thing to have built.

## What a good test looks like

- **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely.
- **One reason to fail.** A test that can fail for three reasons reports none of them
  clearly. Split it; a second act-and-assert round inside one `it` is a second test.
- **Arrange, act, assert**, in that order and separated by blank lines. Keep the act to one
  call. The layout already shows the phases, so `// 1. Arrange` labels only narrate it.
- **Test the contract, not the implementation.** Assert on observable behaviour and public
  API: the theme JSON written, the message posted, the setting updated. A test that breaks on
  every refactor is testing the wrong surface.
- **No logic in tests.** No conditionals, loops or arithmetic around the assertion; a bug in
  the test is invisible. Table-drive with `it.each` instead, the expected value written out:
  each row fails under its own name, and Jest refuses an empty table where a loop passes.
- **Independent and order-free.** No shared mutable state, no reliance on another test
  having run or on the harness order: run alone with `-t`, a test gives the file's verdict.
- **Deterministic.** A test that fails once in fifty is worse than no test: it trains the
  team to re-run rather than to read.

## Designing the cases

- **Equivalence partitioning.** Split the input into classes handled the same way and take
  one value from each. Cover invalid partitions too, not just valid ones.
- **Boundary value analysis.** Defects concentrate at edges. For each boundary test the
  value on it and the step either side. Work the real constants, not round numbers.
- **Decision tables** where several conditions combine into one outcome. The interesting
  rows are the corners, where flags that are not each other's guard disagree.
- **State transition testing.** For a state machine the invalid transitions are the half
  worth writing: assert what it refuses as much as what it does.
- **Pairwise** when the full matrix explodes. Most combinatorial defects need only two
  factors to interact.
- **Error guessing** supplements the techniques above, never substitutes for them.
- **Negative and error paths deserve cases.** Empty, zero, one, maximum, absent, malformed,
  duplicated, out of order.
- **A test that pins only the value from the bug report pins the bug report.** Generalise to
  the partition the bug was one sample of.

## Test levels

- **Unit** for logic in isolation, **integration** for the seams between components,
  **system** for the assembled thing, **acceptance** for whether it is the right thing.
- **Pyramid, not ice cream cone.** Many fast unit tests, fewer integration, fewest
  end-to-end. Higher levels are slower, flakier and worse at localising a defect.
- **Push each question to the lowest level that can answer it.** Do not use an end-to-end
  test to check a boundary a unit test could pin.
- **A level that cannot answer a question honestly should not fake it.** Some behaviour is
  only observable against the real collaborator; write that test at the level it belongs.
- **`test/integration/` still runs against the `vscode` mock**: it pins how modules wire
  together, not what VS Code does with the result. Rendering, activation, the webview CSP and
  the icon-theme switch answer only in the Extension Development Host.

## Jest: organizing tests

- **A file per module under test, a `describe` per unit, an `it` per case.** The tree never
  uses `test`, and a name written to follow `it` reads as the property (see Naming).
- **Shared data lives in `test/__fixtures__/`, typed against the production interface**
  (`mockPalette: IPalette`), so a new required key breaks it at type-check, not at runtime.
- **`test/__mocks__/vscode.ts` holds only what the code calls**, in the shape `@types/vscode`
  gives it. A file needing another shape passes a factory to `jest.mock("vscode", …)`; the
  mapper resolves the name, so it takes no `{ virtual: true }`.

## Walks over a collection

A test that walks the palettes, the template's placeholders, the manifest's settings or the
source tree holds what the compiler can't, and it rots in silence: a walk that matches nothing
passes, taking every pin standing on it along. Each owes five things, none of which a passing
run can show:

- **A vacuity floor**, the fewest entries the walk must find. `it.each` refuses an empty table;
  a `for` loop inside one `it` passes on nothing, as the loops in `manifest.test.ts` would.
- **An equality, not a floor, wherever a vanishing member is the failure.** The six flavors,
  `THEME_AFFECTING_KEYS`, a palette's keys: `toStrictEqual` on the sorted list sees one go.
- **Unreadable input fails the test, never skips the entry.** A file that won't read or parse is
  indistinguishable from one holding nothing.
- **Comments stripped and line endings normalized before matching source text.** A commented-out
  call can answer for a real one, and `.gitattributes` is `text=auto`, so a Windows checkout
  hands the test CRLF.
- **An exemption held to an exact count**, each entry asserted to still match. A second hit in
  an exempt file is itself the regression, and an entry matching nothing is a hole that reads as
  coverage.

## Jest: async tests and expected failures

- **Await every promise a test starts, assertions included.** An `expect(p).resolves` or
  `.rejects` left unawaited never fails its own test: settling after it, the failure prints
  outside the results while the test counts as passed, and settling during the run, the
  unhandled rejection takes the whole run down.
- **`toThrow` and `rejects.toThrow` always name what's expected**: the class, or a stable part of
  the message. Bare, they pass when the code throws for a reason you didn't mean.
- **An assertion inside a callback needs `expect.assertions(n)`**, or a callback that never runs
  passes the test.
- **Fake timers and real I/O don't mix.** `advanceTimersByTimeAsync` flushes promises, not a
  read in flight, so a timer that starts after real `fs` work never fires. Under fake timers,
  mock the I/O (`fs/promises`, `../../build`).

## Jest: assertions

- **Canonical matcher names only.** Jest 30 and `@types/jest` 30 removed the aliases
  (`toBeCalled`, `lastCalledWith`, `toThrowError` …), so one fails type-check and runtime.
- **`toStrictEqual` for payloads, messages and overrides.** `toEqual` ignores keys holding
  `undefined`, which is how a stray field or an override that should be gone slips through.
- **Name the call: `toHaveBeenCalledWith`, `toHaveBeenNthCalledWith`, `toHaveBeenCalledTimes`.**
  A bare `toHaveBeenCalled()` passes for a call with the wrong flavor, key or value.
- **Dotted keys go to `toHaveProperty` as an array.** `"editor.background"` is a path to
  `editor` › `background`; `["editor.background"]` is the key a theme actually has.
- **`expect` takes no message, so pick a matcher that prints the subject.**
  `expect(key in colors).toBe(true)` fails without naming `key`; `toHaveProperty` names it.
- **One partial matcher per intent.** `toMatchObject` for "has at least these", and
  `expect.objectContaining` inside a call assertion; mixing forms for one intent is drift.
- **Numbers compare with `toBeCloseTo` and a stated precision; a string compares exactly.**
  `hexWithAlpha` rounds into hex, so its contract is the string at each boundary (opacity `0.5`
  gives `80`), never a float.
- **Assert on parsed fields, not on serialized or logged text.** A theme is compared through
  `JSON.parse`, and `console` output is no contract. User-facing text is the exception: the
  message is what's under test.
- **A fixture narrows by construction, not by `!` or a cast**: a helper that throws when the
  thing is missing keeps `?.` chains out of every assertion after it.
- **Assert DOM state through queries, not markup.** jsdom has no layout and the tests never
  load `webview/style.css`: check `textContent`, `value`, attributes, `classList` and inline
  `style`, not computed visibility or an `innerHTML` substring.

## Jest: doubles and seams

- **Prefer the real collaborator** wherever it is fast and deterministic. A double is a cost
  paid to buy determinism or speed, not a default. The real palettes are both; real
  `fs/promises` would write the repo, and `vscode` exists only in the extension host.
- **Prefer fakes to stubs, and stubs to mocks.** A fake has a working implementation with a
  shortcut (an in-memory settings store behind `getConfiguration`); a mock asserts
  interactions and so couples the test to how the code is written rather than to what it does.
- **Inject the seam as a parameter.** The webview controllers take their DOM and `vscode` API as
  typed dependencies (`IControlFactoryDeps`), so a test hands in fakes without a module mock.
  New code takes that shape, and the production call site spells the default.
- **`jest.mocked(fn)` over `as jest.Mock`.** It keeps the function's signature, so a
  `mockReturnValue` of the wrong shape fails type-check; the cast is `any` by another name.
- **`jest.mock` is hoisted above the imports.** Its factory runs at the first `require`,
  before the file's own `const`s exist, so it may read them only inside functions called later.
- **Process-global state is the enemy of a test suite.** `SettingsPanel._instance`,
  `WebviewManager.currentPanel` and `extension.ts`'s listeners outlive the test that set them.
  A test that activates calls `deactivate()` in `afterEach`, which forgets the listeners; reset
  a static in `beforeEach`; and reach for `jest.isolateModulesAsync` only for state with no
  such door, taking `vscode` from that registry too, which builds a new mock.
- **Reach the code through its public API, not a cast to a private member.** If a value
  cannot be observed, either the design hides too much or the assertion belongs elsewhere.
  Do not add production API whose only caller is a test.

## Jest: isolation and determinism

- **Each file gets its own module registry and jsdom `window`; its tests share both.** A
  `window` listener, the `document` body, a module-level `let` or a static carries into the
  next `it` unless the test undoes it: `UIManager` listens on `window` until `dispose()`.
- **Before each test, `clearMocks` clears calls and `restoreMocks` undoes `spyOn` and
  `replaceProperty` (`jest.config.ts`).** Neither touches an implementation set on a
  `jest.fn()`, such as the `vscode` mock's members, so set those in `beforeEach` for every test
  that leans on them. `resetMocks` would strip the mock's defaults, and a `jest.clearAllMocks()`
  in `beforeEach` repeats the config.
- **A captured callback starts as one that throws, or `undefined` asserted registered**, never
  a no-op. A test that never reached the registration otherwise calls the no-op and passes.
- **Files run in parallel workers, the tests in one file in order.** No shared path, no fixed
  port, no reliance on which file ran first.
- **`process.env` is shared by every test in the file.** Change a variable with
  `jest.replaceProperty(process.env, …)`, which `restoreMocks` undoes, never by assignment.
- **Order is a subject or it isn't compared.** Sort first or compare as sets: `Object.keys`
  follows insertion, except integer-like keys, which come first in ascending order.
- **Paths are joined, never spelled.** CI runs on Linux but contributors don't, and a
  hand-written `/` in an expected path fails on Windows looking like anything but a path bug.
- **No wall clock, timezone or locale.** Fake timers fake `Date` too (`jest.setSystemTime`);
  pass the instant in rather than reading "now" in the code under test.
- **Fake timers for anything debounced or delayed, never a sleep.** `useFakeTimers()` in
  `beforeEach`, `useRealTimers()` in `afterEach`, advanced by the named constant
  (`C.REGENERATE_DEBOUNCE_MS`), `advanceTimersByTimeAsync` where the callback awaits. A real
  `setTimeout(resolve, 150)` costs every run and fails once the delay is tuned past it.
- **A test never writes to disk.** `buildAllFlavors` writes beside its bundle, which under Jest
  resolves to the repo's parent directory: its own tests mock `fs/promises`, and any test that
  activates the extension under a Calmppuccin theme mocks `../../build`, since activation
  rebuilds.

## Coverage, and what it is worth

- **Coverage measures what executed, not what was verified.** A line covered by a test with
  no assertion on it is not tested.
- **Do not set a coverage number as a target.** It becomes the goal and the suite fills with
  assertions nobody reads.
- **Read it as a map of where nothing runs at all** (`npm run test:coverage`), then decide by
  risk whether that matters. Orchestration and decision code usually deserves it more than
  the well-covered primitives underneath.
- **The check that a pin works is breaking the code deliberately** and watching that test,
  and only that test, fail, both alone and in the full file. A pin that cannot fail is worse
  than no pin, because it reads as coverage.
- **Prefer an equality to a lower bound** wherever the thing under test can shrink; a floor
  keeps passing while its subject disappears. `toStrictEqual` on the sorted key list sees one
  key go; `arrayContaining` and `length > 0` do not.

## Anti-patterns

- **Flaky tests.** Fix or delete; never paper over with a blind retry (`jest.retryTimes`). A
  quarantine needs an owner and a date.
- **Assertion roulette.** A long run of assertions where the failure does not say which fired.
- **Interdependent tests** that pass only in order, or that share a fixture they mutate.
- **Testing private implementation detail**, which turns every refactor into a test rewrite.
  The casts to `SettingsPanel._handleMessage` are that debt.
- **Over-mocking**, until the test asserts the code calls the functions it calls.
- **Skipped or focused tests committed.** `it.skip` is a deleted test that still reads as
  coverage; `it.only` silently skips the rest of its file, and nothing here flags it.
- **Snapshot bloat**: an accepted diff nobody read is not an assertion.
- **A stray `console.log`** left in a passing test.
- **Tests treated as second-class code.** Name, refactor and delete them like production
  code; a suite nobody maintains is one nobody trusts.

## Naming and documenting

- **Name a test as the property it holds**, a present-tense sentence that reads on from
  `it`: `it("regenerates once for a burst of changes")`. The name should say what broke
  without opening the file. A file still written as `it("should …")` keeps that form until
  it's rewritten whole, so one file never mixes the two.
- **A `/** */` on a non-obvious test gives the why**, usually the defect that motivated it.
  It is bound by `code-style.md` like any other comment: argue the reason, do not narrate
  the body.
- **No `@description`, `@precondition` or `@assertion` blocks.** They restate the name and
  the body as a second copy that drifts.
- **A test file's `@file` names what is under test and through which seam** (the real
  palettes, the `vscode` mock, a jsdom DOM), not "This file contains tests for…".
- **Name a prohibition test as the prohibition**, so a failure reads as the rule it enforces.

## The toolbox

Know what exists before hand-rolling, and adopt deliberately: the real extension host
(`@vscode/test-cli`, Mocha only), `jest-mock-vscode`, `@testing-library/dom`, `fast-check`,
StrykerJS, `@jest/globals` imports (whose spies `using` can restore, unlike `@types/jest`'s)
and oxlint's `jest` plugin (`no-focused-tests`, `expect-expect`, `valid-expect`).

- **Adopting one is a decision for the whole tree**, not for one file. A framework used in a
  single suite is drift, and the next reader cannot tell which convention is current.
- **Weigh it against what it replaces.** A dependency that saves fewer lines than its own
  matching DSL costs to learn is not a saving.
- **This tree deliberately runs none of them**, so proposing one is an argument to make on
  its merits rather than a default to reach for.
