---
allowed-tools: Bash(*), Read(*), Edit(*)
description: Deploy bull.fm to Cloudflare Pages (bullfm project)
---

# /deploy-bullfm - Deploy bull.fm to Cloudflare Pages

**Purpose:** Build and deploy the bull.fm application to Cloudflare Pages using wrangler CLI.

## One-Command Deployment

```bash
cd /Users/toc/Server/ONE/apps/bull.fm/web && bun run build && wrangler pages deploy dist --project-name=bullfm
```

**What happens:**
1. ✅ Build production bundle with Astro + React 19 edge support
2. ✅ Deploy `/apps/bull.fm/web/dist/` to Cloudflare Pages `bullfm` project
3. ✅ Automatic global CDN distribution
4. ✅ Live URL generated instantly

## Deployment URL

After deployment completes, the site is live at:
- **Primary:** https://bullfm.pages.dev
- **With subdomain:** https://[deployment-hash].bullfm.pages.dev

View all deployments:
```bash
wrangler pages deployment list --project-name=bullfm
```

## Requirements

**Before deploying:**
- ✅ Wrangler CLI installed: `npm install -g wrangler`
- ✅ Cloudflare Global API Key: `$CLOUDFLARE_GLOBAL_API_KEY`
- ✅ Cloudflare Account ID: `$CLOUDFLARE_ACCOUNT_ID`
- ✅ React 19 edge alias configured in `astro.config.mjs`

**Environment Setup:**
```bash
# Root .env must contain:
CLOUDFLARE_GLOBAL_API_KEY=your-api-key
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_EMAIL=your-email@example.com
```

## How It Works

1. **Build Phase:** `bun run build`
   - Compiles Astro + React 19 to static files + edge functions
   - Outputs to `/apps/bull.fm/web/dist/`
   - Time: ~25-30 seconds

2. **Deploy Phase:** `wrangler pages deploy dist --project-name=bullfm`
   - Uploads files to Cloudflare Pages
   - Provisions edge runtime
   - Propagates to 330+ global data centers
   - Time: ~10-15 seconds

3. **Activation Phase:** Auto-live
   - URL immediately accessible
   - Cache warming across regions
   - Real-time analytics enabled

## React 19 + Cloudflare Edge

**Critical Config:** `astro.config.mjs` must have:

```javascript
resolve: {
  alias: {
    'react-dom/server': 'react-dom/server.edge',
  },
}
```

Without this, deployment fails with `MessageChannel is not defined`.

## Troubleshooting

**Authentication Failed**
```bash
# Verify credentials are set:
echo $CLOUDFLARE_GLOBAL_API_KEY
echo $CLOUDFLARE_ACCOUNT_ID
echo $CLOUDFLARE_EMAIL

# Check wrangler auth:
wrangler auth login
```

**Build Errors**
```bash
# Check Astro build:
cd apps/bull.fm/web && bun run check

# View detailed errors:
cd apps/bull.fm/web && bun run build --verbose
```

**Deploy Timeout**
```bash
# Retry deployment:
wrangler pages deploy dist --project-name=bullfm

# Or use direct git integration for auto-deploy on push
```

## Rollback

To rollback to a previous deployment:

```bash
# View deployment history
wrangler pages deployment list --project-name=bullfm

# Promote previous deployment to production
wrangler pages deployments rollback --project-name=bullfm
```

## Performance Metrics

**Typical Deployment:**
- Build time: 25-30s
- Upload time: 10-15s
- Total time: 35-45s
- Files deployed: 600+
- Global rollout: <2 minutes

**Monitoring:**
- View live logs: `wrangler pages tail --project-name=bullfm`
- Check analytics: Cloudflare Dashboard → Pages → bullfm
- Status page: https://www.cloudflarestatus.com

---

**Ready to deploy bull.fm!** 🚀
