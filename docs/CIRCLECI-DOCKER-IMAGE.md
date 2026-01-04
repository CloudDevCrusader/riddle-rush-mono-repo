# Custom CircleCI Docker Image

This document explains the custom Docker image used in CircleCI to speed up build times by pre-installing deployment tools.

## Overview

The custom Docker image (`ci-build`) is based on `cimg/node:20.19.0` with pre-installed tools that would otherwise need to be installed during every CircleCI job:

- **AWS CLI v2** - For S3 and CloudFront deployments
- **Terraform** - For infrastructure outputs and management
- **pnpm 10.27.0** - Via corepack for package management
- **Node.js 20.19.0** - Base runtime
- **Common build dependencies** - curl, unzip, wget, gnupg, etc.

## Why Use a Custom Image?

**Speed Improvement**: Installing AWS CLI and Terraform on every job adds ~30-60 seconds per job. With multiple jobs per pipeline, this adds up quickly. The custom image eliminates this overhead.

**Consistency**: All jobs use the same versions of tools, reducing environment-related issues.

**Simplicity**: Jobs have cleaner configuration without repetitive setup steps.

## Image Location

The image is hosted in GitLab Container Registry:

```
registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:latest
```

## Building the Image

### Prerequisites

- Docker installed locally
- GitLab account with access to the project

### Build and Push

```bash
# Navigate to .circleci directory
cd .circleci

# Build only (for testing)
./build-docker-image.sh

# Build and push to GitLab Container Registry
./build-docker-image.sh --push

# Build and push with custom tag
./build-docker-image.sh --push --tag v1.0.0
```

### Authentication

Before pushing, you need to authenticate with GitLab Container Registry:

```bash
# Create a GitLab Personal Access Token with 'read_registry' and 'write_registry' scopes
# Settings → Access Tokens → Add new token

# Login to GitLab Container Registry
docker login registry.gitlab.com -u <your-gitlab-username> -p <your-access-token>
```

## Using the Image in CircleCI

### 1. The Image is Already Configured

The image reference is already set in `.circleci/config.yml`:

```yaml
# Custom image anchor
x-custom-image: &custom-image registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:latest

# Used in jobs
jobs:
  test:
    docker:
      - image: *custom-image
```

### 2. CircleCI Authentication (Optional)

If the GitLab Container Registry requires authentication for pulls:

**Project Settings → Environment Variables:**

- `GITLAB_REGISTRY_USER` - Your GitLab username
- `GITLAB_REGISTRY_TOKEN` - GitLab Personal Access Token with `read_registry` scope

CircleCI will automatically pull the image using these credentials.

**Note**: If the GitLab project is public, authentication may not be required for pulling images.

## Jobs Using the Custom Image

The following CircleCI jobs use the custom image:

- `test` - Unit tests
- `build` - Game app production build
- `build-docs` - Documentation site build
- `deploy-aws-dev` - Development deployment
- `deploy-aws-prod` - Production deployment

**Note**: E2E test jobs (`test-e2e-local`, `verify-e2e-aws`) use the specialized Playwright image instead, as it includes browser binaries needed for testing.

## What's Pre-installed

### AWS CLI v2

```bash
aws --version
# aws-cli/2.x.x Python/3.x.x Linux/x.x.x
```

Used by deployment jobs to upload builds to S3 and invalidate CloudFront cache.

### Terraform

```bash
terraform version
# Terraform v1.x.x
```

Used to fetch infrastructure outputs (S3 bucket name, CloudFront distribution ID) from the Terraform state.

### pnpm

```bash
corepack pnpm --version
# 10.27.0
```

Package manager for installing project dependencies.

### Node.js & npm

```bash
node --version
# v20.19.0

npm --version
# 10.x.x
```

JavaScript runtime and package manager.

## Updating the Image

When you need to update tool versions or add new dependencies:

### 1. Update the Dockerfile

Edit `.circleci/Dockerfile`:

```dockerfile
# Example: Update pnpm version
RUN corepack prepare pnpm@10.28.0 --activate

# Example: Add a new tool
RUN apt-get update && apt-get install -y newtool \
    && rm -rf /var/lib/apt/lists/*
```

### 2. Rebuild and Push

```bash
cd .circleci

# Build with version tag
./build-docker-image.sh --push --tag v1.1.0

# Also update 'latest' tag
./build-docker-image.sh --push --tag latest
```

### 3. Update CircleCI Config (Optional)

If using a versioned tag, update `.circleci/config.yml`:

```yaml
x-custom-image: &custom-image registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:v1.1.0
```

For production use, pinning to a specific version tag is recommended over `latest` for reproducibility.

## Troubleshooting

### Image Pull Failures

**Error**: `Error response from daemon: pull access denied`

**Solutions**:

1. Verify image exists: `docker pull registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:latest`
2. Check GitLab Container Registry permissions (project must be accessible)
3. Add `GITLAB_REGISTRY_USER` and `GITLAB_REGISTRY_TOKEN` to CircleCI environment variables if registry requires auth

### Tool Not Found Errors

**Error**: `terraform: command not found` or `aws: command not found`

**Solutions**:

1. Verify the job is using the custom image: `docker: - image: *custom-image`
2. Check that the image was rebuilt after adding the tool
3. Verify the image tag in config matches the pushed image

### Build Script Permission Error

**Error**: Permission denied on `build-docker-image.sh`

**Solution**:

```bash
chmod +x .circleci/build-docker-image.sh
```

### Version Mismatches

**Error**: Tool version differs from expected

**Solution**:

