import { describe, expect, it } from "@jest/globals"

import { COMPOSE_COMMANDS } from "../../types/project-grid.js"
import type { Project } from "../../types/workspace.js"
import {
  buildProjectGrid,
  getCellLabel,
  getCellsByColumn,
  getMaxRows,
  getProjectCellByPosition,
} from "./project-grid.js"

function createProject(overrides: Partial<Project> = {}): Project {
  return {
    name: "api",
    type: "app",
    folder: "api",
    path: "apps/api",
    absolutePath: "/repo/apps/api",
    facets: {},
    ...overrides,
  }
}

describe("project-grid utils", () => {
  it("builds grid with dynamic columns for all available facets", () => {
    const project = createProject({
      facets: {
        makefile: {
          type: "makefile",
          filename: "Makefile",
          path: "apps/api/Makefile",
          commands: [{ name: "dev", command: "make dev", exec: "pnpm dev" }],
        },
        packageJson: {
          type: "packageJson",
          filename: "package.json",
          path: "apps/api/package.json",
          name: "@factorim/api",
          packageManager: "pnpm",
          scripts: [
            { name: "dev", command: "pnpm run dev", exec: "vite", port: 5173 },
            { name: "test", command: "pnpm run test", exec: "jest" },
          ],
        },
        compose: {
          type: "compose",
          filename: "docker-compose.yml",
          path: "apps/api/docker-compose.yml",
          services: [{ name: "db", image: "postgres:16", ports: [5432] }],
        },
      },
    })

    const grid = buildProjectGrid(project)

    expect(grid.maxCol).toBe(2)
    expect(grid.makefileCells).toHaveLength(1)
    expect(grid.makefileCells[0]?.col).toBe(0)
    expect(grid.makefileCells[0]?.filepath).toBe("apps/api/Makefile")

    expect(grid.packageJsonCells).toHaveLength(2)
    expect(grid.packageJsonCells[0]?.col).toBe(1)
    expect(grid.packageJsonCells[1]?.row).toBe(1)

    expect(grid.composeCommandCells).toHaveLength(COMPOSE_COMMANDS.length)
    expect(grid.composeCommandCells[0]?.col).toBe(2)
    expect(grid.composeServiceCells).toHaveLength(1)
    expect(grid.composeServiceCells[0]?.row).toBe(COMPOSE_COMMANDS.length)
  })

  it("shifts columns when makefile facet is missing", () => {
    const project = createProject({
      facets: {
        packageJson: {
          type: "packageJson",
          filename: "package.json",
          path: "apps/api/package.json",
          name: "@factorim/api",
          packageManager: "pnpm",
          scripts: [{ name: "dev", command: "pnpm run dev", exec: "vite" }],
        },
        compose: {
          type: "compose",
          filename: "docker-compose.yml",
          path: "apps/api/docker-compose.yml",
          services: [{ name: "redis", image: "redis:7" }],
        },
      },
    })

    const grid = buildProjectGrid(project)

    expect(grid.maxCol).toBe(1)
    expect(grid.makefileCells).toHaveLength(0)
    expect(grid.packageJsonCells[0]?.col).toBe(0)
    expect(grid.composeCommandCells[0]?.col).toBe(1)
    expect(grid.composeServiceCells[0]?.col).toBe(1)
  })

  it("returns empty grid when no facets are present", () => {
    const grid = buildProjectGrid(createProject())

    expect(grid.makefileCells).toHaveLength(0)
    expect(grid.packageJsonCells).toHaveLength(0)
    expect(grid.composeCommandCells).toHaveLength(0)
    expect(grid.composeServiceCells).toHaveLength(0)
    expect(grid.maxCol).toBe(0)
  })

  it("finds cells by position and returns null when absent", () => {
    const project = createProject({
      facets: {
        packageJson: {
          type: "packageJson",
          filename: "package.json",
          path: "apps/api/package.json",
          name: "@factorim/api",
          packageManager: "pnpm",
          scripts: [{ name: "dev", command: "pnpm run dev", exec: "vite" }],
        },
      },
    })

    const grid = buildProjectGrid(project)

    expect(getProjectCellByPosition(grid, 0, 0)?.type).toBe("packageJson")
    expect(getProjectCellByPosition(grid, 99, 99)).toBeNull()
  })

  it("computes max rows and filters cells by column", () => {
    const project = createProject({
      facets: {
        makefile: {
          type: "makefile",
          filename: "Makefile",
          path: "apps/api/Makefile",
          commands: [{ name: "dev", command: "make dev", exec: "pnpm dev" }],
        },
        compose: {
          type: "compose",
          filename: "docker-compose.yml",
          path: "apps/api/docker-compose.yml",
          services: [{ name: "db" }, { name: "redis" }],
        },
      },
    })

    const grid = buildProjectGrid(project)

    expect(getMaxRows(grid)).toBe(COMPOSE_COMMANDS.length + 2)
    const composeColumn = getCellsByColumn(grid, 1)
    expect(composeColumn).toHaveLength(COMPOSE_COMMANDS.length + 2)
    expect(composeColumn.every((cell) => cell.col === 1)).toBe(true)
  })

  it("formats a readable label for a cell", () => {
    const project = createProject({
      facets: {
        makefile: {
          type: "makefile",
          filename: "Makefile",
          path: "apps/api/Makefile",
          commands: [{ name: "dev", command: "make dev", exec: "pnpm dev" }],
        },
      },
    })

    const grid = buildProjectGrid(project)
    const cell = grid.makefileCells[0]

    expect(cell).toBeDefined()
    expect(getCellLabel(cell)).toBe("Makefile - apps/api/Makefile")
  })
})
