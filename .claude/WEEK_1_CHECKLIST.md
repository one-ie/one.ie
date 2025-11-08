# Phase 1 Implementation Checklist (Cycles 1-20)

**Goal:** Foundation for 10x productivity
**Duration:** Cycles 1-20 (roughly 4-5 weeks)
**Effort:** Cycle-based breakdown
**Benefit:** 20% immediate productivity boost

---

## Cycles 1-3: MCP Optimization (Context Reduction)

### [ ] Document Review
- [ ] Read `.claude/CLAUDE_CODE_VISION.md` (5 min)
- [ ] Scan `things/plans/claude-code.md` Phase 1 (10 min)
- [ ] Review this checklist (5 min)

### [ ] Team Alignment
- [ ] Share CLAUDE_CODE_VISION.md with team
- [ ] Get feedback on Phase 1 scope
- [ ] Confirm resources available
- [ ] Schedule sync for Monday morning

### [ ] Setup
- [ ] Create feature branch: `enhance/claude-code-phase1`
- [ ] Create project in tracking system
- [ ] Set reminders for daily standup

---

## Day 1: Monday - Foundation

### [ ] Task 1: Skill Registry (1 hour)
**Goal:** Create centralized skill discovery system

```bash
Create .claude/skills/INDEX.md
├── Auto-discover all existing skills
├── Add metadata (name, description, agent, context)
├── Group by agent
├── Add version tracking
└── Include usage statistics
```

**Deliverable:** Indexed, organized skill list
**Validation:** All existing skills discoverable

### [ ] Task 2: Agent Skill Assignments (30 minutes)
**Goal:** Document which agent has which skills

```bash
Update each agent file:
├── .claude/agents/agent-backend.md
├── .claude/agents/agent-frontend.md
├── .claude/agents/agent-designer.md
├── .claude/agents/agent-quality.md
└── .claude/agents/agent-ops.md

Add section:
---
skills:
  - agent-name:skill-1
  - agent-name:skill-2
  - ... (existing skills)
---
```

**Deliverable:** All agents list their skills
**Validation:** Skills registry matches agent definitions

### [ ] Task 3: Create First Skill: optimize-schema (1.5 hours)
**Goal:** Create reusable schema optimization skill

```bash
Create .claude/skills/agent-backend-optimize-schema.md
├── Purpose: Auto-optimize Convex schema indexes
├── Problem: Manual index optimization is slow
├── Solution: Analyze schema, suggest + implement indexes
├── Input: Convex schema.ts
├── Output: Optimized schema with better indexes
├── Time saved: 45 min → 5 min (90% improvement)
└── Template: Copy from existing skill file
```

**Deliverable:** Tested schema optimization skill
**Validation:** Test with existing schema

### [ ] Daily Standup (15 minutes)
- Review progress
- Identify blockers
- Adjust if needed

**End of Day 1:** Skills registry live, 1 new skill

---

## Day 2: Tuesday - Skills (4 More)

### [ ] Task 4: Create validate-components Skill (1 hour)
**Goal:** Auto-validate React component props

```bash
Create .claude/skills/agent-frontend-validate-components.md
├── Purpose: Check component prop types and usage
├── Problem: Runtime errors from wrong props
├── Solution: Validate props against TypeScript types
├── Input: Component file
├── Output: Validation report + fixes
├── Time saved: 30 min → 3 min (90% improvement)
└── Include: Real example from codebase
```

**Deliverable:** Component validation skill
**Validation:** Test on 5 real components

### [ ] Task 5: Create audit-accessibility Skill (1 hour)
**Goal:** Auto-audit designs for WCAG compliance

```bash
Create .claude/skills/agent-designer-audit-accessibility.md
├── Purpose: Check WCAG 2.1 AA compliance
├── Problem: Manual accessibility testing is slow
├── Solution: Auto-check contrast, focus, navigation
├── Input: Design/component
├── Output: Compliance report + suggestions
├── Time saved: 90 min → 2 min (98% improvement)
└── Include: Real checklist from WCAG
```

**Deliverable:** Accessibility audit skill
**Validation:** Test on existing components

### [ ] Task 6: Create generate-tests Skill (1 hour)
**Goal:** Auto-generate unit + integration tests

