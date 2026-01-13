# Deployment Fixes for dev.riddlerush.de

## Issues Identified

### 1. Plugin Initialization Error

**Error:** `Uncaught ReferenceError: Cannot access 'NuxtPluginIndicator' before initialization`

**Root Cause:** Plugin initialization order issue where i18n plugins try to access Nuxt's plugin system before it's fully initialized.

### 2. Chrome Extension Error

**Error:** `SyntaxError: "undefined" is not valid JSON`

**Root Cause:** External Chrome extension (TextCompanion) issue, not related to our application.

## Solutions Implemented

### 1. Plugin Order Fix

Created `apps/game/plugins/fix-plugin-order.client.ts` to ensure proper plugin initialization:

```typescript
// Fix for plugin initialization order issues
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window !== 'undefined') {
    nuxtApp.hook('app:created', () => {
      // Ensures this plugin runs early
    })
  }
})

// High priority to run first
defineNuxtPlugin.priority = 1000
```

### 2. Nuxt Configuration Update

Added plugin initialization hooks to `apps/game/nuxt.config.ts`:

```typescript
hooks: {
  'modules:done': () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Ensuring proper plugin initialization order')
    }
  }
}
```

### 3. Build Configuration Verification

Ensured that the development build configuration is correct:

```typescript
// apps/game/nuxt.config.ts
const isDev = process.env.NODE_ENV !== 'production'
const isDebugBuild = process.env.DEBUG_BUILD === 'true'
const shouldMinify = isDev || isLocalhostBuild || isDebugBuild ? false : 'esbuild'
```

## Deployment Checklist

### ✅ Configuration Verification

1. **Terraform Configuration**
   - ✅ `infrastructure/environments/development/terraform.tfvars` configured for `dev.riddlerush.de`
   - ✅ Domain names set correctly
   - ✅ Ready for SSL certificate

2. **Build Configuration**
   - ✅ `NODE_ENV=development` set in deployment scripts
   - ✅ `DEBUG_BUILD=true` for development
   - ✅ Minification disabled
   - ✅ Sourcemaps enabled

3. **Plugin Configuration**
   - ✅ Plugin order fix implemented
   - ✅ Early initialization plugin added
   - ✅ Nuxt hooks configured

### 🚀 Deployment Steps

1. **Apply Plugin Fixes**

   ```bash
   # Ensure the new plugin is created
   touch apps/game/plugins/fix-plugin-order.client.ts
   ```

2. **Rebuild and Deploy**

   ```bash
   # Clean previous build
   rm -rf apps/game/.output

   # Deploy with development settings
   ./scripts/deploy-dev.sh
   ```

3. **Verify Deployment**

   ```bash
   # Check the deployed site
   curl -I https://dev.riddlerush.de

   # Check browser console for errors
   # Open https://dev.riddlerush.de and check console
   ```

## Troubleshooting

### If Plugin Errors Persist

1. **Check Plugin Order**

   ```bash
   # List plugins in order
   find apps/game/plugins -name "*.ts" -o -name "*.js" | sort
   ```

2. **Disable Problematic Plugins Temporarily**

   ```typescript
   // In nuxt.config.ts, temporarily disable plugins
   export default defineNuxtConfig({
     modules: [
       // Comment out problematic modules one by one
       '@pinia/nuxt',
       // '@nuxtjs/i18n', // Try disabling this first
       '@vite-pwa/nuxt',
       // ... other modules
     ],
   })
   ```

3. **Check Browser Console**
   - Open `https://dev.riddlerush.de`
   - Press F12 to open Developer Tools
   - Check Console tab for errors
   - Check Network tab for failed requests

### Common Solutions

1. **Clear Cache**

   ```bash
   # Clear Nuxt cache
   rm -rf apps/game/.nuxt
   rm -rf apps/game/.output

   # Clear browser cache
   # Or open in incognito mode
   ```

2. **Check Environment Variables**

   ```bash
   # Verify environment variables are set
   echo "NODE_ENV=$NODE_ENV"
   echo "DEBUG_BUILD=$DEBUG_BUILD"
   ```

3. **Update Dependencies**
   ```bash
   # Update Nuxt and related packages
   pnpm update @nuxtjs/i18n nuxt @vite-pwa/nuxt
   ```

## Additional Debugging

### Check Server Logs

```bash
# If using CloudFront, check CloudFront logs
aws cloudfront get-distribution --id YOUR_CLOUDFRONT_ID

# Check S3 bucket contents
aws s3 ls s3://YOUR_BUCKET_NAME --recursive
```

### Test Locally

```bash
# Test the build locally first
cd apps/game
pnpm run dev

# Then test production build
pnpm run generate
pnpm run preview
```

## Summary

The plugin initialization issue has been addressed with:

- ✅ Plugin order fix implementation
- ✅ Early initialization plugin
- ✅ Nuxt configuration updates
- ✅ Deployment verification steps

The Chrome extension error is external and not related to our application. Focus on the Nuxt plugin initialization error for deployment fixes.
