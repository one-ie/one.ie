# /npx - CLI Release Command

⚡ **Automated ONE CLI Release & Publishing**

_Execute the `./.claude/hooks/release-cli.sh` script to sync documentation, manage versioning, and publish to npm._

## Quick Start

```bash
# Patch release (bug fix)
/npx patch

# Minor release (new features)
/npx minor

# Major release (breaking changes)
/npx major

# Sync files without version bump
/npx sync
```

## What It Does

The `/npx` command runs `./.claude/hooks/release-cli.sh` with the following workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│                  ONE CLI Release Workflow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Verify CLI directory exists                                 │
│  2. Sync .claude/* → cli/.claude/                               │
│  3. Sync /one/* → cli/one/                                      │
│  4. Copy root markdown files (CLAUDE.md, README.md, etc.)       │
│  5. Version bump (patch/minor/major) - optional                 │
│  6. Commit changes to cli/ directory                            │
│  7. Build CLI package                                           │
│  8. Verify npm credentials                                      │
│  9. Publish to npm (oneie@<version>)                            │
│  10. Verify publication on npm registry                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Version Bump Types

| Option | Purpose | Use Case |
|--------|---------|----------|
| `patch` | Bug fixes (v1.2.3 → v1.2.4) | Fix bugs, docs updates |
| `minor` | New features (v1.2.3 → v1.3.0) | New functionality |
| `major` | Breaking changes (v1.2.3 → v2.0.0) | API changes, major refactors |
| `sync` | No version bump | Sync files only, no publish |

## Files Synced

**From root to cli/:**
- `.claude/*` → Full CLI configuration
- `/one/*` → Platform documentation (41 files)
- `CLAUDE.md` → Project instructions
- `README.md` → Platform overview
- `LICENSE.md` → Legal terms
- `SECURITY.md` → Security policy
- `AGENTS.md` → Agent coordination rules

## npm Registry

**Published to:** [npmjs.com/package/oneie](https://www.npmjs.com/package/oneie)

**Install latest:**
```bash
npx oneie@latest --version
```

## Prerequisites

- npm logged in (`npm login`)
- cli/ directory exists with package.json
- Node.js and npm installed
- write access to oneie npm package

---

_Automates ONE CLI synchronization, versioning, and npm publishing_
