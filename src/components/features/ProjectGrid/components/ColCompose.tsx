import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"

import type { GridTheme } from "../../../../theme/theme.js"
import type {
  ComposeCommandCell,
  ComposeServiceCell,
} from "../../../../types/project-grid.js"
import type { RuntimeStatus } from "../../../../types/workspace-runtime.js"

type ColComposeProps = {
  composeCommandCells: ComposeCommandCell[]
  composeServiceCells: ComposeServiceCell[]
  composeServiceStatuses?: Record<string, RuntimeStatus>
  row: number
  col: number
}

export function ColCompose({
  composeCommandCells,
  composeServiceCells,
  composeServiceStatuses,
  row,
  col,
}: ColComposeProps) {
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box flexDirection="column" width="32%">
      <Box flexDirection="column" width="100%">
        <Text {...styles.headerText()}>DOCKER COMPOSE</Text>
        {/* <Text {...styles.info()} dimColor>
          {composeCommandCells[0]?.filepath}
        </Text> */}
      </Box>

      {composeCommandCells.map((cell) => (
        <Box key={cell.action.name} width="100%">
          <Text
            {...styles.action()}
            inverse={row === cell.row && col === cell.col}
          >
            {cell.action.name}
          </Text>
        </Box>
      ))}

      <Box flexDirection="column" borderStyle="single" marginTop={1}>
        {composeServiceCells.map((cell, index) => {
          const isSelected = row === cell.row && col === cell.col
          const serviceStatus = composeServiceStatuses?.[cell.service.name]

          return (
            <Box
              key={cell.service.name}
              flexDirection="column"
              borderStyle="single"
              borderTop={false}
              borderBottom={index < composeServiceCells.length - 1}
              borderLeft={false}
              borderRight={false}
              borderColor={
                isSelected ? styles.action().color : styles.text().color
              }
              paddingX={1}
            >
              <Text
                {...(serviceStatus
                  ? styles.runtime({ status: serviceStatus })
                  : isSelected
                    ? styles.action()
                    : styles.text())}
                inverse={isSelected}
              >
                {cell.service.name}
              </Text>
              {cell.service.image && (
                <Text {...styles.text()}>{cell.service.image}</Text>
              )}
              {cell.service.ports && cell.service.ports.length > 0 && (
                <Text {...styles.text()}>
                  Ports: {cell.service.ports.join(", ")}
                </Text>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
