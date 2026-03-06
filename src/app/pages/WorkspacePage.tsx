import { useContext } from "react"

import { WorkspaceGrid } from "../../components/features/WorkspaceGrid/WorkspaceGrid.js"
import { WorkspaceInfo } from "../../components/features/WorkspaceGrid/WorkspaceInfo.js"
import { Header } from "../../components/layouts/Header/Header.js"
import { PageNavigationContext } from "../../contexts/PageNavigationContext.js"
import { WorkspaceDiscoveryContext } from "../../contexts/WorkspaceDiscoveryContext.js"
import { WorkspacesNavigationProvider } from "../../contexts/WorkspaceGridContext.js"
import { useWorkspaceQuickActions } from "../../hooks/useWorkspaceQuickActions.js"
import { logger } from "../../utils/logging/logger.js"

export function WorkspacePage() {
  const { setPage, workspacesGridPosition, setWorkspacesGridPosition } =
    useContext(PageNavigationContext)
  const { workspace, workspaceRuntimes, setProject } = useContext(
    WorkspaceDiscoveryContext,
  )
  const workspaceQuickActions = useWorkspaceQuickActions(
    workspace?.projects || [],
  )

  logger.debug("----------------==================")
  logger.debug(JSON.stringify(workspaceQuickActions, null, 2))

  return (
    <WorkspacesNavigationProvider
      projects={workspace?.projects || []}
      workspaceQuickActions={workspaceQuickActions}
      workspaceRuntimes={workspaceRuntimes}
      initialPosition={workspacesGridPosition}
      setPage={setPage}
      setProject={setProject}
      onPositionChange={setWorkspacesGridPosition}
    >
      <Header />
      <WorkspaceGrid />
      <WorkspaceInfo />
    </WorkspacesNavigationProvider>
  )
}
