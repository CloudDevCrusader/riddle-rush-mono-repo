---
created: 2026-04-10T20:45:00.000Z
title: Verify Android build is universal (fails at some customers)
area: mobile
files:
  - apps/game/capacitor.config.ts
---

## Problem

The Android build reportedly fails for some customers. Need to verify whether the build is truly universal (works across different Android versions, devices, and architectures) or if there are compatibility issues causing failures on certain devices.

## Solution

1. Review Capacitor and Android build configuration for target SDK, min SDK, and ABI filters
2. Check if the build produces a universal APK/AAB or is architecture-specific
3. Test on multiple Android devices/emulators with different API levels
4. Review crash reports or error logs from affected customers if available
5. Fix any compatibility issues found (e.g., missing ABI support, SDK version constraints)


---

## Completed 2026-04-11
- Documented: default `play` flavor is ARM-only; use `universal` flavor for x86 emulators. minSdk 24, target/compile 36. See TODOS-PARALLEL-EXECUTION-PLAN.md.
