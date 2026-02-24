import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { WorkspaceGridContext } from "../../../contexts/WorkspaceGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getQuickActionColumnMaxSizes } from "../../../utils/navigation/navigation-helper.js"
import { getWorkspaceQuickActionCells } from "../../../utils/workspace/workspace-grid.js"
import { WorkspaceRow } from "./WorkspaceRow.js"

export function WorkspaceGrid() {
  const { workspacesNavigationGrid } = useContext(WorkspaceGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")
  const quickActionColSizes = getQuickActionColumnMaxSizes(
    workspacesNavigationGrid.map((row) =>
      getWorkspaceQuickActionCells(row.cells),
    ),
  )

  return (
    <Box flexDirection="column" width="100%" flexGrow={1}>
      <Box width="100%" borderColor="gray">
        <Box width="3%">
          <Text {...styles.headerText()}>#</Text>
        </Box>
        <Box width="24%">
          <Text {...styles.headerText()}>Name</Text>
        </Box>
        <Box width="10%">
          <Text {...styles.headerText()}>Type</Text>
        </Box>
        <Box width="20%">
          <Text {...styles.headerText()}>Path</Text>
        </Box>
        <Box width="20%">
          <Text {...styles.headerText()}>Quick Actions</Text>
        </Box>
        <Box width="23%">
          <Text {...styles.headerText()}>State</Text>
        </Box>
      </Box>
      {workspacesNavigationGrid.map((row, rowNb) => (
        <WorkspaceRow
          key={row.id}
          cells={row.cells}
          rowNb={rowNb}
          quickActionColSizes={quickActionColSizes}
        />
      ))}
    </Box>
  )
}
