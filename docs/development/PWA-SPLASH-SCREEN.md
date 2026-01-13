# PWA Splash Screen Configuration

## Overview

This document explains how the splash screen works in the Riddle Rush PWA and how to configure it for different platforms.

## How It Works

### Custom Splash Screen (Web)

We implement a **custom splash screen** for better control and branding:

**Location:** `apps/game/components/SplashScreen.vue`

**Features:**

- 🎨 Custom design with logo and loading animation
- ⚡ 2.5 second loading simulation
- 🎯 Smooth fade-in/fade-out transitions
- 📱 Responsive for all screen sizes

**Assets:**

```
apps/game/public/assets/splash/
├── background.png     # Background image
├── LOGO.png          # Main logo
├── LOADING_.png      # "Loading" text
├── loading-down.png  # Progress bar background
└── loading-top.png   # Progress bar fill
```

### Native Splash Screen (Mobile)

For **installed PWAs** on mobile devices, the browser uses PWA manifest icons:

**Configured in:** `apps/game/nuxt.config.ts`

```typescript
pwa: {
  manifest: {
    name: 'Riddle Rush',
    theme_color: '#ff6b35',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}
```

## Platform-Specific Configuration

### iOS (Safari/Installed PWA)

**Meta Tags:**

```html
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

**Icons:**

```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="apple-touch-startup-image" href="/pwa-512x512.png" />
```

**Required Assets:**

- `apple-touch-icon.png` (180×180) - Home screen icon
- `pwa-512x512.png` (512×512) - Splash screen background

**iOS Behavior:**

1. User adds to home screen
2. iOS shows native splash with icon + `background_color`
3. App loads and shows custom splash screen
4. Custom splash fades out after 2.5s

### Android (Chrome/Installed PWA)

**Manifest:**

```json
{
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#ff6b35",
  "background_color": "#ffffff"
}
```

**Android Behavior:**

1. User installs PWA
2. Android shows splash with icon + `background_color`
3. App loads and shows custom splash screen
4. Custom splash fades out after 2.5s

### Desktop (Chrome/Edge/Firefox)

**Desktop Behavior:**

- PWAs show custom splash immediately
- No native splash screen
- Faster loading times

## Troubleshooting

### Splash Screen Not Showing

**Problem:** App loads without splash screen

**Possible Causes:**

1. **E2E Test Mode Detected**

```typescript
// apps/game/app.vue
const isE2E = process.env.NODE_ENV === 'test' || window.playwrightTest
const showSplash = ref(!isE2E) // Disabled in E2E
```

**Solution:** Splash is intentionally disabled during E2E tests for performance.

2. **Base URL Misconfiguration**

```typescript
// apps/game/components/SplashScreen.vue
const baseUrl = computed(() => {
  const url = config.public.baseUrl || ''
  return url && !url.endsWith('/') ? `${url}/` : url
})
```

**Solution:** Ensure `BASE_URL` environment variable ends with `/` or is empty.

3. **Missing Assets**

**Check assets exist:**

```bash
ls apps/game/public/assets/splash/
# Should show: background.png, LOGO.png, LOADING_.png, loading-down.png, loading-top.png
```

**Solution:** Ensure all splash assets are present and properly named.

4. **Service Worker Cache**

**Problem:** Old version cached by service worker

**Solution:** Clear cache and hard reload

```javascript
// In DevTools Console
caches.keys().then((keys) => {
  keys.forEach((key) => caches.delete(key))
  window.location.reload(true)
})
```

### Splash Screen Shows But Assets Don't Load

**Symptoms:**

- Blank white screen for 2.5 seconds
- Images don't appear
- Only percentage counter visible

**Debugging:**

1. **Check Network Tab** (DevTools)
   - Look for 404 errors on splash assets
   - Verify correct path: `/assets/splash/LOGO.png`

2. **Check Base URL**

```javascript
// In DevTools Console
console.log(window.__NUXT__.config.public.baseUrl)
// Should be empty or have trailing slash
```

3. **Verify Asset Paths**

```bash
# In production build
ls dist/assets/splash/
# Should contain all splash images
```

**Solution:** Ensure `baseUrl` is correctly configured in environment variables.

### Splash Screen Shows Twice

**Problem:** See splash screen, then white flash, then content

**Cause:** Using `v-show` instead of `v-if` causes content to render but be hidden.

**Solution:** Already fixed in `app.vue`:

```vue
<Transition name="splash-fade" mode="out-in">
  <SplashScreen v-if="showSplash" @complete="onSplashComplete" />
  <div v-else class="main-content">
    <!-- App content -->
  </div>
