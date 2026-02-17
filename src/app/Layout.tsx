import { useComponentTheme } from "@inkjs/ui"
import { Box } from "ink"
import { useContext } from "react"

import { PageNavigationContext } from "../contexts/PageNavigationContext.js"
import type { AppLayoutTheme } from "../theme/theme.js"
import { Page } from "../types/page.js"
import { ExitPage } from "./pages/Exit.js"
import { ProjectPage } from "./pages/ProjectPage.js"
import { WorkspacePage } from "./pages/WorkspacePage.js"

export function Layout() {
  const { currentPage } = useContext(PageNavigationContext)
  const { styles } = useComponentTheme<AppLayoutTheme>("AppLayout")

  const renderPage = () => {
    switch (currentPage) {
      case Page.Workspace:
        return <WorkspacePage />
      case Page.Project:
        return <ProjectPage />
      case Page.Exit:
        return <ExitPage />
    }
  }

  return (
    <Box
      flexDirection="column"
      width="100%"
      borderStyle="single"
      {...styles.container()}
    >
      {renderPage()}
    </Box>
  )
}
