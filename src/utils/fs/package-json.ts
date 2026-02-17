import path from "node:path"
import { fileURLToPath } from "node:url"
import { readPackage } from "read-pkg"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function getPackageVersion(): Promise<string> {
  const appPackageJsonPath = path.resolve(__dirname, "../../../package.json")
  const pkg = await readPackage({ cwd: path.dirname(appPackageJsonPath) })
  return pkg.version
}
