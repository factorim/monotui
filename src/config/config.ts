import { existsSync } from "node:fs"
import { join } from "node:path"

import type { Config } from "../types/config.js"
import { DEFAULT_CONFIG } from "./defaults.js"
import { validateConfig } from "./validation.js"

let cachedConfig: Config | null = null

export async function loadConfig(rootDir: string): Promise<Config> {
  const configPath = join(rootDir, "monotui.config.mjs")

  if (!existsSync(configPath)) {
    cachedConfig = validateConfig(DEFAULT_CONFIG)
    return cachedConfig
  }

  const configModule = await import(configPath)
  const userConfig = configModule.default as Config

  cachedConfig = validateConfig({
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
  })

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
