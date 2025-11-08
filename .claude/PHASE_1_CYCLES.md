# Phase 1 Implementation Plan (Cycles 1-20)

**Status:** Ready to execute
**Duration:** Cycles 1-20 (4-5 weeks)
**Focus:** Foundation + MCP Optimization + Skills + Hooks

---

## Cycles 1-3: MCP Optimization (Context Reduction)

**Goal:** Disable MCPs globally, save ~1K tokens per interaction
**Agent:** Self (no agent needed)
**Benefit:** Cleaner base context, faster interactions

### Cycle 1: Audit Current MCP Usage
```
Task: Understand what MCPs are currently loaded
  ├── Check .claude/mcp.json (current config)
  ├── Document which agents use which MCPs
  ├── Measure baseline context usage
  └── Identify MCPs that can be disabled

Deliverable: MCP usage audit report
Validation: Document current state before changes
```

### Cycle 2: Disable MCPs Globally
```
Task: Turn off MCPs in mcp.json
  ├── Backup current mcp.json
  ├── Edit mcp.json to disable all MCPs
  ├── Test basic commands still work
  ├── Verify context reduction
  └── Commit changes

Deliverable: mcp.json without MCPs loaded
Validation: All existing workflows still work
```

### Cycle 3: Validate & Document
```
Task: Ensure everything works without MCPs
  ├── Run basic commands (/plan, /create, /push)
  ├── Test subagent invocation still works
  ├── Measure new context usage
  ├── Document before/after metrics
  └── Update agent docs on MCP policy

Deliverable: Validation report + updated docs
Validation: Context reduction measured and documented
Result: Baseline context now ~50% lighter!
```

---

## Cycles 4-8: Skill Registry & Core Skills

**Goal:** Create 5 foundational skills + registry
**Agent:** All agents
**Benefit:** Reusable patterns, 30% faster feature building

### Cycle 4: Create Skill Registry
```
Task: Auto-discoverable skill system
  ├── Create .claude/skills/INDEX.md
  ├── Document all existing skills
  ├── Add metadata (name, description, agent, context)
  ├── Group by agent
  └── Version control

Deliverable: .claude/skills/INDEX.md with all skills indexed
Validation: All existing skills discoverable
```

### Cycle 5: Create optimize-schema Skill
```
Task: Auto-optimize Convex schema indexes
  ├── Create .claude/skills/agent-backend-optimize-schema.md
  ├── Test with existing schema
  ├── Measure time savings
  └── Document usage examples

Deliverable: agent-backend:optimize-schema skill
Time Saved: 45 min → 5 min (90% improvement)
Validation: Works on real schema
```

### Cycle 6: Create validate-components Skill
```
Task: Auto-validate React component props
  ├── Create .claude/skills/agent-frontend-validate-components.md
  ├── Test on 5 real components
  ├── Measure error detection rate
  └── Document patterns

Deliverable: agent-frontend:validate-components skill
Time Saved: 30 min → 3 min (90% improvement)
Validation: All test components pass validation
```

### Cycle 7: Create audit-accessibility Skill
```
Task: Auto-audit WCAG 2.1 AA compliance
  ├── Create .claude/skills/agent-designer-audit-accessibility.md
  ├── Add comprehensive checklist
  ├── Test on 3 existing components
  └── Document compliance mapping

Deliverable: agent-designer:audit-accessibility skill
Time Saved: 90 min → 2 min (98% improvement!)
Validation: Real components audited
```

### Cycle 8: Create generate-tests & pre-deploy-check Skills
```
Task: Create 2 quality/ops skills
  ├── Create agent-quality:generate-tests
  │   ├── Auto-generate unit + integration tests
  │   ├── Test on 3 real functions
  ├── Create agent-ops:pre-deploy-check
  │   ├── Deployment readiness validation
  │   ├── Environment + migration checks
  └── Integration test both

Deliverable: 2 new skills for quality + ops
Time Saved: 60+30 min → 5+2 min each
Validation: Tests pass on real code
```

---

## Cycles 9-13: Pre-Commit Hooks

**Goal:** Automate code validation before commits
**Agent:** agent-ops, agent-quality
**Benefit:** Catch issues early, zero bad commits

### Cycle 9: Create pre-commit-lint Hook
```
Task: Auto-format + lint before commit
  ├── Create .claude/hooks/pre-commit-lint.sh
  ├── Auto-run Prettier (format)
  ├── Auto-run ESLint (lint)
  ├── Show summary
  └── Allow easy disable

Deliverable: Working pre-commit hook
Validation: Test with intentionally bad code
```

