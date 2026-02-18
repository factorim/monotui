import type { Project } from "../../types/workspace.js"
import type {
  WorkspaceCell,
  WorkspaceQuickActionCell,
  WorkspaceRuntimeCell,
  WorkspacesNavigationCell,
  WorkspacesNavigationGrid,
  WorkspacesNavigationRow,
} from "../../types/workspace-grid"
import type { WorkspaceQuickAction } from "../../types/workspace-quick-actions.js"
import type { WorkspaceRuntimeState } from "../../types/workspace-runtime.js"
import { logger } from "../../utils/logging/logger.js"
import { getQuickActionByPath, getRuntimeByPath } from "./workspace-helper.js"

export function buildWorkspacesGrid(
  workspaces: Project[],
  quickActions: WorkspaceQuickAction[],
  runtimes: WorkspaceRuntimeState[],
): WorkspacesNavigationGrid {
  const maxQuickActionFacets = getMaxQuickActionRowItems(quickActions)
  const maxRuntimeFacets = getMaxRuntimeRowItems(runtimes)

  const grid: WorkspacesNavigationGrid = []
  for (let rowIndex = 0; rowIndex < workspaces.length; rowIndex++) {
    const project = workspaces[rowIndex]
    const cells: (WorkspacesNavigationCell | null)[] = []

    // Workspace cell (col 0)
    cells.push({ type: "workspace", project, row: rowIndex, col: 0 })

    // Quick actions
    const quickAction = getQuickActionByPath(quickActions, project.path)
    const qaFacets = quickAction?.facets ?? []
    for (let i = 0; i < maxQuickActionFacets; i++) {
      if (qaFacets[i]) {
        cells.push({
          type: "quickAction",
          action: qaFacets[i],
          row: rowIndex,
          col: i + 1,
        })
      } else {
        cells.push(null)
      }
    }

    // Runtimes
    const runtime = getRuntimeByPath(runtimes, project.path)
    const rtFacets =
      runtime?.runStates?.filter((rs) => rs.status !== "stopped") ?? []
    for (let i = 0; i < maxRuntimeFacets; i++) {
      if (rtFacets[i]) {
        cells.push({
          type: "runtime",
          runState: rtFacets[i],
          row: rowIndex,
          col: i + maxQuickActionFacets + 1,
        })
      } else {
        cells.push(null)
      }
    }

    const navRow: WorkspacesNavigationRow = {
      id: project.path,
      cells,
    }
    grid.push(navRow)
  }

  logger.debug("Workspaces Navigation Grid")
  logger.debug(JSON.stringify(grid, null, 2))
  return grid
}

/**
 * Returns the highest number of items found in the array.
 */
function getMaxQuickActionRowItems(arr: { facets?: unknown[] }[]): number {
  return arr.reduce((max, item) => {
    const count = Array.isArray(item.facets) ? item.facets.length : 0
    return count > max ? count : max
  }, 0)
}

/**
 * Returns the highest number of items found in the array.
 */
function getMaxRuntimeRowItems(arr: { runStates?: unknown[] }[]): number {
  return arr.reduce((max, item) => {
    const count = Array.isArray(item.runStates) ? item.runStates.length : 0
    return count > max ? count : max
  }, 0)
}

/**
 * Returns the first WorkspaceCell found in a row
 */
export function getWorkspaceCell(
  cells: (WorkspacesNavigationCell | null)[],
): WorkspaceCell {
  return cells.find(
    (cell) => cell && cell.type === "workspace",
  ) as WorkspaceCell
}

/**
 * Returns all WorkspaceQuickActionCell in a row
 */
export function getWorkspaceQuickActionCells(
  cells: (WorkspacesNavigationCell | null)[],
): WorkspaceQuickActionCell[] {
  const result: WorkspaceQuickActionCell[] = []
  for (const cell of cells) {
    if (cell && cell.type === "quickAction")
      result.push(cell as WorkspaceQuickActionCell)
  }
  return result
}

/**
 * Returns all WorkspaceRuntimeCell in a row
 */
export function getWorkspaceRuntimeCells(
  cells: (WorkspacesNavigationCell | null)[],
): WorkspaceRuntimeCell[] {
  const result: WorkspaceRuntimeCell[] = []
  for (const cell of cells) {
    if (cell && cell.type === "runtime")
      result.push(cell as WorkspaceRuntimeCell)
  }
  return result
}

// /**
//  * Returns the WorkspaceCell at the given cursor position (row, col) from the grid.
//  */
// export function getWorkspaceCellByPosition(
//   grid: WorkspacesNavigationGrid,
//   row: number,
//   col: number,
// ): WorkspaceCell | null {
//   const navRow = grid[row]
//   if (!navRow || !navRow.cells[col]) return null
//   const cell = navRow.cells[col]
//   return cell && cell.type === "workspace" ? (cell as WorkspaceCell) : null
// }

/**
 * Returns the WorkspacesNavigationCell (any type) at the given row and col from the grid.
 */
export function getWorkspaceCellByPosition(
  grid: WorkspacesNavigationGrid,
  row: number,
  col: number,
): WorkspacesNavigationCell | null {
  const navRow = grid[row]
  if (!navRow || !navRow.cells[col]) return null
  const cell = navRow.cells[col]
  return cell ? cell : null
}
