import * as childProcess from "node:child_process"
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals"

import { stopComposeService, stopScriptProcess } from "./stop-runtime"

jest.mock("node:child_process", () => ({
  exec: jest.fn(),
}))

describe("stop-runtime", () => {
  const execSpy = childProcess.exec as jest.MockedFunction<
    typeof childProcess.exec
  >
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

  beforeEach(() => {
    execSpy.mockImplementation(((
      _command: string,
      optionsOrCallback?: unknown,
      callback?: unknown,
    ) => {
      const cb =
        typeof optionsOrCallback === "function" ? optionsOrCallback : callback

      if (typeof cb === "function") {
        cb(null)
      }

      return {} as childProcess.ChildProcess
    }) as typeof childProcess.exec)
  })

  afterEach(() => {
    execSpy.mockClear()
    warnSpy.mockClear()
    errorSpy.mockClear()
  })

  it("stops script by conflict stop targets (pid/port)", () => {
    stopScriptProcess({
      port: 3000,
      conflicts: [
        {
          kind: "process",
          message: "x",
          stopTargets: [
            { kind: "pid", pid: 1234 },
            { kind: "port", port: 4321 },
            { kind: "docker-container", containerId: "abc" },
          ],
        },
      ],
    })

    const commands = execSpy.mock.calls.map((call) => call[0])
    expect(commands).toContain("kill -TERM 1234")
    expect(commands).toContain("fuser -k 4321/tcp")
    expect(commands).not.toContain("docker stop abc")
  })

  it("stops script by runState port when no conflicts", () => {
    stopScriptProcess({ port: 5555, conflicts: undefined })

    expect(execSpy).toHaveBeenCalledWith(
      "fuser -k 5555/tcp",
      undefined,
      expect.any(Function),
    )
  })

  it("warns when script has no stop target", () => {
    stopScriptProcess({ port: undefined, conflicts: undefined })

    expect(execSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(
      "No port found for running script, cannot stop.",
    )
  })

  it("stops compose using conflict targets", () => {
    stopComposeService({
      id: "apps/api::compose::redis",
      name: "redis",
      conflicts: [
        {
          kind: "docker",
          message: "x",
          stopTargets: [
            { kind: "docker-container", containerId: "cid-1" },
            {
              kind: "docker-service",
              workspacePath: "apps/api",
              service: "redis",
            },
            { kind: "port", port: 6379 },
          ],
        },
      ],
    })

    expect(execSpy).toHaveBeenCalledWith(
      "docker stop cid-1",
      undefined,
      expect.any(Function),
    )
    expect(execSpy).toHaveBeenCalledWith(
      "docker compose stop redis",
      { cwd: "apps/api" },
      expect.any(Function),
    )
    expect(execSpy).toHaveBeenCalledWith(
      "fuser -k 6379/tcp",
      undefined,
      expect.any(Function),
    )
  })

  it("stops compose using workspace from id when no conflicts", () => {
    stopComposeService({
      id: "apps/web::compose::db",
      name: "db",
      conflicts: undefined,
    })

    expect(execSpy).toHaveBeenCalledWith(
      "docker compose stop db",
      { cwd: "apps/web" },
      expect.any(Function),
    )
  })

  it("warns when compose workspace cannot be inferred", () => {
    stopComposeService({
      id: "invalid-id",
      name: "db",
      conflicts: undefined,
    })

    expect(execSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(
      "Could not determine workspace path for docker compose stop.",
    )
  })
})
