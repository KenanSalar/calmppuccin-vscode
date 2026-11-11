/**
 * @file GitHub Pull Requests colors from the base palette: green while open, red for a closed
 * pull request, and mauve for a merged one or a closed issue.
 * @see https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github
 */

import { IPalette } from "../palettes";

export interface IGitHubPullRequestColors {
  "issues.open": string;
  "issues.closed": string;
  "issues.newIssueDecoration": string;

  "pullRequests.open": string;
  "pullRequests.closed": string;
  "pullRequests.merged": string;
  "pullRequests.draft": string;
  "pullRequests.notification": string;
}

export function generateGitHubPullRequestColors(palette: IPalette): IGitHubPullRequestColors {
  return {
    "issues.open": palette.green,
    "issues.closed": palette.mauve,
    "issues.newIssueDecoration": palette.rosewater,

    "pullRequests.open": palette.green,
    "pullRequests.closed": palette.red,
    "pullRequests.merged": palette.mauve,
    // Catppuccin colors a draft subtext0, which Calmppuccin lacks.
    "pullRequests.draft": palette.uiInactiveForeground0,
    "pullRequests.notification": palette.uiText,
  };
}
