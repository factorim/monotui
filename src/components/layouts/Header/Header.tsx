import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext, useEffect, useState } from "react"

import { WorkspaceDiscoveryContext } from "../../../contexts/WorkspaceDiscoveryContext.js"
import type { GridTheme } from "../../../theme/theme.js"
import { getPackageVersion } from "../../../utils/fs/package-json.js"
import { ProjectCommands } from "./ProjectCommands.js"
import { WorkspaceCommands } from "./WorkspaceCommands.js"

export function Header() {
  const { workspace, project } = useContext(WorkspaceDiscoveryContext)
  const [version, setVersion] = useState<string>("")
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  useEffect(() => {
    getPackageVersion().then(setVersion)
  }, [])

  return (
    <Box
      width="100%"
      paddingX={1}
      justifyContent="space-between"
      borderStyle="single"
      borderTop={false}
      borderBottom={true}
      borderLeft={false}
      borderRight={false}
      {...styles.border()}
    >
      <Text {...styles.title()}>{workspace?.name}</Text>

      <Box paddingX={1}>
        {project ? <ProjectCommands /> : <WorkspaceCommands />}
      </Box>
      <Box gap={1}>
        <Text {...styles.title()} inverse>
          {` MonoTUI `}
        </Text>
        <Text {...styles.text()} dimColor>{`v${version}`}</Text>
      </Box>
    </Box>
  )
}
