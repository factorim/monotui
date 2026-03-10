import { describe, expect, it } from "@jest/globals"

import type {
  WorkspaceQuickActionCell,
  WorkspacesNavigationGrid,
} from "../../types/workspace-grid.js"
import {
  findNextPosition,
  getQuickActionColumnMaxSizes,
} from "./navigation-helper.js"

function quickActionCell(
  row: number,
  col: number,
  name: string,
): WorkspaceQuickActionCell {
  return {
    type: "quickAction",
    row,
    col,
    action: {
      facetId: `apps/${name}:${name}`,
      facetType: "packageJson",
      facetPath: `apps/${name}`,
      name,
      command: `pnpm run ${name}`,
      exec: name,
    },
  }
}

function makeGrid(): WorkspacesNavigationGrid {
  return [
    {
      id: "row-0",
      cells: [quickActionCell(0, 0, "a"), null, quickActionCell(0, 2, "ccc")],
    },
    {
      id: "row-1",
      cells: [quickActionCell(1, 0, "bb"), quickActionCell(1, 1, "d"), null],
    },
    {
      id: "row-2",
      cells: [null, quickActionCell(2, 1, "eeee"), quickActionCell(2, 2, "f")],
    },
  ]
}

describe("navigation-helper", () => {
  describe("findNextPosition", () => {
    it("moves right and skips null cells", () => {
      const grid = makeGrid()

      const next = findNextPosition(grid, { row: 0, col: 0 }, "right")

      expect(next).toEqual({ row: 0, col: 2 })
    })

    it("wraps right navigation to the first valid cell", () => {
      const grid = makeGrid()

      const next = findNextPosition(grid, { row: 0, col: 2 }, "right")

      expect(next).toEqual({ row: 0, col: 0 })
    })

    it("moves down and skips invalid rows for the same column", () => {
      const grid = makeGrid()

      const next = findNextPosition(grid, { row: 0, col: 2 }, "down")

      expect(next).toEqual({ row: 2, col: 2 })
    })

    it("returns current position if no other valid cell exists in row traversal", () => {
      const grid: WorkspacesNavigationGrid = [
        { id: "row-0", cells: [quickActionCell(0, 0, "only"), null, null] },
      ]

      const next = findNextPosition(grid, { row: 0, col: 0 }, "right")

      expect(next).toEqual({ row: 0, col: 0 })
    })
  })

  describe("getQuickActionColumnMaxSizes", () => {
    it("returns max text width per quick-action column", () => {
      const rows = [
        [quickActionCell(0, 0, "short"), quickActionCell(0, 1, "xx")],
        [quickActionCell(1, 0, "very-long-name"), quickActionCell(1, 1, "mid")],
        [quickActionCell(2, 0, "tiny")],
      ]

      const sizes = getQuickActionColumnMaxSizes(rows)

      expect(sizes).toEqual([14, 3])
    })

    it("returns empty array for empty input", () => {
      expect(getQuickActionColumnMaxSizes([])).toEqual([])
    })
  })
})
