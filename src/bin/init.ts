#!/usr/bin/env node
import { initCommand } from "../commands/init.js"

initCommand().catch((error) => {
  console.error("✖ Initialization failed:", error.message)
  process.exit(1)
})
