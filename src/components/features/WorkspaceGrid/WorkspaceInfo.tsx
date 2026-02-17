import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { WorkspaceGridContext } from "../../../contexts/WorkspaceGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getWorkspaceCellByPosition } from "../../../utils/workspace/workspace-grid.js"

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
      flexDirection="column"
      width="100%"
      borderStyle="single"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      {...styles.border()}
    >
      {selectedCell && selectedCell.type === "workspace" && (
        <Box flexDirection="column">
          <Text {...styles.info()}>{selectedCell.workspace.path}</Text>
          <Box gap={2}>
            {Array.isArray(
              selectedCell.workspace.facets.makefile?.commands,
            ) && (
              <Text {...styles.text()} dimColor>
                makefile commands:
                {selectedCell.workspace.facets.makefile.commands.length}
              </Text>
            )}
            {Array.isArray(
              selectedCell.workspace.facets.packageJson?.scripts,
            ) && (
              <Text {...styles.text()} dimColor>
                package.json scripts:
                {selectedCell.workspace.facets.packageJson.scripts.length}
              </Text>
            )}
            {Array.isArray(selectedCell.workspace.facets.compose?.services) && (
              <Text {...styles.text()} dimColor>
                docker compose services:
                {selectedCell.workspace.facets.compose.services.length}
              </Text>
            )}
          </Box>
        </Box>
      )}
      {selectedCell && selectedCell.type === "quickAction" && (
        <Box flexDirection="column">
          <Box>
            <Text {...styles.info()}>{selectedCell.action.facetPath}</Text>
          </Box>
          <Box gap={1}>
            <Text {...styles.action()}>{selectedCell.action.name}</Text>
            <Text dimColor> → </Text>
            <Text {...styles.text()} dimColor>
              {selectedCell.action.command}
            </Text>
          </Box>
        </Box>
      )}
      {selectedCell && selectedCell.type === "runtime" && (
        <Box flexDirection="column">
          <Box gap={1}>
            <Text {...styles.info()}>{selectedCell.runState.name}</Text>
            {selectedCell.runState.statusMessage && (
              <Text {...styles.error()}>
                {selectedCell.runState.statusMessage}
              </Text>
            )}
          </Box>
          <Text {...styles.action()}>{selectedCell.runState.command}</Text>
        </Box>
      )}
    </Box>
  )
}
