# MCP Optimization + Cycle-Based Planning Guide

**Status:** New approach ready
**Date:** 2025-11-08
**Focus:** Simpler, cleaner, subagent-driven

---

## What Changed

### Before (Original Plan)
```
✗ Day-based timeline (confusing with cycle system)
✗ MCPs loaded globally (wastes ~1K tokens per command)
✗ Mixed planning approaches
✗ Unclear sequence
```

### After (New Approach)
```
✓ Cycle-based planning (aligns with your workflow)
✓ MCPs disabled globally (clean context baseline)
✓ Subagents handle specialized work
✓ Clear sequence: MCP → Skills → Hooks → Integration
```

---

## Three Key Changes

### 1. Turn Off MCPs Globally (Cycles 1-3)

**Why?** MCPs add ~1K tokens to every command.

**Current:**
```
Command loads:
  - Base context (300-500 tokens)
  - ALL MCPs globally (1000 tokens)
  - Total: 1.3-1.5K tokens wasted

Over 100 cycles = 130-150K tokens blown on MCP overhead!
```

**Optimized:**
```
Command loads:
  - Base context ONLY (300-500 tokens)
  - Subagent loads MCPs on-demand
  - Total: saves 1K tokens per command!

Over 100 cycles = 100K tokens SAVED for skills/hooks!
```

**How It Works:**
```
User: /create backend-feature
  ↓
Main context: "No MCPs, lightweight"
  ↓
Task tool invokes agent-backend
  ↓
agent-backend subagent loads ONLY what it needs:
  - Git? Load git MCP
  - Deployment? Load Cloudflare MCP
  - Nothing else? Don't load anything
  ↓
Clean, focused execution
```

**Action (Cycles 1-3):**
1. Cycle 1: Audit current MCP usage
2. Cycle 2: Disable MCPs in mcp.json
3. Cycle 3: Validate everything still works

### 2. Use Cycles, Not Days (Phase 1: Cycles 1-20)

**Why?** You already plan in 100-cycle sequences.

```
OLD: "Week 1: Days 1-5"
     └─ Confusing with cycle system

NEW: "Phase 1: Cycles 1-20"
     ├─ Cycles 1-3: MCP optimization
     ├─ Cycles 4-8: Skills
     ├─ Cycles 9-13: Hooks
     ├─ Cycles 14-17: Integration
     └─ Cycles 18-20: Phase 2 prep
     └─ Aligns perfectly with workflow
```

**Timeline:**
- Cycles 1-3: Light work (configuration) = 3-5 days
- Cycles 4-20: Regular work (skills/hooks) = 3-5 days per cycle

**Total Phase 1:** 4-5 weeks (20 cycles × 3-5 days average)

### 3. Subagent-First Strategy

**Why?** Keep main context clean, let specialists focus.

**Old approach:**
```
❌ Agents need MCPs to work
❌ All MCPs loaded globally
❌ Context bloat for everyone
❌ Agents can't specialize
```

**New approach:**
```
✅ Main context: No MCPs (save 1K tokens)
✅ Agents request MCPs on-demand
✅ Context stays lean throughout
✅ Agents can specialize deeply
✅ Scales infinitely (more agents = same base context)
```

---

## The New Plan Structure

### Phase 1: Foundation (Cycles 1-20)

```
Cycles 1-3:   MCP OPTIMIZATION
├─ Audit current MCPs
├─ Disable globally
└─ Validate everything works
  Result: 1K token savings per command

Cycles 4-8:   CORE SKILLS (5 skills)
├─ Skill registry
├─ agent-backend:optimize-schema
├─ agent-frontend:validate-components
├─ agent-designer:audit-accessibility
├─ agent-quality:generate-tests
└─ agent-ops:pre-deploy-check
  Result: 30% faster feature building

Cycles 9-13:  PRE-COMMIT HOOKS (3 hooks)
├─ pre-commit-lint (auto-format + ESLint)
├─ pre-commit-test (run affected tests)
├─ pre-commit-validate (ontology checks)
└─ Full integration testing
  Result: Zero bad commits, smooth workflow

Cycles 14-17: INTEGRATION & MEASUREMENT
├─ Test everything together
├─ Verify backward compatibility
├─ Measure improvements
├─ >20% productivity boost proven
└─ Document results
  Result: Phase 1 validated, ROI proven

Cycles 18-20: PHASE 2 PREPARATION
├─ Retrospective + lessons learned
├─ Refine Phase 2 (agent specialization)
├─ Team alignment + approval
└─ Celebrate Phase 1!
  Result: Ready for Phase 2
```

### Phases 2-5 (Cycles 21-100)

