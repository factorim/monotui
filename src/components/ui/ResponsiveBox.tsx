import { useScreenSize } from "fullscreen-ink"
import { Box, type BoxProps } from "ink"
import type { ReactNode } from "react"

type Breakpoint = "s" | "m" | "l" | "xl"

type ResponsiveMap<T> = Partial<Record<Breakpoint, T | null>>
type ResponsiveValue<T> = T | null | ResponsiveMap<T>

type ResponsiveBoxProps = {
  children?: ReactNode
} & {
  [K in keyof BoxProps]?: ResponsiveValue<BoxProps[K]>
}

const BREAKPOINTS = {
  m: 120,
  l: 160,
  xl: 220,
}

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.m) {
    return "s"
  }

  if (width < BREAKPOINTS.l) {
    return "m"
  }

  if (width < BREAKPOINTS.xl) {
    return "l"
  }

  return "xl"
}

function isResponsiveMap<T>(
  value: ResponsiveValue<T> | undefined,
): value is ResponsiveMap<T> {
  if (!value || typeof value !== "object") {
    return false
  }

  return "s" in value || "m" in value || "l" in value || "xl" in value
}

function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint,
): T | null | undefined {
  if (!isResponsiveMap(value)) {
    return value
  }

  const priority: Breakpoint[] =
    breakpoint === "s"
      ? ["s"]
      : breakpoint === "m"
        ? ["m", "s"]
        : breakpoint === "l"
          ? ["l", "m", "s"]
          : ["xl", "l", "m", "s"]

  for (const key of priority) {
    if (value[key] !== undefined) {
      return value[key]
    }
  }

  return undefined
}

export function ResponsiveBox({ children, ...props }: ResponsiveBoxProps) {
  const { width } = useScreenSize()
  const breakpoint = getBreakpoint(width)

  const resolvedProps: BoxProps = {}
  let shouldHide = false

  for (const [key, rawValue] of Object.entries(props) as [
    keyof BoxProps,
    ResponsiveValue<unknown>,
  ][]) {
    const resolved = resolveResponsiveValue(rawValue, breakpoint)

    if (resolved === null) {
      shouldHide = true
      break
    }

    if (resolved !== undefined) {
      ;(resolvedProps as Record<string, unknown>)[key as string] = resolved
    }
  }

  if (shouldHide || resolvedProps.display === "none") {
    return null
  }

  return <Box {...resolvedProps}>{children}</Box>
}
