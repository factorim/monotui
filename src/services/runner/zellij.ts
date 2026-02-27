import { spawn } from "node:child_process"
import { writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { logger } from "../../utils/logging/logger.js"
import { runClassicCommand } from "./classic.js"

export function runZellijCommand(
  command: string,
  cwd: string,
  options?: { detached?: boolean },
): void {
  if (!process.env.ZELLIJ) {
    logger.warn("Not in a zellij session, falling back to classic runner")
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
    { mode: 0o755 },
  )

  const child = spawn(
    "zellij",
    [
      "action",
      "new-pane",
      "--direction",
      "down",
      "--cwd",
      cwd,
      "--",
      scriptPath,
    ],
    {
      detached: true,
      stdio: "ignore",
    },
  )

  child.unref()

  child.on("error", (error) => {
    logger.error(error, "Failed to open zellij pane, falling back to classic")
    runClassicCommand(command, cwd, options)
  })
}
