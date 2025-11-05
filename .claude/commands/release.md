---
allowed-tools: Task(agent-ops:*)
description: Release CLI to npm
---

# /release - Release CLI to npm

Release the CLI to npm registry.

## Usage

```bash
/release patch   # Bug fix (1.0.0 → 1.0.1)
/release minor   # New feature (1.0.0 → 1.1.0)
/release major   # Breaking change (1.0.0 → 2.0.0)
/release sync    # Sync files without version bump
```

## What It Does

Runs `./.claude/hooks/release-cli.sh [type]` which:

1. Syncs `.claude/*` to `cli/.claude/`
2. Syncs `/one/*` to `cli/one/`
3. Syncs root markdown files (CLAUDE.md, README.md, etc.)
4. Bumps version in `cli/package.json` (if not sync)
5. Builds the CLI
6. Publishes to npm registry

## Your Task

Delegate to agent-ops to run the script:

```typescript
Task({
  subagent_type: "agent-ops",
  description: "Release CLI to npm",
  prompt: `Run: ./.claude/hooks/release-cli.sh ${releaseType}

Wait for completion and report success with the new version.`,
});
```

## After Release

Install the new version:

```bash
npx oneie@latest --version
```
