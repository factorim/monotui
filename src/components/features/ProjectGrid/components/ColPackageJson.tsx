import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"

import type { GridTheme } from "../../../../theme/theme.js"
import type { PackageJsonCell } from "../../../../types/project-grid.js"
import type { Project } from "../../../../types/workspace.js"
import type { WorkspaceQuickAction } from "../../../../types/workspace-quick-actions.js"
import { hasFacetQuickAction } from "../../../../utils/project/quick-actions.js"

type ColPackageJsonProps = {
  project: Project
  packageJsonCells: PackageJsonCell[]
  row: number
  col: number
  workspaceQuickAction: WorkspaceQuickAction
}

export function ColPackageJson({
  packageJsonCells,
  row,
  col,
  workspaceQuickAction,
}: ColPackageJsonProps) {
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box flexDirection="column" width="32%">
      <Box flexDirection="column" width="100%">
        <Text {...styles.headerText()}>PACKAGE.JSON</Text>
      </Box>
      {packageJsonCells.map((cell) => {
        const facetQuickAction = hasFacetQuickAction(
          workspaceQuickAction,
          cell.filepath,
          cell.script.name,
        )
        return (
          <Box key={cell.script.command} width="100%" gap={1}>
            <Text
              {...styles.action()}
              inverse={row === cell.row && col === cell.col}
            >
              {cell.script.name}
            </Text>
            {facetQuickAction && (
              <Text {...styles.notification()}>
                {facetQuickAction.order != null
                  ? `[q${facetQuickAction.order}]`
                  : "[q]"}
              </Text>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