1. Rebuild the image after Dockerfile changes
2. Push with a new version tag to avoid caching: `--tag v1.1.0`
3. Update the config to use the new tag
4. Clear CircleCI cache if needed (re-run workflow)

## Performance Impact

### Before Custom Image

Typical deployment job timeline:

- Checkout: 2s
- **Setup AWS CLI: 30s** ⬅️ Eliminated
- **Setup Terraform: 25s** ⬅️ Eliminated
- Setup pnpm: 5s
- Install dependencies: 40s
- Build: 30s
- Deploy: 20s
- **Total: ~152s**

### After Custom Image

Typical deployment job timeline:

- Checkout: 2s
- Setup pnpm: 5s
- Install dependencies: 40s
- Build: 30s
- Deploy: 20s
- **Total: ~97s**

**Time saved: ~55s per job (36% faster)**

### Pipeline-Wide Impact

With 5 jobs using the custom image per pipeline:

- **Time saved per pipeline: ~4-5 minutes**
- **Percentage improvement: ~30-40% faster overall**

## Image Size

- Base `cimg/node:20.19.0`: ~800 MB
- Custom `ci-build` image: ~1.2 GB
- **Additional size: ~400 MB** (AWS CLI + Terraform + dependencies)

The additional 400 MB is pulled once per CircleCI executor and cached. Subsequent jobs reuse the cached image.

## Security Considerations

### Image Maintenance

- Keep base image updated: Monitor `cimg/node:20.19.0` releases for security patches
- Update tool versions regularly to patch vulnerabilities
- Scan images for vulnerabilities: `docker scan <image-name>`

### Access Control

- GitLab Container Registry is private by default
- Only users with project access can pull the image
- Use dedicated service account tokens for CI (not personal tokens)

### Credentials Safety

- **Never** include AWS credentials, secrets, or tokens in the Docker image
- Credentials are passed via CircleCI environment variables at runtime
- The image only contains publicly available tools

## Files Reference

### Dockerfile

Location: `.circleci/Dockerfile`

Defines the custom image with all pre-installed tools.

### Build Script

Location: `.circleci/build-docker-image.sh`

Automates building and pushing the image to GitLab Container Registry.

Usage:

```bash
./build-docker-image.sh [--push] [--tag TAG] [--project PROJECT]
```

### CircleCI Config

Location: `.circleci/config.yml`

Uses the custom image via YAML anchor:

```yaml
x-custom-image: &custom-image registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:latest
```

## Alternative: Docker Hub

If you prefer to use Docker Hub instead of GitLab Container Registry:

```bash
# Build and push to Docker Hub
./build-docker-image.sh --push \
  --registry docker.io \
  --project yourusername \
  --tag latest

# Update config.yml
x-custom-image: &custom-image yourusername/ci-build:latest
```

Add Docker Hub credentials to CircleCI:

- `DOCKER_USER` - Docker Hub username
- `DOCKER_PASS` - Docker Hub access token

## Related Documentation

- [CircleCI Configuration](../.circleci/config.yml) - Pipeline configuration
- [Dockerfile](../.circleci/Dockerfile) - Image definition
- [Build Script](../.circleci/build-docker-image.sh) - Build automation
- [CircleCI Setup Guide](./CIRCLECI-SETUP.md) - Overall CircleCI configuration
- [AWS Deployment](./AWS-DEPLOYMENT.md) - AWS deployment process
- [Terraform Setup](./TERRAFORM-SETUP.md) - Infrastructure as code

## Best Practices

### Version Pinning

Use specific version tags in production:

```yaml
x-custom-image: &custom-image registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:v1.2.0
```

This ensures reproducible builds and avoids surprises from `latest` tag changes.

### Regular Updates

Schedule periodic image rebuilds (monthly or quarterly) to:

- Pick up security patches from base image
- Update AWS CLI and Terraform to latest stable versions
- Keep pnpm in sync with project requirements

### Testing Changes

Before updating production config:

1. Build image with test tag: `./build-docker-image.sh --push --tag test`
2. Update config to use test tag temporarily
3. Run CircleCI pipeline to verify
4. If successful, tag as `latest` or version number

## FAQ

**Q: Do I need to rebuild the image when dependencies change?**
A: No. Project dependencies (`node_modules`) are installed at runtime via `pnpm install`. The image only contains system-level tools (AWS CLI, Terraform).

**Q: Can I use this image locally?**
A: Yes! Pull and run it locally for testing:

```bash
docker pull registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:latest
docker run --rm -it registry.gitlab.com/djdiox/riddle-rush-nuxt-pwa/ci-build:latest bash
```

**Q: How often should I update the image?**
A: Update when:

- AWS CLI or Terraform major versions are released
- Security vulnerabilities are discovered in included tools
- Base Node.js image is updated (e.g., 20.19.0 → 20.20.0)
- Every 2-3 months as general maintenance

**Q: What if the image fails to pull?**
A: CircleCI will fail the job. Temporary workaround: Update config to use base image `cimg/node:20.19.0` and restore `setup-aws` and `setup-terraform` commands until the custom image is available.

## Next Steps

1. **Build the image**:

   ```bash
   cd .circleci
   ./build-docker-image.sh --push
   ```

2. **Verify in CircleCI**: Trigger a pipeline and check that jobs run faster

3. **Monitor performance**: Compare job durations before/after

4. **Schedule updates**: Set a reminder to rebuild quarterly

## Questions?

If you encounter issues:

1. Check the troubleshooting section above
2. Review CircleCI job logs for specific errors
3. Test the image locally: `docker run --rm <image> aws --version`
4. Verify the image exists in GitLab Container Registry
