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
  composeServicePorts?: Record<string, number>
  row: number
  col: number
}

export function ColCompose({
  composeCommandCells,
  composeServiceCells,
  composeServiceStatuses,
  composeServicePorts,
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
            {cell.action.name} - {cell.filepath}
          </Text>
        </Box>
      ))}

      <Box flexDirection="column" borderStyle="single" marginTop={1}>
        {composeServiceCells.map((cell, index) => {
          const isSelected = row === cell.row && col === cell.col
          const serviceStatus = composeServiceStatuses?.[cell.service.name]
          const runtimePort = composeServicePorts?.[cell.service.name]
          const displayedPorts =
            runtimePort != null ? [runtimePort] : (cell.service.ports ?? [])

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
                <Box gap={1}>
                  <Text {...styles.text()} dimColor>
                    image:
                  </Text>
                  <Text {...styles.text()}>{cell.service.image}</Text>
                </Box>
              )}
              {displayedPorts.length > 0 && (
                <Box gap={1}>
                  <Text {...styles.text()} dimColor>
                    ports:
                  </Text>
                  <Text {...styles.text()}>{displayedPorts.join(", ")}</Text>
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
