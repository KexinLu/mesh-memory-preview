.DEFAULT_GOAL := help

LABEL ?= my-laptop
ROLE  ?= architect

.PHONY: help up down reset ui dev logs provision-key ps

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start the compose stack (postgres + mesh-server) in the background
	docker compose up -d
	@docker compose ps

down: ## Stop the stack (keep data)
	docker compose down

reset: ## Stop + wipe data + restart fresh (destructive)
	docker compose down -v
	docker compose up -d

ps: ## Show container status
	docker compose ps

logs: ## Tail mesh-server logs
	docker compose logs -f mesh-server

provision-key: ## Mint an API token. Args: LABEL=name ROLE=architect|lead|worker
	docker compose exec mesh-server /mesh-server provision-key --label $(LABEL) --role $(ROLE)

ui: ## Run the review UI dev server (foreground; Ctrl-C to stop)
	cd ui && npm install && npm run dev

dev: up ui ## Start stack in the background, then run UI in foreground
