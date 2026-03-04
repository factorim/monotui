import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { ProjectGridContext } from "../../../contexts/ProjectGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getProjectCellByPosition } from "../../../utils/project/project-grid.js"
import { Runner } from "../../ui/Runner.js"

export function ProjectInfo() {
  const { projectGrid, row, col } = useContext(ProjectGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const selectedCell = getProjectCellByPosition(projectGrid, row, col)

  return (
    <Box
      width="100%"
      paddingLeft={1}
      paddingRight={1}
      justifyContent="space-between"
    >
      {selectedCell ? (
        <Box width="100%" flexDirection="column">
          <Box gap={1}>
            <Text {...styles.info()} inverse>
              {` ${selectedCell.filepath} `}
            </Text>

            {selectedCell.type === "makefile" && (
              <Box gap={1}>
                <Text {...styles.action()} inverse>
                  {` ${selectedCell.command.name} `}
                </Text>
                <Text {...styles.action()} wrap="truncate">
                  {selectedCell.command.exec}
                </Text>
              </Box>
            )}
            {selectedCell.type === "packageJson" && (
              <Box gap={1}>
                <Text {...styles.action()} inverse>
                  {` ${selectedCell.script.name} `}
                </Text>

                <Text {...styles.action()}>{selectedCell.script.exec}</Text>
              </Box>
            )}
            {selectedCell.type === "composeCommand" && (
              <Box gap={1}>
                <Text {...styles.action()} inverse>
                  {` ${selectedCell.action.command} `}
                </Text>
              </Box>
            )}
            {selectedCell.type === "composeService" && (
              <Text>Service: {selectedCell.service.name}</Text>
            )}
          </Box>
        </Box>
      ) : (
        <Box></Box>
      )}
      <Box>
        <Runner />
      </Box>
    </Box>
  )
}
