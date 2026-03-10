import { getConfig } from "../config/config.js"
import type { Project } from "../types/workspace.js"
import type {
  FacetQuickAction,
  WorkspaceQuickAction,
} from "../types/workspace-quick-actions.js"
import { formatFacetId } from "../utils/format.js"
import { logger } from "../utils/logging/logger.js"

export function useWorkspaceQuickActions(projects: Project[]) {
  const quickActions: WorkspaceQuickAction[] = []

  const config = getConfig()
  const configuredQuickActions = config.quickActions ?? []

  for (const project of projects) {
    const configuredWorkspaceAction = configuredQuickActions.find(
      (action) => action.workspacePath === project.path,
    )

    if (configuredWorkspaceAction) {
      quickActions.push(configuredWorkspaceAction)
      continue
    }

    const faccetQuickActions: FacetQuickAction[] = []

    // Priority 1: Makefile (dev, up)
    const makefile = project.facets.makefile
    let hasMakefileUp = false
    let hasMakefileUpDetached = false
    if (makefile) {
      const dev = makefile.commands.find((cmd) => cmd.name === "dev")
      if (dev)
        faccetQuickActions.push({
          facetId: formatFacetId(makefile.path, dev.name),
          facetType: "makefile",
          facetPath: makefile.path,
          name: dev.name,
          command: dev.command,
          exec: dev.exec,
        })
      const up = makefile.commands.find((cmd) => cmd.name === "up")
      if (up)
        faccetQuickActions.push({
          facetId: formatFacetId(makefile.path, up.name),
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
        faccetQuickActions.push({
          facetId: formatFacetId(makefile.path, upDetached.name),
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
          faccetQuickActions.push({
            facetId: formatFacetId(compose.path, "up"),
            facetType: "compose",
            facetPath: compose.path,
            name: "up",
            command: "docker compose up",
            exec: "docker compose up",
          })
        if (!hasMakefileUpDetached)
          faccetQuickActions.push({
            facetId: formatFacetId(compose.path, "up -d"),
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
        faccetQuickActions.push({
          facetId: formatFacetId(pkg.path, dev.name),
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
      faccetQuickActions.push({
        facetId: formatFacetId(compose.path, "up"),
        facetType: "compose",
        facetPath: compose.path,
        name: "up",
        command: "docker compose up",
        exec: "docker compose up",
      })
      faccetQuickActions.push({
        facetId: formatFacetId(compose.path, "up -d"),
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
