import { createContext, type JSX, type ReactNode, useMemo } from "react"

import { useWorkspaceGrid } from "../hooks/useWorkspaceGrid.js"
import {
  runCellCommand,
  shouldKeepTuiOpen,
} from "../services/runtime/command-runner.js"
import { Page } from "../types/page.js"
import type { Project } from "../types/workspace.js"
import type { CursorPosition } from "../types/workspace-grid.js"
import type { WorkspaceQuickAction } from "../types/workspace-quick-actions.js"
import type { WorkspaceRuntimeState } from "../types/workspace-runtime.js"
import { logger } from "../utils/logging/logger.js"
import {
  buildWorkspacesGrid,
  getWorkspaceCellByPosition,
} from "../utils/workspace/workspace-grid.js"

interface WorkspaceGridContextType {
  projects?: Project[]
  workspaceQuickActions?: WorkspaceQuickAction[]
  workspaceRuntimes?: WorkspaceRuntimeState[]
  workspacesNavigationGrid: ReturnType<typeof buildWorkspacesGrid>
  row: number
  col: number
}

export const WorkspaceGridContext = createContext<WorkspaceGridContextType>(
  {} as WorkspaceGridContextType,
)

// The Type-Safe Provider Fix
const Provider = WorkspaceGridContext as unknown as (props: {
  value: WorkspaceGridContextType
  children: ReactNode
}) => JSX.Element

interface WorkspacesNavigationProviderProps {
  children: ReactNode
  projects: Project[]
  workspaceQuickActions?: WorkspaceQuickAction[]
  workspaceRuntimes: WorkspaceRuntimeState[]
  initialPosition?: CursorPosition
  setPage: (page: Page) => void
  setProject: (workspace: Project | null) => void
  onPositionChange?: (position: CursorPosition) => void
}

export function WorkspacesNavigationProvider({
  children,
  projects,
  workspaceQuickActions,
  workspaceRuntimes,
  initialPosition,
  setPage,
  setProject,
  onPositionChange,
}: WorkspacesNavigationProviderProps) {
  const workspacesNavigationGrid = useMemo(
    () =>
      buildWorkspacesGrid(
        projects,
        workspaceQuickActions ?? [],
        workspaceRuntimes,
      ),
    [projects, workspaceQuickActions, workspaceRuntimes],
  )

  const { position } = useWorkspaceGrid({
    grid: workspacesNavigationGrid,
    initialPosition,
    onSelect: (newRow, newCol) => {
      const selectedCell = getWorkspaceCellByPosition(
        workspacesNavigationGrid,
        newRow,
        newCol,
      )

      logger.debug(`Selected position: Row ${newRow}, Col ${newCol}`)
      onPositionChange?.({ row: newRow, col: newCol })

      if (selectedCell?.type === "workspace") {
        setPage(Page.Project)
        setProject(selectedCell.workspace)
      } else if (selectedCell?.type === "quickAction") {
        const workspace = projects[newRow]
        const command = selectedCell.action.command
        const keepTuiOpen = shouldKeepTuiOpen(selectedCell.action.exec)
        runCellCommand(command, workspace.path, { detached: keepTuiOpen })
        if (!keepTuiOpen) {
          setPage(Page.Exit)
        }
      } else {
        console.warn("No workspace cell found at the selected position")
      }
    },
  })

  return (
    <Provider
      value={{
        projects,
        workspaceQuickActions,
        workspaceRuntimes,
        workspacesNavigationGrid,
        row: position.row,
        col: position.col,
      }}
    >
      {children}
    </Provider>
  )
}
