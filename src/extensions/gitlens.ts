/**
 * @file gitlens.ts
 * @description Generates GitLens extension color customizations for all Calmppuccin flavors.
 * This module provides color mappings for the GitLens extension to integrate seamlessly
 * with the Calmppuccin theme aesthetic.
 *
 * GitLens extension: https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens
 */

import { IPalette } from "../palettes";
import { hexWithAlpha } from "../utils/color";

/**
 * Interface defining all GitLens color customization points.
 * These colors control how Git information is displayed throughout the editor,
 * including blame annotations, line highlights, gutter decorations, and graph visualizations.
 */
export interface IGitLensColors {
  // Gutter decorations for file changes
  "gitlens.gutterBackgroundColor": string;
  "gitlens.gutterForegroundColor": string;
  "gitlens.gutterUncommittedForegroundColor": string;

  // Line highlights for Git information
  "gitlens.lineHighlightBackgroundColor": string;
  "gitlens.lineHighlightOverviewRulerColor": string;

  // Trailing line blame annotations
  "gitlens.trailingLineBackgroundColor": string;
  "gitlens.trailingLineForegroundColor": string;

  // PR/Issue icon colors
  "gitlens.openAutolinkedIssueIconColor": string;
  "gitlens.closedAutolinkedIssueIconColor": string;
  "gitlens.closedPullRequestIconColor": string;
  "gitlens.openPullRequestIconColor": string;
  "gitlens.mergedPullRequestIconColor": string;

  // Graph visualization colors (commit history graph)
  "gitlens.graphLane1Color": string;
  "gitlens.graphLane2Color": string;
  "gitlens.graphLane3Color": string;
  "gitlens.graphLane4Color": string;
  "gitlens.graphLane5Color": string;
  "gitlens.graphLane6Color": string;
  "gitlens.graphLane7Color": string;
  "gitlens.graphLane8Color": string;
  "gitlens.graphLane9Color": string;
  "gitlens.graphLane10Color": string;

  // Unpublished/unpulled changes
  "gitlens.unpublishedChangesIconColor": string;
  "gitlens.unpublishedCommitIconColor": string;
  "gitlens.unpulledChangesIconColor": string;

  // Comparison view colors
  "gitlens.decorations.addedForegroundColor": string;
  "gitlens.decorations.copiedForegroundColor": string;
  "gitlens.decorations.deletedForegroundColor": string;
  "gitlens.decorations.modifiedForegroundColor": string;
  "gitlens.decorations.untrackedForegroundColor": string;
  "gitlens.decorations.renamedForegroundColor": string;

  // Branch status colors
  "gitlens.decorations.branchAheadForegroundColor": string;
  "gitlens.decorations.branchBehindForegroundColor": string;
  "gitlens.decorations.branchDivergedForegroundColor": string;
  "gitlens.decorations.branchUpToDateForegroundColor": string;
  "gitlens.decorations.branchUnpublishedForegroundColor": string;
  "gitlens.decorations.branchMissingUpstreamForegroundColor": string;

  // Status decorations
  "gitlens.decorations.statusMergingOrRebasingConflictForegroundColor": string;
  "gitlens.decorations.statusMergingOrRebasingForegroundColor": string;

  // Workspace decorations
  "gitlens.decorations.workspaceRepoMissingForegroundColor": string;
  "gitlens.decorations.workspaceCurrentForegroundColor": string;
  "gitlens.decorations.workspaceRepoOpenForegroundColor": string;

  // Worktree colors
  "gitlens.decorations.worktreeHasUncommittedChangesForegroundColor": string;
  "gitlens.decorations.worktreeMissingForegroundColor": string;

  // Graph markers and scrollbar
  "gitlens.graphChangesColumnAddedColor": string;
  "gitlens.graphChangesColumnDeletedColor": string;
  "gitlens.graphMinimapMarkerHeadColor": string;
  "gitlens.graphScrollMarkerHeadColor": string;
  "gitlens.graphMinimapMarkerUpstreamColor": string;
  "gitlens.graphScrollMarkerUpstreamColor": string;
  "gitlens.graphMinimapMarkerHighlightsColor": string;
  "gitlens.graphScrollMarkerHighlightsColor": string;
  "gitlens.graphMinimapMarkerLocalBranchesColor": string;
  "gitlens.graphScrollMarkerLocalBranchesColor": string;
  "gitlens.graphMinimapMarkerRemoteBranchesColor": string;
  "gitlens.graphScrollMarkerRemoteBranchesColor": string;
  "gitlens.graphMinimapMarkerStashesColor": string;
  "gitlens.graphScrollMarkerStashesColor": string;
  "gitlens.graphMinimapMarkerTagsColor": string;
  "gitlens.graphScrollMarkerTagsColor": string;
}

/**
 * Generates GitLens color mappings for a given Calmppuccin flavor palette.
 *
 * Color mapping strategy:
 * - Gutter/Blame: Muted colors (uiInactiveForeground0) for subtle annotations
 * - Line highlights: Accent color with low opacity for gentle highlighting
 * - Uncommitted changes: Yellow (attention-grabbing but not alarming)
 * - Added files: Green (positive, new content)
 * - Modified files: Yellow (changed content)
 * - Deleted files: Red (removed content)
 * - Untracked files: Sky (new but not yet added)
 * - Branch ahead: Green (local commits to push)
 * - Branch behind: Peach (remote commits to pull)
 * - Branch diverged: Yellow (conflicts potential)
 * - Graph lanes: Rainbow of accent colors for visual distinction
 *
 * @param {IPalette} palette - The color palette for a specific Calmppuccin flavor.
 * @returns {IGitLensColors} An object containing all GitLens color customizations.
 */
