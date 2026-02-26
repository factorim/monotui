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
import { ResponsiveBox } from "../../ui/ResponsiveBox.js"

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

  const packageJsonFacet = workspaceCell?.project.facets.packageJson

  return (
    <Box
      width="100%"
      borderColor={"gray"}
      backgroundColor={row === rowNb ? "#0b1515" : undefined}
    >
      <ResponsiveBox width={{ s: "25%", m: "25%", l: "24%", xl: "24%" }}>
        <Text
          {...styles.action()}
          inverse={row === workspaceCell?.row && col === workspaceCell?.col}
        >
          {workspaceCell?.project.name}
        </Text>
        {packageJsonFacet?.framework && (
          <Text {...styles.text()} dimColor>
            {" "}
            ({packageJsonFacet?.framework})
          </Text>
        )}
      </ResponsiveBox>
      <ResponsiveBox width={{ s: null, m: "15%", l: "14%", xl: "18%" }}>
        <Text {...styles.text()} dimColor>
          {workspaceCell?.project.type}
        </Text>
      </ResponsiveBox>
      <ResponsiveBox width={{ s: null, m: null, l: "24%", xl: "28%" }}>
        <Text {...styles.text()} dimColor>
          {workspaceCell?.project.path}
        </Text>
      </ResponsiveBox>
      <ResponsiveBox
        width={{ s: "30%", m: "25%", l: "24%", xl: "28%" }}
        gap={3}
      >
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
      </ResponsiveBox>

      <ResponsiveBox
        width={{ s: "45%", m: "35%", l: "23%", xl: "23%" }}
        gap={3}
      >
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
      </ResponsiveBox>
    </Box>
  )
}
