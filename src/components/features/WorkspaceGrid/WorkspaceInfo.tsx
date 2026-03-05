import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { WorkspaceGridContext } from "../../../contexts/WorkspaceGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getWorkspaceCellByPosition } from "../../../utils/workspace/workspace-grid.js"
import { Runner } from "../../ui/Runner.js"

export function WorkspaceInfo() {
  const { workspacesNavigationGrid, row, col } =
    useContext(WorkspaceGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const selectedCell = getWorkspaceCellByPosition(
    workspacesNavigationGrid,
    row,
    col,
  )

  return (
    <Box
      width="100%"
      paddingBottom={1}
      paddingLeft={1}
      paddingRight={1}
      justifyContent="space-between"
    >
      {selectedCell && selectedCell.type === "workspace" && (
        <Box gap={1}>
          <Text {...styles.info()} inverse>
            {` ${selectedCell.project.path} `}
          </Text>
          <Text {...styles.text()} dimColor>
            {selectedCell.project.description}
          </Text>
        </Box>
      )}
      {selectedCell && selectedCell.type === "quickAction" && (
        <Box gap={1}>
          <Text {...styles.info()} inverse>
            {` ${selectedCell.action.facetPath} `}
          </Text>
          <Box>
            <Text {...styles.action()} inverse>
              {` ${selectedCell.action.command} `}
            </Text>
          </Box>
        </Box>
      )}
      {selectedCell && selectedCell.type === "runtime" && (
        <Box gap={1}>
          <Text {...styles.action()} inverse>
            {` ${selectedCell.runState.command} `}
          </Text>
          {selectedCell.runState.statusMessage && (
            <Text {...styles.error()}>
              {selectedCell.runState.statusMessage}
            </Text>
          )}
        </Box>
      )}

      <Box>
        <Runner />
      </Box>
    </Box>
  )
}
