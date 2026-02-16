---
description: Repository Information Overview
alwaysApply: true
---

# Riddle Rush Monorepo Information

## Repository Summary

Riddle Rush is a word guessing game PWA built with Nuxt 4, featuring multi-player support, IndexedDB persistence, and cross-platform capabilities. The repository is organized as a pnpm monorepo orchestrated by Turborepo, encompassing the core game, a mobile app, CLI tools, and infrastructure definitions.

## Repository Structure

The project follows a modular monorepo architecture:

- **apps/**: Contains the main user-facing applications (Game PWA and Mobile app).
- **packages/**: Shared logic, TypeScript types, and configurations used across the workspace.
- **tools/**: AI agent integrations, Python utilities, and specialized MCP servers.
- **infrastructure/**: Terraform configurations for AWS deployment (S3, CloudFront).
- **scripts/**: Utility scripts for CI/CD, deployment, and workspace maintenance.

### Main Repository Components

- **@riddle-rush/game**: Core Nuxt 4 PWA game application.
- **apps/mobile**: NativeScript Vue mobile application.
- **@riddle-rush/cli**: Oclif-based command-line tool for project management.
- **@riddle-rush/shared**: Shared constants, utilities, and route definitions.
- **@riddle-rush/types**: Centralized TypeScript type definitions.
- **@riddle-rush/config**: Shared Vite and build configurations.

## Projects

### @riddle-rush/game (Core Game)

**Configuration File**: `apps/game/package.json`

#### Language & Runtime

**Language**: TypeScript  
**Version**: Node.js ≥ 20.0.0  
**Build System**: Turborepo / Nuxt 4 (SSR: false)  
**Package Manager**: pnpm 10.28.1

#### Dependencies

**Main Dependencies**:

- `nuxt`: ^4.3.0
- `vue`: ^3.5.26
- `@pinia/nuxt`: ^0.11.3
- `@vite-pwa/nuxt`: ^1.1.0
- `idb`: ^8.0.3 (IndexedDB)
- `socket.io-client`: ^4.8.3
- `@riddle-rush/shared`, `@riddle-rush/types`, `@riddle-rush/config`

#### Build & Installation

```bash
pnpm install
pnpm run build --filter=@riddle-rush/game
pnpm run generate --filter=@riddle-rush/game # Static Site Generation
```

#### Docker

**Dockerfile**: `./Dockerfile` (Root)
**Image**: `riddle-rush:latest`
**Configuration**: Multi-stage build using `node:22-alpine` for building static files and `nginx:1.27-alpine` for production serving.

#### Testing

**Framework**: Vitest (Unit), Playwright (E2E)
**Test Location**: `apps/game/tests/`
**Naming Convention**: `*.spec.ts`, `*.test.ts`
**Configuration**: `vitest.config.ts`, `playwright.config.ts`

**Run Command**:

```bash
pnpm run test:unit --filter=@riddle-rush/game
pnpm run test:e2e --filter=@riddle-rush/game
```

### @riddle-rush/cli

**Configuration File**: `packages/riddle-cli/package.json`

#### Language & Runtime

**Language**: TypeScript  
**Version**: Node.js ≥ 20.0.0  
**Build System**: tsc  
**Package Manager**: pnpm

#### Build & Installation

```bash
pnpm run build --filter=@riddle-rush/cli
```

#### Testing

**Framework**: Mocha
**Test Location**: `packages/riddle-cli/test/`
**Run Command**:

```bash
pnpm run test --filter=@riddle-rush/cli
```

### Mobile App

**Configuration File**: `apps/mobile/package.json`

#### Language & Runtime

**Language**: TypeScript / Vue  
**Framework**: NativeScript Vue  
**Package Manager**: pnpm

#### Build & Installation

```bash
# Uses NativeScript CLI (ns)
ns build android
ns build ios
```

### Infrastructure & Tools

**Type**: Non-traditional repository components

#### Specification & Tools

**Type**: Terraform / Python / AI Tools  
**Required Tools**: `terraform`, `python3`, `pnpm`

#### Key Resources

**Main Files**:

- `infrastructure/environments/`: Terraform env definitions.
- `tools/ai-agents/`: AI logic and agent configurations.
- `turbo.json`: Task orchestration rules.
- `pnpm-workspace.yaml`: Monorepo workspace definition.

#### Usage & Operations

**Key Commands**:

```bash
pnpm run infra:prod:plan   # Plan infrastructure changes
pnpm run workspace:check   # Full workspace validation (lint + typecheck)
pnpm run deploy:aws        # Deploy application to AWS
```
