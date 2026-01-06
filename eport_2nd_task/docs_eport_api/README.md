<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://em-content.zobj.net/source/twitter/376/toolbox_1f9f0.png" width="128" alt="Nest Logo" />
  </a>
</p>

<h1 align="center">
  FPBP
</h1>

<div align="center">
  <p>
    <img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fbeerjoa%2Ffastapi-postgresql-boilerplate&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false" alt="hits" />
    <img src="https://img.shields.io/github/license/beerjoa/fastapi-postgresql-boilerplate" alt="GitHub" />
    <img src="https://img.shields.io/github/issues/beerjoa/fastapi-postgresql-boilerplate" alt="GitHub issues" />
    <img src="https://img.shields.io/github/last-commit/beerjoa/fastapi-postgresql-boilerplate" alt="GitHub last commit" />
    <img src="https://img.shields.io/github/languages/top/beerjoa/fastapi-postgresql-boilerplate" alt="GitHub top language" />
  </p>
  <p>
    <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=Python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=FastAPI&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white" alt="Docker" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/SQLAlchemy-008080?style=flat-square&logo=SQLAlchemy&logoColor=white" alt="SQLAlchemy" />
    <img src="https://img.shields.io/badge/Poetry-5037E9?style=flat-square&logo=Python&logoColor=white" alt="Poetry" />
    <img src="https://img.shields.io/badge/Pytest-0A9EDC?style=flat-square&logo=Pytest&logoColor=white" alt="Pytest" />
    <img src="https://img.shields.io/badge/Ruff-000000?style=flat-square&logo=Rust&logoColor=white" alt="Ruff" />
  </p>
</div>

## Overview

`FPBP (fastapi-postgresql-boilerplate)` is a boilerplate that can serve as a base for FastAPI with PostgreSQL.

🚀 FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.6+ based on standard Python-type hints.
I made and used this boilerplate for projects that I'm working on. 🧑‍💻
it was powerful for building data-driven applications using schema for data validation, serialization, and documentation. 📝

## Technology Stacks

