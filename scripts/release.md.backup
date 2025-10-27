# ONE Platform Release Process

**Version**: 2.0.0
**Last Updated**: 2025-10-14

## Overview

This document defines the **exact process** to release ONE Platform across npm, GitHub, and the web. The process is automated via `scripts/release.sh` and ensures all repositories, documentation, and packages stay in sync.

## Repository Architecture

ONE Platform uses a **monorepo development** structure with **distributed deployment**:

```
ONE/ (Development Monorepo)
├── one/                 → one-ie/ontology (Global 6-dimension ontology)
├── <installation-name>/ → NOT released (user-specific customizations)
├── web/                 → one-ie/web (Astro 5 + React 19 frontend)
├── backend/             → one-ie/backend (Convex backend)
├── cli/                 → one-ie/cli (npm: oneie)
└── apps/one/            → one-ie/one (Master assembly repo)
    ├── one/             (synced from /one, includes .claude/)
    └── web/             (git subtree: one-ie/web → prefix web/)
```

**Important:** Installation folders (e.g., `/acme/`, `/tesla/`) are **NOT part of the release**. These are user-specific customizations that override global templates. Only the global `/one/` ontology is released.

## Release Checklist

Before running the release script, verify:

- [ ] All tests pass (`bun test`)
- [ ] Build succeeds (`bun run build` in web/)
- [ ] TypeScript types are valid (`bunx astro check`)
- [ ] Version number updated in `cli/folders.yaml`
- [ ] Changelog updated with release notes
- [ ] No uncommitted changes (or explicitly allow dirty working directory)

## The 13-Step Release Process

### Step 1-3: Push Core Repositories

Push the three core repositories to their dedicated GitHub repos:

```bash
# Step 1: Push ontology documentation
cd one/
git add .
git commit -m "chore: update ontology documentation"
git push origin main  # → one-ie/ontology

# Step 2: Push web frontend
cd ../web/
git add .
git commit -m "feat: update web frontend"
git push origin main  # → one-ie/web

# Step 3: Push backend
cd ../backend/
git add .
git commit -m "feat: update backend services"
git push origin main  # → one-ie/backend
```

**Note**: Each of these directories should have their own `.git` directory linked to their respective GitHub repos.

### Step 4: Sync Documentation via folders.yaml

Use `cli/folders.yaml` configuration to sync:
- `/one` → `cli/one/`
- `/.claude` → `cli/.claude/`
- `/AGENTS.md` → `cli/AGENTS.md`
- `/CLAUDE.md` → `cli/CLAUDE.md`
- `/README.md` → `cli/README.md`
- `/LICENSE.md` → `cli/LICENSE.md`

**Automated by**: `scripts/release.sh` (Steps 2-5)

### Step 5: Update CLI README

The script automatically updates `cli/README.md` to reflect:
- Current version from `cli/package.json`
- Installation instructions
- Quick start guide
- Links to documentation

**Automated by**: `scripts/release.sh` (Step 5)

### Step 6: Commit and Push CLI

Push the updated CLI package to GitHub:

```bash
cd cli/
git add .
git commit -m "chore: release v2.0.0"
git push origin main  # → one-ie/cli
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

**Automated by**: `scripts/release.sh` (Step 9)

### Step 7: Publish to npm

Publish the `oneie` package to npm registry:

```bash
cd cli/
npm publish --access public
```

**Manual step** - requires npm authentication

### Step 8-9: Create apps/one Assembly

The CLI creates the master assembly repository:

```bash
cd apps/one/
mkdir -p one
# Sync files from root into one/ (automated by script)
```

**Automated by**: `scripts/release.sh` (Steps 2-5 — includes syncing `.claude` into `apps/one/one/.claude`)

### Step 10-11: Update Web Subtree & Sync Docs

Keep the `web` frontend tracked as a **git subtree** so `one-ie/one` always ships the latest source without extra clone steps.  
The subtree lives at prefix `web/` and pulls from `main` in `one-ie/web`.

```bash
cd apps/one/

# One-time setup (already handled by script, included here for reference)
git remote add web-subtree https://github.com/one-ie/web.git

# Fetch latest frontend into subtree (squashed history keeps assembly clean)
git subtree pull --prefix=web web-subtree main --squash

