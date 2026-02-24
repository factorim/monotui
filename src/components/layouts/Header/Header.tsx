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
    <Box width="100%" paddingX={1} flexDirection="column">
      <Box width="full" justifyContent="space-between">
        <Text {...styles.monorepoTitle()}>{workspace?.name}</Text>

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
      {project ? (
        <Box>
          <Text {...styles.text()}>
            {project.name}
            {project?.facets.packageJson?.version && (
              <Text>{` v${project?.facets.packageJson?.version}`}</Text>
            )}
          </Text>
          <Text {...styles.text()} dimColor>
            {project.description && ` - ${project.description}`}
          </Text>
        </Box>
      ) : (
        <Box>
          <Text>&nbsp;</Text>
        </Box>
      )}
    </Box>
  )
}
