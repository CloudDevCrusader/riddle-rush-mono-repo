# Known Issues

## ~~TypeCheck - Vite Version Conflict~~ ✅ RESOLVED

**Status**: ✅ Fixed (2026-01-11)
**Priority**: ~~High~~ Resolved
**Discovered**: 2026-01-02

### Problem (RESOLVED)

~~The game app's `nuxt typecheck` command fails with Vite type conflicts~~

### Root Cause

The issue was caused by **pnpm version mismatch** across the monorepo:

- Root package.json used `pnpm@10.28.0`
- Apps/packages used `pnpm@10.26.2`
- CI configs used `pnpm@10.27.0`

This caused inconsistent dependency resolution and lockfile conflicts.

### Solution Applied

✅ Aligned all pnpm versions to `10.28.0`:

- Updated `apps/docs/package.json`
- Updated `apps/game/package.json`
- Updated `.gitlab-ci.yml`
- Updated `.circleci/config.yml`
- Ran `pnpm install --no-frozen-lockfile` to update lockfile

### Verification

```bash
pnpm run typecheck  # ✅ Passes
pnpm run test:unit  # ✅ Passes
pnpm run lint       # ✅ Passes (warnings only)
```

No pnpm overrides needed - the version alignment resolved the Vite conflicts automatically.

---

## ShellCheck Warnings in aws-deploy.sh

**Status**: Non-blocking warnings
**Priority**: Low
**Count**: ~47 warnings

### Issues

1. **SC2250**: Prefer braces around variable references (`${VAR}` vs `$VAR`)
2. **SC2292**: Prefer `[[ ]]` over `[ ]` for tests
3. **SC2312**: Consider invoking commands separately
4. **SC2069**: Redirect order (2>&1 must be last)
5. **SC2015**: `A && B || C` pattern warnings

### Impact

- Cursor IDE shows warnings
- No functional impact
- Shell script works correctly
- Best practices recommendations

### Solution

Apply shellcheck suggestions:

```bash
# Example fixes:
- if [ "$VAR" = "value" ]
+ if [[ "$VAR" = "value" ]]

- echo "Deploying to $S3_BUCKET"
+ echo "Deploying to ${S3_BUCKET}"

- export DIST_ID=$(aws cloudfront ...)
+ DIST_ID=$(aws cloudfront ...)
+ export DIST_ID
```

Can be addressed in a future cleanup PR.
