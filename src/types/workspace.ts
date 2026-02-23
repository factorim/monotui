export type ProjectType = "workspace" | "app" | "package" | "infra" | "contract"
export type FacetType = "packageJson" | "compose" | "makefile"

export interface EnvFile {
  filepath: string // e.g. "/home/user/project-name/.env"
}

export interface Workspace {
  name: string // e.g. "my-monorepo"
  absolutePath: string // e.g. "/home/user/my-monorepo"
  projects: Project[]
}

export interface Project {
  name: string // e.g. "myapp"
  path: string // e.g. "project-name/myapp"
  absolutePath: string // e.g. "/home/user/project-name/myapp"
  type: ProjectType // e.g. "app"
  folder: string // e.g. "project-name"
  description: string // e.g. "My awesome app"
  envFile?: EnvFile
  facets: {
    packageJson?: PackageJsonFacet
    compose?: ComposeFacet
    makefile?: MakefileFacet
  }
}

// Base Facet

export interface BaseFacet {
  type: FacetType
  path: string // e.g. "apps/api"
  envFile?: EnvFile
}

// PackageJson Facet

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "deno"

export interface PackageJsonFacet extends BaseFacet {
  type: "packageJson"
  filename: string // e.g. "package.json"
  name: string // e.g. "@factorim/api"
  version?: string // e.g. "1.0.0"
  framework?: string // e.g. "react", "Next.js""
  packageManager: PackageManager // e.g. "pnpm"
  description?: string // e.g. "My awesome app"
  scripts: PackageJsonScript[]
}

export interface PackageJsonScript {
  name: string // e.g. "start"
  command: string // e.g. "pnpm start"
  exec: string // e.g. "biome check ."
  port?: number // e.g. 3000
}

// Compose Facet

export interface ComposeFacet extends BaseFacet {
  type: "compose"
  filename: string // e.g. "docker-compose.yml"
  services: ComposeService[]
}

export interface ComposeService {
  name: string // e.g. "database" (service key in compose file)
  containerName?: string // e.g. "my-pg-db" (explicit container_name, if set)
  image?: string // e.g. "postgres:latest"
  ports?: number[] // e.g. [5432]
}

// Makefile Facet

export interface MakefileFacet extends BaseFacet {
  type: "makefile"
  filename: string // e.g. "Makefile"
  commands: MakefileCommand[]
}

export interface MakefileCommand {
  name: string // e.g. "dev"
  command: string // e.g. "make dev"
  exec: string // e.g. "pnpm run dev"
  port?: number // e.g. 3000
  description?: string // e.g. "Start the development server"
  dependencies?: string[] // e.g. ["build"]
}
