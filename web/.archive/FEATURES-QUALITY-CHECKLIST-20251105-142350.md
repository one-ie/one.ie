# Feature Documentation Quality Checklist

Complete checklist to validate feature documentation before publication. Use this guide to ensure all features meet quality standards.

## Quick Reference

**Time to complete:** 10-15 minutes per feature
**Print this page** for easy reference during review
**Score features** using the rubric at the end

---

## Phase 1: Metadata Completeness (5 minutes)

### Required Fields

- [ ] **`title`**
  - [ ] Clear feature name (not technical jargon)
  - [ ] Proper case (Title Case, not UPPERCASE)
  - [ ] Under 60 characters
  - [ ] No special characters except hyphens/apostrophes

- [ ] **`description`**
  - [ ] One-sentence summary
  - [ ] Under 140 characters (mobile card friendly)
  - [ ] Leads with BENEFIT, not feature
  - [ ] No marketing fluff or ALL CAPS
  - [ ] Example: "Let users log in however they prefer"

- [ ] **`featureId`**
  - [ ] Matches filename exactly (without .md)
  - [ ] Lowercase kebab-case (no spaces, no underscores)
  - [ ] Unique across all features (no duplicates)
  - [ ] No special characters except hyphens
  - [ ] Example: `two-factor-authentication`, `ecommerce-cart`

- [ ] **`category`**
  - [ ] Exactly ONE of: authentication, ecommerce, ai-agents, protocols, payments, analytics, content, communication, infrastructure, integrations, developer-tools, other
  - [ ] Matches feature purpose
  - [ ] NOT multiple categories
  - [ ] NOT made-up categories

- [ ] **`status`**
  - [ ] ONE of: planned, in_development, beta, completed, deprecated
  - [ ] Matches actual development state
  - [ ] NOT spelling variations (e.g., "in-development" vs "in_development")

### Recommended Fields

- [ ] **`version`**
  - [ ] Semantic versioning format (MAJOR.MINOR.PATCH)
  - [ ] Example: `1.0.0`, `2.1.3`, not `v1.0` or `version 1`
  - [ ] Incremented when feature content changes
  - [ ] Starts at `1.0.0` for new features

- [ ] **`releaseDate`** or **`plannedDate`**
  - [ ] ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
  - [ ] Example: `2025-11-04T00:00:00Z`
  - [ ] Actual date (not "TBD" or placeholder)
  - [ ] Set ONE date (releaseDate if complete, plannedDate if planned)

- [ ] **`organization`**
  - [ ] Set to "ONE Platform" or customer organization
  - [ ] Clear who owns/builds this

- [ ] **`assignedSpecialist`**
  - [ ] Agent name that built this (agent-backend, agent-frontend, etc)
  - [ ] Helps with knowledge tracking

- [ ] **`createdAt` / `updatedAt`**
  - [ ] Both dates in ISO format
  - [ ] `updatedAt` is today if making changes
  - [ ] `createdAt` is when feature was first documented

- [ ] **`draft`**
  - [ ] Set to `false` to publish
  - [ ] Set to `true` to hide (still in progress)

---

## Phase 2: Marketing Positioning (3 minutes)

Check the `marketingPosition` object:

### Required

- [ ] **`tagline`** (5-10 words)
  - [ ] Punchy, memorable benefit statement
  - [ ] NOT too technical
  - [ ] NOT a feature description
  - [ ] Examples:
    - ✓ "Zero friction. Bank-level security."
    - ✓ "Let users log in one click."
    - ✗ "Multi-method authentication system"
    - ✗ "Supports OAuth and magic links"

- [ ] **`valueProposition`** (1-2 sentences)
  - [ ] Explains WHY this matters (not WHAT it does)
  - [ ] Includes business impact if possible
  - [ ] Speaks to user pain point
  - [ ] Examples:
    - ✓ "Reduce signup abandonment from 45% to 8%. Users authenticate their preferred way."
    - ✓ "Cut support volume in half with AI handling common questions."
    - ✗ "Provides multiple authentication methods for signing in"
    - ✗ "Uses OAuth, magic links, and 2FA"

