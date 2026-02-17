import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { WorkspaceGridContext } from "../../../contexts/WorkspaceGridContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import type { WorkspacesNavigationCell } from "../../../types/workspace-grid.js"
import {
  getWorkspaceCell,
  getWorkspaceQuickActionCells,
  getWorkspaceRuntimeCells,
} from "../../../utils/workspace/workspace-grid.js"

interface WorkspaceRowProps {
  cells: (WorkspacesNavigationCell | null)[]
  rowNb: number
  quickActionColSizes: number[]
}

export function WorkspaceRow({
  cells,
  rowNb,
  quickActionColSizes,
}: WorkspaceRowProps) {
  const { row, col } = useContext(WorkspaceGridContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  const workspaceCell = getWorkspaceCell(cells)
  const quickActionCells = getWorkspaceQuickActionCells(cells)
  const runtimeCells = getWorkspaceRuntimeCells(cells)

  const packageJsonFacet = workspaceCell?.workspace.facets.packageJson

  return (
    <Box
      width="100%"
      borderColor={"gray"}
      backgroundColor={row === rowNb ? "#0b1515" : undefined}
    >
      <Box width="3%">
        <Text {...styles.text()}>{rowNb + 1}</Text>
      </Box>
      <Box width="17%">
        <Text
          {...styles.action()}
          inverse={row === workspaceCell?.row && col === workspaceCell?.col}
        >
          {workspaceCell?.workspace.folder}
        </Text>
        {packageJsonFacet?.framework && (
          <Text {...styles.text()} dimColor>
            {" "}
            ({packageJsonFacet?.framework})
          </Text>
        )}
      </Box>
      <Box width="10%">
        <Text {...styles.text()} dimColor>
          {workspaceCell?.workspace.type}
        </Text>
      </Box>
      <Box width="20%">
        <Text {...styles.text()} dimColor>
          {workspaceCell?.workspace.path}
        </Text>
      </Box>
      <Box width="20%" gap={2}>
        {quickActionCells.map((actionCell, index) => (
          <Box
            key={`qa-${actionCell.col}-${actionCell.row}`}
            flexDirection="row"
            width={quickActionColSizes[index] ?? actionCell.action.name.length}
          >
            <Box>
              <Text
                {...styles.action()}
                inverse={row === actionCell?.row && col === actionCell?.col}
              >
                {actionCell.action.name}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      <Box width="30%" gap={1}>
        {runtimeCells.map((runtimeCell, index) => (
          <Box
            key={`rt-${runtimeCell.col}-${runtimeCell.row}`}
            flexDirection="row"
          >
            <Box>
              <Text
                {...styles.runtime({ status: runtimeCell.runState.status })}
                inverse={row === runtimeCell?.row && col === runtimeCell?.col}
              >
                {runtimeCell.runState.name}
                {Number.isInteger(runtimeCell.runState.port) &&
                  runtimeCell.runState.port !== 0 &&
                  `:${runtimeCell.runState.port}`}
              </Text>
            </Box>
            {index < runtimeCells.length - 1 && (
              <Box width={1} justifyContent="center" alignItems="center">
                <Text {...styles.text()} dimColor>
                  {" "}
                </Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
