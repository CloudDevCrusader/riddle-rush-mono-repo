# Build Issues & Solutions

## Current Issues

### 1. Game App - i18n Path

**Error:** Looking for `i18n/locales/de.json` but config says `langDir: 'locales'`

**Possible causes:**

- Cached i18n config in `.nuxt/`
- i18n module auto-prepending `i18n/` prefix

**Solutions:**

- Clear `.nuxt` cache: `rm -rf apps/game/.nuxt`
- Run `pnpm run postinstall` to regenerate types
- Verify `langDir: 'locales'` in nuxt.config.ts

### 2. Docs App - better-sqlite3

**Error:** Native module bindings not found

**Solutions:**

- For static generation, configure Content to use `driver: 'fs'` only
- In CI, better-sqlite3 will be built automatically
- For local dev, may need: `pnpm rebuild better-sqlite3`

## CI/CD Status

### GitLab CI

- ✅ Scripts updated for monorepo
- ✅ Paths corrected
- ✅ Artifacts configured

### Build Process

- Game: `cd apps/game && pnpm run generate`
- Docs: `cd apps/docs && pnpm run generate`

### Deployment

- Docs → GitLab Pages (public/)
- Game → AWS (apps/game/.output/public/)
