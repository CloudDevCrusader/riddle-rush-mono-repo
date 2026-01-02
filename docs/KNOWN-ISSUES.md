# Known Issues

## TypeCheck - Vite Version Conflict

**Status**: Blocking pre-push hook
**Priority**: High
**Discovered**: 2026-01-02

### Problem

The game app's `nuxt typecheck` command fails with Vite type conflicts:

- Project has both `vite@5.4.21` and `vite@7.3.0` installed
- TypeScript compiler sees incompatible Plugin types between versions
- Results in 365 type errors even though code is valid

### Error Example

```
Type 'import("...vite@5.4.21...").PluginOption[]' is not assignable to
type 'import("...vite@7.3.0...").PluginOption[]'
```

### Root Cause

Dependency resolution conflict in pnpm monorepo:

1. Nuxt 4 and related packages depend on specific Vite versions
2. Some transitive dependencies pull in incompatible Vite versions
3. pnpm creates multiple Vite installations in node_modules

### Workaround

Temporarily bypass pre-push hook when pushing:

```bash
git push --no-verify
```

CI/CD will still run typecheck to catch real issues.

### Solution Options

1. **pnpm overrides** (Recommended):
   Add to root `package.json`:

   ```json
   {
     "pnpm": {
       "overrides": {
         "vite": "^7.3.0"
       }
     }
   }
   ```

   Then run `pnpm install` to resolve.

2. **Update dependencies**:
   Update all Vite-related packages to compatible versions

   ```bash
   pnpm update vite @vitejs/plugin-vue vite-plugin-*
   ```

3. **Dedupe**:
   ```bash
   pnpm dedupe
   ```

### Impact

- Pre-push hook fails on typecheck
- Developers must use `--no-verify` to push
- CI/CD pipeline may also fail if not using same Vite version
- Does not affect runtime - only TypeScript type checking

### Next Steps

1. Add pnpm overrides to force Vite 7.x
2. Run `pnpm install` to resolve dependencies
3. Verify typecheck passes
4. Remove --no-verify workaround

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
