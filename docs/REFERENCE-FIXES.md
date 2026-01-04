# Reference Fixes Summary

## ✅ Completed

### 1. Created Shared Packages Content

- ✅ `packages/shared/src/constants.ts` - All game constants
- ✅ `packages/types/src/game.ts` - All TypeScript types
- ✅ Updated package.json exports

### 2. Updated Imports

- ✅ All `~/utils/constants` → `@riddle-rush/shared/constants`
- ✅ All `~/types/game` → `@riddle-rush/types/game`
- ✅ All `../utils/constants` → `@riddle-rush/shared/constants`
- ✅ All `../types/game` → `@riddle-rush/types/game`
- ✅ All `../../types/game` → `@riddle-rush/types/game`
- ✅ `~/utils/routes` → `@riddle-rush/shared/routes`

### 3. Updated Build Scripts

- ✅ `scripts/ci-build.sh` - Now builds from `apps/game/`
- ✅ `scripts/ci-test.sh` - Now tests from `apps/game/`
- ✅ `scripts/ci-e2e.sh` - Now runs E2E from `apps/game/`
- ✅ `scripts/deploy-with-terraform.sh` - Updated build path
- ✅ `aws-deploy.sh` - Updated BUILD_DIR to `apps/game/.output/public`

### 4. Updated CI/CD

- ✅ `.gitlab-ci.yml` build job - Updated artifact paths
- ✅ `.gitlab-ci.yml` build:docs - Updated to build from `apps/docs/`
- ✅ `.gitlab-ci.yml` deploy:aws - Updated artifact paths

### 5. Updated Nuxt Config

- ✅ Added alias for workspace packages
- ✅ Updated TypeScript paths

## ⚠️ Remaining Issues

1. **Double quotes in imports** - Some files may have `''` instead of `'`
2. **Test files** - May need path updates
3. **Component imports** - Check for any remaining `~/utils` or `~/types`

## Next Steps

1. Run `pnpm install` to set up workspaces
2. Test build: `pnpm build`
3. Test dev: `pnpm dev`
4. Fix any remaining import issues
5. Update any remaining scripts that reference old paths
