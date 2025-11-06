# ONE Platform Commands Architecture

## Design Philosophy

**One entry point, unlimited power through cascading context.**

The entire ONE Platform is accessed through a single `/one` command that:
1. Checks server status (auto-starts if needed)
2. Displays 6 core commands
3. Routes to appropriate specialist based on context

No confusing menus. No bloated interfaces. Just clear, focused execution.

---

## Command Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  /one                                                       │
│  ONE Platform Control Center (300 tokens)                  │
│  - Check server status                                      │
│  - Display core commands                                    │
│  - Direct user to next action                              │
└─────────────────────────────────────────────────────────────┘
         │
         ├─→ /server (existing)
         │   Manage dev server
         │
         ├─→ /chat (new)
         │   Strategy & onboarding
         │   ~500 tokens
         │   Calls: agent-director
         │
         ├─→ /plan (existing)
         │   Create 100-cycle plan
         │   ~2K tokens
         │   Calls: agent-director
         │
         ├─→ /now (existing)
         │   Current cycle context
         │   ~1-3K tokens
         │   Loads: .claude/state/cycle.json + specialist agent
         │
         ├─→ /next (existing)
         │   Advance to next cycle
         │   ~500 tokens
         │   Loads: Next specialist agent
         │
         ├─→ /done (existing)
         │   Mark cycle complete
         │   ~1K tokens
         │   Calls: agent-documenter (lessons)
         │
         ├─→ /create (new)
         │   Build with specialists
         │   ~3K tokens
         │   Routes based on feature type
         │
         ├─→ /push (existing)
         │   Commit & push
         │   ~500 tokens
         │   Calls: git commands
         │
         └─→ /deploy (existing)
             Ship to production
             ~1K tokens
             Calls: deployment scripts
```

---

## Context Loading Strategy

### /one Display (300 tokens)
```
Reads: .claude/commands/one.md
Output: Logo + 6 commands + quick start
Time: < 0.5 seconds
```

### /chat Command (~500 tokens)
```
Reads:
  - .onboarding.json (brand, org, website)
  - /CLAUDE.md (ontology reference)
Calls:
  - agent-director (validation)
Flow:
  1. Extract vision from conversation
  2. Validate against 6D ontology
  3. Understand requirements
  4. Document strategy
Time: Variable (conversation)
```

### /plan Command (~2K tokens)
```
Reads:
  - /CLAUDE.md (ontology + patterns)
  - .claude/agents/agent-director.md
Calls:
  - agent-director (planning)
Output:
  - .claude/state/plan.json (100-cycle plan)
  - Auto-assigned agents per cycle
Flow:
  1. Parse idea
  2. Map to 6 dimensions
  3. Create 100-cycle breakdown
  4. Assign agents to cycles
  5. Show timeline + dependencies
Time: 5-30 seconds (depending on complexity)
```

### /now Command (~1-3K tokens)
```
Reads:
  - .claude/state/cycle.json (current state)
  - .claude/agents/[specialist].md (assigned agent)
  - /backend/CLAUDE.md or /web/CLAUDE.md (if relevant)
Output:
  - Current cycle number & phase
  - Assigned specialist
  - Task description
  - Context for that specialist
Time: < 1 second
```

### /create Command (~3K tokens)
```
Reads:
  - Feature description/type
  - Relevant CLAUDE.md (cascade)
  - .claude/agents/[specialist].md
  - .claude/skills/[skill-files]
Calls:
  - Appropriate specialist agent
Routes:
  - "shop page" → agent-frontend
  - "course-schema" → agent-backend
  - "design tokens" → agent-designer
  - "test suite" → agent-quality
Output:
  - Implementation code
  - Tests (if applicable)
  - Documentation
Time: Depends on feature
```

### /push Command (~500 tokens)
```
Reads:
  - Git status
  - Recent commits
Calls:
  - Git commands (add, commit, push)
Output:
  - Commit confirmation
  - Remote status
Time: 10-30 seconds
```

### /deploy Command (~1K tokens)
```
Reads:
  - Deployment scripts
  - Environment variables
Calls:
  - .claude/commands/deploy.md
  - agent-ops (if complex)
Output:
  - Deployment status
  - Live URLs
Time: 2-5 minutes
```

---

## Cascade System in Action

### Example: /now + Build Backend Feature

```
User: /now
  ↓
Loads: .claude/state/cycle.json
  ↓
Shows: "Cycle 15: Implement course creation mutation"
        "Specialist: agent-backend"
        "Phase: Backend Implementation (Cycle 11-20)"

User: /create course-creation-mutation
  ↓
Detects: "mutation" keyword → backend feature
  ↓
Loads cascade:
  1. /CLAUDE.md (ontology, 6-dimension patterns)
  2. /backend/CLAUDE.md (Convex patterns)
  3. .claude/agents/agent-backend.md (specialist skills)
  4. .claude/skills/agent-backend:create-mutation (guidance)
  ↓
Calls: agent-backend with full context
  ↓
Agent builds mutation code:
  - With validation
  - With event logging
  - With error handling
  - Following all patterns
  ↓
Output: Fully implemented, tested, documented mutation
```

### Example: /plan → /now → Cycle Loop

```
User: /plan convert "Build AI course platform"
  ↓
Reads: /CLAUDE.md (6-dimension ontology)
  ↓
Calls: agent-director
  ↓
Creates: .claude/state/plan.json (100-cycle plan)
Output:
  - Cycle 1-10: Foundation (agent-director)
  - Cycle 11-20: Backend Schema (agent-backend)
  - Cycle 21-30: Frontend (agent-frontend)
  - Cycle 31-40: Design (agent-designer)
  - Cycle 41-50: Quality (agent-quality)
  - ... [50-100 more cycles]

