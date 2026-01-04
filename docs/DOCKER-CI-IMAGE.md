# Custom Docker Image for CI/CD

This document explains the custom Docker image used for faster CI/CD builds in GitLab.

## Overview

The custom Docker image (`ci-build`) includes all project dependencies pre-installed, significantly speeding up CI/CD pipeline execution by avoiding repeated `pnpm install` operations.

### Benefits

- **Faster Builds**: Dependencies are cached in the Docker image (20-60 seconds saved per job)
- **Reduced Network Usage**: No need to download dependencies from npm registry on each build
- **Consistent Environment**: Same dependencies across all CI jobs
- **Cost Savings**: Less runner time = lower CI/CD costs

## Quick Start

### Building the Docker Image

The Docker image is built and published to GitLab Container Registry using a dedicated pipeline.

**Option 1: Manual Trigger (Recommended)**

1. Go to GitLab: **CI/CD → Pipelines**
2. Click **Run Pipeline**
3. Select the `.gitlab/docker-image.yml` pipeline file
4. Click **Run Pipeline**

**Option 2: Git Commit Message**
Include `[build-docker]` in your commit message on the main branch:

```bash
git commit -m "chore: update dependencies [build-docker]"
git push origin main
```

### When to Rebuild the Image

Rebuild the Docker image when:

- **Dependencies change**: After updating `package.json` or `pnpm-lock.yaml`
- **Major updates**: When Node.js or pnpm versions are upgraded
- **CI failures**: If CI fails due to missing or outdated dependencies
- **Periodic refresh**: Every 1-2 months to stay current

## Architecture

### Files

```
.gitlab/
├── Dockerfile.ci         # Docker image definition
└── docker-image.yml      # CI pipeline for building the image

.gitlab-ci.yml            # Main CI config (uses the custom image)
```

### Docker Image Layers

1. **Base**: `node:20-alpine` (minimal Node.js 20 image)
2. **System Dependencies**: git, bash, curl, python3, make, g++
3. **pnpm**: Globally installed via corepack (v10.27.0)
4. **Project Dependencies**: All packages pre-installed from lockfile

### GitLab Container Registry

Images are stored at:

```
registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:latest
registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:<commit-sha>
```

## Usage in CI/CD

### Main CI Pipeline

The `.gitlab-ci.yml` automatically uses the custom image:

```yaml
image: ${CI_REGISTRY_IMAGE}/ci-build:latest
```

### Job-Specific Images

Some jobs override the default image for specific tools:

- **SonarCloud**: Uses `sonarsource/sonar-scanner-cli:latest`
- **Playwright E2E**: Uses `mcr.microsoft.com/playwright:v1.57.0-noble`

### Fallback Mechanism

If the custom image is unavailable (not built yet), the CI will:

1. Detect missing `node_modules`
2. Run `pnpm install --frozen-lockfile` as usual
3. Continue the pipeline normally

To force using the standard Node image instead:

```yaml
# In .gitlab-ci.yml
image: node:20 # Replace custom image line
```

## Building Locally (Optional)

You can build and test the Docker image locally:

```bash
# Build the image
docker build -f .gitlab/Dockerfile.ci -t riddle-rush-ci:local .

# Test the image
docker run --rm -it riddle-rush-ci:local bash
node --version
pnpm --version
ls -la node_modules/
```

## Troubleshooting

### Image Pull Failures

**Error**: `Failed to pull image`

**Solutions**:

1. Ensure the image has been built (check Container Registry)
2. Verify GitLab registry authentication is working
3. Temporarily switch to `image: node:20` until image is built

### Outdated Dependencies

**Error**: Tests fail due to version mismatches

**Solution**:

1. Rebuild the Docker image after updating dependencies
2. Check that `pnpm-lock.yaml` is committed

### Large Image Size

**Current size**: ~500MB (compressed)

If image becomes too large:

- Remove unnecessary system dependencies in Dockerfile
- Use multi-stage build to reduce final layer size
- Consider separate images for different job types

## Updating the Dockerfile

When modifying `.gitlab/Dockerfile.ci`:

1. **Test locally first**:

   ```bash
   docker build -f .gitlab/Dockerfile.ci -t riddle-rush-ci:test .
   docker run --rm -it riddle-rush-ci:test pnpm run test:unit
   ```

2. **Update package files**:
   - Ensure all `package.json` files are copied correctly
   - Maintain the monorepo structure

3. **Rebuild in GitLab**:
   - Commit the Dockerfile changes
   - Trigger the docker-image pipeline manually

4. **Verify CI**:
   - Run a test pipeline to ensure it works

## Security Considerations

- **Base Image Updates**: Keep `node:20-alpine` updated for security patches
- **Credentials**: Never include secrets or credentials in the Docker image
- **Registry Access**: Container Registry is private, accessible only to project members
- **Scanning**: Consider enabling GitLab Container Scanning for vulnerabilities

## Performance Metrics

### Before Custom Image

- **Test Job**: ~90 seconds (60s install + 30s tests)
- **Build Job**: ~120 seconds (60s install + 60s build)
- **Total Pipeline**: ~4-5 minutes

### After Custom Image

- **Test Job**: ~35 seconds (5s verify + 30s tests)
- **Build Job**: ~65 seconds (5s verify + 60s build)
- **Total Pipeline**: ~2-3 minutes

**Savings**: ~40-50% reduction in pipeline duration

## Alternative Approaches

If the custom image approach doesn't work for your use case:

### 1. GitLab Dependency Proxy

Use GitLab's dependency proxy to cache npm packages:

```yaml
variables:
  npm_config_registry: ${CI_DEPENDENCY_PROXY_GROUP_IMAGE_PREFIX}/registry.npmjs.org
```

### 2. Shared Cache

Use GitLab's cache with longer TTL:

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .pnpm-store/
  policy: pull-push
```

### 3. Build Artifacts

Save `node_modules` as artifacts between jobs:

```yaml
artifacts:
  paths:
    - node_modules/
  expire_in: 1 hour
```

## Future Improvements

- [ ] Multi-stage builds for smaller image size
- [ ] Separate images for different Node versions
- [ ] Automated rebuilds on dependency updates (renovate bot)
- [ ] Image vulnerability scanning in CI
- [ ] Terraform module for managing Docker image lifecycle

## References

- [GitLab Container Registry Docs](https://docs.gitlab.com/ee/user/packages/container_registry/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [pnpm Docker Best Practices](https://pnpm.io/docker)
