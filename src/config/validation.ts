import { z } from "zod"

import type { Config } from "../types/config.js"
import type { FacetType } from "../types/workspace.js"

const facetTypes = [
  "packageJson",
  "compose",
  "makefile",
] as const satisfies ReadonlyArray<FacetType>

const facetQuickActionSchema = z.object({
  facetType: z.enum(facetTypes),
  facetPath: z.string(),
  name: z.string(),
  command: z.string(),
  exec: z.string(),
  order: z.number().optional(),
})

const workspaceQuickActionSchema = z.object({
  workspacePath: z.string(),
  facets: z.array(facetQuickActionSchema),
})

const discoverySchema = z
  .object({
    maxDepth: z.number().int().nonnegative().optional(),
    ignore: z.array(z.string()).optional(),
    folders: z
      .object({
        app: z.array(z.string()).optional(),
        package: z.array(z.string()).optional(),
        infra: z.array(z.string()).optional(),
        contract: z.array(z.string()).optional(),
      })
      .optional(),
    scripts: z
      .object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      })
      .optional(),
    env: z
      .object({
        files: z.array(z.string()).optional(),
        portKeys: z.array(z.string()).optional(),
      })
      .optional(),
    order: z.array(z.string()).optional(),
    makefile: z
      .object({
        showDefault: z.boolean().optional(),
      })
      .optional(),
  })
  .optional()

const executionSchema = z
  .object({
    useTmux: z.boolean().optional(),
  })
  .optional()

const loggingSchema = z
  .object({
    level: z.enum(["debug", "info", "warn", "error"]).optional(),
    file: z.boolean().optional(),
    logDir: z.string().optional(),
    prettyPrint: z.boolean().optional(),
    truncateOnStart: z.boolean().optional(),
  })
  .optional()

export const configSchema = z.object({
  discovery: discoverySchema,
  quickActions: z.array(workspaceQuickActionSchema),
  execution: executionSchema,
  logging: loggingSchema,
  theme: z.literal("dark").optional(),
})

export function validateConfig(config: unknown): Config {
  const result = configSchema.safeParse(config)

  if (result.success) {
    return result.data
  }

  const details = result.error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root"
      return `${path}: ${issue.message}`
    })
    .join("; ")

  throw new Error(`Invalid monotui config: ${details}`)
}
