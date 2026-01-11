# Monorepo Environment Configuration Guide

## 🎯 Objective

Optimize environment variable management for Turborepo + pnpm workspace structure.

## 🚀 What's New

### Before (Split Configuration)

```
.
├── .env                  # Root variables
└── apps/
    ├── game/
    │   └── .env          # Game variables (duplicates)
    └── docs/
        └── .env          # Docs variables (duplicates)
```

### After (Monorepo-Optimized)

```
.
├── .env.monorepo         # Shared monorepo configuration
├── .env                  # Root overrides (loads .env.monorepo)
└── apps/
    ├── game/
    │   └── .env          # Game overrides (loads ../../.env.monorepo)
    └── docs/
        └── .env          # Docs overrides (loads ../../.env.monorepo)
```

## ✅ Benefits

1. **Single Source of Truth**: `.env.monorepo` contains shared configuration
2. **Workspace Awareness**: Automatic detection of current workspace
3. **No Duplication**: Eliminates duplicate variables
4. **Easy Overrides**: Workspace-specific files override shared defaults
5. **Turbo Optimized**: Works seamlessly with Turborepo caching

## 🔧 How It Works

### Environment Loading Order

1. **`.env.monorepo`** (lowest priority) - Shared defaults
2. **Workspace `.env`** (medium priority) - Workspace overrides
3. **CI/CD Variables** (high priority) - Pipeline overrides
4. **`.env.*local`** (highest priority) - Local development

### Workspace Detection

The `.env.monorepo` file includes automatic workspace detection:

```bash
# Detect current workspace
if [ -f "apps/game/package.json" ]; then
  export WORKSPACE_PACKAGE="game"
  export WORKSPACE_TYPE="app"
elif [ -f "apps/docs/package.json" ]; then
  export WORKSPACE_PACKAGE="docs"
  export WORKSPACE_TYPE="app"
# ... etc
```

### Variable Prefixes

- **`SHARED_*`**: Variables shared across all workspaces
- **`GAME_*`**: Game app specific variables
- **`DOCS_*`**: Docs app specific variables
- **`WORKSPACE_*`**: Workspace detection variables
- **`TURBO_*`**: Turborepo configuration variables

## 📋 File Structure

### `.env.monorepo` (Root)

```env
# Monorepo core configuration
WORKSPACE_ROOT=${WORKSPACE_ROOT:-$(pwd)}
WORKSPACE_PACKAGE=${WORKSPACE_PACKAGE:-$(basename $(pwd))}

# Shared variables
NODE_ENV=${NODE_ENV:-development}
APP_VERSION=${npm_package_version:-1.0.0}

# Workspace-specific defaults
GAME_BASE_URL=${GAME_BASE_URL:-/}
DOCS_BASE_URL=${DOCS_BASE_URL:-/docs}

# Turbo optimization
TURBO_CACHE_DIR=${TURBO_CACHE_DIR:-.turbo/cache}
TURBO_FORCE=${TURBO_FORCE:-false}
```

### `apps/game/.env` (Game App)

```env
# Load monorepo configuration first
if [ -f "../../.env.monorepo" ]; then
  source ../../.env.monorepo
fi

# Game-specific overrides
BASE_URL=${GAME_BASE_URL:-/}
GOOGLE_ANALYTICS_ID=${GAME_GOOGLE_ANALYTICS_ID:-G-XXXXXXXXXX}

# Game-specific variables
GAME_DIFFICULTY=${GAME_DIFFICULTY:-normal}
GAME_MAX_PLAYERS=${GAME_MAX_PLAYERS:-4}
```

### `apps/docs/.env` (Docs App)

```env
# Load monorepo configuration first
if [ -f "../../.env.monorepo" ]; then
  source ../../.env.monorepo
fi

# Docs-specific overrides
BASE_URL=${DOCS_BASE_URL:-/docs}

# Docs-specific variables
DOCS_TITLE=${DOCS_TITLE:-Riddle Rush Documentation}
DOCS_THEME=${DOCS_THEME:-default}
```

## 🚀 Usage Examples

### Accessing Variables in Code

**JavaScript/TypeScript**:

```javascript
// Access workspace information
const workspace = process.env.WORKSPACE_PACKAGE // "game", "docs", etc.
const workspaceType = process.env.WORKSPACE_TYPE // "app", "package", etc.

// Access shared variables
const nodeEnv = process.env.NODE_ENV
const appVersion = process.env.APP_VERSION

// Access workspace-specific variables
const baseUrl = process.env.BASE_URL
const gameDifficulty = process.env.GAME_DIFFICULTY
```

**Nuxt runtimeConfig**:

```javascript
// nuxt.config.ts
runtimeConfig: {
  public: {
    baseUrl: process.env.BASE_URL || '/',
    appVersion: process.env.APP_VERSION || '1.0.0',
    workspace: process.env.WORKSPACE_PACKAGE || 'unknown'
  }
}
```

**Turbo Configuration**:

```json
// turbo.json
{
  "tasks": {
    "build": {
      "env": ["NODE_ENV", "WORKSPACE_PACKAGE", "TURBO_FORCE", "SHARED_API_SECRET"]
    }
  }
}
```

## 🎯 Best Practices

### 1. Variable Naming

- **Shared Variables**: Prefix with `SHARED_*`
- **Workspace Variables**: Use workspace prefix (`GAME_*`, `DOCS_*`, etc.)
- **System Variables**: Use descriptive names (`WORKSPACE_*`, `TURBO_*`)

