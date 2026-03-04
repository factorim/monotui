import { execFileSync } from "node:child_process"

import { logger } from "../../utils/logging/logger.js"
import { runShellCommand } from "./shell.js"

export function runTmuxCommand(
  command: string,
  cwd: string,
  options?: { detached?: boolean },
): void {
  if (!process.env.TMUX) {
    logger.warn("Not in a tmux session, falling back to shell runner")
    runShellCommand(command, cwd, options)
    return
  }

  try {
    const paneId = execFileSync(
      "tmux",
      ["split-window", "-v", "-l", "25%", "-c", cwd, "-P", "-F", "#{pane_id}"],
      { encoding: "utf8" },
    ).trim()

    if (!paneId) {
      throw new Error("Failed to create tmux pane")
    }

    execFileSync("tmux", ["send-keys", "-t", paneId, "-l", command], {
      stdio: "ignore",
    })
    execFileSync("tmux", ["send-keys", "-t", paneId, "Enter"], {
      stdio: "ignore",
    })
  } catch (error) {
    logger.error(
      `Failed to run command in tmux pane: ${error instanceof Error ? error.message : String(error)}`,
    )
    runShellCommand(command, cwd, options)
  }
}
