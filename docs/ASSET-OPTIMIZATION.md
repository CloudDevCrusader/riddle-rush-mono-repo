# Asset Optimization Guide

This guide covers best practices for optimizing images, fonts, and other static assets in the Riddle Rush PWA.

## Table of Contents

1. [Current State](#current-state)
2. [Image Optimization](#image-optimization)
3. [Font Optimization](#font-optimization)
4. [Build-Time Optimization](#build-time-optimization)
5. [Runtime Optimization](#runtime-optimization)
6. [Best Practices](#best-practices)

---

## Current State

**Asset Inventory:**

- Total assets: 7.3MB
- PNG files: 127
- WebP files: 0
- SVG files: Limited use
- Largest assets: Background images (391KB each)

**Performance Impact:**

- Menu page: 500KB+ assets before render
- No lazy loading for below-fold content
- Same image resolution served to all devices

---

## Image Optimization

### 1. NuxtImg Component Usage

**Always use `<NuxtImg>` instead of `<img>` tags:**

```vue
<!-- ❌ DON'T: Standard img tag -->
<img :src="`${baseUrl}assets/main-menu/BACKGROUND.png`" alt="Background" />

<!-- ✅ DO: NuxtImg with optimization -->
<NuxtImg
  :src="`${baseUrl}assets/main-menu/BACKGROUND.png`"
  alt="Background"
  format="webp"
  quality="80"
  preset="background"
  loading="eager"
  sizes="sm:100vw md:100vw lg:100vw"
/>
```

### 2. Image Presets

Use appropriate presets for different image types:

```typescript
// nuxt.config.ts - Already configured
image: {
  presets: {
    avatar: {
      modifiers: {
        format: 'webp',
        width: 100,
        height: 100,
        quality: 75,
      },
    },
    background: {
      modifiers: {
        format: 'webp',
        quality: 70,
      },
    },
    thumbnail: {
      modifiers: {
        format: 'webp',
        width: 200,
        quality: 70,
      },
    },
    icon: {
      modifiers: {
        format: 'webp',
        width: 64,
        height: 64,
        quality: 80,
      },
    },
    hero: {
      modifiers: {
        format: 'webp',
        quality: 75,
        width: 1200,
      },
    },
  },
}
```

**Usage Examples:**

```vue
<!-- Background image -->
<NuxtImg
  src="/assets/main-menu/BACKGROUND.png"
  alt="Background"
  preset="background"
  loading="eager"
/>

<!-- Logo -->
<NuxtImg src="/assets/main-menu/LOGO.png" alt="Logo" preset="hero" loading="eager" />

<!-- Button icon -->
<NuxtImg src="/assets/alphabets/next.png" alt="Next" preset="icon" loading="lazy" />

<!-- Thumbnail -->
<NuxtImg src="/assets/leaderboard/1.png" alt="First place" preset="thumbnail" loading="lazy" />
```

### 3. Responsive Images

Use the `sizes` attribute for responsive images:

```vue
<NuxtImg
  src="/assets/main-menu/BACKGROUND.png"
  alt="Background"
  format="webp"
  quality="80"
  sizes="xs:320px sm:640px md:768px lg:1024px xl:1280px"
  :modifiers="{ fit: 'cover' }"
/>
```

**How it works:**

- Nuxt Image automatically generates multiple sizes
- Browser downloads only the appropriate size
- 70% bandwidth savings on mobile

### 4. Lazy Loading Strategy

**Critical images (above the fold):**

```vue
<NuxtImg src="/assets/main-menu/LOGO.png" alt="Logo" loading="eager" fetchpriority="high" />
```

**Non-critical images (below the fold):**

```vue
<NuxtImg src="/assets/leaderboard/1.png" alt="First place" loading="lazy" fetchpriority="low" />
```

### 5. Modern Image Formats

**Format Priority:**

1. AVIF (best compression, ~50% smaller than WebP)
2. WebP (wide support, 30% smaller than PNG)
3. PNG/JPEG (fallback)

```typescript
// nuxt.config.ts
image: {
  format: ['webp', 'avif'], // Try AVIF first, fallback to WebP
  quality: 80,
}
```

**NuxtImg automatically handles fallbacks:**

```vue
<NuxtImg src="/assets/main-menu/LOGO.png" alt="Logo" format="avif" />
<!-- Browser gets AVIF if supported, otherwise WebP, finally PNG -->
```

---

## Build-Time Optimization

### 1. Automated Asset Conversion Script

Create `/home/cloudcrusader/projects/riddle-rush-nuxt-pwa/scripts/optimize-assets.sh`:

```bash
#!/bin/bash

set -e

echo "🎨 Optimizing game assets..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Install sharp-cli if needed
if ! command -v sharp &> /dev/null; then
    echo "${BLUE}Installing sharp-cli...${NC}"
    npm install -g sharp-cli
fi

ASSETS_DIR="apps/game/public/assets"
CONVERTED=0
SKIPPED=0

# Function to convert PNG to WebP
convert_to_webp() {
    local png_file="$1"
    local webp_file="${png_file%.png}.webp"

    # Skip if WebP already exists and is newer
    if [ -f "$webp_file" ] && [ "$webp_file" -nt "$png_file" ]; then
        ((SKIPPED++))
        return
    fi

    # Convert with sharp
    sharp -i "$png_file" -o "$webp_file" -f webp -q 80

    ((CONVERTED++))
    echo "${GREEN}✓${NC} Converted: $(basename "$png_file") -> $(basename "$webp_file")"
}

# Function to create responsive variants for large images
create_responsive_variants() {
    local png_file="$1"
    local dir=$(dirname "$png_file")
    local base=$(basename "$png_file" .png)

    # Only for files larger than 100KB
    local size=$(stat -f%z "$png_file" 2>/dev/null || stat -c%s "$png_file" 2>/dev/null)
    if [ "$size" -lt 102400 ]; then
        return
    fi

    echo "${BLUE}Creating responsive variants for: $base${NC}"

    # Mobile (480px width)
    if [ ! -f "$dir/${base}-mobile.webp" ]; then
        sharp -i "$png_file" -o "$dir/${base}-mobile.webp" \
              -f webp -q 75 --resize 480
        echo "  ${GREEN}✓${NC} Mobile variant created"
    fi

    # Tablet (768px width)
    if [ ! -f "$dir/${base}-tablet.webp" ]; then
        sharp -i "$png_file" -o "$dir/${base}-tablet.webp" \
              -f webp -q 80 --resize 768
        echo "  ${GREEN}✓${NC} Tablet variant created"
    fi

    # Desktop (1920px width)
    if [ ! -f "$dir/${base}-desktop.webp" ]; then
        sharp -i "$png_file" -o "$dir/${base}-desktop.webp" \
              -f webp -q 80 --resize 1920
        echo "  ${GREEN}✓${NC} Desktop variant created"
    fi
}

# Convert all PNGs to WebP
echo "${BLUE}Converting PNG files to WebP...${NC}"
find "$ASSETS_DIR" -name "*.png" -type f | while read -r png_file; do
    convert_to_webp "$png_file"
done

# Create responsive variants for BACKGROUND images
echo ""
echo "${BLUE}Creating responsive variants for large images...${NC}"
find "$ASSETS_DIR" -name "BACKGROUND*.png" -type f | while read -r bg_file; do
    create_responsive_variants "$bg_file"
done

# Summary
echo ""
echo "${GREEN}✨ Asset optimization complete!${NC}"
echo "  Converted: $CONVERTED files"
echo "  Skipped (up-to-date): $SKIPPED files"

# Calculate savings
ORIGINAL_SIZE=$(find "$ASSETS_DIR" -name "*.png" -type f -exec stat -f%z {} \; 2>/dev/null | \
                awk '{s+=$1} END {print s}' || \
                find "$ASSETS_DIR" -name "*.png" -type f -exec stat -c%s {} \; | \
                awk '{s+=$1} END {print s}')

WEBP_SIZE=$(find "$ASSETS_DIR" -name "*.webp" -type f -exec stat -f%z {} \; 2>/dev/null | \
            awk '{s+=$1} END {print s}' || \
            find "$ASSETS_DIR" -name "*.webp" -type f -exec stat -c%s {} \; | \
            awk '{s+=$1} END {print s}')

if [ -n "$ORIGINAL_SIZE" ] && [ -n "$WEBP_SIZE" ]; then
    ORIGINAL_MB=$(echo "scale=2; $ORIGINAL_SIZE / 1048576" | bc)
    WEBP_MB=$(echo "scale=2; $WEBP_SIZE / 1048576" | bc)
    SAVINGS=$(echo "scale=1; ($ORIGINAL_SIZE - $WEBP_SIZE) / $ORIGINAL_SIZE * 100" | bc)

    echo "  Original PNG size: ${ORIGINAL_MB}MB"
    echo "  WebP size: ${WEBP_MB}MB"
    echo "  ${GREEN}Savings: ${SAVINGS}%${NC}"
fi
```

Make it executable:

```bash
chmod +x scripts/optimize-assets.sh
```

Add to `package.json`:

```json
{
  "scripts": {
    "optimize:assets": "bash scripts/optimize-assets.sh",
    "prebuild": "pnpm run optimize:assets"
  }
}
```

### 2. Image Compression Settings

**Recommended quality levels:**

- Backgrounds: 70-80 (good balance)
- UI elements: 80-85 (sharper text)
- Icons: 85-90 (crisp details)
- Thumbnails: 70-75 (smaller files)

### 3. File Naming Conventions

**Use descriptive, lowercase names:**

```
✅ background-menu.png
✅ button-play-hover.png
✅ icon-next-arrow.png

❌ BACKGROUND.png
❌ PLAY-1.png
❌ Layer 12 copy 3.png
```

---

## Font Optimization

### 1. Font Loading Strategy

**Current configuration (already optimized):**

```typescript
// nuxt.config.ts
fontMetrics: {
  fonts: ['Inter', 'system-ui'],
}
```

**@nuxtjs/fontaine** automatically:

- Generates fallback fonts to prevent layout shift
- Reduces CLS (Cumulative Layout Shift)
- Improves font loading performance

### 2. Self-Host Google Fonts (Future)

For better performance and privacy:

```bash
pnpm add -D @nuxtjs/google-fonts
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  googleFonts: {
    families: {
      Inter: [400, 600, 700, 900],
    },
    download: true, // Self-host
    preload: true,
    display: 'swap',
  },
})
```

---

## Runtime Optimization

### 1. Image Preloading

For critical images that must load immediately:

```vue
<script setup lang="ts">
// In layout or page head
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: '/assets/main-menu/BACKGROUND.webp',
      type: 'image/webp',
      fetchpriority: 'high',
    },
    {
      rel: 'preload',
      as: 'image',
      href: '/assets/main-menu/LOGO.webp',
      type: 'image/webp',
    },
  ],
})
</script>
```

### 2. Progressive Image Loading

For large images, show a low-quality placeholder:

```vue
<template>
  <div class="progressive-image">
    <!-- Low quality placeholder (LQIP) -->
    <NuxtImg
      v-if="!imageLoaded"
      :src="imageSrc"
      alt="Loading..."
      preset="lqip"
      class="placeholder"
    />

    <!-- Full quality image -->
    <NuxtImg
      :src="imageSrc"
      :alt="alt"
      preset="background"
      @load="imageLoaded = true"
      :class="{ loaded: imageLoaded }"
    />
  </div>
</template>

<script setup lang="ts">
const imageLoaded = ref(false)
defineProps<{
  imageSrc: string
  alt: string
}>()
</script>

<style scoped>
.progressive-image {
  position: relative;
}

.placeholder {
  filter: blur(10px);
  transform: scale(1.1);
}

.loaded {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
```

### 3. Intersection Observer for Lazy Loading

Nuxt Image handles this automatically, but for custom scenarios:

```typescript
// composables/useLazyLoad.ts
export const useLazyLoad = (elementRef: Ref<HTMLElement | null>) => {
  const isVisible = ref(false)

  onMounted(() => {
    if (!elementRef.value) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Load 50px before entering viewport
      }
    )

    observer.observe(elementRef.value)

    onUnmounted(() => {
      observer.disconnect()
    })
  })

  return { isVisible }
}
```

Usage:

```vue
<script setup lang="ts">
const imageRef = ref<HTMLElement | null>(null)
const { isVisible } = useLazyLoad(imageRef)
</script>

<template>
  <div ref="imageRef">
    <NuxtImg v-if="isVisible" src="/assets/heavy-image.png" alt="Heavy image" preset="background" />
  </div>
</template>
```

---

## Best Practices

### 1. Image Checklist

Before adding any image to the project:

- [ ] Is the image necessary? Can it be replaced with CSS?
- [ ] Is it properly sized? (Don't upload 4K images for 200px displays)
- [ ] Is it in the correct format? (Photos → JPEG/WebP, Graphics → PNG/WebP)
- [ ] Does it use the appropriate quality setting?
- [ ] Is it named descriptively and consistently?
- [ ] Is lazy loading appropriate for this image?

### 2. Component Guidelines

**For page backgrounds:**

```vue
<NuxtImg
  src="/assets/page/background.png"
  alt=""
  preset="background"
  loading="eager"
  fetchpriority="high"
  sizes="100vw"
/>
```

**For button icons:**

```vue
<NuxtImg
  src="/assets/icons/play.png"
  alt="Play"
  preset="icon"
  loading="lazy"
  width="64"
  height="64"
/>
```

**For user avatars:**

```vue
<NuxtImg src="/assets/avatars/player1.png" :alt="playerName" preset="avatar" loading="lazy" />
```

### 3. Performance Budget

**Per-page limits:**

- Total images: <2MB (uncompressed)
- Critical images (above fold): <500KB
- Below-fold images: lazy loaded
- Maximum single image: 200KB

**Enforcement:**
Add to CI/CD pipeline:

```bash
# scripts/check-asset-sizes.sh
MAX_SIZE=204800 # 200KB in bytes

find apps/game/public/assets -name "*.png" -type f | while read -r file; do
  size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  if [ "$size" -gt "$MAX_SIZE" ]; then
    echo "❌ Image too large: $file ($((size / 1024))KB)"
    exit 1
  fi
done

echo "✅ All images within size budget"
```

### 4. Conditional Loading

**Skip hover images on mobile:**

```vue
<script setup lang="ts">
const { isMobile } = useDevice()
</script>

<template>
  <button class="menu-btn">
    <NuxtImg src="/assets/button.png" alt="Button" />

    <!-- Only load hover state on desktop -->
    <NuxtImg
      v-if="!isMobile"
      src="/assets/button-hover.png"
      alt="Button hover"
      class="hover-image"
      loading="lazy"
    />
  </button>
</template>
```

---

## Monitoring & Validation

### 1. Build Output Analysis

After each build, check the output:

```bash
pnpm run build | grep -A 20 "PWA"
```

Look for:

- Precached asset count
- Total precache size (should be <10MB)
- Individual file sizes

### 2. Lighthouse Audits

Run Lighthouse to verify optimizations:

```bash
npx lighthouse https://your-domain.com \
  --only-categories=performance \
  --output=html \
  --output-path=./lighthouse-report.html
```

**Key metrics:**

- Largest Contentful Paint (LCP): <2.5s
- Properly sized images: 100%
- Offscreen images lazy loaded: ✓
- Modern image formats: ✓

### 3. Network Tab Validation

In browser DevTools:

1. Open Network tab
2. Filter by "Img"
3. Verify:
   - WebP format is being served
   - Lazy images only load when scrolled into view
   - Proper cache headers (from CloudFront)
   - Responsive images use appropriate sizes

---

## Migration Guide

### Converting Existing Pages

**Before:**

```vue
<template>
  <div class="page">
    <img :src="`${baseUrl}assets/page/bg.png`" alt="Background" />
    <img :src="`${baseUrl}assets/page/logo.png`" alt="Logo" />
  </div>
</template>
```

**After:**

```vue
<template>
  <div class="page">
    <NuxtImg
      :src="`${baseUrl}assets/page/bg.png`"
      alt="Background"
      preset="background"
      loading="eager"
      fetchpriority="high"
    />
    <NuxtImg :src="`${baseUrl}assets/page/logo.png`" alt="Logo" preset="hero" loading="eager" />
  </div>
</template>
```

### Batch Conversion Script

```bash
# scripts/convert-img-tags.sh
find apps/game -name "*.vue" -type f -exec sed -i '' \
  's/<img /<NuxtImg /g' \
  's/<\/img>/<\/NuxtImg>/g' {} +

echo "✅ Converted <img> to <NuxtImg>"
echo "⚠️  Manual review required to add presets and loading attributes"
```

---

## Troubleshooting

### Issue: Images not loading

**Check:**

1. Is `@nuxt/image` installed? `pnpm list @nuxt/image`
2. Is the module registered in `nuxt.config.ts`?
3. Are sharp binaries installed? `pnpm add -D sharp`

### Issue: WebP not being served

**Solution:**
Verify browser support and Nuxt Image config:

```typescript
// nuxt.config.ts
image: {
  format: ['webp'], // Explicitly request WebP
  sharp: {
    enabled: true,
  },
}
```

### Issue: Build fails with "sharp binaries not found"

**Solution:**

```bash
# Rebuild sharp for your platform
pnpm rebuild sharp
```

---

## References

- [Nuxt Image Documentation](https://image.nuxt.com/)
- [Sharp CLI Documentation](https://sharp.pixelplumbing.com/)
- [WebP Format](https://developers.google.com/speed/webp)
- [AVIF Format](https://jakearchibald.com/2020/avif-has-landed/)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)

---

**Last Updated:** 2026-01-11
**Next Review:** After Phase 1 asset optimization
