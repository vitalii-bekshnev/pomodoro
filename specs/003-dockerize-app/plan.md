# Implementation Plan: Dockerize Pomodoro Application

**Branch**: `003-dockerize-app` | **Date**: December 19, 2025 | **Spec**: [spec.md](./spec.md)  
**Status**: ✅ Implemented | **Testing**: Pending Docker daemon  
**Input**: Feature specification from `/specs/003-dockerize-app/spec.md`

## Summary

Containerize the Pomodoro Timer React SPA using Docker with multi-stage builds for optimal production deployment. Create Dockerfile for building (Node.js) and serving (nginx) the application, plus Docker Compose configurations for local development and production environments. Enable developers to run the app without Node.js installation and facilitate production deployment on remote servers.

## Technical Context

**Language/Version**: TypeScript 5.3+, Node.js 18+ (build stage only), nginx:alpine (serve stage)  
**Primary Dependencies**: Docker 20.10+, Docker Compose 2.0+, nginx 1.24+ (alpine)  
**Storage**: Stateless container, no persistent volumes required (client-side localStorage)  
**Testing**: Manual Docker build/run testing, production deployment verification  
**Target Platform**: Docker containers (Linux/amd64, Linux/arm64 for multi-platform)  
**Project Type**: Static React SPA (no backend services)  
**Performance Goals**: Build <5 min, image size <50MB, startup <5 sec, page load <3 sec  
**Constraints**: Must not modify application code, work with existing Vite build, support React Router  
**Scale/Scope**: Single-container deployment, supports 100s-1000s concurrent users (nginx capacity)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS - No constitution violations

This is infrastructure enhancement for existing application. No new application architecture or testing paradigm changes.

- ✅ No new application dependencies (Docker is deployment tooling)
- ✅ No changes to application codebase required
- ✅ Deployment infrastructure only
- ✅ Existing tests remain valid (application unchanged)
- ✅ Follows Docker best practices and industry standards

## Project Structure

### Documentation (this feature)

```text
specs/003-dockerize-app/
├── spec.md                # Feature specification
├── plan.md                # This file
├── research.md            # Docker best practices and nginx config research
├── quickstart.md          # Docker usage guide
└── checklists/
    └── requirements.md    # Quality validation checklist
```

### Source Code (repository root)

```text
/
├── Dockerfile             # Multi-stage build definition (NEW)
├── .dockerignore          # Build context optimization (NEW)
├── docker-compose.yml     # Development configuration (NEW)
├── docker-compose.prod.yml # Production configuration (NEW)
├── nginx.conf             # nginx server configuration (NEW)
├── README.md              # Updated with Docker instructions
├── package.json           # Existing (unchanged)
├── vite.config.ts         # Existing (unchanged)
└── src/                   # Existing application code (unchanged)
```

**Structure Decision**: Add Docker-specific files at repository root. No changes to existing application code or structure. nginx configuration separate for maintainability.

## Phase 0: Research & Docker Architecture

### Research Topics

#### 1. Multi-Stage Docker Build for React SPA

**Decision**: Use multi-stage build with Node.js (build) + nginx:alpine (serve)

**Rationale**:
- **Stage 1 (Build)**: Use `node:18-alpine` to run `npm install` and `npm run build`
  - Produces optimized static assets in `dist/` directory
  - Includes all dev dependencies for Vite build
  - Larger image (~500MB with dependencies)
  
- **Stage 2 (Serve)**: Use `nginx:alpine` to serve built assets
  - Copy only `dist/` folder from build stage
  - No Node.js runtime or source code in final image
  - Minimal image size (~25MB with nginx + assets)
  - Production-ready web server

**Alternatives Considered**:
- **Single-stage with Node.js runtime**: Rejected - unnecessarily large (~500MB), includes dev tools
- **Serve.js/http-server**: Rejected - less production-ready than nginx, larger footprint
- **Caddy server**: Rejected - nginx more widely adopted, better documentation

**Implementation Pattern**:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

#### 2. nginx Configuration for React Router

**Decision**: Custom nginx.conf with `try_files` directive for client-side routing

**Rationale**:
- React Router handles routing client-side
- All routes must serve `index.html` (except static assets)
- nginx default behavior returns 404 for `/settings`, `/timer` etc.
- `try_files $uri /index.html` ensures React Router receives all navigation requests

**Configuration**:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression for performance
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp3)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support - serve index.html for all routes
    location / {
        try_files $uri /index.html;
    }
}
```

**Alternatives Considered**:
- **Default nginx config**: Rejected - breaks React Router
- **Proxy to Node.js server**: Rejected - unnecessary complexity for static SPA
- **Custom 404 handling**: Rejected - less elegant than try_files

---

#### 3. Docker Compose for Multi-Environment

**Decision**: Two compose files - `docker-compose.yml` (dev) and `docker-compose.prod.yml` (production)

**Rationale**:
- Development: Volume mounts for live reloading (optional future enhancement)
- Production: No volume mounts, environment-specific settings
- Separate files prevent accidental production deployment with dev config

**Development Compose**:
```yaml
version: '3.8'
services:
  pomodoro:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=development
    restart: unless-stopped
```

**Production Compose**:
```yaml
version: '3.8'
services:
  pomodoro:
    image: pomodoro-app:latest
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

**Alternatives Considered**:
- **Single compose with profiles**: Rejected - more error-prone, less explicit
- **Environment-specific .env files**: Considered - may add if needed

---

#### 4. .dockerignore Optimization

**Decision**: Exclude development files, dependencies, and build artifacts

