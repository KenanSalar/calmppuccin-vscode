/**
 * @file Unit tests for the Error Lens extension color generator.
 * Tests that the generateErrorLensColors function produces correct color mappings
 * for all diagnostic categories (error, warning, info, hint).
 */

import { generateErrorLensColors, IErrorLensColors } from "../../src/extensions/errorLens";
import { IPalette } from "../../src/palettes";
import { EXTENSION_OPACITY_BACKGROUND } from "../../src/constants";
import { hexWithAlpha } from "../../src/utils/color";

// Mock palette with known values for predictable testing
const mockPalette: IPalette = {
  themeName: "Test Theme",
  themeType: "dark",
  // Accent colors
  rosewater: "#f5e0dc",
  flamingo: "#f2cdcd",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
  // UI colors (subset needed for tests)
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b",
  uiText: "#cdd6f4",
  uiInactiveForeground0: "#6c7086",
  // Add remaining required palette keys with placeholder values
  uiTransparent: "#00000000",
  uiInfo: "#89b4fa",
  uiRedErrorDeleted: "#f38ba8",
  uiSuccessAndAdded: "#a6e3a1",
  uiBorder0: "#00000000",
  uiBorder1: "#45475a",
  uiBorder2: "#00000000",
  uiBorder3: "#45475a",
  uiActiveBorder0: "#45475a",
  uiDropBorder0: "#89b4fa",
  uiBackground0: "#45475a",
  uiBackground1: "#a6e3a133",
  uiBackground2: "#f38ba833",
  uiBackground3: "#a6e3a126",
  uiBackground4: "#f38ba826",
  uiBackground5: "#89dceb40",
  uiBackground6: "#89b4fa48",
  uiTransparentForeground0: "#cdd6f4cc",
  uiButtonBackground0: "#89b4fac7",
  uiButtonBorder0: "#00000000",
  uiButtonSecondaryHoverBackground: "#89b4fa33",
  chartsLines: "#bac2de",
  chartsRed: "#f38ba8",
  chartsBlue: "#89b4fa",
  chartsYellow: "#f9e2af",
  chartsOrange: "#fab387",
  chartsGreen: "#a6e3a1",
  chartsPurple: "#cba6f7",
  uiForeground0: "#585b70",
  uiDebugBreackpoint0: "#f38ba899",
  uiDebugBreackpoint1: "#a6738c",
  uiDebugPauseAndInfo: "#89b4fa",
  uiDebugRestart: "#94e2d5",
  uiDebugWarning: "#fab387",
  uiDebugSource: "#f5e0dc",
  uiDiffeditorFill: "#58570099",
  uiDiffeditorOverviewInserted: "#a6e3a1cc",
  uiDiffeditorOverviewRemoved: "#f38ba8cc",
  uiDisabledForeground: "#cdd6f44d",
  uiBracket1: "#89dceb",
  uiBracket2: "#89b4fa",
  uiBracket3: "#a6e3a1",
  uiBracket4: "#f9e2af",
  uiBracket5: "#fab387",
  uiBracket6: "#f38ba8",
  uiBracketPairguide1: "#89dcebb0",
  uiBracketPairguide2: "#89b4fab0",
  uiBracketPairguide3: "#a6e3a1b0",
  uiBracketPairguide4: "#f9e2afb0",
  uiBracketPairguide5: "#fab387b0",
  uiBracketPairguide6: "#f38ba8b0",
  uiBracketUnexpected: "#f38ba8",
  uiFindMatchBackground: "#f9e2af40",
  uiFindMatchBorder: "#f9e2af40",
  uiFindHighlightBackground: "#89b4fa49",
  uiFindHighlightBorder: "#89b4faa9",
  uiLineHighlightBackground: "#cdd6f412",
  uiRangeHighlightBackground: "#89b4fa2d",
  uiSelectionBackground: "#585b703d",
  uiSelectionHighlight: "#585b7033",
  uiInactiveSelectionAndBracketMatchBackround: "#585b7028",
  uiWordHighlight: "#585b7033",
  uiBracketMatchBorder: "#585b70",
  uiCodeLensForeground: "#7f849c",
  uiCursorForeground: "#f5e0dc",
  uiErrorForeground: "#f38ba8",
  uiModified: "#f9e2af",
  uiCommentRangeForeground: "#313244",
  uiFoldingControlForeground: "#6c7086",
  uiHoverWidgetBorder: "#45475ab6",
  uiInlayHintBackground: "#38385726",
  uiInlayHintForeground: "#a6adc8",
  uiLineNumberForeground: "#6c7086",
  uiWarning: "#fab387",
  uiStackFrameHighlight: "#f9e2af26",
  uiLinkedEditing: "#89b4fa33",
  uiWhitespace: "#6c708666",
  uiUnnecessaryCodeOpacity: "#000000aa",
  uiSponsorAndColor: "#f5c2e7",
  uiFocusBorder: "#89b4fa00",
  uiPlaceholderForeground: "#cdd6f473",
  uiListHoverBackground: "#31324480",
  uiListInactiveSelectionBackground: "#6c708623",
  uiKeybindingLabelForeground: "#909295",
  uiMergeCommonContentBackground: "#45475a30",
  uiMergeCommonHeaderBackground: "#58570080",
  uiMergeCurrentHeaderBackground: "#a6e3a166",
  uiMergeIncomingContentBackground: "#89b4fa33",
  uiMergeIncomingHeaderBackground: "#89b4fa66",
  uiMatchHighlight: "#89dceb4d",
  uiMinimapSelectionHighlight: "#585b70bf",
  uiMinimapWarning: "#fab387bf",
  uiMinimapErrorAndDelete: "#f38ba8bf",
  uiMinimapSliderBackground: "#89b4fa1c",
  uiMinimapSliderHoverBackground: "#89b4fa2f",
  uiMinimapGutterAdded: "#a6e3a1bf",
  uiMinimapGutterModified: "#f9e2afbf",
  uiPanelBorder: "#89b4fa93",
  uiPanelDropAndSectionBorder: "#585b70a2",
  uiPanelTitleInactiveForeground: "#a6adc8",
  uiPanelSectionHeaderBackground: "#5d5f6220",
  uiProfileBadgeBackground: "#585b70",
  uiQuickInputListFocusBackground: "#45475a73",
  uiScrollbarSliderBackground: "#89b4fa31",
  uiScrollbarSliderActiveBackground: "#89b4fa5b",
  uiSettingsFocusedRowBackground: "#585b7046",
  uiSettingsHeaderAndSashBorder: "#585b70c5",
  uiSettingsRowHoverBackground: "#585b7033",
  uiSidebarSectionHeaderBorder: "#585b7048",
  uiStatusbarFocusBorder: "#89b4fa15",
  uiSymboliconPackageAndSnippetForeground: "#f2cdcd",
  uiTabInactiveForeground: "#cdd6f491",
  uiTabInactiveModifiedBorder: "#f9e2af4d",
  uiTabUnfocusedActiveBorderTop: "#89b4fa4d",
  uiTabUnfocusedActiveForeground: "#cdd6f4c0",
  uiTabDragAndDropBorder: "#89b4faaf",
  uiTabUnfocusedInactiveForeground: "#cdd6f470",
  uiTerminalAnsiBlack: "#45475a",
  uiTerminalAnsiRed: "#f38ba8",
  uiTerminalAnsiGreen: "#a6e3a1",
  uiTerminalAnsiYellow: "#f9e2af",
  uiTerminalAnsiBlue: "#89b4fa",
  uiTerminalAnsiMagenta: "#f5c2e7",
  uiTerminalAnsiCyan: "#94e2d5",
  uiTerminalAnsiWhite: "#bac2de",
  uiTerminalAnsiBrightBlack: "#585b78",
  uiTerminalAnsiBrightRed: "#f38ba8",
  uiTerminalAnsiBrightGreen: "#a6e3a1",
  uiTerminalAnsiBrightYellow: "#f9e2af",
  uiTerminalAnsiBrightBlue: "#89b4fa",
  uiTerminalAnsiBrightMagenta: "#f5c2e7",
  uiTerminalAnsiBrightCyan: "#94e2d5",
  uiTerminalAnsiBrightWhite: "#a6adc8",
  uiTerminalInactiveSelectionBackground: "#6c708621",
  uiTerminalCommandDecorationDefaultBackground: "#6c7086",
  uiTestingQueuedRetiredAndTextLinkgForeground: "#89b4fa",
  uiTestingSkipped: "#a6adc8",
  uiTestingMessageInfo: "#a6e3a1cc",
  uiTestingCovered: "#a6e3a14d",
  uiTestinguncoveredGutterBackground: "#f38ba840",
  uiTextLinkActiveForeground: "#89dceb",
  uiTitlebarInactiveForeground: "#cdd6f480",
  uiTreeIndentGuideStroke: "#89b4fae0",
  uiTreeInactiveIndentGuidesStroke: "#585b70",
  uiToolbarHoverBackground: "#5d5f6260",
  uiWelcomePageTitleBorder: "#585b70",
  uiWidgetShadow: "#1e1e2e80",
  // Syntax colors
  keyword: "#cba6f7",
  type: "#f9e2af",
  typeAlias: "#f9e2af",
  parameter: "#cdd6f4",
  typeParameter: "#f9e2af",
  namespace: "#94e2d5",
  namespaceAttribute: "#94e2d5",
  module: "#94e2d5",
  directive: "#94e2d5",
  transition: "#94e2d5",
  annotation: "#fab387",
  decorator: "#fab387",
  class: "#f9e2af",
  functionAndMethod: "#89b4fa",
  delegate: "#89b4fa",
  struct: "#f9e2af",
  interface: "#f9e2af",
  enum: "#f9e2af",
  enumMember: "#94e2d5",
  support: "#89dceb",
  fieldAndAttribute: "#cdd6f4",
  property: "#89dceb",
  propertyReadOnly: "#89dceb",
  extensionMethod: "#89b4fa",
  event: "#f5c2e7",
  number: "#fab387",
  constant: "#fab387",
  operator: "#89dceb",
  operatorOverload: "#89dceb",
  punctuation: "#6c7086",
  string: "#a6e3a1",
  stringVerbatim: "#a6e3a1",
  comment: "#6c7086",
  text: "#cdd6f4",
  variable: "#cdd6f4",
  variableMutable: "#cdd6f4",
  macro: "#cba6f7",
  date: "#f9e2af",
  info: "#89b4fa",
  debug: "#cba6f7",
  exceptiontype: "#f38ba8",
  error: "#f38ba8",
  invalid: "#f38ba8",
  inserted: "#a6e3a1",
  deleted: "#f38ba8",
  changed: "#f9e2af",
  gitChangedGutter: "#f9e2af",
  metaMethod: "#89b4fa",
  regularExpression: "#f5c2e7",
  bindOperator: "#89dceb",
  jsonLvl0: "#f38ba8",
  jsonLvl1: "#fab387",
  jsonLvl2: "#f9e2af",
  jsonLvl3: "#a6e3a1",
  jsonLvl4: "#89dceb",
  jsonLvl5: "#89b4fa",
  jsonLvl6: "#cba6f7",
  jsonLvl7: "#f5c2e7",
  jsonLvl8: "#b4befe",
  markdownPlain: "#cdd6f4",
  rawInline: "#a6e3a1",
  rawInlinePunctuation: "#6c7086",
  heading: "#89b4fa",
  markdownSection: "#f9e2af",
  markdownBlockquote: "#6c7086",
  markupItalic: "#f5c2e7",
  markupBold: "#fab387",
  markupBoldItalic: "#f5c2e7",
  markupUnderline: "#89dceb",
  markdownLink: "#89b4fa",
  markdownLinkDescription: "#94e2d5",
  markdownLinkAnchor: "#f9e2af",
  markupRawBlock: "#a6e3a1",
  markdownRawBlockFenced: "#181825",
  markdownFencedBodeBlock: "#181825",
  markdownFencedBodeBlockVariable: "#cdd6f4",
  markdownFencedLanguage: "#6c7086",
  markdownSeparator: "#6c7086",
  markupTable: "#6c7086",
  cssAttributeId: "#89b4fa",
} as const;

