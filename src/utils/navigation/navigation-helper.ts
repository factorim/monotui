import type { WorkspacesNavigationGrid } from "../../types/workspace-grid.js"

interface QuickActionLikeCell {
  action: {
    name: string
  }
}

export function findNextPosition(
  grid: WorkspacesNavigationGrid,
  position: { row: number; col: number },
  direction: "up" | "down" | "left" | "right",
): { row: number; col: number } {
  const numRows = grid.length
  const numCols = grid[0]?.cells.length || 0
  const { row, col } = position

  function isValid(r: number, c: number) {
    const navRow = grid[r]
    return (
      r >= 0 &&
      r < numRows &&
      c >= 0 &&
      c < (navRow?.cells.length || 0) &&
      navRow?.cells[c] !== null &&
      navRow?.cells[c] !== undefined
    )
  }

  let nextRow = row
  let nextCol = col
  let found = false
  let attempts = 0
  const maxAttempts = numRows * numCols

  while (!found && attempts < maxAttempts) {
    switch (direction) {
      case "up":
        nextRow = (nextRow - 1 + numRows) % numRows
        break
      case "down":
        nextRow = (nextRow + 1) % numRows
        break
      case "left":
        nextCol = (nextCol - 1 + numCols) % numCols
        break
      case "right":
        nextCol = (nextCol + 1) % numCols
        break
    }
    if (isValid(nextRow, nextCol)) {
      found = true
    } else {
      // If moving left/right, stay in the same row; if up/down, stay in the same col
      if (direction === "left" || direction === "right") {
        // wrap around row if needed
        if (nextCol === col) break
      } else {
        if (nextRow === row) break
      }
    }
    attempts++
  }

  return { row: nextRow, col: nextCol }
}

/**
 * Returns max text width for each quick-action column index across all rows.
 */
export function getQuickActionColumnMaxSizes(
  quickActionRows: QuickActionLikeCell[][],
): number[] {
  const maxSizes: number[] = []

  for (const row of quickActionRows) {
    row.forEach((cell, index) => {
      const width = cell.action.name.length
      maxSizes[index] = Math.max(maxSizes[index] ?? 0, width)
    })
  }

  return maxSizes
}
