# Monorepo Migration Summary

✅ **Migration Complete!** The project has been reorganized into a monorepo structure.

## New Structure

```
riddle-rush-monorepo/
├── apps/
│   ├── game/              # Main game application
│   │   ├── components/
│   │   ├── composables/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── public/
│   │   ├── assets/
│   │   ├── tests/
│   │   └── nuxt.config.ts
│   └── docs/              # Documentation site
│       ├── content/
│       ├── pages/
│       └── nuxt.config.ts
├── packages/
│   ├── shared/            # Shared utilities
│   │   └── src/
│   │       ├── constants.ts
│   │       └── utils.ts
│   ├── types/             # Shared types
│   │   └── src/
│   │       └── game.ts
│   └── config/            # Shared configs
├── infrastructure/        # Terraform (unchanged)
├── scripts/               # Root scripts (unchanged)
└── docs/                  # Legacy docs (unchanged)
```

## What Changed

### Moved to `apps/game/`:
- All game application code
- Components, composables, layouts, stores
- Pages (except docs)
- Public assets
- Tests
- Nuxt config

### Moved to `apps/docs/`:
- Documentation content (`docs/content/`)
- Documentation pages (`pages/docs/`)

### Created `packages/`:
- `shared/` - Utilities and constants
- `types/` - TypeScript types
- `config/` - Shared configurations

## Next Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Update Imports
Replace imports in `apps/game/`:
- `~/utils/constants` → `@riddle-rush/shared/constants`
- `~/types/game` → `@riddle-rush/types/game`

### 3. Test
```bash
# Test game
pnpm dev

# Test docs
pnpm dev:docs
```

### 4. Update CI/CD
Update `.gitlab-ci.yml` to:
- Build from `apps/game/`
- Build docs from `apps/docs/`

## Benefits

✅ **Clear separation** - Each app has its own space  
✅ **Shared code** - Reuse types and utils  
✅ **Independent builds** - Build apps separately  
✅ **Better organization** - Easier to navigate  
✅ **Scalable** - Easy to add new apps/packages  

## Commands

```bash
# Development
pnpm dev              # Game app
pnpm dev:docs         # Docs app

# Building
pnpm build            # Game app
pnpm build:docs       # Docs app
pnpm -r build         # All apps

# Testing
pnpm test             # Game tests
pnpm typecheck        # All type checks
pnpm lint             # All linting
```

## Workspace Packages

Use in code:
```typescript
import { DB_NAME } from '@riddle-rush/shared/constants'
import type { GameSession } from '@riddle-rush/types/game'
```

Add dependencies:
```bash
pnpm --filter game add <package>
pnpm --filter docs add <package>
pnpm --filter shared add <package>
```

