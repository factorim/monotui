#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const cliEntry = fileURLToPath(new URL("../index.js", import.meta.url))

const result = spawnSync(
  process.execPath,
  ["--trace-warnings", cliEntry, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  },
)

if (typeof result.status === "number") {
  process.exit(result.status)
}

if (result.error) {
  console.error(result.error)
}

process.exit(1)
