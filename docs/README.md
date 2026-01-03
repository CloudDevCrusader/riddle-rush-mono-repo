# Documentation

This directory contains all documentation-related files for Riddle Rush.

## Structure

```
docs/
├── content/          # Markdown documentation files (Nuxt Content)
│   ├── intro.md
│   ├── design/
│   ├── architecture/
│   ├── development/
│   └── infrastructure/
├── components/       # Documentation-specific components
├── assets/           # Documentation assets (images, etc.)
└── layouts/         # Documentation layouts (if needed)

# Note: Documentation pages are in pages/docs/ (at project root)
# This is because Nuxt requires pages/ to be at the root level
```

## Key Points

- **Content**: All markdown files are in `docs/content/`
- **Pages**: Documentation pages are in `pages/docs/` (at project root)
- **Components**: Doc-specific components can go in `docs/components/`
- **Assets**: Doc images/assets go in `docs/assets/`

## Adding Documentation

1. Create markdown file in `docs/content/`
2. Add frontmatter:
   ```markdown
   ---
   title: Page Title
   description: Page description
   ---
   ```
3. File structure = URL structure
   - `docs/content/design/colors.md` → `/docs/design/colors`

## Development

```bash
# Start dev server (includes docs)
pnpm run dev

# Visit: http://localhost:3000/docs
```

## Building

Documentation is included when running:

```bash
pnpm run generate
```

## Features

- **Nuxt Content** - Markdown-based content management
- **Auto-routing** - Routes generated from file structure
- **Syntax highlighting** - Code blocks with themes
- **Table of contents** - Auto-generated from headings
- **Component support** - Use Vue components in markdown
