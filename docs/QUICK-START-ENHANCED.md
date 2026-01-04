# Quick Start - Enhanced Monorepo

This guide helps you get started with the enhanced monorepo setup.

## Installation

```bash
# Install all dependencies
pnpm install

# Install app-specific dependencies
pnpm --filter game install
```

## Development

### Start Development Server

```bash
# Start game app with all plugins
pnpm dev
```

### Access Development Tools

Once the dev server is running:

- **App**: http://localhost:3000
- **Vite Inspect**: http://localhost:3000/\_\_inspect/
- **Vue DevTools**: Install browser extension or use built-in
- **Type Checker**: Errors shown in browser overlay

## Code Quality

### Check Everything

```bash
# Run all checks (syncpack, typecheck, lint)
pnpm workspace:check
```

### Fix Issues

```bash
# Auto-fix all issues (syncpack, lint, format)
pnpm workspace:fix
```

### Individual Commands

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint
pnpm lint:fix

# Format
pnpm format
pnpm format:check

# Check dependency versions
pnpm syncpack:check
pnpm syncpack:fix
```

## Version Management

### Create Changeset

When making changes that affect versioning:

```bash
# Create a changeset
pnpm changeset

# Follow prompts to describe changes
# Select affected packages
# Choose version bump type
```

### Version Packages

After changesets are reviewed and merged:

```bash
# Version packages based on changesets
pnpm changeset:version

# This will:
# - Update package versions
# - Generate changelogs
# - Commit changes
```

### Publish (CI/CD)

```bash
# Publish packages (usually in CI/CD)
pnpm changeset:publish
```

## Build

### Build Game App

```bash
# Build for production
pnpm build

# Generate static site
pnpm generate

# Preview production build
pnpm --filter game preview
```

### Analyze Bundle

After building, check bundle analysis:

```bash
# Open bundle stats
open apps/game/.vite/stats.html
```

## Testing

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# Coverage
pnpm --filter game test:unit:coverage
```

## Monorepo Management

### Check Dependency Versions

```bash
# Check for mismatches
pnpm syncpack:check

# Fix mismatches
pnpm syncpack:fix

# Format package.json files
pnpm syncpack:format
```

### Workspace Commands

```bash
# Run command in specific package
pnpm --filter game <command>
pnpm --filter docs <command>
pnpm --filter shared <command>

# Run command in all packages
pnpm -r <command>
```

## Troubleshooting

### Plugin Not Working

1. Check if plugin is installed:

   ```bash
   pnpm --filter game list | grep vite-plugin
   ```

2. Check peer dependencies:

   ```bash
   pnpm --filter game list --depth=0
   ```

3. Reinstall:
   ```bash
   pnpm --filter game install
   ```

### Type Checker Not Showing

1. Ensure `vite-plugin-checker` is installed
2. Check browser console for errors
3. Verify TypeScript config is correct
4. Restart dev server

### Syncpack Errors

1. Check configuration: `.syncpackrc.json`
2. Review mismatches: `pnpm syncpack:check`
3. Auto-fix: `pnpm syncpack:fix`

## Useful Commands Reference

```bash
# Development
pnpm dev                    # Start game app
pnpm dev:docs               # Start docs app

# Building
pnpm build                 # Build game
pnpm build:docs            # Build docs
pnpm generate              # Generate static site

# Testing
pnpm test                  # Run unit tests
pnpm test:unit             # Run unit tests once
pnpm test:e2e              # Run E2E tests

# Code Quality
pnpm workspace:check       # Check everything
pnpm workspace:fix         # Fix everything
pnpm typecheck             # Type check all
pnpm lint                  # Lint all
pnpm format                # Format all

# Version Management
pnpm changeset             # Create changeset
pnpm changeset:version     # Version packages
pnpm changeset:publish     # Publish packages

# Dependency Management
pnpm syncpack:check        # Check versions
pnpm syncpack:fix          # Fix versions
pnpm syncpack:format       # Format package.json

# Cleanup
pnpm clean                 # Clean all builds
```

## Next Steps

1. **Read Documentation**:
   - [MONOREPO.md](../MONOREPO.md) - Monorepo structure
   - [MONOREPO-ENHANCEMENTS.md](./MONOREPO-ENHANCEMENTS.md) - New features
   - [MONOREPO-REFACTOR.md](./MONOREPO-REFACTOR.md) - Refactoring details

2. **Explore Tools**:
   - Try Vite inspect plugin: http://localhost:3000/\_\_inspect/
   - Check bundle stats after build
   - Use Vue DevTools for debugging

3. **Set Up CI/CD**:
   - Configure changesets in CI
   - Set up automated publishing
   - Add workspace checks to pipeline
