import { spawn } from "node:child_process"

export function runShellCommand(
  command: string,
  cwd: string,
  options?: { detached?: boolean },
): void {
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

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false)
  }

  spawn(command, {
    cwd,
    stdio: "inherit",
    shell: true,
  })
}
