import path from "node:path"
import { fileURLToPath } from "node:url"
import { type NormalizedPackageJson, readPackage } from "read-pkg"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function getPackageVersion(): Promise<string> {
  const pkg = await getPackage()
  return pkg.version
}

export async function getPackage(): Promise<NormalizedPackageJson> {
  const appPackageJsonPath = path.resolve(__dirname, "../../../package.json")
  const pkg = await readPackage({ cwd: path.dirname(appPackageJsonPath) })
  return pkg
}