# Docs live in the ontology repo; no submodule required
```

**Automated by**: `scripts/release.sh` (Step 6 — subtree sync)

### Step 12: Sync apps/one README

Copy the root `README.md` into the assembly so the master repository always publishes the canonical docs:

```bash
cd apps/one/
cp ../../README.md README.md
```

**TODO**: Add automated copy step to `scripts/release.sh`

### Step 13: Push Master Assembly

Push the complete assembly to GitHub:

```bash
cd apps/one/
git add .
git commit -m "chore: release v2.0.0"
git push origin main  # → one-ie/one
git tag -a v2.0.0 -m "Release v2.0.0"
git push origin v2.0.0
```

**Automated by**: `scripts/release.sh` (Step 9)

## Using the Release Script

### Basic Release (Sync Only)

Sync documentation and configuration without version bump:

```bash
./scripts/release.sh
```

This will:
- Sync `/one` to `cli/one` and `apps/one/one`
- Sync `/.claude` to `cli/.claude` and `apps/one/one/.claude`
- Copy core docs (AGENTS.md, CLAUDE.md, README.md, LICENSE.md)
- Refresh the `web` subtree in `apps/one/`

### Release with Version Bump

```bash
# Patch release (2.0.0 → 2.0.1)
./scripts/release.sh patch

# Minor release (2.0.1 → 2.1.0)
./scripts/release.sh minor

# Major release (2.1.0 → 3.0.0)
./scripts/release.sh major
```

This will:
- Perform all sync operations
- Bump version in `cli/package.json` and `apps/one/package.json`
- Update `cli/folders.yaml` with new version
- Create git tags (if you confirm push)

### Full Release Workflow

```bash
# 1. Prepare release
bun test                    # Run tests
cd web && bun run build     # Test build

# 2. Bump version and sync
cd ..
./scripts/release.sh minor

# 3. Review changes
cd cli && git status
cd ../apps/one && git status

# 4. Publish to npm (manual)
cd ../cli
npm publish

# 5. Verify installation
npx oneie@latest --version

# 6. Deploy web to Cloudflare Pages
cd ../web
wrangler pages deploy dist --project-name=one-platform
```

## Version Management

Version numbers follow **Semantic Versioning** (semver):

- **Major** (X.0.0): Breaking changes, new ontology dimensions, protocol changes
- **Minor** (x.X.0): New features, new entity types, new protocols
- **Patch** (x.x.X): Bug fixes, documentation updates, performance improvements

**Version is stored in:**
- `cli/package.json` (source of truth)
- `cli/folders.yaml` (for documentation)
- `apps/one/package.json` (synced from cli)

## Post-Release Tasks

After running the release script, complete these **manual steps** for **real velocity**:

### Step 12: Publish to npm ⚡️ (2 minutes)

```bash
cd cli
npm login  # If not already logged in
npm publish --access public

# Verify instantly
npx oneie@latest --version  # Should show new version
```

**Why manual?** Safety - prevents accidental publishes.

### Step 13: Deploy to Cloudflare Pages ⚡️ (3 minutes)

```bash
cd web
bun run build
wrangler pages deploy dist --project-name=one-web

# Live in seconds at:
# - Production: https://web.one.ie
# - Preview: https://a7b61736.one-web-eqz.pages.dev
```

**Now automated!** The release script can deploy automatically (with confirmation).

**Manual deployment:**
```bash
cd web && bun run build && wrangler pages deploy dist --project-name=one-web
```

### Optional: Create GitHub Releases 📝 (5 minutes)

For each tagged repository:

```bash
# Use GitHub CLI (fastest)
gh release create v2.0.6 --title "v2.0.6" --notes "Release notes here" --repo one-ie/cli
gh release create v2.0.6 --title "v2.0.6" --notes "Release notes here" --repo one-ie/one

# Or web UI
# Navigate to each repo → Releases → Create new release → Select tag
```

### Test Installation ✅ (2 minutes)

```bash
# Test npx (no install needed)
npx oneie@latest --version
npx oneie@latest init test-project

# Verify structure
cd test-project && ls -la  # Should see: one/, .claude/, CLAUDE.md, etc.
```

### Announce Release 📢 (5 minutes)

- Tweet: "🚀 ONE Platform v2.0.6 released! npx oneie"
- Discord/Slack announcement
- Update one.ie homepage "What's New" section

**Total time for complete release: ~15-20 minutes from start to live** 🚀

## Repository URLs

**GitHub Repositories:**
- **Main**: https://github.com/one-ie/one (master assembly)
- **Ontology**: https://github.com/one-ie/ontology (6-dimension docs)
- **Web**: https://github.com/one-ie/web (Astro frontend)
- **Backend**: https://github.com/one-ie/backend (Convex backend)
- **CLI**: https://github.com/one-ie/cli (npm package)
- **Docs**: https://github.com/one-ie/docs (documentation site)

**npm Package:**
- **Package**: https://www.npmjs.com/package/oneie
- **Install**: `npm install -g oneie` or `npx oneie@latest`

**Live Deployments:**
- **Web**: https://one.ie
- **Docs**: https://docs.one.ie
- **API**: https://api.one.ie

## Rollback Procedure

If a release fails or introduces critical bugs:

### 1. Unpublish from npm (within 24 hours)

```bash
npm unpublish oneie@2.0.1  # Only works within 24 hours
```

### 2. Revert Git Tags

```bash
cd cli/
git tag -d v2.0.1
git push origin :refs/tags/v2.0.1

