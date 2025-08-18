SHELL := /bin/bash

.PHONY: dev build start test typecheck lint db-migrate db-init openapi ci

dev: node_modules
	@echo "▶ starting dev server..."
	@npm run dev

build:
	@npm run build

start:
	@npm start

test:
	@npm test

typecheck:
	@./node_modules/.bin/tsc -p tsconfig.json --noEmit

db-init:
	@mkdir -p data
	@NODE_OPTIONS="--no-warnings" npx ts-node src/db/migrate.ts

db-migrate: db-init

openapi:
	@echo "OpenAPI at /openapi.yaml"

ci: typecheck test build
