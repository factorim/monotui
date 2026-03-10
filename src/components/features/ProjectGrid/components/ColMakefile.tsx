import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import type { GridTheme } from "../../../../theme/theme"
import type { MakefileCell } from "../../../../types/project-grid"
import type { WorkspaceQuickAction } from "../../../../types/workspace-quick-actions"
import { hasFacetQuickAction } from "../../../../utils/project/quick-actions.js"

type ColMakefileProps = {
  makefileCells: MakefileCell[]
  row: number
  col: number
  workspaceQuickAction?: WorkspaceQuickAction
}

export function ColMakefile({
  makefileCells,
  row,
  col,
  workspaceQuickAction,
}: ColMakefileProps) {
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box flexDirection="column" width="32%">
      <Box flexDirection="column" width="100%">
        <Text {...styles.headerText()}>MAKEFILE</Text>
      </Box>
      {makefileCells.map((cell) => {
        const facetQuickAction = hasFacetQuickAction(
          workspaceQuickAction,
          cell.filepath,
          cell.command.name,
        )

        return (
          <Box key={cell.command.command} width="100%" gap={1}>
            <Text
              {...styles.action()}
              inverse={row === cell.row && col === cell.col}
            >
              {cell.command.name}
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
