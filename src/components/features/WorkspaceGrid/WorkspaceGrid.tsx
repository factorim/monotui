import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { WorkspaceGridContext } from "../../../contexts/WorkspaceGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getQuickActionColumnMaxSizes } from "../../../utils/navigation/navigation-helper.js"
import { getWorkspaceQuickActionCells } from "../../../utils/workspace/workspace-grid.js"
import { Notification } from "../../ui/Notification.js"
import { ResponsiveBox } from "../../ui/ResponsiveBox.js"
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
    <Box
      flexDirection="column"
      width="100%"
      flexGrow={1}
      borderStyle="single"
      {...styles.container()}
      paddingX={1}
    >
      <Box flexDirection="column" flexGrow={1}>
        <Box width="100%" borderColor="gray">
          <ResponsiveBox width={{ s: "25%", m: "25%", l: "24%", xl: "24%" }}>
            <Text {...styles.headerText()}>Name</Text>
          </ResponsiveBox>
          <ResponsiveBox width={{ s: null, m: "15%", l: "14%", xl: "18%" }}>
            <Text {...styles.headerText()}>Type</Text>
          </ResponsiveBox>
          <ResponsiveBox width={{ s: null, m: null, l: "24%", xl: "28%" }}>
            <Text {...styles.headerText()}>Path</Text>
          </ResponsiveBox>
          <ResponsiveBox width={{ s: "30%", m: "25%", l: "24%", xl: "28%" }}>
            <Text {...styles.headerText()}>Quick Actions</Text>
          </ResponsiveBox>
          <ResponsiveBox width={{ s: "45%", m: "35%", l: "23%", xl: "23%" }}>
            <Text {...styles.headerText()}>State</Text>
          </ResponsiveBox>
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
      <Notification />
    </Box>
  )
}