export function generateGitLensColors(palette: IPalette): IGitLensColors {
  // Graph lane colors - using a variety of accent colors for visual distinction
  const graphLaneColors = [
    palette.blue,
    palette.pink,
    palette.teal,
    palette.peach,
    palette.mauve,
    palette.green,
    palette.yellow,
    palette.sapphire,
    palette.rosewater,
    palette.flamingo,
  ];

  return {
    // Gutter decorations - subtle and muted
    "gitlens.gutterBackgroundColor": hexWithAlpha(palette.mantle, 0.3),
    "gitlens.gutterForegroundColor": palette.uiInactiveForeground0,
    "gitlens.gutterUncommittedForegroundColor": palette.yellow,

    // Line highlights - gentle accent color with low opacity
    "gitlens.lineHighlightBackgroundColor": hexWithAlpha(palette.blue, 0.15),
    "gitlens.lineHighlightOverviewRulerColor": hexWithAlpha(palette.blue, 0.8),

    // Trailing line blame - muted for minimal distraction
    "gitlens.trailingLineBackgroundColor": "#00000000",
    "gitlens.trailingLineForegroundColor": hexWithAlpha(palette.uiText, 0.3),

    // PR/Issue icon colors
    "gitlens.openAutolinkedIssueIconColor": palette.green,
    "gitlens.closedAutolinkedIssueIconColor": palette.mauve,
    "gitlens.closedPullRequestIconColor": palette.red,
    "gitlens.openPullRequestIconColor": palette.green,
    "gitlens.mergedPullRequestIconColor": palette.mauve,

    // Graph visualization - colorful lanes for commit history
    "gitlens.graphLane1Color": graphLaneColors[0],
    "gitlens.graphLane2Color": graphLaneColors[1],
    "gitlens.graphLane3Color": graphLaneColors[2],
    "gitlens.graphLane4Color": graphLaneColors[3],
    "gitlens.graphLane5Color": graphLaneColors[4],
    "gitlens.graphLane6Color": graphLaneColors[5],
    "gitlens.graphLane7Color": graphLaneColors[6],
    "gitlens.graphLane8Color": graphLaneColors[7],
    "gitlens.graphLane9Color": graphLaneColors[8],
    "gitlens.graphLane10Color": graphLaneColors[9],

    // Unpublished/unpulled changes
    "gitlens.unpublishedChangesIconColor": palette.green,
    "gitlens.unpublishedCommitIconColor": palette.green,
    "gitlens.unpulledChangesIconColor": palette.peach,

    // File status decorations - semantic colors
    "gitlens.decorations.addedForegroundColor": palette.green,
    "gitlens.decorations.copiedForegroundColor": palette.teal,
    "gitlens.decorations.deletedForegroundColor": palette.red,
    "gitlens.decorations.modifiedForegroundColor": palette.yellow,
    "gitlens.decorations.untrackedForegroundColor": palette.sky,
    "gitlens.decorations.renamedForegroundColor": palette.mauve,

    // Branch status - semantic colors (following Catppuccin approach)
    "gitlens.decorations.branchAheadForegroundColor": palette.green,
    "gitlens.decorations.branchBehindForegroundColor": palette.peach,
    "gitlens.decorations.branchDivergedForegroundColor": palette.yellow,
    "gitlens.decorations.branchUpToDateForegroundColor": palette.green,
    "gitlens.decorations.branchUnpublishedForegroundColor": palette.blue,
    "gitlens.decorations.branchMissingUpstreamForegroundColor": palette.red,

    // Status decorations
    "gitlens.decorations.statusMergingOrRebasingConflictForegroundColor": palette.maroon,
    "gitlens.decorations.statusMergingOrRebasingForegroundColor": palette.yellow,

    // Workspace decorations
    "gitlens.decorations.workspaceRepoMissingForegroundColor": palette.uiInactiveForeground0,
    "gitlens.decorations.workspaceCurrentForegroundColor": palette.blue,
    "gitlens.decorations.workspaceRepoOpenForegroundColor": palette.blue,

    // Worktree
    "gitlens.decorations.worktreeHasUncommittedChangesForegroundColor": palette.peach,
    "gitlens.decorations.worktreeMissingForegroundColor": palette.maroon,

    // Graph markers and scrollbar
    "gitlens.graphChangesColumnAddedColor": palette.green,
    "gitlens.graphChangesColumnDeletedColor": palette.red,
    "gitlens.graphMinimapMarkerHeadColor": palette.green,
    "gitlens.graphScrollMarkerHeadColor": palette.green,
    "gitlens.graphMinimapMarkerUpstreamColor": palette.green,
    "gitlens.graphScrollMarkerUpstreamColor": palette.green,
    "gitlens.graphMinimapMarkerHighlightsColor": palette.yellow,
    "gitlens.graphScrollMarkerHighlightsColor": palette.yellow,
    "gitlens.graphMinimapMarkerLocalBranchesColor": palette.blue,
    "gitlens.graphScrollMarkerLocalBranchesColor": palette.blue,
    "gitlens.graphMinimapMarkerRemoteBranchesColor": palette.blue,
    "gitlens.graphScrollMarkerRemoteBranchesColor": palette.blue,
    "gitlens.graphMinimapMarkerStashesColor": palette.mauve,
    "gitlens.graphScrollMarkerStashesColor": palette.mauve,
    "gitlens.graphMinimapMarkerTagsColor": palette.flamingo,
    "gitlens.graphScrollMarkerTagsColor": palette.flamingo,
  };
}
