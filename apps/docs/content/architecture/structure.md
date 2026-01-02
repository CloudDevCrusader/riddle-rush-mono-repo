---
title: Project Structure
description: Overview of the Riddle Rush project structure
---

# Project Structure

Overview of the Riddle Rush project structure.

## Directory Layout

```
riddle-rush-nuxt-pwa/
├── components/          # Vue components (auto-imported)
│   ├── Base/          # Base components (Button, Modal, etc.)
│   └── *.vue          # Feature components
├── composables/        # Vue composables (auto-imported)
├── layouts/           # Nuxt layouts
├── pages/             # Nuxt pages (file-based routing)
│   └── docs/          # Documentation pages
├── stores/            # Pinia stores
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and constants
├── locales/           # i18n translation files
├── public/            # Static assets (images, icons, data)
├── content/           # Nuxt Content (documentation)
│   └── docs/          # Documentation markdown files
├── tests/
│   ├── unit/          # Vitest unit tests
│   ├── e2e/           # Playwright E2E tests
│   └── utils/         # Test utilities
├── scripts/           # Deployment and CI scripts
├── infrastructure/    # Terraform infrastructure
└── docs/              # Original documentation (source)
```

## Key Files

- `nuxt.config.ts` - Nuxt configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `playwright.config.ts` - E2E test configuration
- `vitest.config.ts` - Unit test configuration

