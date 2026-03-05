import { readlink } from "node:fs/promises"

import { pidToPorts } from "pid-port"
import pidtree from "pidtree"
import psList, { type ProcessDescriptor } from "ps-list"

import type { PackageJsonScript } from "../../types/workspace.js"
import type { RunState } from "../../types/workspace-runtime.js"

const CURRENT_UID =
  typeof process.getuid === "function" ? process.getuid() : undefined

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function buildCommandMatchers(command: string): RegExp[] {
  const normalized = normalizeSpaces(command)
  const matchers: RegExp[] = []

  if (normalized) {
    const exactPattern = normalized
      .split(" ")
      .map((part) => escapeRegExp(part))
      .join("\\s+")
    matchers.push(new RegExp(`(^|[\\s"'=/])${exactPattern}($|[\\s"'])`))
  }

  const runMatch = normalized.match(
    /^(npm|pnpm|yarn|bun)\s+(?:--\S+\s+)*run\s+([^\s]+)/,
  )
  if (runMatch) {
    const packageManager = escapeRegExp(runMatch[1])
    const scriptName = escapeRegExp(runMatch[2])

    matchers.push(
      new RegExp(
        `(^|[\\s"'=/])${packageManager}\\s+(?:--\\S+\\s+)*run\\s+${scriptName}($|[\\s"'])`,
      ),
    )

    if (runMatch[1] === "pnpm" || runMatch[1] === "yarn") {
      matchers.push(
        new RegExp(
          `(^|[\\s"'=/])${packageManager}\\s+(?:--\\S+\\s+)*${scriptName}($|[\\s"'])`,
        ),
      )
    }
  }

  return matchers
}

function isWorkspaceRelatedPath(
  processCwd: string,
  workspacePath: string,
): boolean {
  const normalize = (value: string) => value.replace(/\/+$/, "")

  const processCwdNormalized = normalize(processCwd)
  const workspacePathNormalized = normalize(workspacePath).replace(
    /\/package\.json$/,
    "",
  )

  return (
    processCwdNormalized === workspacePathNormalized ||
    processCwdNormalized.startsWith(`${workspacePathNormalized}/`)
  )
}

async function getPidCwd(pid: number): Promise<string | null> {
  try {
    return await readlink(`/proc/${pid}/cwd`)
  } catch {
    return null
  }
}

function getProcessText(process: ProcessDescriptor): string {
  return [process.cmd, process.path, process.name].filter(Boolean).join(" ")
}

async function getMatchingRootPids(params: {
  command: string
  absolutePath: string
  processes: ProcessDescriptor[]
}): Promise<number[]> {
  const matchers = buildCommandMatchers(params.command)
  const workspacePath = params.absolutePath.trim()
  const pids: number[] = []

  for (const process of params.processes) {
    if (!Number.isFinite(process.pid)) continue
    if (
      CURRENT_UID !== undefined &&
      process.uid !== undefined &&
      process.uid !== CURRENT_UID
    ) {
      continue
    }

    const processText = getProcessText(process)
    const matchesCommand = matchers.some((matcher) => matcher.test(processText))
    if (!matchesCommand) continue

    if (processText.includes(workspacePath)) {
      pids.push(process.pid)
      continue
    }

    const cwd = await getPidCwd(process.pid)
    if (cwd && isWorkspaceRelatedPath(cwd, workspacePath)) {
      pids.push(process.pid)
    }
  }

  return Array.from(new Set(pids))
}

async function getProcessFamilyPids(rootPids: number[]): Promise<number[]> {
  const allPids = new Set<number>()

  for (const rootPid of rootPids) {
    allPids.add(rootPid)

    try {
      const descendants = await pidtree(rootPid, { root: false })
      descendants.forEach((pid) => {
        if (Number.isFinite(pid)) allPids.add(pid)
      })
    } catch {
      // ignore pidtree failures for short-lived processes
    }
  }

  return Array.from(allPids)
}

async function getListeningPortsForPids(pids: number[]): Promise<number[]> {
  const ports = new Set<number>()
  const uniquePids = Array.from(
    new Set(pids.filter((pid) => Number.isFinite(pid))),
  )

  try {
    const pidPortsMap = await pidToPorts(uniquePids)
    for (const pidPorts of pidPortsMap.values()) {
      for (const port of pidPorts.values()) {
        if (Number.isFinite(port) && port >= 1 && port <= 65535) {
          ports.add(port)
        }
      }
    }
  } catch {
    // ignore processes with no open/listening ports
  }

  return Array.from(ports).sort((a, b) => a - b)
}

export async function getNodeRunStates(
  absolutePath: string,
  workspacePath: string,
  scripts: PackageJsonScript[],
): Promise<RunState[]> {
  const processes = await psList({ all: false })

  const results: RunState[] = []

  for (const script of scripts) {
    const name = script.name
    const command = script.command

    const rootPids = await getMatchingRootPids({
      command,
      absolutePath,
      processes,
    })

    const allPids = await getProcessFamilyPids(rootPids)
    const ports = await getListeningPortsForPids(allPids)

    let status: RunState["status"] = "stopped"
    let port: number | undefined
    let statusMessage: string | undefined
    let conflicts: RunState["conflicts"]

    if (rootPids.length === 0) {
      status = "stopped"
    } else {
      status = "running"

      if (ports.length === 1) {
        port = ports[0]
      } else if (ports.length > 1) {
        status = "conflict"
        statusMessage = `Multiple listening ports detected: ${ports.join(", ")} (pids: ${allPids.join(", ")})`
        conflicts = [
          {
            kind: "port",
            message: statusMessage,
            stopTargets: [
              ...ports.map((conflictPort) => ({
                kind: "port" as const,
                port: conflictPort,
              })),
              ...allPids.map((pid) => ({ kind: "pid" as const, pid })),
            ],
          },
        ]
      } else {
        statusMessage = `Process running (pids: ${allPids.join(", ")}) but no detected listening port`
        conflicts = [
          {
            kind: "process",
            message: statusMessage,
            stopTargets: allPids.map((pid) => ({ kind: "pid" as const, pid })),
          },
        ]
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
      conflicts,
    })
  }

  return results
}
