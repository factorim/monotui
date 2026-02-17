import { type Key, useApp, useInput } from "ink"
import { useState } from "react"
import {
  stopComposeService,
  stopScriptProcess,
} from "../services/runtime/stop-runtime.js"
import type {
  CursorPosition,
  WorkspacesNavigationCell,
  WorkspacesNavigationGrid,
} from "../types/workspace-grid.js"
import { findNextPosition } from "../utils/navigation/navigation-helper.js"
import { getWorkspaceCellByPosition } from "../utils/workspace/workspace-grid.js"

interface UseNavigationOptions {
  grid: WorkspacesNavigationGrid
  initialPosition?: CursorPosition
  onSelect?: (row: number, col: number) => void
}

export function useWorkspaceGrid({
  grid,
  initialPosition,
  onSelect,
}: UseNavigationOptions) {
  const { exit } = useApp()
  const [position, setPosition] = useState<CursorPosition>(
    initialPosition ?? { row: 0, col: 0 },
  )

  useInput((input: string, key: Key) => {
    if (key.upArrow) {
      const next = findNextPosition(grid, position, "up")
      setPosition(next)
    }
    if (key.downArrow) {
      const next = findNextPosition(grid, position, "down")
      setPosition(next)
    }
    if (key.leftArrow) {
      const next = findNextPosition(grid, position, "left")
      setPosition(next)
    }
    if (key.rightArrow) {
      const next = findNextPosition(grid, position, "right")
      setPosition(next)
    }
    if (key.return && onSelect) {
      onSelect(position.row, position.col)
    }
    // Handle 's' key to stop/kill
    if (input === "s" && !key.ctrl && !key.meta && !key.shift) {
      const cell = getWorkspaceCellByPosition(grid, position.row, position.col)
      stopWorkspaceCell(cell)
    }
    // Helper to stop a running workspace cell (script or service)
    function stopWorkspaceCell(cell: WorkspacesNavigationCell | null) {
      if (
        !cell ||
        cell.type !== "runtime" ||
        cell.runState.status !== "running"
      )
        return

      // Optimistically reflect stopping state in the UI
      cell.runState.status = "stopping"
      setPosition((current) => ({ ...current }))

      const runState = cell.runState
      if (runState.type === "script") {
        stopScriptProcess(runState)
      } else if (runState.type === "service") {
        stopComposeService(runState)
      }
    }

    if (key.escape) {
      exit()
    }
  })

  return {
    position,
  }
}
