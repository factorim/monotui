import { join } from "node:path"

import type { Config } from "../types/config.js"
import { DEFAULT_CONFIG } from "./defaults.js"

let cachedConfig: Config | null = null

export async function loadConfig(rootDir: string): Promise<Config> {
  try {
    const configPath = join(rootDir, "workspace-cli.mjs")
    const configModule = await import(configPath)
    const userConfig = configModule.default as Config

    cachedConfig = {
      ...DEFAULT_CONFIG,
      ...userConfig,
      discovery: {
        ...DEFAULT_CONFIG.discovery,
        ...userConfig.discovery,
      },
      execution: {
        ...DEFAULT_CONFIG.execution,
        ...userConfig.execution,
      },
      theme: DEFAULT_CONFIG.theme,
    }
  } catch {
    // Config file doesn't exist, use defaults
    cachedConfig = DEFAULT_CONFIG
  }

  return cachedConfig
}

/**
 * Get the already-loaded config.
 * Throws if called before loadConfig().
 */
export function getConfig(): Config {
  if (!cachedConfig) {
    throw new Error(
      "Config not loaded yet. Call loadConfig() first at startup.",
    )
  }
  return cachedConfig
}
