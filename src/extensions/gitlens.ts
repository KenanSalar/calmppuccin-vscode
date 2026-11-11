/**
 * @file GitLens colors from the base palette: muted blame and gutter annotations, a faint blue
 * line highlight, green, yellow and red for added, modified and deleted files, and ten accents
 * for the graph's lanes.
 * @see https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens
 */

import {
  EXTENSION_OPACITY_BACKGROUND,
  EXTENSION_OPACITY_GUTTER,
  EXTENSION_OPACITY_HIGHLIGHT,
  EXTENSION_OPACITY_TRAILING,
} from "../constants";
import { IPalette } from "../palettes";
import { hexWithAlpha } from "../utils/color";

export interface IGitLensColors {
  "gitlens.gutterBackgroundColor": string;
  "gitlens.gutterForegroundColor": string;
  "gitlens.gutterUncommittedForegroundColor": string;

  "gitlens.lineHighlightBackgroundColor": string;
  "gitlens.lineHighlightOverviewRulerColor": string;

  "gitlens.trailingLineBackgroundColor": string;
  "gitlens.trailingLineForegroundColor": string;

  "gitlens.openAutolinkedIssueIconColor": string;
  "gitlens.closedAutolinkedIssueIconColor": string;
  "gitlens.closedPullRequestIconColor": string;
  "gitlens.openPullRequestIconColor": string;
  "gitlens.mergedPullRequestIconColor": string;

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

  "gitlens.unpublishedChangesIconColor": string;
  "gitlens.unpublishedCommitIconColor": string;
  "gitlens.unpulledChangesIconColor": string;

  "gitlens.decorations.addedForegroundColor": string;
  "gitlens.decorations.copiedForegroundColor": string;
  "gitlens.decorations.deletedForegroundColor": string;
  "gitlens.decorations.modifiedForegroundColor": string;
  "gitlens.decorations.untrackedForegroundColor": string;
  "gitlens.decorations.renamedForegroundColor": string;

  "gitlens.decorations.branchAheadForegroundColor": string;
  "gitlens.decorations.branchBehindForegroundColor": string;
  "gitlens.decorations.branchDivergedForegroundColor": string;
  "gitlens.decorations.branchUpToDateForegroundColor": string;
  "gitlens.decorations.branchUnpublishedForegroundColor": string;
  "gitlens.decorations.branchMissingUpstreamForegroundColor": string;

  "gitlens.decorations.statusMergingOrRebasingConflictForegroundColor": string;
  "gitlens.decorations.statusMergingOrRebasingForegroundColor": string;

  "gitlens.decorations.workspaceRepoMissingForegroundColor": string;
  "gitlens.decorations.workspaceCurrentForegroundColor": string;
  "gitlens.decorations.workspaceRepoOpenForegroundColor": string;

  "gitlens.decorations.worktreeHasUncommittedChangesForegroundColor": string;
  "gitlens.decorations.worktreeMissingForegroundColor": string;

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

export function generateGitLensColors(palette: IPalette): IGitLensColors {
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
    "gitlens.gutterBackgroundColor": hexWithAlpha(palette.mantle, EXTENSION_OPACITY_GUTTER),
    "gitlens.gutterForegroundColor": palette.uiInactiveForeground0,
    "gitlens.gutterUncommittedForegroundColor": palette.yellow,

    "gitlens.lineHighlightBackgroundColor": hexWithAlpha(
      palette.blue,
      EXTENSION_OPACITY_BACKGROUND,
    ),
    "gitlens.lineHighlightOverviewRulerColor": hexWithAlpha(
      palette.blue,
      EXTENSION_OPACITY_HIGHLIGHT,
    ),

    "gitlens.trailingLineBackgroundColor": "#00000000",
    "gitlens.trailingLineForegroundColor": hexWithAlpha(palette.uiText, EXTENSION_OPACITY_TRAILING),

    "gitlens.openAutolinkedIssueIconColor": palette.green,
    "gitlens.closedAutolinkedIssueIconColor": palette.mauve,
    "gitlens.closedPullRequestIconColor": palette.red,
    "gitlens.openPullRequestIconColor": palette.green,
    "gitlens.mergedPullRequestIconColor": palette.mauve,

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

    "gitlens.unpublishedChangesIconColor": palette.green,
    "gitlens.unpublishedCommitIconColor": palette.green,
    "gitlens.unpulledChangesIconColor": palette.peach,

    "gitlens.decorations.addedForegroundColor": palette.green,
    "gitlens.decorations.copiedForegroundColor": palette.teal,
    "gitlens.decorations.deletedForegroundColor": palette.red,
    "gitlens.decorations.modifiedForegroundColor": palette.yellow,
    "gitlens.decorations.untrackedForegroundColor": palette.sky,
    "gitlens.decorations.renamedForegroundColor": palette.mauve,

    "gitlens.decorations.branchAheadForegroundColor": palette.green,
    "gitlens.decorations.branchBehindForegroundColor": palette.peach,
    "gitlens.decorations.branchDivergedForegroundColor": palette.yellow,
    "gitlens.decorations.branchUpToDateForegroundColor": palette.green,
    "gitlens.decorations.branchUnpublishedForegroundColor": palette.blue,
    "gitlens.decorations.branchMissingUpstreamForegroundColor": palette.red,

    "gitlens.decorations.statusMergingOrRebasingConflictForegroundColor": palette.maroon,
    "gitlens.decorations.statusMergingOrRebasingForegroundColor": palette.yellow,

    "gitlens.decorations.workspaceRepoMissingForegroundColor": palette.uiInactiveForeground0,
    "gitlens.decorations.workspaceCurrentForegroundColor": palette.blue,
    "gitlens.decorations.workspaceRepoOpenForegroundColor": palette.blue,

    "gitlens.decorations.worktreeHasUncommittedChangesForegroundColor": palette.peach,
    "gitlens.decorations.worktreeMissingForegroundColor": palette.maroon,

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
