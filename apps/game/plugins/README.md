# Game Plugins

This directory contains Nuxt plugins that extend the game application's functionality.

## Available Plugins

### 1. Error Sync (`error-sync.client.ts`)

Global error handling and synchronization plugin.

- Captures unhandled errors and promise rejections
- Integrates with Vue and Pinia error handlers
- Provides `$errorSync` for manual error logging
- Syncs errors periodically

**Usage:**

```typescript
const { $errorSync } = useNuxtApp()
await $errorSync.syncErrorLog('error', 'Something went wrong', error)
```

### 2. i18n Init (`i18n-init.client.ts`)

Initializes internationalization settings on client load.

- Loads saved locale from localStorage
- Sets up language preferences

### 3. Storyboard (`storyboard.client.ts`) ⭐ NEW

Workflow tracking and development tools plugin.

**Features:**

- Automatic route tracking
- Flow visualization
- Analytics and metrics
- Dev overlay (Ctrl/Cmd + Shift + S)
- Export/import flow data

**Quick Start:**

```typescript
// In any component
const { flow, getFlowCompletion } = useStoryboard()

console.log(`Current state: ${flow.value.currentState?.name}`)
console.log(`Flow ${getFlowCompletion()}% complete`)
```

**Documentation:** See `/docs/STORYBOARD-PLUGIN.md` for complete documentation.

## Plugin Loading Order

Plugins are automatically loaded by Nuxt in alphabetical order:

1. `error-sync.client.ts`
2. `i18n-init.client.ts`
3. `storyboard.client.ts`

## Creating New Plugins

To create a new plugin:

1. Create a `.ts` or `.client.ts` file in this directory
2. Export a default function using `defineNuxtPlugin`
3. Use `nuxtApp.provide()` to add global properties
4. Add TypeScript declarations for type safety

**Example:**

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const myFeature = {
    doSomething: () => console.log('Hello!'),
  }

  nuxtApp.provide('myFeature', myFeature)
})

// Type augmentation
declare module 'nuxt/app' {
  interface NuxtApp {
    $myFeature: typeof myFeature
  }
}
```

## Best Practices

1. **Client-only plugins**: Use `.client.ts` suffix for browser-only code
2. **Type safety**: Always add TypeScript declarations
3. **Performance**: Keep plugins lightweight
4. **Error handling**: Wrap plugin code in try-catch
5. **Documentation**: Document plugin APIs and usage

## More Information

- [Nuxt Plugin Documentation](https://nuxt.com/docs/guide/directory-structure/plugins)
- [Storyboard Plugin Guide](/docs/STORYBOARD-PLUGIN.md)
