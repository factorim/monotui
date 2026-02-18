import type { Project } from "../../types/workspace.js"
import type { WorkspaceQuickAction } from "../../types/workspace-quick-actions.js"
import type { WorkspaceRuntimeState } from "../../types/workspace-runtime.js"

export function getQuickActionByPath(
  quickActions: WorkspaceQuickAction[],
  path: string,
): WorkspaceQuickAction | undefined {
  return quickActions.find((action) => action.workspacePath === path)
}

export function getRuntimeByPath(
  runtimes: WorkspaceRuntimeState[],
  path: string,
): WorkspaceRuntimeState | undefined {
  return runtimes.find((runtime) => runtime.workspacePath === path)
}

export function getRootWorkspace(workspaces: Project[]): Project | undefined {
  return workspaces.find((ws) => ws.type === "workspace")
}