### 2. Environment Files

- **`.env.monorepo`**: Shared configuration (committed)
- **`.env`**: Workspace-specific overrides (committed)
- **`.env.local`**: Local development overrides (ignored)
- **`.env.*.local`**: Environment-specific local files (ignored)

### 3. Variable Precedence

```
CI/CD Variables
  ↓ (overrides)
Workspace .env
  ↓ (overrides)
.env.monorepo
  ↓ (defaults)
Code defaults
```

### 4. Security

- ❌ Never commit sensitive data to `.env` files
- ✅ Use CI/CD secret management for production
- ✅ Use `.env.local` for local development secrets
- ✅ Add `.env*.local` to `.gitignore`

## 🔧 Advanced Configuration

### Workspace-Specific Configuration

```bash
# In apps/game/.env
if [ "$WORKSPACE_PACKAGE" = "game" ]; then
  export GAME_SPECIFIC_VAR="game_value"
fi
```

### Conditional Loading

```bash
# In .env.monorepo
if [ "$NODE_ENV" = "development" ]; then
  export DEV_ONLY_VAR="development_value"
fi
```

### Environment-Specific Files

```bash
# .env.development
NODE_ENV=development
DEBUG=true

# .env.production
NODE_ENV=production
DEBUG=false
```

## 📊 Migration Guide

### From Previous Setup

1. **Backup existing files**:

   ```bash
   cp .env .env.backup
   cp apps/game/.env apps/game/.env.backup
   cp apps/docs/.env apps/docs/.env.backup
   ```

2. **Create new structure**:

   ```bash
   # Create .env.monorepo with shared variables
   # Update workspace .env files to load from .env.monorepo
   # Test each workspace
   ```

3. **Update CI/CD**:
   ```bash
   # Update pipeline variables to match new structure
   # Test pipeline execution
   ```

### Variable Mapping

| Old Variable  | New Variable    | Location         |
| ------------- | --------------- | ---------------- |
| `BASE_URL`    | `GAME_BASE_URL` | `.env.monorepo`  |
| `NODE_ENV`    | `NODE_ENV`      | `.env.monorepo`  |
| `APP_VERSION` | `APP_VERSION`   | `.env.monorepo`  |
| Game-specific | `GAME_*`        | `apps/game/.env` |
| Docs-specific | `DOCS_*`        | `apps/docs/.env` |

## ⚠️ Troubleshooting

### Variables Not Loading?

1. **Check file paths**: Ensure `.env.monorepo` is in root
2. **Verify sourcing**: Check that workspace `.env` sources `.env.monorepo`
3. **Restart shell**: Source the environment file or restart terminal
4. **Check permissions**: Ensure files are readable

### Workspace Detection Failed?

1. **Verify structure**: Ensure workspace has `package.json`
2. **Check paths**: Verify workspace detection logic
3. **Debug**: Add debug output to see detected workspace

### Turbo Cache Issues?

1. **Clear cache**: `rm -rf .turbo/cache`
2. **Check variables**: Ensure `TURBO_*` variables are set
3. **Verify config**: Check `turbo.json` environment configuration

## 🚀 Turbo Optimization

### Cache Configuration

```env
# Optimize Turbo caching
TURBO_CACHE_DIR=.turbo/cache
TURBO_CACHE_CONCURRENCY=10
TURBO_MEMORY_LIMIT=4096
```

### Pipeline Optimization

```env
# Optimize pipeline execution
TURBO_FORCE=false
TURBO_PREFETCH=true
TURBO_LOG_ORDER=grouped
```

### Remote Caching

```env
# Configure remote caching
TURBO_TEAM=your-team
TURBO_TOKEN=your-token
TURBO_REMOTE_ONLY=false
```

## 📚 Reference

### Key Files

- **`.env.monorepo`**: Shared monorepo configuration
- **`.env`**: Root environment file
- **`apps/game/.env`**: Game app environment
- **`apps/docs/.env`**: Docs app environment
- **`MONOREPO_ENVIRONMENT_GUIDE.md`**: This guide

### External Resources

- [Turborepo Environment Variables](https://turbo.build/repo/docs/environment-variables)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Dotenv Documentation](https://github.com/motdotla/dotenv)

## 🎉 Summary

### What Changed

✅ **Consolidated Configuration**: All shared variables in `.env.monorepo`
✅ **Workspace Awareness**: Automatic workspace detection
✅ **No Duplication**: Eliminated duplicate variables
✅ **Easy Overrides**: Workspace-specific files for overrides
✅ **Turbo Optimized**: Works seamlessly with Turborepo

### Benefits

1. **Single Source of Truth**: Shared configuration in one place
2. **Easier Management**: Add/remove variables once
3. **Better Organization**: Clear separation of concerns
4. **Scalable**: Easy to add new workspaces
5. **Maintainable**: Comprehensive documentation

### Migration Status

**Status**: ✅ **COMPLETED**
**Date**: 2024-01-11
**Impact**: High (Improves monorepo maintainability)
**Risk**: Low (Fully backward compatible)

---

**Next Steps**:

1. Review the new monorepo environment structure
2. Test each workspace configuration
3. Update CI/CD pipelines
4. Consider adding workspace-specific .env.local files

**Documentation**: See this guide for complete details on monorepo environment optimization.
