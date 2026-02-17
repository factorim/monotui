import { useComponentTheme } from "@inkjs/ui"
import { Box, Text } from "ink"
import { useContext } from "react"

import { ProjectGrid } from "../../components/features/ProjectGrid/ProjectGrid.js"
import { ProjectInfo } from "../../components/features/ProjectGrid/ProjectInfo.js"
import { Header } from "../../components/layouts/Header/Header.js"
import { PageNavigationContext } from "../../contexts/PageNavigationContext.js"
import { ProjectGridProvider } from "../../contexts/ProjectGridContext.js"
import { WorkspaceDiscoveryContext } from "../../contexts/WorkspaceDiscoveryContext.js"
import type { GridTheme } from "../../theme/theme.js"

export function ProjectPage() {
  const { setPage } = useContext(PageNavigationContext)
  const { project, setProject } = useContext(WorkspaceDiscoveryContext)
  const { styles } = useComponentTheme<GridTheme>("GridTheme")

  if (!project) {
    return (
      <Box>
        <Text {...styles.error()}>No project selected</Text>
      </Box>
    )
  }

  return (
    <ProjectGridProvider
      setPage={setPage}
      project={project}
      setProject={setProject}
    >
      <Header />
      <ProjectGrid />
      <ProjectInfo />
    </ProjectGridProvider>
  )
}
