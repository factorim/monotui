#!/usr/bin/env node
import { loadConfig } from "./config/config.js"
import { initLogger } from "./utils/logging/logger.js"

// Initialize config and logger before starting app
const config = await loadConfig(process.cwd())
initLogger(config)

// Start the app (dynamic import so config is ready)
await import("./app/App.js")
