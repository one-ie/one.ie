# ONE Platform Release Process

**Two-Site Architecture:** oneie/ (production) → web/ (starter template)

---

## Quick Release

```bash
# Simple interactive release (recommended)
./scripts/release-simple.sh patch

# Full release with all steps
./scripts/release.sh patch
```

---

## Two-Site Architecture

| Site | Directory | URL | Status |
|------|-----------|-----|--------|
| **Production** | `oneie/` | https://one.ie | Source of truth |
| **Starter** | `web/` | https://web.one.ie | AUTO-GENERATED |

**Golden Rule:** Edit `oneie/` only. Generate `web/` via `bun run build:starter`.

---

## Release Steps

### 1. Generate Starter Template

```bash
cd oneie
bun run build:starter
```

This runs `scripts/generate-starter.sh` which:
- Copies `oneie/` → `web/`
- Replaces homepage with simple template chooser
- Simplifies Sidebar to 2 items (Stream, License)
- Reduces content (1 blog, 3 products)
- Updates `package.json` name to "oneie-starter"

### 2. Commit Both Repositories

```bash
# Commit production site
cd oneie
git add .
git commit -m "chore: update production site"
git push origin main

# Commit starter template
cd ../web
git add .
git commit -m "chore: regenerate starter template from oneie

⚠️ AUTO-GENERATED. Do not edit directly."
git push origin main
```

### 3. Deploy to Cloudflare

```bash
# Deploy production site
./scripts/deploy-oneie.sh

# Deploy starter template
./scripts/deploy-web.sh
```

---

## Scripts Reference

### release-simple.sh (Recommended)

**Interactive release script with prompts:**

```bash
./scripts/release-simple.sh [version_bump]
```

**Steps:**
1. Generate starter template (`bun run build:starter`)
2. Commit oneie changes
3. Commit web changes (auto-generated)
4. Optional: Version bump in CLI
5. Push to GitHub (with confirmation)
6. Deploy to Cloudflare (with confirmation)

**Features:**
- Interactive prompts for each step
- Clear success/warning/error messages
- Skips empty commits automatically
- Shows deployment URLs at end

### deploy-oneie.sh

**Deploy production site:**

```bash
./scripts/deploy-oneie.sh
```

**Process:**
1. Load credentials from `.env`
2. Build oneie (`bun run build`)
3. Deploy to Cloudflare Pages (project: oneie)
4. Report success → https://one.ie

### deploy-web.sh

**Deploy starter template:**

```bash
./scripts/deploy-web.sh
```

**Process:**
1. Load credentials from `.env`
2. Build web (`bun run build`)
3. Deploy to Cloudflare Pages (project: web)
4. Report success → https://web.one.ie

---

## Environment Requirements

### Local (.env)

```bash
CLOUDFLARE_GLOBAL_API_KEY=your-key
CLOUDFLARE_ACCOUNT_ID=627e0c7ccbe735a4a7cabf91e377bbad
CLOUDFLARE_EMAIL=tony@one.ie
```

### Cloudflare Dashboard

Both projects need these variables set in Cloudflare:

**Production (oneie):**
```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
BETTER_AUTH_URL=https://one.ie
PUBLIC_BACKEND_PROVIDER=one
ORG_NAME=one
ORG_WEBSITE=https://one.ie
ONE_BACKEND=on
```

**Starter (web):**
```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
BETTER_AUTH_URL=https://web.one.ie
PUBLIC_BACKEND_PROVIDER=one
ORG_NAME=one
ORG_WEBSITE=https://web.one.ie
ONE_BACKEND=on
```

---

## Complete Release Workflow

```bash
# 1. Make changes in oneie/
cd oneie
# ... edit files ...

# 2. Generate starter template
bun run build:starter

# 3. Run release script
cd ..
./scripts/release-simple.sh patch

# Follow prompts:
# - Commit oneie? (y)
# - Commit web? (y)
# - Push oneie to GitHub? (y)
# - Push web to GitHub? (y)
# - Deploy oneie to one.ie? (y)
# - Deploy web to web.one.ie? (y)

# Done! Both sites deployed.
```

---

## Troubleshooting

### Authentication Errors

**Problem:** `Authentication error [code: 10000]`

**Solution:**
```bash
# Verify credentials in .env
cat .env | grep CLOUDFLARE

# Use deployment scripts (they handle auth correctly)
./scripts/deploy-oneie.sh
```

### Build Failures

**Problem:** TypeScript or build errors

**Solution:**
```bash
cd oneie  # or cd web
bunx astro check
# Fix errors
bun run build
```

### web/ Not Generated

**Problem:** web/ is empty or outdated

**Solution:**
```bash
cd oneie
bun run build:starter
```

---

## Version History

| Date | Version | Sites | Status |
|------|---------|-------|--------|
| 2025-10-27 | Initial | oneie, web | ✅ Deployed |

---

## Next Steps After Release

1. ✅ Verify both sites are live:
   ```bash
   curl -I https://one.ie | head -1
   curl -I https://web.one.ie | head -1
   ```

2. ✅ Test installation:
   ```bash
   npx oneie@latest --version
   ```

3. ✅ Monitor for errors:
   - Check Cloudflare Pages deployment logs
   - Check browser console on both sites

---

**Deployment Ready!** 🚀
