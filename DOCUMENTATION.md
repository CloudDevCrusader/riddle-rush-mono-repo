# Documentation Site

The documentation is now generated using **Nuxt Content** - a native Nuxt module for markdown-based content.

## Benefits

- ✅ **Single tech stack** - All Nuxt, no separate framework
- ✅ **Component reuse** - Can use Vue components in docs
- ✅ **Integrated** - Part of the same build system
- ✅ **Markdown-based** - Easy to write and maintain
- ✅ **Auto-routing** - Routes generated from file structure

## Structure

```
content/docs/          # Documentation markdown files
pages/docs/           # Documentation pages (routing)
  ├── index.vue       # Docs home page
  └── [...slug].vue   # Dynamic route for all docs
```

## Development

```bash
# Start dev server (includes docs)
pnpm run dev

# Visit: http://localhost:3000/docs
```

## Building

```bash
# Generate static site (includes docs)
pnpm run generate

# Docs will be at: .output/public/docs/
```

## Deployment

GitLab CI automatically:
1. Builds the site with `pnpm run generate`
2. Deploys to GitLab Pages
3. Available at: `https://djdiox.gitlab.io/riddle-rush-nuxt-pwa/docs`

## Adding Documentation

1. Create markdown file in `content/docs/`
2. Add frontmatter:
   ```markdown
   ---
   title: Page Title
   description: Page description
   ---
   ```
3. File structure = URL structure
   - `content/docs/design/colors.md` → `/docs/design/colors`

## Features

- **Syntax highlighting** - Code blocks with themes
- **Table of contents** - Auto-generated from headings
- **Search** - Can add search functionality
- **Components** - Use Vue components in markdown
- **Custom styling** - Full control with CSS

