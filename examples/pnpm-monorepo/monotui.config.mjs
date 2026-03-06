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
    runner: "tmux",
  },
  quickActions: [
    {
      workspacePath: ".",
      facets: [],
    },
    {
      workspacePath: "apps/admin",
      facets: [
        {
          facetType: "packageJson",
          facetPath: "apps/admin/package.json",
          name: "xoxo",
          command: "pnpm run dev",
          exec: "vite",
          order: 1,
        },
      ],
    },
    {
      workspacePath: "apps/api",
      facets: [
        {
          facetType: "makefile",
          facetPath: "apps/api/Makefile",
          name: "xoxo",
          command: "make dev",
          exec: "pnpm run dev",
          order: 1,
        },
        {
          facetType: "compose",
          facetPath: "apps/api/docker-compose.yml",
          name: "xoxo",
          command: "docker compose up",
          exec: "docker compose up",
          order: 2,
        },
        {
          facetType: "compose",
          facetPath: "apps/api/docker-compose.yml",
          name: "xoxo (detached)",
          command: "docker compose up -d",
          exec: "docker compose up -d",
          order: 2,
        },
      ],
    },
  ],
  logging: {
    level: "debug",
    file: true,
    logDir: "./logs",
    prettyPrint: true,
    truncateOnStart: true,
  },
  theme: "dark",
}
