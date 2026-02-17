// scanDirectories.test.ts
import { mkdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals"
import { scanDirectories } from "./directories"

describe("scanDirectories", () => {
  let root: string

  beforeEach(async () => {
    root = join(tmpdir(), `monotui-scan-${Date.now()}-${Math.random()}`)
    await mkdir(root, { recursive: true })

    await mkdir(join(root, "apps", "api"), { recursive: true })
    await mkdir(join(root, "packages", "ui", "components"), { recursive: true })
    await mkdir(join(root, ".git"), { recursive: true })
    await mkdir(join(root, "node_modules"), { recursive: true })
    await mkdir(join(root, "unreadable"), { recursive: true })

    // Add a file just to ensure files are ignored (only dirs collected)
    await writeFile(join(root, "apps", "api", "index.ts"), "export {}")
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it("includes root directory and discovers nested directories", async () => {
    const dirs = await scanDirectories(root, {
      maxDepth: 10,
      ignore: [],
    })

    expect(dirs).toContain(root)
    expect(dirs).toContain(join(root, "apps"))
    expect(dirs).toContain(join(root, "apps", "api"))
    expect(dirs).toContain(join(root, "packages"))
    expect(dirs).toContain(join(root, "packages", "ui"))
    expect(dirs).toContain(join(root, "packages", "ui", "components"))
  })

  it("skips dot-directories (e.g. .git)", async () => {
    const dirs = await scanDirectories(root, {
      maxDepth: 10,
      ignore: [],
    })

    expect(dirs).not.toContain(join(root, ".git"))
  })

  it("skips ignored directories (e.g. node_modules)", async () => {
    const dirs = await scanDirectories(root, {
      maxDepth: 10,
      ignore: ["node_modules"],
    })

    expect(dirs).not.toContain(join(root, "node_modules"))
  })
})
