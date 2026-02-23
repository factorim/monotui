SERVICE := monorepo MongoDB
bold := $(shell tput bold)
sgr0 := $(shell tput sgr0)

help:
	@printf "\
	$(SERVICE)\n\
	\n\
	$(bold)SYNOPSIS$(sgr0)\n\
    make [COMMANDS]\n\
	\n\
	$(bold)COMMANDS$(sgr0)\n\
		$(bold)help$(sgr0)\n\
		  Display help\n\n\
		$(bold)infra-up$(sgr0)\n\
		  Build images and start service for development\n\n\
		$(bold)infra-up-detached$(sgr0)\n\
		  Build images and start service for development in background\n\n\
		$(bold)infra-down$(sgr0)\n\
		  Stop service\n\n\
	"

# Dev

.PHONY: infra-up
infra-up: ## Builds and starts the service container in development mode.\n
	docker network inspect monorepo-network >/dev/null 2>&1 || docker network create monorepo-network
	if [ ! -f .env ]; then cp .env.example .env; fi
	docker compose up

.PHONY: infra-up-detached
infra-up-detached: ## Builds and starts the service container in the background in development mode.\n
	docker network inspect monorepo-network >/dev/null 2>&1 || docker network create monorepo-network
	if [ ! -f .env ]; then cp .env.example .env; fi
	docker compose up -d

.PHONY: infra-down
infra-down:
	docker compose down