```bash
Create .claude/skills/agent-quality-generate-tests.md
├── Purpose: Auto-generate test suites
├── Problem: Writing tests is tedious
├── Solution: Analyze code, generate comprehensive tests
├── Input: Code file (function, component, mutation)
├── Output: Full test suite ready to run
├── Time saved: 60 min → 5 min (92% improvement)
└── Include: Test patterns library
```

**Deliverable:** Test generation skill
**Validation:** Generate tests for 3 real functions

### [ ] Task 7: Create pre-deploy-check Skill (1 hour)
**Goal:** Pre-deployment safety checks

```bash
Create .claude/skills/agent-ops-pre-deploy-check.md
├── Purpose: Validate deployment readiness
├── Problem: Deployments fail due to missing checks
├── Solution: Auto-check env vars, migrations, health
├── Input: Deployment target
├── Output: Go/No-go decision + fixes
├── Time saved: 30 min → 2 min (94% improvement)
└── Include: Checklist for web + backend
```

**Deliverable:** Pre-deploy check skill
**Validation:** Test on staging deployment

### [ ] Daily Standup (15 minutes)

**End of Day 2:** 5 new skills created (registry + 4 skills)

---

## Day 3: Wednesday - Hooks

### [ ] Task 8: Create Pre-Commit Lint Hook (45 minutes)
**Goal:** Auto-format and lint code before commit

```bash
Create .claude/hooks/pre-commit-lint.sh
├── Trigger: git hook (pre-commit)
├── Action 1: Run Prettier (auto-format)
├── Action 2: Run ESLint (auto-fix)
├── Action 3: Show summary
├── Exit code: 0 if success, 1 if fail
├── Logging: Use hook-logger.sh
└── Rollback: Simple disable mechanism
```

**Deliverable:** Working pre-commit hook
**Validation:** Test with intentionally bad code

### [ ] Task 9: Create Pre-Commit Test Hook (1 hour)
**Goal:** Run relevant tests before commit

```bash
Create .claude/hooks/pre-commit-test.sh
├── Trigger: git hook (pre-commit)
├── Action 1: Find changed files
├── Action 2: Run relevant tests
├── Action 3: Stop if any fail
├── Action 4: Show coverage
├── Logging: Track test results
└── Speed: Only run affected tests
```

**Deliverable:** Smart test hook
**Validation:** Verify only affected tests run

### [ ] Task 10: Create Pre-Commit Validation Hook (45 minutes)
**Goal:** Validate ontology and structure

```bash
Create .claude/hooks/pre-commit-validate.sh
├── Trigger: git hook (pre-commit)
├── Action 1: Check 6D ontology alignment
├── Action 2: Validate file naming
├── Action 3: Check for secrets
├── Logging: Show all violations
└── Auto-fix: Attempt fixes where possible
```

**Deliverable:** Validation hook
**Validation:** Test with schema changes

### [ ] Daily Standup (15 minutes)

**End of Day 3:** 3 pre-commit hooks + 5 skills = 8 deliverables

---

## Day 4: Thursday - Integration

### [ ] Task 11: Test All Skills Together (1 hour)
**Goal:** Ensure skills work in combination

```bash
Test scenario 1: Create form component
├── Step 1: Use agent-frontend:form-builder
├── Step 2: Run pre-commit hooks
├── Step 3: Run agent-frontend:validate-components
├── Step 4: Run agent-quality:generate-tests
├── Step 5: Commit with all hooks
└── Verify: Everything works smoothly
```

**Deliverable:** Integrated workflow validation
**Validation:** Zero errors, clean commit

### [ ] Task 12: Test Hooks Don't Break Existing Workflow (1 hour)
**Goal:** Ensure backward compatibility

```bash
Test scenario 1: Commit complex schema change
├── Step 1: Make schema change
├── Step 2: Run pre-commit hooks
├── Step 3: Fix any issues
├── Step 4: Commit successfully
└── Verify: Hooks help, don't hinder

Test scenario 2: Commit to different files
├── Component change (should trigger certain hooks)
├── Backend change (should trigger different hooks)
├── Documentation change (should skip test hook)
└── Verify: Smart hook triggering
```

**Deliverable:** Hook robustness validation
**Validation:** All existing workflows still work

