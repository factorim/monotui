import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"

import type { GridTheme } from "../../../../theme/theme.js"

export function EmptyCol() {
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box flexDirection="column" width="32%">
      <Box flexDirection="column" width="100%">
        <Text {...styles.text()}>&nbsp;</Text>
        <Box width="100%">
          <Text>&nbsp;</Text>
        </Box>
      </Box>
    </Box>
  )
}
