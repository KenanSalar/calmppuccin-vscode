/**
 * @file githubPullRequest.ts
 * @description Generates GitHub Pull Requests and Issues extension color customizations
 * for all Calmppuccin flavors. This module provides color mappings for the GitHub PR
 * extension to integrate seamlessly with the Calmppuccin theme aesthetic.
 *
 * GitHub Pull Requests extension: https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github
 */

import { IPalette } from "../palettes";

/**
 * Interface defining all GitHub Pull Requests and Issues color customization points.
 * These colors control how PR and issue states are displayed in the sidebar,
 * editor decorations, and throughout the extension UI.
 */
export interface IGitHubPullRequestColors {
  // Issue colors
  "issues.open": string;
  "issues.closed": string;
  "issues.newIssueDecoration": string;

  // Pull Request colors
  "pullRequests.open": string;
  "pullRequests.closed": string;
  "pullRequests.merged": string;
  "pullRequests.draft": string;
  "pullRequests.notification": string;
}

/**
 * Generates GitHub Pull Requests and Issues color mappings for a given Calmppuccin flavor palette.
 *
 * Color mapping strategy:
 * - Open (PR/Issue): green (positive, active state)
 * - Closed PR: red (negative, rejected state)
 * - Closed Issue: mauve (completed, resolved state)
 * - Merged PR: mauve (successful completion)
 * - Draft PR: subtext0 (muted, work-in-progress state)
 * - New Issue Decoration: rosewater (attention-grabbing but subtle)
 * - Notification: text (standard text color for visibility)
 *
 * Note: Calmppuccin doesn't have overlay2 or subtext0 in the palette like Catppuccin,
 * so we'll use appropriate alternatives from the available colors.
 *
 * @param {IPalette} palette - The color palette for a specific Calmppuccin flavor.
 * @returns {IGitHubPullRequestColors} An object containing all GitHub PR color customizations.
 */
export function generateGitHubPullRequestColors(palette: IPalette): IGitHubPullRequestColors {
  return {
    // Issue colors
    "issues.open": palette.green,
    "issues.closed": palette.mauve,
    "issues.newIssueDecoration": palette.rosewater,

    // Pull Request colors
    "pullRequests.open": palette.green,
    "pullRequests.closed": palette.red,
    "pullRequests.merged": palette.mauve,
    "pullRequests.draft": palette.uiInactiveForeground0, // Muted gray for draft state
    "pullRequests.notification": palette.uiText, // Standard text color
  };
}
