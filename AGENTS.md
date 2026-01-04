# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm/turbo monorepo. The main app lives in `apps/game` (Nuxt 4 PWA). Documentation lives in `apps/docs`. Shared code is under `packages/` (`config`, `shared`, `types`). Infrastructure and deployment scripts live in `infrastructure/` and `scripts/`. Game assets are in `apps/game/assets` and `apps/game/public`. Tests are in `apps/game/tests` with `unit/`, `e2e/`, and `utils/` subfolders.

## Build, Test, and Development Commands

- `pnpm install` — install workspace dependencies (Node >= 20, pnpm >= 10).
- `pnpm run dev` — start the game app via Turbo (`apps/game`).
- `pnpm run dev:docs` — start the docs app.
- `pnpm run build` / `pnpm run generate` — build or generate the game app.
- `pnpm run test:unit` — run Vitest unit tests (workspace).
- `pnpm run test:e2e` — run Playwright E2E tests for the game.
- `pnpm run lint` / `pnpm run format` / `pnpm run typecheck` — ESLint, Prettier, and TypeScript checks.

## Coding Style & Naming Conventions

Use TypeScript + Vue 3 conventions. Formatting is enforced by Prettier (`tabWidth: 2`, `singleQuote: true`, `semi: false`, `printWidth: 100`). ESLint is the primary linter. Components use PascalCase filenames (e.g., `Leaderboard.vue`), composables are named `useX` (e.g., `useIndexedDB.ts`), and Pinia stores live in `apps/game/stores/*.ts`.

## Testing Guidelines

Unit tests use Vitest and live in `apps/game/tests/unit/*.spec.ts`. E2E tests use Playwright in `apps/game/tests/e2e/*.spec.ts`. For coverage, run `pnpm --filter @riddle-rush/game test:unit:coverage`.

## Commit & Pull Request Guidelines

Commit history favors Conventional Commit style, e.g., `fix: update offline cache`. Keep messages short and action-oriented. PRs should include a clear description, relevant issue links, and the tests you ran. Add screenshots or short clips for UI changes.

## Configuration Tips

Copy `.env.example` to `.env` for local development and keep secrets out of git. Runtime config is accessed through Nuxt’s `useRuntimeConfig()`.
