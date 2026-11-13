---
paths:
  - .github/**
  - .vscodeignore
  - webpack.config.js
---

# CI and packaging

Each workflow argues its own steps; this file holds what reaches across them.

- **The VSIX ships whatever `.vscodeignore` leaves in.** It drops TypeScript by extension, not by
  folder, because `src/template/` has to ship, `buildAllFlavors` reading it at runtime, as do
  `webview/index.html` and `webview/style.css`, which `WebviewManager` reads. Any other new file
  ships unless `.vscodeignore` lists it; `npx vsce ls` prints what would ship.
- **Every action is SHA-pinned with a trailing `# vX.Y.Z`.** Re-pin with
  `gh api repos/OWNER/REPO/commits/TAG -q .sha`.
- **Every job installs through `.github/actions/setup-node`** (Node 24 and `npm ci`).
- **The PR path filter is a denylist**, as `pr-validation.yml` argues: a path joins it only once
  nothing builds, packages or runs it before a merge.
- **A new PR job joins `pr-validation`'s `needs:`**, the one required check.
- **`release.yml` refuses a tag that doesn't match `package.json` or isn't on `main`.** Each
  publish step skips what already went out, so a half-failed release is re-run from the tag
  (Actions → Release → Run workflow, choosing the tag), and it needs the `VSCE_PAT` and
  `OVSX_PAT` secrets.
