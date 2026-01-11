# Documentation Guidelines for AI Agents

This guide explains how AI agents should create, update, and organize documentation in this repository.

---

## 📋 Table of Contents

- [Documentation Structure](#documentation-structure)
- [When to Create Documentation](#when-to-create-documentation)
- [Where to Place Documentation](#where-to-place-documentation)
- [Documentation Standards](#documentation-standards)
- [Examples](#examples)
- [Checklist](#checklist)

---

## Documentation Structure

### Root Level Files (3 files only)

```
├── README.md      - Project overview (ALL users)
├── AGENTS.md      - Agent workflow guide (AI agents)
└── CLAUDE.md      - Claude Code quick reference
```

**DO NOT add new .md files to root!** Use `docs/` instead.

### docs/ Directory Structure

```
docs/
├── README.md           - Documentation index
├── *.md               - Main documentation files
├── setup/             - Setup and configuration guides
├── deployment/        - Deployment documentation
├── development/       - Development-specific docs (future)
└── archive/           - Historical/completed documents
```

---

## When to Create Documentation

### ✅ Always Document

1. **New Features**
   - Create guide in `docs/`
   - Update relevant existing docs
   - Add to `docs/README.md` index

2. **Configuration Changes**
   - Update `docs/PLUGINS.md` for plugin changes
   - Update `docs/setup/` for environment changes
   - Document in code comments too

3. **Workflow Changes**
   - Update `AGENTS.md` for workflow changes
   - Update `CLAUDE.md` if affecting Claude Code users
   - Add examples showing new workflow

4. **API Changes**
   - Document in code (JSDoc/TSDoc)
   - Create/update guide in `docs/`
   - Update type definitions

5. **Deployment Changes**
   - Update `docs/deployment/` guides
   - Update scripts documentation
   - Update CI/CD documentation

### ❌ Don't Create Separate Docs For

1. **Minor bug fixes** - Commit message is enough
2. **Code refactoring** - Unless pattern changes
3. **Dependency updates** - Unless breaking changes
4. **Formatting changes** - Not needed
5. **Test additions** - Unless new testing strategy

---

## Where to Place Documentation

### Decision Tree

```
Is it a summary/report of completed work?
├─ YES → docs/archive/DESCRIPTION.md
└─ NO ↓

Is it setup/configuration related?
├─ YES → docs/setup/TOPIC.md
└─ NO ↓

Is it deployment related?
├─ YES → docs/deployment/TOPIC.md
└─ NO ↓

Is it a user-facing guide?
├─ YES → docs/TOPIC.md
└─ NO ↓

Is it workflow/process related?
├─ Agent workflow → Update AGENTS.md
├─ Claude Code → Update CLAUDE.md
└─ General → Update README.md
```

### Specific Locations

| Documentation Type        | Location                  | Example                     |
| ------------------------- | ------------------------- | --------------------------- |
| **Project Overview**      | README.md                 | Features, quick start       |
| **Agent Workflow**        | AGENTS.md                 | Commit guidelines, workflow |
| **Claude Code Reference** | CLAUDE.md                 | Commands, deployment        |
| **Plugin Configuration**  | docs/PLUGINS.md           | Plugin setup, usage         |
| **Feature Guide**         | docs/FEATURE-NAME.md      | How to use feature          |
| **Setup Guide**           | docs/setup/TOPIC.md       | Environment, tools          |
| **Deployment Guide**      | docs/deployment/METHOD.md | AWS, Docker, GitLab         |
| **Completed Summary**     | docs/archive/SUMMARY.md   | Historical record           |
| **Testing Guide**         | docs/TESTING-GUIDE.md     | Test strategy               |
| **Code Comments**         | In source files           | JSDoc, inline comments      |

---

## Documentation Standards

### File Naming Conventions

```bash
# Good
docs/FEATURE-FLAGS.md              # Clear, specific
docs/setup/TERRAFORM-SETUP.md      # Topic-based
docs/deployment/AWS-DEPLOYMENT.md  # Method-based
docs/archive/PLUGIN-MIGRATION-SUMMARY.md  # Descriptive

# Bad
docs/stuff.md                      # Vague
docs/doc1.md                       # Generic
docs/temp.md                       # Temporary name
docs/MY-NOTES.md                   # Personal, not project
```

**Rules:**

- UPPERCASE-WITH-HYPHENS.md
- Descriptive, not generic
- Include context in name
- No abbreviations unless common

### Document Structure

Every documentation file should have:

```markdown
# Title

Brief description (1-2 sentences)

## Table of Contents (if > 200 lines)

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content...

### Subsection

Content...

## Examples (always include)

Practical examples...

## Troubleshooting (if applicable)

Common issues and solutions...

---

**Last Updated:** YYYY-MM-DD
**Status:** Active | Deprecated | Archived
```

### Writing Style

**DO:**

- ✅ Use clear, concise language
- ✅ Include code examples
- ✅ Add inline comments to code
- ✅ Use tables for comparisons
- ✅ Add troubleshooting sections
- ✅ Include "Last Updated" date
- ✅ Link to related docs
- ✅ Use emojis sparingly for visual cues
- ✅ Include command examples with output

**DON'T:**

- ❌ Write long paragraphs (break them up)
- ❌ Assume knowledge (explain clearly)
- ❌ Skip examples
- ❌ Leave dead links
- ❌ Use personal pronouns (I, we, you)
- ❌ Include passwords or secrets
- ❌ Use jargon without explanation
- ❌ Write generic content

### Code Examples

````markdown
# Good - Complete example with context

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# → Server starts at http://localhost:3000
```
````

# Bad - No context or expected output

```bash
pnpm install
pnpm run dev
```

````

### Cross-References

Always link to related documentation:

```markdown
See [Agent Workflow Guide](../AGENTS.md) for complete workflow.
For setup, check [Environment Setup](setup/MONOREPO_ENVIRONMENT_GUIDE.md).
Related: [Testing Guide](TESTING-GUIDE.md), [Deployment](deployment/AWS-DEPLOYMENT.md)
````

---

## Examples

### Example 1: Adding New Feature Documentation

**Scenario:** Added color mode toggle feature

```bash
# 1. Create feature guide
docs/COLOR-MODE.md

# 2. Update plugin documentation
docs/PLUGINS.md (add @nuxtjs/color-mode section)

# 3. Update main docs index
docs/README.md (add link under "Development")

# 4. Update changelog (if exists)
CHANGELOG.md

# 5. Commit
git add docs/COLOR-MODE.md docs/PLUGINS.md docs/README.md
git commit -m "docs: add color mode feature guide"
```

### Example 2: Workflow Change

**Scenario:** Changed commit frequency requirement

```bash
# 1. Update agent workflow
AGENTS.md (update "Commit Frequency" section)

# 2. Update Claude Code guide
CLAUDE.md (update workflow summary)

# 3. Update git hooks if needed
.husky/pre-commit

# 4. Commit
git add AGENTS.md CLAUDE.md .husky/pre-commit
git commit -m "docs: update commit frequency guidelines"
```

### Example 3: Deployment Update

**Scenario:** Added new AWS deployment step

```bash
# 1. Update deployment guide
docs/deployment/AWS-DEPLOYMENT.md

# 2. Update scripts documentation
scripts/deploy-prod.sh (add comments)

# 3. Update main README if major change
README.md (update Deployment section)

# 4. Commit
git add docs/deployment/AWS-DEPLOYMENT.md scripts/deploy-prod.sh README.md
git commit -m "docs: add CloudFront invalidation step to AWS deployment"
```

### Example 4: Archiving Completed Work

**Scenario:** Completed plugin migration, need to document

```bash
# 1. Create summary in archive
docs/archive/PLUGIN-MIGRATION-SUMMARY.md

# 2. Update current plugin docs
docs/PLUGINS.md (remove old, add new)

# 3. Don't update root README (not relevant anymore)

# 4. Commit
git add docs/archive/PLUGIN-MIGRATION-SUMMARY.md docs/PLUGINS.md
git commit -m "docs: archive plugin migration summary"
```

---

## Workflow Integration

### After Making Code Changes

```bash
# 1. Make code changes
# Edit: composables/useColorMode.ts

# 2. Run quality checks
pnpm run workspace:check

# 3. Determine if documentation needed
# New feature? → YES, document it
# Bug fix? → NO, commit message is enough
# Config change? → YES, update docs

# 4. Create/update documentation
# Create: docs/COLOR-MODE.md
# Update: docs/PLUGINS.md

# 5. Run format
pnpm run format

# 6. Commit code + docs together
git add composables/useColorMode.ts docs/COLOR-MODE.md docs/PLUGINS.md
git commit -m "feat: add color mode toggle

- Add useColorMode composable
- Create documentation guide
- Update plugin configuration docs"

# 7. Push
git push
```

### Documentation-Only Changes

```bash
# 1. Update documentation
# Edit: docs/TESTING-GUIDE.md

# 2. Format
pnpm run format

# 3. Commit (use 'docs:' type)
git add docs/TESTING-GUIDE.md
git commit -m "docs: add unit test examples to testing guide"

# 4. Push
git push
```

---

## Checklist

### Before Creating New Documentation

- [ ] Check if similar doc already exists
- [ ] Determine correct location (docs/, docs/setup/, etc.)
- [ ] Review naming conventions
- [ ] Plan structure (headings, sections)

### While Writing

- [ ] Use clear, concise language
- [ ] Include practical examples
- [ ] Add code blocks with comments
- [ ] Include troubleshooting section (if applicable)
- [ ] Add cross-references to related docs
- [ ] Add "Last Updated" date
- [ ] Use consistent formatting

### After Writing

- [ ] Run `pnpm run format` (formats markdown too)
- [ ] Check all links work
- [ ] Verify code examples are correct
- [ ] Update `docs/README.md` index
- [ ] Update related documentation
- [ ] Commit with `docs:` prefix

### Updating Existing Documentation

- [ ] Update "Last Updated" date
- [ ] Check if structure still makes sense
- [ ] Update code examples if outdated
- [ ] Fix broken links
- [ ] Remove outdated information
- [ ] Add new sections if needed
- [ ] Keep existing style consistent

---

## Special Cases

### API Documentation

For composables, stores, and utilities:

````typescript
/**
 * Color mode composable
 *
 * Provides color mode (dark/light) functionality with persistence.
 *
 * @example
 * ```typescript
 * const { colorMode, toggleColorMode } = useColorMode()
 *
 * // Get current mode
 * console.log(colorMode.value) // 'light' | 'dark'
 *
 * // Toggle mode
 * toggleColorMode()
 * ```
 *
 * @see {@link docs/COLOR-MODE.md} for detailed guide
 */
export const useColorMode = () => {
  // Implementation
}
````

### Configuration Documentation

Always document:

- What it does
- Default values
- Required vs optional
- Examples
- Impact on app

````markdown
## color-mode Configuration

**Location:** `nuxt.config.ts`

### Options

| Option       | Type   | Default        | Description                 |
| ------------ | ------ | -------------- | --------------------------- |
| `preference` | string | `'light'`      | Default color mode          |
| `fallback`   | string | `'light'`      | Fallback if detection fails |
| `storageKey` | string | `'color-mode'` | localStorage key            |

### Example

```typescript
colorMode: {
  preference: 'light',
  fallback: 'light',
  storageKey: 'riddle-rush-color-mode',
}
```
````

````

### Troubleshooting Documentation

Always include:
1. Symptom
2. Cause
3. Solution
4. Prevention

```markdown
## Troubleshooting

### TypeScript Errors After Plugin Update

**Symptom:** `Cannot find module '@nuxtjs/color-mode'`

**Cause:** Plugin types not generated after install

**Solution:**
```bash
rm -rf .nuxt
pnpm run dev
````

**Prevention:** Run `pnpm run dev` after any plugin installation

````

---

## Maintenance

### Regular Reviews

**Monthly:**
- [ ] Check for broken links
- [ ] Update outdated examples
- [ ] Archive completed summaries
- [ ] Verify command outputs
- [ ] Update "Last Updated" dates

**Quarterly:**
- [ ] Review entire docs/ structure
- [ ] Remove deprecated documents
- [ ] Consolidate similar guides
- [ ] Update docs/README.md index
- [ ] Check cross-references

### Deprecation Process

When documentation becomes outdated:

1. Add deprecation notice at top:
```markdown
> **⚠️ DEPRECATED:** This guide is outdated as of YYYY-MM-DD.
> See [New Guide](NEW-GUIDE.md) instead.
````

2. After 3 months, move to archive:

```bash
mv docs/OLD-GUIDE.md docs/archive/
```

3. Update all references to point to new guide

---

## Quick Reference

### Documentation Commands

```bash
# Format all markdown files
pnpm run format

# Lint markdown (if configured)
pnpm run lint

# Find broken links
grep -r "\[.*\](.*)" docs/ | grep -v "http"

# List all markdown files
find docs -name "*.md" | sort
```

### Common Locations

```bash
docs/                           # Main docs
docs/setup/                     # Setup guides
docs/deployment/                # Deployment guides
docs/archive/                   # Historical docs
```

### Commit Message Prefixes

```
docs: Update/create documentation
docs(setup): Setup-related docs
docs(deployment): Deployment docs
docs(api): API documentation
```

---

## Summary

**Golden Rules:**

1. ✅ Document user-facing changes
2. ✅ Use correct folder structure
3. ✅ Include examples always
4. ✅ Update docs/README.md index
5. ✅ Keep docs up to date
6. ✅ Commit docs with related code
7. ✅ Use clear, consistent style
8. ✅ Add troubleshooting sections

**Remember:** Good documentation saves time for everyone, including future AI agents!

---

**Last Updated:** January 11, 2026  
**Status:** Active  
**Related:** [AGENTS.md](../../AGENTS.md), [docs/README.md](../README.md)
