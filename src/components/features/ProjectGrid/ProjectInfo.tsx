import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { ProjectGridContext } from "../../../contexts/ProjectGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import {
  getCellLabel,
  getProjectCellByPosition,
} from "../../../utils/project/project-grid.js"

export function ProjectInfo() {
  const { workspaceNavigationGrid, row, col } = useContext(ProjectGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const selectedCell = getProjectCellByPosition(
    workspaceNavigationGrid,
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
      {selectedCell && (
        <Box width="100%" flexDirection="column">
          <Text {...styles.info()}>{getCellLabel(selectedCell)}</Text>

          <Box>
            {selectedCell.type === "makefile" && (
              <Box>
                <Text {...styles.action()}>{selectedCell.command.name}</Text>
                <Text dimColor> → </Text>
                <Text>{selectedCell.command.exec}</Text>
              </Box>
            )}
            {selectedCell.type === "packageJson" && (
              <Box>
                <Text {...styles.action()}>{selectedCell.script.name}</Text>
                <Text dimColor> → </Text>
                <Text>{selectedCell.script.exec}</Text>
              </Box>
            )}
            {selectedCell.type === "composeCommand" && (
              <Box>
                <Text {...styles.action()}>{selectedCell.action.name}</Text>
                <Text dimColor> → </Text>
                <Text>{selectedCell.action.command}</Text>
              </Box>
            )}
            {selectedCell.type === "composeService" && (
              <Text>Service: {selectedCell.service.name}</Text>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}
