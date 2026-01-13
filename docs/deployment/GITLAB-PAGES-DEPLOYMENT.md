# Docs Deployment Configuration

## Overview

The documentation site is hosted at `https://docs.riddlerush.de`.

Two deployment options are supported:

- **Local deploy (AWS S3 + CloudFront)** using `scripts/deploy-docs.sh`
- **GitLab Pages** (optional)

## Local Deployment Flow (Recommended)

```bash
export DOCS_S3_BUCKET=your-docs-bucket
export DOCS_CLOUDFRONT_ID=your-cloudfront-id # optional
./scripts/deploy-docs.sh
```

This builds the docs app, syncs the output to S3, and optionally invalidates CloudFront.

Terraform stack: `infrastructure/environments/docs`.

## DNS Setup (docs.riddlerush.de)

Point `docs.riddlerush.de` to the docs CloudFront distribution (recommended) or the S3 website endpoint.

## GitLab Pages Deployment Flow (Optional)

### 1. Build Stage (`build:docs`)

- **Location:** `apps/docs/`
- **Command:** `pnpm run generate`
- **Output:** `apps/docs/.output/public/`

### 2. Copy Stage (in `build:docs` job)

- **Source:** `apps/docs/.output/public/*`
- **Destination:** `public/` (repo root)
- **Purpose:** GitLab Pages serves from `public/` directory

### 3. Deploy Stage (`pages` job)

- **Artifact:** `public/`
- **URL:** GitLab Pages URL (if enabled)

## Directory Structure

```
.
├── apps/
│   └── docs/
│       ├── .output/
│       │   └── public/     # Nuxt build output
│       └── ...
├── public/                  # GitLab Pages source (created by CI)
│   ├── index.html
│   ├── docs/
│   └── ...
└── .gitlab-ci.yml
```

## CI/CD Configuration

### build:docs Job

```yaml
build:docs:
  script:
    - cd apps/docs
    - pnpm run generate
    - cd ../..
    - mkdir -p public
    - cp -r apps/docs/.output/public/* public/
  artifacts:
    paths:
      - public
```

### pages Job

```yaml
pages:
  dependencies:
    - build:docs
  artifacts:
    paths:
      - public
```

## Verification

After build, `public/` should contain:

- `index.html` - Docs home page
- `docs/` - Documentation pages
- All static assets (CSS, JS, images)
