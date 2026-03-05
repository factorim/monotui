export type RuntimeStatus =
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "failed"
  | "conflict"

/**
 * Aggregated running state for an entire workspaces
 */
export interface WorkspaceRuntimeState {
  workspacePath: string // e.g. "myapp"
  runStates: RunState[]
}

/**
 * Running state for a single run (script, command, or service)
 */
export interface RunState {
  id: string // e.g. "myapp::packageJson::dev"
  name: string // e.g. "dev"
  type: "script" | "command" | "service"
  command: string // e.g. "pnpm start"
  port?: number // e.g. 3000
  status: RuntimeStatus
  statusMessage?: string // e.g. "Port 3000 already in use", "2 containers match service db"
  conflicts?: Conflict[]
}

export interface Conflict {
  kind: "port" | "process" | "docker"
  message: string
  stopTargets?: StopTarget[]
}

export type StopTarget =
  | { kind: "pid"; pid: number }
  | { kind: "port"; port: number }
  | { kind: "docker-service"; workspacePath: string; service: string }
  | { kind: "docker-container"; containerId: string }
