import type { Project } from "./workspace.js"
import type { FacetQuickAction } from "./workspace-quick-actions.js"
import type { RunState } from "./workspace-runtime.js"

export interface CursorPosition {
  row: number
  col: number
}

export interface WorkspacesNavigationRow {
  id: string
  cells: (WorkspacesNavigationCell | null)[]
}

export type WorkspacesNavigationGrid = WorkspacesNavigationRow[]

export type WorkspacesNavigationCell =
  | WorkspaceCell
  | WorkspaceQuickActionCell
  | WorkspaceRuntimeCell

export interface WorkspaceCell {
  type: "workspace"
  row: number
  col: number
  project: Project
}

export interface WorkspaceQuickActionCell {
  type: "quickAction"
  row: number
  col: number
  action: FacetQuickAction
}

export interface WorkspaceRuntimeCell {
  type: "runtime"
  row: number
  col: number
  runState: RunState
}
