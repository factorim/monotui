import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { WorkspaceGridContext } from "../../../contexts/WorkspaceGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getWorkspaceCellByPosition } from "../../../utils/workspace/workspace-grid.js"

export function WorkspaceCommands() {
  const { workspacesNavigationGrid, row, col } =
    useContext(WorkspaceGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const selectedCell = getWorkspaceCellByPosition(
    workspacesNavigationGrid,
    row,
    col,
  )

  return (
    <>
      {selectedCell && selectedCell.type === "workspace" && (
        <Box gap={2}>
          <Box gap={1}>
            <Text {...styles.action()}>&lt;enter&gt;</Text>
            <Text {...styles.text()}>Select</Text>
          </Box>
          <Box gap={1}>
            <Text {...styles.action()}>&lt;esc&gt;</Text>
            <Text {...styles.text()}>Quit</Text>
          </Box>
        </Box>
      )}
      {selectedCell && selectedCell.type === "quickAction" && (
        <Box gap={2}>
          <Box gap={1}>
            <Text {...styles.action()}>&lt;enter&gt;</Text>
            <Text {...styles.text()}>Execute</Text>
          </Box>
          <Box gap={1}>
            <Text {...styles.action()}>&lt;esc&gt;</Text>
            <Text {...styles.text()}>Quit</Text>
          </Box>
        </Box>
      )}
      {selectedCell && selectedCell.type === "runtime" && (
        <Box gap={2}>
          <Box gap={1}>
            <Text {...styles.action()}>&lt;s&gt;</Text>
            <Text {...styles.text()}>stop</Text>
          </Box>
          <Box gap={1}>
            <Text {...styles.action()}>&lt;esc&gt;</Text>
            <Text {...styles.text()}>Quit</Text>
          </Box>
        </Box>
      )}
    </>
  )
}
