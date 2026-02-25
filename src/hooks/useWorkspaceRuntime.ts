import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"

import { getDockerRunStates } from "../services/runtime/docker-runtime.js"
import { getNodeRunStates } from "../services/runtime/node-runtime.js"
import { resolveRuntimeConflicts } from "../services/runtime/resolve-runtime.js"
import type { Project } from "../types/workspace.js"
import type { WorkspaceRuntimeState } from "../types/workspace-runtime.js"
import { logger } from "../utils/logging/logger.js"

const RUNTIME_REFRESH_INTERVAL_MS = 2000

function mergeTransientStatuses(
  previous: WorkspaceRuntimeState[],
  next: WorkspaceRuntimeState[],
): WorkspaceRuntimeState[] {
  const previousById = new Map<string, string>()

  for (const workspace of previous) {
    for (const runState of workspace.runStates) {
      previousById.set(runState.id, runState.status)
    }
  }

  return next.map((workspace) => ({
    ...workspace,
    runStates: workspace.runStates.map((runState) => {
      const prevStatus = previousById.get(runState.id)
      const isTransientPrevStatus =
        prevStatus === "starting" || prevStatus === "stopping"
      const isRunningNow = runState.status === "running"

      if (isTransientPrevStatus && isRunningNow) {
        return {
          ...runState,
          status: prevStatus,
        }
      }

      return runState
    }),
  }))
}

function areRuntimeStatesEqual(
  left: WorkspaceRuntimeState[],
  right: WorkspaceRuntimeState[],
): boolean {
  if (left.length !== right.length) {
    return false
  }

  for (
    let workspaceIndex = 0;
    workspaceIndex < left.length;
    workspaceIndex += 1
  ) {
    const leftWorkspace = left[workspaceIndex]
    const rightWorkspace = right[workspaceIndex]

    if (leftWorkspace.workspacePath !== rightWorkspace.workspacePath) {
      return false
    }

    if (leftWorkspace.runStates.length !== rightWorkspace.runStates.length) {
      return false
    }

    for (
      let stateIndex = 0;
      stateIndex < leftWorkspace.runStates.length;
      stateIndex += 1
    ) {
      const leftState = leftWorkspace.runStates[stateIndex]
      const rightState = rightWorkspace.runStates[stateIndex]

      if (
        leftState.id !== rightState.id ||
        leftState.status !== rightState.status
      ) {
        return false
      }
    }
  }

  return true
}

export function useWorkspaceRuntime(projects: Project[]) {
  const previousRuntimeStatesRef = useRef<WorkspaceRuntimeState[]>([])
  const queryKey = useMemo(
    () => ["workspace-runtimes", projects.map((project) => project.path)],
    [projects],
  )

  const { data = [], refetch } = useQuery<WorkspaceRuntimeState[]>({
    queryKey,
    queryFn: async () => {
      const results: WorkspaceRuntimeState[] = []
      for (const project of projects) {
        const scripts = project.facets.packageJson?.scripts ?? []
        const services = project.facets.compose?.services ?? []

        const nodeStates = await getNodeRunStates(
          project.absolutePath,
          project.path,
          scripts,
        )
        const dockerStates = await getDockerRunStates(project.path, services)

        // Resolve conflicts between node and docker run states
        const { node: resolvedNodeStates, docker: resolvedDockerStates } =
          resolveRuntimeConflicts(nodeStates, dockerStates)

        results.push({
          workspacePath: project.path,
          runStates: [...resolvedNodeStates, ...resolvedDockerStates],
        })
      }

      const merged = mergeTransientStatuses(
        previousRuntimeStatesRef.current,
        results,
      )
      const next = areRuntimeStatesEqual(
        previousRuntimeStatesRef.current,
        merged,
      )
        ? previousRuntimeStatesRef.current
        : merged

      previousRuntimeStatesRef.current = next
      return next
    },
    enabled: projects.length > 0,
    placeholderData: (previousData) => previousData,
  })

  useEffect(() => {
    if (projects.length === 0) {
      previousRuntimeStatesRef.current = []
    }
  }, [projects])

  useEffect(() => {
    let cancelled = false
    let timeoutId: NodeJS.Timeout | undefined

    const schedule = () => {
      timeoutId = setTimeout(async () => {
        if (cancelled) {
          return
        }

        await refetch()

        if (!cancelled) {
          schedule()
        }
      }, RUNTIME_REFRESH_INTERVAL_MS)
    }

    if (projects.length > 0) {
      schedule()
    }

    return () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [projects.length, refetch])

  logger.debug(data, "Runtime States")
  return data
}
