# Monorepo Structure

This project uses a monorepo structure with pnpm workspaces for better organization and separation of concerns.

## Structure

```
riddle-rush-monorepo/
├── apps/
│   ├── game/              # Main game application (Nuxt PWA)
│   └── docs/              # Documentation site (Nuxt Content)
├── packages/
│   ├── shared/            # Shared utilities and helpers
│   ├── types/             # Shared TypeScript types
│   └── config/            # Shared configuration (ESLint, Prettier, etc.)
├── infrastructure/         # Terraform infrastructure
├── scripts/               # Root-level scripts
└── docs/                  # Legacy documentation (source files)
```

## Workspace Packages

### Apps

- **`apps/game`** - Main Riddle Rush game application
  - Nuxt 4 PWA
  - Game logic, components, stores
  - Deployed to AWS S3 + CloudFront

- **`apps/docs`** - Documentation site
  - Nuxt Content
  - Documentation pages
  - Deployed to GitLab Pages

### Packages

- **`packages/shared`** - Shared utilities
  - Common functions
  - Constants
  - Helpers

- **`packages/types`** - Shared TypeScript types
  - Game types
  - API types
  - Common interfaces

- **`packages/config`** - Shared configuration
  - Vite config utilities and plugins
  - Build utilities and helpers
  - ESLint config (coming soon)
  - Prettier config (coming soon)
  - TypeScript config (coming soon)

## Commands

### Development

```bash
# Run game app
pnpm dev

# Run docs app
pnpm dev:docs

# Run both (in parallel)
pnpm -r dev
```

### Building

```bash
# Build game
pnpm build

# Build docs
pnpm build:docs

# Build all
pnpm -r build
```

### Testing

```bash
# Test game
pnpm test

# Type check all
pnpm typecheck

# Lint all
pnpm lint
```

## Adding Dependencies

### To a specific workspace:

```bash
# Add to game app
pnpm --filter game add <package>

# Add to docs app
pnpm --filter docs add <package>

# Add to shared package
pnpm --filter shared add <package>
```

### To root (dev dependencies):

```bash
pnpm add -D -w <package>
```

## Vite Plugins & Development Tools

The monorepo includes shared Vite configuration with useful development plugins:

- **vite-plugin-inspect** - Inspect the Vite transformation pipeline
  - Access at `http://localhost:3000/__inspect/` during development
  - Shows how files are transformed and processed

- **rollup-plugin-visualizer** - Visualize bundle size
  - Generates `.vite/stats.html` after build
  - Shows chunk sizes, dependencies, and optimization opportunities

These plugins are configured in `packages/config/vite.config.ts` and automatically loaded based on environment.

## Git Hooks (Husky)

The monorepo uses Husky for git hooks:

- **Pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **Pre-push**: Runs typecheck, tests, and dependency checks
- **Commit-msg**: Validates commit messages

See [Husky & Turborepo Setup](docs/HUSKY-TURBOREPO-SETUP.md) for details.

## Task Orchestration (Turborepo)

The monorepo uses Turborepo for efficient task execution:

- **Caching**: Tasks are cached for faster subsequent runs
- **Parallelization**: Tasks run in parallel when possible
- **Dependencies**: Task dependencies are automatically handled
- **Filtering**: Run tasks on specific packages

All scripts now use Turborepo under the hood. See [Husky & Turborepo Setup](docs/HUSKY-TURBOREPO-SETUP.md) for details.

## Benefits

- ✅ **Clear separation** - Each app/package has its own purpose
- ✅ **Shared code** - Reuse types, utils, configs across workspaces
- ✅ **Independent builds** - Build apps separately or together
- ✅ **Better organization** - Easier to navigate and maintain
- ✅ **Scalability** - Easy to add new apps or packages
- ✅ **Developer experience** - Shared Vite config with useful plugins
- ✅ **IDE support** - Enhanced TypeScript and Cursor IDE configurations
- ✅ **Code quality** - Git hooks ensure code quality before commit/push
- ✅ **Fast builds** - Turborepo caching speeds up task execution
- ✅ **Task orchestration** - Efficient parallel task execution

