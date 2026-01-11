# Monorepo Migration Plan

This document outlines the migration to a monorepo structure.

## Migration Steps

### Phase 1: Structure Setup ✅

- [x] Create monorepo structure (apps/, packages/)
- [x] Set up pnpm workspace
- [x] Create package.json files for each workspace

### Phase 2: Move Game App

- [ ] Move game files to `apps/game/`
  - [ ] components/
  - [ ] composables/
  - [ ] layouts/
  - [ ] pages/ (except docs)
  - [ ] stores/
  - [ ] types/ → move to packages/types/
  - [ ] utils/ → move to packages/shared/
  - [ ] locales/
  - [ ] public/
  - [ ] nuxt.config.ts
  - [ ] tsconfig.json
  - [ ] vite.config.ts (if exists)
  - [ ] vitest.config.ts
  - [ ] playwright.config.ts

### Phase 3: Move Docs App

- [ ] Move docs files to `apps/docs/`
  - [ ] docs/content/ → apps/docs/content/
  - [ ] pages/docs/ → apps/docs/pages/
  - [ ] Create nuxt.config.ts for docs
  - [ ] Create tsconfig.json for docs

### Phase 4: Create Shared Packages

- [ ] packages/shared/
  - [ ] Move utils/constants.ts
  - [ ] Move common utilities
- [ ] packages/types/
  - [ ] Move types/game.ts
  - [ ] Move other type definitions
- [ ] packages/config/
  - [ ] ESLint config
  - [ ] Prettier config
  - [ ] TypeScript configs

### Phase 5: Update Imports

- [ ] Update all imports to use workspace packages
  - [ ] `@riddle-rush/shared`
  - [ ] `@riddle-rush/types`
- [ ] Update Nuxt configs
- [ ] Update test configs

### Phase 6: Update CI/CD

- [ ] Update .gitlab-ci.yml for monorepo
- [ ] Update build scripts
- [ ] Update deployment scripts

### Phase 7: Cleanup

- [ ] Remove old files from root
- [ ] Update documentation
- [ ] Test everything

## Commands to Run

```bash
# After migration
pnpm install

# Test game
pnpm dev

# Test docs
pnpm dev:docs

# Build all
pnpm -r build
```
