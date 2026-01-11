# CircleCI E2E Tests Configuration

## Overview

This document explains the CircleCI configuration for running E2E tests as an optional second step in the workflow.

## Workflow Structure

The CircleCI configuration now has two main workflows:

### 1. **Main Workflow: `flaky-test-detection`**

- **Required**: Runs on every commit
- **Purpose**: Detects flaky tests using Trunk CLI
- **Jobs**: `install-trunk-cli` → `run-tests-with-trunk` → `detect-flaky-tests`

### 2. **Optional Workflow: `e2e-tests`**

- **Optional**: Runs as a second step (can be triggered manually)
- **Purpose**: Runs end-to-end tests using Playwright
- **Jobs**: `e2e-setup` → `e2e-run-tests`

## E2E Test Workflow Details

### Job 1: `e2e-setup`

**Purpose**: Prepare the environment for E2E testing

**Steps**:

1. **Checkout code**: Get the latest code from repository
2. **Setup dependencies**: Install pnpm and project dependencies
3. **Build application**: Create production build for testing
4. **Persist workspace**: Save build artifacts for next job

**Key Features**:

- Uses cached dependencies when available
- Builds only the game application
- Persists the `.output` directory for E2E testing

### Job 2: `e2e-run-tests`

**Purpose**: Execute Playwright E2E tests

**Steps**:

1. **Checkout code**: Get the latest code
2. **Attach workspace**: Get build artifacts from previous job
3. **Install Playwright browsers**: Set up browser dependencies
4. **Run E2E tests**: Execute tests with JUnit reporting
5. **Store results**: Save test results and artifacts

**Key Features**:

- Uses the simple Playwright configuration for reliability
- Runs with 30-minute timeout to handle slow tests
- Stores JUnit results for test reporting
- Saves HTML reports as artifacts

## How to Run E2E Tests

### Automatic Triggering

The E2E tests are configured to run automatically after the main workflow completes successfully. They use the same filters as the main workflow:

```yaml
filters: *filters
tags:
  only: /.*/
```

### Manual Triggering

You can also trigger E2E tests manually through the CircleCI UI:

1. Go to the CircleCI project page
2. Find the workflow that completed successfully
3. Click "Rerun workflow" → "Rerun from failed"
4. Select the `e2e-tests` workflow

### Environment Variables

No special environment variables are required for E2E tests. The configuration uses:

- **Default timeout**: 30 minutes for test execution
- **Browser setup**: Automatic Playwright browser installation
- **Reporting**: JUnit format for test results

## Configuration Files

### CircleCI Configuration

**File**: `.circleci/config.yml`

The configuration includes:

```yaml
# Optional E2E test workflow (runs after main workflow)
e2e-tests:
  jobs:
    - e2e-setup:
        filters: *filters
    - e2e-run-tests:
        requires:
          - e2e-setup
        filters: *filters
```

### Playwright Configuration

**File**: `apps/game/playwright.simple.config.ts`

Key settings:

- Uses sequential execution (`fullyParallel: false`)
- Single worker (`workers: 1`)
- Increased timeouts for reliability
- JUnit reporting enabled

## Test Results

### Where to Find Results

1. **CircleCI UI**: Test results appear in the job output
2. **Artifacts**: HTML reports and JUnit XML files
3. **Test Summary**: Pass/fail status in workflow overview

### Artifact Locations

- **JUnit Results**: `apps/game/test-results/`
- **HTML Reports**: `apps/game/playwright-report-simple/`
- **Screenshots**: `apps/game/test-results/` (on failure)

## Troubleshooting

### Common Issues

**1. Tests timing out**

- Increase the `no_output_timeout` in the job configuration
- Check for slow server startup or network issues

**2. Browser installation failures**

- Ensure the Docker image has proper permissions
- Check CircleCI resource class (may need larger instance)

**3. Build failures**

- Verify the build step completes successfully
- Check for missing dependencies or build errors

### Debugging Tips

```bash
# Check build logs
cd apps/game
pnpm run build

# Test locally with same configuration
pnpm run test:e2e:simple --reporter=junit,list

# Check Playwright version
npx playwright --version
```

## Best Practices

### 1. Test Stability

- Use the simple configuration for CI runs
- Keep tests focused and independent
- Avoid flaky tests that depend on timing

### 2. Resource Management

- Clean up browser processes after tests
- Use workspace caching to speed up builds
- Monitor resource usage in CircleCI

### 3. Test Maintenance

- Update tests when application behavior changes
- Add new tests for critical user flows
- Remove or fix flaky tests

## Optional Configuration

### Making E2E Tests Truly Optional

To make E2E tests completely optional (only run when explicitly triggered):

```yaml
# Change filters to only run on specific branches or tags
e2e-tests:
  jobs:
    - e2e-setup:
        filters:
          branches:
            only:
              - main
              - /e2e-test-.*/
    - e2e-run-tests:
        requires:
          - e2e-setup
        filters:
          branches:
            only:
              - main
              - /e2e-test-.*/
```

### Parallel Test Execution

For faster test runs (when tests are stable):

```yaml
# In playwright.simple.config.ts
fullyParallel: true
workers: 2 # Adjust based on CircleCI resource class
```

## CircleCI Resource Classes

Recommended resource classes for E2E tests:

- **Small tests**: `medium` (2 vCPUs, 4GB RAM)
- **Medium tests**: `medium+` (2 vCPUs, 8GB RAM)
- **Large test suites**: `large` (4 vCPUs, 8GB RAM)

To specify a resource class:

```yaml
e2e-run-tests:
  resource_class: medium+
  # ... rest of configuration
```

## Summary

The E2E test configuration provides:

✅ **Optional second-step workflow**
✅ **Automatic server management**
✅ **Reliable test execution**
✅ **Comprehensive reporting**
✅ **Artifact storage**

The configuration is designed to be robust and maintainable, with clear separation between the main test workflow and optional E2E tests.
