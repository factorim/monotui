import { createServer } from "node:net"
import { afterEach, describe, expect, it } from "@jest/globals"

import { isPortInUse } from "./port"

describe("isPortInUse", () => {
  let server: ReturnType<typeof createServer> | null = null
  const testPort = 45678

  afterEach((done) => {
    if (server) {
      server.close(() => {
        server = null
        done()
      })
    } else {
      done()
    }
  })

  it("returns false for a free port", async () => {
    const inUse = await isPortInUse(testPort)
    expect(inUse).toBe(false)
  })

  it("returns true for a taken port", async () => {
    server = createServer()
    await new Promise((resolve) =>
      server?.listen(testPort, () => resolve(undefined)),
    )
    const inUse = await isPortInUse(testPort)
    expect(inUse).toBe(true)
  })
})
