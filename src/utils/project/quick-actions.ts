import type {
  FacetQuickAction,
  WorkspaceQuickAction,
} from "../../types/workspace-quick-actions.js"
import { formatFacetId } from "../format.js"

export function getWorkspaceQuickAction(
  quickActions: WorkspaceQuickAction[],
  workspacePath: string,
): WorkspaceQuickAction {
  const quickAction = quickActions.find(
    (action) => action.workspacePath === workspacePath,
  )

  if (!quickAction) {
    throw new Error(`Quick action not found for workspace: ${workspacePath}`)
  }

  return quickAction
}

export function getFacetQuickAction(
  workspaceQuickAction: WorkspaceQuickAction,
  facetId: string,
): FacetQuickAction {
  const facetQuickAction = workspaceQuickAction.facets.find(
    (facet) => facet.facetId === facetId,
  )

  if (!facetQuickAction) {
    throw new Error(`Quick action facet not found: ${facetId}`)
  }

  return facetQuickAction
}

export function hasFacetQuickAction(
  workspaceQuickAction: WorkspaceQuickAction,
  facetPath: string,
  facetName: string,
): FacetQuickAction | undefined {
  const facetId = formatFacetId(facetPath, facetName)

  return workspaceQuickAction.facets.find((facet) => facet.facetId === facetId)
}