- [ ] **`targetAudience`** (array of 2-4 specific personas)
  - [ ] NOT generic like "users", "companies", "people"
  - [ ] Specific: "SaaS platforms", "E-commerce stores", "Creator platforms"
  - [ ] 2-4 items (not too many)
  - [ ] Each item is who would BUY this, not all customers
  - [ ] Examples:
    - ✓ ["SaaS platforms", "E-commerce stores", "Creator platforms"]
    - ✗ ["Everyone", "All users", "Businesses"]
    - ✗ Too many: ["HR apps", "Payroll platforms", "Benefits platforms", ...]

- [ ] **`competitiveAdvantage`** (1-2 sentences)
  - [ ] What makes it BETTER than alternatives
  - [ ] NOT generic ("it's good" or "it works")
  - [ ] Concrete differentiator
  - [ ] Examples:
    - ✓ "Better Auth + Convex = Fastest passwordless auth with real-time sync"
    - ✓ "Integrated RAG enables AI to answer customer-specific questions"
    - ✗ "Good security and fast"
    - ✗ "Works great"

- [ ] **`pricingImpact`**
  - [ ] ONE of: free, starter, pro, enterprise
  - [ ] Reflects actual billing tier
  - [ ] Consistent across similar features

---

## Phase 3: Ontology Mapping (5 minutes)

### `ontologyDimensions` Array

- [ ] 2-6 dimensions listed
- [ ] Each one actually used in feature
- [ ] Uses exact names: "Groups", "People", "Things", "Connections", "Events", "Knowledge"
- [ ] No typos or variations

**Reference:**
```
Groups       - Multi-tenant organization scoping
People       - Users, roles, authorization
Things       - Entities, objects, data
Connections  - Relationships between entities
Events       - Actions, audit trail
Knowledge    - Search, RAG, embeddings, labels
```

### `ontologyMapping` Object

For EACH dimension listed in `ontologyDimensions`:

- [ ] **Groups** (if listed)
  - [ ] Explains how feature scopes to organizations
  - [ ] Mentions `groupId` or multi-tenant isolation
  - [ ] NOT empty/placeholder text
  - [ ] Example: "Auth is scoped per organization with isolated settings"

- [ ] **People** (if listed)
  - [ ] Explains roles and access control
  - [ ] Mentions who can do what
  - [ ] Example: "org_owner can configure, org_user can use"

- [ ] **Things** (if listed)
  - [ ] Lists what entities are created/modified
  - [ ] Describes key properties
  - [ ] Example: "Represents users, sessions, devices"

- [ ] **Connections** (if listed)
  - [ ] Explains relationships created
  - [ ] Example: "Manages user→device sessions"

- [ ] **Events** (if listed)
  - [ ] Lists what actions are logged
  - [ ] Example: "Logs signin, logout, 2fa_enabled events"

- [ ] **Knowledge** (if listed)
  - [ ] Explains what's searchable/labeled
  - [ ] Example: "Enables search for user activity"

---

## Phase 4: Technical Specification (3 minutes)

Check `specification` object:

- [ ] **`complexity`**
  - [ ] ONE of: simple, moderate, complex, expert
  - [ ] Honest assessment
  - [ ] Matches actual implementation

- [ ] **`technologies`** (if applicable)
  - [ ] Lists frameworks/tools actually used
  - [ ] Examples: React, Convex, TypeScript, Zod, etc
  - [ ] 3-5 items (not too many)

- [ ] **`dependencies`** (if applicable)
  - [ ] Lists other features this depends on
  - [ ] Real dependencies (not all features)
  - [ ] Examples: email-service, user-management

- [ ] **`apiEndpoints`** (if applicable)
  - [ ] Each endpoint has: method, path, description
  - [ ] HTTP method is correct (GET, POST, PUT, etc)
  - [ ] Path follows RESTful conventions
  - [ ] Description is clear (not technical jargon)
  - [ ] All endpoints actually exist (not placeholder)

