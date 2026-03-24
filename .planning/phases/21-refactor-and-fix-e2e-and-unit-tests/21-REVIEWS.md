---
phase: 21
reviewers: [claude]
reviewed_at: 2026-03-24T12:15:00Z
plans_reviewed: [21-01-PLAN.md]
review_status: claude_review_complete, others_failed
---

# Cross-AI Plan Review — Phase 21

## Invocation Status

### Claude CLI

**Status**: Success (exit code 0)
**Version**: 2.1.81 (Claude Code)
**Command**: `claude "$(cat /tmp/gsd-review-prompt-21.md)"`
**Result**: Detailed review generated successfully

### Gemini CLI

**Status**: Failed (MCP issues detected)
**Error**: "MCP issues detected. Run /mcp list for status."
**Note**: Gemini CLI appears to have internal MCP configuration issues preventing successful prompt processing.

### Codex CLI

**Status**: Failed (exit code 1)
**Version**: codex-cli 0.116.0
**Command**: `codex "$(cat /tmp/gsd-review-prompt-21.md)"`
**Note**: Codex CLI is available but exited with code 1. Similar invocation pattern failure.

---

## Claude Review — Plan 21-01

# Cross-AI Plan Review: Phase 21 — Plan 21-01

## Summary

Plan 21-01 targets a high-value area of codebase by adding unit tests for three core stateless composables (useCategoryManager, usePlayerManager, useScoringEngine). These composables were extracted from the game store and contain pure logic functions that are ideal for deterministic unit testing. The plan is well-scoped with clear deliverables and specific test case counts, aligning with TEST-01 requirement for >75% composable coverage.

---

## Strengths

- **Targeted scope** — Focuses on stateless composables with pure functions, which are the easiest to test and highest value for coverage gains
- **Specific test case counts** — 9, 15, and 11 test cases show thoughtful planning rather than vague "write comprehensive tests"
- **Clear success criteria** — All tests must pass with 100% success rate, edge cases covered
- **Addresses critical debt** — These are game logic functions where bugs directly impact gameplay experience
- **Deterministic testing** — Stateless composables avoid the complexity of Pinia store mocking, reducing test flakiness
- **Measurable progress** — 3 new files with explicit counts makes progress easy to track

---

## Concerns

| Severity   | Concern                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **MEDIUM** | No verification that composables are actually pure functions — some may call Pinia stores or other composables, requiring mocks |
| **MEDIUM** | Test case counts (9/15/11) appear arbitrary without seeing actual functions being tested — risk of missing critical edge cases  |
| **LOW**    | No explicit mention of testing error handling for invalid inputs (negative scores, duplicate players, etc.)                     |
| **LOW**    | Plan doesn't specify test data fixtures or factory functions — duplication likely without shared test utilities                 |
| **LOW**    | No integration between composables tested — they likely work together in game flow                                              |

---

## Suggestions

1. **Audit composables before testing** — Read each composable to identify:
   - Which functions are truly pure (no external dependencies)
   - Which require Pinia store mocking or other composables
   - Current function signatures and return types

2. **Create shared test utilities** — Before writing tests, add a `tests/unit/fixtures/` directory with:
   - Factory functions for test data (`createMockPlayer()`, `createMockCategory()`)
   - Shared assertions (`expectValidScore()`, `expectValidPlayerOrder()`)
   - This prevents duplication across 3 test files

3. **Define test cases by function analysis** — Instead of predetermined counts (9/15/11), derive test cases from:
   - Branch coverage targets for each function
   - Known edge cases (empty arrays, null/undefined inputs, boundary values)
   - Game rules (max players, score limits, category constraints)

4. **Add a validation step** — After creating tests, verify:
   - Branch coverage meets >80% for each composable
   - No console warnings or unhandled errors in test output
   - Tests run in <5 seconds (detects hidden async issues)

5. **Consider integration tests for composables** — Add a single integration test file that tests to 3 composables working together (e.g., category selection → player ordering → scoring calculation)

---

## Risk Assessment

**Overall Risk**: LOW

**Justification**:

- The target composables are extracted game logic, well-understood and stable
- Unit tests for pure functions have very low risk — they're isolated and deterministic
- The scope is bounded (3 files, ~35 tests) — minimal risk of scope creep
- Test infrastructure (Vitest + happy-dom) is already configured and proven
- Even if some functions require mocking, Pinia store mocking patterns exist in codebase

**Mitigation**: The few risks that exist are easily mitigated by reading composables first and using shared test fixtures rather than duplicating code.

---

★ Insight ─────────────────────────────────────
**Testing Statelessness vs. Stateful Code**
When testing composables, always check to dependency chain. A "stateless" composable that imports `useGameState` or calls `useStore()` is actually coupled to Pinia state. Pure composables have no Pinia imports and return plain objects/functions. The extraction from game store should have created truly pure functions, but verify this before assuming test simplicity.

**Test Data Factories Reduce Duplication**
For game logic tests, creating `createMockPlayer(name: string)` and `createMockCategory(letter: string)` factory functions eliminates 50+ lines of repetitive test setup. Place these in `tests/unit/fixtures/factories.ts` and import across all test files.
─────────────────────────────────────────────────

---

## Consensus Summary

_Note: Only Claude CLI completed successfully. Gemini had MCP issues, Codex failed with exit code 1._

### Agreed Strengths

(From Claude review):

- Targeted scope focusing on high-value stateless composables
- Specific test case counts showing thoughtful planning
- Addresses critical debt with game logic functions
- Clear success criteria and measurable progress

### Agreed Concerns

(From Claude review):

- Test case counts appear arbitrary without seeing actual functions
- Need to verify composables are truly pure before assuming simplicity
- Missing test data fixtures and factory functions may cause duplication

### Divergent Views

(N/A - only one reviewer completed successfully)

---

## Notes for Planner

When using `--reviews` flag for future planning:

1. **Audit composables first** — Read each composable to verify purity before writing tests
2. **Create shared test fixtures** — Add `tests/unit/fixtures/factories.ts` before implementing tests
3. **Derive test cases by analysis** — Don't use arbitrary counts, analyze function branches instead
4. **Add integration test** — Consider testing composables together in a single file

---

_Review Status: Claude review complete, others failed. Analysis above based on Claude's feedback._
