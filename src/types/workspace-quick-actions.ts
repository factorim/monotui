import type { FacetType } from "./workspace"

export interface WorkspaceQuickAction {
  workspacePath: string
  facets: FacetQuickAction[]
}

export interface FacetQuickAction {
  facetType: FacetType
  facetPath: string
  name: string
  command: string
  exec: string
  order?: number
}
