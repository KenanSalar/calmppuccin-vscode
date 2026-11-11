# Contributing

Thanks for taking a look. Bug reports, palette tweaks, new preview languages and fixes are all
welcome, and a small PR needs no ceremony.

## Getting set up

You need Node 24 and VS Code 1.125 or newer. Fork the repository, then:

```bash
git clone https://github.com/<your-username>/calmppuccin-vscode.git
cd calmppuccin-vscode
npm ci
npm run build-themes
```

Press Ctrl+F5 (**Run → Run Without Debugging**). A second VS Code window opens, the Extension
Development Host, running your build; pick a Calmppuccin flavor from its color theme picker. The
launch builds nothing by itself, so after a change rebuild what you touched:

- a palette, `src/template.json` or `build.ts`: `npm run build-themes`
- the extension or the customization UI: `npm run compile`, or leave `npm run watch` running

and run **Developer: Reload Window** in the Development Host.

Start with F5 only when you need breakpoints, and restart the debug session instead of
reloading the Development Host. Under the debugger, a reload can crash its extension host before
any extension loads, and the customization UI asks for a reload after every theme change. The
crash is an upstream bug in Node's network inspection
([microsoft/vscode#336233](https://github.com/microsoft/vscode/issues/336233),
[nodejs/node#64308](https://github.com/nodejs/node/issues/64308)).

Run this once per clone, so the tree-wide formatting commit stays out of `git blame`:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

### The dev container

`.devcontainer/` packages the same toolchain: with the Dev Containers extension installed, run
**Reopen in Container**. It's optional, and CI doesn't use it. VS Code copies your host's
`.gitconfig` into the container and forwards your GPG agent, so set up your Git identity and
commit signing on the host, not inside.

To add a preview language, work on the host instead. The Development Host highlights a language
only with that language's extension installed, and the container starts with few.

## Reporting a bug

Open an issue with your VS Code (or Cursor) version, the flavor and accent, and what you
expected to see. For a color problem, a screenshot is worth more than a description. If
customizing failed, the error is in **Help → Toggle Developer Tools → Console**.

## Before you build something big

For a fix or a small improvement, just open a PR. For a new flavor, a palette rework or a change
to the customization UI, open an issue first so we can agree on the shape. Calmppuccin is a
gentler, lower-contrast Catppuccin, and a color change is judged against that.

## Pull requests

- **Target `main`**, the only long-lived branch. Merging ships nothing on its own: a release is
  a pushed version tag.
- **One PR, one logical change**, with commit messages in the
  [Conventional Commits](https://www.conventionalcommits.org/) style the history uses.
- **Link the issue from the PR's Development sidebar** rather than writing `Fixes #N`. The link is
  set once on the branch and survives every reword of the description.
- **Show it.** A change to colors or the customization UI comes with before and after
  screenshots from the Development Host, in a dark flavor and in Latte where it applies.

Before pushing:

```bash
npm run format
npm run lint
npm run type-check
npm test
```

Neither Jest nor webpack checks types, so `type-check` is the step that does. The lint
configuration is strict on purpose: no `any`, no non-null assertions, and a warning fails the run.

A few changes reach further than they look:

- **A new color key** goes into all six palettes under `src/palettes/`. Nothing checks that they
  match, and a flavor missing the key shows a raw `{{key}}` in its theme.
- **A new font-style key** needs both a default and a property under `calmppuccin.fontStyles` in
  `package.json`; the tests fail on one without the other.
- **A new file under `src/`** ships in the extension unless `.vscodeignore` lists it.
- **`themes/` and `dist/` are generated**, so an edit there is overwritten by the next build.

## What CI runs

Every pull request runs **PR Validation**: type-check, lint, the oxfmt check, the tests, and a
packaging build that attaches the `.vsix` to the run, so you can install exactly what would ship.
The aggregate `pr-validation` check has to be green before a merge. A change touching only the
dev container, editor settings, this file or the README screenshots skips all of it.

## On AI

Write it by hand or with an assistant, whichever you work best with. Review treats both the same,
which also means the bar is the same: you are responsible for what you submit, so understand it
well enough to explain it and fix it, and look at it in the Development Host rather than trusting
generated tests. `CLAUDE.md` and `.claude/rules/` hold the project's conventions for Claude Code
and are a quick read either way.
