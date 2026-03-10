import type { FacetType } from "./workspace"

export interface WorkspaceQuickAction {
  workspacePath: string
  facets: FacetQuickAction[]
}

export interface FacetQuickAction {
  facetId: string
  facetType: FacetType
  facetPath: string
  name: string
  command: string
  exec: string
  order?: number
}
