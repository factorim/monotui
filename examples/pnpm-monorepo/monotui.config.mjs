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
          facetId: "apps/api/docker-compose.yml:up--d",
          facetType: "compose",
          facetPath: "apps/api/docker-compose.yml",
          name: "xxup -d",
          command: "docker compose up -d",
          exec: "docker compose up -d",
          order: 1,
        },
        {
          facetId: "apps/api/package.json:dev",
          facetType: "packageJson",
          facetPath: "apps/api/package.json",
          name: "dev",
          command: "pnpm run dev",
          exec: "tsx watch src/index.ts",
          order: 2,
        },
        {
          facetId: "apps/api/docker-compose.yml:up",
          facetType: "compose",
          facetPath: "apps/api/docker-compose.yml",
          name: "up",
          command: "docker compose up",
          exec: "docker compose up",
          order: 3,
        },
        {
          facetId: "apps/api/Makefile:dev",
          facetType: "makefile",
          facetPath: "apps/api/Makefile",
          name: "dev",
          command: "make dev",
          exec: "pnpm run dev",
          order: 4,
        },
      ],
    },
    {
      workspacePath: "apps/admin",
      facets: [
        {
          facetId: "apps/admin/package.json:dev",
          facetType: "packageJson",
          facetPath: "apps/admin/package.json",
          name: "dev",
          command: "pnpm run dev",
          exec: "vite",
          order: 1,
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
