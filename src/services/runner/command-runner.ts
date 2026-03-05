import type { ProjectGridCell } from "../../types/project-grid.js"
import { runShellCommand } from "./shell.js"
import { runTmuxCommand } from "./tmux.js"
import { runZellijCommand } from "./zellij.js"
/**
 * Extracts the shell command string from a navigation cell.
 */
export function getCommandFromCell(cell: ProjectGridCell): string | null {
  switch (cell.type) {
    case "makefile":
      return cell.command.command
    case "packageJson":
      return cell.script.command
    case "composeCommand":
      return cell.action.command
    case "composeService":
      return null
  }
}

/**
 * Extracts the shell command string from a navigation cell.
 */
export function getExecFromCell(cell: ProjectGridCell): string | null {
  switch (cell.type) {
    case "makefile":
      return cell.command.exec
    case "packageJson":
      return cell.script.exec
    case "composeCommand":
      return cell.action.command
  }
  return null
}

export function runCellCommand(
  command: string,
  cwd: string,
  runner: "shell" | "tmux" | "zellij" = "shell",
  options?: { detached?: boolean },
): void {
  if (!command) {
    return
  }

  if (options?.detached) {
    runShellCommand(command, cwd, options)
    return
  }

  switch (runner) {
    case "zellij":
      runZellijCommand(command, cwd, options)
      return
    case "tmux":
      runTmuxCommand(command, cwd, options)
      return
    default:
      runShellCommand(command, cwd, options)
  }
}

/**
 * Returns true when a command is expected to detach
 */
export function shouldKeepTuiOpen(command: string): boolean {
  const normalized = command.trim().toLowerCase()
  if (!normalized) {
    return false
  }

  const isDockerCompose = /\bdocker(?:\s+compose|\s+-compose)\b/.test(
    normalized,
  )
  const isUpCommand = /\bup\b/.test(normalized)
  const isDownOrStopCommand = /\b(down|stop)\b/.test(normalized)
  const isDetached = /(^|\s)(-d|--detach)(\s|$)/.test(normalized)

  return isDockerCompose && ((isUpCommand && isDetached) || isDownOrStopCommand)
}
