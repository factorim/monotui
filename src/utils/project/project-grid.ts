import path from "node:path"
import {
  COMPOSE_COMMANDS,
  type ComposeCommandCell,
  type ComposeServiceCell,
  type MakefileCell,
  type PackageJsonCell,
  type ProjectGridCell,
  type ProjectGridGrid,
} from "../../types/project-grid.js"
import type { Project } from "../../types/workspace.js"

export function buildProjectGrid(workspace: Project): ProjectGridGrid {
  const makefileCells: MakefileCell[] = []
  const packageJsonCells: PackageJsonCell[] = []
  const composeCommandCells: ComposeCommandCell[] = []
  const composeServiceCells: ComposeServiceCell[] = []

  const makefileCommands = workspace.facets.makefile?.commands ?? []
  const scripts = workspace.facets.packageJson?.scripts ?? []
  const services = workspace.facets.compose?.services ?? []
  const hasCompose = services.length > 0

  // Assign column indices dynamically, skipping empty facets
  let nextCol = 0
  const makefileCol = makefileCommands.length > 0 ? nextCol++ : -1
  const packageJsonCol = scripts.length > 0 ? nextCol++ : -1
  const composeCol = hasCompose ? nextCol++ : -1

  // Always show compose commands if column exists (even without services)
  // but only create the column if there are services
  const maxCol = Math.max(nextCol - 1, 0)

  // Column: Makefile commands
  if (makefileCol >= 0) {
    for (let i = 0; i < makefileCommands.length; i++) {
      makefileCells.push({
        type: "makefile",
        filepath: path.join(
          workspace.path,
          workspace.facets.makefile?.filename ?? "",
        ),
        row: i,
        col: makefileCol,
        command: makefileCommands[i],
      })
    }
  }

  // Column: Package.json scripts
  if (packageJsonCol >= 0) {
    for (let i = 0; i < scripts.length; i++) {
      packageJsonCells.push({
        type: "packageJson",
        filepath: path.join(
          workspace.path,
          workspace.facets.packageJson?.filename ?? "",
        ),
        row: i,
        col: packageJsonCol,
        script: scripts[i],
      })
    }
  }

  // Column: Compose commands + services
  if (composeCol >= 0) {
    let composeRow = 0
    for (const command of COMPOSE_COMMANDS) {
      composeCommandCells.push({
        type: "composeCommand",
        filepath: path.join(
          workspace.path,
          workspace.facets.compose?.filename ?? "",
        ),
        row: composeRow,
        col: composeCol,
        action: {
          name: command,
          command: `docker compose ${command}`,
        },
      })
      composeRow++
    }

    for (const service of services) {
      composeServiceCells.push({
        type: "composeService",
        filepath: path.join(
          workspace.path,
          workspace.facets.compose?.filename ?? "",
        ),
        row: composeRow,
        col: composeCol,
        service,
      })
      composeRow++
    }
  }

  return {
    makefileCells,
    packageJsonCells,
    composeCommandCells,
    composeServiceCells,
    maxCol,
  }
}

/**
 * Returns the cell at the given position from the grid.
 */
export function getProjectCellByPosition(
  grid: ProjectGridGrid,
  row: number,
  col: number,
): ProjectGridCell | null {
  const allCells: ProjectGridCell[] = [
    ...grid.makefileCells,
    ...grid.packageJsonCells,
    ...grid.composeCommandCells,
    ...grid.composeServiceCells,
  ]

  return allCells.find((cell) => cell.row === row && cell.col === col) ?? null
}

/**
 * Returns the maximum row count across all columns.
 */
export function getMaxRows(grid: ProjectGridGrid): number {
  const col0Max = grid.makefileCells.length
  const col1Max = grid.packageJsonCells.length
  const col2Max =
    grid.composeCommandCells.length + grid.composeServiceCells.length
  return Math.max(col0Max, col1Max, col2Max)
}

/**
 * Returns all cells for a given column.
 */
export function getCellsByColumn(
  grid: ProjectGridGrid,
  col: number,
): ProjectGridCell[] {
  const allCells: ProjectGridCell[] = [
    ...grid.makefileCells,
    ...grid.packageJsonCells,
    ...grid.composeCommandCells,
    ...grid.composeServiceCells,
  ]
  return allCells.filter((cell) => cell.col === col)
}

const CELL_TYPE_LABELS: Record<ProjectGridCell["type"], string> = {
  makefile: "Makefile",
  packageJson: "Package.json",
  composeCommand: "Docker Compose",
  composeService: "Docker Service",
}

export function getCellLabel(cell: ProjectGridCell): string {
  return `${CELL_TYPE_LABELS[cell.type]} - ${cell.filepath}`
}
