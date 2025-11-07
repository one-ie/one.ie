# /plan - Transform Ideas Into Optimized Execution Plans

**Purpose:** Load pre-built optimized plans or generate custom plans with speed, quick wins, and minimal cycles to production.

---

## Project Detection (Step 1)

**When user types `/plan [keyword]`, check if keyword matches a pre-built project:**

| Keyword | File | Cycles | Description |
|---------|------|--------|-------------|
| `blog` | `web/src/content/plans/blog.md` | 30 | Article publishing, search, RSS |
| `pages` | `web/src/content/plans/pages.md` | 20 | Landing page builder |
| `shop` | `web/src/content/plans/shop.md` | 28 | E-commerce with Stripe |
| `dashboard` | `web/src/content/plans/dashboard.md` | 40 | Real-time analytics (backend) |
| `email` | `web/src/content/plans/email.md` | 45 | Messaging system (backend) |
| `website` | `web/src/content/plans/website.md` | 55 | Website builder + CMS (backend) |

**If keyword matches:**
1. Read the plan file from `web/src/content/plans/[keyword].md`
2. Display the optimized plan with Quick Wins section
3. Show "Ready to execute" message
4. Skip plan generation (plan already exists)

**If keyword doesn't match:**
1. Treat as custom idea
2. Generate plan using algorithm below
3. Save to `.claude/state/plan.json`

---

## Core Philosophy

**Speed is a feature.** Every plan should:
- ✅ **Show quick wins first** - Users see value in Cycles 1-10
- ✅ **Minimize total cycles** - Can we ship in 30 cycles instead of 100?
- ✅ **Maximize parallelization** - Run agents simultaneously whenever possible
- ✅ **Prioritize MVP** - Core value first, enhancements later
- ✅ **Validate early** - Test assumptions in first 10 cycles

---

## Usage

```bash
# Use pre-built optimized plans (RECOMMENDED)
/plan blog          # 30 cycles - Article publishing
/plan pages         # 20 cycles - Landing pages
/plan shop          # 28 cycles - E-commerce
/plan dashboard     # 40 cycles - Analytics (backend)
/plan email         # 45 cycles - Messaging (backend)
/plan website       # 55 cycles - Website builder (backend)

# Or generate custom plan
/plan [your-custom-idea]

# Examples:
/plan Build a course platform with AI tutors
/plan E-commerce store for digital downloads
/plan SaaS tool for project management
```

**Pre-built plans load instantly** from `web/src/content/plans/` with optimized cycle counts and quick wins already defined.

**Custom plans** take 30 seconds to generate and follow the same optimization:
1. Validates against 6-dimension ontology
2. Determines frontend-only vs backend architecture
3. Identifies quick wins for Cycles 1-10
4. Optimizes total cycle count (aim for 30-60, not 100)
5. Assigns specialists automatically
6. Shows parallel execution opportunities

---

## Quick Win Optimization (Cycles 1-10)

**CRITICAL:** First 10 cycles must deliver visible progress.

### Quick Win Strategy

**❌ Old approach (slow start):**
```
Cycle 1-10: Research, planning, documentation, meetings
Cycle 11+: Finally start coding
```

**✅ New approach (fast start):**
```
Cycle 1-3:  Validate idea, map to ontology, decide architecture
Cycle 4-7:  Build ONE working feature (end-to-end)
Cycle 8-10: Deploy to staging, show something real
```

### Example: Course Platform

**Quick Win Path:**
```
Cycle 1: Validate idea → Maps to Things (course), Connections (enrolled_in), Events (completed)
Cycle 2: Frontend-only decision (no backend needed for MVP)
Cycle 3: Create basic course list page (Astro SSR)
Cycle 4: Add course detail page (static content)
Cycle 5: Implement course navigation (prev/next lessons)
Cycle 6: Add progress tracking (localStorage)
Cycle 7: Style with Tailwind (make it beautiful)
Cycle 8: Deploy to Cloudflare Pages
Cycle 9: Test end-to-end (QA pass)
Cycle 10: ✅ WORKING COURSE PLATFORM LIVE

Result: 10 cycles → MVP shipped
```

---

## Cycle Minimization Strategy

**Golden Rule:** Use the minimum cycles needed. If MVP can ship in 30 cycles, don't plan 100.

### Cycle Budget Guidelines

| Feature Complexity | Frontend-Only | Backend + Frontend | Notes |
|-------------------|---------------|-------------------|-------|
| **Simple** (landing page, blog) | 5-15 cycles | N/A | Astro static pages only |
| **Standard** (SaaS tool, e-commerce) | 15-30 cycles | 30-50 cycles | Most products fit here |
| **Complex** (multi-tenant platform) | N/A | 50-80 cycles | Groups, events, real-time |
| **Enterprise** (full platform) | N/A | 80-100 cycles | All 6 dimensions, integrations |

