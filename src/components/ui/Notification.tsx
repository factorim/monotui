import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { NotificationContext } from "../../contexts/NotificationContext.js"
import type { GridTheme } from "../../theme/theme.js"

export function Notification() {
  const { notification } = useContext(NotificationContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  return (
    <Box>
      {notification && (
        <Text
          {...(notification.type === "error"
            ? styles.error()
            : notification.type === "success"
              ? styles.runtime({ status: "running" })
              : styles.notification())}
        >
          {notification.message}
        </Text>
      )}
    </Box>
  )
}
