import type { RunState } from "../../types/workspace-runtime"

/**
 * Resolves conflicts between Node and Docker run states.
 * If a service is "conflict" in one runtime but "running" in the other,
 * change the "conflict" status to "stopped" (or another status if needed).
 *
 * @param nodeStates RunState[] from Node runtime
 * @param dockerStates RunState[] from Docker runtime
 * @returns { node: RunState[], docker: RunState[] }
 */
export function resolveRuntimeConflicts(
  nodeStates: RunState[],
  dockerStates: RunState[],
): { node: RunState[]; docker: RunState[] } {
  // Helper to find a running service in the other runtime by port or name
  function findRunningOther(states: RunState[], name: string, port?: number) {
    return states.find(
      (s) =>
        s.status === "running" &&
        ((port != null && s.port === port) || s.name === name),
    )
  }

  function resolve(states: RunState[], otherStates: RunState[]): RunState[] {
    return states.map((state) => {
      if (state.status === "conflict") {
        const other = findRunningOther(otherStates, state.name, state.port)
        if (other) {
          return {
            ...state,
            status: "stopped",
            statusMessage: "Stopped due to other runtime running",
          }
        }
      }
      return state
    })
  }

  return {
    node: resolve(nodeStates, dockerStates),
    docker: resolve(dockerStates, nodeStates),
  }
}
