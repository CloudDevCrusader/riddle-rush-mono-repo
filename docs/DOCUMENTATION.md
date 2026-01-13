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
apps/docs/content/    # Documentation markdown files
apps/docs/pages/      # Documentation pages (routing)
  ├── index.vue       # Docs home page
  └── [...slug].vue   # Dynamic route for all docs
```

## Development

```bash
# Start dev server (includes docs)
pnpm run dev

# Visit: http://localhost:3000/
```

## Building

```bash
# Generate static site (includes docs)
pnpm run generate

# Docs will be at: .output/public/
```

## Deployment

Docs are hosted at: `https://docs.riddlerush.de`

### Local deployment (AWS S3 + CloudFront)

```bash
# Required env vars
export DOCS_S3_BUCKET=your-docs-bucket
# Optional (for cache invalidation)
export DOCS_CLOUDFRONT_ID=your-cloudfront-id

./scripts/deploy-docs.sh
```

Terraform stack for the docs site: `infrastructure/environments/docs`.

### CI deployment (GitLab Pages)

GitLab CI can still build docs for Pages:

1. Builds the site with `pnpm run generate`
2. Deploys to GitLab Pages (if enabled)

## Adding Documentation

1. Create markdown file in `apps/docs/content/`
2. Add frontmatter:
   ```markdown
   ---
   title: Page Title
   description: Page description
   ---
   ```
3. File structure = URL structure
   - `apps/docs/content/design/colors.md` → `/design/colors`

## Features

- **Syntax highlighting** - Code blocks with themes
- **Table of contents** - Auto-generated from headings
- **Search** - Can add search functionality
- **Components** - Use Vue components in markdown
- **Custom styling** - Full control with CSS
