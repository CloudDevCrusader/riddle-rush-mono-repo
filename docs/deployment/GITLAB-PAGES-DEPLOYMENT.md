# GitLab Pages Deployment Configuration

## Overview

The documentation site is deployed to GitLab Pages from the `public/` directory at the repository root.

## Deployment Flow

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
- **URL:** `https://djdiox.gitlab.io/riddle-rush-nuxt-pwa`

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