### [ ] Task 13: Documentation (1 hour)
**Goal:** Document what was created

```bash
Create .claude/PHASE_1_WEEK_1_SUMMARY.md
├── What was created (8 deliverables)
├── How to use each skill
├── How to use each hook
├── Common issues and fixes
├── Performance improvements measured
├── Quick start guide
└── Next steps (week 2)
```

**Deliverable:** Complete documentation
**Validation:** Team can use everything without help

### [ ] Daily Standup (15 minutes)

**End of Day 4:** All phase 1 week 1 work complete + documented

---

## Day 5: Friday - Measurement & Review

### [ ] Task 14: Measure Baseline Improvements (1.5 hours)
**Goal:** Quantify the productivity gain

```bash
Measurement 1: Feature Build Time
├── Pick a typical feature
├── Build WITHOUT new skills/hooks
├── Record time: ___ minutes
├── Build same feature WITH new skills/hooks
├── Record time: ___ minutes
├── Calculate improvement: ___%
└── Target: >20% faster

Measurement 2: Code Quality
├── Count linting issues before auto-fix: __
├── Count after: __
├── Count test failures before validation: __
├── Count after: __
├── Calculate improvement: ___%
└── Target: >30% improvement

Measurement 3: Developer Experience
├── Survey team: How easy to use? (1-5)
├── What was helpful? (feedback)
├── What needs improvement? (feedback)
└── Sentiment: ___/5
```

**Deliverable:** Baseline measurements
**Validation:** Data-driven improvements documented

### [ ] Task 15: Team Demo & Feedback (1 hour)
**Goal:** Show what was built and get feedback

```bash
Demo Agenda:
├── Show skill registry (5 min)
├── Demo 5 new skills in action (15 min)
├── Demo pre-commit hooks (10 min)
├── Show measurements & improvements (10 min)
├── Gather feedback (15 min)
└── Discuss week 2 adjustments (5 min)
```

**Deliverable:** Team alignment on progress
**Validation:** Get consensus on direction

### [ ] Task 16: Week 1 Retrospective (1 hour)
**Goal:** Capture lessons learned

```bash
Document:
├── What went well
├── What was challenging
├── What to improve for week 2
├── Team feedback summary
├── Measurement results
├── Next week priorities
└── Any blocking issues
```

**Deliverable:** Lessons for continuous improvement
**Validation:** Documented in .claude/lessons/week1.md

### [ ] Final Standup (15 minutes)
- Celebrate week 1 completion
- Confirm week 2 start time
- Address any blockers

**End of Week 1:** 8 deliverables, measurements, team feedback

---

## Deliverables Summary

### Created This Week

```
Skills: 5
  ✅ .claude/skills/agent-backend-optimize-schema.md
  ✅ .claude/skills/agent-frontend-validate-components.md
  ✅ .claude/skills/agent-designer-audit-accessibility.md
  ✅ .claude/skills/agent-quality-generate-tests.md
  ✅ .claude/skills/agent-ops-pre-deploy-check.md

Hooks: 3
  ✅ .claude/hooks/pre-commit-lint.sh
  ✅ .claude/hooks/pre-commit-test.sh
  ✅ .claude/hooks/pre-commit-validate.sh

Registry: 1
  ✅ .claude/skills/INDEX.md (auto-discovery)

Documentation: 1
  ✅ .claude/PHASE_1_WEEK_1_SUMMARY.md

Updates: 5
  ✅ .claude/agents/agent-backend.md (skills list)
  ✅ .claude/agents/agent-frontend.md (skills list)
  ✅ .claude/agents/agent-designer.md (skills list)
  ✅ .claude/agents/agent-quality.md (skills list)
  ✅ .claude/agents/agent-ops.md (skills list)
```

### Validation Gates

```
✅ All skills work individually
✅ All skills work in combination
✅ Hooks don't break existing workflow
✅ Backward compatibility maintained
✅ Documentation complete
✅ Team trained on new capabilities
✅ Measurements show >20% improvement
✅ Team consensus on direction
```

---

## Time Allocation

