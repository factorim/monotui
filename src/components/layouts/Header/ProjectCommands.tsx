import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { getConfig } from "../../../config/config.js"
import { ProjectGridContext } from "../../../contexts/ProjectGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getProjectCellByPosition } from "../../../utils/project/project-grid.js"
import {
  findWorkspaceQuickAction,
  hasFacetQuickAction,
} from "../../../utils/project/quick-actions.js"

export function ProjectCommands() {
  const config = getConfig()
  const { project, projectGrid, row, col } = useContext(ProjectGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const selectedCell = getProjectCellByPosition(projectGrid, row, col)
  const workspaceQuickAction = findWorkspaceQuickAction(
    config.quickActions ?? [],
    project?.path ?? "",
  )

  const selectedFacetQuickAction = selectedCell
    ? selectedCell.type === "makefile"
      ? hasFacetQuickAction(
          workspaceQuickAction,
          selectedCell.filepath,
          selectedCell.command.name,
        )
      : selectedCell.type === "packageJson"
        ? hasFacetQuickAction(
            workspaceQuickAction,
            selectedCell.filepath,
            selectedCell.script.name,
          )
        : selectedCell.type === "composeCommand"
          ? hasFacetQuickAction(
              workspaceQuickAction,
              selectedCell.filepath,
              selectedCell.action.name,
            )
          : undefined
    : undefined

  return (
    <Box gap={1}>
      <Text {...styles.action()}>&lt;enter&gt;</Text>
      <Text {...styles.text()}>Execute</Text>
      <Text {...styles.action()}>&lt;q&gt;</Text>
      <Text {...styles.text()}>Quick Action</Text>
      {selectedFacetQuickAction && (
        <>
          <Text {...styles.action()}>&lt;o&gt;</Text>
          <Text {...styles.text()}>Order</Text>
        </>
      )}
      <Text {...styles.action()}>&lt;esc&gt;</Text>
      <Text {...styles.text()}>Quit</Text>
    </Box>
  )
}