- 🐍 [Python 3.12](https://docs.python.org/3.12/) - A programming language that lets you work quickly and integrate systems more effectively.
- 🚀 [FastAPI](https://fastapi.tiangolo.com) - A modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.
- 🐳 [Docker](https://docs.docker.com) - A platform designed to help developers build, share, and run container applications.
- 🐘 [PostgreSQL](https://www.postgresql.org/docs/) - An open-source object-relational database system.
- 💾 [SQLAlchemy](https://docs.sqlalchemy.org/en/20/) - the Python SQL toolkit and Object Relational Mapper.
- 📦 [Poetry](https://python-poetry.org/docs) - A tool for dependency management and packaging in Python.
- 🧪 [Pytest](https://docs.pytest.org/en/8.0.x/) -  A framework that makes writing small, readable tests easy.
- 🦀 [Ruff](https://docs.astral.sh/ruff/) - A fast Python linter and code formatter written in Rust.

## Development Features

- 🚫 JWT authentication, to ensure secure access to the API.
- 🎢 A Layered architecture (Controller, Service, Repository, Model).
- 📦 Dependency injection for better code organization.
- 📝 Swagger and Redoc for API documentation and testing.
- ♻️ Schema validation, to ensure that input and output data conform to the defined schema.

## Requirements

- Python 3.12 or 3.13
- pip (Python package manager)
- PostgreSQL
- Docker (optional, for containerized development)

## Getting Started

You can run the application either with Docker Compose (recommended for beginners) or locally without Docker. Choose the method that works best for you.

### Option 1: Docker Compose Development (Recommended)

See the [Docker Compose Setup](#docker-compose-setup) section below.

### Option 2: Local Development (Without Docker)

See the [Local Development Setup](#local-development-setup) section below, or check the detailed [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) guide.

---

## Docker Compose Setup

Every command below except `build` and `run` is executed in a docker container.

### Set Environment Variables

```bash
# Copy db env file
$ cp .db.env.example .db.env

# Create .env file (if .env.example exists, copy it; otherwise create manually)
# For Docker Compose, use 'postgresql' as the database hostname (service name)
# See ENV_VARIABLES.md for detailed configuration
$ cat > .env << EOF
APP_ENV=dev
SECRET_KEY=your-secret-key-here-change-in-production
DB_URL=postgresql+asyncpg://postgres:postgres@postgresql:5432/eport
DEBUG=True
LOGGING_LEVEL=DEBUG
EOF
```

**Important**: For Docker Compose, the `DB_URL` must use `postgresql` as the hostname (the service name), not `localhost`. For local development without Docker, use `localhost` instead.

### Using GitHub Container Registry (GHCR)

This project uses GitHub Container Registry (GHCR) to store Docker images. Images are automatically built and pushed to GHCR when you push to the main branch or create a tag.

**Available images:**
- `ghcr.io/beerjoa/fastapi-postgresql-boilerplate:dev` - Development image
- `ghcr.io/beerjoa/fastapi-postgresql-boilerplate:latest` - Production image

**To use GHCR images:**

The `docker-compose.yml` file is configured to pull images from GHCR by default. If you need to authenticate (for private repositories), run:

```bash
# Login to GHCR (requires GitHub Personal Access Token with read:packages permission)
$ echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

**To build locally instead:**

If you prefer to build images locally, edit `docker-compose.yml` and comment out the `image` line, then uncomment the `build` section.

### Build and run the app with Docker Compose

**Step-by-step workflow:**

```bash
# 1. Pull images from GHCR (or build locally if using local builds)
$ docker compose pull

# 2. Start containers (database and app)
$ docker compose up -d

# 3. Wait for containers to be ready (check logs)
$ docker compose logs -f

# 4. Run database migrations (IMPORTANT: Do this before using the app!)
$ docker compose exec app alembic upgrade head

# 5. Verify migrations were applied
$ docker compose exec app alembic current
```

**⚠️ Important: You must run database migrations after starting the containers to create the required tables (users and warranties).**

### Useful Docker Commands

```bash
# Watch logs
$ docker compose logs -f

# Watch logs for a specific service
$ docker compose logs -f app
$ docker compose logs -f postgresql

# Execute a command in a running container
$ docker compose exec app <command>

# Stop containers
$ docker compose down

# Stop containers and remove volumes (⚠️ deletes database data)
$ docker compose down -v

# Restart containers
$ docker compose restart
```

### Database Migration Commands

**All migration commands are run inside the Docker container:**

```bash
# Apply all pending migrations (most common command)
$ docker compose exec app alembic upgrade head

# Check current migration status
$ docker compose exec app alembic current

# View migration history
$ docker compose exec app alembic history

# View detailed migration history
$ docker compose exec app alembic history --verbose

# Rollback one migration (if needed)
$ docker compose exec app alembic downgrade -1

# Rollback to a specific revision (if needed)
$ docker compose exec app alembic downgrade <revision_id>

# Rollback all migrations
$ docker compose exec app alembic downgrade base

# Create a new migration (if you modify models)
$ docker compose exec app alembic revision --autogenerate -m "description"

# Apply next migration only
$ docker compose exec app alembic upgrade +1
```

#### Running Locally (without Docker)

If you're running the app locally without Docker, make sure you have:
- Python 3.12 and pip installed
- PostgreSQL running and accessible
- `.env` file configured with correct `DB_URL`
- Virtual environment activated (recommended)

```bash
# Apply all pending migrations
$ alembic upgrade head

# Check current migration status
$ alembic current

# View migration history
$ alembic history
```

#### Common Migration Commands

```bash
# Create a new migration (if you modify models)
$ docker compose exec app alembic revision --autogenerate -m "description"

# Apply migrations up to head (latest)
$ docker compose exec app alembic upgrade head

# Apply next migration only
$ docker compose exec app alembic upgrade +1

# Rollback one migration
$ docker compose exec app alembic downgrade -1

# Rollback all migrations
$ docker compose exec app alembic downgrade base

# Show current database revision
$ docker compose exec app alembic current

# Show migration history
$ docker compose exec app alembic history --verbose
```

### Test

```bash
# Run unit tests using pytest
$ docker compose exec app pytest
```

### Lint and format

The Ruff is an extremely fast Python linter and code formatter written in Rust.
It can replace flake8, isort, and black at once.

```bash
# Run Ruff

## Code linting
$ docker compose exec app ruff check .

## Code formatting
$ docker compose exec app ruff format .
```

---

## Local Development Setup

This section covers running the application locally without Docker.

### Prerequisites

1. **Python 3.12** - Install from [python.org](https://www.python.org/downloads/) or use a version manager like `pyenv`
2. **pip** - Usually comes with Python, but ensure it's up to date: `python -m pip install --upgrade pip`
3. **PostgreSQL** - Install and run PostgreSQL locally
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql@12` or use [Postgres.app](https://postgresapp.com/)
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib` (Ubuntu/Debian)

### Step 1: Set Up Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (including dev dependencies)
pip install -r requirements-dev.txt

# Or install only production dependencies
pip install -r requirements.txt
```

### Step 3: Set Up Environment Variables

```bash
# Create .env file (if .env.example exists, copy it)
# Otherwise, create a new .env file with:

APP_ENV=dev
SECRET_KEY=your-secret-key-here-change-in-production
DB_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/eport
DEBUG=True
LOGGING_LEVEL=DEBUG
```

**Note**: The database name `eport` matches the configuration in `.db.env`. If you need to use a different database:
- Replace `postgres` (username) with your PostgreSQL username
- Replace `postgres` (password) with your PostgreSQL password
- Replace `eport` with your desired database name

### Step 4: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (matching .db.env: eport)
CREATE DATABASE eport;

# Exit psql
\q
```

Or using a single command:
```bash
# macOS/Linux
createdb -U postgres eport

# Windows (if psql is in PATH)
psql -U postgres -c "CREATE DATABASE eport;"
```

### Step 5: Run Database Migrations

```bash
# Apply all migrations
alembic upgrade head

# Verify migrations
alembic current
```

### Step 6: Run the Application

```bash
# Start the development server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use Makefile
make dev
```

The application will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
### Step 7: Run Tests (Local)

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/api/v1/test_users.py

# Or use Makefile
make test
make test-cov
```

### Step 8: Lint and Format (Local)

```bash
# Code linting
ruff check .

# Auto-fix linting issues
ruff check . --fix

# Code formatting
ruff format .

# Or use Makefile
make lint
make format
```

### Common Local Development Commands

```bash
# Ensure virtual environment is activated
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

# Run commands directly:
alembic upgrade head
python -m uvicorn app.main:app --reload
pytest
ruff check .

# Install a new dependency
pip install package-name
# Then update requirements.txt manually or use:
pip freeze > requirements.txt

# Install a development dependency
pip install package-name
# Then update requirements-dev.txt

# Update all dependencies
pip install --upgrade -r requirements-dev.txt

# Show installed packages
pip list
```

### Troubleshooting Local Development

**Issue: PostgreSQL connection error**
- Ensure PostgreSQL is running: `pg_isready` or check service status
- Verify database credentials in `.env` file
- Check if database exists: `psql -U postgres -l`

**Issue: Port already in use**
- Change port: `uvicorn app.main:app --reload --port 8001`
- Or find and kill the process using port 8000

**Issue: pip not found**
- Ensure Python is installed: `python --version`
- Upgrade pip: `python -m pip install --upgrade pip`
- On Linux, may need: `sudo apt-get install python3-pip`

**Issue: Module not found errors**
- Ensure virtual environment is activated
- Install dependencies: `pip install -r requirements-dev.txt`
- Verify package installation: `pip list`

---

## CI/CD and GitHub Container Registry

This project uses GitHub Actions to automatically build and push Docker images to GitHub Container Registry (GHCR).

### Automated Builds

Docker images are automatically built and pushed to GHCR when:
- You push to the `main` or `master` branch
- You create a git tag (e.g., `v1.0.0`)
- You manually trigger the workflow from GitHub Actions

### Available Images

- **Development**: `ghcr.io/beerjoa/fastapi-postgresql-boilerplate:dev`
- **Production**: `ghcr.io/beerjoa/fastapi-postgresql-boilerplate:latest`
- **Tagged versions**: `ghcr.io/beerjoa/fastapi-postgresql-boilerplate:v1.0.0` (when you create tags)

### Viewing Images

You can view all published images in the [GitHub Packages](https://github.com/beerjoa/fastapi-postgresql-boilerplate/pkgs/container/fastapi-postgresql-boilerplate) section of the repository.

### Pulling Images

```bash
# Pull development image
docker pull ghcr.io/beerjoa/fastapi-postgresql-boilerplate:dev

# Pull production image
docker pull ghcr.io/beerjoa/fastapi-postgresql-boilerplate:latest

# Pull specific version
docker pull ghcr.io/beerjoa/fastapi-postgresql-boilerplate:v1.0.0
```

### Authentication (for private repositories)

If your repository is private, you'll need to authenticate to pull images:

```bash
# Using GitHub Personal Access Token
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

Create a Personal Access Token with `read:packages` permission at: https://github.com/settings/tokens

---

## Production Deployment

For deploying to production with Let's Encrypt SSL certificates, see the [DEPLOYMENT.md](DEPLOYMENT.md) guide.

The deployment guide covers:
- Setting up Let's Encrypt SSL certificates
- Configuring nginx for HTTPS
- Automatic certificate renewal
- Production Docker Compose configuration
- Security best practices

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

