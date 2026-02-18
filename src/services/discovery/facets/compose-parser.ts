import { readFile } from "node:fs/promises"
import { dirname, join, relative } from "node:path"
import { parse as parseYaml } from "yaml"

import type { ComposeFacet } from "../../../types/workspace.js"
import { fileExists } from "../../../utils/fs/file.js"
import { logger } from "../../../utils/logging/logger.js"

const ENV_VAR_PATTERN = /\$\{([^}:]+)(?::-([^}]*))?\}|\$([A-Za-z_]\w*)/
const ENV_VAR_PATTERN_GLOBAL = /\$\{([^}:]+)(?::-([^}]*))?\}|\$([A-Za-z_]\w*)/g

/**
 * Resolve all env variable references in a string.
 * Supports: ${VAR}, ${VAR:-default}, $VAR
 * Returns the string with all variables replaced, or undefined if any remain unresolved.
 */
function resolveEnvVars(
  raw: string,
  envVars: Record<string, string>,
): string | undefined {
  let hasUnresolved = false
  const result = raw.replace(
    ENV_VAR_PATTERN_GLOBAL,
    (_match, braced, defaultVal, bare) => {
      const varName = braced ?? bare
      const resolved = envVars[varName] ?? defaultVal
      if (resolved == null) {
        hasUnresolved = true
        logger.debug(`Unresolved env variable $${varName} in "${raw}"`)
        return _match
      }
      return resolved
    },
  )
  return hasUnresolved ? undefined : result
}

/**
 * Parse an .env file into a key→value map.
 * Handles KEY=VALUE, quotes, and inline comments.
 */
async function parseEnvFile(envPath: string): Promise<Record<string, string>> {
  const vars: Record<string, string> = {}
  if (!(await fileExists(envPath))) {
    return vars
  }
  try {
    const content = await readFile(envPath, "utf-8")
    for (const line of content.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIndex = trimmed.indexOf("=")
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()
      // Strip surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      vars[key] = value
    }
  } catch {
    // Silently ignore unreadable env files
  }
  return vars
}

/**
 * Resolve a port string that may contain env variable references.
 * Supports: ${VAR}, ${VAR:-default}, $VAR
 * Falls back to the env file(s), then the default value, then null.
 */
function resolvePortValue(
  raw: string,
  envVars: Record<string, string>,
): number | null {
  const match = raw.match(ENV_VAR_PATTERN)
  if (!match) {
    // No variable — plain number
    const n = Number.parseInt(raw, 10)
    return Number.isNaN(n) ? null : n
  }

  const varName = match[1] ?? match[3]
  const defaultValue = match[2] // from ${VAR:-default} syntax

  const resolved = envVars[varName] ?? defaultValue
  if (resolved == null) {
    logger.debug(`Unresolved env variable $${varName} in port mapping "${raw}"`)
    return null
  }

  const n = Number.parseInt(resolved, 10)
  return Number.isNaN(n) ? null : n
}

/**
 * Extract and resolve host ports from a compose service's port mappings.
 * Resolves env variables (${VAR}, ${VAR:-default}, $VAR) using the
 * .env file located next to the compose file.
 */
export async function getPorts(
  rawPorts: (string | number)[],
  composeDir: string,
  envFileName = ".env",
): Promise<number[]> {
  const envVars = await parseEnvFile(join(composeDir, envFileName))
  const resolved: number[] = []

  for (const p of rawPorts) {
    if (typeof p === "number") {
      resolved.push(p)
      continue
    }

    // Extract the host part from "host:container" or "host:container/proto"
    const hostPart = p.toString().split(":")[0]
    const port = resolvePortValue(hostPart, envVars)
    if (port != null) {
      resolved.push(port)
    }
  }

  return resolved
}

export interface ComposeParseOptions {
  filenames?: string[]
  services?: {
    include?: string[]
    exclude?: string[]
  }
  envFile?: string
}

export async function parseDockerCompose(
  dir: string,
  options: ComposeParseOptions = {},
): Promise<ComposeFacet | null> {
  const filenames = options.filenames ?? [
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
  ]
  const envFileName = options.envFile ?? ".env"

  const services: Array<{
    name: string
    containerName?: string
    image?: string
    ports?: number[]
  }> = []
  let foundFile: string | null = null

  for (const filename of filenames) {
    const composePath = join(dir, filename)

    if (!(await fileExists(composePath))) {
      continue
    }

    try {
      const content = await readFile(composePath, "utf-8")
      const data = parseYaml(content) as {
        services?: Record<
          string,
          {
            container_name?: string
            image?: string
            ports?: (string | number)[]
            env_file?: string | string[]
          }
        >
      }

      if (!data.services) {
        continue
      }

      foundFile = filename
      const composeDir = dirname(composePath)
      const envVars = await parseEnvFile(join(composeDir, envFileName))

      for (const [serviceName, serviceConfig] of Object.entries(
        data.services,
      )) {
        // Apply service include/exclude filters
        if (
          options.services?.include &&
          !options.services.include.includes(serviceName)
        ) {
          continue
        }
        if (options.services?.exclude?.includes(serviceName)) {
          continue
        }

        const ports = serviceConfig.ports
          ? await getPorts(serviceConfig.ports, composeDir, envFileName)
          : []

        // Resolve env variables in container_name (e.g. "${NAMESPACE}-postgres")
        const containerName = serviceConfig.container_name
          ? resolveEnvVars(serviceConfig.container_name, envVars)
          : undefined

        services.push({
          name: serviceName,
          containerName,
          image: serviceConfig.image,
          ports,
        })
      }

      break // Only parse the first found compose file
    } catch (error) {
      // Skip invalid YAML files
      logger.debug(error, `Failed to parse ${filename}:`)
    }
  }

  if (!foundFile || services.length === 0) {
    return null
  }

  return {
    type: "compose",
    filename: foundFile,
    path: relative(process.cwd(), join(dir, foundFile)),
    services,
  }
}
