import type { Project } from "../types/workspace.js"
import type {
  FacetQuickAction,
  WorkspaceQuickAction,
} from "../types/workspace-quick-actions.js"
import { logger } from "../utils/logging/logger.js"

export function useWorkspaceQuickActions(projects: Project[]) {
  const quickActions: WorkspaceQuickAction[] = []

  for (const project of projects) {
    const faccetQuickActions: FacetQuickAction[] = []

    // Priority 1: Makefile (dev, up)
    const makefile = project.facets.makefile
    let hasMakefileUp = false
    let hasMakefileUpDetached = false
    if (makefile) {
      const dev = makefile.commands.find((cmd) => cmd.name === "dev")
      if (dev)
        faccetQuickActions.push({
          facetType: "makefile",
          facetPath: makefile.path,
          name: dev.name,
          command: dev.command,
          exec: dev.exec,
          order: 1,
        })
      const up = makefile.commands.find((cmd) => cmd.name === "up")
      if (up)
        faccetQuickActions.push({
          facetType: "makefile",
          facetPath: makefile.path,
          name: up.name,
          command: up.command,
          exec: up.exec,
          order: 2,
        })
      hasMakefileUp = Boolean(up)
      const upDetached = makefile.commands.find(
        (cmd) => cmd.name === "up-detached",
      )
      if (upDetached)
        faccetQuickActions.push({
          facetType: "makefile",
          facetPath: makefile.path,
          name: "up -d",
          command: upDetached.command,
          exec: upDetached.exec,
          order: 2,
        })
      hasMakefileUpDetached = Boolean(upDetached)

      if (project.facets.compose) {
        const compose = project.facets.compose
        if (!hasMakefileUp)
          faccetQuickActions.push({
            facetType: "compose",
            facetPath: compose.path,
            name: "up",
            command: "docker compose up",
            exec: "docker compose up",
            order: 2,
          })
        if (!hasMakefileUpDetached)
          faccetQuickActions.push({
            facetType: "compose",
            facetPath: compose.path,
            name: "up -d",
            command: "docker compose up -d",
            exec: "docker compose up -d",
            order: 2,
          })
      }
    }

    // Priority 2: package.json (dev)
    if (faccetQuickActions.length === 0 && project.facets.packageJson) {
      const pkg = project.facets.packageJson
      const dev = pkg.scripts.find((s) => s.name === "dev")
      if (dev)
        faccetQuickActions.push({
          facetType: "packageJson",
          facetPath: pkg.path,
          name: dev.name,
          command: dev.command,
          exec: dev.exec,
          order: 1,
        })
    }

    // Priority 3: compose (up)
    if (faccetQuickActions.length === 0 && project.facets.compose) {
      const compose = project.facets.compose
      faccetQuickActions.push({
        facetType: "compose",
        facetPath: compose.path,
        name: "up",
        command: "docker compose up",
        exec: "docker compose up",
        order: 1,
      })
      faccetQuickActions.push({
        facetType: "compose",
        facetPath: compose.path,
        name: "up -d",
        command: "docker compose up -d",
        exec: "docker compose up -d",
        order: 2,
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
