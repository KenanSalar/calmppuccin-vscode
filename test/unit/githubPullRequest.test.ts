/**
 * @file Unit tests for the GitHub Pull Requests extension color generator.
 * Tests that the generateGitHubPullRequestColors function produces correct color mappings
 * for PR and issue states.
 */

import { generateGitHubPullRequestColors, IGitHubPullRequestColors } from "../../src/extensions/githubPullRequest";
import { mockPalette } from "../__fixtures__/mockPalette";

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
