# Setup apps/oneie Repository

Quick guide to set up the `apps/oneie` repository for deployment to one.ie.

## Quick Start

```bash
# Make script executable
chmod +x scripts/setup-oneie.sh

# Run setup
./scripts/setup-oneie.sh
```

This will:
1. ✅ Create `apps/oneie` directory
2. ✅ Initialize git repository
3. ✅ Set remote to `one-ie/oneie`
4. ✅ Sync `one/`, `.claude/`, and `web/` directories
5. ✅ Copy `web/.env.main` → `apps/oneie/web/.env.local`
6. ✅ Copy documentation files
7. ✅ Create initial commit
8. ✅ Push to GitHub (with confirmation)

## Manual Setup (if script fails)

```bash
# 1. Create directory
mkdir -p apps/oneie

# 2. Initialize git
cd apps/oneie
git init
git remote add origin https://github.com/one-ie/oneie.git

# 3. Create structure
cd ..
mkdir -p apps/oneie/one
mkdir -p apps/oneie/one/.claude
mkdir -p apps/oneie/web

# 4. Sync files
rsync -av --delete --exclude='.git' one/ apps/oneie/one/
rsync -av --delete .claude/ apps/oneie/one/.claude/
rsync -av --delete --exclude='node_modules' --exclude='dist' --exclude='.env' web/ apps/oneie/web/

# 5. Copy environment
cp web/.env.main apps/oneie/web/.env.local

# 6. Copy docs
cp CLAUDE.md README.md LICENSE.md SECURITY.md apps/oneie/one/
cp web/AGENTS.md apps/oneie/one/AGENTS.md

# 7. Commit and push
cd apps/oneie
git add -A
git commit -m "chore: initialize oneie repository"
git push -u origin main
```

## Verify Setup

```bash
# Check repository
cd apps/oneie
git remote -v
# Should show: origin  https://github.com/one-ie/oneie.git

# Check structure
tree -L 2
# Should show:
# .
# ├── one/
# │   ├── .claude/
# │   ├── connections/
# │   ├── events/
# │   └── ...
# └── web/
#     ├── src/
#     ├── public/
#     └── ...
```

## Using with Release Script

After setup, use the release script to deploy:

```bash
# Deploy main site only (oneie → one.ie)
./scripts/release.sh patch main

# Deploy both sites (oneie + one)
./scripts/release.sh patch
```

The release script will:
- Auto-create `apps/oneie` if it doesn't exist
- Sync all files from root to `apps/oneie`
- Copy `web/.env.main` → `apps/oneie/web/.env.local`
- Commit and push to `one-ie/oneie`
- Build and deploy to Cloudflare Pages (oneie project → one.ie)

## Repository Structure

```
apps/oneie/                       # Main site repository
├── one/                          # Documentation + ontology
│   ├── .claude/                  # Claude Code config
│   ├── connections/              # Ontology connections
│   ├── events/                   # Event documentation
│   ├── knowledge/                # Knowledge base
│   ├── people/                   # People/roles
│   ├── things/                   # Entity types
│   ├── CLAUDE.md                 # Claude instructions
│   ├── README.md                 # Documentation
│   ├── LICENSE.md                # License
│   ├── SECURITY.md               # Security policy
│   └── AGENTS.md                 # Agent documentation
└── web/                          # Astro + React frontend
    ├── src/                      # Source code
    ├── public/                   # Static assets
    ├── .env.local                # Environment (from .env.main)
    └── ...
```

## Deployment Flow

```
/web (development)
  ↓
  [rsync]
  ↓
apps/oneie/web + .env.main
  ↓
  [git push]
  ↓
one-ie/oneie (GitHub)
  ↓
  [Cloudflare Pages]
  ↓
one.ie (production)
```

## Troubleshooting

### "Remote already exists"
```bash
cd apps/oneie
git remote set-url origin https://github.com/one-ie/oneie.git
```

### "Directory not empty"
```bash
rm -rf apps/oneie
./scripts/setup-oneie.sh
```

### "Permission denied"
```bash
chmod +x scripts/setup-oneie.sh
```

### Check what's different
```bash
cd apps/oneie
git status
git diff
```

## Next Steps

1. **Verify repository:** `cd apps/oneie && git remote -v`
2. **Create Cloudflare Pages project** (manual):
   - Dashboard: https://dash.cloudflare.com/[account]/pages
   - Connect to: `one-ie/oneie`
   - Domain: `one.ie`
3. **Test deployment:** `./scripts/release.sh patch main`
4. **Monitor:** Check Cloudflare Pages deployment logs

## Related Files

- **Setup script:** `scripts/setup-oneie.sh`
- **Release script:** `scripts/release.sh`
- **Release docs:** `.claude/commands/release.md`
- **Agent docs:** `.claude/agents/agent-ops.md`
- **Main env:** `web/.env.main`
- **Demo env:** `web/.env.demo`

---

**Ready to deploy!** 🚀
