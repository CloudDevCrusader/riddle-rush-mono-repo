# Useful Nuxt Packages & Plugins

This document lists recommended packages and plugins that can enhance the project.

## Currently Installed

### Core Modules

- ✅ `@nuxtjs/i18n` - Internationalization
- ✅ `@pinia/nuxt` - State management
- ✅ `@vite-pwa/nuxt` - PWA support
- ✅ `@vueuse/nuxt` - Vue composition utilities
- ✅ `@nuxt/fonts` - Font optimization
- ✅ `@nuxt/image` - Image optimization
- ✅ `nuxt-gtag` - Google Analytics
- ✅ `nuxt-viewport` - Viewport utilities

## Recommended Additional Packages

### High Priority

#### 1. @nuxt/icon

**Purpose:** Access to 200,000+ icons with on-demand loading

```bash
pnpm add -D @nuxt/icon
```

**Benefits:**

- No manual SVG management
- Tree-shakeable (only loads used icons)
- Automatic optimization
- Access to major icon sets (Material, Font Awesome, etc.)

**Usage:**

```vue
<Icon name="mdi:home" />
<Icon name="heroicons:user" />
```

#### 2. @nuxt/scripts

**Purpose:** Optimize third-party script loading

```bash
pnpm add -D @nuxt/scripts
```

**Benefits:**

- Non-blocking script execution
- Better performance scores
- Optimized Google Analytics loading
- Script prioritization

**Usage:**

```typescript
// In nuxt.config.ts
scripts: {
  config: {
    gtag: {
      id: process.env.GOOGLE_ANALYTICS_ID
    }
  }
}
```

#### 3. @nuxtjs/seo

**Purpose:** Enhanced SEO and meta tag management

```bash
pnpm add -D @nuxtjs/seo
```

**Benefits:**

- Automatic Open Graph tags
- Twitter Card support
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt management

### Medium Priority

#### 4. @nuxt/content

**Purpose:** Markdown-based content management

```bash
pnpm add -D @nuxt/content
```

**Benefits:**

- Markdown support
- Content querying
- Syntax highlighting
- Search functionality
- **Use case:** Documentation, blog, game rules

#### 5. @nuxtjs/color-mode

**Purpose:** Dark/light mode support

```bash
pnpm add -D @nuxtjs/color-mode
```

**Benefits:**

- System preference detection
- Manual toggle
- Persistent user choice
- CSS variables integration

#### 6. @vueuse/motion

**Purpose:** Animations and motion

```bash
pnpm add -D @vueuse/motion
```

**Benefits:**

- Smooth animations
- Scroll-triggered animations
- Gesture support
- Performance optimized

#### 7. @nuxtjs/tailwindcss

**Purpose:** Utility-first CSS framework

```bash
pnpm add -D @nuxtjs/tailwindcss tailwindcss
```

**Benefits:**

- Rapid UI development
- Consistent design system
- Purge unused CSS
- **Note:** May conflict with existing SCSS, use carefully

### Developer Experience

#### 8. @nuxt/devtools

**Purpose:** Development tools and debugging

```bash
pnpm add -D @nuxt/devtools
```

**Benefits:**

- Component inspector
- Performance profiling
- State inspection
- Network monitoring
- **Note:** Already available in Nuxt 4, just enable it

#### 9. @nuxtjs/supabase

**Purpose:** Supabase integration (if needed for backend)

```bash
pnpm add -D @nuxtjs/supabase
```

**Benefits:**

- Authentication
- Database
- Real-time subscriptions
- Storage
- **Use case:** If you need backend features later

#### 10. nuxt-simple-sitemap

**Purpose:** Automatic sitemap generation

```bash
pnpm add -D nuxt-simple-sitemap
```

**Benefits:**

- Auto-generated sitemap
- Dynamic routes support
- SEO improvement

### Performance & Monitoring

#### 11. @nuxtjs/web-vitals

**Purpose:** Web Vitals monitoring

```bash
pnpm add -D @nuxtjs/web-vitals
```

**Benefits:**

- Core Web Vitals tracking
- Performance monitoring
- Real user metrics
- Integration with analytics

#### 12. @nuxtjs/sentry

**Purpose:** Error tracking and monitoring

```bash
pnpm add -D @nuxtjs/sentry
```

**Benefits:**

- Error tracking
- Performance monitoring
- Release tracking
- User feedback

### Testing & Quality

#### 13. @nuxt/test-utils

**Status:** ✅ Already installed
**Purpose:** Testing utilities for Nuxt

#### 14. @nuxtjs/eslint-module

**Status:** ✅ Already installed as @nuxt/eslint
**Purpose:** ESLint integration

### Utilities

#### 15. zod

**Purpose:** TypeScript-first schema validation

```bash
pnpm add zod
```

**Benefits:**

- Runtime type validation
- Form validation
- API validation
- Type inference

#### 16. date-fns

**Purpose:** Date utility library

```bash
pnpm add date-fns
```

**Benefits:**

- Lightweight date operations
- Tree-shakeable
- Immutable
- TypeScript support

#### 17. ky

**Purpose:** HTTP client

```bash
pnpm add ky
```

**Benefits:**

- Modern fetch wrapper
- Automatic retries
- Timeout handling
- Request/response interceptors

## Installation Script

Create a script to install recommended packages:

```bash
# Install high priority packages
pnpm add -D @nuxt/icon @nuxt/scripts @nuxtjs/seo

# Install medium priority (optional)
pnpm add -D @nuxtjs/color-mode @vueuse/motion nuxt-simple-sitemap

# Install utilities
pnpm add zod date-fns ky
```

## Configuration Examples

### @nuxt/icon

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/icon'],
  icon: {
    // Optional: configure icon sets
    provider: 'iconify',
  },
})
```

### @nuxt/scripts

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/scripts'],
  scripts: {
    config: {
      gtag: {
        id: process.env.GOOGLE_ANALYTICS_ID,
      },
    },
  },
})
```

### @nuxtjs/seo

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: {
    url: 'https://your-domain.com',
    name: 'Riddle Rush',
    description: 'The Ultimate Guessing Game',
  },
})
```

## Priority Recommendations

### Immediate (This Week)

1. **@nuxt/icon** - Replace custom SVG icons
2. **@nuxt/scripts** - Optimize Google Analytics

### Short Term (This Month)

3. **@nuxtjs/seo** - Enhanced SEO
4. **@nuxtjs/color-mode** - Dark mode support
5. **zod** - Form validation

### Long Term (As Needed)

6. **@nuxt/content** - If adding documentation
7. **@nuxtjs/supabase** - If adding backend features
8. **@nuxtjs/sentry** - Production error tracking

## Resources

- [Nuxt Modules](https://nuxt.com/modules)
- [VueUse](https://vueuse.org/)
- [Iconify](https://iconify.design/)

---

**Last Updated:** 2026-01-02  
**Status:** Recommendations Ready
