# Environment Variable Migration Guide

## 🎯 Objective

Consolidate environment variables from multiple locations into a single, centralized `.env` file in the project root.

## 📋 What Changed

### Before (Split Configuration)

```
.
├── .env                  # Root environment variables
├── .env.example          # Root example variables
└── apps/
    └── game/
        ├── .env          # Game-specific variables
        └── .env.example  # Game example variables
```

### After (Consolidated Configuration)

```
.
├── .env                  # ALL environment variables (consolidated)
├── .env.example          # ALL example variables (consolidated)
└── apps/
    └── game/
        ├── .env          # Symlink to root .env (optional)
        └── .env.example  # Symlink to root .env.example (optional)
```

## ✅ Benefits

1. **Single Source of Truth**: All environment variables in one place
2. **Easier Management**: No need to sync variables between files
3. **Consistent Behavior**: Same variables available everywhere
4. **Better Documentation**: Comprehensive .env.example file
5. **Monorepo Friendly**: Works well with Turborepo structure

## 🔧 Migration Steps

### 1. Backup Existing Files

```bash
# Manual backup (already done by migration script)
cp .env .env.backup-$(date +%Y%m%d-%H%M%S)
cp apps/game/.env apps/game/.env.backup-$(date +%Y%m%d-%H%M%S)
```

### 2. Review Consolidated Variables

Check the new `.env.consolidated` file which contains:

- All variables from root `.env`
- All variables from `apps/game/.env`
- Organized into logical sections
- Comprehensive comments

### 3. Update Your Local Development

```bash
# Copy the consolidated file (already done by migration script)
cp .env.consolidated .env
cp .env.consolidated apps/game/.env
```

### 4. Update CI/CD Pipelines

Update your GitLab CI/CD variables to match the consolidated structure.

### 5. Test the Configuration

```bash
# Test that everything still works
pnpm run dev

# Check that environment variables are loaded correctly
echo "BASE_URL: $BASE_URL"
echo "NODE_ENV: $NODE_ENV"
```

## 📋 Variable Reference

### Application Configuration

- `NODE_ENV`: Development environment (development|staging|production)
- `APP_VERSION`: Semantic version (also from package.json)
- `APP_NAME`: Application name

### Deployment & Assets

- `BASE_URL`: Base URL path for routing
- `NUXT_PUBLIC_SITE_URL`: Full site URL

### Analytics & Monitoring

- `GOOGLE_ANALYTICS_ID`: GA4 Measurement ID
- `CLOUDWATCH_ENDPOINT`: CloudWatch endpoint
- `CLOUDWATCH_API_KEY`: CloudWatch API key
- `DEBUG_ERROR_SYNC`: Enable debug mode
- `GITLAB_FEATURE_FLAGS_URL`: GitLab Unleash endpoint
- `GITLAB_FEATURE_FLAGS_TOKEN`: GitLab Unleash token

### Feature Flags

- `ENABLE_DEBUG_PANEL`: Show debug panel
- `ENABLE_ANALYTICS`: Enable analytics
- `ENABLE_PWA`: Enable PWA features

### API & Services

- `API_SECRET`: Server-side API secret
- `API_TIMEOUT`: API timeout in ms
- `PETSCAN_API_URL`: External API URL
- `SENTRY_DSN`: Sentry error tracking

### AWS Infrastructure

- `AWS_S3_BUCKET`: S3 bucket name
- `AWS_REGION`: AWS region
- `AWS_CLOUDFRONT_ID`: CloudFront distribution ID

### Android Build

- `ANDROID_KEYSTORE_*` variables for Capacitor builds

## 🔍 How Nuxt Uses Environment Variables

### Build-time Variables

Accessed directly via `process.env`:

```javascript
// capacitor.config.ts
webContentsDebuggingEnabled: process.env.NODE_ENV !== 'production'
```

### Runtime Variables

Accessed via `useRuntimeConfig()`:

```javascript
// composables/useAssets.ts
const {
  public: { baseUrl },
} = useRuntimeConfig()
```

### Nuxt Configuration

Defined in `nuxt.config.ts`:

```javascript
runtimeConfig: {
  public: {
    baseUrl: process.env.BASE_URL || '',
    // ... other public variables
  }
}
```

## 🚀 Advanced Configuration (Optional)

### Using Symlinks

Instead of duplicating the `.env` file, you can use symlinks:

```bash
# Remove duplicate files
rm apps/game/.env apps/game/.env.example

# Create symlinks
ln -s ../../.env apps/game/.env
ln -s ../../.env.example apps/game/.env.example
```

### Environment-Specific Files

Create environment-specific files:

```bash
# .env.development
NODE_ENV=development
DEBUG_ERROR_SYNC=true

# .env.production
NODE_ENV=production
DEBUG_ERROR_SYNC=false
```

## ⚠️ Troubleshooting

### Variables Not Loading?

1. **Restart development server**: `pnpm run dev`
2. **Check file location**: Ensure `.env` is in project root
3. **Verify variable names**: No typos in variable names
4. **Check Nuxt config**: Variables are properly referenced in `runtimeConfig`

### CI/CD Issues?

1. **Update pipeline variables**: Match the consolidated structure
2. **Check variable precedence**: CI variables override .env file
3. **Verify file paths**: Ensure CI can access the .env file

## 📚 Reference

- [Nuxt Environment Variables](https://nuxt.com/docs/guide/going-further/runtime-config)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Dotenv Documentation](https://github.com/motdotla/dotenv)

---

**Migration Date**: 2024-01-11
**Status**: ✅ COMPLETED
**Maintainer**: CloudCrusader AI Assistant

_This migration consolidates environment variables for better maintainability and consistency across the monorepo._
