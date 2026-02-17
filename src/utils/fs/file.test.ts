import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals"

import { fileExists, readJsonFile } from "./file.js"

const TEST_DIR = join(process.cwd(), "test-temp")

describe("file utils", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true })
  })

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true })
  })

  describe("fileExists", () => {
    it("should return true for existing file", async () => {
      const filePath = join(TEST_DIR, "test.txt")
      await writeFile(filePath, "test content")

      const exists = await fileExists(filePath)

      expect(exists).toBe(true)
    })

    it("should return false for non-existing file", async () => {
      const filePath = join(TEST_DIR, "non-existing.txt")

      const exists = await fileExists(filePath)

      expect(exists).toBe(false)
    })

    it("should return true for existing directory", async () => {
      const exists = await fileExists(TEST_DIR)

      expect(exists).toBe(true)
    })
  })

  describe("readJsonFile", () => {
    it("should read and parse valid JSON file", async () => {
      const filePath = join(TEST_DIR, "data.json")
      const data = { name: "test", value: 42 }
      await writeFile(filePath, JSON.stringify(data))

      const result = await readJsonFile<typeof data>(filePath)

      expect(result).toEqual(data)
    })

    it("should return null for non-existing file", async () => {
      const filePath = join(TEST_DIR, "missing.json")

      const result = await readJsonFile(filePath)

      expect(result).toBeNull()
    })

    it("should return null for invalid JSON", async () => {
      const filePath = join(TEST_DIR, "invalid.json")
      await writeFile(filePath, "not valid json{")

      const result = await readJsonFile(filePath)

      expect(result).toBeNull()
    })

    it("should handle nested JSON objects", async () => {
      const filePath = join(TEST_DIR, "nested.json")
      const data = {
        workspace: {
          name: "my-app",
          scripts: {
            build: "tsc",
            test: "jest",
          },
        },
      }
      await writeFile(filePath, JSON.stringify(data))

      const result = await readJsonFile<typeof data>(filePath)

      expect(result).toEqual(data)
      expect(result?.workspace.scripts.build).toBe("tsc")
    })
  })
})
