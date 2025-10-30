# ONE Platform Deployment Guide

**Status:** Production site deployed ✅
**Last Updated:** 2025-10-27

---

## Quick Reference

### Deploy Production Site
```bash
./scripts/deploy-oneie.sh
```
**Result:** https://one.ie

### Deploy Starter Template
```bash
./scripts/deploy-web.sh
```
**Result:** https://web.one.ie

### Deploy Both
```bash
./scripts/deploy-oneie.sh && ./scripts/deploy-web.sh
```

---

## Two-Site Architecture

| Site | Directory | URL | Purpose |
|------|-----------|-----|---------|
| **Production** | `oneie/` | https://one.ie | Full platform (source of truth) |
| **Starter** | `web/` | https://web.one.ie | Auto-generated template |

**Golden Rule:** Edit `oneie/` only. Generate `web/` via `bun run build:starter`.

---

## Prerequisites

### Environment Variables (`.env`)

```bash
CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key
CLOUDFLARE_ACCOUNT_ID=627e0c7ccbe735a4a7cabf91e377bbad
CLOUDFLARE_EMAIL=tony@one.ie
```

### Cloudflare Projects

- **oneie** - Production site project
- **web** - Starter template project

Both projects have environment variables configured in Cloudflare Dashboard.

---

## Deployment Process

### Manual Deployment

**Production Site:**
```bash
cd oneie
bun run build
wrangler pages deploy dist --project-name=oneie --branch=main
```

**Starter Template:**
```bash
cd web
bun run build
wrangler pages deploy dist --project-name=web --branch=main
```

### Using Scripts (Recommended)

The scripts in `/scripts/` automate the entire process:

1. Load credentials from `.env`
2. Navigate to site directory
3. Build production bundle
4. Clear conflicting env vars
5. Export required credentials
6. Deploy via wrangler
7. Report success

---

## Troubleshooting

### Authentication Errors

**Problem:** `Authentication error [code: 10000]`

**Solution:**
```bash
# Ensure credentials are in .env:
cat .env | grep CLOUDFLARE

# Clear conflicting tokens:
unset CLOUDFLARE_API_TOKEN

# Use the deployment scripts:
./scripts/deploy-oneie.sh
```

### Rate Limits

**Problem:** `Too many authentication failures [code: 10502]`

**Solution:** Wait 10 minutes, then retry.

### Build Failures

**Problem:** TypeScript errors during build

**Solution:**
```bash
cd oneie  # or cd web
bunx astro check
# Fix reported errors
bun run build
```

---

## Environment Variables in Cloudflare

Both projects need these variables set in Cloudflare Dashboard:

### Production (oneie)
```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_URL=https://one.ie
BETTER_AUTH_SECRET=your-secret-key
PUBLIC_BACKEND_PROVIDER=one
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
```

### Starter (web)
```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_URL=https://web.one.ie
BETTER_AUTH_SECRET=your-secret-key
PUBLIC_BACKEND_PROVIDER=one
ORG_NAME=one
ORG_WEBSITE=https://web.one.ie
ONE_BACKEND=on
```

---

## Verification

After deployment, verify:

```bash
# Check production site
curl -I https://one.ie | head -1

# Check starter template
curl -I https://web.one.ie | head -1

# Both should return: HTTP/2 200
```

---

## Deployment History

| Date | Site | Version | Status |
|------|------|---------|--------|
| 2025-10-27 | oneie | Initial | ✅ Success |
| 2025-10-27 | web | Pending | ⏳ Ready |

---

## Next Steps

1. ✅ Production site deployed (oneie → one.ie)
2. ⏳ Deploy starter template (web → web.one.ie)
3. 📋 Test complete two-site architecture
4. 🚀 Release to production

---

**Deployment Scripts:**
- `/scripts/deploy-oneie.sh` - Production deployment
- `/scripts/deploy-web.sh` - Starter deployment

**Documentation:**
- `/.claude/commands/deploy.md` - Deploy command reference
- `/.claude/agents/agent-ops.md` - Agent-ops deployment procedures
- `/one/things/plans/2-sites.md` - Two-site architecture plan

---

**Status:** Ready for production deployments! 🚀