cd ../apps/one/
git tag -d v2.0.1
git push origin :refs/tags/v2.0.1
```

### 3. Revert Commits

```bash
cd cli/
git revert HEAD
git push origin main

cd ../apps/one/
git revert HEAD
git push origin main
```

### 4. Publish Previous Version

```bash
cd cli/
git checkout v2.0.0
npm publish
```

## Troubleshooting

### "Working directory has uncommitted changes"

The script will prompt if there are uncommitted changes. You can:
- Commit or stash changes first (recommended)
- Continue anyway by typing `y` when prompted

### "cli/ is not a git repository"

The `cli/` directory needs its own git repository:

```bash
cd cli/
git init
git remote add origin https://github.com/one-ie/cli.git
git add .
git commit -m "chore: initialize cli repository"
git push -u origin main
```

### "Web subtree remote missing in apps/one/"

Add the remote and pull the subtree manually:

```bash
cd apps/one/
git remote add web-subtree https://github.com/one-ie/web.git
git subtree add --prefix=web web-subtree main --squash

# On subsequent runs use:
git subtree pull --prefix=web web-subtree main --squash

# Docs are bundled inside the ontology repository; ensure any legacy docs submodule is removed
rm -rf docs
```

### "npm publish fails with 403"

Ensure you're logged in to npm:

```bash
npm login
npm whoami  # Should show your npm username
```

Verify you have permissions to publish to the `oneie` package.

## Architecture Validation

To verify the architecture is correct after release:

```bash
# Test the full flow
npx oneie@latest init test-project
cd test-project

# Verify structure
tree -L 2
# Should show:
# test-project/
# ├── one/                    (ontology & documentation bundle)
# │   ├── AGENTS.md           (Convex patterns)
# │   ├── CLAUDE.md           (AI instructions)
# │   ├── LICENSE.md          (Project license)
# │   ├── README.md           (Ontology overview)
# │   ├── .claude/            (AI agent config)
# │   ├── connections/
# │   ├── events/
# │   └── ... (people, things, knowledge, etc.)
# ├── web/                    (git subtree from one-ie/web)
# ├── README.md               (Assembly quick start)
# └── LICENSE.md              (Assembly license)

# Test web frontend
cd web/
bun install
bun run dev  # Should start on localhost:4321

# Verify ontology docs
cd ../one/
ls -la  # Should see all 6 dimension folders
```

## Release Cadence

**Production Releases:**
- **Major**: Quarterly (when ontology or protocols change)
- **Minor**: Monthly (new features, entity types)
- **Patch**: Weekly or as needed (bug fixes, docs)

**Pre-Release Versions:**
- **Alpha**: `2.1.0-alpha.1` - Internal testing
- **Beta**: `2.1.0-beta.1` - Early access for community
- **RC**: `2.1.0-rc.1` - Release candidate

**Use npm tags:**
```bash
npm publish --tag alpha
npm publish --tag beta
npm publish --tag next  # For RC
npm publish --tag latest  # For stable releases
```

## Emergency Hotfix Process

For critical production bugs:

1. **Create hotfix branch**:
   ```bash
   git checkout -b hotfix/2.0.1 v2.0.0
   ```

2. **Fix the bug** and commit

3. **Run release script**:
   ```bash
   ./scripts/release.sh patch
   ```

4. **Publish immediately**:
   ```bash
   cd cli && npm publish
   ```

5. **Merge back to main**:
   ```bash
   git checkout main
   git merge hotfix/2.0.1
   git push origin main
   ```

## Success Criteria

A release is considered successful when:

### Automated (via scripts/release.sh) ✅
- [x] All repositories pushed to GitHub (one, web, backend, cli, apps/one)
- [x] Git tags created (v2.0.6)
- [x] Documentation synced (one/ → cli/one/ and apps/one/one/)
- [x] Versions bumped (cli/package.json)
- [x] Web subtree pulled to latest commit

### Manual (Steps 12-13) ⏳
- [ ] npm package published and installable via `npx oneie@latest`
- [ ] `npx oneie init` creates correct directory structure
- [ ] Web frontend deployed to Cloudflare Pages (https://one.ie)
- [ ] GitHub releases created for tagged repos (optional)
- [ ] No critical bugs reported within 24 hours

**Total Release Time: ~15-20 minutes** (10 min automated + 5-10 min manual)

## License

Copyright © 2025 ONE 
Licensed under the ONE FREE License
See LICENSE.md for details
