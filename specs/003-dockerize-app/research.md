# Research: Docker Containerization for React SPA

**Feature**: Dockerize Pomodoro Application  
**Date**: December 19, 2025  
**Purpose**: Document technical decisions and best practices for containerizing a Vite + React application

---

## 1. Multi-Stage Docker Builds

### Decision

Use multi-stage build with Node.js builder + nginx server for production.

### Rationale

**Benefits**:
- **Size reduction**: Final image ~25MB vs ~500MB single-stage
- **Security**: No Node.js runtime or dev dependencies in production
- **Performance**: nginx optimized for serving static files
- **Build efficiency**: Caching of npm dependencies layer

**Trade-offs**:
- Slightly more complex Dockerfile
- Two base images to maintain
- **Verdict**: Worth it for production deployments

### Alternatives Considered

| Option | Image Size | Performance | Security | Verdict |
|--------|-----------|-------------|----------|---------|
| Multi-stage (Node + nginx) | ~25MB | Excellent | High | ✅ **CHOSEN** |
| Single-stage (Node only) | ~500MB | Good | Medium | ❌ Too large |
| Single-stage (serve.js) | ~150MB | Good | Medium | ❌ Less production-ready |
| Caddy server | ~40MB | Excellent | High | ⚠️ Less common, good alternative |

### Implementation Pattern

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Key Points**:
- `node:18-alpine` provides smallest Node.js base (~120MB)
- `npm ci` faster and more reliable than `npm install`
- `nginx:alpine` provides smallest nginx base (~23MB)
- `--only=production` skips dev dependencies (but Vite needs devDeps for build, so this may be adjusted)

### References

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

## 2. nginx Configuration for SPAs

### Decision

Custom nginx configuration with `try_files` directive for React Router support.

### Rationale

**Problem**: React Router handles client-side routing, but nginx returns 404 for non-root paths
- User visits `http://example.com/settings` directly
- nginx looks for `/settings` file, doesn't find it → 404
- Need to serve `index.html` for all routes, let React Router handle navigation

**Solution**: `try_files $uri /index.html`
1. Try to serve the file at requested URI (for static assets)
2. If not found, serve `index.html` (for React Router routes)

### Configuration

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp3)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache index.html
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache";
    }
}
```

### Performance Optimizations

**Gzip Compression**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;
gzip_min_length 1024;
```
- Reduces transfer size by ~70% for text assets
- CPU overhead negligible on modern servers

**Caching Headers**:
- Static assets (JS, CSS, images): `Cache-Control: public, immutable, max-age=31536000`
- HTML: `Cache-Control: no-cache` (force revalidation)

**Security Headers**:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| `try_files $uri /index.html` | Simple, standard | None | ✅ **CHOSEN** |
| `error_page 404 /index.html` | Works | Less semantic | ❌ |
| Proxy to Node server | Keeps Node.js | Large image, slower | ❌ |
| Apache with mod_rewrite | Works | Larger than nginx | ❌ |

### References

