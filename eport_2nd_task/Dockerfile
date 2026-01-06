FROM python:3.12.2-slim as base
LABEL maintainer="kcchipangura@gmail.com"
LABEL build_date="2025-12-10"

# Install system dependencies
RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /data/backend

# Upgrade pip
RUN pip install --upgrade pip setuptools wheel

# Copy requirements files
COPY requirements.txt requirements-dev.txt ./

# Install production dependencies first
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /data/backend

# Explicitly ensure logging config is copied (defensive approach)
COPY app/logging_conf.json /data/backend/app/logging_conf.json

## For development
FROM base as development
# Install development dependencies
RUN pip install --no-cache-dir -r requirements-dev.txt
CMD [ "python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload" ]

## For production
FROM base as production
CMD [ "python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" ]



