import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { getConfig } from "../../config/config.js"
import type { GridTheme } from "../../theme/theme.js"
import { capitalize } from "../../utils/format.js"

export function Runner() {
  const config = getConfig()
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box gap={1}>
      <Text {...styles.text()} dimColor>
        Runner:
      </Text>
      <Text {...styles.action()}>
        {config.execution?.runner
          ? capitalize(config.execution.runner)
          : undefined}
      </Text>
    </Box>
  )
}
