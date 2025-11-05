---
allowed-tools: Task(agent-ops:*)
description: Release CLI to npm via release-cli.sh script
---

# /release - Release CLI to npm

**Purpose:** Execute CLI release to npm using the dedicated `release-cli.sh` script.

## Quick Usage

```bash
/release patch      # Patch release (bug fixes) - 1.0.0 → 1.0.1
/release minor      # Minor release (features) - 1.0.0 → 1.1.0
/release major      # Major release (breaking) - 1.0.0 → 2.0.0
```

## How It Works

The `/release` command delegates to `agent-ops` specialist to run:

```bash
/Users/toc/Server/ONE/scripts/release-cli.sh [patch|minor|major]
```

This script handles:
1. Version bump in `cli/package.json`
2. npm publish to registry
3. Git tag creation
4. Verification

## Your Task

When user runs `/release [type]`, delegate to agent-ops:

```typescript
Task({
  subagent_type: "agent-ops",
  description: "Release CLI to npm",
  prompt: `Execute ${releaseType} release:

1. Run: /Users/toc/Server/ONE/scripts/release-cli.sh ${releaseType}
2. Wait for script to complete
3. Verify: npm view oneie version
4. Report new version to user

The script will:
- Bump version in cli/package.json
- Commit and push to GitHub
- Create git tag
- Publish to npm registry

Report:
✅ Version X.X.X released to npm
📦 Install: npm install -g oneie@X.X.X
🔗 npm: https://www.npmjs.com/package/oneie`,
});
```

## Release Types

- **patch** - Bug fixes, minor updates (1.0.0 → 1.0.1)
- **minor** - New features (1.0.0 → 1.1.0)
- **major** - Breaking changes (1.0.0 → 2.0.0)

## Prerequisites

Before running `/release`, ensure:

- ✅ All changes are committed
- ✅ Logged in to npm: `npm whoami`
- ✅ You're in the ONE root directory
- ✅ release-cli.sh script exists

## Example

**User:** `/release minor`

**Claude:**
1. Delegates to agent-ops
2. agent-ops runs: `/Users/toc/Server/ONE/scripts/release-cli.sh minor`
3. Script bumps version: 1.2.0 → 1.3.0
4. Publishes to npm
5. Reports: ✅ Version 1.3.0 released

## After Release

Users can install the new version:

```bash
npm install -g oneie@latest
# or
npx oneie@latest --version
```

---

**Simple, fast CLI releases to npm! 🚀**