describe("Error Lens Color Generator", () => {
  let colors: IErrorLensColors;

  beforeAll(() => {
    colors = generateErrorLensColors(mockPalette);
  });

  describe("Error colors", () => {
    it("should use red for error foreground", () => {
      expect(colors["errorLens.errorForeground"]).toBe(mockPalette.red);
      expect(colors["errorLens.errorForegroundLight"]).toBe(mockPalette.red);
    });

    it("should use red with background opacity for error backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.red, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.errorBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.errorBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.errorMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.errorRangeBackground"]).toBe(expectedBackground);
    });

    it("should use red for status bar error icons", () => {
      expect(colors["errorLens.statusBarErrorForeground"]).toBe(mockPalette.red);
      expect(colors["errorLens.statusBarIconErrorForeground"]).toBe(mockPalette.red);
    });
  });

  describe("Warning colors", () => {
    it("should use peach for warning foreground", () => {
      expect(colors["errorLens.warningForeground"]).toBe(mockPalette.peach);
      expect(colors["errorLens.warningForegroundLight"]).toBe(mockPalette.peach);
    });

    it("should use peach with background opacity for warning backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.peach, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.warningBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.warningBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.warningMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.warningRangeBackground"]).toBe(expectedBackground);
    });

    it("should use peach for status bar warning icons", () => {
      expect(colors["errorLens.statusBarWarningForeground"]).toBe(mockPalette.peach);
      expect(colors["errorLens.statusBarIconWarningForeground"]).toBe(mockPalette.peach);
    });
  });

  describe("Info colors", () => {
    it("should use blue for info foreground", () => {
      expect(colors["errorLens.infoForeground"]).toBe(mockPalette.blue);
      expect(colors["errorLens.infoForegroundLight"]).toBe(mockPalette.blue);
    });

    it("should use blue with background opacity for info backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.blue, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.infoBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.infoBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.infoMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.infoRangeBackground"]).toBe(expectedBackground);
    });

    it("should use blue for status bar info foreground", () => {
      expect(colors["errorLens.statusBarInfoForeground"]).toBe(mockPalette.blue);
    });
  });

  describe("Hint colors", () => {
    it("should use green for hint foreground", () => {
      expect(colors["errorLens.hintForeground"]).toBe(mockPalette.green);
      expect(colors["errorLens.hintForegroundLight"]).toBe(mockPalette.green);
    });

    it("should use green with background opacity for hint backgrounds", () => {
      const expectedBackground = hexWithAlpha(mockPalette.green, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["errorLens.hintBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.hintBackgroundLight"]).toBe(expectedBackground);
      expect(colors["errorLens.hintMessageBackground"]).toBe(expectedBackground);
      expect(colors["errorLens.hintRangeBackground"]).toBe(expectedBackground);
    });

    it("should use green for status bar hint foreground", () => {
      expect(colors["errorLens.statusBarHintForeground"]).toBe(mockPalette.green);
    });
  });

  describe("Color format validation", () => {
    it("should return all expected color keys", () => {
      const expectedKeys = [
        "errorLens.errorBackground",
        "errorLens.errorBackgroundLight",
        "errorLens.errorForeground",
        "errorLens.errorForegroundLight",
        "errorLens.errorMessageBackground",
        "errorLens.errorRangeBackground",
        "errorLens.warningBackground",
        "errorLens.warningBackgroundLight",
        "errorLens.warningForeground",
        "errorLens.warningForegroundLight",
        "errorLens.warningMessageBackground",
        "errorLens.warningRangeBackground",
        "errorLens.infoBackground",
        "errorLens.infoBackgroundLight",
        "errorLens.infoForeground",
        "errorLens.infoForegroundLight",
        "errorLens.infoMessageBackground",
        "errorLens.infoRangeBackground",
        "errorLens.hintBackground",
        "errorLens.hintBackgroundLight",
        "errorLens.hintForeground",
        "errorLens.hintForegroundLight",
        "errorLens.hintMessageBackground",
        "errorLens.hintRangeBackground",
        "errorLens.statusBarErrorForeground",
        "errorLens.statusBarWarningForeground",
        "errorLens.statusBarInfoForeground",
        "errorLens.statusBarHintForeground",
        "errorLens.statusBarIconErrorForeground",
        "errorLens.statusBarIconWarningForeground",
      ];

      expectedKeys.forEach((key) => {
        expect(key in colors).toBe(true);
      });
    });

    it("should return valid hex colors for all values", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;
      Object.values(colors).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });
  });
});
