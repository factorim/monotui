import { readFile } from "node:fs/promises"
import { dirname, join, relative, resolve } from "node:path"

import type { MakefileFacet } from "../../../types/project.js"
import { fileExists } from "../../../utils/fs/file.js"
import { logger } from "../../../utils/logging/logger.js"

export interface MakefileParseOptions {
  include?: string[]
  exclude?: string[]
  followIncludes?: boolean
}

export async function parseMakefile(
  dir: string,
  options: MakefileParseOptions = {},
): Promise<MakefileFacet | null> {
  const config = getConfig()
  const filenames = ["Makefile", "makefile", "GNUmakefile"]
  let foundFile: string | null = null
  let allTargets: MakefileCommand[] = []

  for (const filename of filenames) {
    const makefilePath = join(dir, filename)

    if (!(await fileExists(makefilePath))) {
      continue
    }

    const followIncludes = options.followIncludes ?? true
    const targets = await parseMakefileTargets(makefilePath, followIncludes)

    // Apply exclude filter
    let filteredTargets = targets

    // Hide "default" target unless showDefault is true
    if (config.discovery?.makefile?.showDefault === false) {
      filteredTargets = filteredTargets.filter((t) => t.name !== "default")
    }

    if (options.exclude && options.exclude.length > 0) {
      filteredTargets = filteredTargets.filter(
        (t) => !options.exclude?.includes(t.name),
      )
    }

    if (filteredTargets.length > 0) {
      foundFile = filename
      allTargets = filteredTargets
      break // Only parse the first found Makefile
    }
  }

  if (!foundFile || allTargets.length === 0) {
    return null
  }

  // Remove duplicates (keep first occurrence)
  const seenNames = new Set<string>()
  const commands = allTargets.filter((target) => {
    if (seenNames.has(target.name)) {
      return false
    }
    seenNames.add(target.name)
    return true
  })

  return {
    type: "makefile",
    filename: foundFile,
    path: relative(process.cwd(), join(dir, foundFile)),
    commands,
  }
}

import { getConfig } from "../../../config/config.js"
import type { MakefileCommand } from "../../../types/project.js"

async function parseSingleMakefile(
  makefilePath: string,
  visitedFiles: Set<string> = new Set(),
): Promise<{ targets: MakefileCommand[]; includes: string[] }> {
  // Prevent infinite loops
  if (visitedFiles.has(makefilePath)) {
    return { targets: [], includes: [] }
  }
  visitedFiles.add(makefilePath)

  if (!(await fileExists(makefilePath))) {
    return { targets: [], includes: [] }
  }

  try {
    const content = await readFile(makefilePath, "utf-8")
    const targets: MakefileCommand[] = []
    const includes: string[] = []
    const lines = content.split("\n")
    let currentTarget: string | null = null
    let currentCommand = ""

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith("#") || line.trim() === "") {
        continue
      }

      // Collect include statements
      if (line.trim().startsWith("include ")) {
        const includeMatch = line.match(/^include\s+(.+)$/)
        if (includeMatch) {
          const includePath = includeMatch[1].trim()
          const absolutePath = resolve(dirname(makefilePath), includePath)
          includes.push(absolutePath)
        }
        continue
      }

      // Target line (starts at column 0, contains :)
      if (line[0] !== "\t" && line.includes(":")) {
        // Skip variable assignments (NAME := value or NAME = value)
        if (line.includes(":=") || line.match(/^\s*[A-Z_]+\s*=/)) {
          continue
        }

        // Save previous target
        if (currentTarget) {
          targets.push({
            name: currentTarget,
            command: `make ${currentTarget}`,
            exec: currentCommand.trim(),
            port: undefined,
            description: undefined,
            dependencies: undefined,
          })
        }

        // Extract new target name (before the colon)
        const match = line.match(/^([a-zA-Z0-9_-]+)\s*:/)
        if (match) {
          currentTarget = match[1]
          currentCommand = ""
        }
      }
      // Command line (starts with tab)
      else if (line[0] === "\t" && currentTarget) {
        currentCommand += (currentCommand ? " && " : "") + line.trim()
      }
    }

    // Save last target
    if (currentTarget) {
      targets.push({
        name: currentTarget,
        command: `make ${currentTarget}`,
        exec: currentCommand.trim(),
        port: undefined,
        description: undefined,
        dependencies: undefined,
      })
    }

    return { targets, includes }
  } catch (error) {
    logger.debug(error, `Failed to read or parse Makefile at ${makefilePath}:`)
    return { targets: [], includes: [] }
  }
}

async function parseMakefileTargets(
  makefilePath: string,
  followIncludes = true,
  visitedFiles: Set<string> = new Set(),
): Promise<MakefileCommand[]> {
  const { targets, includes } = await parseSingleMakefile(
    makefilePath,
    visitedFiles,
  )

  if (!followIncludes) {
    return targets
  }

  // First add main file commands, then process includes in order
  const allTargets: MakefileCommand[] = [...targets]

  for (const includePath of includes) {
    const includedTargets = await parseMakefileTargets(
      includePath,
      true,
      visitedFiles,
    )
    allTargets.push(...includedTargets)
  }

  return allTargets
}
