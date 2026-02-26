import { execFile } from "node:child_process"
import { promisify } from "node:util"

import type { ComposeService } from "../../types/workspace.js"
import type { RunState, RuntimeStatus } from "../../types/workspace-runtime"
import { logger } from "../../utils/logging/logger.js"
import { isPortInUse } from "../../utils/runtime/port.js"

const execFileAsync = promisify(execFile)

/**
 * Shape returned by `docker ps --format '{{json .}}'` (one JSON object per line)
 */
interface DockerPsEntry {
  ID: string
  Names: string
  Image: string
  State: string // "running", "exited", "paused", etc.
  Status: string // "Up 2 hours", "Exited (0) 3 minutes ago"
  Ports: string // "0.0.0.0:5432->5432/tcp" or ""
}

/**
 * Fetch all Docker containers (running + stopped) as structured JSON.
 */
async function getDockerContainers(): Promise<DockerPsEntry[]> {
  try {
    const { stdout } = await execFileAsync("docker", [
      "ps",
      "-a",
      "--format",
      "{{json .}}",
    ])

    // Each line is a separate JSON object
    return stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as DockerPsEntry)
  } catch (error) {
    logger.debug(error, "Failed to get Docker containers")
    return []
  }
}

/**
 * Extract host ports from Docker's Ports string.
 * e.g. "0.0.0.0:5432->5432/tcp, :::5432->5432/tcp" → [5432]
 */
function parseDockerPorts(portsStr: string): number[] {
  if (!portsStr) return []
  const ports = new Set<number>()
  // Match patterns like "0.0.0.0:5432->5432/tcp" or ":::3000->3000/tcp"
  const matches = portsStr.matchAll(/:(\d+)->/g)
  for (const match of matches) {
    ports.add(Number.parseInt(match[1], 10))
  }
  return [...ports]
}

/**
 * Build RunState[] for compose services.
 *
 * 1. Get all running Docker containers.
 * 2. For each compose service, check if a running container matches the service name.
 *    - Name matches → "running"
 *    - A container is running on the same port but with a different name → "conflict"
 * 3. No matching container found → check if the port is already in use.
 *    - Port in use → "conflict"
 *    - Port free → "stopped"
 */
export async function getDockerRunStates(
  workspacePath: string,
  services: ComposeService[],
): Promise<RunState[]> {
  if (services.length === 0) return []

  // Only get running containers
  const allContainers = await getDockerContainers()
  const runningContainers = allContainers.filter(
    (c) => c.State.toLowerCase() === "running",
  )

  const results: RunState[] = []

  for (const service of services) {
    let status: RuntimeStatus = "stopped"
    let statusMessage: string | undefined
    const port = service.ports?.[0]
    const serviceName = service.name.toLowerCase()
    const containerName = service.containerName?.toLowerCase()

    // 1. Check if a running container matches the service name
    const nameMatch = runningContainers.find((c) =>
      c.Names.toLowerCase().includes(serviceName),
    )

    if (nameMatch) {
      // If containerName is set, also verify it matches
      if (
        service.containerName &&
        !nameMatch.Names.toLowerCase().includes(containerName ?? "")
      ) {
        // Service name matches but containerName doesn't → conflict
        status = "conflict"
        statusMessage = `Conflict with running container: ${nameMatch.Names}`
      } else {
        // Both names match (or no containerName set) → running
        status = "running"
        const containerPorts = parseDockerPorts(nameMatch.Ports)
        const resolvedPort =
          containerPorts.length > 0 ? containerPorts[0] : port

        results.push({
          id: `${workspacePath}::compose::${service.name}`,
          name: service.name,
          type: "service" as const,
          status,
          statusMessage,
          command: `docker compose up ${service.name}`,
          port: resolvedPort,
        })
        continue
      }
    } else if (service.containerName) {
      // No match on service name — also try matching by containerName
      const containerNameMatch = runningContainers.find((c) =>
        c.Names.toLowerCase().includes(containerName ?? ""),
      )

      if (containerNameMatch) {
        // containerName matches but service name didn't → conflict
        status = "conflict"
        statusMessage = `Conflict with running container: ${containerNameMatch.Names}`
      }
    }

    // 1.b No running match: check if container exists but is still starting/restarting
    if (status === "stopped") {
      const nonRunningMatch = allContainers.find((container) => {
        const containerState = container.State.toLowerCase()
        if (containerState === "running") {
          return false
        }

        const names = container.Names.toLowerCase()
        const matchesServiceName = names.includes(serviceName)
        const matchesContainerName =
          containerName != null && names.includes(containerName)

        return matchesServiceName || matchesContainerName
      })

      if (nonRunningMatch) {
        const containerState = nonRunningMatch.State.toLowerCase()
        if (
          containerState === "restarting" ||
          containerState === "created" ||
          containerState === "starting"
        ) {
          status = "starting"
          statusMessage = nonRunningMatch.Status
        }
      }
    }

    // 2. No match at all — check if the port is already in use
    if (status === "stopped" && port != null) {
      const portConflict = runningContainers.find((c) => {
        const containerPorts = parseDockerPorts(c.Ports)
        return containerPorts.includes(port)
      })

      if (portConflict) {
        status = "conflict"
        statusMessage = `Conflict with running container: ${portConflict.Names}`
      } else {
        const taken = await isPortInUse(port)
        if (taken) {
          status = "conflict"
          statusMessage = `Port ${port} is already in use`
        }
      }
    }

    results.push({
      id: `${workspacePath}::compose::${service.name}`,
      name: service.name,
      type: "service" as const,
      status,
      statusMessage,
      command: `docker compose up ${service.name}`,
      port,
    })
  }

  return results
}
