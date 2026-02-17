import { readFile, stat } from "node:fs/promises"
import { join } from "node:path"
import type { PackageJson } from "type-fest"

export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

export async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, "utf-8")
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

/**
 * Generic helper to read package.json from a directory
 */
export async function getPackageJson(dir: string): Promise<PackageJson | null> {
  const packagePath = join(dir, "package.json")
  if (!(await fileExists(packagePath))) {
    return null
  }
  return readJsonFile<PackageJson>(packagePath)
}