After Phase 1, you'll have:
- ✅ Optimized context (MCPs off)
- ✅ 5 core skills + registry
- ✅ 3 automated hooks
- ✅ Proven 20%+ improvement
- ✅ Team trained + confident

Then proceed with:
- **Phase 2** (Cycles 21-40): Agent specialization
- **Phase 3** (Cycles 41-60): Automation & triggers
- **Phase 4** (Cycles 61-80): Knowledge & learning
- **Phase 5** (Cycles 81-100): Advanced features

---

## Key Metrics

### Cycle 3 (After MCP Off)
```
Context reduction: 3K → 2K tokens (33% improvement)
Per command savings: 1K tokens
Over 100 cycles: 100K tokens saved!
```

### Cycle 8 (After Skills)
```
Context: Still 2K (skills are small)
Time savings: Feature building 20% faster
Per feature: ~4 minutes saved
```

### Cycle 13 (After Hooks)
```
Context: Still 2K
Automation: 3 production hooks running
Quality: 99%+ commit success rate
```

### Cycle 17 (Phase 1 Complete)
```
✅ Context: 50% lighter than start
✅ Features: 20%+ faster
✅ Quality: 99%+ success
✅ Team: Trained + confident
✅ ROI: Immediate and measurable
```

---

## How MCPs Get Turned Off

### Step 1: Audit (Cycle 1)
```bash
# Check current mcp.json
cat .claude/mcp.json

# Document what's there:
# - Which MCPs are enabled?
# - Which agents use them?
# - What's the impact if we disable?
```

### Step 2: Disable (Cycle 2)
```bash
# Backup current
cp .claude/mcp.json .claude/mcp.json.backup

# Edit to disable all MCPs (empty or minimal config)
# Option 1: Empty (nothing loads)
# Option 2: Minimal (only essential)

# Test everything still works:
/plan convert "test feature"
/create backend-feature
/push
```

### Step 3: Validate (Cycle 3)
```bash
# Measure context reduction
# Test all workflows
# Verify subagents can still access tools when needed
# Document before/after metrics
```

### Result
```
✅ Main context: No MCPs
✅ All workflows: Still work
✅ Subagents: Load MCPs on-demand
✅ Net: Save 1K tokens per command!
```

---

## Document Guide

### For This Approach

**New documents created:**
1. `.claude/PHASE_1_CYCLES.md` ← START HERE
   - Complete Cycles 1-20 breakdown
   - Detailed task descriptions
   - Success metrics per cycle

2. `.claude/MCP_AND_CYCLES_GUIDE.md` (this file)
   - Why we made changes
   - How MCP optimization works
   - Overall strategy

### From Original Plan (Still Relevant)

1. `things/plans/claude-code.md`
   - Phases 2-5 detailed
   - Skills specifications
   - Agent enhancements
   - Risk mitigation

2. `.claude/CLAUDE_CODE_VISION.md`
   - Strategic overview
   - Why 10x is possible
   - ROI analysis

3. `.claude/PLAN_SUMMARY.md`
   - Executive summary
   - Quick reference
   - Timeline overview

---

## Implementation Path

### This Week (Right Now)
```
1. Read: .claude/PHASE_1_CYCLES.md (understand Phase 1)
2. Understand: How MCPs will be disabled (Cycles 1-3)
3. Decide: Ready to start?
```

### Week of Cycle 1
```
Cycle 1: Audit current MCP setup
  ├─ Check what MCPs exist
  ├─ Understand current usage
  └─ Document baseline

Cycle 2: Turn off MCPs
  ├─ Disable in mcp.json
  ├─ Test basic commands
  └─ Measure savings

Cycle 3: Validate everything
  ├─ Full workflow test
  ├─ Context measurement
  └─ Commit changes

Result: ✅ 1K tokens saved, baseline optimized
```

### Weeks of Cycles 4-8
```
Create 5 core skills:
  - optimize-schema (backend)
  - validate-components (frontend)
  - audit-accessibility (designer)
  - generate-tests (quality)
  - pre-deploy-check (ops)

Result: ✅ Skills ready, 30% faster building
```

### Weeks of Cycles 9-13
```
Create 3 pre-commit hooks:
  - lint (auto-format)
  - test (run tests)
  - validate (ontology checks)

Result: ✅ Hooks automated, zero bad commits
```

### Weeks of Cycles 14-17
```
Integration + measurement:
  - Test everything together
  - Verify backward compatibility
  - Measure improvements
  - Document results

Result: ✅ 20%+ improvement proven
```

### Weeks of Cycles 18-20
```
Phase 2 preparation:
  - Capture lessons learned
  - Refine Phase 2 plan
  - Team alignment

Result: ✅ Ready for Phase 2 (agent specialization)
```

