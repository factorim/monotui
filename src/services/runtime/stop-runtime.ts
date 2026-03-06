import * as childProcess from "node:child_process"

import type { RunState, StopTarget } from "../../types/workspace-runtime.js"
import { logger } from "../../utils/logging/logger.js"

function execStop(command: string, cwd?: string) {
  childProcess.exec(command, cwd ? { cwd } : undefined, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(`Failed to run stop command "${command}": ${err}`)
      return
    }

    logger.debug(`Executed stop command: ${command}`)
  })
}

function tryStopWithTarget(target: StopTarget): boolean {
  if (target.kind === "pid") {
    execStop(`kill -TERM ${target.pid}`)
    return true
  }

  if (target.kind === "port") {
    execStop(`fuser -k ${target.port}/tcp`)
    return true
  }

  if (target.kind === "docker-container") {
    execStop(`docker stop ${target.containerId}`)
    return true
  }

  if (target.kind === "docker-service") {
    execStop(`docker compose stop ${target.service}`, target.workspacePath)
    return true
  }

  return false
}

/**
 * Stop a running script process by port (using fuser)
 */
export function stopScriptProcess(
  runState: Pick<RunState, "port" | "conflicts">,
) {
  const targets =
    runState.conflicts?.flatMap((conflict) => conflict.stopTargets ?? []) ?? []
  if (targets.length > 0) {
    for (const target of targets) {
      if (target.kind === "pid" || target.kind === "port") {
        tryStopWithTarget(target)
      }
    }
    return
  }

  if (runState.port) {
    execStop(`fuser -k ${runState.port}/tcp`)
  } else {
    // eslint-disable-next-line no-console
    console.warn("No port found for running script, cannot stop.")
  }
}

/**
 * Stop a running Docker Compose service
 */
export function stopComposeService(
  runState: Pick<RunState, "id" | "name" | "conflicts">,
) {
  const targets =
    runState.conflicts?.flatMap((conflict) => conflict.stopTargets ?? []) ?? []
  if (targets.length > 0) {
    for (const target of targets) {
      if (
        target.kind === "docker-container" ||
        target.kind === "docker-service" ||
        target.kind === "port"
      ) {
        tryStopWithTarget(target)
      }
    }
    return
  }

  // Try to extract workspace path from runState.id (format: workspacePath::compose::<service>)
  const match = runState.id.match(/^(.*)::compose::/)
  const workspacePath = match ? match[1] : undefined

  logger.debug(JSON.stringify({ runState, workspacePath }, null, 2))

  if (workspacePath) {
    execStop(`docker compose stop ${runState.name}`, workspacePath)
  } else {
    // eslint-disable-next-line no-console
    console.warn("Could not determine workspace path for docker compose stop.")
  }
}
