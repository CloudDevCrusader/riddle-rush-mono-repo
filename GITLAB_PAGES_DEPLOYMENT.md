# GitLab Pages Deployment Guide

This guide explains how to deploy the Guess Game PWA to GitLab Pages with automated testing and coverage reports.

## Prerequisites

1. A GitLab repository with this project
2. PWA icons generated (pwa-192x192.png and pwa-512x512.png in the public/ directory)
3. All tests passing locally

## Setup

### 1. Generate PWA Icons

Before deploying, you need to generate the PWA icons referenced in `nuxt.config.ts`:

- `public/pwa-192x192.png` (192x192 pixels)
- `public/pwa-512x512.png` (512x512 pixels)

You can use the `public/pwa-icon-template.svg` as a starting point or use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### 2. Configure Environment Variables

#### Base URL (Optional)

If your GitLab Pages site is deployed to a subdirectory (e.g., `https://username.gitlab.io/project-name/`), you need to set the BASE_URL:

1. Go to your GitLab project: Settings > CI/CD > Variables
2. Add a new variable:
   - Key: `BASE_URL`
   - Value: `/project-name/` (replace with your actual project name)
   - Make sure it starts and ends with `/`

If deploying to a root domain (e.g., `https://username.gitlab.io/`), no configuration is needed.

#### Google Analytics (Optional)

To enable Google Analytics tracking:

1. Go to your GitLab project: Settings > CI/CD > Variables
2. Add a new variable:
   - Key: `GOOGLE_ANALYTICS_ID`
   - Value: `G-XXXXXXXXXX` (your GA4 Measurement ID)
   - Masked: Yes (recommended)

See [ANALYTICS.md](./ANALYTICS.md) for detailed setup instructions.

### 3. Push to GitLab

The `.gitlab-ci.yml` file is already configured. Simply push your code to the `main` or `master` branch:

```bash
git add .
git commit -m "Add GitLab Pages deployment"
git push origin main
```

### 4. Monitor Deployment

1. Go to your project in GitLab
2. Navigate to CI/CD > Pipelines
3. Watch the pipeline run through the build and deploy stages
4. Once complete, go to Settings > Pages to see your deployed URL

## Testing Locally

Before pushing, ensure all tests pass locally:

```bash
# Install dependencies
npm install

# Run unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit:coverage

# Run e2e tests (requires dev server)
npm run test:e2e

# View test coverage report
open coverage/index.html
```

## Pipeline Details

The GitLab CI pipeline consists of four stages:

### Test Stage
The pipeline runs two test jobs in parallel:

#### Unit Tests (`test:unit`)
- Runs Vitest unit tests with coverage
- Generates coverage reports in multiple formats (text, JSON, HTML, LCOV, Cobertura)
- Coverage thresholds set at 80% for lines, functions, branches, and statements
- Coverage report is integrated into GitLab's coverage visualization
- Artifacts expire in 30 days

#### E2E Tests (`test:e2e`)
- Installs Playwright and Chromium browser
- Generates the production build
- Runs end-to-end tests using Playwright
- Tests both desktop (Chrome) and mobile (Pixel 5) viewports
- Includes comprehensive smoke tests for critical functionality
- Captures screenshots on failure
- Generates HTML and JSON reports
- Artifacts expire in 30 days

**Smoke Tests Included:**
- Homepage loads successfully
- PWA manifest is accessible
- Service worker registers correctly
- Critical assets load without errors
- Responsive on mobile devices
- No critical console errors
- Offline functionality works
- Page load performance is acceptable

### Build Stage
- Only runs if all tests pass
- Installs dependencies using `npm ci`
- Runs `npm run generate` to create the static site
- Outputs to `.output/public` directory

### Deploy Stage
- Only runs if build succeeds
- Copies the built files to the `public` directory (required by GitLab Pages)
- Includes test coverage and e2e reports at `/test-reports/`
- Deploys the site to GitLab Pages

## Viewing Test Reports

After deployment, you can view test reports at:
- Coverage report: `https://your-pages-url/test-reports/coverage/`
- E2E test report: `https://your-pages-url/test-reports/playwright-report/`

You can also view them in GitLab:
1. Go to your project in GitLab
2. Navigate to CI/CD > Pipelines
3. Click on the pipeline
4. Click on the test job
5. Browse the artifacts or view coverage tab

## Testing the PWA

After deployment:

1. Visit your GitLab Pages URL
2. Open in a supported browser (Chrome, Edge, Safari, Firefox)
3. Look for the install prompt or use the browser menu to install the PWA
4. The app should work offline thanks to the service worker

## Writing Tests

### Unit Tests
Place unit tests in `tests/unit/` with the naming pattern `*.spec.ts` or `*.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('MyComponent', () => {
  it('should work correctly', () => {
    expect(true).toBe(true)
  })
})
```

### E2E Tests
Place e2e tests in `tests/e2e/` with the naming pattern `*.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Guess Game/)
})
```

## Troubleshooting

### Tests failing in CI but passing locally
- Ensure you're using the same Node.js version (20) as the CI
- Check that all dependencies are properly listed in package.json
- Review CI logs for specific error messages

### Coverage thresholds not met
- Current thresholds are set to 80% for all metrics
- Add more unit tests to increase coverage
- View coverage report to see uncovered lines

### Icons not loading
- Ensure `pwa-192x192.png` and `pwa-512x512.png` exist in the `public/` directory
- Check browser console for 404 errors

### Routes not working
- Verify the BASE_URL environment variable is set correctly with leading and trailing slashes
- Check that the manifest start_url matches your base URL

### PWA not installable
- Ensure the site is served over HTTPS (GitLab Pages provides this automatically)
- Check that the manifest.json is accessible at `https://your-site/manifest.webmanifest`
- Verify icons are properly sized and accessible

### Service Worker issues
- Clear browser cache and service workers
- Check Application tab in DevTools > Service Workers
- Verify the service worker is registered and activated

## Local Testing

To test the production build locally:

```bash
npm run generate
npm run preview
```

This will build and serve the static site at http://localhost:3000
