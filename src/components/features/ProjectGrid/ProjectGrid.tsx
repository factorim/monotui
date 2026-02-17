import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { ProjectGridContext } from "../../../contexts/ProjectGridContext.js"
import { WorkspaceDiscoveryContext } from "../../../contexts/WorkspaceDiscoveryContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import type { RuntimeStatus } from "../../../types/workspace-runtime.js"
import { ColCompose } from "./ColCompose.js"
import { ColMakefile } from "./ColMakefile.js"
import { ColPackageJson } from "./ColPackageJson.js"
import { EmptyCol } from "./EmptyCol.js"

export function ProjectGrid() {
  const { project, workspaceRuntimes } = useContext(WorkspaceDiscoveryContext)
  const { workspaceNavigationGrid, row, col } = useContext(ProjectGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const {
    makefileCells,
    packageJsonCells,
    composeCommandCells,
    composeServiceCells,
  } = workspaceNavigationGrid

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

  return (
    <Box flexDirection="column" width="100%">
      <Box width="100%" {...styles.border()}>
        <Box flexDirection="column" width="4%">
          <Box
            flexDirection="column"
            width="100%"
            borderStyle="single"
            borderTop={false}
            borderBottom={true}
            borderLeft={false}
            borderRight={false}
            {...styles.border()}
          >
            <Box width="100%">
              <Text>&nbsp;</Text>
            </Box>
            <Box width="100%">
              <Text>&nbsp;</Text>
            </Box>
          </Box>
          <Box width="100%">
            <Text {...styles.action()}>{" < "}</Text>
          </Box>
        </Box>

        {makefileCells.length > 0 && (
          <ColMakefile makefileCells={makefileCells} row={row} col={col} />
        )}

        {packageJsonCells.length > 0 && project && (
          <ColPackageJson
            project={project}
            packageJsonCells={packageJsonCells}
            row={row}
            col={col}
          />
        )}

        {composeServiceCells.length > 0 && (
          <ColCompose
            composeCommandCells={composeCommandCells}
            composeServiceCells={composeServiceCells}
            composeServiceStatuses={composeServiceStatuses}
            row={row}
            col={col}
          />
        )}

        {packageJsonCells.length === 0 && <EmptyCol />}

        {makefileCells.length === 0 && <EmptyCol />}

        {composeServiceCells.length === 0 && <EmptyCol />}
      </Box>
    </Box>
  )
}