### How to Minimize Cycles

**1. Start Frontend-Only (Default)**
- No backend = 50% fewer cycles
- Add backend later if needed
- Example: E-commerce with Stripe.js (15 cycles vs 40 with backend)

**2. Use Existing Patterns**
- Replicate proven components (5 cycles vs 20 from scratch)
- Search codebase first: `grep -r "feature-name" /web/src/`
- Extend existing code vs new implementation

**3. Skip Non-Essential Features**
- MVP = core value only
- Nice-to-have → Future cycles
- Example: Ship without admin dashboard (save 15 cycles)

**4. Maximize Parallelization**
- Design + Frontend can run simultaneously
- Backend + Tests can run simultaneously
- Example: 60 sequential cycles → 35 with parallelization

**5. Defer Documentation**
- Code is documentation (well-named functions)
- Write docs in cycle 95-100 (not 1-10)
- Focus on shipping first

---

## Plan Output Format

After typing `/plan [idea]`, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 EXECUTION PLAN GENERATED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Idea:** Course platform with AI tutors
**Architecture:** Frontend-only → Backend (add later if needed)
**Total Cycles:** 28 (optimized from 100)
**Quick Wins:** Cycle 8 (working MVP deployed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ QUICK WINS (Cycles 1-10)

Cycle 1-3:   Foundation & validation (3 cycles)
  ✓ Validate against ontology
  ✓ Map entities (course, lesson, progress)
  ✓ Choose frontend-only architecture

Cycle 4-7:   Build core feature (4 cycles)
  ✓ Course list page (Astro SSR)
  ✓ Course detail page (lesson player)
  ✓ Progress tracking (localStorage)
  ✓ Navigation (prev/next lessons)

Cycle 8-10:  Deploy MVP (3 cycles)
  ✓ Style with Tailwind
  ✓ Deploy to Cloudflare Pages
  ✓ Test end-to-end

🎯 **Cycle 10 Milestone:** Working course platform live at [your-domain].pages.dev

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 FULL PLAN (28 Cycles Total)

Phase 1: Foundation (Cycles 1-3)
  → agent-director validates & plans

Phase 2: Core Feature (Cycles 4-10)
  → agent-frontend builds pages & components

Phase 3: Enhancement (Cycles 11-20)
  → agent-frontend adds features (quiz, certificates)

Phase 4: Backend (Cycles 21-25) [If needed later]
  → agent-backend adds groups, events, multi-user

Phase 5: Quality (Cycles 26-27)
  → agent-quality runs tests, validates

Phase 6: Deploy (Cycle 28)
  → agent-ops ships to production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ PARALLEL OPPORTUNITIES

These cycles can run simultaneously:
- Design (Cycles 4-7) + Backend (if added later)
- Frontend (Cycles 8-15) + Tests (Cycles 8-15)
- Documentation (Cycles 20+) + Optimization (Cycles 20+)

**Time Savings:** 28 sequential cycles → 18 days with parallelization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 NEXT STEPS

1. Start execution:
   /now    - See Cycle 1 task
   /next   - Advance through cycles
   /done   - Mark complete & learn

2. Fast-track a feature:
   /fast [feature-name]

3. Build with specialists:
   /create [specific-feature]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Intelligent Planning Algorithm

The plan generator uses these rules:

### 1. Ontology Validation (Cycle 1)
```
Question: Does this map to 6 dimensions?
- Identify Groups (multi-tenant? hierarchical?)
- Identify People (roles? permissions?)
- Identify Things (core entities)
- Identify Connections (relationships)
- Identify Events (actions to track?)
- Identify Knowledge (search/RAG needed?)

If unclear → Ask clarifying questions
If invalid → Suggest reframing
```

### 2. Architecture Decision (Cycle 2)
```
Frontend-only if:
- Single user OR third-party auth
- Static content OR localStorage sufficient
- Payments via Stripe.js
- No real-time collaboration

Backend needed if:
- Multi-tenant groups
- Real-time sync
- Immutable event log
- Vector embeddings (RAG)
```

### 3. Quick Win Identification (Cycle 3)
```
Quick Win = Smallest shippable feature showing core value

Examples:
- Course platform → One playable course
- E-commerce → One purchasable product
- SaaS tool → One working workflow
- Blog → Five published posts

Goal: Cycle 10 = Something live and usable
```

### 4. Cycle Budget Allocation
```
Frontend-only:
  Foundation:     3 cycles (10%)
  Core Feature:   7 cycles (25%)
  Enhancements:   10 cycles (35%)
  Quality:        5 cycles (18%)
  Deploy:         3 cycles (12%)
  Total:          28 cycles

Backend + Frontend:
  Foundation:     3 cycles (6%)
  Backend Schema: 5 cycles (10%)
  Backend Logic:  8 cycles (16%)
  Frontend Pages: 10 cycles (20%)
  Integration:    8 cycles (16%)
  Quality:        8 cycles (16%)
  Deploy:         5 cycles (10%)
  Documentation:  3 cycles (6%)
  Total:          50 cycles
```

### 5. Parallelization Mapping
```
Identify independent work streams:
- Design + Backend (no dependencies)
- Frontend + Tests (can run together)
- Optimization + Documentation (separate concerns)

Calculate time savings:
  Sequential: 50 cycles × 1 day = 50 days
  Parallel (3 streams): 50 ÷ 3 = 17 days
```

---

## Plan Commands

```bash
# Generate plan
/plan [idea]

# View plan
/plan show              # Full plan with all cycles
/plan summary           # Quick overview

# Filter plan
/plan cycles 1-10       # Show specific range
/plan agent frontend    # Show cycles for specific agent
/plan quick-wins        # Show Cycles 1-10 only

# Modify plan
/plan optimize          # Re-optimize to use fewer cycles
/plan add-backend       # Add backend to frontend-only plan
/plan skip [N]          # Skip cycle N (mark not applicable)

# Export plan
/plan export md         # Markdown format
/plan export json       # JSON format
/plan export timeline   # Gantt chart
```

---

## Example Plans

### Example 1: E-commerce Store (Frontend-Only)

**Input:** `/plan E-commerce store for digital fonts`

**Output:**
```
🚀 Plan: 22 cycles (frontend-only)

Quick Wins (Cycles 1-8):
- Cycle 1-2: Validate + architect
- Cycle 3-5: Product list + detail pages
- Cycle 6-7: Stripe Checkout integration
- Cycle 8: Deploy MVP

Enhancement (Cycles 9-18):
- Cycle 9-12: Cart system (localStorage)
- Cycle 13-15: Download management
- Cycle 16-18: Admin dashboard

Quality & Deploy (Cycles 19-22):
- Cycle 19-20: Testing
- Cycle 21: Performance optimization
- Cycle 22: Production deploy

✅ Cycle 8: Customers can buy fonts
🎯 Cycle 22: Full-featured store live
```

### Example 2: SaaS Platform (Backend + Frontend)

**Input:** `/plan Project management tool with team collaboration`

**Output:**
```
🚀 Plan: 45 cycles (backend + frontend)

Quick Wins (Cycles 1-10):
- Cycle 1-3: Validate + architect (backend needed)
- Cycle 4-6: Backend schema (groups, projects, tasks)
- Cycle 7-9: Basic project view (list tasks)
- Cycle 10: Deploy staging (team can test)

Core Features (Cycles 11-30):
- Cycle 11-15: Task CRUD operations
- Cycle 16-20: Real-time updates (WebSocket)
- Cycle 21-25: Team permissions
- Cycle 26-30: Activity feed (events table)

Polish (Cycles 31-45):
- Cycle 31-38: UI/UX refinement
- Cycle 39-42: Performance optimization
- Cycle 43-44: Testing
- Cycle 45: Production deploy

✅ Cycle 10: MVP with basic task management
🎯 Cycle 45: Full collaboration platform
```

### Example 3: Landing Page (Minimal)

**Input:** `/plan Landing page for SaaS product`

**Output:**
```
🚀 Plan: 8 cycles (frontend-only, minimal)

Cycles 1-2: Validate + content structure
Cycle 3: Hero section + CTA
Cycle 4: Features section
Cycle 5: Pricing section
Cycle 6: Contact form (Formspree)
Cycle 7: Style + responsive design
Cycle 8: Deploy to Cloudflare Pages

✅ Cycle 8: Landing page live

💡 Tip: This could be done in 8 cycles because:
- No backend needed
- Static content
- Third-party form handling
- Existing patterns (hero, pricing, form)
```

---

## Integration with Other Commands

### → /now
After plan is created, use `/now` to see current cycle

### → /next
Advance through cycles sequentially

### → /fast [feature]
Skip planning, build specific feature immediately (see `/fast` command)

### → /create [feature]
Build specific feature with specialists

### → /done
Mark current cycle complete, capture lessons

---

## Key Principles

1. **Default to minimum cycles** - Start with smallest viable plan
2. **Quick wins in first 10 cycles** - Show progress early
3. **Frontend-only by default** - Add backend only when necessary
4. **Parallelize aggressively** - Run independent work simultaneously
5. **Ship early, enhance later** - MVP first, features follow
6. **Learn from previous plans** - Refine cycle estimates over time

---

## State Persistence

Plans are saved to:
- `.claude/state/plan.json` - Full plan with all cycles
- `.claude/state/cycle.json` - Current cycle context
- `one/events/plans/[feature-name].md` - Human-readable plan export

---

## See Also

- `/fast` - Build features rapidly without planning
- `/create` - Build specific features with specialists
- `/now` - View current cycle
- `/done` - Complete cycles and advance
