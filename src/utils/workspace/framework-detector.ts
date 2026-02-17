import type { PackageJson } from "type-fest"

/**
 * Detect framework based on package.json dependencies
 * Priority order matters - checks more specific frameworks first
 */
export function detectFramework(pkg: PackageJson): string | undefined {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const depKeys = Object.keys(deps)

  // Meta-frameworks (check first - most specific)
  if (depKeys.includes("next")) return "Next.js"
  if (depKeys.includes("@remix-run/react")) return "Remix"
  if (depKeys.includes("@sveltejs/kit")) return "SvelteKit"
  if (depKeys.includes("nuxt")) return "Nuxt"
  if (depKeys.includes("astro")) return "Astro"
  if (depKeys.includes("gatsby")) return "Gatsby"
  if (depKeys.includes("@redwoodjs/core")) return "RedwoodJS"
  if (depKeys.includes("blitz")) return "Blitz"
  if (depKeys.includes("@solidjs/start")) return "SolidStart"
  if (depKeys.includes("@analogjs/platform")) return "Analog"
  if (depKeys.includes("hardhat")) return "Hardhat"

  // Backend frameworks
  if (depKeys.includes("@nestjs/core")) return "NestJS"
  if (depKeys.includes("h3")) return "H3"
  if (depKeys.includes("express")) return "Express"
  if (depKeys.includes("fastify")) return "Fastify"
  if (depKeys.includes("koa")) return "Koa"
  if (depKeys.includes("@hapi/hapi")) return "Hapi"
  if (depKeys.includes("nitro")) return "Nitro"
  if (depKeys.includes("@trpc/server")) return "tRPC"
  if (depKeys.includes("elysia")) return "Elysia"
  if (depKeys.includes("hono")) return "Hono"

  // Frontend frameworks
  if (depKeys.includes("@docusaurus/core")) return "Docusaurus"
  if (depKeys.includes("react")) return "React"
  if (depKeys.includes("vue")) return "Vue"
  if (depKeys.includes("svelte")) return "Svelte"
  if (depKeys.includes("@angular/core")) return "Angular"
  if (depKeys.includes("solid-js")) return "Solid"
  if (depKeys.includes("preact")) return "Preact"
  if (depKeys.includes("@builder.io/qwik")) return "Qwik"
  if (depKeys.includes("lit")) return "Lit"
  if (depKeys.includes("alpine")) return "Alpine.js"
  if (depKeys.includes("htmx.org")) return "HTMX"

  // Build tools (fallback)
  if (depKeys.includes("vite")) return "Vite"
  if (depKeys.includes("webpack")) return "Webpack"
  if (depKeys.includes("parcel")) return "Parcel"
  if (depKeys.includes("rollup")) return "Rollup"
  if (depKeys.includes("turbo")) return "Turborepo"
  if (depKeys.includes("esbuild")) return "esbuild"

  // Mobile frameworks
  if (depKeys.includes("react-native")) return "React Native"
  if (
    depKeys.includes("@ionic/react") ||
    depKeys.includes("@ionic/angular") ||
    depKeys.includes("@ionic/vue")
  )
    return "Ionic"
  if (depKeys.includes("@nativescript/core")) return "NativeScript"
  if (depKeys.includes("@tauri-apps/api")) return "Tauri"
  if (depKeys.includes("electron")) return "Electron"

  // Desktop frameworks
  if (depKeys.includes("@neutralinojs/lib")) return "Neutralino"
  if (depKeys.includes("nw")) return "NW.js"

  // Testing frameworks (only if no other framework detected)
  if (depKeys.includes("vitest")) return "Vitest"

  return undefined
}