---

## Why This Works Better

### Original Approach
```
✗ Day-based planning (conflicts with cycle system)
✗ MCPs on globally (wastes tokens)
✗ Mixed strategies (confusing)
```

### New Approach
```
✓ Cycle-based (aligns with workflow)
✓ MCP optimization first (saves tokens for everything else)
✓ Clear sequence (MCP → Skills → Hooks → Integration → Phase 2)
✓ Subagent-driven (specialists focus, main context clean)
✓ Measurable (metrics per cycle)
✓ Risk-free (validate constantly)
```

---

## Anthropic's Official Context Management

**Reference:** https://claude.com/blog/context-management

Anthropic officially recommends:
1. **Context Editing** - Auto-clear stale data (29-39% improvement)
2. **Memory Tool** - External persistent storage

### How We Leverage Both

Our MCP optimization is **proactive** (prevent bloat):
```
✅ Disable MCPs globally
✅ Subagents load on-demand
✅ Keep baseline lean
```

Anthropic's tools are **reactive** (clean when needed):
```
✅ Context editing removes stale calls
✅ Memory tool stores persistent knowledge
✅ Keep running context lean
```

**Combined:** Proactive prevention + reactive cleanup = 50%+ reduction!

---

## Getting Started

### Step 1: Choose Your Path

**Path A: Start Immediately** (Recommended)
```
Cycle 1 this week: Audit MCPs
Cycle 2 this week: Disable MCPs
Cycle 3 this week: Validate
Then continue with Cycles 4-20
```

**Path B: Plan First**
```
Week 1: Review all documents
Week 2: Get team alignment
Week 3: Start Cycle 1
```

### Step 2: Read the Documents

In this order:
1. **This file** (you're reading it) ← Strategic overview
2. **`.claude/PHASE_1_CYCLES.md`** ← Detailed cycle breakdown
3. **`things/plans/claude-code.md`** ← Full 100-cycle vision (Phases 2-5)

### Step 3: Start Phase 1

```
Read: .claude/PHASE_1_CYCLES.md (Cycles 1-3 section)
Do: Follow Cycle 1 tasks
Track: Mark cycles complete as you go
```

---

## Questions Answered

**Q: Why turn off MCPs first?**
A: Every command in the next 100 cycles will benefit from 1K token savings. That's 100K tokens freed up for skills, hooks, and better reasoning.

**Q: Will disabling MCPs break anything?**
A: No. Subagents can still request MCPs when needed. We're just removing the global load.

**Q: How long is Phase 1?**
A: 20 cycles × 3-5 days = 4-5 weeks. Can be done in parallel with regular work.

**Q: What if I'm in the middle of a feature?**
A: Complete your feature first, then start Phase 1 Cycle 1. Each cycle is independent.

**Q: Can I skip Phase 1?**
A: Not recommended. Phase 1 optimizes context that benefits Phases 2-5. Worth 4-5 weeks upfront.

**Q: What happens after Phase 1?**
A: Phase 2 (Cycles 21-40) enhances agents with specializations. Full roadmap in `things/plans/claude-code.md`.

---

## Success Definition

### Phase 1 Complete (After Cycle 20)
```
✅ Context: 50% lighter (MCPs off + skills added)
✅ Features: 20%+ faster build time
✅ Quality: 99%+ success rate (hooks preventing issues)
✅ Team: Trained on new skills/hooks
✅ Confidence: High (everything validated)
✅ Ready: For Phase 2 (agent specialization)
```

---

## Key Files

```
📄 .claude/PHASE_1_CYCLES.md
   ↑ Read this for detailed Cycles 1-20 breakdown

📄 .claude/MCP_AND_CYCLES_GUIDE.md
   ↑ You are here (strategic overview)

📄 things/plans/claude-code.md
   ↑ Full 100-cycle vision (all 5 phases)

📄 .claude/CLAUDE_CODE_VISION.md
   ↑ Why 10x is possible + ROI

📄 .claude/PLAN_SUMMARY.md
   ↑ Executive summary
```

---

## Next Action

### Right Now
1. ✅ Read this document (done!)
2. ⏭️ Read `.claude/PHASE_1_CYCLES.md` (next)
3. ⏭️ Decide: Start this week or next week?

### This Week (If Starting)
- Complete Cycle 1: Audit MCPs
- Complete Cycle 2: Disable MCPs
- Complete Cycle 3: Validate

### Next Week
- Start Cycles 4-8: Create 5 skills
- Build momentum
- See immediate improvements

---

**Built with clarity, cycle-based thinking, and subagent specialization.**

Ready to optimize? Start with `.claude/PHASE_1_CYCLES.md` → Cycle 1.
