# Testing Guide for Monorepo

## Prerequisites

1. Install dependencies:
   ```bash
   pnpm install
   ```

## Testing Game App

### Development Server

```bash
# From root
pnpm dev

# Or from app directory
cd apps/game && pnpm dev
```

### Build

```bash
# From root
pnpm build

# Or from app directory
cd apps/game && pnpm run generate
```

### Type Check

```bash
cd apps/game && pnpm run typecheck
```

### Test

```bash
cd apps/game && pnpm run test:unit
```

## Testing Docs App

### Development Server

```bash
# From root
pnpm dev:docs

# Or from app directory
cd apps/docs && pnpm dev
```

### Build

```bash
# From root
pnpm build:docs

# Or from app directory
cd apps/docs && pnpm run generate
```

## GitLab Pages Deployment

### Docs Deployment

1. Push to `main` branch
2. CI will:
   - Build docs app (`build:docs` job)
   - Deploy to GitLab Pages (`pages` job)
3. Access at: `https://riddlerush.de/docs`

### Game App Deployment

1. Create a version tag: `git tag v1.0.0 && git push --tags`
2. CI will:
   - Build game app (`build` job)
   - Deploy to AWS (`deploy:aws` job)
   - Run E2E tests (`verify:e2e:aws` job)

## Troubleshooting

### better-sqlite3 errors

- Docs app requires `better-sqlite3` for Nuxt Content
- Install: `cd apps/docs && pnpm add -D better-sqlite3`

### TTY errors in CI

- Set `CI=true` environment variable
- Or use `--no-tty` flags where available

### Workspace package not found

- Run `pnpm install` from root
- Check `pnpm-workspace.yaml` configuration
