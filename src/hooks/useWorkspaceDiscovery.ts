import { useEffect, useState } from "react"

import { workspaceDiscovery } from "../services/discovery/workspace-discovery.js"
import type { Workspace } from "../types/workspace.js"
import { logger } from "../utils/logging/logger.js"

interface UseWorkspaceDiscoveryOptions {
  refreshIntervalMs?: number
}

export function useWorkspaceDiscovery(
  rootPath: string,
  _options?: UseWorkspaceDiscoveryOptions,
): {
  loading: boolean
  workspace: Workspace | null
  error: Error | null
} {
  const [loading, setLoading] = useState(true)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [error, setError] = useState<Error | null>(null)

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
        const workspace = await workspaceDiscovery(rootPath)
        logger.debug(rootPath, "discovered workspaces")
        if (!cancelled) {
          setWorkspace(workspace)
          logger.debug(
            `Workspace discovery result count: ${workspace.projects.length}`,
          )
        }
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setLoading(false)
        pending = false
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [rootPath])

  return { loading, workspace, error }
}
