# PostgreSQL Configuration Directory

This directory contains PostgreSQL configuration files for performance optimization.

## Files

- `postgresql.conf` - Optimized PostgreSQL configuration file

## Usage

The configuration is automatically mounted in Docker Compose. To apply changes:

1. Edit `postgresql.conf` as needed
2. Restart PostgreSQL:
   ```bash
   docker-compose restart postgresql
   # or for production
   docker-compose -f docker-compose.prod.yml restart postgresql
   ```

## Verifying Configuration

```bash
# Connect to PostgreSQL
docker exec -it postgresql psql -U postgres -d eport

# Check if custom config is loaded
SHOW config_file;

# View current settings
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW max_connections;
```

## Customization

### Adjusting for Your System

Edit `postgresql.conf` and adjust these key settings based on your container's available memory:

**For 2GB RAM:**
- `shared_buffers = 512MB`
- `effective_cache_size = 1536MB`
- `work_mem = 16MB`

**For 4GB RAM:**
- `shared_buffers = 1GB`
- `effective_cache_size = 3GB`
- `work_mem = 32MB`

**For 8GB+ RAM:**
- `shared_buffers = 2GB`
- `effective_cache_size = 6GB`
- `work_mem = 64MB`

## Troubleshooting

If PostgreSQL fails to start after configuration changes:

1. Check Docker logs:
   ```bash
   docker logs postgresql
   ```

2. Verify config file syntax:
   ```bash
   docker exec -it postgresql postgres --check-config -c config_file=/etc/postgresql/postgresql.conf
   ```

3. Temporarily disable custom config by commenting out the `command` line in docker-compose.yml

## Additional Resources

See `POSTGRESQL_PERFORMANCE_TUNING.md` in the project root for comprehensive tuning guide.

