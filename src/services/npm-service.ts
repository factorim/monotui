import { getPackage } from "../utils/fs/package-json.js"

interface NpmLatestResponse {
  name: string
  version: string
}

let version = ""

export async function getLatestNpmVersion(): Promise<string> {
  if (version) {
    return version
  }
  const pkg = await getPackage()

  if (!pkg.name) {
    throw new Error("Package name is missing from package.json")
  }

  const encodedName = encodeURIComponent(pkg.name)
  const res = await fetch(`https://registry.npmjs.org/${encodedName}/latest`)

  if (!res.ok) {
    throw new Error(
      `Failed to fetch latest npm version for ${pkg.name}: ${res.status} ${res.statusText}`,
    )
  }

  const data = (await res.json()) as Partial<NpmLatestResponse>

  if (!data.version || typeof data.version !== "string") {
    throw new Error(`Invalid npm response for ${pkg.name}: missing version`)
  }

  version = data.version
  return version
}
