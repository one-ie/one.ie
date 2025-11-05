# /push - Push to All Repositories

**Purpose:** Push changes to all ONE Platform repositories using the unified push script.

## How It Works

This command uses `./.claude/hooks/push.sh` to intelligently push to:
- Main repository: `github.com/one-ie/one`
- `/one` subtree: `github.com/one-ie/ontology`
- `/web` subtree: `github.com/one-ie/web`
- `one.ie/` directory: `github.com/one-ie/one.ie`

## Usage

```bash
# Push to all remotes
/push all

# Push to specific remote
/push main          # Main repo only
/push one           # /one subtree only
/push web           # /web subtree only
/push oneie         # one.ie directory only
```

## What the Script Does

1. **Analyzes changes** across all repositories
2. **Commits with generated messages** based on file changes
3. **Pushes to each remote** with appropriate branch handling
4. **Reports summary** of all pushed repositories

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

## Error Handling

If push fails:
```
❌ Push failed for [remote]
Reason: [git error message]

Suggested action:
- Check git status: git status
- Pull latest: git pull [remote] main
- Resolve conflicts if any
- Retry push
```

---

**Simple, unified push to all repositories! 🚀**
