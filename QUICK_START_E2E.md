# Quick Start: E2E Testing

## Setup (One-time)

### 1. Install Playwright Browsers
```bash
npx playwright install chromium firefox
```

On Linux, you may need to install dependencies:
```bash
npx playwright install-deps
```

## Running Tests

### Test Locally (Easiest)
```bash
npm run test:e2e:local
```
This builds and tests the app automatically.

### Test Production Deployment
```bash
npm run test:e2e:production
```

### Test with UI (Interactive)
```bash
npm run test:e2e:ui
```

### Watch Mode (During Development)
```bash
npm run test:e2e:headed
```

## In GitLab CI

E2E tests **run automatically** after each deployment:
- **Main branch** → Tests production site
- **Staging branch** → Tests staging site
- **Development branch** → Tests dev site

### View Results
1. Go to: **CI/CD → Pipelines**
2. Click on your pipeline
3. Go to the **verify** stage
4. Click on the job to see results
5. Download artifacts to view the HTML report

## Troubleshooting

### "Executable doesn't exist" error
```bash
npx playwright install
```

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Tests timeout
The deployed site might be slow. Tests automatically retry 2 times in CI.

## What's Tested

✅ Home page loads
✅ Categories display
✅ Game can start
✅ PWA manifest exists
✅ Service worker registers
✅ Offline functionality
✅ Accessibility basics

For full documentation, see [E2E_TESTING.md](./E2E_TESTING.md)
