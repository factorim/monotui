import { createServer } from "node:net"

/**
 * Check whether a TCP port is already in use on localhost.
 * Returns `true` if the port is taken, `false` if it is free.
 */
export function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer()

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(true)
      } else {
        // Unexpected error — treat as in use to be safe
        resolve(true)
      }
    })

    server.once("listening", () => {
      server.close(() => resolve(false))
    })

    server.listen(port, "127.0.0.1")
  })
}
