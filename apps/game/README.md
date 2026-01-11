# Riddle Rush Game App

Riddle Rush is the main Nuxt 4 PWA for the game experience. This guide consolidates
local development, Android build notes, plugin references, and PWA icon setup.

## Quick Start

From the monorepo root:

```bash
pnpm install
pnpm dev
```

The game runs at `http://localhost:3000`.

## Development Scripts

From the monorepo root:

```bash
pnpm dev            # Game app (Nuxt dev server)
pnpm dev:docs       # Docs app
pnpm build          # Game app build
pnpm test           # Game app tests
```

From `apps/game`:

```bash
pnpm dev
pnpm dev:debug
pnpm dev:https
pnpm dev:mobile
pnpm dev:mobile-https
pnpm build
pnpm preview
```

## Testing

Unit tests:

```bash
pnpm test:unit
pnpm test:unit:coverage
```

E2E tests:

```bash
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:simple
```

## Mobile Device Testing

1. Run `pnpm dev:mobile` (or `pnpm dev:mobile-https` for PWA install testing).
2. Open `http://<your-ip>:3000` on the device.
3. Use HTTPS for service worker and install prompts.

## Android (Capacitor)

Prereqs: Android Studio with SDK + Build Tools and a JDK (bundled with Android Studio).

First-time setup:

```bash
cd apps/game
pnpm build
npx cap add android
```

Common scripts (from monorepo root):

```bash
pnpm android:sync
pnpm android:open
pnpm android:run
```

Live reload during development:

```bash
pnpm dev
npx cap run android -l --external
```

## Nuxt Plugins

Plugins live in `apps/game/plugins` and load alphabetically.

- `error-sync.client.ts`: global error handling and sync
- `gitlab-feature-flags.client.ts`: Unleash proxy flags
- `gtag.client.ts`: Google Analytics integration
- `i18n-init.client.ts`: restore saved locale on load
- `storyboard.client.ts`: workflow tracking and dev overlay

Storyboard details: `docs/STORYBOARD-PLUGIN.md`

## PWA Icons

Source template: `apps/game/public/pwa-icon-template.svg`

Generate icons with ImageMagick:

```bash
convert pwa-icon-template.svg -resize 192x192 pwa-192x192.png
convert pwa-icon-template.svg -resize 512x512 pwa-512x512.png
```

Or with the PWA asset generator:

```bash
npx pwa-asset-generator pwa-icon-template.svg ./public
```

## Related Docs

- `docs/DEVELOPMENT.md`
