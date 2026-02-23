export default {
  discovery: {
    maxDepth: 4,
    ignore: ["node_modules", ".git", "dist", "build", "apps/ignored"],
    folders: {
      app: ["apps"],
      package: ["packages"],
      infra: ["infra"],
      contract: ["contracts"],
    },
    scripts: {
      exclude: [],
    },
    env: {
      files: [".env.local", ".env.development", ".env", ".env.example"],
      portKeys: ["PORT", "APP_PORT", "VITE_PORT", "NEXT_PUBLIC_PORT"],
    },
    order: ["workspace", "app", "contract", "infra", "package"],
    makefile: {
      showDefault: false,
    },
  },
  execution: {
    useTmux: true,
  },
  quickActions: [],
  logging: {
    level: "info",
    file: false,
    logDir: "./logs",
    prettyPrint: true,
    truncateOnStart: true,
  },
  theme: "dark",
}
