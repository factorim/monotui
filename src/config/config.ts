import { existsSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import type { Config } from "../types/config.js"
import { DEFAULT_CONFIG } from "./defaults.js"
import { validateConfig } from "./validation.js"

let cachedConfig: Config | null = null

function mergeConfigWithDefaults(userConfig: Config): Config {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    discovery: {
      ...DEFAULT_CONFIG.discovery,
      ...userConfig.discovery,
    },
    execution: {
      runner:
        userConfig.execution?.runner ??
        DEFAULT_CONFIG.execution?.runner ??
        "shell",
    },
    theme: DEFAULT_CONFIG.theme,
  }
}

export async function loadConfig(rootDir: string): Promise<Config> {
  const configPath = join(rootDir, "monotui.config.mjs")

  if (!existsSync(configPath)) {
    cachedConfig = validateConfig(DEFAULT_CONFIG)
    return cachedConfig
  }

  const configModule = await import(
    `${pathToFileURL(configPath).href}?t=${Date.now()}`
  )
  const userConfig = configModule.default as Config

  cachedConfig = validateConfig(mergeConfigWithDefaults(userConfig))

  return cachedConfig
}

export function updateConfig(config: Config): Config {
  cachedConfig = validateConfig(mergeConfigWithDefaults(config))
  return cachedConfig
}

export async function refreshConfig(rootDir: string): Promise<Config> {
  return loadConfig(rootDir)
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