- [nginx SPA Configuration](https://router.vuejs.org/guide/essentials/history-mode.html#nginx)
- [React Router Server Configuration](https://reactrouter.com/en/main/start/overview#client-side-routing)

---

## 3. Docker Base Image Selection

### Decision

Use Alpine Linux-based images (`node:18-alpine`, `nginx:alpine`).

### Rationale

**Alpine vs Debian Comparison**:

| Metric | Alpine | Debian |
|--------|--------|--------|
| Base size | ~5MB | ~124MB |
| node:18 size | ~120MB | ~950MB |
| nginx size | ~23MB | ~140MB |
| Package manager | apk | apt |
| Compatibility | Most packages | All packages |
| Security updates | Fast | Fast |

**Trade-offs**:
- **Pro**: 80-90% smaller images → faster pulls, less storage
- **Con**: Some native modules may have issues (rare with modern Node.js)
- **Verdict**: Alpine works for 99% of cases, worth the size savings

### Implementation

```dockerfile
FROM node:18-alpine AS builder
# Install build dependencies if needed
RUN apk add --no-cache python3 make g++

FROM nginx:alpine
# Already includes necessary tools
```

### Alternatives Considered

- **Slim variants** (`node:18-slim`): Medium size (~180MB), good compromise
- **Distroless**: Smallest runtime, but complex debugging
- **Scratch**: Only for Go/static binaries

### References

- [Alpine Linux](https://alpinelinux.org/)
- [Docker Official Images](https://hub.docker.com/_/node)

---

## 4. .dockerignore Optimization

### Decision

Comprehensive `.dockerignore` to exclude unnecessary files from build context.

### Rationale

**Build Context Impact**:
- Sending `node_modules/` to Docker daemon: ~500MB, 20-30 seconds
- With `.dockerignore`: ~5MB, <1 second
- **Result**: Faster builds, less disk I/O

**Security**:
- Prevents leaking `.env` files, secrets, git history
- Reduces attack surface in image

### Recommended Patterns

```
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build artifacts
dist
build
.cache

# Version control
.git
.gitignore
.github

# IDE
.vscode
.idea
*.swp
*.swo
.DS_Store

# Environment
.env
.env.*
!.env.example

# Testing
coverage
.nyc_output
*.test.ts
*.test.tsx
__tests__
__mocks__

# Documentation (optional, may want in image)
*.md
!README.md

# CI/CD
.gitlab-ci.yml
.travis.yml
azure-pipelines.yml
Jenkinsfile
```

### Impact Measurement

**Before `.dockerignore`**:
```
Sending build context to Docker daemon: 542.3MB
Step 1/12 : FROM node:18-alpine
```

**After `.dockerignore`**:
```
Sending build context to Docker daemon: 4.8MB
Step 1/12 : FROM node:18-alpine
```

### References

- [Docker .dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file)

---

## 5. Health Checks

### Decision

HTTP-based health check using nginx health endpoint.

### Rationale

**Purpose**:
- Container orchestrators (Docker Swarm, Kubernetes) use health checks
- Detect when nginx is unresponsive
- Enable automatic container restart
- Support for rolling deployments (don't route traffic until healthy)

**Implementation**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
```

**Parameters**:
- `interval`: Check every 30 seconds (don't spam)
- `timeout`: Fail if response takes >3 seconds
- `start-period`: Grace period on startup (app initializing)
- `retries`: Mark unhealthy after 3 consecutive failures

### Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| HTTP check to `/health` | Standard, tests actual serving | None | ✅ **CHOSEN** |
| HTTP check to `/` | Simpler | Pollutes analytics | ⚠️ OK alternative |
| Process check (pidof nginx) | Lightweight | Doesn't test responsiveness | ❌ |
| No health check | Simple | No container auto-recovery | ❌ |

### nginx Health Endpoint

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

- Returns 200 status
- No logging (avoid noise)
- Plain text response

### References

- [Docker HEALTHCHECK](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Kubernetes Liveness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

---

## 6. Docker Compose Strategies

### Decision

Two compose files: `docker-compose.yml` (dev) and `docker-compose.prod.yml` (production).

### Rationale

**Separation of Concerns**:
- Different port mappings (dev: 8080, prod: 80)
- Different resource limits (dev: unlimited, prod: 512MB)
- Different restart policies (dev: unless-stopped, prod: always)
- Explicit files prevent accidents (no `--prod` flag confusion)

### Development Configuration

```yaml
version: '3.8'
services:
  pomodoro:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"  # Non-privileged port for dev
    environment:
      - NODE_ENV=development
    restart: unless-stopped  # Won't restart if manually stopped
```

### Production Configuration

```yaml
version: '3.8'
services:
  pomodoro:
    image: pomodoro-app:latest  # Pre-built image
    ports:
      - "80:80"  # Standard HTTP port
    environment:
      - NODE_ENV=production
    restart: always  # Always restart on failure
    deploy:
      resources:
        limits:
          memory: 512M  # Prevent runaway memory
          cpus: '0.5'
        reservations:
          memory: 128M
          cpus: '0.1'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"  # Rotate logs
        max-file: "3"
```

### Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Two files (dev/prod) | Explicit, safe | Slight duplication | ✅ **CHOSEN** |
| Single file with profiles | One file | Easy to misconfigure | ❌ |
| Single file with overrides | Flexible | Complex inheritance | ⚠️ OK for complex setups |
| Environment-based .env | Simple | Config drift risk | ❌ |

### Usage

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Override (advanced)
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

### References

- [Docker Compose Best Practices](https://docs.docker.com/compose/production/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)

---

## 7. Vite Build Optimization

### Decision

Use standard `npm run build` with Vite defaults, no special Docker configuration needed.

### Rationale

**Vite Production Build**:
- Already optimized for production (minification, tree-shaking, code splitting)
- Outputs to `dist/` directory
- Generates static HTML/CSS/JS
- No build config changes required for Docker

**Build Command**:
```bash
vite build
```

**Output Structure**:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── favicon.ico
└── sounds/
    ├── focus-complete.mp3
    └── break-complete.mp3
```

### Dockerfile Build Step

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # Vite build command
```

**Note**: `npm ci` (not `--only=production`) because Vite is a dev dependency.

### Build Performance

| Metric | Value |
|--------|-------|
| First build (cold cache) | 30-60s |
| Rebuild (warm cache) | 5-10s |
| Output size | 300-500KB (gzipped) |
| Asset optimization | Automatic (Vite) |

### References

- [Vite Build for Production](https://vitejs.dev/guide/build.html)
- [Vite Docker Example](https://vitejs.dev/guide/static-deploy.html#docker)

---

## 8. Environment Variables

### Decision

Minimal environment variable usage - application is fully client-side, no server config needed.

### Rationale

**Static SPA Characteristics**:
- No backend server to configure
- No database connections
- No API keys (client-side app)
- Configuration baked into build at compile time

**Environment Variables in Docker**:
- `NODE_ENV`: Used during build for Vite optimizations
- `PORT`: nginx listens on port 80 (hardcoded in config)
- No runtime environment variables needed for application

### Build-Time vs Runtime

**Build-Time** (Dockerfile):
```dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
RUN npm run build  # Uses NODE_ENV
```

**Runtime** (docker-compose.yml):
```yaml
environment:
  - NODE_ENV=production  # Informational only, app already built
```

### Future Extensibility

If backend API is added later:
```yaml
environment:
  - API_URL=https://api.example.com
  - FEATURE_FLAG_X=true
```

### References

- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 9. Security Considerations

### Decision

Implement basic security headers and follow Docker security best practices.

### nginx Security Headers

```nginx
# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# Enable XSS filter
add_header X-XSS-Protection "1; mode=block" always;

# Content Security Policy (optional, may break inline scripts)
# add_header Content-Security-Policy "default-src 'self'" always;
```

### Docker Security Best Practices

**Non-root user** (optional enhancement):
```dockerfile
FROM nginx:alpine
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser
USER appuser
```
**Note**: nginx requires root to bind to port 80, or use port >1024

**Read-only filesystem** (optional):
```yaml
services:
  pomodoro:
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
      - /var/run
```

**Image scanning** (future):
```bash
docker scan pomodoro-app:latest
```

### References

- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [nginx Security Headers](https://www.nginx.com/blog/http-security-headers-and-how-they-work/)

---

## 10. Deployment Strategies

### Decision

Document manual deployment process, prepare for future CI/CD integration.

### Manual Deployment Process

**Build**:
```bash
docker build -t pomodoro-app:1.0.0 .
docker tag pomodoro-app:1.0.0 pomodoro-app:latest
```

**Deploy**:
```bash
# Stop old container
docker stop pomodoro

# Remove old container
docker rm pomodoro

# Start new container
docker run -d \
  --name pomodoro \
  -p 80:80 \
  --restart always \
  pomodoro-app:latest
```

**With Docker Compose**:
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Zero-Downtime Deployment

**Blue-Green**:
```bash
# Start new container (green)
docker run -d --name pomodoro-green -p 8080:80 pomodoro-app:latest

# Test green
curl http://localhost:8080/health

# Switch traffic (update reverse proxy)
# nginx: proxy_pass http://localhost:8080

# Stop old container (blue)
docker stop pomodoro-blue
```

**Rolling Update** (with orchestrator):
- Kubernetes: `kubectl rollout`
- Docker Swarm: `docker service update`

### Future CI/CD

**GitHub Actions** (out of scope for this phase):
```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build image
        run: docker build -t pomodoro-app:${{ github.sha }} .
      - name: Push to registry
        run: docker push pomodoro-app:${{ github.sha }}
```

### References

- [Docker Deployment Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Blue-Green Deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html)

---

## Summary

All research complete. Key decisions:
1. ✅ Multi-stage build (Node.js + nginx)
2. ✅ Alpine base images
3. ✅ Custom nginx config for React Router
4. ✅ Comprehensive .dockerignore
5. ✅ HTTP health checks
6. ✅ Separate dev/prod compose files
7. ✅ Standard Vite build process
8. ✅ Security headers
9. ✅ Manual deployment process

**Ready for implementation**: All technical decisions documented, no unresolved questions.

