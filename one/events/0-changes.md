### **b683c768** — template:10 — `refactor: Move cleanup archive to one/events/ (EVENTS dimension) and add event-driven documentation guide``

**Template:**
  - .claude/hooks.log
  - .claude/hooks/clean-root-markdown.sh
  - .claude/state/inference.json
  - one/events/0-changes.md
  - one/events/archived/DOCS-SYSTEM-GUIDE-20251105-142103.md
  - one/events/archived/FILE-REFERENCE-20251105-142103.md
  - one/events/archived/IMPLEMENTATION-CHECKLIST-20251105-142103.md
  - one/events/archived/IMPLEMENTATION-REPORT-DOCS-20251105-142102.md
  - one/events/archived/readme.md
  - one/knowledge/event-driven-documentation.md



### **e96bf4e5** — template:29 — `fix: Use macOS-compatible path display in cleanup hook``

**Template:**
  - .claude/hooks/clean-root-markdown.sh
  - web/.archive/.code-quality-report-20251105-142351.md
  - web/.archive/CLEANUP-REPORT-20251105-142350.md
  - web/.archive/CODE-QUALITY-INDEX-20251105-142350.md
  - web/.archive/COMPREHENSIVE-FEATURES-SYSTEM-20251105-142350.md
  - web/.archive/DOCUMENTATION-CREATED-20251105-142350.md
  - web/.archive/FEATURES-DOCUMENTATION-20251105-142350.md
  - web/.archive/FEATURES-DOCUMENTATION-SUMMARY-20251105-142350.md
  - web/.archive/FEATURES-QUALITY-CHECKLIST-20251105-142350.md
  - web/.archive/FEATURES-TEST-SUITE-20251105-142350.md
  - web/.archive/FEATURES_COMPONENTS-20251105-142351.md
  - web/.archive/IMPLEMENTATION_SUMMARY-20251105-142350.md
  - web/.archive/INDEX-20251105-142350.md
  - web/.archive/QUALITY_IMPROVEMENTS-20251105-142351.md
  - web/.archive/REFACTORING-SUMMARY-20251105-142350.md
  - web/.code-quality-report.md
  - web/CLEANUP-REPORT.md
  - web/CODE-QUALITY-INDEX.md
  - web/COMPREHENSIVE-FEATURES-SYSTEM.md
  - web/DOCUMENTATION-CREATED.md
  - web/FEATURES-DOCUMENTATION-SUMMARY.md
  - web/FEATURES-DOCUMENTATION.md
  - web/FEATURES-QUALITY-CHECKLIST.md
  - web/FEATURES-TEST-SUITE.md
  - web/FEATURES_COMPONENTS.md
  - web/IMPLEMENTATION_SUMMARY.md
  - web/INDEX.md
  - web/QUALITY_IMPROVEMENTS.md
  - web/REFACTORING-SUMMARY.md



### **5c831ccc** — template:9 — `refactor: Move archive to .archive/ (root) and extend cleanup to /web/ directory``

**Template:**
  - .claude/hooks.log
  - .claude/hooks/clean-root-markdown.sh
  - .claude/state/inference.json
  - one/events/0-changes.md
  - one/events/archived/DOCS-SYSTEM-GUIDE-20251105-142103.md
  - one/events/archived/FILE-REFERENCE-20251105-142103.md
  - one/events/archived/IMPLEMENTATION-CHECKLIST-20251105-142103.md
  - one/events/archived/IMPLEMENTATION-REPORT-DOCS-20251105-142102.md
  - one/events/archived/readme.md



### **d4e20495** — template:1 — `docs: Add README for archived documents directory``

**Template:**
  - one/events/archived/readme.md



### **c2547401** — template:8 — `refactor: Add hook to move unwanted markdown files to one/events/archived/ and archive existing docs``

**Template:**
  - .claude/hooks.log
  - .claude/hooks/clean-root-markdown.sh
  - .claude/state/inference.json
  - one/events/0-changes.md
  - one/events/archived/DOCS-SYSTEM-GUIDE-20251105-142103.md
  - one/events/archived/FILE-REFERENCE-20251105-142103.md
  - one/events/archived/IMPLEMENTATION-CHECKLIST-20251105-142103.md
  - one/events/archived/IMPLEMENTATION-REPORT-DOCS-20251105-142102.md



### **64e20559** — template:1 — `docs: Add tracking customizations guide to web docs``

**Template:**
  - web/src/content/docs/develop/tracking-customizations.md



### **0dd7dc9c** — template:1 — `docs: Update change tracking to focus on file paths``

**Template:**
  - one/events/0-changes.md



### **9f06e4b1** — template:1 — `refactor: Track file paths and names for customizations``

**Template:**
  - .claude/hooks/track-changes.sh



**10e2d69f** — one:1 — `docs: Update tracking header with template-agnostic guide`


**e2e1d8c6** — .claude:1 — `refactor: Make tracking template-agnostic for any user customizations`


**c22d8f6e** — one:1 —`docs: Update change tracking header with legend`


**3e33b1d1** — .claude:1 —`refactor: Add customization tracking tags for upgrade management`


**9c180820** — one: +2 — `docs: Update change tracking and in-sync plan`


# Change Tracking

Track your customizations with file paths. Updated on each commit.

**What's tracked:**
- All file names and relative paths
- Which changes are template upgrades vs your customizations
- Easy to export for diffs, upgrades, or documentation

**Format:**
```
### hash — template:N custom:M — `message` [customization]

**Template:**
  - path/to/file1
  - path/to/file2

**Your Changes:**
  - custom/path/file1
  - custom/path/file2
```

---

**6151535c** — .claude: +1 — `refactor: Make track-changes more elegant with grouped directory stats`

