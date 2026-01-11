# Vite & Nuxt Plugins Guide

This document describes all the plugins and modules integrated into the Riddle Rush PWA application.

## Table of Contents

- [Core Modules](#core-modules)
- [Performance & Optimization](#performance--optimization)
- [Development Experience](#development-experience)
- [PWA & Mobile](#pwa--mobile)
- [Security](#security)
- [Usage Examples](#usage-examples)

---

## Core Modules

### @pinia/nuxt

**Purpose**: State management for Vue 3  
**Usage**: Automatically imported stores from `stores/` directory

```typescript
// stores/game.ts
export const useGameStore = defineStore('game', () => {
  const score = ref(0)
  return { score }
})

// In components
const gameStore = useGameStore()
```

### @nuxtjs/i18n

**Purpose**: Internationalization (i18n)  
**Configuration**:

- Default locale: `de` (German)
- Supported: `en` (English), `de` (German)
- Strategy: No prefix in URLs

```vue
<template>
  <p>{{ $t('welcome.message') }}</p>
</template>
```

### @vueuse/nuxt

**Purpose**: Collection of Vue composition utilities  
**Auto-imports**: All VueUse composables available globally

```typescript
// No imports needed!
const { x, y } = useMouse()
const isDark = useDark()
const { isSupported, coords } = useGeolocation()
```

### @nuxt/eslint

**Purpose**: ESLint integration with Nuxt-specific rules  
**Configuration**: Stylistic rules enabled in `nuxt.config.ts`

---

## Performance & Optimization

### @nuxtjs/fontaine

**Purpose**: Automatic font metric optimization to prevent layout shift  
**Benefits**:

- Reduces Cumulative Layout Shift (CLS)
- Generates fallback font metrics
- Zero configuration for web fonts

**Configuration**:

```typescript
fontMetrics: {
  fonts: ['Inter', 'system-ui'],
}
```

### Manual Chunks (Vite)

**Purpose**: Code splitting for better caching  
**Configuration**:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-vue': ['vue', 'pinia'],
        'vendor-vueuse': ['@vueuse/core', '@vueuse/motion'],
      },
    },
  },
}
```

**Benefits**:

- Smaller initial bundle
- Better browser caching
- Faster subsequent loads

---

## Development Experience

### @nuxtjs/color-mode

**Purpose**: Dark/light mode with auto-detection  
**Storage**: Persists preference in localStorage

```vue
<template>
  <div>
    <button @click="toggleColorMode">Current: {{ $colorMode.preference }}</button>
  </div>
</template>

<script setup>
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
```

**Configuration**:

```typescript
colorMode: {
  preference: 'light',
  fallback: 'light',
  classSuffix: '',
  storageKey: 'riddle-rush-color-mode',
}
```

### @nuxtjs/device

**Purpose**: Device detection and responsive utilities  
**Usage**: Access device information in components

```typescript
const { isMobile, isTablet, isDesktop } = useDevice()

if (isMobile) {
  // Mobile-specific logic
}
```

### Nuxt DevTools

**Purpose**: Visual debugging and inspection  
**Activation**: Press `Shift + Alt + D` in browser  
**Features**:

- Component inspector
- Route viewer
- State management visualization
- Performance metrics

---

## PWA & Mobile

### @vite-pwa/nuxt

**Purpose**: Progressive Web App functionality  
**Features**:

- Offline support
- App installation
- Push notifications (future)
- Background sync

**Configuration**:

```typescript
pwa: {
  registerType: 'autoUpdate',
  manifest: {
    name: 'Riddle Rush',
    short_name: 'RiddleRush',
    theme_color: '#ff6b35',
  },
  workbox: {
    navigateFallback: '/',
    globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
  },
}
```

### @vueuse/motion

**Purpose**: Animation library for smooth transitions  
**Usage**: Add animations to any element

```vue
<template>
  <!-- Predefined animation -->
  <div v-motion-pop-bottom>Animates on mount</div>

  <!-- Custom animation -->
  <div v-motion :initial="{ opacity: 0, y: 100 }" :enter="{ opacity: 1, y: 0 }">
    Custom animation
  </div>
</template>
```

**Built-in directive**: `v-motion-pop-bottom`

```typescript
motion: {
  directives: {
    'pop-bottom': {
      initial: { scale: 0, opacity: 0, y: 100 },
      visible: { scale: 1, opacity: 1, y: 0 },
    },
  },
}
```

---

## Security

### nuxt-security

**Purpose**: Security headers and Content Security Policy  
**Features**:

- CSP headers
- CORS configuration
- XSS protection
- Clickjacking prevention

**Configuration**:

```typescript
security: {
  headers: {
    crossOriginEmbedderPolicy: 'require-corp', // Production
    contentSecurityPolicy: {
      'base-uri': ["'self'"],
      'font-src': ["'self'", 'https:', 'data:'],
      'img-src': ["'self'", 'data:', 'blob:'],
      'script-src': ["'self'", 'https:', "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", 'https:', "'unsafe-inline'"],
    },
  },
}
```

**Note**: Relaxed in development for easier debugging

---

## Usage Examples

### Creating an Animated Component

```vue
<template>
  <div class="feature-card" v-motion-pop-bottom>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
```

### Using Device Detection

```vue
<template>
  <div :class="deviceClass">
    <component :is="layoutComponent" />
  </div>
</template>

<script setup lang="ts">
const { isMobile, isTablet } = useDevice()

const deviceClass = computed(() => ({
  'mobile-layout': isMobile,
  'tablet-layout': isTablet,
  'desktop-layout': !isMobile && !isTablet,
}))

const layoutComponent = computed(() => (isMobile ? 'MobileLayout' : 'DesktopLayout'))
</script>
```

### Color Mode Toggle

```vue
<template>
  <button
    @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'"
    class="color-mode-toggle"
  >
    <span v-if="$colorMode.value === 'dark'">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<style scoped>
.color-mode-toggle {
  /* Automatically gets .light or .dark class */
}

.dark .color-mode-toggle {
  background: #1a1a1a;
}
</style>
```

### VueUse Composables

```typescript
// Mouse tracking
const { x, y } = useMouse()

// Network status
const { isOnline } = useNetwork()

// Local storage with reactivity
const gameSettings = useLocalStorage('game-settings', {
  volume: 100,
  difficulty: 'medium',
})

// Clipboard
const { text, copy, copied, isSupported } = useClipboard()

// Window focus
const { focused } = useWindowFocus()
```

---

## Plugin Management

### Adding a New Plugin

1. Install the plugin:

```bash
pnpm add -D <plugin-name>
```

2. Add to `nuxt.config.ts` modules:

```typescript
modules: [
  // ... existing modules
  '<plugin-name>',
]
```

3. Configure (if needed):

```typescript
// Add plugin-specific configuration
pluginName: {
  // options
}
```

4. Document in this file!

### Removing a Plugin

1. Remove from `nuxt.config.ts` modules array
2. Remove configuration section
3. Uninstall: `pnpm remove <plugin-name>`
4. Update documentation

---

## Incompatible Plugins (Nuxt 4)

The following popular plugins are **not compatible** with Nuxt 4 as of January 2025:

### nuxt-lodash

**Issue**: Requires Nuxt ^3.0.0  
**Alternative**: Import lodash-es directly

```typescript
import { debounce, throttle } from 'lodash-es'
```

### nuxt-gtag

**Issue**: Requires Nuxt ^3  
**Alternative**: Use direct Google Analytics integration

```html
<!-- Add to app.vue or layout -->
<script setup>
  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${config.public.gtagId}`,
        async: true,
      },
    ],
  })
</script>
```

---

## Performance Tips

1. **Code Splitting**: Use dynamic imports for large components

```typescript
const HeavyComponent = defineAsyncComponent(() => import('~/components/HeavyComponent.vue'))
```

2. **Image Optimization**: Use `@nuxt/image` (already installed)

```vue
<NuxtImg src="/hero.jpg" width="800" height="600" />
```

3. **Lazy Loading**: Use VueUse's `useIntersectionObserver`

```typescript
const { stop } = useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    // Load content
    stop()
  }
})
```

4. **PWA Caching**: Configure Workbox for offline assets

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 3600,
        },
      },
    },
  ],
}
```

---

## Troubleshooting

### Plugin Not Loading

- Check Nuxt version compatibility
- Verify plugin is in `modules` array
- Check for TypeScript errors in config
- Clear `.nuxt` cache: `rm -rf .nuxt`

### Build Errors

- Run `pnpm install` to ensure dependencies are installed
- Check for peer dependency warnings
- Verify plugin versions are compatible

### Type Errors

- Regenerate types: `pnpm run prepare`
- Check `tsconfig.json` includes plugin types
- Restart TypeScript server in IDE

---

## Resources

- [Nuxt Modules](https://nuxt.com/modules)
- [VueUse Documentation](https://vueuse.org/)
- [Vite Plugin Hub](https://vitejs.dev/plugins/)
- [PWA Documentation](https://vite-pwa-org.netlify.app/)

---

**Last Updated**: January 2025  
**Nuxt Version**: 4.2.2  
**Vite Version**: 7.3.0
