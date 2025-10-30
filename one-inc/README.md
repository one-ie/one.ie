# 🔒 ONE Group - Private Backup

**Purpose:** Secure backup of sensitive business files from `/one/` following the 6-dimension ontology.

**Status:** 🔐 **PRIVATE** - Not tracked in git

---

## Directory Structure

Following the **6-dimension ontology**:

```
one-group/
├── groups/         ← Business-sensitive group data (revenue, strategy, vision)
├── people/         ← Private people/authorization data
├── things/         ← Private entity specifications
├── connections/    ← Private relationship data
├── events/         ← Private event logs
└── knowledge/      ← Private knowledge base
```

---

## Currently Backed Up

### `/groups/` Directory
- **revenue.md** - 🔒 Revenue strategy and financial planning (PRIVATE)
- **strategy.md** - 🔒 Business strategy and competitive analysis (PRIVATE)
- **vision.md** - 🔒 Long-term vision and goals (PRIVATE)
- ~~**one.md**~~ - ✅ ONE platform group specifications (PUBLIC - visible in git)
- ~~**groups.md**~~ - ✅ Group dimension documentation (PUBLIC - visible in git)

**Backup Date:** 2025-10-15 02:41 UTC (updated 03:44 UTC)
**Backed up from:** `/one/groups/`
**Status:** Only 3 private files backed up; groups.md and one.md are public

---

## Ontology Alignment

This backup follows the **6-dimension ontology**:

1. **Groups** - Who belongs where (business org structure) ✅ **BACKED UP**
2. **People** - Who can do what (roles, permissions)
3. **Things** - All entities (users, agents, content, tokens, courses)
4. **Connections** - Relationships between entities
5. **Events** - Actions and state changes over time
6. **Knowledge** - Labels, embeddings, semantic search

---

## Why This Exists

**Problem:** The `/one/` directory contains public platform documentation AND private business strategy.

**Solution:**
- Public docs stay in `/one/` (tracked in git)
- Private business files backed up to `/one-group/` (not tracked in git)
- Both follow the same 6-dimension ontology structure

**Git Status:**
- ✅ `/one/groups/` is hidden via `.gitignore`
- ✅ `/one-group/` is hidden via root `.gitignore`
- ✅ Backup created automatically by Agent Clean

---

## Access Control

**Who can access:**
- Platform owners only
- Not committed to public git repositories
- Stored locally on secure machines only

**Security:**
- Files contain business-sensitive information
- Revenue projections and financial data
- Competitive strategy and market analysis
- Internal vision and planning documents

---

## Maintenance

**Backup Strategy:**
- Manual backups when `/one/groups/` changes
- Use `rsync` or Agent Clean to sync changes
- Verify backup integrity periodically

**Sync Command:**
```bash
rsync -av --delete /path/to/ONE/one/groups/ /path/to/ONE/one-group/groups/
```

---

## Related Documentation

- **`/one/README.md`** - Public platform documentation
- **`/one/groups/groups.md`** - Public group dimension docs (if unhidden)
- **`CLAUDE.md`** - Agent instructions (public)

---

**Created by:** Agent Clean
**Date:** 2025-10-15 02:41 UTC
**Version:** 1.0.0
**Purpose:** Secure ontology-aligned backup of private business files
