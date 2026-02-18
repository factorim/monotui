import { execFile } from "node:child_process"
import { promisify } from "node:util"

import type { PackageJsonScript } from "../../types/workspace.js"
import type { RunState } from "../../types/workspace-runtime.js"

const execFileAsync = promisify(execFile)

async function sh(cmd: string, args: string[], opts?: { cwd?: string }) {
  const { stdout } = await execFileAsync(cmd, args, {
    cwd: opts?.cwd,
    maxBuffer: 10 * 1024 * 1024,
  })
  return String(stdout ?? "")
}

async function getPsOutput(): Promise<string> {
  // Try GNU procps first
  try {
    // Include both command and working directory
    return await sh("ps", ["-eo", "pid=,args=,cwd="])
  } catch {
    // Fallback: BSD / busybox style
    // BSD ps doesn't have cwd, so we'll need to read it from /proc later
    return await sh("ps", ["ax", "-o", "pid=", "-o", "command="])
  }
}

async function getPidCwd(pid: number): Promise<string | null> {
  try {
    // On Linux, read the cwd symlink
    const cwd = await sh("readlink", ["-f", `/proc/${pid}/cwd`])
    return cwd.trim()
  } catch {
    return null
  }
}

function extractCoreCommand(command: string): string {
  // Remove common package managers and extract the actual command
  const trimmed = command.trim()

  // Strip npm/yarn/pnpm run prefix
  const withoutPkgManager = trimmed
    .replace(/^(npm|yarn|pnpm|bun)\s+run\s+/, "")
    .replace(/^(npx|bunx)\s+/, "")

  // Get the first significant part (the actual executable/script)
  // e.g., "next dev --turbo -p 3001" -> "next dev"
  // e.g., "vite --port 5173" -> "vite"
  const parts = withoutPkgManager.split(/\s+/)

  // Take first 1-2 parts depending on common patterns
  if (
    parts.length >= 2 &&
    (parts[1] === "dev" ||
      parts[1] === "start" ||
      parts[1] === "serve" ||
      parts[1] === "preview")
  ) {
    return `${parts[0]} ${parts[1]}`
  }

  return parts[0] || withoutPkgManager
}

async function getPidsMatchingCommandInWorkspace(params: {
  command: string
  absolutePath: string
}): Promise<number[]> {
  const out = await getPsOutput()

  // Extract core command for more flexible matching
  const coreCommand = extractCoreCommand(params.command)
  const wsNeedle = params.absolutePath.trim()
  const pids: number[] = []

  for (const line of out.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Parse pid and command
    const firstSpace = trimmed.indexOf(" ")
    if (firstSpace <= 0) continue

    const pidStr = trimmed.slice(0, firstSpace).trim()
    const rest = trimmed.slice(firstSpace + 1)

    const pid = Number(pidStr)
    if (!Number.isFinite(pid)) continue

    // Check if command matches the core command
    // This allows "next dev --turbo" to match "next dev --turbopack -p 3001"
    if (!rest.includes(coreCommand)) continue

    // Check if the command line includes the workspace path OR
    // check if the process cwd is within the workspace
    if (rest.includes(wsNeedle)) {
      pids.push(pid)
    } else {
      // Fallback: check the process working directory
      const cwd = await getPidCwd(pid)
      if (cwd?.startsWith(wsNeedle)) {
        pids.push(pid)
      }
    }
  }

  return Array.from(new Set(pids))
}

type PidToPorts = Map<number, Set<number>>

function parseSsListeningTcp(out: string): PidToPorts {
  const pidToPorts: PidToPorts = new Map()

  for (const rawLine of out.split("\n")) {
    const line = rawLine.trim()
    if (!line) continue

    // Grab a port from "*:3000", "127.0.0.1:5173", "[::]:3000", etc.
    // This is a heuristic that works for typical `ss -lptnH` output.
    const portMatch = line.match(/:(\d+)\s+/)
    if (!portMatch) continue
    const port = Number(portMatch[1])
    if (!Number.isFinite(port)) continue

    // Extract pids from users:(("...",pid=123,...),(...pid=456...))
    const pidMatches = line.matchAll(/pid=(\d+)/g)
    for (const m of pidMatches) {
      const pid = Number(m[1])
      if (!Number.isFinite(pid)) continue

      if (!pidToPorts.has(pid)) pidToPorts.set(pid, new Set())
      pidToPorts.get(pid)?.add(port)
    }
  }

  return pidToPorts
}

async function getListeningPortsForPids(
  pids: number[],
): Promise<Map<number, number[]>> {
  if (pids.length === 0) return new Map()

  const ssOut = await sh("ss", ["-lptnH"])
  const pidToPortsSet = parseSsListeningTcp(ssOut)

  const pidToPorts = new Map<number, number[]>()
  for (const pid of pids) {
    const ports = pidToPortsSet.get(pid)
    pidToPorts.set(pid, ports ? Array.from(ports).sort((a, b) => a - b) : [])
  }
  return pidToPorts
}

async function getChildPids(parentPid: number): Promise<number[]> {
  try {
    const out = await sh("pgrep", ["-P", String(parentPid)])
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(Number)
      .filter(Number.isFinite)
  } catch {
    return []
  }
}

async function getAllDescendantPids(pid: number): Promise<number[]> {
  const descendants: number[] = [pid]
  const children = await getChildPids(pid)

  for (const child of children) {
    const childDescendants = await getAllDescendantPids(child)
    descendants.push(...childDescendants)
  }

  return descendants
}

export async function getNodeRunStates(
  absolutePath: string,
  workspacePath: string,
  scripts: PackageJsonScript[],
): Promise<RunState[]> {
  const results: RunState[] = []

  for (const script of scripts) {
    const name = script.name as string
    const command = script.command as string

    const pids = await getPidsMatchingCommandInWorkspace({
      command,
      absolutePath,
    })

    // Get all descendant processes
    const allPids = new Set<number>()
    for (const pid of pids) {
      const descendants = await getAllDescendantPids(pid)
      descendants.forEach((p) => {
        allPids.add(p)
      })
    }

    const allPidsArray = Array.from(allPids)
    const pidToPorts = await getListeningPortsForPids(allPidsArray)

    const allPorts = new Set<number>()
    for (const ports of pidToPorts.values()) {
      for (const p of ports) allPorts.add(p)
    }

    const portsSorted = Array.from(allPorts).sort((a, b) => a - b)

    let status: RunState["status"] = "stopped"
    let port: number | undefined
    let statusMessage: string | undefined

    if (pids.length === 0) {
      status = "stopped"
    } else {
      status = "running"
      if (portsSorted.length === 1) {
        port = portsSorted[0]
      } else if (portsSorted.length > 1) {
        status = "conflict"
        statusMessage = `Multiple listening ports detected: ${portsSorted.join(
          ", ",
        )} (pids: ${allPidsArray.join(", ")})`
      } else {
        statusMessage = `Process running (pids: ${allPidsArray.join(
          ", ",
        )}) but no LISTEN TCP port detected`
      }
    }

    results.push({
      id: `${workspacePath}::packageJson::${name}`,
      name,
      type: "script",
      status,
      statusMessage,
      command,
      port,
    })
  }

  return results
}
