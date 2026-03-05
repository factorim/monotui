import { execFileSync } from "node:child_process"

import { logger } from "../../utils/logging/logger.js"
import { runShellCommand } from "./shell.js"

export function runZellijCommand(
  command: string,
  cwd: string,
  options?: { detached?: boolean },
): void {
  if (!process.env.ZELLIJ) {
    logger.warn("Not in a zellij session, falling back to shell runner")
    runShellCommand(command, cwd, options)
    return
  }

  try {
    execFileSync(
      "zellij",
      ["action", "new-pane", "--direction", "down", "--cwd", cwd],
      {
        stdio: "ignore",
      },
    )

    execFileSync("zellij", ["action", "write-chars", command], {
      stdio: "ignore",
    })
    execFileSync("zellij", ["action", "write", "10"], {
      stdio: "ignore",
    })
  } catch (error) {
    logger.error(
      `Failed to run command in zellij pane: ${error instanceof Error ? error.message : String(error)}`,
    )
    runShellCommand(command, cwd, options)
  }
}
