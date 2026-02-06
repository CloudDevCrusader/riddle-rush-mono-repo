<purpose>
Check project progress, summarize recent work, and route to the next action.

Provides situational awareness before continuing work.
</purpose>

<process>

## Step 1: Verify Planning Structure

```bash
test -d .planning && echo "exists" || echo "missing"
```

If no `.planning/`:

```
No planning structure found.
Run /gsd-new-project to start a new project.
```

Exit.

If missing STATE.md: suggest `/gsd-new-project`.

If ROADMAP.md missing but PROJECT.md exists: Route F (between milestones).

## Step 2: Load Context

Read:

- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/PROJECT.md`
- `.planning/config.json`

## Step 3: Gather Recent Work

Find the 2-3 most recent SUMMARY.md files.
Extract what was accomplished, key decisions, any issues.

## Step 4: Parse Current Position

From STATE.md: current phase, plan number, status.

Calculate: total plans, completed plans, remaining plans.

Check for:

- CONTEXT.md in phase directory
- Pending todos: `ls .planning/todos/pending/*.md 2>/dev/null | wc -l`
- Active debug sessions: `ls .planning/debug/*.md 2>/dev/null | grep -v resolved | wc -l`

## Step 5: Present Status Report

```
# [Project Name]

**Progress:** [████████░░] 8/10 plans complete
**Profile:** [quality/balanced/budget]

## Recent Work
- [Phase X, Plan Y]: [accomplishment]
- [Phase X, Plan Z]: [accomplishment]

## Current Position
Phase [N] of [total]: [phase-name]
Plan [M] of [phase-total]: [status]
CONTEXT: [✓ if exists | - if not]

## Key Decisions Made
- [decision 1]
- [decision 2]

## Blockers/Concerns
- [any blockers from STATE.md]

## Pending Todos
- [count] pending — /gsd-check-todos to review

## Active Debug Sessions
- [count] active — /gsd-debug to continue
(Only if count > 0)

## What's Next
[Next phase/plan objective]
```

## Step 6: Route to Next Action

**Count files in current phase:**

```bash
ls -1 .planning/phases/[phase-dir]/*-PLAN.md 2>/dev/null | wc -l
ls -1 .planning/phases/[phase-dir]/*-SUMMARY.md 2>/dev/null | wc -l
ls -1 .planning/phases/[phase-dir]/*-UAT.md 2>/dev/null | wc -l
```

**Check for UAT gaps:**

```bash
grep -l "status: diagnosed" .planning/phases/[phase-dir]/*-UAT.md 2>/dev/null
```

**Route based on state:**

| Condition                       | Route                             |
| ------------------------------- | --------------------------------- |
| uat_with_gaps > 0               | Route E — UAT gaps need fix plans |
| summaries < plans               | Route A — Unexecuted plans exist  |
| summaries = plans AND plans > 0 | Step 7 — Check milestone status   |
| plans = 0                       | Route B — Phase needs planning    |

</process>

<routes>

## Route A: Unexecuted plan exists

Find first PLAN.md without matching SUMMARY.md.

```
## ▶ Next Up

**{phase}-{plan}: [Plan Name]** — [objective]

/gsd-execute-phase {phase}

<sub>/clear first → fresh context window</sub>
```

## Route B: Phase needs planning

**If CONTEXT.md exists:**

```
## ▶ Next Up

**Phase {N}: {Name}** — {Goal}
<sub>✓ Context gathered, ready to plan</sub>

/gsd-plan-phase {phase-number}
```

**If CONTEXT.md does NOT exist:**

```
## ▶ Next Up

**Phase {N}: {Name}** — {Goal}

/gsd-discuss-phase {phase} — gather context and clarify approach

---

**Also available:**
- /gsd-plan-phase {phase} — skip discussion, plan directly
- /gsd-list-phase-assumptions {phase} — see Claude's assumptions
```

## Route C: Phase complete, more phases remain

```
## ✓ Phase {Z} Complete

## ▶ Next Up

**Phase {Z+1}: {Name}** — {Goal}

/gsd-discuss-phase {Z+1}

---

**Also available:**
- /gsd-plan-phase {Z+1} — skip discussion
- /gsd-verify-work {Z} — acceptance test before continuing
```

## Route D: Milestone complete

```
## 🎉 Milestone Complete

All {N} phases finished!

## ▶ Next Up

**Complete Milestone** — archive and prepare for next

/gsd-complete-milestone

---

**Also available:**
- /gsd-verify-work — acceptance test before completing
```

## Route E: UAT gaps need fix plans

```
## ⚠ UAT Gaps Found

**{phase}-UAT.md** has {N} gaps requiring fixes.

/gsd-plan-phase {phase} --gaps

---

**Also available:**
- /gsd-execute-phase {phase} — execute existing plans
- /gsd-verify-work {phase} — run more UAT testing
```

## Route F: Between milestones

```
## ✓ Milestone v{X.Y} Complete

Ready to plan the next milestone.

## ▶ Next Up

**Start Next Milestone** — questioning → research → requirements → roadmap

/gsd-new-milestone
```

</routes>

<step7_milestone_check>
When phase complete (summaries = plans AND plans > 0):

Read ROADMAP.md, identify current and highest phase numbers.

| Condition         | Route                        |
| ----------------- | ---------------------------- |
| current < highest | Route C — More phases remain |
| current = highest | Route D — Milestone complete |

</step7_milestone_check>
