# Monorepo Refactoring Summary

This document summarizes the monorepo refactoring completed to improve structure, add Vite plugins, and enhance Cursor IDE integration.

## Changes Made

### 1. Shared Vite Configuration Package

Created `packages/config` with shared Vite configuration utilities:

- **`vite.config.ts`** - Shared Vite config functions:
  - `getWorkspaceAliases()` - Workspace package aliases
  - `getDevPlugins()` - Development plugins (inspect, visualizer)
  - `getBuildPlugins()` - Production build plugins
  - `getOptimizeDeps()` - Optimized dependency pre-bundling
  - `getBuildConfig()` - Shared build configuration

- **`scripts/build-utils.ts`** - Build utility functions:
  - `getWorkspaceRoot()` - Find workspace root
  - `packageExists()` - Check if package exists
  - `runInPackage()` - Run commands in specific packages
  - `getWorkspacePackages()` - List all workspace packages
  - `isCI()` - Check CI environment
  - `getBaseURL()` - Get environment-specific base URLs

### 2. Vite Plugins Added

#### Development Plugins

- **vite-plugin-inspect** (`^1.1.0`)
  - Inspect Vite transformation pipeline
  - Access at `http://localhost:3000/__inspect/` during dev
  - Shows how files are transformed and processed

- **rollup-plugin-visualizer** (`^5.12.0`)
  - Visualize bundle size and dependencies
  - Generates `.vite/stats.html` after build
  - Shows chunk sizes and optimization opportunities

These plugins are conditionally loaded:
- Development plugins only in dev mode
- Build plugins only in production builds
- Gracefully handles missing dependencies

### 3. Cursor IDE Integration

#### Enhanced Settings

Updated `.vscode/settings.json`:
- Improved TypeScript import preferences (`shortest` instead of `relative`)
- Added workspace package auto-imports
- Enhanced monorepo file watching exclusions
- Better search exclusions for build artifacts

#### Environment Configuration

Updated `.cursor/environment.json`:
- Added workspace structure definition
- Defined all workspace packages (apps and packages)
- Added workspace-specific commands
- Configured Vite and TypeScript preferences

#### IDE-Specific Features

- Better TypeScript path resolution for workspace packages
- Improved auto-import suggestions
- Enhanced file navigation in monorepo structure
- Workspace-aware IntelliSense

### 4. TypeScript Configuration Improvements

#### Root `tsconfig.json`

- Added `baseUrl` for better path resolution
- Enhanced path mappings for all workspace packages:
  - `@riddle-rush/shared` and `@riddle-rush/shared/*`
  - `@riddle-rush/types` and `@riddle-rush/types/*`
  - `@riddle-rush/config` and `@riddle-rush/config/*`
- Added `vite/client` types
- Improved exclude patterns

#### Package-Specific Configs

- `packages/config/tsconfig.json` - New config package TypeScript settings
- `apps/game/tsconfig.json` - Updated with config package path mappings

### 5. Game App Integration

Updated `apps/game/nuxt.config.ts`:
- Imports shared Vite config utilities
- Uses `getWorkspaceAliases()` for alias resolution
- Conditionally loads dev/build plugins
- Uses shared `getOptimizeDeps()` and `getBuildConfig()`
- Maintains app-specific overrides where needed

Updated `apps/game/package.json`:
- Added `@riddle-rush/config` dependency
- Added `vite-plugin-inspect` and `rollup-plugin-visualizer` dev dependencies

### 6. Package Structure

```
packages/config/
├── vite.config.ts          # Shared Vite configuration
├── scripts/
│   └── build-utils.ts     # Build utility functions
├── index.ts               # Main entry point
├── tsconfig.json          # TypeScript configuration
├── package.json           # Package manifest
└── README.md              # Documentation
```

## Usage

### Using Shared Vite Config

```typescript
// In nuxt.config.ts or vite.config.ts
import { 
  getWorkspaceAliases, 
  getDevPlugins, 
  getBuildPlugins, 
  getOptimizeDeps, 
  getBuildConfig 
} from '@riddle-rush/config/vite'

export default defineNuxtConfig({
  vite: {
    resolve: {
      alias: getWorkspaceAliases(),
    },
    plugins: [
      ...getDevPlugins({ isDev: true }),
    ],
    optimizeDeps: getOptimizeDeps(),
    build: getBuildConfig().build,
  },
})
```

### Using Build Utilities

```typescript
import { 
  getWorkspaceRoot, 
  packageExists, 
  runInPackage,
  isCI,
  getBaseURL 
} from '@riddle-rush/config/build-utils'

const root = getWorkspaceRoot()
const exists = packageExists('game')
const baseUrl = getBaseURL('production')
```

## Benefits

1. **Centralized Configuration** - All Vite config in one place, shared across apps
2. **Better DX** - Inspect plugin for debugging, visualizer for optimization
3. **IDE Support** - Enhanced Cursor IDE integration with workspace awareness
4. **Type Safety** - Improved TypeScript path resolution and auto-imports
5. **Maintainability** - Shared utilities reduce duplication
6. **Scalability** - Easy to add new apps/packages with consistent config

## Next Steps

Potential future enhancements:

- [ ] Add shared ESLint configuration to `packages/config`
- [ ] Add shared Prettier configuration to `packages/config`
- [ ] Add shared TypeScript base config to `packages/config`
- [ ] Create shared Vitest configuration
- [ ] Add more Vite plugins (e.g., `vite-plugin-pwa`, `vite-plugin-windicss`)
- [ ] Create workspace-aware scripts in root `package.json`
- [ ] Add workspace package documentation generator

## Migration Notes

### For Existing Code

No breaking changes. The refactoring is additive:
- Existing code continues to work
- New shared config is optional to use
- Plugins are conditionally loaded (won't break if not installed)

### For New Code

- Use `@riddle-rush/config` for shared Vite configuration
- Import from workspace packages using scoped names
- Leverage improved TypeScript path resolution
- Use build utilities for workspace operations

## Testing

After refactoring, verify:

1. ✅ Development server starts: `pnpm dev`
2. ✅ Build succeeds: `pnpm build`
3. ✅ Type checking passes: `pnpm typecheck`
4. ✅ Vite inspect plugin accessible at `/__inspect/`
5. ✅ Bundle visualizer generates `.vite/stats.html` after build
6. ✅ IDE auto-imports work for workspace packages
7. ✅ TypeScript path resolution works correctly

## Files Changed

### New Files
- `packages/config/vite.config.ts`
- `packages/config/scripts/build-utils.ts`
- `packages/config/index.ts`
- `packages/config/tsconfig.json`
- `packages/config/README.md`
- `docs/MONOREPO-REFACTOR.md`

### Modified Files
- `apps/game/nuxt.config.ts`
- `apps/game/package.json`
- `apps/game/tsconfig.json`
- `packages/config/package.json`
- `.vscode/settings.json`
- `.cursor/environment.json`
- `tsconfig.json` (root)
- `MONOREPO.md`
- `.gitignore`
