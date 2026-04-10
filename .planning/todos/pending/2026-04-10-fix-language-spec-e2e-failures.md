---
created: 2026-04-10T20:45:00.000Z
title: Fix remaining E2E failures in language.spec.ts (~12 tests)
area: testing
files:
  - apps/game/tests/e2e/language.spec.ts
  - apps/game/pages/language.vue
---

## Problem

Approximately 12 E2E tests in `language.spec.ts` are failing due to UI/testid mismatches. Known issues:

- Missing `data-testid="credits-title-image"` on language page
- OK button not navigating away from `/language`
- Missing `data-testid="language-flag-*"` elements
- Missing `data-testid^="menu-item-"` elements on home page

These are pre-existing test/UI mismatches unrelated to the submit button fix.

## Solution

1. Compare each failing test's expected testids against actual rendered DOM
2. Update either the tests or the components to align testids
3. Fix navigation issues (OK button on language page)
4. Re-run `language.spec.ts` to verify all tests pass
