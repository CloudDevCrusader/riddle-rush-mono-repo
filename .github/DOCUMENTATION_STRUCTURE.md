# Documentation Structure

This document explains the organization of documentation in this repository.

## Root Level Files

### ESSENTIAL (3 files)

1. **[README.md](../README.md)** - Main project documentation
   - Project overview with badges
   - Quick start guide
   - Feature highlights
   - Tech stack overview
   - Contributing guidelines
   - **Audience:** All users (developers, contributors, visitors)

2. **[AGENTS.md](../AGENTS.md)** - Agent workflow guide (777 lines)
   - Complete workflow for AI agents
   - Commit guidelines (Conventional Commits)
   - Quality checks and automation
   - Example workflows
   - **Audience:** AI agents (GitHub Copilot, Claude, Cursor, etc.)

3. **[CLAUDE.md](../CLAUDE.md)** - Claude Code specific guide
   - Quick reference for Claude Code users
   - Essential commands
   - Deployment instructions
   - Project structure overview
   - **Audience:** Claude Code / Claude Sonnet users

## docs/ Directory Structure

### Main Documentation (docs/)

- **[README.md](../docs/README.md)** - Documentation index with categories
- Core guides (PLUGINS.md, DEVELOPMENT.md, TESTING-GUIDE.md, etc.)
- 20+ main documentation files

### Organized Subdirectories

#### docs/setup/ (7 files)

Setup and configuration guides:

- Environment configuration
- Terraform setup
- Husky/Turborepo integration
- Infrastructure import guides

#### docs/deployment/ (5 files)

Deployment documentation:

- AWS deployment guide
- Docker deployment
- GitLab Pages setup
- IAM configuration

#### docs/archive/ (27 files)

Historical documents:

- Old summaries and plans
- Completed migration docs
- Reference material

## Documentation Guidelines

### When to Update

1. **README.md** - Major features, tech stack changes, quick start updates
2. **AGENTS.md** - Workflow changes, new quality gates, commit guidelines
3. **CLAUDE.md** - New commands, deployment updates, structural changes
4. **docs/** - Feature documentation, guides, troubleshooting

### Adding New Documentation

1. **User-facing guides** → docs/
2. **Setup/config guides** → docs/setup/
3. **Deployment guides** → docs/deployment/
4. **Completed summaries** → docs/archive/

### Cross-References

All documentation files should link to:

- README.md (project overview)
- AGENTS.md (for workflow)
- docs/README.md (documentation index)

## Quick Navigation

```
Root Level (3 files):
├── README.md              - Project overview
├── AGENTS.md              - Agent workflow guide
└── CLAUDE.md              - Claude Code guide

docs/ (organized):
├── README.md             - Documentation index
├── PLUGINS.md            - Plugin configuration
├── DEVELOPMENT.md        - Development guide
├── TESTING-GUIDE.md      - Testing strategy
├── setup/                - Setup guides (7 files)
├── deployment/           - Deployment docs (5 files)
└── archive/              - Historical docs (27 files)
```

## Maintenance

- **Monthly:** Review and update links
- **After major changes:** Update relevant guides
- **Quarterly:** Archive outdated summaries
- **Keep current:** README.md, AGENTS.md, CLAUDE.md

---

**Last Updated:** January 11, 2026
**Documentation Files:** 3 root + 60+ in docs/
**Status:** ✅ Organized and up-to-date
