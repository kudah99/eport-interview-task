#!/bin/bash

# Let's Encrypt SSL Certificate Setup Script
# This script sets up SSL certificates for your FastAPI application on Ubuntu

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-server50.eport.ws}"
EMAIL="${2:-your-email@example.com}"

echo -e "${GREEN}Setting up Let's Encrypt SSL certificate for ${DOMAIN}${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Update package list
echo -e "${YELLOW}Updating package list...${NC}"
apt-get update

# Install certbot
echo -e "${YELLOW}Installing certbot...${NC}"
apt-get install -y certbot python3-certbot-nginx

# Create directory for Let's Encrypt challenges
echo -e "${YELLOW}Creating certbot webroot directory...${NC}"
mkdir -p /var/www/certbot

# Stop nginx if running (certbot needs port 80)
echo -e "${YELLOW}Stopping nginx container if running...${NC}"
cd "$(dirname "$0")/.."
docker compose stop nginx || true

# Obtain certificate using standalone mode (since nginx is stopped)
echo -e "${YELLOW}Obtaining SSL certificate from Let's Encrypt...${NC}"
certbot certonly --standalone \
    --preferred-challenges http \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --keep-until-expiring

# Create directories for certificate mounting
echo -e "${YELLOW}Setting up certificate directories...${NC}"
mkdir -p /etc/letsencrypt/live
mkdir -p /etc/letsencrypt/archive

# Set proper permissions
chmod -R 755 /etc/letsencrypt
chmod -R 755 /var/www/certbot

# Create renewal hook to reload nginx
echo -e "${YELLOW}Setting up certificate renewal hook...${NC}"
mkdir -p /etc/letsencrypt/renewal-hooks/deploy

# Get the project directory (parent of scripts directory)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << EOF
#!/bin/bash
cd ${PROJECT_DIR}
docker compose restart nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
echo -e "${GREEN}Renewal hook created at: /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh${NC}"
echo -e "${YELLOW}Project directory set to: ${PROJECT_DIR}${NC}"

# Test certificate renewal
echo -e "${YELLOW}Testing certificate renewal...${NC}"
certbot renew --dry-run

# Start nginx container
echo -e "${YELLOW}Starting nginx container...${NC}"
docker compose up -d nginx

echo -e "${GREEN}✓ SSL certificate setup complete!${NC}"
echo -e "${GREEN}Your certificate is located at: /etc/letsencrypt/live/${DOMAIN}/${NC}"
echo -e "${YELLOW}Note: Certificates will auto-renew. Make sure to update the renewal hook path.${NC}"