User: /now
  ↓
Loads: .claude/state/cycle.json
  ↓
Shows: "Cycle 1/100: Foundation & Understanding"
        "Assigned: agent-director"

User: [executes Cycle 1 work]

User: /done
  ↓
Marks cycle complete
  ↓
Calls: agent-documenter (capture lessons)
  ↓
Updates: .claude/state/cycle.json (Cycle 2)

User: /now
  ↓
Shows: "Cycle 2/100: Validate idea against ontology"
        "Assigned: agent-director"

[Repeat for all 100 cycles...]
```

---

## File Organization

### Command Files (.claude/commands/)
```
one.md              ← Entry point (minimal)
server.md           ← Server management
chat.md             ← Conversation flow (new)
plan.md             ← Plan creation
create.md           ← Feature building router (new)
push.md             ← Git operations
deploy.md           ← Production deployment
```

### Agent Files (.claude/agents/)
```
agent-director.md       ← Orchestrator (loads on /plan)
agent-backend.md        ← Backend specialist
agent-frontend.md       ← Frontend specialist
agent-designer.md       ← Design specialist
agent-quality.md        ← Quality specialist
agent-ops.md            ← Operations specialist
agent-clean.md          ← Code quality specialist
agent-clone.md          ← Migration/clone specialist
```

### State Files (.claude/state/)
```
cycle.json          ← Current cycle state (auto-created)
plan.json           ← Full 100-cycle plan (auto-created)
lessons.md          ← Captured lessons (auto-created)
```

### Hook Files (.claude/hooks/)
```
todo.md             ← Load cycle context (used by /now)
done.md             ← Mark complete + advance (used by /done)
validate-*.py       ← Validation scripts
```

### Skill Files (.claude/skills/)
```
agent-backend:create-mutation.md
agent-backend:create-query.md
agent-backend:design-schema.md
agent-frontend:create-page.md
agent-frontend:create-component.md
agent-frontend:optimize-performance.md
... [more skills per agent]
```

### Documentation Files
```
/.claude/OPTIMIZATION_SUMMARY.md     ← What changed and why
/.claude/COMMANDS_ARCHITECTURE.md    ← This file
/CLAUDE.md                           ← Root ontology reference
/backend/CLAUDE.md                   ← Backend patterns
/web/CLAUDE.md                       ← Frontend patterns
```

---

## Token Budget Per Command

| Command | Base | +Context | Total | Time |
|---------|------|----------|-------|------|
| /one | 300 | 0 | 300 | <0.5s |
| /chat | 300 | 200 | 500 | Varies |
| /plan convert | 300 | 1.7K | 2K | 5-30s |
| /now | 100 | 1-3K | 1-3K | <1s |
| /next | 100 | 500 | 600 | <1s |
| /done | 300 | 700 | 1K | <1s |
| /create backend | 300 | 2.7K | 3K | Varies |
| /create frontend | 300 | 2.7K | 3K | Varies |
| /push | 200 | 300 | 500 | 10-30s |
| /deploy | 200 | 800 | 1K | 2-5m |

**Average feature cycle:** ~3K tokens (vs 150K before = 98% reduction)

---

## Execution Flow Diagram

```
START
  ↓
/one
  ├─→ Check server status
  ├─→ Display 6 commands
  └─→ Wait for input
  ↓
User chooses command
  ├─→ /chat
  │    └─→ Onboard vision
  │         └─→ /plan convert
  │              └─→ Generate 100-cycle plan
  │
  ├─→ /plan (if skipping chat)
  │    └─→ Generate 100-cycle plan
  │         └─→ Auto-assign agents
  │
  ├─→ /now (if plan exists)
  │    └─→ Show current cycle
  │         └─→ Show specialist
  │
  ├─→ /create [task]
  │    └─→ Route to specialist
  │         └─→ Build with context
  │
  ├─→ /next
  │    └─→ Advance cycle
  │
  ├─→ /done
  │    └─→ Mark complete
  │         └─→ Capture lessons
  │              └─→ Auto-advance
  │
  ├─→ /push
  │    └─→ Commit & push
  │
  └─→ /deploy
       └─→ Go live

CYCLE REPEATS until all 100 cycles complete
```

---

## No Breaking Changes

All existing functionality preserved:
- `/server start` - Still works
- `/plan convert [idea]` - Still works
- `/now`, `/next`, `/done` - Still work
- `/create` - Still works

The only change: `/one` is now minimal and routes efficiently.

---

## Key Principles

### 1. Single Entry Point
- One command (`/one`) for all operations
- Clear, discoverable interface
- No hidden menus or complexity

### 2. On-Demand Context Loading
- Load CLAUDE.md files only when needed
- Use cascade system for inheritance
- Keep memory footprint small

### 3. State Persistence
- Save cycle state in `.claude/state/`
- Never re-read environment
- Always know where you are

### 4. Progressive Complexity
- Start simple (just `/one`)
- Add complexity as needed (`/chat` → `/plan` → `/now`)
- Expert users can skip straight to `/create`

### 5. Specialist Expertise
- Each agent knows their domain
- Load domain-specific CLAUDE.md when needed
- Skills files provide detailed guidance

---

## Next Implementation Steps

If you want to build out `/chat.md`:

```markdown
# /chat - Vision & Strategy Conversation

When user types `/chat [idea]`:

1. Extract vision from conversation
2. Ask about target audience
3. Ask about market positioning
4. Ask about brand identity
5. Validate against 6D ontology
6. Generate strategy document
7. Show next steps (/plan convert)

Context: ~500 tokens
Calls: agent-director
Output: Strategy document + next steps
```

---

**Result:** ONE Platform is fast, focused, and powerful. Built on cascade principles and optimized for maximum efficiency.
