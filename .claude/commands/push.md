# /push - Push to All Repositories

**Purpose:** Push changes to all ONE Platform repositories using the unified push script.

## ⚠️ CRITICAL RULE: Always Pull Before Push

**Every push MUST be preceded by a pull.** This prevents branch divergence.

```bash
# CORRECT workflow:
git add -A
git commit -m "Your message"
git pull origin main       # ← ALWAYS pull first
git push origin main       # ← Then push
```

**Branch divergence happens when:**
- Remote has commits you don't have locally
- You try to push without pulling first
- Multiple processes push simultaneously without coordination

**Prevention:**
- Always run `git pull origin main` before `git push origin main`
- Configure git: `git config pull.ff only` (forces fast-forward only)
- This makes it impossible to accidentally diverge

## How It Works

This command uses `./.claude/hooks/push.sh` to intelligently push to:
- Main repository: `github.com/one-ie/one`
- `/one` subtree: `github.com/one-ie/ontology`
- `/web` subtree: `github.com/one-ie/web`
- `one.ie/` directory: `github.com/one-ie/one.ie`

## Usage

```bash
# Push to all remotes (after pulling!)
/push all

# Push to specific remote
/push main          # Main repo only
/push one           # /one subtree only
/push web           # /web subtree only
/push oneie         # one.ie directory only
```

## Workflow: Safe Push (No Divergence)

**Always follow this sequence:**

```bash
# 1. Make changes
git add -A
git commit -m "Your message"

# 2. Pull latest from remote (CRITICAL)
git pull origin main

# 3. Now push safely
/push main

# Or push to all:
/push all
```

**Result:** Zero divergence, always in sync with remote.

## What the Script Does

1. **Pulls latest changes** from remote first (prevent divergence)
2. **Analyzes changes** across all repositories
3. **Commits with generated messages** based on file changes
4. **Pushes to each remote** with appropriate branch handling
5. **Reports summary** of all pushed repositories

## Your Task

When the user runs `/push [option]`, you MUST:

1. **Run the push script** with the appropriate argument:
   ```bash
   ./.claude/hooks/push.sh [all|main|one|web|oneie]
   ```

2. **Handle errors gracefully**:
   - If a directory doesn't exist, the script handles it
   - If push fails, display the error and suggest fixes
   - Respect pre-commit hooks if configured

3. **Report results** with clear summary:
   ```
   ✅ Push Complete!

   📦 Repositories Updated:
   - Main repo: pushed to origin main
   - /one: pushed to one-repo
   - /web: pushed to web-repo
   - one.ie: pushed (if directory exists)
   ```

## Examples

**Push all remotes:**
```
User: /push all
→ Runs: ./.claude/hooks/push.sh all
→ Pushes to all 4 remotes
```

**Push specific remote:**
```
User: /push oneie
→ Runs: ./.claude/hooks/push.sh oneie
→ Pushes to one-ie/one.ie only
```

**Push main repo:**
```
User: /push main
→ Runs: ./.claude/hooks/push.sh main
→ Pushes to one-ie/one only
```

## Important Notes

- The script uses `git subtree split` for `/one` and `/web` with `--force` to handle history
- `one.ie` directory is pushed as a normal git repository if it exists
- Each push operation is isolated - failures in one don't block others
- Run from the project root directory

## Common Issues & Solutions

### Issue: "Rejected - non-fast-forward"

**Cause:** Remote is ahead of your local branch (you didn't pull first).

**Fix:**
```bash
# Pull the latest changes
git pull origin main

# Now push safely
/push main
```

### Issue: "Branches have diverged"

**Cause:** Remote and local have different commits (push without pull happened).

**Fix:**
```bash
# Pull and merge (or rebase)
git pull origin main

# Resolve any conflicts if they occur
# Then push
/push main
```

**Prevention:** Always pull before push.

### Issue: Multiple Processes Pushing Simultaneously

**Cause:** Background hooks, slash commands, and manual operations running at once.

**Fix:**
1. **Wait for all background operations to complete**
2. **Run one operation at a time**
3. **Follow the pull-before-push rule strictly**

**Prevention:**
- Disable auto-push hooks: Comment out lines in `.git/hooks/post-commit`
- Use one unified push command, not multiple parallel operations
- Always: pull → push sequence

---

## Setup: Prevent Divergence Permanently

**Configure git to reject pushes without pull:**

```bash
# This forces fast-forward only (prevents divergence)
git config pull.ff only

# Verify it worked
git config --get pull.ff
# Should output: only
```

**Result:** If you try to push without pulling, git will refuse.

---

**Safe, reliable push to all repositories! 🚀**
