import { createContext, type JSX, type ReactNode, useMemo } from "react"

import { useProjectGrid } from "../hooks/useProjectGrid.js"
import {
  getCommandFromCell,
  getExecFromCell,
  runCellCommand,
  shouldKeepTuiOpen,
} from "../services/runtime/command-runner.js"
import { Page } from "../types/page.js"
import type { Project } from "../types/project.js"
import type { ProjectGridGrid } from "../types/project-grid.js"
import {
  buildProjectGrid,
  getProjectCellByPosition,
} from "../utils/project/project-grid.js"

interface ProjectGridContextType {
  project?: Project
  workspaceNavigationGrid: ProjectGridGrid
  row: number
  col: number
}

export const ProjectGridContext = createContext<ProjectGridContextType>(
  {} as ProjectGridContextType,
)

// The React 19 / TypeScript 5.9 Fix
const Provider = ProjectGridContext as unknown as (props: {
  value: ProjectGridContextType
  children: ReactNode
}) => JSX.Element

interface ProjectGridProviderProps {
  children: ReactNode
  project: Project
  setPage: (page: Page) => void
  setProject: (project: Project | null) => void
}

export function ProjectGridProvider({
  children,
  project,
  setPage,
  setProject,
}: ProjectGridProviderProps) {
  const workspaceNavigationGrid = useMemo(
    () => buildProjectGrid(project),
    [project],
  )

  const { position } = useProjectGrid({
    grid: workspaceNavigationGrid,
    onExit: () => {
      setPage(Page.Workspace)
      setProject(null)
    },
    onSelect: (newRow, newCol) => {
      const cell = getProjectCellByPosition(
        workspaceNavigationGrid,
        newRow,
        newCol,
      )

      if (cell) {
        const command = getCommandFromCell(cell)
        const exec = getExecFromCell(cell)
        if (command && exec) {
          const keepTuiOpen = shouldKeepTuiOpen(exec)
          runCellCommand(command, project.path, { detached: keepTuiOpen })
          if (!keepTuiOpen) {
            setPage(Page.Exit)
          }
        }
      }
    },
  })

  return (
    <Provider
      value={{
        project,
        workspaceNavigationGrid,
        row: position.row,
        col: position.col,
      }}
    >
      {children}
    </Provider>
  )
}
