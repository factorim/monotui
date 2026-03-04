import { execFileSync } from "node:child_process"

import { logger } from "../../utils/logging/logger.js"
import { runShellCommand } from "./shell.js"

function tmux(args: string[]): string {
  return execFileSync("tmux", args, { encoding: "utf8" }).trim()
}

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

  let originalPaneId: string | null = null

  try {
    originalPaneId = tmux(["display-message", "-p", "#{pane_id}"])

    // Pick the bottom-most pane in the current window.
    // If multiple share the same bottom edge, pick the one with the greatest top (lowest on screen).
    const paneLines = tmux([
      "list-panes",
      "-F",
      "#{pane_bottom} #{pane_top} #{pane_id}",
    ])
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const panes = paneLines
      .map((line) => {
        const [bottomStr, topStr, paneId] = line.split(/\s+/)
        return { bottom: Number(bottomStr), top: Number(topStr), paneId }
      })
      .filter(
        (p) => p.paneId && Number.isFinite(p.bottom) && Number.isFinite(p.top),
      )
      .sort((a, b) => b.bottom - a.bottom || b.top - a.top)

    const bottomPaneId = panes[0]?.paneId
    if (!bottomPaneId) throw new Error("Failed to determine bottom tmux pane")

    // Split the bottom-most pane, and place the new pane "after" it (default = below for -v)
    // IMPORTANT: do NOT use -b here, because -b would create the new pane above.
    const newPaneId = tmux([
      "split-window",
      "-v",
      "-l",
      "50%",
      "-c",
      cwd,
      "-t",
      bottomPaneId,
      "-d", // keep focus where it is
      "-P",
      "-F",
      "#{pane_id}",
    ])

    if (!newPaneId) throw new Error("Failed to create tmux pane")

    execFileSync("tmux", ["send-keys", "-t", newPaneId, "-l", command], {
      stdio: "ignore",
    })
    execFileSync("tmux", ["send-keys", "-t", newPaneId, "Enter"], {
      stdio: "ignore",
    })

    // Safety: ensure focus returns to TUI pane
    if (originalPaneId) {
      execFileSync("tmux", ["select-pane", "-t", originalPaneId], {
        stdio: "ignore",
      })
    }
  } catch (error) {
    logger.error(
      `Failed to run command in tmux pane: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )

    if (originalPaneId) {
      try {
        execFileSync("tmux", ["select-pane", "-t", originalPaneId], {
          stdio: "ignore",
        })
      } catch {
        // ignore focus restore failures
      }
    }

    runShellCommand(command, cwd, options)
  }
}
