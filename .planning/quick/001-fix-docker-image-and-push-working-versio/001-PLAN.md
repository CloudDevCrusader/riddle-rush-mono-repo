---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Dockerfile
  - docker-compose.yml
  - .dockerignore
autonomous: true

must_haves:
  truths:
    - 'Docker image builds successfully from repo root'
    - 'Built container serves the Nuxt static PWA on port 80'
    - 'docker-compose up starts the app and health check passes'
  artifacts:
    - path: 'Dockerfile'
      provides: 'Multi-stage Docker build for monorepo'
    - path: 'docker-compose.yml'
      provides: 'Container orchestration with correct health check'
    - path: '.dockerignore'
      provides: 'Optimized build context for monorepo'
  key_links:
    - from: 'Dockerfile'
      to: 'pnpm-workspace.yaml'
      via: 'COPY for workspace resolution'
      pattern: 'COPY.*pnpm-workspace'
    - from: 'Dockerfile'
      to: 'apps/game'
      via: 'turbo generate filtered to game app'
      pattern: 'generate.*filter'
---

<objective>
Fix the Dockerfile so it correctly builds the Nuxt 4 PWA from this pnpm monorepo, fix the docker-compose health check, and update .dockerignore to not exclude files needed by the build.

Purpose: The current Dockerfile treats the project as a single-package repo — it copies only root `package.json` + `pnpm-lock.yaml`, missing the workspace config and sub-package manifests required for `pnpm install --frozen-lockfile` to succeed in a monorepo. The docker-compose health check also uses the wrong port (8080 host port instead of 80 container port).

Output: Working Dockerfile, docker-compose.yml, and .dockerignore that build and serve the static PWA.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/execute-plan.md
@./.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@Dockerfile
@Dockerfile.e2e
@docker-compose.yml
@.dockerignore
@package.json
@pnpm-workspace.yaml
@turbo.json
@apps/game/package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix Dockerfile for pnpm monorepo build</name>
  <files>Dockerfile, .dockerignore</files>
  <action>
  The current Dockerfile has multiple issues preventing it from building in a monorepo context. Fix all of them:

**Dockerfile issues to fix:**

1. **Missing workspace files in dependency install layer.** The `COPY package.json pnpm-lock.yaml ./` must ALSO copy `pnpm-workspace.yaml` and all workspace `package.json` files. Without these, `pnpm install --frozen-lockfile` fails because pnpm can't resolve workspace dependencies (`workspace:*`). Use the same pattern as `Dockerfile.e2e`:

   ```dockerfile
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   COPY apps/game/package.json ./apps/game/
   COPY packages/config/package.json ./packages/config/
   COPY packages/shared/package.json ./packages/shared/
   COPY packages/types/package.json ./packages/types/
   ```

   Note: Do NOT include `packages/riddle-cli/` or `tools/*/` — they are not needed for the game build and would bloat the image.

2. **pnpm version mismatch.** Change `corepack prepare pnpm@10.26.2` to `corepack prepare pnpm@10.28.2` to match the `packageManager` field in root `package.json`. Actually, the best approach is to NOT hardcode the version — use `corepack enable` and let it read from `package.json`'s `packageManager` field. So the install step should be:

   ```dockerfile
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   RUN corepack enable && corepack install
   ```

   This way corepack reads the `packageManager` field from the already-copied `package.json`.

3. **`pnpm run generate` must be filtered to the game app.** The root `package.json` already has `"generate": "turbo run generate --filter=@riddle-rush/game"` so `pnpm run generate` from root should work. However, ensure `turbo.json` is also copied since turbo needs it. Add `COPY turbo.json ./` before the full source copy OR just keep using `pnpm run generate` which delegates to turbo.

4. **The `COPY . .` step needs turbo.json available.** Since turbo.json is needed for the generate command, make sure it's part of the build context (it isn't excluded by .dockerignore, so this is fine).

5. **Add `.npmrc` to the dependency install layer** if it exists (it does) — pnpm may need it for registry config.

**The corrected builder stage should be:**

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace configuration for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./

# Copy workspace package.json files needed for game build
COPY apps/game/package.json ./apps/game/
COPY packages/config/package.json ./packages/config/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/

# Enable corepack and install pnpm (version from packageManager field)
RUN corepack enable && corepack install

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy full source code
COPY . .