```
Day 1: Skills Foundation (3.5 hours)
  ├── Skill registry (1 hour)
  ├── Agent assignments (0.5 hours)
  └── First skill (1.5 hours)

Day 2: More Skills (4 hours)
  ├── 4 additional skills (1 hour each)

Day 3: Hooks (2.5 hours)
  ├── Pre-commit lint (0.75 hours)
  ├── Pre-commit test (1 hour)
  └── Pre-commit validate (0.75 hours)

Day 4: Integration (3 hours)
  ├── Testing together (1 hour)
  ├── Backward compatibility (1 hour)
  └── Documentation (1 hour)

Day 5: Measurement & Review (3.5 hours)
  ├── Measurements (1.5 hours)
  ├── Demo (1 hour)
  └── Retrospective (1 hour)

Total: 16.5 hours (fits in 1 developer-week)
```

---

## Success Criteria

### Week 1 Success = All of These
- [ ] 5 new skills deployed and tested
- [ ] 3 pre-commit hooks working
- [ ] Skill registry automated
- [ ] No breaking changes to existing workflows
- [ ] >20% productivity improvement measured
- [ ] Team trained and confident
- [ ] Clear path to week 2

### Stretch Goals (If Ahead)
- [ ] 2 pre-push hooks created
- [ ] 2 additional skills (total 7)
- [ ] Performance dashboard started
- [ ] Skill usage analytics

---

## Risk Mitigation

### Risk: Hooks block developers
**Mitigation:** Each hook has simple disable mechanism
**Contingency:** Revert hook, fix, redeploy

### Risk: Skills don't work as expected
**Mitigation:** Thorough testing before team use
**Contingency:** Keep old approach available

### Risk: Time overrun
**Mitigation:** Prioritize core 5 skills + 3 hooks
**Contingency:** Reduce scope to just registry + 1 skill

### Risk: Team adoption resistance
**Mitigation:** Show clear benefits in measurements
**Contingency:** Make everything optional initially

---

## Resources Needed

### Time
- 1 engineer: 40 hours (full week)
- Team: 2 hours total (demo + feedback)

### Tools
- Git (already have)
- Node/Bun (already have)
- Documentation editor (already have)
- Measurement tools (simple scripts)

### Knowledge
- Existing skill format (reference existing skills)
- Hook system (reference existing hooks)
- 6D ontology (reference CLAUDE.md)
- Agent capabilities (reference agent files)

---

## Next Steps After Week 1

### Week 2 Planned
- 4 more pre-commit/push/deploy hooks
- 10 additional skills (expand to other agents)
- Integration improvements
- Performance optimization

### Week 3-4 (Phase 1 Complete)
- Agent specialization starts (Phase 2 prep)
- Knowledge capture system
- Skill recommendations
- Cross-team feedback

---

## Questions?

**Need clarification on any task?**
1. Check `.claude/CLAUDE_CODE_VISION.md` for context
2. Check `things/plans/claude-code.md` for detailed spec
3. Reference existing skills/hooks for patterns
4. Ask team in sync meeting

**Running behind schedule?**
1. Prioritize: Registry (1h) + 3 core skills (3h) + 2 hooks (1.5h)
2. That's 5.5 hours minimum viable week 1
3. Rest can move to week 2

**Early finish?**
1. Add stretch goals above
2. Start week 2 early
3. Extra time for testing/documentation

---

## Commit & Push Schedule

```
Monday end of day: .claude/skills/INDEX.md
Tuesday end of day: 4 skills created
Wednesday end of day: 3 hooks created
Thursday end of day: Testing + documentation
Friday end of day: Feature branch ready for review

Commit format:
feat: Phase 1 Week 1 - Skills + Hooks Foundation

- Add skill registry with auto-discovery
- Create 5 new skills (optimize-schema, validate-components, etc.)
- Add 3 pre-commit hooks (lint, test, validate)
- Update agent skill assignments
- Add comprehensive documentation
- Measure 20%+ productivity improvement
```

---

## Ready to Start?

1. ✅ Review this checklist
2. ✅ Read `.claude/CLAUDE_CODE_VISION.md` for context
3. ✅ Get team alignment
4. ✅ Create feature branch
5. ✅ Start Day 1, Task 1

**You've got this! 💪**

---

**Built with clarity, focus, and achievable goals.**

**Version:** 1.0.0
**Date:** 2025-11-08
**Status:** Ready for implementation
