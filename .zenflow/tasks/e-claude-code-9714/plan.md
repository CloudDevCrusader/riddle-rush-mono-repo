# Fix bug

## Configuration

- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Investigation and Planning

<!-- chat-id: f519525e-3708-4748-a8e6-8772be70a479 -->

Analyze the bug report and design a solution.

1. Review the bug description, error messages, and logs
2. Clarify reproduction steps with the user if unclear
3. Check existing tests for clues about expected behavior
4. Locate relevant code sections and identify root cause
5. Propose a fix based on the investigation
6. Consider edge cases and potential side effects

Save findings to `{@artifacts_path}/investigation.md` with:

- Bug summary
- Root cause analysis
- Affected components
- Proposed solution

### [x] Step: Implementation

<!-- chat-id: 47ba8f61-146c-4973-a131-34ff75a9fe93 -->

Read `{@artifacts_path}/investigation.md`
Implement the bug fix.

1. Add/adjust regression test(s) that fail before the fix and pass after
2. Implement the fix
3. Run relevant tests
4. Update `{@artifacts_path}/investigation.md` with implementation notes and test results

If blocked or uncertain, ask the user for direction.

### [x] Step: Testing & Verify

Unit & E2E tests

### [x] Step: Make PR mergeable

<!-- chat-id: d9a409a1-c520-4acf-8666-db0d5a691ea4 -->
<!-- agent: claude-code-default -->

I cant create a PR and merge it if the lintting errors or the the typecheck fails
