SHELL:=/bin/bash

.PHONY: clean install dev run test lint format migrate migrate-up migrate-down migrate-current migrate-history

# Clean Python cache files
clean:
	find . -type d -name "__pycache__" | xargs rm -rf {}; \
	find . -type f -name "*.pyc" -delete; \
	find . -type f -name "*.pyo" -delete; \
	find . -type d -name "*.egg-info" | xargs rm -rf {}; \
	find . -type d -name ".pytest_cache" | xargs rm -rf {}; \
	find . -type d -name ".ruff_cache" | xargs rm -rf {};

# Install dependencies
install:
	pip install -r requirements-dev.txt

# Install production dependencies only
install-prod:
	pip install -r requirements.txt

# Run development server
dev:
	python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
test:
	pytest

# Run tests with coverage
test-cov:
	pytest --cov=app --cov-report=html

# Lint code
lint:
	ruff check .

# Format code
format:
	ruff format .

# Run migrations
migrate:
	alembic upgrade head

# Migration shortcuts
migrate-up:
	alembic upgrade head

migrate-down:
	alembic downgrade -1

migrate-current:
	alembic current

migrate-history:
	alembic history

# Create new migration
migrate-create:
	@read -p "Enter migration message: " msg; \
	alembic revision --autogenerate -m "$$msg"