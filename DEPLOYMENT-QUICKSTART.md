# 🚀 Vercel Deployment Quick Start

## Initial Setup (One-time)

1. **Run the setup script:**

   ```bash
   ./scripts/setup-vercel.sh
   ```

2. **Configure GitHub Secrets:**
   - Go to: GitHub → Settings → Secrets and variables → Actions
   - Add the secrets shown by the setup script

3. **Configure Vercel Environment Variables:**
   - Go to: [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables
   - Add variables for each environment (production/development)

## Deployment Commands

### Automatic (via GitHub)

```bash
# Deploy to development
git push origin development

# Deploy to production
git push origin main

# Create preview for PR
git push origin feature/your-feature
```

### Manual (via CLI)

```bash
# Deploy to development
pnpm run deploy:vercel:dev

# Deploy to production
pnpm run deploy:vercel:prod

# Pull environment variables
pnpm run vercel:env:pull
```

## Environment Configuration

### Production (main branch)

- URL: https://riddle-rush.vercel.app
- STAGE: production
- Features: Analytics ✅, PWA ✅, Debug ❌

### Development (development branch)

- URL: https://riddle-rush-dev.vercel.app
- STAGE: development
- Features: Analytics ❌, PWA ❌, Debug ✅

## Monitoring

- **GitHub Actions:** Check deployment status in Actions tab
- **Vercel Dashboard:** View deployments, logs, and analytics
- **CLI:** `vercel ls` to list recent deployments

## Troubleshooting

If deployment fails:

1. Check GitHub Actions logs
2. Verify environment variables in Vercel
3. Run `pnpm run workspace:check` locally
4. Check `vercel logs` for detailed errors

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)
- Project Guide: `docs/VERCEL-DEPLOYMENT.md`