### Cycle 10: Create pre-commit-test Hook
```
Task: Run relevant tests before commit
  ├── Create .claude/hooks/pre-commit-test.sh
  ├── Find changed files
  ├── Run affected tests only
  ├── Stop if any fail
  └── Show coverage

Deliverable: Smart test hook
Validation: Only affected tests run (speed!)
```

### Cycle 11: Create pre-commit-validate Hook
```
Task: Check ontology + structure alignment
  ├── Create .claude/hooks/pre-commit-validate.sh
  ├── Validate 6D ontology alignment
  ├── Check naming conventions
  ├── Scan for secrets
  └── Auto-fix where possible

Deliverable: Validation hook
Validation: Schema changes align with ontology
```

### Cycles 12-13: Hook Integration & Testing
```
Task: Test all 3 hooks together
  ├── Test pre-commit hook flow
  ├── Verify backward compatibility
  ├── Ensure smooth developer experience
  ├── Document any issues
  └── Iterate on feedback

Deliverable: All 3 hooks working smoothly
Validation: Zero developer friction
```

---

## Cycles 14-17: Integration & Documentation

**Goal:** Test everything together, measure improvements
**Agent:** All agents
**Benefit:** Validate Phase 1, prove ROI

### Cycle 14: Integration Testing
```
Task: Test skills + hooks together
  ├── Create feature using new skills
  ├── Run through commit → push workflow
  ├── Verify all hooks work
  ├── Measure total time
  └── Document workflow

Deliverable: End-to-end workflow validated
Validation: Feature builds 20%+ faster
```

### Cycle 15: Backward Compatibility Check
```
Task: Ensure nothing broke
  ├── Run old workflows without new skills
  ├── Verify hooks don't interfere
  ├── Test existing features
  ├── Check performance
  └── Validate metrics

Deliverable: Full backward compat report
Validation: All existing workflows still work
```

### Cycles 16-17: Measurement & Documentation
```
Task: Quantify improvements + document
  ├── Cycle 16: Run baseline measurements
  │   ├── Feature build time: 20s → ?
  │   ├── Context per cycle: 3K → ?
  │   ├── Agent utilization: 60% → ?
  │   └── Measure 5 sample features
  │
  ├── Cycle 17: Complete documentation
  │   ├── Update skill registry with metrics
  │   ├── Document hook usage
  │   ├── Create quick start guide
  │   ├── Gather team feedback
  │   └── Plan Phase 2
  │
  └── Team presentation of Phase 1 results

Deliverable: Metrics report + documentation
Validation: >20% productivity improvement measured
```

---

## Cycles 18-20: Phase 2 Preparation

**Goal:** Prepare for agent specialization phase
**Agent:** agent-director
**Benefit:** Clear roadmap for Phase 2

### Cycle 18: Retrospective & Lessons
```
Task: Capture what we learned
  ├── Review all phase 1 cycles
  ├── Document patterns + insights
  ├── Identify quick wins for phase 2
  ├── Note any blockers
  └── Update knowledge base

Deliverable: Phase 1 retrospective document
```

### Cycle 19: Phase 2 Planning
```
Task: Refine agent specialization plan
  ├── Define agent capability audit (Cycles 21-25)
  ├── Plan specialized agent contexts (Cycles 26-30)
  ├── Design cross-agent coordination (Cycles 31-35)
  ├── Schedule performance monitoring (Cycles 36-40)
  └── Create detailed cycle breakdowns

Deliverable: Phase 2 detailed plan (Cycles 21-40)
```

### Cycle 20: Team Sync & Approval
```
Task: Get team alignment on next phase
  ├── Present Phase 1 results
  ├── Demo new skills + hooks
  ├── Discuss Phase 2 roadmap
  ├── Get feedback + adjustments
  ├── Confirm Phase 2 scope
  └── Celebrate Phase 1!

Deliverable: Team approval for Phase 2
Validation: Team confidence in direction
```

---

## Success Metrics (Phase 1 Complete)

### Cycle 8 Target (Skills Ready)
```
✓ 5 core skills deployed
✓ Skill registry working
✓ Skills measurably save time
```

### Cycle 13 Target (Hooks Ready)
```
✓ 3 pre-commit hooks automated
✓ Zero developer friction
✓ Workflow smoother
```

### Cycle 17 Target (Phase 1 Complete)
```
✓ >20% productivity improvement measured
✓ Zero breaking changes
✓ All existing workflows validated
✓ Team trained on new tools
```

### Cycle 20 Target (Phase 2 Ready)
```
✓ Phase 1 complete & documented
✓ Phase 2 plan finalized
✓ Team alignment confirmed
✓ Ready to start agent specialization
```

---

## MCP Strategy (Cycles 1-3 Detail)

### Current State
```
Base context: 300-500 tokens
MCPs loaded globally: +1000 tokens per interaction
Total overhead: ~1K tokens wasted on every command
```

