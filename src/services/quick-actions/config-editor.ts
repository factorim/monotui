import { existsSync } from "node:fs"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { updateConfig } from "../../config/config.js"
import { DEFAULT_CONFIG } from "../../config/defaults.js"
import type { Config } from "../../types/config.js"
import type {
  FacetQuickAction,
  WorkspaceQuickAction,
} from "../../types/workspace-quick-actions.js"

const CONFIG_FILENAME = "monotui.config.mjs"

function toJavaScriptObject(obj: unknown, indent = 0): string {
  const spaces = "  ".repeat(indent)
  const nextSpaces = "  ".repeat(indent + 1)

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]"

    const items = obj
      .map((item) => {
        if (typeof item === "string") return `"${item}"`
        if (typeof item === "number" || typeof item === "boolean") {
          return String(item)
        }

        return toJavaScriptObject(item, indent + 1)
      })
      .join(`,\n${nextSpaces}`)

    return `[\n${nextSpaces}${items}\n${spaces}]`
  }

  if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj)
    if (entries.length === 0) return "{}"

    const props = entries
      .map(([key, value]) => {
        const valueStr =
          typeof value === "string"
            ? `"${value}"`
            : typeof value === "number" || typeof value === "boolean"
              ? String(value)
              : toJavaScriptObject(value, indent + 1)

        return `${key}: ${valueStr}`
      })
      .join(`,\n${nextSpaces}`)

    return `{\n${nextSpaces}${props}\n${spaces}}`
  }

  return String(obj)
}

function toConfigContent(config: Config): string {
  return `export default ${toJavaScriptObject(config)}\n`
}

function normalizeFacetOrders(facets: FacetQuickAction[]): FacetQuickAction[] {
  const sorted = [...facets].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER

    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })

  return sorted.map((facet, index) => ({ ...facet, order: index + 1 }))
}

async function readConfigFile(rootDir: string): Promise<Config> {
  const configPath = join(rootDir, CONFIG_FILENAME)

  if (!existsSync(configPath)) {
    return structuredClone(DEFAULT_CONFIG)
  }

  const configModule = await import(
    `${pathToFileURL(configPath).href}?t=${Date.now()}`
  )

  return (configModule.default ?? DEFAULT_CONFIG) as Config
}

async function writeConfigFile(rootDir: string, config: Config): Promise<void> {
  const configPath = join(rootDir, CONFIG_FILENAME)
  await writeFile(configPath, toConfigContent(config), "utf-8")
  updateConfig(config)
}

function upsertWorkspaceQuickAction(
  quickActions: WorkspaceQuickAction[],
  workspacePath: string,
): WorkspaceQuickAction {
  const existing = quickActions.find(
    (quickAction) => quickAction.workspacePath === workspacePath,
  )

  if (existing) return existing

  const created: WorkspaceQuickAction = {
    workspacePath,
    facets: [],
  }

  quickActions.push(created)
  return created
}

export async function addFacetQuickActionToConfigFile(
  rootDir: string,
  workspacePath: string,
  facetQuickAction: Omit<FacetQuickAction, "order">,
): Promise<FacetQuickAction> {
  const config = await readConfigFile(rootDir)
  const quickActions = config.quickActions ?? []
  const workspaceQuickAction = upsertWorkspaceQuickAction(
    quickActions,
    workspacePath,
  )

  const normalized = normalizeFacetOrders(workspaceQuickAction.facets)
  const newFacetQuickAction: FacetQuickAction = {
    ...facetQuickAction,
    order: normalized.length + 1,
  }

  workspaceQuickAction.facets = [...normalized, newFacetQuickAction]
  config.quickActions = quickActions

  await writeConfigFile(rootDir, config)

  return newFacetQuickAction
}

export async function deleteFacetQuickActionFromConfigFile(
  rootDir: string,
  workspacePath: string,
  facetId: string,
): Promise<void> {
  const config = await readConfigFile(rootDir)
  const quickActions = config.quickActions ?? []

  const workspaceQuickAction = quickActions.find(
    (quickAction) => quickAction.workspacePath === workspacePath,
  )

  if (!workspaceQuickAction) {
    throw new Error(`Quick action workspace not found: ${workspacePath}`)
  }

  const nextFacets = workspaceQuickAction.facets.filter(
    (facet) => facet.facetId !== facetId,
  )

  if (nextFacets.length === workspaceQuickAction.facets.length) {
    throw new Error(`Quick action facet not found: ${facetId}`)
  }

  workspaceQuickAction.facets = normalizeFacetOrders(nextFacets)
  config.quickActions = quickActions

  await writeConfigFile(rootDir, config)
}

export async function moveFacetQuickActionUpInConfigFile(
  rootDir: string,
  workspacePath: string,
  facetId: string,
): Promise<void> {
  const config = await readConfigFile(rootDir)
  const quickActions = config.quickActions ?? []

  const workspaceQuickAction = quickActions.find(
    (quickAction) => quickAction.workspacePath === workspacePath,
  )

  if (!workspaceQuickAction) {
    throw new Error(`Quick action workspace not found: ${workspacePath}`)
  }

  const facets = normalizeFacetOrders(workspaceQuickAction.facets)
  const currentIndex = facets.findIndex((facet) => facet.facetId === facetId)

  if (currentIndex === -1) {
    throw new Error(`Quick action facet not found: ${facetId}`)
  }

  if (currentIndex > 0) {
    const before = facets[currentIndex - 1]
    facets[currentIndex - 1] = facets[currentIndex]
    facets[currentIndex] = before
  }

  workspaceQuickAction.facets = facets.map((facet, index) => ({
    ...facet,
    order: index + 1,
  }))
  config.quickActions = quickActions

  await writeConfigFile(rootDir, config)
}
