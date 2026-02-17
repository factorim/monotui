import { existsSync } from "node:fs"
import { join, relative } from "node:path"
import type { PackageJson } from "type-fest"

import type {
  PackageJsonFacet,
  PackageJsonScript,
  PackageManager,
} from "../../../types/project.js"
import { getPackageJson } from "../../../utils/fs/file.js"
import { detectFramework } from "../../../utils/workspace/framework-detector.js"

export interface ManifestParseOptions {
  include?: string[]
  exclude?: string[]
}

export async function parsePackageJson(
  dir: string,
  options: ManifestParseOptions = {},
): Promise<PackageJsonFacet | null> {
  const pkg = await getPackageJson(dir)

  if (!pkg) return null

  let scripts = pkg.scripts || {}

  // Apply exclude filter
  if (options.exclude && options.exclude.length > 0) {
    scripts = Object.fromEntries(
      Object.entries(scripts).filter(
        ([key]) => !options.exclude?.includes(key),
      ),
    )
  }

  const framework = detectFramework(pkg)
  const packageManager = await detectPackageManager(dir, pkg)
  const scriptArray = parseScripts(scripts, packageManager)

  return {
    type: "packageJson",
    filename: "package.json",
    path: relative(process.cwd(), join(dir, "package.json")),
    name: pkg.name ?? "",
    version: pkg.version,
    framework,
    packageManager,
    description: pkg.description,
    scripts: scriptArray,
  }
}

function parseScripts(
  scripts: PackageJson.Scripts,
  packageManager: PackageManager,
): PackageJsonScript[] {
  return Object.entries(scripts)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .map(([name, exec]) => {
      // Extract port from common patterns
      const port = extractPort(exec)

      // Build the command to run the script
      const command = buildScriptCommand(packageManager, name)

      return {
        name,
        command,
        exec,
        port,
      }
    })
}

function buildScriptCommand(
  packageManager: PackageManager,
  scriptName: string,
): string {
  switch (packageManager) {
    case "npm":
      return `npm run ${scriptName}`
    case "yarn":
      return `yarn ${scriptName}`
    case "pnpm":
      return `pnpm run ${scriptName}`
    case "bun":
      return `bun run ${scriptName}`
    case "deno":
      return `deno task ${scriptName}`
    default:
      return `npm run ${scriptName}`
  }
}

function extractPort(exec: string): number {
  // Match common port patterns
  const patterns = [
    /-p\s+(\d+)/, // -p 8000
    /--port[=\s]+(\d+)/, // --port=8000 or --port 8000
    /PORT=(\d+)/, // PORT=8000
    /:(\d{4,5})\b/, // :8000
  ]

  for (const pattern of patterns) {
    const match = exec.match(pattern)
    if (match?.[1]) {
      const port = parseInt(match[1], 10)
      if (port > 0 && port <= 65535) {
        return port
      }
    }
  }

  return 0
}

async function detectPackageManager(
  dir: string,
  pkg: PackageJson,
): Promise<PackageManager> {
  // 1. Check package.json packageManager field (most explicit)
  if (pkg.packageManager) {
    if (pkg.packageManager.startsWith("npm")) return "npm"
    if (pkg.packageManager.startsWith("yarn")) return "yarn"
    if (pkg.packageManager.startsWith("pnpm")) return "pnpm"
    if (pkg.packageManager.startsWith("bun")) return "bun"
    if (pkg.packageManager.startsWith("deno")) return "deno"
  }

  // 2. Check for lockfiles (most reliable heuristic)
  if (existsSync(join(dir, "bun.lockb"))) return "bun"
  if (existsSync(join(dir, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(join(dir, "yarn.lock"))) return "yarn"
  if (existsSync(join(dir, "package-lock.json"))) return "npm"
  if (existsSync(join(dir, "deno.lock"))) return "deno"

  // 3. Check for workspace configuration files
  if (existsSync(join(dir, "pnpm-workspace.yaml"))) return "pnpm"

  // 4. Check package.json workspaces field format
  if (pkg.workspaces) {
    // Yarn berry uses a specific format
    if (typeof pkg.workspaces === "object" && "packages" in pkg.workspaces) {
      return "yarn"
    }
  }

  // 5. Default fallback
  return "npm"
}
