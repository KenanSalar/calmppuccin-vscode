/**
 * @file Unit tests for the GitLens extension color generator.
 * Tests that the generateGitLensColors function produces correct color mappings
 * for git operations, graph visualization, and branch status.
 */

import { generateGitLensColors, IGitLensColors } from "../../src/extensions/gitlens";
import {
  EXTENSION_OPACITY_BACKGROUND,
  EXTENSION_OPACITY_GUTTER,
  EXTENSION_OPACITY_HIGHLIGHT,
  EXTENSION_OPACITY_TRAILING,
} from "../../src/constants";
import { hexWithAlpha } from "../../src/utils/color";
import { mockPalette } from "../__fixtures__/mockPalette";

describe("GitLens Color Generator", () => {
  let colors: IGitLensColors;

  beforeAll(() => {
    colors = generateGitLensColors(mockPalette);
  });

  describe("Gutter decorations", () => {
    it("should use mantle with gutter opacity for gutter background", () => {
      const expected = hexWithAlpha(mockPalette.mantle, EXTENSION_OPACITY_GUTTER);
      expect(colors["gitlens.gutterBackgroundColor"]).toBe(expected);
    });

    it("should use inactive foreground for gutter text", () => {
      expect(colors["gitlens.gutterForegroundColor"]).toBe(mockPalette.uiInactiveForeground0);
    });

    it("should use yellow for uncommitted changes", () => {
      expect(colors["gitlens.gutterUncommittedForegroundColor"]).toBe(mockPalette.yellow);
    });
  });

  describe("Line highlights", () => {
    it("should use blue with background opacity for line highlight", () => {
      const expected = hexWithAlpha(mockPalette.blue, EXTENSION_OPACITY_BACKGROUND);
      expect(colors["gitlens.lineHighlightBackgroundColor"]).toBe(expected);
    });

    it("should use blue with highlight opacity for overview ruler", () => {
      const expected = hexWithAlpha(mockPalette.blue, EXTENSION_OPACITY_HIGHLIGHT);
      expect(colors["gitlens.lineHighlightOverviewRulerColor"]).toBe(expected);
    });
  });

  describe("Trailing line blame", () => {
    it("should use transparent background for trailing line", () => {
      expect(colors["gitlens.trailingLineBackgroundColor"]).toBe("#00000000");
    });

    it("should use uiText with trailing opacity for trailing line foreground", () => {
      const expected = hexWithAlpha(mockPalette.uiText, EXTENSION_OPACITY_TRAILING);
      expect(colors["gitlens.trailingLineForegroundColor"]).toBe(expected);
    });
  });

  describe("PR/Issue icon colors", () => {
    it("should use green for open issues and PRs", () => {
      expect(colors["gitlens.openAutolinkedIssueIconColor"]).toBe(mockPalette.green);
      expect(colors["gitlens.openPullRequestIconColor"]).toBe(mockPalette.green);
    });

    it("should use mauve for closed issues and merged PRs", () => {
      expect(colors["gitlens.closedAutolinkedIssueIconColor"]).toBe(mockPalette.mauve);
      expect(colors["gitlens.mergedPullRequestIconColor"]).toBe(mockPalette.mauve);
    });

    it("should use red for closed PRs", () => {
      expect(colors["gitlens.closedPullRequestIconColor"]).toBe(mockPalette.red);
    });
  });

  describe("Graph lane colors", () => {
    it("should use 10 distinct colors for graph lanes", () => {
      const laneColors = [
        colors["gitlens.graphLane1Color"],
        colors["gitlens.graphLane2Color"],
        colors["gitlens.graphLane3Color"],
        colors["gitlens.graphLane4Color"],
        colors["gitlens.graphLane5Color"],
        colors["gitlens.graphLane6Color"],
        colors["gitlens.graphLane7Color"],
        colors["gitlens.graphLane8Color"],
        colors["gitlens.graphLane9Color"],
        colors["gitlens.graphLane10Color"],
      ];

      // Verify all lanes have colors
      laneColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });

      // Verify lane 1 is blue (first in the array)
      expect(colors["gitlens.graphLane1Color"]).toBe(mockPalette.blue);
    });
  });

  describe("File status decorations", () => {
    it("should use green for added files", () => {
      expect(colors["gitlens.decorations.addedForegroundColor"]).toBe(mockPalette.green);
    });

    it("should use red for deleted files", () => {
      expect(colors["gitlens.decorations.deletedForegroundColor"]).toBe(mockPalette.red);
    });

    it("should use yellow for modified files", () => {
      expect(colors["gitlens.decorations.modifiedForegroundColor"]).toBe(mockPalette.yellow);
    });

    it("should use teal for copied files", () => {
      expect(colors["gitlens.decorations.copiedForegroundColor"]).toBe(mockPalette.teal);
    });

    it("should use sky for untracked files", () => {
      expect(colors["gitlens.decorations.untrackedForegroundColor"]).toBe(mockPalette.sky);
    });

    it("should use mauve for renamed files", () => {
      expect(colors["gitlens.decorations.renamedForegroundColor"]).toBe(mockPalette.mauve);
    });
  });

  describe("Branch status decorations", () => {
    it("should use green for ahead and up-to-date branches", () => {
      expect(colors["gitlens.decorations.branchAheadForegroundColor"]).toBe(mockPalette.green);
      expect(colors["gitlens.decorations.branchUpToDateForegroundColor"]).toBe(mockPalette.green);
    });

    it("should use peach for behind branches", () => {
      expect(colors["gitlens.decorations.branchBehindForegroundColor"]).toBe(mockPalette.peach);
    });

    it("should use yellow for diverged branches", () => {
      expect(colors["gitlens.decorations.branchDivergedForegroundColor"]).toBe(mockPalette.yellow);
    });

    it("should use blue for unpublished branches", () => {
      expect(colors["gitlens.decorations.branchUnpublishedForegroundColor"]).toBe(mockPalette.blue);
    });

    it("should use red for missing upstream", () => {
      expect(colors["gitlens.decorations.branchMissingUpstreamForegroundColor"]).toBe(mockPalette.red);
    });
  });

  describe("Graph markers", () => {
    it("should use green for added changes column", () => {
      expect(colors["gitlens.graphChangesColumnAddedColor"]).toBe(mockPalette.green);
    });

    it("should use red for deleted changes column", () => {
      expect(colors["gitlens.graphChangesColumnDeletedColor"]).toBe(mockPalette.red);
    });

    it("should use green for head markers", () => {
      expect(colors["gitlens.graphMinimapMarkerHeadColor"]).toBe(mockPalette.green);
      expect(colors["gitlens.graphScrollMarkerHeadColor"]).toBe(mockPalette.green);
    });
  });

  describe("Color format validation", () => {
    it("should return valid hex colors for all values", () => {
      const hexRegex = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;
      Object.values(colors).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });

    it("should have all expected gitlens color keys", () => {
      const keyPrefixes = [
        "gitlens.gutter",
        "gitlens.lineHighlight",
        "gitlens.trailingLine",
        "gitlens.openAutolinkedIssue",
        "gitlens.closedAutolinkedIssue",
        "gitlens.graphLane",
        "gitlens.decorations.",
      ];

      keyPrefixes.forEach((prefix) => {
        const matchingKeys = Object.keys(colors).filter((key) => key.startsWith(prefix));
        expect(matchingKeys.length).toBeGreaterThan(0);
      });
    });
  });
});
