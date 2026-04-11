# Phase 23 Performance Baseline

Generated: 2026-04-11T04:25:00Z
Target: `https://riddlerush.de` (production)
Tool: unlighthouse-ci v0.17.7

## Command

```bash
npx unlighthouse-ci --site https://riddlerush.de --build-static --output-path /tmp/lighthouse-baseline
```

Lighthouse report source: `/tmp/lighthouse-baseline/ci-result.json`

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

## Summary Scores

| Category       | Average Score | Target | Gap    |
| -------------- | ------------- | ------ | ------ |
| Performance    | 81            | 90+    | −9     |
| Accessibility  | 76            | 90+    | −14    |
| Best Practices | 100           | 90+    | ✅ +10 |
| SEO            | 99            | 90+    | ✅ +9  |

## Per-Route Breakdown

| Route               | Perf | A11y | BP  | SEO | LCP   | FCP   | CLS  | TBT  |
| ------------------- | ---- | ---- | --- | --- | ----- | ----- | ---- | ---- |
| /                   | 80   | 81   | 100 | 100 | 3.9 s | 2.1 s | 0.02 | 0 ms |
| /credits            | 73   | 81   | 100 | 100 | 6.3 s | 2.2 s | 0    | 0 ms |
| /game/[[gameId]]    | 76   | 88   | 100 | 100 | 5.7 s | 1.7 s | 0    | 0 ms |
| /language           | 78   | 81   | 100 | 100 | 5.4 s | 1.8 s | 0    | 0 ms |
| /leaderboard        | 77   | 69   | 100 | 100 | 5.7 s | 1.7 s | 0    | 0 ms |
| /players            | 78   | 69   | 100 | 100 | 5.7 s | 1.8 s | 0    | 0 ms |
| /results/[[gameId]] | 89   | 88   | 100 | 100 | 3.5 s | 1.8 s | 0    | 0 ms |
| /round-start        | 95   | 67   | 100 | 100 | 2.7 s | 1.8 s | 0    | 0 ms |
| /settings           | 92   | 83   | 100 | 100 | 3.1 s | 1.8 s | 0    | 0 ms |
| /splash             | 76   | 56   | 100 | 91  | 6.2 s | 1.7 s | 0    | 0 ms |

## Key Observations

- **LCP is the dominant performance bottleneck**: average 4.8 s across routes (target ≤ 2.5 s).
- **Worst performers**: `/credits` (73 perf, 6.3 s LCP), `/splash` (76 perf, 56 a11y, 6.2 s LCP).
- **Accessibility gaps**: `/splash` (56), `/round-start` (67), `/leaderboard` (69), `/players` (69).
- **Best Practices and SEO already exceed targets** — no optimization needed in those categories.
- **TBT is 0 ms across all routes** — no JavaScript execution blocking.
- **CLS is excellent** (≤ 0.02) — layout stability is good.

## Notes

- Baseline generated before executing optimization plans 23-02 through 23-04.
- Command, route list, and timestamp are persisted to satisfy reproducibility and tamper-resistance requirements (T-23-01, T-23-02).
- Scores scanned against production deployment (commit `bf3f2d051`) — not a local preview build.
