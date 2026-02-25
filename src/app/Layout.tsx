import { Box, Text } from "ink"
import { useContext } from "react"

import { PageNavigationContext } from "../contexts/PageNavigationContext.js"
import { Page } from "../types/page.js"
import { ProjectPage } from "./pages/ProjectPage.js"
import { WorkspacePage } from "./pages/WorkspacePage.js"

export function Layout() {
  const { currentPage } = useContext(PageNavigationContext)

  if (currentPage === Page.Exit) {
    return (
      <Box>
        <Text>Exiting...</Text>
      </Box>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.Workspace:
        return <WorkspacePage />
      case Page.Project:
        return <ProjectPage />
    }
  }

  return (
    <Box flexDirection="column" width="100%">
      {renderPage()}
    </Box>
  )
}
