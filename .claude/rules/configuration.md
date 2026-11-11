---
paths:
  - src/ConfigurationService.ts
  - src/config/**
---

# Configuration and profiles

- **Every customization lives in a profile.** Writes go through `updateProfileSetting`
  (`src/config/ConfigAccess.ts`) into the active profile inside `calmppuccin.profiles`, at the
  Global target. Reads take the profile's value and fall back to the top-level legacy key.
- **`Default` always exists and can't be deleted**: `getProfiles` adds it when it's missing, and
  `deleteProfile` returns early on it.
- **Legacy top-level settings migrate into `Default` on activation**
  (`migrateGlobalSettingsToDefault`, `src/config/ProfileManager.ts`).
- **An override object never stays empty**: removing its last key goes through
  `removeOverrideKey`, which hands back `undefined` so the whole setting is cleared.
- **`ConfigurationService` is a facade.** A `src/config/` function that a caller outside
  `src/config/` needs is re-exported there as a static, until callers import the modules
  directly.
- **A new setting that changes theme output joins `THEME_AFFECTING_KEYS`** (`src/constants.ts`),
  or changing it won't regenerate the themes, **and takes `"scope": "application"`**: one set of
  theme files serves every window, so no workspace may differ, and `get` would otherwise merge a
  workspace's object into what the writers save to user settings. `manifest.test.ts` holds every
  key in the list to it.
- **Settings are user-edited JSON**: read them as `unknown` and narrow, as `toProfiles` and
  `getProfileObjectSetting` do.
- **`getWebViewSettings` (`src/config/WebviewSettingsMapper.ts`) assembles `ISettingsPayload`**,
  and `WebviewSettingsMapper.test.ts` pins its shape.
