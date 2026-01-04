# Monorepo Enhancements - Vite, ESLint & Management Tools

This document describes the enhanced monorepo setup with additional Vite plugins, ESLint configuration, and monorepo management tools.

## New Vite Plugins

### Development Plugins

#### 1. vite-plugin-inspect (`^1.1.0`)

- **Purpose**: Inspect the Vite transformation pipeline
- **Access**: `http://localhost:3000/__inspect/` during development
- **Features**:
  - See how files are transformed
  - Debug module resolution
  - Inspect plugin transformations

#### 2. vite-plugin-vue-devtools (`^7.0.0`)

- **Purpose**: Enhanced Vue debugging with DevTools
- **Features**:
  - Component inspector
  - State inspection
  - Performance profiling
  - Timeline view

#### 3. vite-plugin-checker (`^0.8.0`)

- **Purpose**: Type checking and linting during development
- **Features**:
  - Real-time TypeScript type checking
  - ESLint integration
  - Vue template type checking (vue-tsc)
  - Overlay errors in browser
  - Non-blocking (doesn't stop dev server)

#### 4. rollup-plugin-visualizer (`^5.12.0`)

- **Purpose**: Bundle size visualization
- **Output**: `.vite/stats.html` after build
- **Features**:
  - Chunk size analysis
  - Dependency tree
  - Gzip/Brotli size estimates
  - Optimization suggestions

### Usage

All plugins are automatically loaded based on environment:

```typescript
// In nuxt.config.ts
import { getDevPlugins, getBuildPlugins } from '@riddle-rush/config/vite'

export default defineNuxtConfig({
  vite: {
    plugins: [
      ...getDevPlugins({ isDev: true, root: '.' }),
      ...(isProduction ? getBuildPlugins() : []),
    ],
  },
})
```

## ESLint Configuration

### Shared ESLint Config

Located in `packages/config/eslint.config.mjs`:

- Extends `@nuxt/eslint` recommended config
- TypeScript-specific rules
- Vue-specific rules
- Environment-aware rules (production vs development)

### App-Level Usage

```javascript
// apps/game/eslint.config.mjs
import { defineConfig } from '@nuxt/eslint'
import sharedConfig from '@riddle-rush/config/eslint'

export default defineConfig({
  ...sharedConfig,
  // App-specific overrides
})
```

### Key Rules

- **TypeScript**: Warn on unused vars (with `_` prefix exception)
- **Vue**: Allow single-word components, flexible template roots
- **Console**: Error in production, warn in development
- **Debugger**: Error in production, warn in development

## Monorepo Management Tools

### 1. @changesets/cli (`^2.27.9`)

**Purpose**: Version management and changelog generation

**Configuration**: `.changeset/config.json`

**Usage**:

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm changeset:version

# Publish packages
pnpm changeset:publish
```

**Features**:

- Semantic versioning
- Automatic changelog generation
- Linked package versioning
- Pre-release support

### 2. syncpack (`^13.0.0`)

**Purpose**: Keep dependency versions synchronized across packages

**Configuration**: `.syncpackrc.json`

**Usage**:

```bash
# Check for mismatches
pnpm syncpack:check

# Fix mismatches automatically
pnpm syncpack:fix

# Format package.json files
pnpm syncpack:format
```

**Features**:

- Enforce consistent versions
- Workspace package version sync
- Dependency range management
- Format package.json files

### 3. @pnpm/filter-workspace-packages (`^1.0.0`)

**Purpose**: Enhanced workspace package filtering

**Features**:

- Better workspace package selection
- Pattern matching
- Dependency graph filtering

## New Root Scripts

### Workspace Management

```bash
# Check workspace consistency
pnpm workspace:check    # Runs syncpack, typecheck, and lint

# Fix workspace issues
pnpm workspace:fix      # Runs syncpack fix, lint fix, and format
```

### Changeset Management

```bash
# Create a changeset
pnpm changeset

# Version packages based on changesets
pnpm changeset:version

# Publish packages
pnpm changeset:publish
```

### Syncpack Commands

```bash
# Check for version mismatches
pnpm syncpack:check

# Fix version mismatches
pnpm syncpack:fix

# Format package.json files
pnpm syncpack:format
```

## Prettier Configuration

### Shared Config

Located in `packages/config/prettier.config.js`:

- Consistent formatting across monorepo
- File-specific overrides (JSON, Markdown)
- Vue-specific settings

### Root Config

`.prettierrc.json` at root for IDE integration.

## Package Structure

```
packages/config/
├── vite.config.ts          # Vite configuration utilities
├── eslint.config.mjs       # ESLint configuration
├── prettier.config.js      # Prettier configuration
├── scripts/
│   └── build-utils.ts     # Build utility functions
├── index.ts               # Main entry point
└── package.json           # Package manifest
```

## Installation

After pulling these changes, install new dependencies:

```bash
# Install root dependencies
pnpm install

# Install app-specific dependencies
pnpm --filter game install
```

## Development Workflow

### 1. Start Development

```bash
# Start dev server with all plugins
pnpm dev

# Access DevTools
# - Inspect: http://localhost:3000/__inspect/
# - Vue DevTools: Browser extension or built-in
# - Type checker: Overlay in browser
```

### 2. Check Code Quality

```bash
# Run all checks
pnpm workspace:check

# Fix issues automatically
pnpm workspace:fix
```

### 3. Before Committing

```bash
# Format code
pnpm format

# Lint and fix
pnpm lint:fix

# Type check
pnpm typecheck
```

### 4. Version Management

```bash
# Create changeset for changes
pnpm changeset

# After review, version packages
pnpm changeset:version

# Publish (in CI/CD)
pnpm changeset:publish
```

## Benefits

### Developer Experience

1. **Real-time Feedback**: Type checking and linting during development
2. **Better Debugging**: Vue DevTools and Vite inspect plugin
3. **Bundle Analysis**: Visualize bundle size and dependencies
4. **Consistent Formatting**: Shared Prettier config

### Monorepo Management

1. **Version Sync**: Keep dependencies consistent across packages
2. **Changelog Generation**: Automatic changelogs from changesets
3. **Workspace Scripts**: Unified commands for common tasks
4. **Dependency Management**: Syncpack ensures version consistency

### Code Quality

1. **Type Safety**: Real-time TypeScript checking
2. **Linting**: Consistent ESLint rules across packages
3. **Formatting**: Automatic code formatting
4. **Error Prevention**: Catch issues during development

## Configuration Files

### .changeset/config.json

- Changeset configuration
- Changelog settings
- Ignored packages

### .syncpackrc.json

- Dependency version rules
- Workspace package sync
- Version range preferences

### .prettierrc.json

- Root Prettier config for IDE
- Shared with all packages

## Troubleshooting

### Plugin Not Loading

If a plugin doesn't load, check:

1. Is it installed in the app's `package.json`?
2. Is it listed in `peerDependencies` of `@riddle-rush/config`?
3. Check console for error messages

### Type Checker Overlay Not Showing

1. Ensure `vite-plugin-checker` is installed
2. Check browser console for errors
3. Verify TypeScript config is correct

### Syncpack Errors

1. Run `pnpm syncpack:check` to see mismatches
2. Review `.syncpackrc.json` configuration
3. Use `pnpm syncpack:fix` to auto-fix

## Next Steps

Potential future enhancements:

- [ ] Add `turbo` or `nx` for task orchestration
- [ ] Add `dependabot` or `renovate` for dependency updates
- [ ] Add `semantic-release` for automated releases
- [ ] Add `commitlint` for commit message validation
- [ ] Add `husky` hooks for pre-commit checks
- [ ] Add `lint-staged` for staged file linting
