# Archived Markdown Files

This directory contains markdown files that were automatically moved from the repository root and `/web/` directories by the cleanup hook. Part of the EVENTS dimension (6-dimension ontology).

## Allowed Files

Only these markdown files are permitted in root and `/web/`:

- `README.md` - Project overview
- `CLAUDE.md` - Claude Code instructions
- `AGENTS.md` - AI agent definitions
- `LICENSE.md` - License information
- `SECURITY.md` - Security policy

## Cleanup System

The `clean-root-markdown.sh` hook automatically maintains a clean root directory:

- **When:** Runs automatically on every commit via `.git/hooks/post-commit`
- **What:** Moves any markdown files NOT in the allowed list
- **Where:** To `one/events/archived/`
- **Why:** Keeps root and `/web/` focused on essential documentation

## Archive Naming

Files are archived with timestamps to prevent name collisions:

```
FILENAME-YYYYMMDD-HHMMSS.md       (from root)
web-FILENAME-YYYYMMDD-HHMMSS.md   (from /web, prefixed with "web-")
```

This ensures:
- No name collisions between multiple versions
- Clear creation timestamp for sorting and tracking
- Trackable source (web- prefix indicates origin)

## Using Archived Files

To reference or restore archived files:

```bash
# List archived files by age (newest first)
ls -lt one/events/archived/ | head

# Find files by name
grep -l "MYFILE" one/events/archived/*

# Get most recent version of a file
ls -t one/events/archived/MYFILE-* | head -1
```

## Event-Driven Documentation

These archived files are part of the EVENTS dimension, which drives automated documentation generation:

- **`one/events/0-changes.md`** - Raw change tracking data
- **`one/events/archived/`** - Discarded documentation
- **`one/events/releases/`** - Generated release notes
- **`one/events/news/`** - Generated announcements
- **`one/events/documentation/`** - Generated API documentation

See `one/knowledge/event-driven-documentation.md` for how to use event data to auto-generate documentation and release notes.

---

**System:** 6-Dimension Ontology (EVENTS dimension)
**Source:** `.claude/hooks/clean-root-markdown.sh`
**Trigger:** Automatic on each commit via `.git/hooks/post-commit`
