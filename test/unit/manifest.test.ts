/** @file What `package.json` has to agree with the code on. */

import * as manifest from "../../package.json";
import { EXTENSION_NAMESPACE, THEME_AFFECTING_KEYS } from "../../src/constants";

describe("Extension Manifest (package.json) Validation", () => {
  const properties = manifest.contributes.configuration.properties;

  describe("Font Styles Configuration", () => {
    const fontStylesConfig = properties["calmppuccin.fontStyles"];
    const defaultFontStyles = fontStylesConfig.default;
    const fontStyleProperties = fontStylesConfig.properties;

    /** A default with no property is a typo, or a style the Settings editor doesn't describe. */
    it("should have a defined property for every default font style", () => {
      for (const key in defaultFontStyles) {
        expect(fontStyleProperties).toHaveProperty(key, expect.any(Object));
      }
    });

    /** A style with no default ships as a literal `{{…FontStyle}}` placeholder. */
    it("should have a default value for every defined font style property", () => {
      for (const key in fontStyleProperties) {
        expect(defaultFontStyles).toHaveProperty(key, expect.any(String));
      }
    });
  });

  describe("Accent Color Configuration", () => {
    const accentConfig = properties["calmppuccin.accent"];

    it("should have a default accent color that is a valid enum option", () => {
      expect(accentConfig.enum).toContain(accentConfig.default);
    });
  });

  describe("Activation Events", () => {
    /** VS Code fires no event when a color theme is selected, so the theme listener starts here. */
    it("should activate once startup finishes and on nothing else", () => {
      expect(manifest.activationEvents).toStrictEqual(["onStartupFinished"]);
    });
  });

  describe("Remote Windows and Restricted Mode", () => {
    /**
     * Run locally, one copy of the themes serves local and remote windows alike. A web workbench
     * appends `web` after these, so Codespaces in the browser reaches `workspace` and runs `main`.
     */
    it("should prefer running on the local machine", () => {
      expect(manifest.extensionKind).toStrictEqual(["ui", "workspace"]);
    });

    /** An undeclared extension is disabled in an untrusted folder, and its themes with it. */
    it("should stay enabled in untrusted workspaces", () => {
      expect(manifest.capabilities.untrustedWorkspaces).toStrictEqual({ supported: true });
    });
  });

  describe("Setting Scopes", () => {
    const settingsByName = new Map(Object.entries(properties));

    /** One set of theme files serves every window, so a workspace can't be allowed to differ. */
    it.each(THEME_AFFECTING_KEYS)("should limit calmppuccin.%s to user settings", (key) => {
      expect(settingsByName.get(`${EXTENSION_NAMESPACE}.${key}`)).toHaveProperty(
        "scope",
        "application",
      );
    });
  });
});
