---
title: Tracking
description: Understand how to track changes to your custom instance and manage upgrades with the automatic change tracking hook.
section: Develop
order: 6
tags:
  - customizations
  - tracking
  - upgrades
  - development
---

# Tracking Your Customizations

When you clone ONE Platform and customize it for your own use case, the automatic change tracking hook helps you understand exactly what you've changed and manage future upgrades.

## How It Works

Every commit is automatically logged to `one/events/0-changes.md` with:
- **Commit hash** - Git reference for reverting if needed
- **File paths** - Exact files you changed (most important!)
- **Template vs Custom** - Clear separation of what's yours
- **Commit message** - Your description of the change

## Change Tracking Log

The hook categorizes all files into two groups:

### Template Directories (Same in Every Clone)

These are the core platform directories that receive updates:

- `/web` - Your web application template
- `/one` - Platform documentation
- `/.claude` - Hooks, agents, and CLI tools

### Your Custom Directories

Everything outside the template directories is considered your customization:

- `/my-site/` - Your custom marketing site (or any other name)
- `/client-app/` - Your custom application
- `/custom/` - Any other directory you create
- `/one.ie/` - Known example custom directory

## Example Tracking Log

### Template-Only Changes

```
### abc12345 — template:2 — `Add new component library`

**Template:**
  - web/src/components/FormFields.tsx
  - web/src/components/FormFields.stories.tsx
```

This shows a template update that affects your customizations (you may need to merge).

### Your Customizations

```
### def67890 — custom:5 [customization] — `Update marketing site styling`

**Your Changes:**
  - my-site/src/pages/home.astro
  - my-site/src/styles/brand.css
  - my-site/content/blog/latest-post.md
  - my-site/src/components/Header.tsx
  - my-site/.env.local
```

This shows changes only to your custom directories.

### Mixed Changes (Template + Your Changes)

```
### ghi11111 — template:1 | custom:3 [customization] — `Sync template + update site`

**Template:**
  - web/src/lib/auth.ts

**Your Changes:**
  - my-site/src/pages/login.astro
  - my-site/src/styles/forms.css
  - my-site/config.json
```

This shows you synced a template update AND made your own changes. Perfect for coordinating with upgrades.

## Use Cases

### 1. Exporting All Your Customizations

Filter the tracking log for `[customization]` entries to get a list of all files you've modified:

```bash
# Quick overview of all your changes
grep "\[customization\]" one/events/0-changes.md

# Extract just your changed files
grep -A 20 "\[customization\]" one/events/0-changes.md | grep "  - "
```

Perfect for:
- Documentation
- Code reviews
- Handing off to another developer
- Creating a patch file for other instances

### 2. Managing Upgrades

When the template updates, the tracking log shows exactly what changed:

**Scenario:** Template updates `web/src/components/Button.tsx`

```
### new12345 — template:1 — `Fix Button accessibility`

**Template:**
  - web/src/components/Button.tsx
```

Now you know:
- Which files to review in the upgrade
- Whether your custom components extend or override them
- If conflicts will occur in merge

### 3. Diffing Your Instance from Template

```bash
# See your latest customizations
head -20 one/events/0-changes.md

# Find when you last synced template
grep "template:" one/events/0-changes.md | head -5

# Understand your divergence
wc -l <(grep "\[customization\]" one/events/0-changes.md)
```

### 4. Documenting Changes for Stakeholders

Extract your changes for a deployment report:

```bash
#!/bin/bash
echo "# Changes in This Release"
echo ""
echo "Files modified:"
grep -A 100 "custom:.*\[customization\]" one/events/0-changes.md | \
  grep "  - " | \
  head -20
```

## The Hook Implementation

The tracking hook is automatic and runs on every commit. No configuration needed.

### What Gets Tracked

**Enabled by default:**
- All file names and relative paths
- Directory-level categorization
- Commit messages
- Git hashes for traceability

**NOT tracked (by design):**
- File contents or diffs (use `git diff` for that)
- Commit authors (use `git log` for that)
- Full commit history (use `git log` for that)

### File: `.claude/hooks/track-changes.sh`

The hook is stored in `.claude/hooks/track-changes.sh` and triggered via `.git/hooks/post-commit`.

It intelligently:
1. Reads the files changed in your commit
2. Classifies them as template or custom
3. Prepends an entry to `one/events/0-changes.md`
4. Keeps entries in chronological order (newest first)

## Best Practices

### When Making Changes

Keep your commit messages clear and specific:

```bash
# Good - describes what and why
git commit -m "Update home page with new brand colors"
git commit -m "Integrate Stripe payment processing"
git commit -m "Fix button sizing on mobile"

# Less helpful
git commit -m "Changes"
git commit -m "WIP"
git commit -m "Fix stuff"
```

### When Syncing Template Updates

Create separate commits:

```bash
# First commit: sync template
git commit -m "chore: Sync template updates from one-ie/web"

# Second commit: apply your changes
git commit -m "feat: Adapt styles to new component library"
```

This keeps your change log clean and easy to parse.

### When Exporting Changes

Create a summary file:

```bash
#!/bin/bash
# export-changes.sh

echo "# Custom Changes Summary" > CHANGES.md
echo "" >> CHANGES.md
echo "Generated: $(date)" >> CHANGES.md
echo "" >> CHANGES.md

grep -A 100 "\[customization\]" one/events/0-changes.md | \
  grep -B 1 "  - " | \
  sed 's/^--$//' >> CHANGES.md

echo "" >> CHANGES.md
echo "Files modified: $(grep '\[customization\]' one/events/0-changes.md | wc -l)"  >> CHANGES.md
```

## Related Concepts

- **6-Dimension Ontology** - Understand what data belongs where
- **Git Workflow** - How to structure commits for clean history
- **Template Maintenance** - Strategies for staying current with template updates
- **Multi-Instance Deployments** - Managing multiple customized instances

## Troubleshooting

### Hook not triggering?

Verify the git hook is installed:

```bash
ls -la .git/hooks/post-commit
# Should show: -rwxr-xr-x ... post-commit
```

If missing, the hook was not properly installed. Reinstall:

```bash
bash .claude/hooks/track-changes.sh
```

### Changes log growing too large?

Keep only recent entries (trim old ones):

```bash
# Keep last 100 commits, archive the rest
head -500 one/events/0-changes.md > one/events/0-changes-recent.md
```

### Want to disable tracking?

Remove the post-commit hook:

```bash
rm .git/hooks/post-commit
```

To re-enable later:

```bash
# Reinstall from template
cp .claude/hooks/post-commit-template .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

## Next Steps

- Start making commits and watch `one/events/0-changes.md` auto-populate
- Export your customizations for documentation
- Use the tracking log to plan your upgrade strategy
- Share the log with your team for transparency
