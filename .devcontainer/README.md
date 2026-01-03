# Dev Container Configuration

This directory contains the development container configuration for the Riddle Rush monorepo. The devcontainer works with both **VS Code** and **Cursor IDE**.

## Quick Start

1. **VS Code**: Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and select "Dev Containers: Reopen in Container"
2. **Cursor**: Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and select "Dev Containers: Reopen in Container"

The container will automatically:
- Install Node.js 20
- Install pnpm 10.27.0
- Install all project dependencies
- Install Playwright browsers for E2E testing
- Generate Nuxt types
- Set up recommended VS Code/Cursor extensions

## What's Included

### Base Image
- Node.js 20 (Debian-based)
- Git
- GitHub CLI

### Installed Tools
- **pnpm** 10.27.0 (via corepack)
- **Playwright** browsers (Chromium with dependencies)
- All project dependencies

### VS Code/Cursor Extensions
- Vue Language Features (Volar)
- ESLint
- Prettier
- SonarLint
- SCSS IntelliSense
- Stylelint
- Path Intellisense
- Error Lens
- Auto Rename Tag
- Color Highlight
- Playwright Test

### Port Forwarding
- **3000**: Game app (auto-notify)
- **3001**: Docs app (ignore)

## Customization

### Using a Custom Dockerfile

If you need more control over the container setup, you can uncomment the `dockerfile` and `context` properties in `devcontainer.json` and use the provided `Dockerfile`:

```json
{
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  }
}
```

### Adding System Packages

To install additional system packages, modify the `postCreateCommand` in `devcontainer.json` or add them to the `post-create.sh` script.

### Environment Variables

You can add environment variables to `devcontainer.json`:

```json
{
  "containerEnv": {
    "NODE_ENV": "development",
    "BASE_URL": "/"
  }
}
```

## Troubleshooting

### Container Build Fails

1. Check Docker is running
2. Ensure you have enough disk space
3. Try rebuilding: "Dev Containers: Rebuild Container"

### Dependencies Not Installing

1. Check internet connection
2. Verify `pnpm-lock.yaml` is up to date
3. Try clearing cache: `pnpm store prune`

### Playwright Tests Fail

1. Ensure Playwright browsers are installed: `pnpm exec playwright install --with-deps chromium`
2. Check that the container has display access (for headed tests)

### Port Forwarding Issues

1. Check if ports 3000/3001 are already in use
2. Manually forward ports: "Ports" tab in VS Code/Cursor

## Development Workflow

Once the container is running:

```bash
# Start game app
pnpm run dev

# Start docs app
pnpm run dev:docs

# Run tests
pnpm run test
pnpm run test:e2e

# Type check
pnpm run typecheck

# Lint
pnpm run lint
pnpm run lint:fix
```

## Notes

- The container runs as the `node` user (non-root)
- Workspace is mounted at `/workspace`
- Git hooks are automatically set up (if not in CI)
- All VS Code/Cursor settings are synced from `.vscode/settings.json`
