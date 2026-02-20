NAME := Monorepo API

.PHONY: dev
dev: env node ## Starts the service development mode.
	pnpm run start:dev
	
.PHONY: test
test: node ## Execute unit tests.
	pnpm run test

.PHONY: lint
lint: node ## Execute lint.
	pnpm run lint