# Generate static site
ENV BASE_URL=/
ENV NODE_ENV=production
RUN pnpm run generate
```

The nginx production stage is fine as-is. Keep it unchanged.

**.dockerignore issues to fix:**

1. **Remove `scripts/` from .dockerignore** — `apps/game/scripts/typecheck.sh` is called by `apps/game/package.json`'s `typecheck` script which turbo may invoke during generate. Instead, exclude only root-level scripts: add `scripts/` back but ensure `apps/` is not affected (the current glob `scripts/` only matches root-level anyway, so this is actually fine). Actually, looking more carefully — the root `scripts/` exclusion is fine because it only excludes the root `scripts/` directory, not `apps/game/scripts/`. Docker's .dockerignore patterns match from the build context root. So `scripts/` only excludes `/scripts/`. This is correct.

2. **Remove `*.md` from .dockerignore** — this blanket exclusion will prevent copying ANY .md file including potentially needed ones. However for this build no .md files are needed, so this is actually fine.

3. **Remove `.env.*` exclusion conflict.** The pattern `.env.*` followed by `!.env.example` is correct behavior. No change needed.

So the only .dockerignore change: No changes needed. The current .dockerignore is fine for this build.

**Summary of Dockerfile changes:**

- Add pnpm-workspace.yaml, turbo.json, .npmrc to initial COPY
- Add workspace package.json COPYs for game, config, shared, types
- Use `corepack enable && corepack install` instead of hardcoded version
- Keep `pnpm run generate` (already filtered via turbo)
- Keep nginx stage unchanged
  </action>
  <verify>
  Run `docker build -t riddle-rush:test .` from repo root and verify it completes successfully. The build should:

1. Install pnpm via corepack without version mismatch warnings
2. Run `pnpm install --frozen-lockfile` without workspace resolution errors
3. Run `pnpm run generate` and produce static output in `.output/public`
4. Copy static files to nginx and create final image
   </verify>
   <done>
   `docker build -t riddle-rush:test .` completes with exit code 0, producing a working nginx image with the static PWA files.
   </done>
   </task>

<task type="auto">
  <name>Task 2: Fix docker-compose.yml health check and verify container runs</name>
  <files>docker-compose.yml</files>
  <action>
  Fix the docker-compose.yml health check bug:

**Bug:** The health check uses `http://localhost:8080/health` but the container listens on port 80. The `8080:80` port mapping maps host port 8080 to container port 80, but health checks run INSIDE the container, so they must use port 80.

Change line 16 from:

```yaml
test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:8080/health']
```

to:

```yaml
test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:80/health']
```

Also update the dev service pnpm version from `10.26.2` to match — or better, just use `corepack enable && pnpm install` without specifying version (let corepack read from package.json):

```yaml
command: sh -c "corepack enable && pnpm install && pnpm run dev --host"
```

Keep everything else unchanged.
</action>
<verify>
Run `docker compose up -d app` and verify:

1. Container starts without errors: `docker compose ps` shows "healthy" status
2. App is accessible on host: `curl -s http://localhost:8080/health` returns "healthy"
3. App serves the PWA: `curl -s http://localhost:8080/ | head -5` returns HTML with Riddle Rush content
   Then clean up: `docker compose down`
   </verify>
   <done>
   Container starts, health check passes (shows "healthy"), and the PWA is accessible at http://localhost:8080.
   </done>
   </task>

<task type="auto">
  <name>Task 3: Push working Docker configuration to GitHub</name>
  <files>Dockerfile, docker-compose.yml</files>
  <action>
  After verifying the Docker build works:

1. Stage the changed files: `git add Dockerfile docker-compose.yml`
2. Also stage .dockerignore if it was modified: `git add .dockerignore` (only if changed)
3. Commit with message: `fix: Docker build for pnpm monorepo with correct workspace config`
   Body should mention: fixes workspace resolution, pnpm version, and health check port
4. Push to the current branch: `git push`

Do NOT force push. Do NOT push to main unless already on main.
</action>
<verify>
`git log -1 --oneline` shows the new commit.
`git status` shows clean working tree.
`git push` succeeds without errors.
</verify>
<done>
Commit with Docker fixes is pushed to GitHub on the current branch.
</done>
</task>

</tasks>

<verification>
1. `docker build -t riddle-rush:test .` completes successfully
2. `docker compose up -d app && sleep 10 && curl -s http://localhost:8080/health` returns "healthy"
3. `docker compose down` cleans up
4. Git commit with fixes is pushed to GitHub
</verification>

<success_criteria>

- Docker image builds from repo root without errors
- Container serves static PWA and health check responds
- Changes are committed and pushed to GitHub
  </success_criteria>

<output>
After completion, create `.planning/quick/001-fix-docker-image-and-push-working-versio/001-SUMMARY.md`
</output>
