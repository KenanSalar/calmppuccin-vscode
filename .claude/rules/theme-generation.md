---
paths:
  - build.ts
  - src/template.json
  - src/palettes.ts
  - src/palettes/**
  - src/extensions/**
  - src/utils/**
---

# Theme generation

`buildFlavor` in `build.ts` and its helpers are one flavor's build and argue its non-obvious steps;
this file holds what reaches across the template, the palettes and the manifest.

- **A placeholder is `{{key}}` inside a JSON string in `src/template.json`.** It resolves from the
  palette with the flavor's `syntaxOverrides` and `uiOverrides` on top, from `accent`, and from
  the font styles with the flavor's `fontStyleOverrides` on top.
- **A value is JSON-escaped as it goes in**, so a placeholder only ever sits inside a string,
  never where a number, boolean or object belongs.
- **An accent recipe is a palette value, `"{{accent}}XX"`**, resolved to the accent's hex with
  `XX` as alpha, so each flavor picks its own alpha. The template only ever names `{{accent}}`.
- **The accent arrives as a palette key or a `#rrggbb`.** An unknown key falls back to
  `FALLBACK_ACCENT`; a custom hex is validated in `SettingsReader.getAccent` before it gets here.
- **Font style `"none"` becomes `""`** in the theme.
- **A new color key goes into all six palettes** (see Known gaps in `CLAUDE.md`), and into
  `test/__fixtures__/mockPalette.ts` when a generator reads it. To make it customizable it also
  joins a `CUSTOMIZABLE_*_KEYS` list in `src/constants.ts` and needs a `data-token` span in a
  preview snippet (`webview.md`).
- **A new font-style key** is a `{{…FontStyle}}` placeholder plus both a `default` and a
  `properties` entry under `calmppuccin.fontStyles` in `package.json`; `manifest.test.ts` fails
  on either alone.
- **A new flavor** is a palette file, its `IPalettes` entry (`src/palettes.ts`), a
  `contributes.themes` entry in `package.json`, and an `ICON_FLAVORS` entry in `extension.ts`. The
  theme label must reduce to the flavor key through `parseFlavorFromThemeName`
  (`src/constants.ts`), and every flavor but `LIGHT_FLAVOR_NAME` is dark.
- **The third-party generators see the base palette**, not the user's overrides, and what they
  return is merged over the template's `colors`.
