import { ThemeProvider } from "@inkjs/ui"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { withFullScreen } from "fullscreen-ink"

import { getConfig } from "../config/config.js"
import { NotificationProvider } from "../contexts/NotificationContext.js"
import { PageNavigationProvider } from "../contexts/PageNavigationContext.js"
import { WorkspaceDiscoveryProvider } from "../contexts/WorkspaceDiscoveryContext.js"
import { getAppTheme } from "../theme/theme.js"
import { Layout } from "./Layout.js"

const queryClient = new QueryClient()

export function App() {
  const config = getConfig()
  const theme = getAppTheme(config.theme)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <WorkspaceDiscoveryProvider>
            <PageNavigationProvider>
              <Layout />
            </PageNavigationProvider>
          </WorkspaceDiscoveryProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export async function startApp() {
  const ink = withFullScreen(<App />)
  await ink.start()
  await ink.waitUntilExit()
}
