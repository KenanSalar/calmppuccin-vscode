/**
 * @file This file contains unit tests for the extension's manifest (package.json).
 * It ensures that the configuration settings defined are consistent and valid,
 * preventing common errors like typos or mismatched default values.
 */

// Import the package.json file directly as a JSON module.
// The `resolveJsonModule` option in tsconfig.json makes this possible.
import * as manifest from "../../package.json";

/**
 * @description Test suite for validating the structure and content of package.json.
 */
describe("Extension Manifest (package.json) Validation", () => {
  // Extract the configuration properties from the manifest for easier access.
  const properties = manifest.contributes.configuration.properties;

  /**
   * @description Tests the `calmppuccin.fontStyles` configuration to ensure its integrity.
   */
  describe("Font Styles Configuration", () => {
    const fontStylesConfig = properties["calmppuccin.fontStyles"];
    const defaultFontStyles = fontStylesConfig.default;
    const fontStyleProperties = fontStylesConfig.properties;

    /**
     * @description Verifies that every default font style key (e.g., 'commentFontStyle')
     * has a corresponding definition in the 'properties' section. This catches typos
     * and ensures that every default setting is a documented and valid setting.
     * @assertion Each key in `default` should exist as a key in `properties`.
     */
    it("should have a defined property for every default font style", () => {
      for (const key in defaultFontStyles) {
        // The `expect.any(Object)` ensures the property exists and is an object,
        // without needing to check its specific contents (like description, type, etc.).
        expect(fontStyleProperties).toHaveProperty(key, expect.any(Object));
      }
    });

    /**
     * @description Verifies the reverse of the previous test: every defined font style
     * property must have a corresponding default value. This prevents adding a new
     * customizable style without also giving it a sensible default.
     * @assertion Each key in `properties` should exist as a key in `default`.
     */
    it("should have a default value for every defined font style property", () => {
      for (const key in fontStyleProperties) {
        expect(defaultFontStyles).toHaveProperty(key, expect.any(String));
      }
    });
  });

  /**
   * @description Tests the `calmppuccin.accent` configuration.
   */
  describe("Accent Color Configuration", () => {
    const accentConfig = properties["calmppuccin.accent"];

    /**
     * @description Ensures that the default accent color ('sapphire') is a valid
     * choice by checking if it's included in the list of available accent enums.
     * This prevents the default from becoming invalid if the enum list is changed.
     * @assertion The `default` value must be one of the values in the `enum` array.
     */
    it("should have a default accent color that is a valid enum option", () => {
      expect(accentConfig.enum).toContain(accentConfig.default);
    });
  });

  /**
   * @description Verifies that all activation events are correctly formatted.
   */
  describe("Activation Events", () => {
    const activationEvents = manifest.activationEvents;

    /**
     * @description Checks that every color theme listed in the 'themes' contribution
     * point has a corresponding `onColorTheme` activation event. This is crucial for
     * the lazy-loading strategy to work correctly for all theme flavors.
     * @assertion For each theme, an `onColorTheme` event must exist.
     */
    it("should have a corresponding onColorTheme activation event for every registered theme", () => {
      const themeEvents = activationEvents.filter((event) => event.startsWith("onColorTheme:"));

      manifest.contributes.themes.forEach((theme) => {
        const expectedEvent = `onColorTheme:${theme.label}`;
        expect(themeEvents).toContain(expectedEvent);
      });
    });
  });
});
