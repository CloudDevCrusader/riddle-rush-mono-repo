# Bug Investigation: ASSET_DELETE_ARGS Unbound Variable

## Bug Summary

**Error:** `./scripts/aws-deploy.sh: line 267: ASSET_DELETE_ARGS[@]: unbound variable`
**Trigger:** Running `pnpm run deploy:dev` (or `./scripts/aws-deploy.sh development`)
**When it fails:** During the S3 upload phase, when `DELETE_OLD_ASSETS` is not set to `"true"` (the default)

## Root Cause Analysis

**File:** `scripts/aws-deploy.sh`
**Lines:** 262–275
**Bash version sensitivity:** macOS ships with **bash 3.2**, which has different behavior for empty array expansion under `set -u`

### The Problem

At line 30, the script uses:

```bash
set -euo pipefail
```

The `-u` flag makes any reference to an unset or empty variable (including empty arrays) an error.

At lines 262–264, an empty array is declared:

```bash
ASSET_DELETE_ARGS=()
if [[ "${DELETE_OLD_ASSETS}" = "true" ]]; then
    ASSET_DELETE_ARGS=(--delete)
fi
```

At line 267, the array is expanded:

```bash
aws s3 sync "${BUILD_DIR}" "s3://${S3_BUCKET}" \
    "${ASSET_DELETE_ARGS[@]}" \
```

**The issue:** On macOS's default **bash 3.2**, expanding an empty array with `"${ASSET_DELETE_ARGS[@]}"` under `set -u` raises:

```
ASSET_DELETE_ARGS[@]: unbound variable
```

In bash 4+ (Linux default), `"${empty_array[@]}"` expands to nothing without error. In bash 3.2 (macOS), the `-u` flag considers an empty array expansion to be unbound.

## Affected Components

- `scripts/aws-deploy.sh` — lines 262–275 (the S3 static asset upload block)
- This affects **all deployments on macOS** when `DELETE_OLD_ASSETS` is not set to `"true"` (the default)

## Proposed Solution

Use the bash idiom to safely expand an array that may be empty, compatible with both bash 3.2 and bash 4+:

**Option 1 (Preferred): Use `${ASSET_DELETE_ARGS[@]+"${ASSET_DELETE_ARGS[@]}"}` idiom**

```bash
aws s3 sync "${BUILD_DIR}" "s3://${S3_BUCKET}" \
    ${ASSET_DELETE_ARGS[@]+"${ASSET_DELETE_ARGS[@]}"} \
    --cache-control "public, max-age=31536000, immutable" \
    ...
```

This uses the `${var+value}` parameter expansion: if `ASSET_DELETE_ARGS` is set (even if empty), expand its contents; otherwise expand to nothing.

**Option 2: Use conditional inline**

```bash
aws s3 sync "${BUILD_DIR}" "s3://${S3_BUCKET}" \
    $([[ "${DELETE_OLD_ASSETS}" = "true" ]] && echo "--delete" || true) \
    ...
```

Less clean; not recommended.

**Option 3: Quote the array expansion differently**
Remove the array and use a single string variable:

```bash
ASSET_DELETE_FLAG=""
if [[ "${DELETE_OLD_ASSETS}" = "true" ]]; then
    ASSET_DELETE_FLAG="--delete"
fi
aws s3 sync "${BUILD_DIR}" "s3://${S3_BUCKET}" \
    ${ASSET_DELETE_FLAG} \
    ...
```

This works but loses the "proper array" approach and could break on values with spaces (not a concern here since `--delete` has no spaces).

### Recommendation

**Option 1** is the most idiomatic bash fix that works on both bash 3.2 (macOS) and bash 4+ (Linux). The `${var[@]+"${var[@]}"}` pattern is the standard cross-version solution for safely expanding potentially-empty arrays under `set -u`.

## Implementation Notes

Change only line 267 (the first `aws s3 sync` command in the static assets upload block):

**Before:**

```bash
	aws s3 sync "${BUILD_DIR}" "s3://${S3_BUCKET}" \
		"${ASSET_DELETE_ARGS[@]}" \
```

**After:**

```bash
	aws s3 sync "${BUILD_DIR}" "s3://${S3_BUCKET}" \
		${ASSET_DELETE_ARGS[@]+"${ASSET_DELETE_ARGS[@]}"} \
```

## Edge Cases

- When `DELETE_OLD_ASSETS=true`: Array has one element `--delete`, expansion works as before
- When `DELETE_OLD_ASSETS` is unset/false: Array is empty, expansion produces nothing safely
- No impact on subsequent `aws s3 sync` commands (they don't use `ASSET_DELETE_ARGS`)
- No impact on CI/Linux environments (bash 4+ handles this already, but the fix is harmless)
