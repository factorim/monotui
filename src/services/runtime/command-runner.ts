import { spawn } from "node:child_process"

import type { ProjectGridCell } from "../../types/project-grid"

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
  options?: { detached?: boolean },
): void {
  if (!command) {
    return
  }

  const detached = options?.detached ?? false

  if (detached) {
    const child = spawn(command, {
      cwd,
      shell: true,
      detached: true,
      stdio: "ignore",
    })
    child.unref()
    return
  }

  // Restore terminal to cooked mode so the TTY driver handles Ctrl+C → SIGINT
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
  }

  spawn(command, {
    cwd,
    stdio: "inherit",
    shell: true,
  })
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
