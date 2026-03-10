import { execFileSync, spawnSync } from "node:child_process"

import { logger } from "../../utils/logging/logger.js"

function isDockerComposeUpDetached(command: string): boolean {
  const normalized = command.trim().toLowerCase()

  const isDockerCompose = /\bdocker(?:\s+compose|\s+-compose)\b/.test(
    normalized,
  )
  const isUpCommand = /\bup\b/.test(normalized)
  const isDetached = /(^|\s)(-d|--detach)(\s|$)/.test(normalized)

  return isDockerCompose && isUpCommand && isDetached
}

function getExternalNetworkNames(cwd: string): string[] {
  const configJson = execFileSync(
    "docker",
    ["compose", "config", "--format", "json"],
    {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  const parsed = JSON.parse(configJson) as {
    networks?: Record<
      string,
      {
        external?: boolean | Record<string, unknown>
        name?: string
      }
    >
  }

  const networks = parsed.networks ?? {}

  return Object.entries(networks)
    .filter(([, value]) => {
      const ext = value?.external
      return ext === true || (typeof ext === "object" && ext !== null)
    })
    .map(([key, value]) => value?.name ?? key)
}

function findMissingNetworks(names: string[]): string[] {
  return names.filter((name) => {
    const result = spawnSync("docker", ["network", "inspect", name], {
      stdio: "ignore",
    })

    return result.status !== 0
  })
}

export function assertDockerComposePreflight(
  command: string,
  cwd: string,
): void {
  if (!isDockerComposeUpDetached(command)) {
    return
  }
  const externalNetworks = getExternalNetworkNames(cwd)
  if (externalNetworks.length === 0) {
    return
  }

  const missingNetworks = findMissingNetworks(externalNetworks)

  if (missingNetworks.length > 0) {
    const message = `docker compose up -d aborted: missing external network(s): ${missingNetworks.join(", ")}`
    logger.error(message)
    throw new Error(message)
  }

  return
}
