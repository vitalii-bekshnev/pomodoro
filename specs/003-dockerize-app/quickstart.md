# Docker Quick Start Guide

**Feature**: Dockerize Pomodoro Application  
**Version**: 1.0.0  
**Last Updated**: December 19, 2025

This guide provides quick instructions for building, running, and deploying the Pomodoro Timer application using Docker.

---

## Prerequisites

- **Docker**: Version 20.10 or higher ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0 or higher (included with Docker Desktop)

**Verify installation**:
```bash
docker --version
# Docker version 24.0.0 or higher

docker-compose --version
# Docker Compose version 2.20.0 or higher
```

---

## Quick Start (5 Minutes)

### Option 1: Using Docker Commands

```bash
# 1. Build the image
docker build -t pomodoro-app .

# 2. Run the container
docker run -d -p 8080:80 --name pomodoro pomodoro-app

# 3. Access the application
open http://localhost:8080
# Or visit http://localhost:8080 in your browser
```

### Option 2: Using Docker Compose

```bash
# 1. Start the application
docker-compose up -d

# 2. Access the application
open http://localhost:8080
```

---

## Development

### Build and Run

```bash
# Build the Docker image
docker build -t pomodoro-app:dev .

# Run with live logs (foreground)
docker run -p 8080:80 pomodoro-app:dev

# Run in background (detached)
docker run -d -p 8080:80 --name pomodoro-dev pomodoro-app:dev
```

### Using Docker Compose (Recommended)

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Common Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs
docker logs pomodoro-dev
docker logs -f pomodoro-dev  # Follow logs

# Stop container
docker stop pomodoro-dev

# Remove container
docker rm pomodoro-dev

# Remove image
docker rmi pomodoro-app:dev
```

### Health Check

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' pomodoro-dev

# Test health endpoint
curl http://localhost:8080/health
# Expected: "healthy"
```

---

## Production Deployment

### Build Production Image

```bash
# Build with version tag
docker build -t pomodoro-app:1.0.0 .

# Tag as latest
docker tag pomodoro-app:1.0.0 pomodoro-app:latest

# Verify image size (should be <50MB)
docker images pomodoro-app
```

### Deploy with Docker Compose

```bash
# Deploy production configuration
docker-compose -f docker-compose.prod.yml up -d

# View status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production deployment
docker-compose -f docker-compose.prod.yml down
```

### Deploy to Remote Server

**1. Build and save image**:
```bash
# Build image
docker build -t pomodoro-app:1.0.0 .

# Save image to file
docker save pomodoro-app:1.0.0 | gzip > pomodoro-app.tar.gz
```

**2. Transfer to server**:
```bash
# Copy to server via SCP
scp pomodoro-app.tar.gz user@server:/tmp/
```

