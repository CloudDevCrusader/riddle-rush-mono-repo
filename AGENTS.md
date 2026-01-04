# Repository Guidelines

## Project Structure & Module Organization

- `apps/game/`: Nuxt 4 PWA application (primary product).
- `apps/docs/`: documentation site (Nuxt-based).
- `packages/`: shared packages used by apps.
- `components/`, `composables/`, `stores/`, `pages/`, `utils/`, `types/`: Nuxt app modules (auto-imported in app).
- `tests/unit/`: Vitest unit tests.
- `tests/e2e/`: Playwright E2E tests.
- `public/`: static assets (PWA icons, data, images).
- `docs/`: project documentation and CI/deployment guides.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies (required after clone).
- `pnpm run dev`: start game app dev server.
- `pnpm run dev:docs`: start docs site dev server.
- `pnpm run generate`: generate static build for game app.
- `pnpm run test:unit`: run Vitest unit tests once.
- `pnpm run test:e2e`: run Playwright E2E tests (headless).
- `pnpm run lint` / `pnpm run format:check`: lint and format checks.
- `pnpm run typecheck`: TypeScript type checking across workspace.

## Coding Style & Naming Conventions

- TypeScript + Vue SFCs; keep code client-only safe (wrap `window` usage in `onMounted`).
- Linting/formatting via ESLint and Prettier; use `pnpm run lint` and `pnpm run format`.
- Prefer existing composables (`usePageSetup`, `useLogger`, `useIndexedDB`) and shared constants in `utils/constants.ts`.
- Tests use `data-testid` attributes for stable selectors.

## Testing Guidelines

- Unit tests: Vitest in `tests/unit/` or colocated `*.spec.ts`.
- E2E tests: Playwright in `tests/e2e/`.
- Coverage targets: 80% for lines/functions/branches/statements.
- Run `pnpm run test:unit` for fast validation; use `pnpm run test:e2e` for full flows.

## Commit & Pull Request Guidelines

- Recent history shows mostly Conventional Commit prefixes (e.g., `fix:`), but not strictly enforced.
- Use concise, imperative commit messages; include scope when helpful (e.g., `fix: circleci`).
- PRs should describe changes, list testing performed, and link related issues.
- Include screenshots for UI changes when applicable.

## Configuration & CI Notes

- Node 20.19+ and pnpm 10+ are expected (see `package.json` engines).
- CI uses CircleCI with pnpm and workspace caching; keep `pnpm-lock.yaml` up to date.
