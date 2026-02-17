import { basename } from "node:path"

import { getConfig } from "../../config/config.js"
import type { Project, ProjectType } from "../../types/project"
import { scanDirectories } from "../../utils/fs/directories.js"
import { logger } from "../../utils/logging/logger.js"
import { parseDockerCompose } from "./facets/compose-parser.js"
import { parseMakefile } from "./facets/makefile-parser.js"
import { parsePackageJson } from "./facets/package-json-parser.js"

export async function discoverWorkspaces(rootPath: string): Promise<Project[]> {
  const config = getConfig()
  const directories = await scanDirectories(rootPath, {
    maxDepth: 4,
    ignore: config.discovery?.ignore || [],
  })
  logger.debug(directories, "Scanned Directories")

  const workspaces: Project[] = []
  for (const dir of directories) {
    const packageFacet = await parsePackageJson(dir)

    const composeFacet = await parseDockerCompose(dir)

    const makefileFacet = await parseMakefile(dir)

    if (packageFacet || composeFacet || makefileFacet) {
      const relPath = dir.startsWith(rootPath)
        ? dir.slice(rootPath.length).replace(/^\/+/, "")
        : dir
      const type = await determineProjectType(relPath)
      const workspace: Project = {
        type,
        folder: basename(dir),
        path: relPath || ".",
        absolutePath: dir,
        facets: {
          packageJson: packageFacet || undefined,
          compose: composeFacet || undefined,
          makefile: makefileFacet || undefined,
        },
      }
      workspaces.push(workspace)
    }
  }

  const orderedWorkspaces = orderWorkspaces(
    workspaces,
    config.discovery?.order || [],
  )

  return orderedWorkspaces
}

/**
 * Determine the workspace type based on location and facets
 */
async function determineProjectType(dir: string): Promise<ProjectType> {
  const config = getConfig()

  const appFolders = config.discovery?.folders?.app || ["apps"]
  const packageFolders = config.discovery?.folders?.package || ["packages"]
  const infraFolders = config.discovery?.folders?.infra || ["infra"]
  const contractFolders = config.discovery?.folders?.contract || ["contracts"]

  if (dir === "") {
    return "workspace"
  }
  for (const folder of appFolders) {
    if (dir.split("/").includes(folder)) {
      return "app"
    }
  }
  for (const folder of infraFolders) {
    if (dir.split("/").includes(folder)) {
      return "infra"
    }
  }
  for (const folder of packageFolders) {
    if (dir.split("/").includes(folder)) {
      return "package"
    }
  }
  for (const folder of contractFolders) {
    if (dir.split("/").includes(folder)) {
      return "contract"
    }
  }

  // 5. Default to 'app'
  return "app"
}

export function orderWorkspaces(
  workspaces: Project[],
  order: string[],
): Project[] {
  return workspaces
    .filter((w) => order.includes(w.type))
    .sort((a, b) => {
      const aIndex = order.indexOf(a.type)
      const bIndex = order.indexOf(b.type)
      return aIndex - bIndex
    })
}
