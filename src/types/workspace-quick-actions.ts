export interface WorkspaceQuickAction {
  workspacePath: string
  facets: FacetQuickAction[]
}

export interface FacetQuickAction {
  facetPath: string
  name: string
  command: string
  exec: string
  order?: number
}