- [ ] **`estimatedHours`** (if applicable)
  - [ ] Realistic estimate
  - [ ] Based on actual implementation
  - [ ] 0-1000+ hours range

---

## Phase 5: Quality Metrics (2 minutes)

Check `metrics` object:

- [ ] **`testCoverage`** (0-100)
  - [ ] Based on ACTUAL test results
  - [ ] NOT guessed or imagined
  - [ ] Realistic (95%+ is rare)
  - [ ] Documented test suite exists

- [ ] **`performanceScore`** (0-100)
  - [ ] Actual Lighthouse score
  - [ ] Tested on real hardware
  - [ ] Mobile and desktop tested
  - [ ] 90+ is good, 85-90 is acceptable

- [ ] **`accessibilityScore`** (0-100)
  - [ ] WCAG compliance level checked
  - [ ] Manual accessibility testing done
  - [ ] 100 is ideal, 95+ is acceptable
  - [ ] Screen reader tested

- [ ] **`securityAudit`** (true/false)
  - [ ] true = independently audited
  - [ ] false = not yet audited (honest!)
  - [ ] Don't lie for marketing

---

## Phase 6: Content Quality (5 minutes)

### Overview Section

- [ ] **Exists** - Has "## Overview" heading
- [ ] **Length** - 2-3 paragraphs (not 1, not 10)
- [ ] **Benefit-focused** - Leads with WHY not HOW
- [ ] **Clear** - Uses simple language
- [ ] **No marketing fluff** - No ALL CAPS or exclamation!!!

Example structure:
```
Paragraph 1: What it is + who it's for
Paragraph 2: Why it matters (benefit/problem solved)
Paragraph 3: How it works at high level
```

### Sub-Features / Capabilities

- [ ] **Exists** - Lists main features/capabilities
- [ ] **Complete** - Covers key functionality
- [ ] **Organized** - Uses headings or bullets
- [ ] **Descriptions** - Each feature has brief explanation
- [ ] **No placeholder text** - Real content, not "TODO" or "[description]"

### Use Cases Section

- [ ] **Exists** - Has use cases/scenarios
- [ ] **Quantity** - 2-4 realistic scenarios
- [ ] **Detail** - Each case describes: who, what, outcome
- [ ] **Real-world** - Actual customer scenarios
- [ ] **Problem-focused** - Explains the problem solved
- [ ] **NOT generic** - Specific scenarios, not just "user can login"

### Code Examples (if technical feature)

- [ ] **Exist** - Has working code snippets
- [ ] **Complete** - Full runnable examples
- [ ] **Language tags** - ````typescript`, ````javascript`, etc
- [ ] **Tested** - Actually works (not pseudo-code)
- [ ] **Comments** - Explains what code does
- [ ] **Variety** - Shows different use cases

### Formatting

