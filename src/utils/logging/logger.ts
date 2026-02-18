import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { type Logger, pino } from "pino"

import type { Config } from "../../types/config"

/**
 * Initialize logger based on configuration
 * Must be called once at startup before using logger
 */
export function initLogger(config: Config): Logger {
  const loggingConfig = config.logging || {}
  const level = loggingConfig.level || "info"
  const enableFile = loggingConfig.file !== false
  const truncateOnStart = loggingConfig.truncateOnStart !== false
  const logDir = loggingConfig.logDir
    ? loggingConfig.logDir.replace(/^~/, homedir())
    : join(homedir(), ".monotui", "logs")

  if (enableFile) {
    const logFilePath = join(logDir, "monotui.log")

    // Truncate log file if configured
    if (truncateOnStart) {
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true })
      }
      writeFileSync(logFilePath, "", "utf-8")
    }

    const usePretty = loggingConfig.prettyPrint === true

    _logger = pino({
      level,
      transport: {
        target: usePretty ? "pino-pretty" : "pino/file",
        options: {
          destination: logFilePath,
          mkdir: true,
          ...(usePretty && {
            colorize: false,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          }),
        },
      },
    })
  } else {
    // Create a minimal logger that writes to stderr (above Ink UI)
    // stderr doesn't interfere with Ink's stdout rendering
    _logger = pino({
      level,
      transport: {
        target: "pino-pretty",
        options: {
          destination: 2, // stderr (file descriptor 2)
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    })
  }

  return _logger
}

// Singleton logger instance - starts as no-op
let _logger: Logger = pino({ level: "silent" })
const _useConsole = false

// Export the logger directly - pino already has all the methods
export const logger = {
  debug: (obj: unknown, msg?: string) => {
    if (_useConsole) {
      console.log("[DEBUG]", ...(msg ? [msg] : []), obj)
    } else {
      _logger.debug(obj, msg)
    }
  },
  info: (obj: unknown, msg?: string) => {
    if (_useConsole) {
      console.log("[INFO]", ...(msg ? [msg] : []), obj)
    } else {
      _logger.info(obj, msg)
    }
  },
  warn: (obj: unknown, msg?: string) => {
    if (_useConsole) {
      console.log("[WARN]", ...(msg ? [msg] : []), obj)
    } else {
      _logger.warn(obj, msg)
    }
  },
  error: (obj: unknown, msg?: string) => {
    if (_useConsole) {
      console.log("[ERROR]", ...(msg ? [msg] : []), obj)
    } else {
      _logger.error(obj, msg)
    }
  },
}
