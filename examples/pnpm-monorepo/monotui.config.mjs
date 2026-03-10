export default {
  discovery: {
    maxDepth: 4,
    ignore: [
      "node_modules",
      ".git",
      "dist",
      "build",
      "apps/ignored"
    ],
    folders: {
      app: [
        "apps"
      ],
      package: [
        "packages"
      ],
      infra: [
        "infra"
      ],
      contract: [
        "contracts"
      ]
    },
    scripts: {
      exclude: []
    },
    env: {
      files: [
        ".env.local",
        ".env.development",
        ".env",
        ".env.example"
      ],
      portKeys: [
        "PORT",
        "APP_PORT",
        "VITE_PORT",
        "NEXT_PUBLIC_PORT"
      ]
    },
    order: [
      "workspace",
      "app",
      "contract",
      "infra",
      "package"
    ],
    makefile: {
      showDefault: false
    }
  },
  execution: {
    runner: "tmux"
  },
  quickActions: [
    {
      workspacePath: "apps/api",
      facets: [
        {
          facetId: "apps/api/Makefile:dev",
          facetType: "makefile",
          facetPath: "apps/api/Makefile",
          name: "dev",
          command: "make dev",
          exec: "pnpm run dev",
          order: 1
        },
        {
          facetId: "apps/api/docker-compose.yml:up",
          facetType: "compose",
          facetPath: "apps/api/docker-compose.yml",
          name: "up",
          command: "docker compose up",
          exec: "docker compose up",
          order: 2
        }
      ]
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
          order: 1
        },
        {
          facetId: "apps/admin/docker-compose.yml:up",
          facetType: "compose",
          facetPath: "apps/admin/docker-compose.yml",
          name: "up",
          command: "docker compose up",
          exec: "docker compose up",
          order: 2
        }
      ]
    },
    {
      workspacePath: "infra/mongodb",
      facets: [
        {
          facetId: "infra/mongodb/Makefile:infra-up",
          facetType: "makefile",
          facetPath: "infra/mongodb/Makefile",
          name: "infra-up",
          command: "make infra-up",
          exec: "docker network inspect monorepo-network >/dev/null 2>&1 || docker network create monorepo-network && if [ ! -f .env ]; then cp .env.example .env; fi && docker compose up",
          order: 1
        }
      ]
    },
    {
      workspacePath: "apps/web",
      facets: [
        {
          facetId: "apps/web/package.json:dev",
          facetType: "packageJson",
          facetPath: "apps/web/package.json",
          name: "dev",
          command: "pnpm run dev",
          exec: "vite",
          order: 1
        },
        {
          facetId: "apps/web/docker-compose.yml:up",
          facetType: "compose",
          facetPath: "apps/web/docker-compose.yml",
          name: "up",
          command: "docker compose up",
          exec: "docker compose up",
          order: 2
        }
      ]
    },
    {
      workspacePath: "infra/redis",
      facets: [
        {
          facetId: "infra/redis/docker-compose.yml:up--d",
          facetType: "compose",
          facetPath: "infra/redis/docker-compose.yml",
          name: "up -d",
          command: "docker compose up -d",
          exec: "docker compose up -d",
          order: 1
        }
      ]
    }
  ],
  logging: {
    level: "debug",
    file: true,
    logDir: "./logs",
    prettyPrint: true,
    truncateOnStart: true
  },
  theme: "dark"
}
