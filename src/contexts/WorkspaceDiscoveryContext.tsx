import {
  createContext,
  type JSX,
  type ReactNode,
  useMemo,
  useState,
} from "react"

import { useWorkspaceDiscovery } from "../hooks/useWorkspaceDiscovery.js"
import { useWorkspaceRuntime } from "../hooks/useWorkspaceRuntime.js"
import type { Project } from "../types/project.js"
import type { WorkspaceRuntimeState } from "../types/workspace-runtime.js"

interface WorkspaceDiscoveryContextType {
  projects: Project[]
  workspaceRuntimes: WorkspaceRuntimeState[]
  project: Project | null
  setProject: (project: Project | null) => void
}

export const WorkspaceDiscoveryContext =
  createContext<WorkspaceDiscoveryContextType>(
    {} as WorkspaceDiscoveryContextType,
  )

const Provider = WorkspaceDiscoveryContext as unknown as (props: {
  value: WorkspaceDiscoveryContextType
  children: ReactNode
}) => JSX.Element

export function WorkspaceDiscoveryProvider({
  children,
}: {
  children: ReactNode
}) {
  const [project, setProject] = useState<Project | null>(null)
  const rootPath = useMemo(() => process.cwd(), [])
  const { projects } = useWorkspaceDiscovery(rootPath)
  const workspaceRuntimes = useWorkspaceRuntime(projects)

  return (
    <Provider value={{ projects, workspaceRuntimes, project, setProject }}>
      {children}
    </Provider>
  )
}
