# Docker Deployment Guide

Complete guide for deploying Riddle Rush as a containerized application using Docker.

## Overview

The Docker setup provides a production-ready deployment of this Nuxt 4 PWA using:

- **Multi-stage build** for optimized image size
- **nginx** for serving static files
- **Security hardening** with non-root user
- **Health checks** for container orchestration
- **Gzip compression** for faster load times
- **PWA-specific caching** headers

## Quick Start

### Production Deployment

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build and run manually
docker build -t riddle-rush:latest .
docker run -d -p 8080:8080 --name riddle-rush riddle-rush:latest
```

Access the app at: http://localhost:8080

### Development Mode

```bash
# Run development server with hot reload
docker-compose --profile development up dev

# Access at http://localhost:3000
```

## Docker Commands

### Building

```bash
# Build production image
docker build -t riddle-rush:latest .

# Build with specific tag
docker build -t riddle-rush:v1.0.0 .

# Build without cache (clean build)
docker build --no-cache -t riddle-rush:latest .
```

### Running

```bash
# Run container in detached mode
docker run -d -p 8080:8080 --name riddle-rush riddle-rush:latest

# Run with custom port
docker run -d -p 3000:8080 --name riddle-rush riddle-rush:latest

# Run with environment variables
docker run -d -p 8080:8080 \
  -e GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX \
  --name riddle-rush riddle-rush:latest

# Run with health check monitoring
docker run -d -p 8080:8080 \
  --health-cmd="wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  --name riddle-rush riddle-rush:latest
```

### Managing Containers

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs riddle-rush

# Follow logs in real-time
docker logs -f riddle-rush

# Stop container
docker stop riddle-rush

# Start stopped container
docker start riddle-rush

# Restart container
docker restart riddle-rush

# Remove container
docker rm riddle-rush

# Remove container forcefully
docker rm -f riddle-rush
```

### Inspecting

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' riddle-rush

# View container resource usage
docker stats riddle-rush

# Execute command inside container
docker exec -it riddle-rush sh

# View nginx access logs
docker exec riddle-rush cat /var/log/nginx/access.log

# View nginx error logs
docker exec riddle-rush cat /var/log/nginx/error.log
```

## Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app

# Start development environment
docker-compose --profile development up dev

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build

# Scale service (for load testing)
docker-compose up -d --scale app=3
```

## Image Management

```bash
# List images
docker images

# Remove image
docker rmi riddle-rush:latest

# Remove all unused images
docker image prune

# Tag image for registry
docker tag riddle-rush:latest myregistry.com/riddle-rush:latest

# Push to registry
docker push myregistry.com/riddle-rush:latest

# View image history and layers
docker history riddle-rush:latest

# Check image size
docker images riddle-rush:latest --format "{{.Size}}"
```

## Deployment Scenarios

### 1. Local Testing

```bash
# Build and run
docker build -t riddle-rush:test .
docker run -d -p 8080:8080 --name riddle-rush-test riddle-rush:test

# Run E2E tests against container
BASE_URL=http://localhost:8080 pnpm run test:e2e

# Cleanup
docker stop riddle-rush-test && docker rm riddle-rush-test
```

### 2. Cloud Deployment (Docker Hub)

```bash
# Tag with your Docker Hub username
docker tag riddle-rush:latest yourusername/riddle-rush:latest
docker tag riddle-rush:latest yourusername/riddle-rush:v1.0.0

# Push to Docker Hub
docker push yourusername/riddle-rush:latest
docker push yourusername/riddle-rush:v1.0.0

# Pull and run on any server
docker pull yourusername/riddle-rush:latest
docker run -d -p 80:8080 --name riddle-rush yourusername/riddle-rush:latest
```

### 3. AWS ECS/Fargate

```bash
# Login to AWS ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Tag for ECR
docker tag riddle-rush:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/riddle-rush:latest

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/riddle-rush:latest

# Deploy to ECS (using AWS CLI or Console)
```

### 4. Google Cloud Run

```bash
# Build for Cloud Run (must listen on PORT env var)
docker build -t gcr.io/your-project/riddle-rush:latest .

# Push to Google Container Registry
docker push gcr.io/your-project/riddle-rush:latest

# Deploy to Cloud Run
gcloud run deploy riddle-rush \
  --image gcr.io/your-project/riddle-rush:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 5. Kubernetes

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: riddle-rush
spec:
  replicas: 3
  selector:
    matchLabels:
      app: riddle-rush
  template:
    metadata:
      labels:
        app: riddle-rush
    spec:
      containers:
        - name: riddle-rush
          image: riddle-rush:latest
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: riddle-rush-service
spec:
  selector:
    app: riddle-rush
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s-deployment.yaml
kubectl get pods
kubectl get services
```

## Environment Variables

The following environment variables can be customized at build time:

| Variable              | Description                  | Default      |
| --------------------- | ---------------------------- | ------------ |
| `BASE_URL`            | Base URL for the app         | `/`          |
| `NODE_ENV`            | Environment mode             | `production` |
| `GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | (none)       |

Example with custom variables:

```bash
docker build \
  --build-arg BASE_URL=/app/ \
  --build-arg GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX \
  -t riddle-rush:latest .
