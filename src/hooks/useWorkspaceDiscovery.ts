import { homedir } from "node:os"
import { isAbsolute, relative, resolve } from "node:path"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import chokidar from "chokidar"
import { useEffect, useMemo } from "react"
import { getConfig } from "../config/config.js"
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
  const config = getConfig()
  const discoveryIgnore = useMemo(
    () => config.discovery?.ignore ?? [],
    [config.discovery?.ignore],
  )
  const loggingDir = useMemo(
    () => config.logging?.logDir,
    [config.logging?.logDir],
  )
  const queryClient = useQueryClient()
  const queryKey = useMemo(
    () => ["workspace-discovery", rootPath] as const,
    [rootPath],
  )

  const { data, error, isPending } = useQuery<Workspace>({
    queryKey,
    queryFn: async () => {
      const workspace = await workspaceDiscovery(rootPath)
      logger.debug(rootPath, "discovered workspaces")
      logger.debug(
        `Workspace discovery result count: ${workspace.projects.length}`,
      )
      return workspace
    },
    enabled: rootPath.length > 0,
    placeholderData: (previousData) => previousData,
  })

  useEffect(() => {
    let cancelled = false
    let debounceId: NodeJS.Timeout | undefined

    if (rootPath.length === 0) {
      return
    }

    const triggerRefresh = () => {
      if (debounceId) {
        clearTimeout(debounceId)
      }

      debounceId = setTimeout(async () => {
        if (cancelled) {
          return
        }

        await queryClient.refetchQueries({
          queryKey,
          exact: true,
          type: "active",
        })
      }, 150)
    }

    const normalize = (value: string) =>
      value
        .trim()
        .replace(/\\/g, "/")
        .replace(/^\.(\/|$)/, "")
        .replace(/^\//, "")
        .replace(/\/+$/, "")

    const configuredIgnore = discoveryIgnore.map(normalize).filter(Boolean)

    const configuredLogDir = loggingDir
      ? loggingDir.replace(/^~/, homedir())
      : "./logs"

    const logDirAbsolute = isAbsolute(configuredLogDir)
      ? resolve(configuredLogDir)
      : resolve(rootPath, configuredLogDir)

    const shouldIgnorePath = (watchedPath: string) => {
      const absolutePath = resolve(watchedPath)

      if (
        absolutePath === logDirAbsolute ||
        absolutePath.startsWith(`${logDirAbsolute}/`)
      ) {
        return true
      }

      const rel = normalize(relative(rootPath, absolutePath))
      if (!rel || rel.startsWith("..")) {
        return false
      }

      const leaf = normalize(rel.split("/").at(-1) ?? "")

      return configuredIgnore.some(
        (pattern) =>
          rel === pattern || rel.startsWith(`${pattern}/`) || leaf === pattern,
      )
    }

    const watcher = chokidar.watch(rootPath, {
      ignoreInitial: true,
      ignored: (watchedPath) => shouldIgnorePath(watchedPath),
      persistent: true,
    })

    watcher.on("all", (_eventName, _changedPath) => {
      logger.debug(rootPath, "Workspace FS change detected")
      triggerRefresh()
    })

    watcher.on("error", (error) => {
      logger.debug(error, "Workspace watcher error")
    })

    return () => {
      cancelled = true
      void watcher.close()
      if (debounceId) {
        clearTimeout(debounceId)
      }
    }
  }, [discoveryIgnore, loggingDir, queryClient, queryKey, rootPath])

  return {
    loading: isPending,
    workspace: data ?? null,
    error: error ? (error as Error) : null,
  }
}
