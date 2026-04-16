# @riddle-rush/config

Shared configuration package for the Riddle Rush monorepo.

## Contents

- **Vite Configuration** - Shared Vite config utilities, plugins, and build settings
- **ESLint Configuration** - Shared linting rules and configuration
- **Prettier Configuration** - Shared formatting rules
- **Build Utilities** - Shared build helper functions

## Usage

### Vite Configuration

```typescript
import {
  getWorkspaceAliases,
  getDevPlugins,
  getBuildPlugins,
  getOptimizeDeps,
  getBuildConfig,
} from '@riddle-rush/config/vite'

// In nuxt.config.ts or vite.config.ts
export default defineNuxtConfig({
  vite: {
    resolve: {
      alias: getWorkspaceAliases(),
    },
    plugins: [...getDevPlugins({ isDev: true })],
    optimizeDeps: getOptimizeDeps(),
    build: getBuildConfig().build,
  },
})
```

### ESLint Configuration

```javascript
// apps/game/eslint.config.mjs
import { defineConfig } from '@nuxt/eslint'
import sharedConfig from '@riddle-rush/config/eslint'

export default defineConfig({
  ...sharedConfig,
  // App-specific overrides
})
```

### Prettier Configuration

The shared Prettier config is automatically used when Prettier is run from the root.

### Available Functions

**Vite:**

- `getWorkspaceAliases(workspaceRoot?)` - Returns workspace package aliases for Vite
- `getDevPlugins(options?)` - Returns development-only Vite plugins (inspect, vue-devtools, checker, visualizer)
- `getBuildPlugins(options?)` - Returns production build plugins (visualizer)
- `getOptimizeDeps()` - Returns optimized dependency pre-bundling config
- `getBuildConfig()` - Returns shared build configuration

**Build Utilities:**

- `getWorkspaceRoot()` - Find workspace root directory
- `packageExists(packageName)` - Check if a package exists
- `runInPackage(packageName, command)` - Run commands in specific packages
- `getWorkspacePackages()` - List all workspace packages
- `isCI()` - Check if running in CI environment
- `getBaseURL(environment?)` - Get environment-specific base URLs

## Plugins

### Development Plugins

- **vite-plugin-inspect** (`^1.1.0`) - Inspect the Vite transformation pipeline
  - Access at `http://localhost:3000/__inspect/` during dev
  - Shows how files are transformed and processed

- **vite-plugin-vue-devtools** (`^7.0.0`) - Enhanced Vue debugging
  - Component inspector
  - State inspection
  - Performance profiling

- **vite-plugin-checker** (`^0.8.0`) - Type checking and linting during dev
  - Real-time TypeScript type checking
  - ESLint integration
  - Vue template type checking (vue-tsc)
  - Non-blocking overlay errors

- **rollup-plugin-visualizer** (`^5.12.0`) - Visualize bundle size
  - Generates `.vite/stats.html` after build
  - Shows chunk sizes, dependencies, and optimization opportunities

### Installation

These plugins are peer dependencies. Install them in your app:

```bash
pnpm --filter game add -D \
  vite-plugin-inspect \
  vite-plugin-vue-devtools \
  vite-plugin-checker \
  rollup-plugin-visualizer \
  vue-tsc
```

## TypeScript

This package exports TypeScript types for all configuration functions.

## Contributing

When adding new shared configurations:

1. Add the config file to this package
2. Export it from the main entry point
3. Update this README
4. Add TypeScript types if needed
