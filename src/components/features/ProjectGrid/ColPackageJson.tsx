import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"

import type { GridTheme } from "../../../theme/theme.js"
import type { PackageJsonCell } from "../../../types/project-grid.js"
import type { Project } from "../../../types/workspace.js"

type ColPackageJsonProps = {
  project: Project
  packageJsonCells: PackageJsonCell[]
  row: number
  col: number
}

export function ColPackageJson({
  project,
  packageJsonCells,
  row,
  col,
}: ColPackageJsonProps) {
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
        <Text {...styles.headerText()}>PACKAGE.JSON</Text>
        <Box width="100%">
          <Text>{project?.facets.packageJson?.name}</Text>
          {project?.facets.packageJson?.version && (
            <Text>{` v${project?.facets.packageJson?.version}`}</Text>
          )}
        </Box>
      </Box>
      {packageJsonCells.map((cell) => (
        <Box key={cell.script.command} width="100%">
          <Text
            {...styles.action()}
            inverse={row === cell.row && col === cell.col}
          >
            {cell.script.name}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