**3. Load and run on server**:
```bash
# SSH to server
ssh user@server

# Load image
docker load < /tmp/pomodoro-app.tar.gz

# Run container
docker run -d \
  --name pomodoro \
  -p 80:80 \
  --restart always \
  pomodoro-app:1.0.0

# Or use docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Reverse Proxy Configuration

**nginx reverse proxy** (for HTTPS):
```nginx
# /etc/nginx/sites-available/pomodoro
server {
    listen 443 ssl http2;
    server_name pomodoro.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Traefik** (labels in docker-compose.prod.yml):
```yaml
services:
  pomodoro:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pomodoro.rule=Host(`pomodoro.example.com`)"
      - "traefik.http.routers.pomodoro.entrypoints=websecure"
      - "traefik.http.routers.pomodoro.tls.certresolver=letsencrypt"
```

---

## Troubleshooting

### Image Build Fails

**Problem**: `npm ci` fails with dependency errors
```bash
# Solution: Clear npm cache and rebuild
docker build --no-cache -t pomodoro-app .
```

**Problem**: Build context too large
```bash
# Solution: Check .dockerignore includes node_modules and dist
cat .dockerignore | grep -E "node_modules|dist"
```

### Container Won't Start

**Problem**: Port already in use
```bash
# Check what's using port 8080
lsof -i :8080

# Use different port
docker run -p 3000:80 pomodoro-app
```

**Problem**: Health check failing
```bash
# Check container logs
docker logs pomodoro

# Exec into container
docker exec -it pomodoro sh
wget -O- http://localhost/health
```

### Application Not Loading

**Problem**: Blank page or 404 errors
```bash
# Check nginx is serving files
docker exec pomodoro ls -la /usr/share/nginx/html

# Check nginx config
docker exec pomodoro cat /etc/nginx/conf.d/default.conf

# Check nginx logs
docker logs pomodoro
```

**Problem**: React Router routes return 404
```bash
# Verify nginx try_files is configured
docker exec pomodoro grep try_files /etc/nginx/conf.d/default.conf
# Expected: try_files $uri $uri/ /index.html;
```

### Performance Issues

**Problem**: Slow image builds
```bash
# Use BuildKit (faster builds)
DOCKER_BUILDKIT=1 docker build -t pomodoro-app .

# Check build cache usage
docker system df

# Clean old build cache
docker builder prune
```

**Problem**: Large image size
```bash
# Check image size
docker images pomodoro-app

# Analyze image layers
docker history pomodoro-app
```

---

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild image
docker-compose build

# Restart with new image
docker-compose up -d

# Or for production
docker-compose -f docker-compose.prod.yml up -d --build
```

### View Logs

```bash
# All logs
docker logs pomodoro

# Follow logs (tail -f)
docker logs -f pomodoro

# Last 100 lines
docker logs --tail 100 pomodoro

# With timestamps
docker logs -t pomodoro

# Docker Compose
docker-compose logs -f
```

### Resource Usage

```bash
# Container resource usage
docker stats pomodoro

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Backup and Restore

**Note**: Application is stateless, no backup needed for container data. User data stored in browser localStorage.

**Backup images**:
```bash
# Save image
docker save pomodoro-app:1.0.0 | gzip > backup-pomodoro-1.0.0.tar.gz

# Restore image
docker load < backup-pomodoro-1.0.0.tar.gz
```

---

## Multi-Platform Builds

Build for multiple architectures (amd64, arm64):

```bash
# Create builder
docker buildx create --name multiplatform --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t pomodoro-app:latest \
  --push \
  .

# Or without push (local only)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t pomodoro-app:latest \
  --load \
  .
```

---

## Environment Variables

### Build-Time Variables

```bash
# Set NODE_ENV during build
docker build \
  --build-arg NODE_ENV=production \
  -t pomodoro-app .
```

### Runtime Variables (Future Extension)

```yaml
# docker-compose.yml
services:
  pomodoro:
    environment:
      - API_URL=https://api.example.com
      - FEATURE_FLAG_X=true
```

---

## Performance Benchmarks

**Expected Metrics**:

| Metric | Target | Typical |
|--------|--------|---------|
| Build time (cold cache) | <5 min | 3-4 min |
| Build time (warm cache) | <1 min | 30-60 sec |
| Image size (production) | <50MB | 20-30MB |
| Container startup time | <5 sec | 2-3 sec |
| Page load time (localhost) | <3 sec | 1-2 sec |
| Memory usage | <512MB | 50-100MB |

**Measure performance**:
```bash
# Build time
time docker build -t pomodoro-app .

# Image size
docker images pomodoro-app --format "{{.Size}}"

# Startup time
time docker run -d -p 8080:80 --name test pomodoro-app && \
  curl -o /dev/null -s -w "%{time_total}\n" http://localhost:8080/health

# Memory usage
docker stats pomodoro --no-stream --format "{{.MemUsage}}"
```

---

## Security Best Practices

### Image Scanning

```bash
# Scan for vulnerabilities (requires Docker Scout or Snyk)
docker scout cves pomodoro-app

# Or use Trivy
trivy image pomodoro-app:latest
```

### Run as Non-Root (Optional)

To run nginx as non-root user, modify Dockerfile:
```dockerfile
FROM nginx:alpine
RUN addgroup -g 1001 appuser && \
    adduser -u 1001 -S appuser -G appuser && \
    chown -R appuser:appuser /usr/share/nginx/html /var/cache/nginx /var/run
USER appuser
EXPOSE 8080
```

And update nginx to listen on port 8080 instead of 80.

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## Getting Help

**Check logs first**:
```bash
docker logs pomodoro
docker-compose logs
```

**Inspect container**:
```bash
docker inspect pomodoro
docker exec -it pomodoro sh
```

**Health check**:
```bash
curl http://localhost:8080/health
docker inspect --format='{{.State.Health}}' pomodoro
```

**Report Issues**:
- Include output of `docker version` and `docker-compose version`
- Include relevant logs from `docker logs`
- Describe expected vs actual behavior

---

**Quick Reference Card**:

```bash
# Build
docker build -t pomodoro-app .

# Run
docker run -d -p 8080:80 --name pomodoro pomodoro-app

# Logs
docker logs -f pomodoro

# Stop
docker stop pomodoro

# Remove
docker rm pomodoro

# Compose (dev)
docker-compose up -d

# Compose (prod)
docker-compose -f docker-compose.prod.yml up -d

# Health
curl http://localhost:8080/health

# Shell access
docker exec -it pomodoro sh
```

---

**Status**: Ready for use  
**Support**: See troubleshooting section above

