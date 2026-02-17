import { useEffect, useState } from "react"

import { discoverWorkspaces } from "../services/discovery/workspace-discovery.js"
import type { Project } from "../types/project.js"
import { logger } from "../utils/logging/logger.js"

interface UseWorkspaceDiscoveryOptions {
  refreshIntervalMs?: number
}

export function useWorkspaceDiscovery(
  rootPath: string,
  options?: UseWorkspaceDiscoveryOptions,
) {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<Error | null>(null)
  const refreshIntervalMs = options?.refreshIntervalMs ?? 0

  useEffect(() => {
    let cancelled = false
    let pending = false

    async function load() {
      if (pending || cancelled) {
        return
      }

      pending = true
      setLoading(true)
      setError(null)
      try {
        const result = await discoverWorkspaces(rootPath)
        logger.debug(rootPath, "discovered workspaces")
        if (!cancelled) {
          setProjects(result)
          logger.debug(`Workspace discovery result count: ${result.length}`)
        }
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setLoading(false)
        pending = false
      }
    }

    load()

    const intervalId =
      refreshIntervalMs > 0 ? setInterval(load, refreshIntervalMs) : null

    return () => {
      cancelled = true
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [rootPath, refreshIntervalMs])

  return { loading, projects, error }
}
