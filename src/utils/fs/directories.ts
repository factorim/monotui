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

  const normalizeIgnore = (value: string) =>
    value
      .trim()
      .replace(/\\/g, "/")
      .replace(/^\.(\/|$)/, "")
      .replace(/^\//, "")
      .replace(/\/+$/, "")

  const ignored = options.ignore.map(normalizeIgnore).filter(Boolean)

  const shouldIgnoreDir = (fullPath: string, entryName: string) => {
    if (ignored.length === 0) return false

    // 1) Leaf-name ignore (backwards compatible)
    if (ignored.includes(entryName)) return true

    // 2) Root-relative path ignore (e.g. "apps/ignored")
    const rel = normalizeIgnore(relative(rootDir, fullPath))
    if (!rel) return false
    return ignored.some(
      (pattern) => rel === pattern || rel.startsWith(`${pattern}/`),
    )
  }

  async function scan(dir: string, depth: number) {
    if (depth > options.maxDepth) return

    try {
      const entries = await readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        // Skip ignored directories
        if (entry.name.startsWith(".")) continue

        if (entry.isDirectory()) {
          const fullPath = join(dir, entry.name)

          if (shouldIgnoreDir(fullPath, entry.name)) continue

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
