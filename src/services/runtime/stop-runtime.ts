import { exec } from "node:child_process"

import { logger } from "../../utils/logging/logger.js"

/**
 * Stop a running script process by port (using fuser)
 */
export function stopScriptProcess(runState: { port?: number }) {
  if (runState.port) {
    exec(`fuser -k ${runState.port}/tcp`, (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(`Failed to kill process on port ${runState.port}: ${err}`)
      } else {
        // eslint-disable-next-line no-console
        logger.debug(`Stopped process on port ${runState.port}`)
      }
    })
  } else {
    // eslint-disable-next-line no-console
    console.warn("No port found for running script, cannot stop.")
  }
}

/**
 * Stop a running Docker Compose service
 */
export function stopComposeService(runState: { id: string; name: string }) {
  // Try to extract workspace path from runState.id (format: workspacePath::compose::<service>)
  const match = runState.id.match(/^(.*)::compose::/)
  const workspacePath = match ? match[1] : undefined
  if (workspacePath) {
    exec(
      `docker compose stop ${runState.name}`,
      { cwd: workspacePath },
      (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error(
            `Failed to stop docker service ${runState.name}: ${err}`,
          )
        } else {
          // eslint-disable-next-line no-console
          logger.debug(`Stopped docker service ${runState.name}`)
        }
      },
    )
  } else {
    // eslint-disable-next-line no-console
    console.warn("Could not determine workspace path for docker compose stop.")
  }
}
