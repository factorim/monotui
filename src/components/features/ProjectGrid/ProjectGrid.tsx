import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"
import { getConfig } from "../../../config/config.js"
import { ProjectGridContext } from "../../../contexts/ProjectGridContext.js"
import { WorkspaceDiscoveryContext } from "../../../contexts/WorkspaceDiscoveryContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import type { RuntimeStatus } from "../../../types/workspace-runtime.js"
import { findWorkspaceQuickAction } from "../../../utils/project/quick-actions.js"
import { Notification } from "../../ui/Notification.js"
import { ColCompose } from "./components/ColCompose.js"
import { ColMakefile } from "./components/ColMakefile.js"
import { ColPackageJson } from "./components/ColPackageJson.js"
import { EmptyCol } from "./components/EmptyCol.js"

export function ProjectGrid() {
  const config = getConfig()
  const configuredQuickActions = config.quickActions ?? []

  const { project, workspaceRuntimes } = useContext(WorkspaceDiscoveryContext)
  const { projectGrid, row, col } = useContext(ProjectGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const {
    makefileCells,
    packageJsonCells,
    composeCommandCells,
    composeServiceCells,
  } = projectGrid

  const workspaceQuickAction = findWorkspaceQuickAction(
    configuredQuickActions,
    project?.path ?? "",
  )

  const composeServiceStatuses: Record<string, RuntimeStatus> =
    workspaceRuntimes
      .find(
        (workspaceRuntime) => workspaceRuntime.workspacePath === project?.path,
      )
      ?.runStates.filter((runState) => runState.type === "service")
      .reduce<Record<string, RuntimeStatus>>((acc, runState) => {
        acc[runState.name] = runState.status
        return acc
      }, {}) ?? {}

  const composeServicePorts: Record<string, number> =
    workspaceRuntimes
      .find(
        (workspaceRuntime) => workspaceRuntime.workspacePath === project?.path,
      )
      ?.runStates.filter(
        (runState) => runState.type === "service" && runState.port != null,
      )
      .reduce<Record<string, number>>((acc, runState) => {
        if (runState.port != null) {
          acc[runState.name] = runState.port
        }
        return acc
      }, {}) ?? {}

  return (
    <Box
      flexDirection="column"
      width="100%"
      flexGrow={1}
      borderStyle="single"
      {...styles.container()}
    >
      <Box width="100%" flexGrow={1}>
        <Box width="3" paddingTop={1}>
          <Text {...styles.action()}>{" < "}</Text>
        </Box>

        {makefileCells.length > 0 && (
          <ColMakefile
            makefileCells={makefileCells}
            row={row}
            col={col}
            workspaceQuickAction={workspaceQuickAction}
          />
        )}

        {packageJsonCells.length > 0 && project && (
          <ColPackageJson
            project={project}
            packageJsonCells={packageJsonCells}
            row={row}
            col={col}
            workspaceQuickAction={workspaceQuickAction}
          />
        )}

        {composeServiceCells.length > 0 && (
          <ColCompose
            composeCommandCells={composeCommandCells}
            composeServiceCells={composeServiceCells}
            composeServiceStatuses={composeServiceStatuses}
            composeServicePorts={composeServicePorts}
            row={row}
            col={col}
            workspaceQuickAction={workspaceQuickAction}
          />
        )}

        {packageJsonCells.length === 0 && <EmptyCol />}

        {makefileCells.length === 0 && <EmptyCol />}

        {composeServiceCells.length === 0 && <EmptyCol />}
      </Box>
      <Notification />
    </Box>
  )
}
