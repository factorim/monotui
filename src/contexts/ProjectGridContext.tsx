import {
  createContext,
  type JSX,
  type ReactNode,
  useContext,
  useMemo,
} from "react"
import { getConfig } from "../config/config.js"
import { useProjectGrid } from "../hooks/useProjectGrid.js"
import {
  addFacetQuickActionToConfigFile,
  deleteFacetQuickActionFromConfigFile,
  moveFacetQuickActionUpInConfigFile,
} from "../services/quick-actions/config-editor.js"
import {
  getCommandFromCell,
  getExecFromCell,
  runCellCommand,
  shouldKeepTuiOpen,
} from "../services/runner/command-runner.js"
import { Page } from "../types/page.js"
import type { ProjectGrid, ProjectGridCell } from "../types/project-grid.js"
import type { Project } from "../types/workspace.js"
import type { FacetQuickAction } from "../types/workspace-quick-actions.js"
import { formatFacetId } from "../utils/format.js"
import {
  buildProjectGrid,
  getProjectCellByPosition,
} from "../utils/project/project-grid.js"
import { NotificationContext } from "./NotificationContext.js"

interface ProjectGridContextType {
  project?: Project
  projectGrid: ProjectGrid
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
  const config = getConfig()
  const projectGrid = useMemo(() => buildProjectGrid(project), [project])
  const { notifyInfo, notifySuccess, notifyError } =
    useContext(NotificationContext)

  const toFacetQuickAction = (
    cell: ProjectGridCell,
  ): Omit<FacetQuickAction, "order"> | null => {
    switch (cell.type) {
      case "makefile":
        return {
          facetId: formatFacetId(cell.filepath, cell.command.name),
          facetType: "makefile",
          facetPath: cell.filepath,
          name: cell.command.name,
          command: cell.command.command,
          exec: cell.command.exec,
        }
      case "packageJson":
        return {
          facetId: formatFacetId(cell.filepath, cell.script.name),
          facetType: "packageJson",
          facetPath: cell.filepath,
          name: cell.script.name,
          command: cell.script.command,
          exec: cell.script.exec,
        }
      case "composeCommand":
        return {
          facetId: formatFacetId(cell.filepath, cell.action.name),
          facetType: "compose",
          facetPath: cell.filepath,
          name: cell.action.name,
          command: cell.action.command,
          exec: cell.action.command,
        }
      default:
        return null
    }
  }

  const toggleQuickAction = async (newRow: number, newCol: number) => {
    const cell = getProjectCellByPosition(projectGrid, newRow, newCol)
    if (!cell) return

    const facetQuickAction = toFacetQuickAction(cell)
    if (!facetQuickAction) {
      notifyInfo("Quick action toggle is not available for this cell")
      return
    }

    try {
      await deleteFacetQuickActionFromConfigFile(
        process.cwd(),
        project.path,
        facetQuickAction.facetId,
      )
      notifySuccess(`Removed quick action: ${facetQuickAction.name}`)
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      const isNotFound =
        message.includes("workspace not found") ||
        message.includes("facet not found")

      if (!isNotFound) {
        notifyError(
          `Failed to remove quick action: ${message || "Unknown error"}`,
        )
        return
      }
    }

    try {
      await addFacetQuickActionToConfigFile(
        process.cwd(),
        project.path,
        facetQuickAction,
      )
      notifySuccess(`Added quick action: ${facetQuickAction.name}`)
    } catch (error) {
      notifyError(
        `Failed to add quick action: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      )
    }
  }

  const orderQuickAction = async (newRow: number, newCol: number) => {
    const cell = getProjectCellByPosition(projectGrid, newRow, newCol)
    if (!cell) {
      return
    }

    const facetQuickAction = toFacetQuickAction(cell)
    if (!facetQuickAction) {
      return
    }

    try {
      await moveFacetQuickActionUpInConfigFile(
        process.cwd(),
        project.path,
        facetQuickAction.facetId,
      )
      notifySuccess(`Moved quick action: ${facetQuickAction.name}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      const isNotFound =
        message.includes("workspace not found") ||
        message.includes("facet not found")

      if (isNotFound) {
        return
      }

      notifyError(
        `Failed to reorder quick action: ${message || "Unknown error"}`,
      )
    }
  }

  const { position } = useProjectGrid({
    grid: projectGrid,
    onExit: () => {
      setPage(Page.Workspace)
      setProject(null)
    },
    onSelect: (newRow, newCol) => {
      const cell = getProjectCellByPosition(projectGrid, newRow, newCol)

      if (cell) {
        const command = getCommandFromCell(cell)
        const exec = getExecFromCell(cell)
        if (command && exec) {
          notifyInfo(`Running ${command} on ${project?.name}`)
          const keepTuiOpen = shouldKeepTuiOpen(exec)
          try {
            runCellCommand(command, project.path, config.execution?.runner, {
              detached: keepTuiOpen,
            })
          } catch (error) {
            notifyError(
              `Failed to run command: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            )
            return
          }

          if (!keepTuiOpen && config.execution?.runner === "shell") {
            setPage(Page.Exit)
          }
        }
      }
    },
    onToggle: (newRow, newCol) => {
      void toggleQuickAction(newRow, newCol)
    },
    onOrder: (newRow, newCol) => {
      void orderQuickAction(newRow, newCol)
    },
  })

  return (
    <Provider
      value={{
        project,
        projectGrid,
        row: position.row,
        col: position.col,
      }}
    >
      {children}
    </Provider>
  )
}
