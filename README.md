# Riddle Rush

A pnpm/Turborepo monorepo for the **Riddle Rush** multiplayer party game (Nuxt 4 PWA), mobile app tooling, shared packages, docs, and infrastructure.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.4-green)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5-brightgreen)](https://vuejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎮 Features

- Multiplayer gameplay (2-10 players, configurable)
- Nuxt 4 PWA with offline support
- Android builds via Capacitor
- IndexedDB persistence for sessions/history
- English + German localization
- Vitest unit tests + Playwright E2E tests
- GitHub Actions CI/CD + AWS deployment scripts

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 10 (packageManager pinned to pnpm@10.30.3)

### Install and run

```bash
git clone <repository-url>
cd riddle-rush-mono-repo
pnpm install
pnpm run dev
```

Game app runs at `http://localhost:3000`.

## 🔧 Essential Commands

```bash
# Development
pnpm run dev              # Start game app via Turbo
pnpm run dev:all          # Start all app dev tasks

# Quality (required before commit)
pnpm run workspace:check  # syncpack + typecheck + lint
pnpm run workspace:fix    # auto-fix + format

# Testing
pnpm run test:unit
pnpm run test:e2e

# Build
pnpm run build
pnpm run generate

# Dead code analysis
pnpm run knip
```

## 🏗️ Monorepo Structure

```text
riddle-rush-mono-repo/
├── apps/
│   ├── game/              # Main Nuxt 4 PWA game
│   ├── mobile/            # NativeScript Vue mobile app
│   └── tolgee/            # Tolgee localization app/service
├── packages/
│   ├── config/            # Shared Vite/build configuration
│   ├── shared/            # Shared constants/utilities
│   ├── types/             # Shared TypeScript types
│   └── riddle-cli/        # CLI package
├── tools/                 # AI and Python tooling
├── infrastructure/        # Terraform (AWS)
├── docs/                  # Documentation and guides
├── scripts/               # CI/CD and utility scripts
├── .planning/             # Plan execution artifacts
├── specs/                 # Specifications
└── openspec/              # OpenSpec artifacts
```

## 📚 Documentation

- [AGENTS.md](AGENTS.md) — agent workflow and quality gates
- [CLAUDE.md](CLAUDE.md) — Claude-specific project instructions
- [docs/README.md](docs/README.md) — docs index
- [docs/deployment/](docs/deployment/) — deployment guides

## 🚢 Deployment

```bash
pnpm run deploy:dev
pnpm run deploy:prod
```

For infrastructure changes, use the `infra:*` scripts in `package.json`.

## 🤝 Contributing

1. Read [AGENTS.md](AGENTS.md)
2. Make focused changes
3. Run `pnpm run workspace:check`
4. Commit using Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
5. Open a PR

## 📄 License

MIT — see [LICENSE](LICENSE).
