import { createContext, type JSX, type ReactNode, useState } from "react"

import { Page } from "../types/page.js"
import type { CursorPosition } from "../types/workspace-grid"

interface PageNavigationContextType {
  currentPage: Page
  workspacesGridPosition: CursorPosition
  setPage: (page: Page) => void
  setWorkspacesGridPosition: (position: CursorPosition) => void
}

export const PageNavigationContext = createContext<PageNavigationContextType>(
  {} as PageNavigationContextType,
)

const Provider = PageNavigationContext as unknown as (props: {
  value: PageNavigationContextType
  children: ReactNode
}) => JSX.Element

export function PageNavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setPage] = useState<Page>(Page.Workspace)
  const [workspacesGridPosition, setWorkspacesGridPosition] =
    useState<CursorPosition>({ row: 0, col: 0 })

  return (
    <Provider
      value={{
        currentPage,
        workspacesGridPosition,
        setPage,
        setWorkspacesGridPosition,
      }}
    >
      {children}
    </Provider>
  )
}
