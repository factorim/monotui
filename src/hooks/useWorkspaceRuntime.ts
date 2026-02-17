import { useEffect, useState } from "react"

import { getDockerRunStates } from "../services/runtime/docker-runtime.js"
import { getNodeRunStates } from "../services/runtime/node-runtime.js"
import { resolveRuntimeConflicts } from "../services/runtime/resolve-runtime.js"
import type { Project } from "../types/project.js"
import type { WorkspaceRuntimeState } from "../types/workspace-runtime.js"
import { logger } from "../utils/logging/logger.js"

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

export function useWorkspaceRuntime(projects: Project[]) {
  const [runtimeStates, setRuntimeStates] = useState<WorkspaceRuntimeState[]>(
    [],
  )

  useEffect(() => {
    let cancelled = false
    async function fetchStatus() {
      const results: WorkspaceRuntimeState[] = []
      for (const project of projects) {
        const scripts = project.facets.packageJson?.scripts ?? []
        const services = project.facets.compose?.services ?? []

        // const [nodeStates, dockerStates] = await Promise.all([
        //   getNodeRunStates(project.absolutePath, project.path, scripts),
        //   getDockerRunStates(project.path, services),
        // ])

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
      if (!cancelled) {
        setRuntimeStates((previous) =>
          mergeTransientStatuses(previous, results),
        )
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [projects])

  logger.debug(runtimeStates, "Runtime States")
  return runtimeStates
}