</Transition>
```

## Configuration Options

### Adjust Splash Duration

**Default:** 2.5 seconds

**Change duration:**

```typescript
// apps/game/components/SplashScreen.vue
const simulateLoading = () => {
  const duration = 3000 // Change to desired duration (ms)
  const intervalTime = 20
  // ...
}
```

### Disable Splash Screen

**For Development:**

```bash
# Set environment variable
DISABLE_SPLASH=true pnpm run dev
```

**In Code:**

```typescript
// apps/game/app.vue
const showSplash = ref(false) // Always disabled
```

### Custom Loading Logic

Replace simulated loading with real progress:

```typescript
const simulateLoading = () => {
  // Track actual resource loading
  const resourceCount = performance.getEntriesByType('resource').length
  progress.value = (resourceCount / expectedResources) * 100

  if (progress.value >= 100) {
    visible.value = false
    emit('complete')
  }
}
```

## Testing Splash Screen

### Local Development

```bash
pnpm run dev
# Open http://localhost:3000
# Splash should show for 2.5s
```

### Production Build

```bash
pnpm run build
pnpm run preview
# Open http://localhost:4173
```

### Mobile Testing

**iOS Simulator:**

```bash
# Using Capacitor
cd apps/mobile
pnpm run ios
```

**Android Emulator:**

```bash
# Using Capacitor
cd apps/mobile
pnpm run android
```

**Real Device:**

1. Deploy to test environment
2. Add to home screen
3. Launch from home screen icon
4. Should see native splash → custom splash → app

## Performance Considerations

### Optimize Splash Assets

Current asset sizes:

- `background.png`: 591 KB ❌ **Too large**
- `LOGO.png`: 138 KB
- `LOADING_.png`: 1.9 KB ✅
- `loading-down.png`: 1.8 KB ✅
- `loading-top.png`: 1 KB ✅

**Optimization:**

```bash
# Install optimization tools
pnpm add -D @squoosh/cli

# Optimize images
pnpm squoosh-cli --webp auto apps/game/public/assets/splash/*.png
```

**Target sizes:**

- Background: < 100 KB (use WebP, reduce quality)
- Logo: < 50 KB (use WebP or SVG)

### Preload Critical Assets

```typescript
// apps/game/app.vue
useHead({
  link: [
    { rel: 'preload', href: '/assets/splash/background.png', as: 'image' },
    { rel: 'preload', href: '/assets/splash/LOGO.png', as: 'image' },
  ],
})
```

### Lazy Load Non-Critical

Defer loading of main app until splash completes:

```typescript
// apps/game/components/SplashScreen.vue
const onSplashComplete = () => {
  showSplash.value = false
  // Now safe to load heavy resources
  gameStore.loadFromDB()
  settingsStore.loadSettings()
}
```

## Best Practices

### ✅ Do

- Keep splash duration short (2-3 seconds)
- Optimize splash assets (WebP, compression)
- Show loading progress
- Use smooth transitions
- Test on real devices
- Disable in E2E tests
- Match brand colors

### ❌ Don't

- Show splash for too long (> 3 seconds)
- Use large unoptimized images
- Block app initialization
- Show multiple splash screens
- Use splash in development (optional)
- Forget to handle errors

## Related Files

```
apps/game/
├── app.vue                          # Splash screen integration
├── components/SplashScreen.vue      # Splash screen component
├── nuxt.config.ts                   # PWA manifest config
└── public/
    ├── assets/splash/               # Splash assets
    ├── pwa-*.png                    # PWA icons
    └── apple-touch-icon.png         # iOS home screen icon
```

## References

- [PWA Splash Screens (web.dev)](https://web.dev/add-manifest/)
- [iOS Web App Meta Tags](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Android Splash Screens](https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/#splash-screens)

---

**Last Updated:** January 2026
