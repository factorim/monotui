import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"

import type { GridTheme } from "../../../theme/theme.js"

export function ProjectCommands() {
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box gap={1}>
      <Text {...styles.action()}>&lt;enter&gt;</Text>
      <Text {...styles.text()}>Execute</Text>
      <Text {...styles.action()}>&lt;esc&gt;</Text>
      <Text {...styles.text()}>Quit</Text>
    </Box>
  )
}
