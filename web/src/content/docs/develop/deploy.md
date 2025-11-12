---
title: Deployment Guide
description: Deploy your ONE Platform application to Cloudflare Pages
---

# Deployment Guide

This guide covers deploying your ONE Platform application to Cloudflare Pages.

## Prerequisites

- GitHub repository connected to Cloudflare Pages
- Cloudflare account with Pages access
- Node.js 22+ and Bun installed locally

## Quick Start

The ONE Platform is configured for automatic deployment to Cloudflare Pages:

1. Push to the `main` branch
2. Cloudflare automatically builds and deploys
3. Your site goes live at `https://web.one.ie`

## Cloudflare Pages Configuration

### Build Settings

**Framework preset:** None (custom monorepo)

**Build command:**
```bash
bun run build
```

**Build output directory:**
```
web/dist
```

**Root directory:**
```
/
```

### Environment Variables

Set these in Cloudflare Pages dashboard → Settings → Environment variables:

**Required for Convex:**
- `CONVEX_URL` - Your Convex deployment URL
- `CONVEX_DEPLOY_KEY` - Convex deployment key (production)

**Required for Authentication:**
- `BETTER_AUTH_SECRET` - Random secret for session encryption
- `BETTER_AUTH_URL` - Your production URL (https://web.one.ie)

**Required for Stripe (if using payments):**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**Required for AI Features (if enabled):**
- `OPENAI_API_KEY` - OpenAI API key

### Node.js Version

The repository includes a `.node-version` file that specifies Node.js 22:

```
22
```

Cloudflare Pages automatically uses this version.

## Monorepo Structure

The ONE Platform uses a monorepo structure:

```
ONE/
├── package.json          # Root config (defines web workspace)
├── .node-version         # Node.js 22
├── web/                  # Frontend application
│   ├── package.json      # Web dependencies
│   ├── bun.lockb         # Bun lock file
│   └── dist/             # Build output (generated)
├── backend/              # Convex backend
└── scripts/
    └── pre-deployment-check.sh  # Local validation
```

### How It Works

1. **Root `package.json`** defines the workspace and build script
2. **Build command** runs `bun run build`
3. **Build script** executes `cd web && bun install && bun run build`
4. **Output** is in `web/dist`

## Pre-Deployment Validation

Run the pre-deployment check locally before pushing:

```bash
./scripts/pre-deployment-check.sh
```

This script:
1. ✅ Checks `package-lock.json` sync (if using npm)
2. ✅ Runs TypeScript type checking
3. ✅ Builds production bundle
4. ✅ Reports any errors

**Always run this before deploying!**

## Manual Deployment

### Using Wrangler CLI

Deploy directly from your local machine:

```bash
cd web
bun run build
wrangler pages deploy dist
```

### Using Cloudflare Dashboard

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Click "Create deployment"
4. Select branch and deploy

## Deployment Workflow

### Development Branch

```bash
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: Add new feature"
git push origin feature/my-feature
```

Create a pull request. Cloudflare creates a preview deployment automatically.

### Production Deployment

```bash
git checkout main
git merge feature/my-feature
git push origin main
```

Cloudflare automatically deploys to production.

## Troubleshooting

### Build Fails: Package Lock Sync Error

**Error:**
```
npm ci` can only install packages when your package.json
and package-lock.json are in sync
```

**Solution:**
Ensure build command uses `bun install` (not `npm ci`):
```bash
bun run build
```

### Build Fails: Missing Dependencies

**Error:**
```
Cannot find module '@xyflow/react'
```

**Solution:**
1. Run pre-deployment check locally
2. Install missing dependencies: `cd web && bun install`
3. Commit `bun.lockb` changes
4. Push to trigger new build

### Build Succeeds But Site Doesn't Work

**Check:**
1. Environment variables are set correctly
2. Convex is deployed: `cd backend && npx convex deploy`
3. Database schema is up to date
4. API keys are valid (not expired)

### Deployment is Slow

**Optimization:**
1. Enable build cache in Cloudflare
2. Use bun (not npm) for faster installs
3. Minimize dependencies
4. Use production builds only

## Build Output

A successful build creates:

```
web/dist/
├── _astro/           # Optimized assets (JS, CSS)
├── images/           # Optimized images
├── index.html        # Home page
├── chat/
│   └── index.html   # Chat page
└── ...              # Other pages
```

## Performance

The ONE Platform is optimized for Cloudflare Pages:

- **Static HTML** - Pre-rendered pages
- **Edge caching** - Fast global delivery
- **Astro Islands** - Minimal JavaScript
- **Image optimization** - WebP with lazy loading
- **Code splitting** - Dynamic imports

**Typical metrics:**
- Lighthouse score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s

## CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Run pre-deployment check
        run: ./scripts/pre-deployment-check.sh

      - name: Deploy to Cloudflare
        run: |
          cd web
          bun run build
          npx wrangler pages deploy dist
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Rollback

To rollback a deployment:

1. Go to Cloudflare Pages dashboard
2. Click "View build"
3. Select a previous successful deployment
4. Click "Rollback to this deployment"

Or via CLI:

```bash
wrangler pages deployment list
wrangler pages deployment tail <deployment-id>
```

## Monitoring

### Cloudflare Analytics

Track:
- Page views
- Requests per second
- Bandwidth usage
- Geographic distribution

### Convex Dashboard

Monitor:
- Database queries
- Function executions
- Real-time connections
- Error rates

### Custom Logging

Add logging to your app:

```typescript
// Log to Convex
await ctx.runMutation(api.mutations.events.create, {
  type: "deployment",
  data: { version: "1.0.0", timestamp: Date.now() }
});
```

## Security

### Environment Secrets

**Never commit:**
- API keys
- Database credentials
- Webhook secrets
- Auth tokens

**Always use Cloudflare environment variables!**

### Content Security Policy

Add to `astro.config.mjs`:

```javascript
export default defineConfig({
  vite: {
    server: {
      headers: {
        'Content-Security-Policy': "default-src 'self'"
      }
    }
  }
});
```

## Support

**Issues:**
- Check Cloudflare build logs
- Run pre-deployment check locally
- Verify environment variables
- Check Convex deployment status

**Resources:**
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Convex Docs](https://docs.convex.dev/)
- [Astro Docs](https://docs.astro.build/)

---

**Next:** [Stripe Integration](/docs/develop/stripe) | [Video Player](/docs/develop/videos)
