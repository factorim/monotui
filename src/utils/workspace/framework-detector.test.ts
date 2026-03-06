import { describe, expect, it } from "@jest/globals"
import type { PackageJson } from "type-fest"

import { detectFramework } from "./framework-detector"

describe("detectFramework", () => {
  it("detects Next.js", () => {
    const pkg: PackageJson = { dependencies: { next: "13.0.0" } }
    expect(detectFramework(pkg)).toBe("Next.js")
  })

  it("detects Remix", () => {
    const pkg: PackageJson = { dependencies: { "@remix-run/react": "1.0.0" } }
    expect(detectFramework(pkg)).toBe("Remix")
  })

  it("detects SvelteKit", () => {
    const pkg: PackageJson = { dependencies: { "@sveltejs/kit": "1.0.0" } }
    expect(detectFramework(pkg)).toBe("SvelteKit")
  })

  it("detects Nuxt", () => {
    const pkg: PackageJson = { dependencies: { nuxt: "2.0.0" } }
    expect(detectFramework(pkg)).toBe("Nuxt")
  })

  it("detects Astro", () => {
    const pkg: PackageJson = { dependencies: { astro: "2.0.0" } }
    expect(detectFramework(pkg)).toBe("Astro")
  })

  it("detects Gatsby", () => {
    const pkg: PackageJson = { dependencies: { gatsby: "4.0.0" } }
    expect(detectFramework(pkg)).toBe("Gatsby")
  })

  it("detects RedwoodJS", () => {
    const pkg: PackageJson = { dependencies: { "@redwoodjs/core": "1.0.0" } }
    expect(detectFramework(pkg)).toBe("RedwoodJS")
  })

  it("detects Blitz", () => {
    const pkg: PackageJson = { dependencies: { blitz: "1.0.0" } }
    expect(detectFramework(pkg)).toBe("Blitz")
  })

  it("detects SolidStart", () => {
    const pkg: PackageJson = { dependencies: { "@solidjs/start": "1.0.0" } }
    expect(detectFramework(pkg)).toBe("SolidStart")
  })

  it("detects Analog", () => {
    const pkg: PackageJson = { dependencies: { "@analogjs/platform": "1.0.0" } }
    expect(detectFramework(pkg)).toBe("Analog")
  })

  it("detects Hardhat", () => {
    const pkg: PackageJson = { dependencies: { hardhat: "2.0.0" } }
    expect(detectFramework(pkg)).toBe("Hardhat")
  })

  it("detects NestJS", () => {
    const pkg: PackageJson = { dependencies: { "@nestjs/core": "8.0.0" } }
    expect(detectFramework(pkg)).toBe("NestJS")
  })

  it("detects Express", () => {
    const pkg: PackageJson = { dependencies: { express: "4.0.0" } }
    expect(detectFramework(pkg)).toBe("Express")
  })

  it("detects React", () => {
    const pkg: PackageJson = { dependencies: { react: "18.0.0" } }
    expect(detectFramework(pkg)).toBe("React")
  })

  it("detects Vue", () => {
    const pkg: PackageJson = { dependencies: { vue: "3.0.0" } }
    expect(detectFramework(pkg)).toBe("Vue")
  })

  it("detects Svelte", () => {
    const pkg: PackageJson = { dependencies: { svelte: "3.0.0" } }
    expect(detectFramework(pkg)).toBe("Svelte")
  })

  it("detects Angular", () => {
    const pkg: PackageJson = { dependencies: { "@angular/core": "12.0.0" } }
    expect(detectFramework(pkg)).toBe("Angular")
  })

  it("detects Vite", () => {
    const pkg: PackageJson = { dependencies: { vite: "2.0.0" } }
    expect(detectFramework(pkg)).toBe("Vite")
  })

  it("detects Electron", () => {
    const pkg: PackageJson = { dependencies: { electron: "13.0.0" } }
    expect(detectFramework(pkg)).toBe("Electron")
  })

  it("detects Vitest as fallback", () => {
    const pkg: PackageJson = { dependencies: { vitest: "0.0.1" } }
    expect(detectFramework(pkg)).toBe("Vitest")
  })

  it("returns undefined for unknown frameworks", () => {
    const pkg: PackageJson = { dependencies: { foo: "1.0.0", bar: "2.0.0" } }
    expect(detectFramework(pkg)).toBeUndefined()
  })

  it("detects framework from devDependencies", () => {
    const pkg: PackageJson = { devDependencies: { next: "13.0.0" } }
    expect(detectFramework(pkg)).toBe("Next.js")
  })

  it("prefers meta-framework over base framework", () => {
    const pkg: PackageJson = {
      dependencies: { next: "13.0.0", react: "18.0.0" },
    }
    expect(detectFramework(pkg)).toBe("Next.js")
  })
})
