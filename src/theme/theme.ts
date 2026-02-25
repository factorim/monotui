import { type ComponentTheme, defaultTheme, extendTheme } from "@inkjs/ui"
import type { BoxProps, TextProps } from "ink"
import type { ThemeName } from "../types/config.js"

const gridTheme = {
  styles: {
    container: (): BoxProps => ({
      borderColor: "cyan",
    }),
    monorepoTitle: (): TextProps => ({
      color: "#FFA500",
    }),
    title: (): TextProps => ({
      color: "cyan",
    }),
    headerText: (): TextProps => ({
      color: "white",
    }),
    text: (): TextProps => ({
      color: "white",
    }),
    info: (): TextProps => ({
      color: "white",
    }),
    notification: (): TextProps => ({
      color: "yellow",
    }),
    workspaceName: (): TextProps => ({
      color: "white",
    }),
    action: (): TextProps => ({
      color: "cyan",
    }),
    error: (): TextProps => ({
      color: "red",
    }),
    border: (): BoxProps => ({
      borderColor: "cyan",
    }),
    runtime: ({ status }: { status?: string }): TextProps => ({
      color:
        status === "failed" || status === "conflict"
          ? "red"
          : status === "starting" || status === "stopping"
            ? "yellow"
            : status === "running"
              ? "green"
              : "white",
    }),
  },
} satisfies ComponentTheme

export type GridTheme = typeof gridTheme

export const darkTheme = extendTheme(defaultTheme, {
  components: {
    GridTheme: gridTheme,
  },
})

const themes: Record<ThemeName, typeof darkTheme> = {
  dark: darkTheme,
}

export function getAppTheme(themeName?: ThemeName) {
  if (!themeName) {
    return darkTheme
  }

  return themes[themeName] ?? darkTheme
}