- [ ] **Headers** - Uses H2 (#) and H3 (##) only
- [ ] **NO H1** - Single # should never appear
- [ ] **Bullets** - Used for lists (not numbers for non-steps)
- [ ] **Bold** - Used for emphasis, not ALL CAPS
- [ ] **Code blocks** - Properly indented and tagged
- [ ] **Links** - Relative paths (/docs/..., not http://...)
- [ ] **NO HTML** - Uses markdown only
- [ ] **NO emoji** - Unless specifically requested
- [ ] **Readability** - Short paragraphs, scannable

### Grammar & Spelling

- [ ] **Spell check** - No typos or spelling errors
- [ ] **Grammar check** - Proper grammar throughout
- [ ] **Consistency** - Consistent terminology
- [ ] **Tone** - Professional but friendly
- [ ] **Tense** - Consistent verb tense
- [ ] **Capitalization** - Proper title case for headings

---

## Phase 7: Related Features & Documentation (2 minutes)

- [ ] **`relatedFeatures`** array
  - [ ] 2-4 related feature IDs listed
  - [ ] Each ID actually exists (no typos)
  - [ ] NO self-references
  - [ ] NO circular references (A→B→A)
  - [ ] Features make logical sense together

- [ ] **`documentation`** object (if applicable)
  - [ ] `userGuide` - Points to real docs page
  - [ ] `apiReference` - If technical feature
  - [ ] `videoTutorial` - If one exists
  - [ ] `blogPost` - If marketing piece exists
  - [ ] All links valid (no 404s)
  - [ ] Links open in same tab

- [ ] **Internal links in content**
  - [ ] Use relative paths: `/docs/...`, `/features/...`
  - [ ] NO absolute URLs: `https://...`
  - [ ] All links point to real pages
  - [ ] Anchor links work (e.g., `#overview`)

---

## Phase 8: Final Review (5 minutes)

### Before Publishing Checklist

- [ ] **Read it aloud** - Does it sound natural?
- [ ] **Marketing review** - Would you show this to customers?
- [ ] **Technical review** - Is everything accurate?
- [ ] **Link check** - All links valid?
- [ ] **Format check** - Consistent styling throughout
- [ ] **Typo check** - No spelling/grammar errors
- [ ] **Mobile check** - Would it render well on phone?
- [ ] **Benchmark** - Compare against similar features

### Sign-Off

- [ ] **You would be proud** to show this to customers
- [ ] **Accurate** - Everything is true
- [ ] **Complete** - Nothing missing
- [ ] **Professional** - No placeholder text
- [ ] **Ready** - All items above checked

---

## Quality Scoring Rubric

### 5 Stars - Publish Immediately ⭐⭐⭐⭐⭐

**Criteria:**
- [ ] 95%+ of checklist items pass
- [ ] Compelling marketing copy that sells benefit
- [ ] Accurate, specific metrics from real testing
- [ ] Clear ontology alignment with no placeholder text
- [ ] Working code examples (if applicable)
- [ ] Professional writing, zero typos
- [ ] Would confidently show to customers

**Action:** Merge immediately

---

### 4 Stars - Minor Revisions Only ⭐⭐⭐⭐

**Criteria:**
- [ ] 90-95% of checklist items pass
- [ ] Good marketing copy, minor tweaks suggested
- [ ] Realistic metrics (could add more detail)
- [ ] Clear ontology mapping
- [ ] Working examples (could add more)
- [ ] Minimal grammar/formatting issues
- [ ] Almost ready to show customers

**Action:** Request changes, then merge

**Common issues:**
- Missing 1-2 metrics
- Example could be more complete
- Description could be punchier
- Related features need addition
- Minor formatting/grammar fixes

---

### 3 Stars - Significant Revisions Needed ⭐⭐⭐

**Criteria:**
- [ ] 80-90% of checklist items pass
- [ ] Marketing copy is functional but bland
- [ ] Some metrics missing or unclear
- [ ] Ontology mapping needs clarification
- [ ] Examples incomplete or missing
- [ ] Several grammar/formatting issues
- [ ] Not ready to show customers yet

**Action:** Request revisions, plan review meeting

**Common issues:**
- Missing use cases or examples
- Weak marketing positioning
- Incomplete specification
- 2-3 metrics missing
- Placeholder text still present
- Formatting inconsistencies

---

### 2 Stars - Substantial Rewrite Needed ⭐⭐

**Criteria:**
- [ ] 70-80% of checklist items pass
- [ ] Weak marketing messaging
- [ ] Major metrics missing (>3)
- [ ] Ontology unclear or missing
- [ ] No examples or examples don't work
- [ ] Significant grammar/spelling issues
- [ ] Would not show to customers

**Action:** Assign for significant revision, plan re-review

**Common issues:**
- No marketing positioning
- Technical writing, not marketing
- Multiple incomplete sections
- More than 3 typos/grammar errors
- NO code examples (needed for technical feature)
- Placeholder text in multiple places

---

### 1 Star - Reject, Needs Complete Rewrite ⭐

**Criteria:**
- [ ] <70% of checklist items pass
- [ ] No marketing angle or positioning
- [ ] Missing metadata or incorrect values
- [ ] Incomplete or placeholder text throughout
- [ ] Major grammar/spelling issues
- [ ] Not ready for publication

**Action:** Return to creator, request complete rewrite

**Common issues:**
- Multiple required fields missing
- Extensive placeholder text
- No use cases or benefits explained
- Major factual errors
- Undocumented or untested claims
- Should not have been submitted

---

## Quick Scoring Guide

**Count items that FAIL from the checklist:**

| Failures | Score | Action |
|----------|-------|--------|
| 0-5 | 5★ | Publish |
| 6-10 | 4★ | Minor revisions |
| 11-20 | 3★ | Revisions needed |
| 21-30 | 2★ | Rewrite required |
| 30+ | 1★ | Reject |

---

## Common Mistakes (Fast Reference)

### Metadata Issues
- ❌ Missing version or release date
- ❌ featureId doesn't match filename
- ❌ Multiple categories selected
- ❌ Status misspelled (e.g., "in-development")
- ✅ All fields filled, correct values

### Marketing Issues
- ❌ Description is technical, not benefit-focused
- ❌ Tagline is too long (>10 words)
- ❌ Target audience is too generic
- ❌ Value proposition explains WHAT not WHY
- ✅ Marketing copy sells the benefit

### Ontology Issues
- ❌ Missing ontologyMapping for listed dimensions
- ❌ Placeholder text ("TBD", "[description]", etc)
- ❌ Mapping doesn't actually make sense
- ✅ Each dimension clearly explained

### Technical Issues
- ❌ API endpoints don't exist or untested
- ❌ Dependencies list unrelated features
- ❌ Metrics are guessed, not tested
- ❌ Code examples don't compile
- ✅ All technical claims verified

### Content Issues
- ❌ Wall of text paragraphs
- ❌ No use cases or examples
- ❌ Typos and grammar errors
- ❌ Inconsistent formatting
- ✅ Scannable, error-free, well-formatted

### Related Features Issues
- ❌ Self-references (feature links to itself)
- ❌ Related features don't actually exist
- ❌ Circular references (A→B→A)
- ✅ 2-4 actual related features

---

## Checklist for Print

**Feature:** _________________ **Date:** _______

### Phase 1: Metadata (5 min)
- [ ] title, description, featureId, category, status
- [ ] version, releaseDate, draft=false

### Phase 2: Marketing (3 min)
- [ ] tagline, valueProposition, targetAudience, competitiveAdvantage, pricingImpact

### Phase 3: Ontology (5 min)
- [ ] ontologyDimensions (2-6 items)
- [ ] ontologyMapping (explanation for each)

### Phase 4: Technical (3 min)
- [ ] complexity, technologies, dependencies, apiEndpoints

### Phase 5: Metrics (2 min)
- [ ] testCoverage, performanceScore, accessibilityScore, securityAudit

### Phase 6: Content (5 min)
- [ ] Overview (2-3 paragraphs)
- [ ] Sub-features/capabilities
- [ ] Use cases (2-4 scenarios)
- [ ] Code examples (if applicable)
- [ ] Formatting, grammar, spelling

### Phase 7: Related & Docs (2 min)
- [ ] relatedFeatures, documentation links

### Phase 8: Final Review (5 min)
- [ ] Read aloud, check links, would show to customers

---

**Total Score:** ___ / 100

**Reviewer:** _________________ **Date:** _______

---

## Next Steps After Scoring

### If 5 Stars
1. Approve feature
2. Merge to main
3. Publish and celebrate!

### If 4 Stars
1. Note specific items for revision
2. Creator makes changes
3. Quick re-review (5 min)
4. Merge

### If 3 Stars
1. Schedule revision meeting
2. Discuss specific gaps
3. Creator revises
4. Full re-review

### If 2 Stars
1. Assign back to creator
2. Request substantial rewrite
3. Re-review entire feature
4. Plan merge timing

### If 1 Star
1. Return to creator
2. Request complete rewrite
3. Clarify expectations
4. Consider blocking from publication

---

**Remember:** Features are customer-facing documentation. Quality matters. Take time to get it right!

---

**Last updated:** November 4, 2025
**Version:** 1.0.0
