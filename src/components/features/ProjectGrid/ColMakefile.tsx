import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import type { GridTheme } from "../../../theme/theme.js"
import type { MakefileCell } from "../../../types/project-grid"

type ColMakefileProps = {
  makefileCells: MakefileCell[]
  row: number
  col: number
}

export function ColMakefile({ makefileCells, row, col }: ColMakefileProps) {
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box flexDirection="column" width="32%">
      <Box
        flexDirection="column"
        width="100%"
        borderStyle="single"
        borderTop={false}
        borderBottom={true}
        borderLeft={false}
        borderRight={false}
        {...styles.border()}
      >
        <Text {...styles.headerText()}>MAKEFILE</Text>
        <Box width="100%">
          <Text>&nbsp;</Text>
        </Box>
      </Box>
      {makefileCells.map((cell) => (
        <Box key={cell.command.command} width="100%">
          <Text
            {...styles.action()}
            inverse={row === cell.row && col === cell.col}
          >
            {cell.command.name}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
