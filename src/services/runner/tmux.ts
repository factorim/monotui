import { spawn } from "node:child_process"
import { writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { logger } from "../../utils/logging/logger.js"
import { runClassicCommand } from "./classic.js"

export function runTmuxCommand(
  command: string,
  cwd: string,
  options?: { detached?: boolean },
): void {
  if (!process.env.TMUX) {
    logger.warn("Not in a tmux session, falling back to classic runner")
    runClassicCommand(command, cwd, options)
    return
  }

  const shell = process.env.SHELL || "sh"

  // Write command to a temp script so quoting and env vars are not an issue.
  // After the command exits (or is killed), exec into a live shell so the pane stays open.
  const scriptPath = join(tmpdir(), `monotui-${Date.now()}.sh`)
  writeFileSync(
    scriptPath,
    `#!/bin/sh\ntrap '' INT\n${command}\nexec ${shell}\n`,
    {
      mode: 0o755,
    },
  )

  spawn(
    "tmux",
    [
      "split-window",
      "-v",
      "-l",
      "25%",
      "-c",
      cwd,
      shell,
      "-c",
      `${scriptPath}; exec ${shell}`,
    ],
    {
      detached: true,
      stdio: "ignore",
    },
  ).unref()
}
