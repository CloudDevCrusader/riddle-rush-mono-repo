---
title: Getting Started
description: Quick start guide for developing Riddle Rush
---

# Getting Started

Quick start guide for developing Riddle Rush.

## Prerequisites

- Node.js 20+
- pnpm 10.26.2+
- Git

## Installation

```bash
# Clone the repository
git clone https://gitlab.com/djdiox/riddle-rush-nuxt-pwa.git
cd riddle-rush-nuxt-pwa

# Install dependencies
pnpm install

# Generate Nuxt types
pnpm run postinstall
```

## Development

```bash
# Start development server
pnpm run dev

# Server runs at http://localhost:3000
# Documentation at http://localhost:3000/docs
```

## Project Structure

- `pages/` - Application pages (file-based routing)
- `components/` - Vue components
- `composables/` - Reusable composition functions
- `stores/` - Pinia stores for state management
- `public/` - Static assets
- `content/docs/` - Documentation content

## Key Commands

```bash
pnpm run dev          # Development server
pnpm run build        # Production build
pnpm run generate     # Static site generation (includes docs)
pnpm run test         # Run tests once
pnpm run test:watch   # Watch tests
pnpm run typecheck    # Type checking
pnpm run lint         # Linting
```

## Next Steps

- [Development Patterns](/docs/development/patterns)
- [Composables Guide](/docs/development/composables)
- [Component Development](/docs/development/components)
