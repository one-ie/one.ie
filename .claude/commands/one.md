# /one - ONE Platform Control Center

**Transform Ideas Into Production Code In Minutes**

When user types `/one`, follow this workflow:

---

## Step 1: Server Status Check (< 1 second)

```bash
lsof -ti:4321 2>/dev/null && echo "RUNNING" || echo "STOPPED"
```

**If RUNNING:**
```
✅ Dev Server: http://localhost:4321
```

**If STOPPED:**
- Check if installed: `[ -d web/node_modules ] && echo "installed" || echo "missing"`
- If missing: Run `cd web && bun install`
- Then: Run `cd web && bun run dev > /dev/null 2>&1 &`
- Show: "🚀 Starting server..." then wait 2 seconds
- Final: "✅ Dev Server: http://localhost:4321"

---

## Step 2: Display ONE Platform Interface

**CRITICAL: ALWAYS display this interface exactly as shown below. No variations. No summaries. Show the full output every time.**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  ONE Platform v1.0.0
  Make Your Ideas Real

  Dev Server: ✅ http://localhost:4321

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 CORE COMMANDS

  /chat            Onboard your idea
  /plan [idea]     Generate optimized plan
  /fast [feature]  Build in minutes
  /create [type]   Build with specialists
  /push            Commit & push
  /deploy          Ship to production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**DO NOT add any sections, workflow steps, or explanations after the commands.**

---

## Key Principles

### Context Optimization

- **Minimal display**: Show only essential commands
- **Cascade integration**: Load CLAUDE.md from parent directories on-demand
- **State persistence**: Use `.claude/state/cycle.json` for current cycle
- **Lazy loading**: Only expand agent details when requested

### Workflow Simplicity

```
Chat (understand)
  ↓
Plan (create 100-cycle)
  ↓
Cycle Loop (/now → /next → /done)
  ↓
Create (build specific features)
  ↓
Push (commit & push)
  ↓
Deploy (ship to production)
```

### Agent Auto-Assignment

- `/plan` automatically assigns cycles to agents
- `/create` routes to appropriate specialist based on feature type
- `/next` loads context for assigned specialist (from `.claude/agents/`)
- Context stays under 3K tokens per cycle

### Command Integration

| Command | Purpose | Context | Reads |
|---------|---------|---------|-------|
| `/chat` | Strategy & onboarding | ~500 tokens | `.onboarding.json` + CLAUDE.md cascade |
| `/plan` | 100-cycle breakdown | ~2K tokens | Plan logic + agent list |
| `/now` | Current cycle context | ~800 tokens | `.claude/state/cycle.json` + agent file |
| `/next` | Advance to next | ~500 tokens | Next agent's context |
| `/done` | Mark complete | ~1K tokens | Cycle state, capture lessons |
| `/create` | Build features | ~3K tokens | Feature spec + specialist agent |
| `/push` | Commit & push | ~500 tokens | Git status |
| `/deploy` | Ship to production | ~1K tokens | Deployment scripts |

---

## Integration Points

### With Hooks

- `.claude/hooks/todo.md` - Loads current cycle when `/now` called
- `.claude/hooks/done.md` - Marks complete & advances when `/done` called
- `.claude/hooks/validate-ontology-structure.py` - Validates 6D alignment

### With Skills

- `.claude/skills/` - Specialist tools loaded on-demand by agents
- `.claude/skills/agent-backend:create-mutation` - Backend operations
- `.claude/skills/agent-frontend:create-page` - Frontend operations

### With CLAUDE.md Cascade

```
/.claude/commands/one.md (this file, minimal 300 tokens)
  ↓ References when needed
/.claude/agents/agent-director.md (full orchestration logic)
  ↓ Loads when planning
/backend/CLAUDE.md (Convex patterns)
  ↓ Loads when building backend
/web/CLAUDE.md (Frontend patterns)
  ↓ Loads when building frontend
/CLAUDE.md (root - ontology reference)
  ↓ Cascade system explained
```

---

## Commands Orchestrated by /one

### /chat
Direct conversation for:
- Understanding your idea
- Extracting brand identity
- Market positioning strategy
- Requirement gathering

Calls `agent-director` for validation.

### /plan
Create 100-cycle implementation:
- `/plan convert [idea]` - Creates plan from idea
- `/plan show` - Display current plan
- `/plan filter --agent=X` - Filter by specialist

Delegates to `agent-director`.

### /now
Show current cycle:
- Cycle number (N/100)
- Phase (Foundation, Backend, Frontend, etc.)
- Assigned specialist
- Context from `.claude/state/cycle.json`

Loads specialist's `.claude/agents/` file.

### /next
Advance to next cycle:
- Marks previous as in_progress
- Loads next cycle from plan
- Shows assigned specialist
- Loads that agent's context

### /done
Mark cycle complete:
- Updates `.claude/state/cycle.json`
- Captures lessons learned
- Triggers agent-documenter to save knowledge
- Advances to next cycle

### /create
Build specific features:
- `/create shop-page` → Routes to agent-frontend
- `/create AI-tutor-mutation` → Routes to agent-backend
- `/create course-schema` → Routes to agent-backend
- `/create design-tokens` → Routes to agent-designer

Auto-routes based on feature type.

### /push
Commit & push changes:
- Git status check
- Staged changes verification
- Commit message generation (smart)
- Push to remote

### /deploy
Ship to production:
- Web to Cloudflare Pages
- Backend to Convex Cloud
- Run pre-deployment checks
- Verify deployment success

---

## Context Optimization Notes

**This file (one.md): ~200 tokens for display**

**CRITICAL RULE:** The interface display is MANDATORY regardless of which model is being used (Haiku, Sonnet, Opus). Always show the full ASCII logo and command list. Never summarize or skip this output.

By keeping `/one.md` minimal and using cascade system:
- Load CLAUDE.md files only when needed
- Agent contexts loaded on-demand (~1-3K per agent)
- State persisted in `.claude/state/cycle.json` (< 500 bytes)
- Full plan stored in `.claude/state/plan.json` (auto-generated)

**Total context usage:**
- `/one` display: 200 tokens (mandatory output)
- `/chat` flow: 500 tokens
- `/plan` flow: 2K tokens
- `/now` + agent: 1-3K tokens
- `/create` + specialist: 3K tokens

**Compared to old approach:** 150K → 3K tokens per cycle (98% reduction)

---

## No Functionality Here

This file only describes behavior. The actual slash commands are implemented by:
- `.claude/commands/chat.md` - Conversation flow
- `.claude/commands/plan.md` - Plan creation
- `.claude/commands/create.md` - Feature building
- `.claude/commands/push.md` - Git commit & push
- `.claude/commands/deploy.md` - Production deployment
- `.claude/commands/server.md` - Server management

This `/one.md` is the **entry point** that references all others.
