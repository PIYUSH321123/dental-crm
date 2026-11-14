.PHONY: up down logs infra-up migrate seed test dev-api dev-worker dev-ai

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

infra-up:
	docker compose up -d postgres redis minio minio-init

migrate:
	cd api && npx prisma migrate dev

seed:
	cd api && npm run seed

test:
	cd api && npm test

dev-api:
	cd api && npm run start:dev

dev-worker:
	cd api && npm run start:worker:dev

dev-ai:
	cd ai-service && uvicorn app.main:app --reload --port 8000

