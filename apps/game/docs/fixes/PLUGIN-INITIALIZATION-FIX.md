# Plugin Initialization Fix

## Issue

`Uncaught ReferenceError: Cannot access 'NuxtPluginIndicator' before initialization`

This error occurred when trying to run the Nuxt dev server due to circular dependencies in the i18n plugin loading order.

## Root Cause

The `@nuxtjs/i18n` module was generating several SSR plugins that were incompatible with the client-only SPA configuration (`ssr: false`):

1. `route-locale-detect.js` - Browser locale detection plugin
2. `switch-locale-path-ssr.js` - SSR locale path switching
3. `ssg-detect.js` - SSG environment detection

These plugins were trying to use `defineNuxtPlugin` before the Nuxt plugin system was fully initialized, causing a circular dependency error.

## Solution

Applied a multi-layered fix:

### 1. Disabled Browser Language Detection in i18n Config

```typescript
i18n: {
  detectBrowserLanguage: false, // We handle this manually in i18n-init.client.ts
}
```

### 2. Added Early Initialization Plugin

Created `plugins/00.init-plugin-system.client.ts` that runs first to ensure the plugin system is initialized before any i18n plugins load.

### 3. Filter Problematic Plugins at App Resolution

Added a hook in `nuxt.config.ts` that filters out the SSR-specific i18n plugins:

```typescript
hooks: {
  'app:resolve': (app: any) => {
    app.plugins = app.plugins.filter((plugin: any) => {
      const src = typeof plugin === 'string' ? plugin : (plugin.src || plugin)
      // Filter out: route-locale-detect, switch-locale-path-ssr, ssg-detect, etc.
    })
  }
}
```

### 4. Custom Locale Detection

The app already has custom locale detection in `plugins/i18n-init.client.ts` which:

- Checks URL query parameters (`?lang=en`)
- Falls back to stored settings
- Falls back to browser language
- Falls back to default locale (de)

## Verification

- ✅ Dev server starts without errors
- ✅ App loads correctly in browser
- ✅ i18n functionality works (custom locale detection)
- ✅ TypeScript validation passes
- ✅ ESLint validation passes

## Files Changed

- `apps/game/nuxt.config.ts` - Added plugin filtering and disabled browser detection
- `apps/game/plugins/00.init-plugin-system.client.ts` - New early initialization plugin
- `apps/game/plugins/fix-plugin-order.client.ts` - Removed (obsolete)

## Impact

No functional impact - the app continues to work exactly as before. The problematic i18n plugins were redundant since we have custom locale detection.

## Related Documentation

- [Nuxt i18n Module Docs](https://i18n.nuxtjs.org/)
- [Nuxt Plugin System](https://nuxt.com/docs/guide/directory-structure/plugins)
- [apps/game/plugins/i18n-init.client.ts](../plugins/i18n-init.client.ts) - Custom locale detection implementation
