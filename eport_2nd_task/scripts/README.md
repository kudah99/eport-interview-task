# Deployment Scripts

## check-docker.ps1 (Windows)

PowerShell script to check if Docker Desktop is running and if the Docker daemon is responding.

### Usage

```powershell
.\scripts\check-docker.ps1
```

### What it does

1. Checks if Docker Desktop process is running
2. Tests if Docker daemon is responding
3. Provides instructions if Docker Desktop needs to be started

### When to use

- When you get errors like: `failed to resolve reference` or `The system cannot find the file specified`
- Before running `docker compose` commands
- To verify Docker is ready after starting Docker Desktop

---

## setup-letsencrypt.sh

Automated script to set up Let's Encrypt SSL certificates for your FastAPI application.

### Usage

```bash
sudo ./scripts/setup-letsencrypt.sh <domain> <email>
```

### Example

```bash
sudo ./scripts/setup-letsencrypt.sh example.com admin@example.com
```

### What it does

1. Installs certbot and required dependencies
2. Creates necessary directories for Let's Encrypt
3. Stops nginx container temporarily
4. Obtains SSL certificate from Let's Encrypt
5. Sets up automatic renewal hooks
6. Restarts nginx container

### Requirements

- Running as root or with sudo
- Domain name pointing to server IP
- Port 80 accessible from internet
- Docker and Docker Compose installed

### Notes

- The script automatically detects your project directory
- Certificates are stored in `/etc/letsencrypt/live/<domain>/`
- Automatic renewal is configured via systemd timer
- Renewal hook will restart nginx container when certificates are renewed

