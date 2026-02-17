import { readdir } from "node:fs/promises"
import { basename, dirname, join, relative } from "node:path"

export interface ScanOptions {
  maxDepth: number
  ignore: string[]
}

export async function scanDirectories(
  rootDir: string,
  options: ScanOptions,
): Promise<string[]> {
  const directories: string[] = []

  async function scan(dir: string, depth: number) {
    if (depth > options.maxDepth) return

    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        // Skip ignored directories
        if (options.ignore.includes(entry.name)) continue
        if (entry.name.startsWith(".")) continue

        if (entry.isDirectory()) {
          const fullPath = join(dir, entry.name)
          directories.push(fullPath)
          await scan(fullPath, depth + 1)
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  // Add root directory
  directories.push(rootDir)
  await scan(rootDir, 0)

  return directories
}

export function getDirectoryName(filePath: string, rootDir: string): string {
  const dir = dirname(filePath)
  const relativePath = relative(rootDir, dir)

  // If in root, use directory name
  if (relativePath === "") {
    return basename(dir)
  }

  return relativePath.replace(/\\/g, "/")
}
