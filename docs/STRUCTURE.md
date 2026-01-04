# Documentation Structure

All documentation is now organized in the `docs/` folder for clean separation and easy generation.

## Directory Structure

```
docs/
├── content/              # Markdown documentation files (Nuxt Content)
│   ├── intro.md
│   ├── design/
│   │   ├── overview.md
│   │   └── color-palette.md
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── structure.md
│   │   └── state-management.md
│   ├── development/
│   │   └── getting-started.md
│   └── infrastructure/
│       ├── overview.md
│       └── terraform.md
│
├── pages/                # Documentation pages (Vue components)
│   ├── index.vue        # Docs home page
│   └── [...slug].vue    # Dynamic route for all docs
│
├── components/           # Documentation-specific Vue components
├── assets/              # Documentation assets (images, etc.)
├── layouts/             # Documentation layouts (if needed)
│
└── README.md            # This file

# Legacy documentation files (original docs/)
├── DESIGN.md            # Original design docs
├── WORKFLOW.md          # Original workflow docs
├── TESTING.md           # Original testing docs
└── ...                  # Other original documentation
```

## How It Works

1. **Content Files** (`docs/content/`) - Markdown files with frontmatter
2. **Pages** (`docs/pages/`) - Vue components that render the content
3. **Nuxt Content** - Automatically generates routes from file structure
4. **URL Mapping** - `docs/content/design/colors.md` → `/docs/design/colors`

## Adding New Documentation

1. Create markdown file in `docs/content/`:

   ```bash
   docs/content/guides/new-feature.md
   ```

2. Add frontmatter:

   ```markdown
   ---
   title: New Feature Guide
   description: How to use the new feature
   ---
   ```

3. Access at: `/docs/guides/new-feature`

## Benefits

- ✅ **Clean separation** - All docs in one folder
- ✅ **Easy to maintain** - Clear structure
- ✅ **Auto-routing** - No manual route configuration
- ✅ **Component support** - Use Vue components in markdown
- ✅ **Syntax highlighting** - Code blocks with themes
- ✅ **Table of contents** - Auto-generated from headings
