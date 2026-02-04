/**
 * @file Unit tests for the GitHub Pull Requests extension color generator.
 * Tests that the generateGitHubPullRequestColors function produces correct color mappings
 * for PR and issue states.
 */

import { generateGitHubPullRequestColors, IGitHubPullRequestColors } from "../../src/extensions/githubPullRequest";
import { IPalette } from "../../src/palettes";

// Minimal mock palette with values needed for GitHub PR colors
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
  // UI colors
  base: "#1e1e2e",
  mantle: "#181825",
  crust: "#11111b",
  uiText: "#cdd6f4",
  uiInactiveForeground0: "#6c7086",
  // Remaining UI colors (abbreviated for test purposes)
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

describe("GitHub Pull Request Color Generator", () => {
  let colors: IGitHubPullRequestColors;

  beforeAll(() => {
    colors = generateGitHubPullRequestColors(mockPalette);
  });

  describe("Issue colors", () => {
    it("should use green for open issues", () => {
      expect(colors["issues.open"]).toBe(mockPalette.green);
    });

    it("should use mauve for closed issues", () => {
      expect(colors["issues.closed"]).toBe(mockPalette.mauve);
    });

    it("should use rosewater for new issue decoration", () => {
      expect(colors["issues.newIssueDecoration"]).toBe(mockPalette.rosewater);
    });
  });

  describe("Pull Request colors", () => {
    it("should use green for open PRs", () => {
      expect(colors["pullRequests.open"]).toBe(mockPalette.green);
    });

    it("should use red for closed PRs", () => {
      expect(colors["pullRequests.closed"]).toBe(mockPalette.red);
    });

    it("should use mauve for merged PRs", () => {
      expect(colors["pullRequests.merged"]).toBe(mockPalette.mauve);
    });

    it("should use inactive foreground for draft PRs", () => {
      expect(colors["pullRequests.draft"]).toBe(mockPalette.uiInactiveForeground0);
    });

    it("should use uiText for notifications", () => {
      expect(colors["pullRequests.notification"]).toBe(mockPalette.uiText);
    });
  });

  describe("Color format validation", () => {
    it("should return all expected color keys", () => {
      const expectedKeys = [
        "issues.open",
        "issues.closed",
        "issues.newIssueDecoration",
        "pullRequests.open",
        "pullRequests.closed",
        "pullRequests.merged",
        "pullRequests.draft",
        "pullRequests.notification",
      ];

      expectedKeys.forEach((key) => {
        expect(key in colors).toBe(true);
      });
    });

    it("should return valid hex colors for all values", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}$/;
      Object.values(colors).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });

    it("should return exactly 8 color keys", () => {
      expect(Object.keys(colors)).toHaveLength(8);
    });
  });

  describe("Semantic color mapping", () => {
    it("should use same color for open issues and open PRs (consistency)", () => {
      expect(colors["issues.open"]).toBe(colors["pullRequests.open"]);
    });

    it("should use same color for closed issues and merged PRs (completion state)", () => {
      expect(colors["issues.closed"]).toBe(colors["pullRequests.merged"]);
    });

    it("should use different colors for closed PRs vs closed issues", () => {
      // Closed PRs (rejected) should be red, closed issues (completed) should be mauve
      expect(colors["pullRequests.closed"]).not.toBe(colors["issues.closed"]);
    });
  });
});