**Rationale**:
- Reduces build context size → faster builds
- Prevents sending `node_modules/`, `.git/`, `dist/` to Docker daemon
- Security: Excludes `.env` files, secrets

**Patterns**:
```
node_modules
.git
.github
dist
build
*.log
.env*
!.env.example
.vscode
.idea
*.swp
.DS_Store
coverage
```

---

#### 5. Health Check Implementation

**Decision**: HTTP health check on nginx serving endpoint

**Rationale**:
- Verify nginx is responding
- Check that `index.html` is accessible
- Simple, no application code changes required

**Implementation**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

**Alternatives Considered**:
- **Custom health endpoint**: Rejected - requires backend or application changes
- **Process check**: Rejected - doesn't verify actual serving capability

---

### Technical Specifications

#### Docker Build Performance

**Optimization Techniques**:
1. **Layer caching**: Copy `package*.json` before source code
2. **npm ci**: Use `npm ci` instead of `npm install` for reproducible builds
3. **Multi-stage**: Discard build dependencies in final image
4. **Alpine images**: Use lightweight alpine base images

**Expected Build Times**:
- First build (no cache): 3-4 minutes
- Incremental builds (cached layers): 30-60 seconds
- Final image size: 20-30MB (nginx + built assets)

---

#### Cross-Platform Support

**Target Platforms**:
- Linux amd64 (x86_64) - Primary
- Linux arm64 (Apple Silicon, Raspberry Pi) - Optional

**Build Command for Multi-Platform**:
```bash
docker buildx build --platform linux/amd64,linux/arm64 -t pomodoro-app:latest .
```

---

## Phase 1: Implementation Plan

### File Creation Order

1. **`.dockerignore`** - First, to optimize build context
2. **`Dockerfile`** - Core containerization logic
3. **`nginx.conf`** - Web server configuration
4. **`docker-compose.yml`** - Development orchestration
5. **`docker-compose.prod.yml`** - Production orchestration
6. **`README.md` updates** - Documentation

---

### Dockerfile Structure

```dockerfile
# syntax=docker/dockerfile:1

# Build stage
FROM node:18-alpine AS builder
LABEL stage=builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Serve stage
FROM nginx:alpine
LABEL maintainer="your-email@example.com"
LABEL description="Pomodoro Timer React SPA"

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

### nginx Configuration

**File**: `nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    gzip_disable "MSIE [1-6]\.";

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp3|wav)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # index.html should not be cached
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

### Docker Compose Configurations

**Development**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  pomodoro:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: development
    container_name: pomodoro-dev
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=development
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**Production**: `docker-compose.prod.yml`
```yaml
version: '3.8'

services:
  pomodoro:
    image: pomodoro-app:latest
    container_name: pomodoro-prod
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 128M
          cpus: '0.1'
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Testing Strategy

### Local Testing

```bash
# Build image
docker build -t pomodoro-app:test .

# Run container
docker run -d -p 8080:80 --name pomodoro-test pomodoro-app:test

# Test health
curl http://localhost:8080/health

# Test application
open http://localhost:8080

# View logs
docker logs pomodoro-test

# Stop and remove
docker stop pomodoro-test && docker rm pomodoro-test
```

### Verification Checklist

- [ ] Image builds without errors
- [ ] Image size <50MB
- [ ] Container starts in <5 seconds
- [ ] Application loads at http://localhost:8080
- [ ] Timer functionality works (start, pause, reset)
- [ ] Settings panel opens and saves
- [ ] Notifications appear and sound plays
- [ ] Page refresh maintains state (localStorage)
- [ ] All routes work (React Router)
- [ ] Health check returns 200
- [ ] Static assets load with caching headers
- [ ] Gzip compression active

---

## README.md Updates

Add Docker section:

````markdown
## 🐳 Docker Deployment

### Quick Start

```bash
# Build the Docker image
docker build -t pomodoro-app .

# Run the container
docker run -d -p 8080:80 --name pomodoro pomodoro-app

# Access the application
open http://localhost:8080
```

### Using Docker Compose

**Development**:
```bash
docker-compose up -d
# Access at http://localhost:8080
```

**Production**:
```bash
docker-compose -f docker-compose.prod.yml up -d
# Access at http://localhost
```

### Docker Commands

```bash
# Build image
docker build -t pomodoro-app:latest .

# Run container
docker run -d \
  -p 8080:80 \
  --name pomodoro \
  --restart unless-stopped \
  pomodoro-app:latest

# View logs
docker logs -f pomodoro

# Stop container
docker stop pomodoro

# Remove container
docker rm pomodoro

# Health check
curl http://localhost:8080/health
```

### Production Deployment

1. **Build the image**:
   ```bash
   docker build -t pomodoro-app:1.0.0 .
   ```

2. **Deploy with compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Configure reverse proxy** (nginx, Traefik, Caddy):
   ```nginx
   server {
       listen 443 ssl;
       server_name pomodoro.example.com;

       location / {
           proxy_pass http://localhost;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Image Size

- Development: ~500MB (includes Node.js and build tools)
- Production: ~25MB (nginx + built assets)

### Requirements

- Docker 20.10+
- Docker Compose 2.0+
````

---

## Complexity Tracking

> **No complexity violations** - Standard Docker containerization following industry best practices

**Justification**:
- Multi-stage builds are Docker standard for production images
- nginx is industry-standard static file server
- Docker Compose simplifies orchestration
- No architectural complexity added to application

---

**Status**: ✅ Ready for implementation  
**Estimated Time**: 2-3 hours (1 hour implementation + 1-2 hours testing/documentation)  
**Risk Level**: Low (no application code changes, standard Docker patterns)