### Optimized State
```
Base context: 300-500 tokens (no change)
MCPs disabled globally: 0 tokens
Only subagents load MCPs when needed
Total: 1K token SAVINGS per interaction!

Over 100 cycles = 100K tokens saved!
That's massive context budget improvement.
```

### How It Works
```
/one command (main context, no MCPs)
  ↓ (minimal context)

/create backend-feature
  ↓ (Task tool invokes agent-backend)

agent-backend (subagent, loads what it needs)
  ├── If needs git: loads git MCP
  ├── If needs deployment: loads Cloudflare MCP
  └── Clean, focused context
```

### Benefits
1. **Cleaner base context** - Every command 30% lighter
2. **Faster reasoning** - Less context to process
3. **Better subagent focus** - Agents load exactly what they need
4. **Scalable** - More room for skills/hooks without bloat
5. **No user impact** - Everything still works, just cleaner

---

## Anthropic Context Management Integration

**Official Guidance:** https://claude.com/blog/context-management

Anthropic recommends two native approaches:

1. **Context Editing** - Auto-clears stale tool calls/results (29-39% improvement)
2. **Memory Tool** - Persistent file-based storage outside context window

### How Our MCP Strategy Complements This

```
Anthropic's Approach (Reactive Optimization):
  ├─ Context Editing: Clean up stale data when needed
  └─ Memory Tool: Store persistent data externally

Our MCP Optimization (Proactive Prevention):
  ├─ Disable MCPs globally: Don't load if not needed
  ├─ Subagent-on-demand: Load only when requested
  └─ Result: Clean baseline before Anthropic's tools even needed

Combined Impact:
  • Prevent unnecessary context bloat (our strategy)
  • Clean stale data when it appears (Anthropic's tools)
  • Store persistent knowledge externally (Anthropic's memory tool)
  • Result: 50%+ context reduction vs. starting point!
```

**Integration:** Use both strategies together for maximum efficiency.

---

## Key Principles

### 1. Cycle-Based Progress
- Each cycle = concrete deliverable
- Measurable progress weekly
- Clear dependencies

### 2. Subagent-Driven Specialization
- Main context stays lean (300-500 tokens)
- Subagents handle specialized work
- MCPs only when needed

### 3. Skill-Based Reusability
- Skills < 500 tokens base
- Examples loaded on-demand
- One pattern = all agents benefit

### 4. Validation-First
- Every cycle includes testing
- Backward compatibility checked
- Metrics measured continuously

---

## File Checklist

### Files to Create
```
Cycles 1-3:
  .claude/MCP_OPTIMIZATION.md (audit + plan)

Cycles 4-8:
  .claude/skills/INDEX.md
  .claude/skills/agent-backend-optimize-schema.md
  .claude/skills/agent-frontend-validate-components.md
  .claude/skills/agent-designer-audit-accessibility.md
  .claude/skills/agent-quality-generate-tests.md
  .claude/skills/agent-ops-pre-deploy-check.md

Cycles 9-13:
  .claude/hooks/pre-commit-lint.sh
  .claude/hooks/pre-commit-test.sh
  .claude/hooks/pre-commit-validate.sh

Cycles 14-20:
  PHASE_1_COMPLETION_REPORT.md
  PHASE_2_DETAILED_PLAN.md
```

### Files to Update
```
Cycles 1-3:
  mcp.json (disable MCPs)

Cycles 4-8:
  All agent files (add skill lists)

Cycles 18-20:
  things/plans/claude-code.md (refine based on learnings)
```

---

## Getting Started

### Right Now (Preparation)
1. Read this entire document
2. Review `.claude/CLAUDE_CODE_VISION.md` for context
3. Confirm you want to proceed with Phase 1

### Cycle 1 (This Week)
1. Complete the audit tasks (Cycle 1-3)
2. Measure current state
3. Turn off MCPs, validate everything still works

### Cycles 2-20 (Following Weeks)
1. Follow cycle-by-cycle breakdown
2. Complete deliverables
3. Measure, document, iterate

---

## Questions?

**How long is each cycle?**
3-7 days depending on complexity. Cycles 1-3 are light (mostly configuration). Cycles 4-8 are heavier (skill creation).

**Can I pause between cycles?**
Yes! Each cycle is independent. Pause after any cycle, then resume.

**What if something breaks?**
Every cycle includes validation. If issues arise, they're caught and fixed before moving forward.

**How much time per cycle?**
Light cycles: 2-4 hours
Medium cycles: 4-8 hours
Heavy cycles: 8-12 hours

Spread across the week, it's manageable alongside regular work.

---

**Built with clarity, cycle-based progress, and subagent specialization in mind.**

**Ready to begin?** Start with Cycle 1 this week. Measure, validate, iterate.
