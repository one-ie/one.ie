---
title: Developing the CLI
description: Learn how to develop and test the ONE CLI locally using the fastest workflow with npm link and watch mode for instant feedback.
section: Develop Platform
order: 10
tags:
  - cli
  - development
  - testing
  - npm-link
  - workflow
---

# Developing the CLI

Learn how to develop and test the ONE CLI locally without publishing to npm.

## 🚀 Fastest Workflow (Recommended)

This workflow gives you **instant feedback** as you make changes to the CLI.

### Initial Setup (One Time)

```bash
# 1. Navigate to CLI directory
cd cli/

# 2. Install dependencies
npm install

# 3. Create global symlink
npm link
```

This creates a global symlink so `oneie` runs your local version from anywhere.

### Development Loop

**Terminal 1: Watch Mode** (auto-recompile on changes)

```bash
cd cli/
npm run dev
```

This runs TypeScript in watch mode (`tsc --watch`). Every time you save a file in `cli/src/`, it automatically recompiles to `cli/dist/`.

**Terminal 2: Test Your Changes**

```bash
# Create a test directory
mkdir -p /tmp/test-oneie
cd /tmp/test-oneie

# Run your local CLI
oneie

# Inspect what was created
ls -la
cat .onboarding.json
tree one/
```

**Make changes to `cli/src/` → Save → Test immediately in Terminal 2!**

### Why This Works

1. `npm link` creates a global symlink to your local CLI
2. `npm run dev` watches for file changes and auto-compiles
3. Running `oneie` anywhere uses your latest compiled code
4. No need to rebuild or re-link after each change

## 🐛 Debugging Tips

### Check What Version Is Running

```bash
# Find the executable path
which oneie

# Check if it's linked
npm list -g oneie

# See the linked location
ls -la $(which oneie)
```

### Changes Not Reflected?

If your changes aren't showing up:

```bash
cd cli/

# Force rebuild
npm run build

# Unlink and re-link
npm unlink
npm link

# Verify it worked
which oneie
```

### Clean Slate Testing

```bash
# Create temporary test directory
rm -rf /tmp/test-oneie
mkdir -p /tmp/test-oneie
cd /tmp/test-oneie

# Run CLI
oneie

# Inspect results
tree -L 2
cat .onboarding.json
cat .env.local
```

## 📦 Verify File Bundling

Since the CLI bundles platform files (`/one/*`, `/.claude/*`, docs), verify they're included:

```bash
cd cli/

# Create package tarball
npm pack

# List contents
tar -tzf oneie-3.6.24.tgz | head -20

# Check for specific directories
tar -tzf oneie-3.6.24.tgz | grep "one/"
tar -tzf oneie-3.6.24.tgz | grep ".claude/"
tar -tzf oneie-3.6.24.tgz | grep "CLAUDE.md"

# Extract and inspect
tar -xzf oneie-3.6.24.tgz
tree package/
```

All files listed in `package.json` `"files"` array should be present.

## ⚡ Quick Test Script

Create `cli/test.sh` for automated testing:

```bash
#!/bin/bash
set -e

echo "🔨 Building CLI..."
npm run build

echo "🔗 Linking globally..."
npm link

echo "🧪 Testing in /tmp/oneie-test..."
rm -rf /tmp/oneie-test
mkdir -p /tmp/oneie-test
cd /tmp/oneie-test

# Run CLI (will prompt for input)
oneie

echo "✅ Test complete! Check /tmp/oneie-test for results"
ls -la
tree -L 2
```

Make it executable and run:

```bash
chmod +x cli/test.sh
./cli/test.sh
```

## 🎯 Development Workflow Summary

**The absolute fastest workflow:**

```bash
# Terminal 1: Keep running (auto-compiles on save)
cd cli/
npm run dev

# Terminal 2: Test quickly
cd /tmp/test-oneie-1/
oneie

# Make changes in your editor
# → Save files
# → Watch mode auto-compiles
# → Test again immediately!

cd /tmp/test-oneie-2/
oneie
```

No manual rebuild. No re-linking. Just save and test.

## 📝 CLI Architecture Reference

### Package Structure

- **Entry point:** `cli/dist/index.js` (compiled from `src/index.ts`)
- **Commands:** `cli/src/commands/init.ts` (interactive onboarding)
- **Utils:** `cli/src/utils/` (installation, validation, Claude launch)
- **Bundled files:** `/one/*`, `/.claude/*`, root docs

### What `npx oneie` Does

1. **Collects info** (name, org, website)
2. **Syncs platform files** (`/one/`, `/.claude/`, docs)
3. **Creates installation folder** (`/<org-slug>/`)
4. **Configures environment** (`.env.local`, `.gitignore`)
5. **Clones web template** (optional)
6. **Launches Claude Code** (ready to build!)

### Key Files

- `cli/src/index.ts` - Entry point, command routing
- `cli/src/commands/init.ts` - Interactive onboarding
- `cli/src/utils/installation-setup.ts` - Folder creation, syncing
- `cli/src/utils/validation.ts` - Input validation
- `cli/src/utils/launch-claude.ts` - Claude integration
- `cli/package.json` - npm package config (published as `oneie`)

## 🚢 Release Integration

The CLI is part of the automated release pipeline:

```bash
# From root directory
/release patch   # Bumps version and publishes to npm
/release minor   # New features
/release major   # Breaking changes
```

This automatically:
- Syncs files from root to `cli/`
- Bumps version in `cli/package.json`
- Commits and pushes to `github.com/one-ie/cli`
- Publishes to npm as `oneie@<version>`

**Live at:** https://www.npmjs.com/package/oneie

## 🎓 Best Practices

### 1. Always Use Watch Mode

```bash
npm run dev
```

Saves you from manual rebuilds. Changes are instant.

### 2. Test in Clean Directories

```bash
/tmp/test-oneie-1/
/tmp/test-oneie-2/
/tmp/test-oneie-3/
```

Each test gets a fresh environment. No cached state.

### 3. Verify Bundled Files

Before publishing, always check:

```bash
npm pack
tar -tzf oneie-*.tgz | grep "one/knowledge"
tar -tzf oneie-*.tgz | grep ".claude/agents"
```

Missing files = broken CLI for users.

### 4. Test the Full Flow

Don't just test code changes. Test the user experience:

1. Run `oneie`
2. Answer prompts
3. Check all files created
4. Verify Claude launches correctly
5. Test with web template (optional flow)

## 🔗 Related Documentation

- [CLI Source Code](https://github.com/one-ie/cli) - View on GitHub
- [npm Package](https://www.npmjs.com/package/oneie) - Published package
- [Release Process](/docs/platform-develop/release-process) - Automated releases

## 💡 Troubleshooting

### "command not found: oneie"

```bash
# Check if linked
npm list -g oneie

# Re-link if needed
cd cli/
npm link
```

### Changes Not Showing

```bash
# Check watch mode is running
cd cli/
npm run dev

# Force rebuild
npm run build
```

### Wrong Version Running

```bash
# Check which oneie is being used
which oneie

# Should point to your local directory
# /Users/yourname/path/to/ONE/cli/dist/index.js

# If not, unlink global and re-link
npm unlink -g oneie
cd cli/
npm link
```

---

**Built for speed. Optimized for iteration. Ready to ship.**
