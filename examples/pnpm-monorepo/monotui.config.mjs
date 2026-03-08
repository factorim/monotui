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
      workspacePath: "apps/api",
      facets: [
        {
          facetId: "apps/api/Makefile:dev",
          facetType: "makefile",
          facetPath: "apps/api/Makefile",
          name: "xxdev",
          command: "make dev",
          exec: "pnpm run dev",
        },
        {
          facetId: "apps/api/package.json:dev",
          facetType: "packageJson",
          facetPath: "apps/api/package.json",
          name: "xxdev",
          command: "make dev",
          exec: "pnpm run dev",
        },
        {
          facetId: "apps/api/docker-compose.yml:up",
          facetType: "compose",
          facetPath: "apps/api/docker-compose.yml",
          name: "xxup",
          command: "docker compose up",
          exec: "docker compose up",
        },
        {
          facetId: "apps/api/docker-compose.yml:up--d",
          facetType: "compose",
          facetPath: "apps/api/docker-compose.yml",
          name: "xxup -d",
          command: "docker compose up -d",
          exec: "docker compose up -d",
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
