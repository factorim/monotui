import { exit } from "node:process"
import { type Key, useInput } from "ink"
import { useState } from "react"
import type { ProjectGrid } from "../types/project-grid.js"
import type { CursorPosition } from "../types/workspace-grid.js"
import { getCellsByColumn } from "../utils/project/project-grid.js"

interface UseNavigationOptions {
  grid: ProjectGrid
  onSelect?: (row: number, col: number) => void
  onExit?: () => void
}

export function useProjectGrid({
  grid,
  onSelect,
  onExit,
}: UseNavigationOptions) {
  const [position, setPosition] = useState<CursorPosition>({ row: 0, col: 0 })

  const maxCol = grid.maxCol

  const getMaxRowForCol = (col: number): number => {
    const cells = getCellsByColumn(grid, col)
    return cells.length > 0 ? cells.length - 1 : 0
  }

  useInput((_input: string, key: Key) => {
    if (key.upArrow) {
      setPosition((prev) => {
        const maxRow = getMaxRowForCol(prev.col)
        const newRow = prev.row - 1 < 0 ? maxRow : prev.row - 1
        return { ...prev, row: newRow }
      })
    }
    if (key.downArrow) {
      setPosition((prev) => {
        const maxRow = getMaxRowForCol(prev.col)
        const newRow = prev.row + 1 > maxRow ? 0 : prev.row + 1
        return { ...prev, row: newRow }
      })
    }
    if (key.leftArrow) {
      if (position.col - 1 < 0) {
        onExit?.()
      } else {
        setPosition((prev) => {
          const newCol = prev.col - 1
          const maxRow = getMaxRowForCol(newCol)
          const newRow = Math.min(prev.row, maxRow)
          return { row: newRow, col: newCol }
        })
      }
    }
    if (key.rightArrow) {
      setPosition((prev) => {
        if (prev.col + 1 > maxCol) {
          return prev
        }
        const newCol = prev.col + 1
        const maxRow = getMaxRowForCol(newCol)
        const newRow = Math.min(prev.row, maxRow)
        return { row: newRow, col: newCol }
      })
    }
    if (key.return && onSelect) {
      onSelect(position.row, position.col)
    }
    if (key.escape) {
      exit()
    }
  })

  return {
    position,
  }
}
