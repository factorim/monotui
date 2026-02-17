export default {
  discovery: {
    enabled: true,
    maxDepth: 4,
    ignore: ["node_modules", ".git", "dist", "build"],
    scripts: {
      exclude: [],
    },
    env: {
      files: [".env.local", ".env.development", ".env", ".env.example"],
      portKeys: ["PORT", "APP_PORT", "VITE_PORT", "NEXT_PUBLIC_PORT"],
    },
    order: ["workspace", "app", "contract", "infra", "package"],
  },
  execution: {
    useTmux: true,
  },
}
