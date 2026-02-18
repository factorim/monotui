import type {
  ComposeService,
  MakefileCommand,
  PackageJsonScript,
} from "./workspace.js"

export type ProjectGridGrid = {
  packageJsonCells: PackageJsonCell[]
  composeCommandCells: ComposeCommandCell[]
  composeServiceCells: ComposeServiceCell[]
  makefileCells: MakefileCell[]
  maxCol: number
}

export type ProjectGridCell =
  | PackageJsonCell
  | ComposeCommandCell
  | ComposeServiceCell
  | MakefileCell

export interface PackageJsonCell {
  type: "packageJson"
  filepath: string
  row: number
  col: number
  script: PackageJsonScript
}

export interface ComposeCommandCell {
  type: "composeCommand"
  filepath: string
  row: number
  col: number
  action: ComposeCommand
}

export interface ComposeServiceCell {
  type: "composeService"
  filepath: string
  row: number
  col: number
  service: ComposeService
}

export const COMPOSE_COMMANDS = [
  "up",
  "up -d",
  "down",
  "build",
  "stop",
  "logs",
] as const

export type ComposeCommandName = (typeof COMPOSE_COMMANDS)[number]

export interface ComposeCommand {
  name: ComposeCommandName
  command: string
}

export interface MakefileCell {
  type: "makefile"
  filepath: string
  row: number
  col: number
  command: MakefileCommand
}

// Simple navigation
export interface NavigationPosition {
  row: number
  col: number
}
