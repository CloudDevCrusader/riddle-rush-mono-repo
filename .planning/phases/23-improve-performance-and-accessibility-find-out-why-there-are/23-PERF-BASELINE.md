# Phase 23 Performance Baseline

Generated: 2026-04-11T00:40:42Z

## Command

```bash
pnpm --filter @riddle-rush/game run build
pnpm --filter @riddle-rush/game run preview
pnpm --filter @riddle-rush/game run lighthouse:ci
```

Lighthouse report source: `apps/game/.lighthouse-ci/ci-result.json`

## Audited Routes

- /
- /credits
- /game/%5B%5BgameId%5D%5D
- /language
- /leaderboard
- /players
- /results/%5B%5BgameId%5D%5D
- /round-start
- /settings
- /splash

## Scores

| Category       | Average Score |
| -------------- | ------------- |
| Performance    | 0.93          |
| Accessibility  | 0.64          |
| Best Practices | 1.00          |
| SEO            | 0.91          |

## Notes

- Baseline generated before executing optimization plans 23-02 through 23-04.
- Command and route list are persisted to satisfy reproducibility and tamper-resistance requirements (T-23-01, T-23-02).