```

## nginx Configuration

The container uses a custom nginx configuration with:

### Security Headers

- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Basic XSS protection
- `Referrer-Policy`: Controls referrer information

### Caching Strategy

- **Service Worker** (`/sw.js`): No cache (always fresh)
- **Workbox scripts**: 1 year cache (immutable)
- **Static assets** (js, css, images): 1 year cache
- **Manifest**: 24 hour cache
- **HTML**: Dynamic (served fresh)

### Compression

- Gzip enabled for text-based assets
- Minimum size: 1KB
- All relevant MIME types included

### Health Check

- Endpoint: `/health`
- Returns: `200 OK` with "healthy" text
- Used by Docker health checks and load balancers

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs riddle-rush

# Check if port is already in use
lsof -i :8080

# Try running with different port
docker run -d -p 9000:8080 --name riddle-rush riddle-rush:latest
```

### Build fails

```bash
# Check if pnpm is available
docker run --rm node:22-alpine sh -c "corepack enable && pnpm --version"

# Build with verbose output
docker build --progress=plain -t riddle-rush:latest .

# Clean Docker cache and rebuild
docker builder prune -af
docker build --no-cache -t riddle-rush:latest .
```

### App not accessible

```bash
# Verify container is running
docker ps

# Check health status
docker inspect --format='{{.State.Health.Status}}' riddle-rush

# Test health endpoint
curl http://localhost:8080/health

# Check nginx logs
docker exec riddle-rush cat /var/log/nginx/error.log
```

### Service Worker not working

Ensure you're accessing via:

- `http://localhost:8080` (localhost is allowed)
- `https://` (HTTPS required for PWA)

Service Workers don't work with:

- HTTP on non-localhost domains
- IP addresses (without localhost)

### Large image size

```bash
# Check image size
docker images riddle-rush:latest

# Analyze layers
docker history riddle-rush:latest

# The multi-stage build should keep the image small (~50-100MB)
# If larger, check if .dockerignore is properly configured
```

## Performance Optimization

### Build Optimization

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t riddle-rush:latest .

# Parallel builds with docker-compose
docker-compose build --parallel
```

### Runtime Optimization

```bash
# Limit container resources
docker run -d \
  -p 8080:8080 \
  --memory="512m" \
  --cpus="0.5" \
  --name riddle-rush \
  riddle-rush:latest

# Use read-only root filesystem for security
docker run -d \
  -p 8080:8080 \
  --read-only \
  --tmpfs /var/cache/nginx:rw,noexec,nosuid \
  --tmpfs /var/run:rw,noexec,nosuid \
  --name riddle-rush \
  riddle-rush:latest
```

## Security Best Practices

The Dockerfile implements several security measures:

1. **Non-root user**: Container runs as `nginx-app` user (UID 101)
2. **Minimal base image**: Alpine Linux for smaller attack surface
3. **No unnecessary tools**: Only nginx and required files
4. **Security headers**: Configured in nginx
5. **Health checks**: Monitor container health
6. **Read-only filesystem**: Can be enabled for extra security

### Additional hardening

```bash
# Run with security options
docker run -d \
  -p 8080:8080 \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --name riddle-rush \
  riddle-rush:latest
```

## Monitoring

### Container Metrics

```bash
# Real-time stats
docker stats riddle-rush

# CPU and memory usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" riddle-rush
```

### Health Checks

```bash
# Check health status
docker inspect --format='{{json .State.Health}}' riddle-rush | jq

# Watch health status
watch -n 5 'docker inspect --format="{{.State.Health.Status}}" riddle-rush'
```

### Logs

```bash
# View logs with timestamps
docker logs --timestamps riddle-rush

# Tail last 100 lines
docker logs --tail 100 riddle-rush

# Follow logs
docker logs -f riddle-rush

# Export logs to file
docker logs riddle-rush > riddle-rush.log
```

## CI/CD Integration

### GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
docker-build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
```

### GitHub Actions

```yaml
name: Docker Build and Push
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t riddle-rush:latest .
      - name: Run tests
        run: |
          docker run -d -p 8080:8080 --name test riddle-rush:latest
          sleep 5
          curl -f http://localhost:8080/health
```

## Comparison with Other Deployment Methods

| Method                  | Pros                                 | Cons                                     |
| ----------------------- | ------------------------------------ | ---------------------------------------- |
| **Docker**              | Portable, consistent, easy scaling   | Requires Docker runtime, slight overhead |
| **GitLab Pages**        | Free, automatic SSL, CDN             | GitLab-specific, limited control         |
| **AWS S3 + CloudFront** | Scalable, cheap for static           | AWS-specific, more setup                 |
| **Kubernetes**          | Powerful orchestration, auto-scaling | Complex setup, overkill for static site  |

## Next Steps

1. **Push to Registry**: Share your image via Docker Hub or private registry
2. **Set up CI/CD**: Automate builds on commits
3. **Deploy to Cloud**: Use AWS ECS, Google Cloud Run, or similar
4. **Add Monitoring**: Integrate with Prometheus/Grafana
5. **Implement CDN**: Add CloudFlare or similar for global distribution

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Nuxt Deployment](https://nuxt.com/docs/getting-started/deployment)
- [PWA Best Practices](https://web.dev/pwa/)
