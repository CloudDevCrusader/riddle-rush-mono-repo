# Riddle Rush

A multiplayer PWA party game built with Nuxt 4, Vue 3, and TypeScript. Play word-guessing games with friends on any device, with offline support and mobile app capabilities.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.2-green)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen)](https://vuejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎮 Features

- **Multiplayer Gameplay** - Play with 2-6 players locally
- **PWA Support** - Install as an app, works offline
- **Mobile Apps** - Android (via Capacitor)
- **Offline Mode** - Full gameplay without internet
- **Multi-language** - English & German support
- **Dark Mode** - Color mode switching
- **Game Statistics** - Track scores and history
- **Feature Flags** - GitLab integration for gradual rollouts

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd riddle-rush-nuxt-pwa

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Visit http://localhost:3000
```

### Development Commands

```bash
# Development
pnpm run dev              # Start game app
pnpm run dev:docs         # Start documentation site

# Quality checks (REQUIRED before commit)
pnpm run workspace:check  # Run all checks
pnpm run typecheck        # TypeScript validation
pnpm run lint             # ESLint checks
pnpm run lint:fix         # Auto-fix linting issues
pnpm run format           # Format with Prettier

# Testing
pnpm run test:unit        # Unit tests (Vitest)
pnpm run test:e2e         # E2E tests (Playwright)

# Building
pnpm run build            # Production build
pnpm run generate         # Static generation

# Agent commands
pnpm run agent:help       # Show quick reference
pnpm run agent:check      # Run all quality checks
pnpm run agent:fix        # Auto-fix all issues
```

## 📚 Documentation

- **[Agent Workflow Guide](AGENTS.md)** - Complete workflow for AI agents (START HERE)
- **[Documentation Index](docs/README.md)** - Full documentation structure
- **[Plugin Guide](docs/PLUGINS.md)** - Vite/Nuxt plugin configuration
- **[Testing Guide](docs/TESTING-GUIDE.md)** - How to write and run tests
- **[Deployment Guide](docs/deployment/)** - AWS, Docker, GitLab Pages

### Quick Links

- [Setup Guide](docs/setup/MONOREPO_ENVIRONMENT_GUIDE.md) - Environment configuration
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow
- [Code Structure](docs/STRUCTURE.md) - Project organization
- [Known Issues](docs/KNOWN-ISSUES.md) - Current limitations

## 🏗️ Project Structure

```
riddle-rush-nuxt-pwa/
├── apps/
│   ├── game/              # Main Nuxt 4 PWA application
│   └── docs/              # Documentation site
├── packages/
│   ├── shared/            # Shared utilities and constants
│   ├── types/             # TypeScript type definitions
│   └── config/            # Build configurations
├── infrastructure/        # Terraform IaC for AWS
├── docs/                  # Documentation files
│   ├── setup/            # Setup and configuration guides
│   ├── deployment/       # Deployment documentation
│   └── archive/          # Historical documents
└── scripts/              # Build and deployment scripts
```

## 🧪 Testing

- **367 Unit Tests** (Vitest) - 92.6% pass rate
- **12 E2E Tests** (Playwright) - Full coverage of critical flows
- Run tests: `pnpm run test:unit`
- Coverage: `pnpm run test:unit:coverage`

## 🤖 For AI Agents

**Before making changes:**

1. Read [AGENTS.md](AGENTS.md) for complete workflow
2. Run `pnpm run agent:help` for command reference
3. After EVERY change: `pnpm run workspace:check`

**Commit frequently with Conventional Commits:**

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update guide"
```

## 🔧 Tech Stack

- **Framework:** Nuxt 4 (Vue 3, TypeScript)
- **State:** Pinia
- **Storage:** IndexedDB, localStorage
- **Mobile:** Capacitor (Android/iOS)
- **Testing:** Vitest, Playwright
- **Build:** Vite 7, Turbo
- **PWA:** @vite-pwa/nuxt
- **i18n:** @nuxtjs/i18n
- **Infrastructure:** Terraform (AWS)

## 📦 Monorepo

This is a pnpm workspace monorepo managed with Turbo:

- **Fast builds** with remote caching
- **Shared packages** for code reuse
- **Independent deployments** per app
- **Unified tooling** (ESLint, TypeScript, Prettier)

## 🚢 Deployment

### AWS (Production)

```bash
# Deploy infrastructure
pnpm run deploy:infrastructure

# Deploy application
pnpm run deploy:prod
```

### Docker

```bash
docker-compose up
```

See [deployment documentation](docs/deployment/) for detailed guides.

## 🤝 Contributing

1. Read [AGENTS.md](AGENTS.md) for workflow
2. Make changes in a feature branch
3. Run quality checks: `pnpm run workspace:check`
4. Commit with conventional format: `feat:`, `fix:`, `docs:`
5. Push and create PR

### Pre-commit Hooks

- ✅ Auto-format staged files
- ✅ TypeScript validation
- ✅ Secret scanning
- ✅ Commit message validation

## 📝 Commit Guidelines

We enforce [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
refactor: Code restructuring
test:     Test changes
chore:    Maintenance
perf:     Performance improvement
style:    Formatting
```

Git hooks automatically validate your commits!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Links

- [Documentation](docs/README.md)
- [Agent Workflow](AGENTS.md)
- [Issue Tracker](https://github.com/your-org/riddle-rush/issues)
- [Contributing Guide](AGENTS.md#commit-guidelines)

## 🆘 Need Help?

- Check [Known Issues](docs/KNOWN-ISSUES.md)
- Review [Testing Guide](docs/TESTING-GUIDE.md)
- See [Development Guide](docs/DEVELOPMENT.md)
- Read [Agent Workflow](AGENTS.md)

---

**Built with ❤️ using Nuxt 4, Vue 3, and TypeScript**
