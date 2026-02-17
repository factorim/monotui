import type { WorkspaceQuickAction } from "./workspace-quick-actions"

export interface Config {
  discovery?: DiscoveryConfig
  quickActions: WorkspaceQuickAction[]
  execution?: ExecutionConfig
  logging?: LoggingConfig
  theme?: ThemeName
}

export type ThemeName = "dark"

export interface DiscoveryConfig {
  maxDepth?: number
  ignore?: string[]
  folders?: {
    app?: string[]
    package?: string[]
    infra?: string[]
    contract?: string[]
  }
  scripts?: {
    include?: string[]
    exclude?: string[]
  }
  env?: DiscoveryEnvConfig
  order?: string[]
  makefile?: MakefileConfig
}

export interface DiscoveryEnvConfig {
  files?: string[]
  portKeys?: string[]
}

export interface MakefileConfig {
  showDefault?: boolean
}

export interface ExecutionConfig {
  useTmux?: boolean
}

export interface LoggingConfig {
  level?: "debug" | "info" | "warn" | "error"
  file?: boolean
  logDir?: string
  prettyPrint?: boolean
  truncateOnStart?: boolean
}
