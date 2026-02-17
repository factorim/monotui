import { ThemeProvider } from "@inkjs/ui"
import { render } from "ink"

import { getConfig } from "../config/config.js"
import { PageNavigationProvider } from "../contexts/PageNavigationContext.js"
import { WorkspaceDiscoveryProvider } from "../contexts/WorkspaceDiscoveryContext.js"
import { getAppTheme } from "../theme/theme.js"
import { Layout } from "./Layout.js"

export function App() {
  const config = getConfig()
  const theme = getAppTheme(config.theme)

  return (
    <ThemeProvider theme={theme}>
      <WorkspaceDiscoveryProvider>
        <PageNavigationProvider>
          <Layout />
        </PageNavigationProvider>
      </WorkspaceDiscoveryProvider>
    </ThemeProvider>
  )
}

render(<App />)
