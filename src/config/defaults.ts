import type { Config } from "../types/config.js"

/**
 * Default configuration for monotui.config.mjs
 * This is the single source of truth for default values
 * Used by:
 * - loadConfig() as fallback when no user config exists
 * - init command to generate monotui.config.mjs
 */
export const DEFAULT_CONFIG: Config = {
  discovery: {
    maxDepth: 4,
    ignore: ["node_modules", ".git", "dist", "build"],
    folders: {
      app: ["apps"],
      package: ["packages"],
      infra: ["infra"],
      contract: ["contracts"],
    },
    scripts: {
      exclude: [],
    },
    env: {
      files: [".env.local", ".env.development", ".env", ".env.example"],
      portKeys: ["PORT", "APP_PORT", "VITE_PORT", "NEXT_PUBLIC_PORT"],
    },
    order: ["workspace", "app", "contract", "infra", "package"],
    makefile: {
      showDefault: false,
    },
  },
  execution: {
    useTmux: true,
  },
  quickActions: [],
  logging: {
    level: "info",
    file: false,
    logDir: "./logs",
    prettyPrint: true,
    truncateOnStart: true,
  },
  theme: "dark",
}
