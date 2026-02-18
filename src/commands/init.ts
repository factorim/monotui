import { existsSync } from "node:fs"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { DEFAULT_CONFIG } from "../config/defaults.js"
import type { Config } from "../types/config.js"

const CONFIG_FILENAME = "monotui.config.mjs"

/**
 * Convert object to JavaScript literal syntax (without quoted keys)
 */
function toJavaScriptObject(obj: unknown, indent = 0): string {
  const spaces = "  ".repeat(indent)
  const nextSpaces = "  ".repeat(indent + 1)

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]"
    const items = obj
      .map((item) =>
        typeof item === "string"
          ? `"${item}"`
          : toJavaScriptObject(item, indent + 1),
      )
      .join(`,\n${nextSpaces}`)
    return `[\n${nextSpaces}${items}\n${spaces}]`
  }

  if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj)
    if (entries.length === 0) return "{}"

    const props = entries
      .map(([key, value]) => {
        const valueStr =
          typeof value === "string"
            ? `"${value}"`
            : typeof value === "boolean" || typeof value === "number"
              ? String(value)
              : toJavaScriptObject(value, indent + 1)
        return `${key}: ${valueStr}`
      })
      .join(`,\n${nextSpaces}`)

    return `{\n${nextSpaces}${props}\n${spaces}}`
  }

  return String(obj)
}

/**
 * Generate config file content
 */
function generateConfigContent(config: Config): string {
  return `export default ${toJavaScriptObject(config)}\n`
}

/**
 * Add or update the "monotui" script in package.json
 */
async function addMonotuiScriptToPackageJson(targetDir: string) {
  const pkgPath = join(targetDir, "package.json")
  try {
    const pkgRaw = await import(pkgPath, { assert: { type: "json" } })
    // Node ESM import returns { default: ... }
    const pkg = pkgRaw.default || pkgRaw
    if (!pkg.scripts) pkg.scripts = {}
    if (pkg.scripts.monotui === "pnpm exec @factorim/monotui") {
      return false
    }
    pkg.scripts.monotui = "pnpm exec @factorim/monotui"
    // Write back to package.json
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf-8")
    return true
  } catch (_err) {
    // package.json not found or error
    return false
  }
}

/**
 * Initialize configuration
 */
export async function initCommand(
  targetDir: string = process.cwd(),
): Promise<void> {
  const configPath = join(targetDir, CONFIG_FILENAME)

  // Check if config already exists
  if (existsSync(configPath)) {
    console.log(`⚠️  Config already exists at ${CONFIG_FILENAME}`)
    console.log("   Delete it first if you want to reinitialize")
    return
  }

  // Create config file with ESM export
  const configContent = generateConfigContent(DEFAULT_CONFIG)
  await writeFile(configPath, configContent, "utf-8")

  // Try to add monotui script to package.json
  const scriptAdded = await addMonotuiScriptToPackageJson(targetDir)
  console.log(`✓ Created ${CONFIG_FILENAME}`)

  if (scriptAdded) {
    console.log("✓ Added 'monotui' script to package.json")
  }

  console.log("\nNext steps:")
  console.log("  1. Customize the configuration in monotui.config.mjs")
  console.log("  2. Run: monotui")
}
