import { getConfig } from "../config/config.js"
import type { Project } from "../types/workspace.js"
import type {
  FacetQuickAction,
  WorkspaceQuickAction,
} from "../types/workspace-quick-actions.js"
import { logger } from "../utils/logging/logger.js"

export function useWorkspaceQuickActions(projects: Project[]) {
  const quickActions: WorkspaceQuickAction[] = []

  const config = getConfig()
  const configuredQuickActions = config.quickActions ?? []

  // Get automatic quick actions from workspace facets
  for (const project of projects) {
    const configuredWorkspaceAction = configuredQuickActions.find(
      (action) => action.workspacePath === project.path,
    )

    if (configuredWorkspaceAction) {
      quickActions.push(configuredWorkspaceAction)
      continue
    }

    const faccetQuickActions: FacetQuickAction[] = []
    let nextOrder = 0

    const pushFacetQuickAction = (action: Omit<FacetQuickAction, "order">) => {
      faccetQuickActions.push({
        ...action,
        order: nextOrder,
      })
      nextOrder += 1
    }

    // Priority 1: Makefile (dev, up)
    const makefile = project.facets.makefile
    let hasMakefileUp = false
    let hasMakefileUpDetached = false
    if (makefile) {
      const dev = makefile.commands.find((cmd) => cmd.name === "dev")
      if (dev)
        pushFacetQuickAction({
          facetType: "makefile",
          facetPath: makefile.path,
          name: dev.name,
          command: dev.command,
          exec: dev.exec,
        })
      const up = makefile.commands.find((cmd) => cmd.name === "up")
      if (up)
        pushFacetQuickAction({
          facetType: "makefile",
          facetPath: makefile.path,
          name: up.name,
          command: up.command,
          exec: up.exec,
        })
      hasMakefileUp = Boolean(up)
      const upDetached = makefile.commands.find(
        (cmd) => cmd.name === "up-detached",
      )
      if (upDetached)
        pushFacetQuickAction({
          facetType: "makefile",
          facetPath: makefile.path,
          name: "up -d",
          command: upDetached.command,
          exec: upDetached.exec,
        })
      hasMakefileUpDetached = Boolean(upDetached)

      if (project.facets.compose) {
        const compose = project.facets.compose
        if (!hasMakefileUp)
          pushFacetQuickAction({
            facetType: "compose",
            facetPath: compose.path,
            name: "up",
            command: "docker compose up",
            exec: "docker compose up",
          })
        if (!hasMakefileUpDetached)
          pushFacetQuickAction({
            facetType: "compose",
            facetPath: compose.path,
            name: "up -d",
            command: "docker compose up -d",
            exec: "docker compose up -d",
          })
      }
    }

    // Priority 2: package.json (dev)
    if (faccetQuickActions.length === 0 && project.facets.packageJson) {
      const pkg = project.facets.packageJson
      const dev = pkg.scripts.find((s) => s.name === "dev")
      if (dev)
        pushFacetQuickAction({
          facetType: "packageJson",
          facetPath: pkg.path,
          name: dev.name,
          command: dev.command,
          exec: dev.exec,
        })
    }

    // Priority 3: compose (up)
    if (faccetQuickActions.length === 0 && project.facets.compose) {
      const compose = project.facets.compose
      pushFacetQuickAction({
        facetType: "compose",
        facetPath: compose.path,
        name: "up",
        command: "docker compose up",
        exec: "docker compose up",
      })
      pushFacetQuickAction({
        facetType: "compose",
        facetPath: compose.path,
        name: "up -d",
        command: "docker compose up -d",
        exec: "docker compose up -d",
      })
    }

    const quickWorkspaceAction: WorkspaceQuickAction = {
      workspacePath: project.path,
      facets: faccetQuickActions,
    }
    quickActions.push(quickWorkspaceAction)
  }

  logger.debug(quickActions, "Quick Actions")
  return quickActions
}
