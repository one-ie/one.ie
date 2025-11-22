---
title: Cycle 010 - Specialist Agent Assignments (Cycles 11-100)
dimension: things
category: plans
tags: funnel-builder, specialist-agents, workflow-orchestration, parallel-execution
related_dimensions: people, connections, events, knowledge
scope: orchestration
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete specialist agent assignments for 100-cycle funnel builder implementation.
  Defines primary and review agents for each cycle, identifies parallel execution groups,
  and documents handoff points for smooth workflow orchestration.
---

# Specialist Agent Assignments (Cycles 11-100)

**Orchestration Principle:** Parallel execution where possible. Sequential only when true dependencies exist.

---

## Assignment Summary by Phase

### Phase 1: Backend Schema & Services (Cycles 11-30)
**Primary Agent:** agent-backend
**Duration:** ~10-15 cycles
**Dependencies:** None (foundational)
**Parallel Groups:** All cycles can run in parallel; no inter-dependencies

### Phase 2: Frontend UI - Management (Cycles 31-40)
**Primary Agent:** agent-frontend + agent-builder
**Duration:** ~10 cycles
**Dependencies:** Phase 1 complete (schema defines data shapes)
**Parallel Groups:** Can start after cycle 20 (schema stable)

### Phase 3: Frontend UI - Page Builder (Cycles 41-50)
**Primary Agent:** agent-frontend + agent-builder
**Duration:** ~10 cycles
**Dependencies:** Phase 1 complete + Phase 2 UI patterns established
**Parallel Groups:** Can start after cycle 30

### Phase 4: Templates System (Cycles 51-60)
**Primary Agent:** agent-backend (service) + agent-designer (UX) + agent-frontend (UI)
**Duration:** ~10 cycles
**Dependencies:** Phase 1 complete + Phase 2 management UI
**Parallel Groups:** Backend and Designer can run in parallel with frontend

### Phase 5: Forms & Lead Capture (Cycles 61-70)
**Primary Agent:** agent-backend (service) + agent-frontend (UI) + agent-integrator (email)
**Duration:** ~10 cycles
**Dependencies:** Phase 1 complete + Phase 2 UI
**Parallel Groups:** Forms backend, UI, and email integration can run in parallel

### Phase 6: Analytics & Conversion (Cycles 71-80)
**Primary Agent:** agent-backend (service) + agent-frontend (UI)
**Duration:** ~10 cycles
**Dependencies:** Phase 1 complete + forms/analytics schema
**Parallel Groups:** Backend service and frontend UI can run in parallel

### Phase 7: Payment Integration (Cycles 81-90)
**Primary Agent:** agent-backend (service) + agent-integrator (Stripe) + agent-frontend (UI)
**Duration:** ~10 cycles
**Dependencies:** Phase 1 complete + analytics schema
**Parallel Groups:** All three (backend, integrator, frontend) can run in parallel

### Phase 8: Polish, Testing, Deployment (Cycles 91-100)
**Primary Agent:** agent-frontend (polish) + agent-quality (tests) + agent-ops (deployment) + agent-documenter (docs)
**Duration:** ~10 cycles
**Dependencies:** All implementation phases complete
**Parallel Groups:** All phases can run in parallel; ops can start infrastructure setup during phase 7

---

## Cycle-by-Cycle Assignments (11-100)

### PHASE 1: BACKEND SCHEMA & SERVICES (Cycles 11-30)

#### Cycle 11: Design Schema Changes
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Define `funnel`, `funnel_step`, `funnel_template`, `page_template`, `page_element` thing types with full property schemas
- **Output:** Schema specification document
- **Dependencies:** None
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 1-2 hours

#### Cycle 12: Update Convex Schema
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement schema changes in `backend/convex/schema.ts`; define all thing types with validators
- **Output:** Updated schema.ts with all validators
- **Dependencies:** Cycle 11
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 1-2 hours

#### Cycle 13: Create FunnelService
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create `backend/convex/services/funnel/funnel.ts` with Effect.ts business logic for funnel CRUD
- **Output:** FunnelService with pure functions (create, read, update, publish, duplicate, archive)
- **Dependencies:** Cycle 12
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 2-3 hours

#### Cycle 14: Define Funnel Errors
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create error types for FunnelService (NotFound, AlreadyPublished, InvalidSequence, UnauthorizedAccess)
- **Output:** Error type definitions with discriminated unions
- **Dependencies:** Cycle 13
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 1 hour

#### Cycle 15: Write Funnel Queries
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement `backend/convex/queries/funnels.ts` (list, get, getBySlug, getPublished)
- **Output:** Query functions with proper organization scoping
- **Dependencies:** Cycle 12
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 1-2 hours

#### Cycle 16: Write Funnel Mutations
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement `backend/convex/mutations/funnels.ts` (create, update, publish, unpublish, duplicate, archive)
- **Output:** Mutation functions with validation and org scoping
- **Dependencies:** Cycle 12
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 2-3 hours

#### Cycle 17: Add Event Logging
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Add event emission to all mutations (funnel_created, funnel_published, funnel_duplicated, etc.)
- **Output:** Event logging integrated into all mutations
- **Dependencies:** Cycle 16
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 1-2 hours

#### Cycle 18: Implement Organization Scoping
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Ensure all funnel queries filter by groupId; validate ownership on mutations
- **Output:** Organization-scoped queries and mutations
- **Dependencies:** Cycle 15-16
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 1-2 hours

#### Cycle 19: Add Rate Limiting
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement rate limiting (max 100 funnels per org, 50 steps per funnel)
- **Output:** Rate limiting validation in mutations
- **Dependencies:** Cycle 16
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 1 hour

#### Cycle 20: Test FunnelService
- **Primary:** agent-quality
- **Review:** agent-backend
- **Work:** Write unit tests for FunnelService (create, publish, duplicate, archive flows)
- **Output:** Comprehensive unit test suite (>80% coverage)
- **Dependencies:** Cycle 13-19
- **Parallel Group:** Backend-Foundation (11-20)
- **Estimated Time:** 2-3 hours

#### Cycle 21: Create StepService
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create `backend/convex/services/funnel/step.ts` for managing funnel steps and sequences
- **Output:** StepService with step CRUD operations
- **Dependencies:** Cycle 12
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 2-3 hours

#### Cycle 22: Write Step Queries
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement queries (getStepsByFunnel, getStep, getPublishedSteps)
- **Output:** Step query functions with proper indexing
- **Dependencies:** Cycle 21
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 1-2 hours

#### Cycle 23: Write Step Mutations
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement mutations (addStep, updateStep, removeStep, reorderSteps)
- **Output:** Step mutation functions
- **Dependencies:** Cycle 21
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 1-2 hours

#### Cycle 24: Create ElementService
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create `backend/convex/services/funnel/element.ts` for managing page elements
- **Output:** ElementService with element CRUD operations
- **Dependencies:** Cycle 12
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 2-3 hours

#### Cycle 25: Write Element Queries
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement queries (getElementsByStep, getElement)
- **Output:** Element query functions
- **Dependencies:** Cycle 24
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 1-2 hours

#### Cycle 26: Write Element Mutations
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement mutations (addElement, updateElement, removeElement, updateElementPosition)
- **Output:** Element mutation functions with position validation
- **Dependencies:** Cycle 24
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 1-2 hours

#### Cycle 27: Implement Element Property Schema
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Define element type-specific properties (headline, button, form, image, etc.)
- **Output:** Type-specific property schemas
- **Dependencies:** Cycle 24-26
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 1-2 hours

#### Cycle 28: Create Connection Records
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create connection records (funnel_contains_step, step_contains_element) with sequence metadata
- **Output:** Connection creation logic in mutations
- **Dependencies:** Cycle 23, 26
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 1-2 hours

#### Cycle 29: Add Sequence Validation
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement validation for funnel sequences (no gaps, no duplicates, valid step types)
- **Output:** Validation logic in step/element mutations
- **Dependencies:** Cycle 23, 27
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 1-2 hours

#### Cycle 30: Test StepService & ElementService
- **Primary:** agent-quality
- **Review:** agent-backend
- **Work:** Write unit tests for StepService and ElementService (sequencing, positioning, validation)
- **Output:** Comprehensive test suite (>80% coverage)
- **Dependencies:** Cycle 21-29
- **Parallel Group:** Backend-Steps (21-30)
- **Estimated Time:** 2-3 hours

**Phase 1 Completion Gate:**
- [ ] All schema defined and validated
- [ ] All services implemented with Effect.ts patterns
- [ ] Event logging integrated
- [ ] Organization scoping verified
- [ ] Rate limiting implemented
- [ ] Test coverage >80%
- **Gate Status:** Ready for Phase 2 (can begin after cycle 25)

---

### PHASE 2: FRONTEND - FUNNEL MANAGEMENT UI (Cycles 31-40)

#### Cycle 31: Create Funnels Dashboard Page
- **Primary:** agent-frontend / agent-builder
- **Review:** agent-quality
- **Work:** Create `/web/src/pages/funnels/index.astro` with funnel listing
- **Output:** Funnel dashboard page with SSR
- **Dependencies:** Phase 1 complete
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 2-3 hours

#### Cycle 32: Build FunnelList Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create `FunnelList.tsx` component displaying funnels as cards with status, thumbnails, stats
- **Output:** React component with shadcn/ui cards
- **Dependencies:** Cycle 31
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 2-3 hours

#### Cycle 33: Create Funnel Detail Page
- **Primary:** agent-frontend / agent-builder
- **Review:** agent-quality
- **Work:** Create `/web/src/pages/funnels/[id]/index.astro` with step sequence visualization
- **Output:** Funnel detail page with dynamic routing
- **Dependencies:** Cycle 31
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 1-2 hours

#### Cycle 34: Build FunnelSequence Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create `FunnelSequence.tsx` visual flowchart with steps, arrows, conversion rates
- **Output:** React component with visual diagram
- **Dependencies:** Cycle 33
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 2-3 hours

#### Cycle 35: Create Funnel Settings Page
- **Primary:** agent-frontend / agent-builder
- **Review:** agent-quality
- **Work:** Create `/web/src/pages/funnels/[id]/settings.astro` for funnel configuration
- **Output:** Settings page with edit controls
- **Dependencies:** Cycle 31
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 1-2 hours

#### Cycle 36: Build FunnelSettings Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create `FunnelSettings.tsx` form with name, slug, domain, SEO fields using shadcn/ui
- **Output:** React form component with validation
- **Dependencies:** Cycle 35
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 2 hours

#### Cycle 37: Add Create Funnel Modal
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Implement "Create Funnel" modal with template selection, name, category
- **Output:** Modal component with form handling
- **Dependencies:** Cycle 31
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 1-2 hours

#### Cycle 38: Implement Funnel Duplication
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Add "Clone Funnel" button that copies all steps and elements
- **Output:** Duplication logic in UI
- **Dependencies:** Cycle 32
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 1-2 hours

#### Cycle 39: Add Publish/Unpublish Toggle
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Implement status toggle to change funnel state (draft/published/archived)
- **Output:** Toggle UI with state management
- **Dependencies:** Cycle 35
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 1 hour

#### Cycle 40: Create Archive Functionality
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Add "Archive Funnel" button with confirmation modal and soft-delete handling
- **Output:** Archive UI with confirmation
- **Dependencies:** Cycle 39
- **Parallel Group:** Frontend-Management (31-40)
- **Estimated Time:** 1 hour

**Phase 2 Completion Gate:**
- [ ] Funnel dashboard displays correctly
- [ ] All CRUD operations work
- [ ] Settings save properly
- [ ] Status toggles function
- [ ] Tests passing
- **Gate Status:** Ready for Phase 3

---

### PHASE 3: FRONTEND - DRAG-AND-DROP PAGE BUILDER (Cycles 41-50)

#### Cycle 41: Research Drag-and-Drop Libraries
- **Primary:** agent-designer / agent-frontend
- **Review:** agent-quality
- **Work:** Evaluate dnd-kit, react-beautiful-dnd, react-dnd for performance and mobile support
- **Output:** Library recommendation document
- **Dependencies:** None
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 1-2 hours

#### Cycle 42: Create Page Builder Page
- **Primary:** agent-frontend / agent-builder
- **Review:** agent-quality
- **Work:** Create `/web/src/pages/funnels/[funnelId]/steps/[stepId]/edit.astro` page builder interface
- **Output:** Page builder page with layout
- **Dependencies:** Phase 2 complete
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 1-2 hours

#### Cycle 43: Build PageBuilder Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create `PageBuilder.tsx` with left sidebar (elements), center canvas (preview), right panel (properties)
- **Output:** Main page builder layout component
- **Dependencies:** Cycle 42
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 3-4 hours

#### Cycle 44: Implement Canvas Grid System
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create responsive 12-column grid system with element snapping
- **Output:** Grid layout logic
- **Dependencies:** Cycle 43
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 2-3 hours

#### Cycle 45: Create Element Palette
- **Primary:** agent-frontend / agent-designer
- **Review:** agent-quality
- **Work:** Build categorized element palette (Text, Media, Forms, Commerce, Widgets) with drag capability
- **Output:** Element palette component
- **Dependencies:** Cycle 43
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 1-2 hours

#### Cycle 46: Build Element Rendering System
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Map element types to React components (HeadlineElement, ButtonElement, FormElement, ImageElement, etc.)
- **Output:** Element type registry and rendering logic
- **Dependencies:** Cycle 44, 45
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 2-3 hours

#### Cycle 47: Implement Element Selection
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Add click-to-select, bounding box display, properties panel activation
- **Output:** Selection UI logic
- **Dependencies:** Cycle 46
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 1-2 hours

#### Cycle 48: Add Element Property Editor
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create conditional property fields based on element type (text color/size for headline, action/link for button, etc.)
- **Output:** Property editor component
- **Dependencies:** Cycle 47
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 2-3 hours

#### Cycle 49: Implement Drag-to-Reorder
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Add element reordering via drag, update sequence via mutations
- **Output:** Drag-and-drop reordering logic
- **Dependencies:** Cycle 41, 46
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 2 hours

#### Cycle 50: Add Undo/Redo Stack
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Implement undo/redo functionality with Cmd+Z / Cmd+Shift+Z
- **Output:** State history management
- **Dependencies:** Cycle 48
- **Parallel Group:** Frontend-Builder (41-50)
- **Estimated Time:** 1-2 hours

**Phase 3 Completion Gate:**
- [ ] Page builder loads correctly
- [ ] Elements render on canvas
- [ ] Drag-and-drop functions smoothly
- [ ] Properties editor works
- [ ] Undo/redo works
- [ ] Tests passing
- **Gate Status:** Ready for Phase 4

---

### PHASE 4: TEMPLATES & CLONING SYSTEM (Cycles 51-60)

#### Cycle 51: Create TemplateService
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create `backend/convex/services/funnel/template.ts` for managing funnel and page templates
- **Output:** TemplateService with Effect.ts business logic
- **Dependencies:** Phase 1 complete
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 2-3 hours

#### Cycle 52: Write Template Queries
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement listFunnelTemplates, listPageTemplates, getTemplate queries
- **Output:** Template query functions
- **Dependencies:** Cycle 51
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 1-2 hours

#### Cycle 53: Write Template Mutations
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement createTemplate, saveAsTemplate, instantiateTemplate mutations
- **Output:** Template mutation functions
- **Dependencies:** Cycle 51
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 1-2 hours

#### Cycle 54: Design 5 Funnel Templates
- **Primary:** agent-designer
- **Review:** agent-quality
- **Work:** Create Lead Magnet, Product Launch, Webinar Funnel, Book Launch, Membership Signup templates
- **Output:** Template design specifications
- **Dependencies:** Phase 3 complete
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 2-3 hours

#### Cycle 55: Create Template Seed Script
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Write seed script to insert pre-configured templates into database
- **Output:** Seed data script
- **Dependencies:** Cycle 54
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 1-2 hours

#### Cycle 56: Build Templates Marketplace Page
- **Primary:** agent-frontend / agent-builder
- **Review:** agent-quality
- **Work:** Create `/web/src/pages/templates/index.astro` with filters by category and industry
- **Output:** Template marketplace page
- **Dependencies:** Phase 2 complete
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 1-2 hours

#### Cycle 57: Create TemplateCard Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Build `TemplateCard.tsx` with preview image, description, "Use Template" button
- **Output:** Template card component
- **Dependencies:** Cycle 56
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 1-2 hours

#### Cycle 58: Implement Template Instantiation
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Clicking "Use Template" clones funnel structure, creates connections, preserves settings
- **Output:** Template instantiation logic
- **Dependencies:** Cycle 57
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 2-3 hours

#### Cycle 59: Add "Save as Template" Feature
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Org owners can save funnels as templates, optionally share with community
- **Output:** Save-as-template UI
- **Dependencies:** Cycle 54
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 1-2 hours

#### Cycle 60: Create Template Connection Records
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create funnel_based_on_template, step_based_on_template connections for tracking lineage
- **Output:** Connection creation logic
- **Dependencies:** Cycle 53
- **Parallel Group:** Templates-System (51-60)
- **Estimated Time:** 1 hour

**Phase 4 Completion Gate:**
- [ ] Templates load and display
- [ ] Template instantiation works
- [ ] Save-as-template works
- [ ] Connection records created
- [ ] Tests passing
- **Gate Status:** Ready for Phase 5

---

### PHASE 5: FORM BUILDER & LEAD CAPTURE (Cycles 61-70)

#### Cycle 61: Create FormService
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create `backend/convex/services/funnel/form.ts` for form configurations and submissions
- **Output:** FormService with Effect.ts business logic
- **Dependencies:** Phase 1 complete
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 2-3 hours

#### Cycle 62: Design Form Field Types
- **Primary:** agent-designer
- **Review:** agent-quality
- **Work:** Define field types (text, email, phone, select, checkbox, radio, textarea, date)
- **Output:** Field type specifications
- **Dependencies:** None
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 1 hour

#### Cycle 63: Write Form Mutations
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement submitForm, updateFormConfig, exportSubmissions mutations
- **Output:** Form mutation functions
- **Dependencies:** Cycle 61
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 1-2 hours

#### Cycle 64: Build FormBuilder Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create `FormBuilder.tsx` to drag fields, set labels, configure validation, set required
- **Output:** Form builder component
- **Dependencies:** Phase 3 complete
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 2-3 hours

#### Cycle 65: Implement Form Submission Handling
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Validate fields, create form_submission thing, create visitor_submitted_form connection
- **Output:** Form submission logic
- **Dependencies:** Cycle 64
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 1-2 hours

#### Cycle 66: Create Submissions Dashboard
- **Primary:** agent-frontend / agent-builder
- **Review:** agent-quality
- **Work:** Create `/web/src/pages/funnels/[id]/submissions.astro` viewing form submissions in table with CSV export
- **Output:** Submissions dashboard page
- **Dependencies:** Phase 2 complete
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 1-2 hours

#### Cycle 67: Build Email Integration
- **Primary:** agent-integrator
- **Review:** agent-quality
- **Work:** Trigger email sequence on form submission, create funnel_sends_email connection
- **Output:** Email integration logic
- **Dependencies:** Cycle 65
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 2-3 hours

#### Cycle 68: Add Email Verification Field
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Implement email verification field type (send verification email, validate before progression)
- **Output:** Email verification field component
- **Dependencies:** Cycle 67
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 1-2 hours

#### Cycle 69: Implement Form Analytics
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Track submission rate, completion rate per field, identify drop-off points
- **Output:** Form analytics tracking logic
- **Dependencies:** Cycle 66
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 1-2 hours

#### Cycle 70: Write Integration Tests for Forms
- **Primary:** agent-quality
- **Review:** agent-integrator
- **Work:** End-to-end tests (submit form → submission saved → email sent → analytics updated)
- **Output:** Integration test suite
- **Dependencies:** Cycle 61-69
- **Parallel Group:** Forms-System (61-70)
- **Estimated Time:** 2-3 hours

**Phase 5 Completion Gate:**
- [ ] Forms display and function correctly
- [ ] Submissions captured and stored
- [ ] Email integration works
- [ ] Analytics tracked
- [ ] Tests passing
- **Gate Status:** Ready for Phase 6

---

### PHASE 6: ANALYTICS & CONVERSION TRACKING (Cycles 71-80)

#### Cycle 71: Create AnalyticsService
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create `backend/convex/services/funnel/analytics.ts` for funnel metrics calculation
- **Output:** AnalyticsService with Effect.ts business logic
- **Dependencies:** Phase 1 complete
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 2-3 hours

#### Cycle 72: Design Analytics Schema
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Track views, unique visitors, submissions, purchases per step and funnel
- **Output:** Analytics schema definition
- **Dependencies:** Cycle 71
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 1-2 hours

#### Cycle 73: Write Analytics Queries
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement getFunnelStats, getStepStats, getConversionRate, getRevenueByFunnel queries
- **Output:** Analytics query functions
- **Dependencies:** Cycle 71
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 1-2 hours

#### Cycle 74: Implement Event Aggregation
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Process visitor_viewed_step, visitor_submitted_form, customer_purchased_via_funnel events to calculate metrics
- **Output:** Event aggregation logic
- **Dependencies:** Cycle 72
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 2-3 hours

#### Cycle 75: Create Analytics Dashboard Page
- **Primary:** agent-frontend / agent-builder
- **Review:** agent-quality
- **Work:** Create `/web/src/pages/funnels/[id]/analytics.astro` analytics dashboard with charts
- **Output:** Analytics dashboard page
- **Dependencies:** Phase 2 complete
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 1-2 hours

#### Cycle 76: Build FunnelAnalytics Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create `FunnelAnalytics.tsx` displaying funnel overview (visitors, conversion rate, revenue)
- **Output:** Analytics overview component
- **Dependencies:** Cycle 75
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 1-2 hours

#### Cycle 77: Create Conversion Funnel Visualization
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Build vertical chart showing drop-off between steps
- **Output:** Conversion funnel chart component
- **Dependencies:** Cycle 76
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 2-3 hours

#### Cycle 78: Add Time-Based Analytics
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Filter by date range, show trends over time with line charts
- **Output:** Time-based analytics components
- **Dependencies:** Cycle 76
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 2 hours

#### Cycle 79: Implement A/B Test Tracking
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Compare A/B variants, calculate statistical significance
- **Output:** A/B test result tracking logic
- **Dependencies:** Cycle 77
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 2-3 hours

#### Cycle 80: Create Analytics Export
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Download CSV with detailed visitor journey data
- **Output:** Analytics export functionality
- **Dependencies:** Cycle 76
- **Parallel Group:** Analytics-System (71-80)
- **Estimated Time:** 1 hour

**Phase 6 Completion Gate:**
- [ ] Analytics dashboard displays correctly
- [ ] Charts render with data
- [ ] Date filtering works
- [ ] Export functionality works
- [ ] Tests passing
- **Gate Status:** Ready for Phase 7

---

### PHASE 7: PAYMENT INTEGRATION & E-COMMERCE (Cycles 81-90)

#### Cycle 81: Create PaymentService
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Create `backend/convex/services/funnel/payment.ts` for Stripe integration
- **Output:** PaymentService with Effect.ts business logic
- **Dependencies:** Phase 1 complete
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 2-3 hours

#### Cycle 82: Design Payment Element Type
- **Primary:** agent-designer
- **Review:** agent-quality
- **Work:** Define pricing table, buy button, checkout form with Stripe integration
- **Output:** Payment element specifications
- **Dependencies:** None
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 1 hour

#### Cycle 83: Write Payment Mutations
- **Primary:** agent-backend
- **Review:** agent-quality
- **Work:** Implement createCheckoutSession, handlePaymentSuccess, handlePaymentFailed mutations
- **Output:** Payment mutation functions
- **Dependencies:** Cycle 81
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 2-3 hours

#### Cycle 84: Build PaymentElement Component
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create `PaymentElement.tsx` with configurable pricing display, one-time/subscription, Stripe Checkout
- **Output:** Payment element component
- **Dependencies:** Phase 3 complete + Cycle 82
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 2-3 hours

#### Cycle 85: Implement Order Bumps
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Add checkbox for additional product during checkout
- **Output:** Order bump UI
- **Dependencies:** Cycle 84
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 1 hour

#### Cycle 86: Create Upsell/Downsell Flow
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** After purchase, show additional offer, track acceptance rate
- **Output:** Upsell flow UI
- **Dependencies:** Cycle 84
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 1-2 hours

#### Cycle 87: Add Coupon Code Support
- **Primary:** agent-integrator
- **Review:** agent-quality
- **Work:** Implement discount codes with expiration, usage limits, percentage/fixed amount
- **Output:** Coupon code logic
- **Dependencies:** Cycle 81
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 1-2 hours

#### Cycle 88: Implement Payment Analytics
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Track revenue per funnel, average order value, lifetime value
- **Output:** Payment analytics logic
- **Dependencies:** Cycle 84
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 1-2 hours

#### Cycle 89: Create Stripe Webhook Handler
- **Primary:** agent-integrator
- **Review:** agent-quality
- **Work:** Process payment_intent.succeeded, update connections, log events
- **Output:** Webhook handler function
- **Dependencies:** Cycle 83
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 1-2 hours

#### Cycle 90: Write Integration Tests for Payments
- **Primary:** agent-quality
- **Review:** agent-integrator
- **Work:** End-to-end tests (visitor → Stripe checkout → payment success → customer_purchased_via_funnel connection created)
- **Output:** Integration test suite
- **Dependencies:** Cycle 81-89
- **Parallel Group:** Payments-System (81-90)
- **Estimated Time:** 2-3 hours

**Phase 7 Completion Gate:**
- [ ] Payment elements display correctly
- [ ] Stripe checkout works end-to-end
- [ ] Order bumps and upsells function
- [ ] Webhook processing works
- [ ] Analytics tracking works
- [ ] Tests passing
- **Gate Status:** Ready for Phase 8

---

### PHASE 8: POLISH, TESTING & DEPLOYMENT (Cycles 91-100)

#### Cycle 91: Build Responsive Preview
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Add mobile/tablet/desktop preview modes in page builder
- **Output:** Responsive preview functionality
- **Dependencies:** Phase 3 complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 1-2 hours

#### Cycle 92: Add Custom Domain Support
- **Primary:** agent-integrator
- **Review:** agent-quality
- **Work:** Connect Cloudflare, configure DNS, SSL certificates for custom funnel domains
- **Output:** Custom domain logic
- **Dependencies:** Phase 1 complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 2-3 hours

#### Cycle 93: Implement SEO Settings
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Add meta title, description, OG image, schema markup per step
- **Output:** SEO settings UI
- **Dependencies:** Phase 2 complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 1-2 hours

#### Cycle 94: Create Custom Code Injection
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Allow custom HTML/CSS/JS injection per page for advanced users
- **Output:** Custom code UI
- **Dependencies:** Phase 3 complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 1 hour

#### Cycle 95: Build A/B Testing UI
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Create variants, set traffic split, declare winner
- **Output:** A/B testing UI
- **Dependencies:** Phase 6 complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 2 hours

#### Cycle 96: Add Collaboration Features
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Invite team members, role-based editing permissions
- **Output:** Collaboration features UI
- **Dependencies:** Phase 2 complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 2-3 hours

#### Cycle 97: Optimize Performance
- **Primary:** agent-frontend
- **Review:** agent-quality
- **Work:** Lazy load elements, cache templates, prefetch funnel data
- **Output:** Performance optimizations
- **Dependencies:** All phases complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 1-2 hours

#### Cycle 98: Run Full Test Suite
- **Primary:** agent-quality
- **Review:** All specialists
- **Work:** Unit tests, integration tests, E2E tests for complete funnel journey
- **Output:** Comprehensive test report
- **Dependencies:** All phases complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 2-3 hours

#### Cycle 99: Write Documentation
- **Primary:** agent-documenter
- **Review:** agent-quality
- **Work:** Create `/one/things/funnel-builder.md` with architecture, ontology mapping, usage guide, API reference
- **Output:** Complete documentation
- **Dependencies:** All phases complete
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 2-3 hours

#### Cycle 100: Deploy to Production
- **Primary:** agent-ops
- **Review:** agent-quality
- **Work:** `npx convex deploy`, `wrangler pages deploy`, announce funnel builder launch
- **Output:** Live funnel builder
- **Dependencies:** Cycle 98 (all tests pass)
- **Parallel Group:** Polish (91-100)
- **Estimated Time:** 1-2 hours

**Phase 8 Completion Gate:**
- [ ] All features implemented and working
- [ ] Tests passing (>80% coverage)
- [ ] Documentation complete
- [ ] Performance optimized
- [ ] Security validated
- [ ] Deployment successful
- **Gate Status:** PRODUCT LAUNCH COMPLETE

---

## Agent Workload Distribution

### agent-backend
- **Cycles:** 11-30, 51-53, 61-63, 71-74, 81-83, 92
- **Total Cycles:** 19 (39% of implementation)
- **Estimated Time:** 35-50 hours
- **Primary Focus:** Schema design, service creation, mutations/queries, event logging

### agent-frontend
- **Cycles:** 31-50, 56-60, 64-70, 75-80, 84-91, 93-97
- **Total Cycles:** 40 (82% of implementation)
- **Estimated Time:** 55-80 hours
- **Primary Focus:** UI components, pages, interactions, styling

### agent-builder
- **Cycles:** 31, 33, 35, 42, 56, 66, 75
- **Total Cycles:** 7 (14% of implementation, supporting frontend)
- **Estimated Time:** 8-12 hours
- **Primary Focus:** Template-based page creation, full-stack features

### agent-integrator
- **Cycles:** 67, 87, 89, 92
- **Total Cycles:** 4 (8% of implementation)
- **Estimated Time:** 6-10 hours
- **Primary Focus:** External API integration (Email, Stripe, Cloudflare)

### agent-designer
- **Cycles:** 41, 54, 62, 82
- **Total Cycles:** 4 (8% of implementation)
- **Estimated Time:** 5-8 hours
- **Primary Focus:** UI/UX design specifications, wireframes

### agent-quality
- **Cycles:** 20, 30, 70, 90, 98
- **Total Cycles:** 5 (10% of implementation)
- **Estimated Time:** 8-12 hours
- **Primary Focus:** Testing, validation, quality gates

### agent-ops
- **Cycles:** 92, 100
- **Total Cycles:** 2 (4% of implementation)
- **Estimated Time:** 3-5 hours
- **Primary Focus:** Infrastructure, deployment

### agent-documenter
- **Cycles:** 99
- **Total Cycles:** 1 (2% of implementation)
- **Estimated Time:** 2-3 hours
- **Primary Focus:** Documentation writing

---

## Parallel Execution Groups

### Wave 1: Foundation (Cycles 11-20)
**Parallel Group:** Backend-Foundation
- **Agents:** agent-backend (primary)
- **Gate:** Schema complete, FunnelService tested
- **Duration:** 1-2 weeks
- **Next Wave:** Wave 2 (cycle 21 can start before cycle 20 completes)

### Wave 2: Backend Continuation (Cycles 21-30)
**Parallel Group:** Backend-Steps
- **Agents:** agent-backend (primary)
- **Gate:** Step and Element services complete
- **Duration:** 1-2 weeks
- **Next Wave:** Wave 3 starts after cycle 25

### Wave 3: Frontend Management (Cycles 31-40)
**Parallel Group:** Frontend-Management
- **Agents:** agent-frontend, agent-builder
- **Dependencies:** Phase 1 complete
- **Gate:** Funnel CRUD UI complete
- **Duration:** 1-2 weeks
- **Next Wave:** Wave 4 starts after cycle 35

### Wave 4: Page Builder (Cycles 41-50)
**Parallel Group:** Frontend-Builder
- **Agents:** agent-frontend, agent-designer
- **Dependencies:** Phase 2 complete
- **Gate:** Drag-and-drop builder complete
- **Duration:** 1-2 weeks
- **Next Wave:** Wave 5 starts after cycle 50

### Wave 5: Templates (Cycles 51-60)
**Parallel Group:** Templates-System
- **Agents:** agent-backend, agent-frontend, agent-designer
- **Dependencies:** Phase 1-3 complete
- **Gate:** Templates working end-to-end
- **Duration:** 1-2 weeks
- **Parallelization:** Backend service, Designer, Frontend UI all run simultaneously
- **Next Wave:** Wave 6 starts after cycle 55

### Wave 6: Forms & Email (Cycles 61-70)
**Parallel Group:** Forms-System
- **Agents:** agent-backend, agent-frontend, agent-integrator, agent-quality
- **Dependencies:** Phase 1-2 complete
- **Gate:** Forms working, email integration tested
- **Duration:** 1-2 weeks
- **Parallelization:** Backend, Frontend, Email integration run simultaneously
- **Next Wave:** Wave 7 starts after cycle 65

### Wave 7: Analytics (Cycles 71-80)
**Parallel Group:** Analytics-System
- **Agents:** agent-backend, agent-frontend
- **Dependencies:** Phase 1-2 complete
- **Gate:** Analytics dashboard complete
- **Duration:** 1-2 weeks
- **Parallelization:** Backend service and Frontend UI run simultaneously
- **Next Wave:** Wave 8 starts after cycle 75

### Wave 8: Payments (Cycles 81-90)
**Parallel Group:** Payments-System
- **Agents:** agent-backend, agent-frontend, agent-integrator, agent-quality
- **Dependencies:** Phase 1-6 complete
- **Gate:** Stripe integration working end-to-end
- **Duration:** 1-2 weeks
- **Parallelization:** All can run simultaneously
- **Next Wave:** Wave 9 starts after cycle 85

### Wave 9: Polish & Deployment (Cycles 91-100)
**Parallel Group:** Polish
- **Agents:** agent-frontend, agent-quality, agent-ops, agent-documenter, agent-integrator
- **Dependencies:** All phases complete
- **Gate:** Product launch complete
- **Duration:** 1-2 weeks
- **Parallelization:** Polish work and ops infrastructure setup run simultaneously

---

## Handoff Points (Critical Coordination)

### Handoff 1: Schema → Backend Services (Cycle 12→13)
- **From:** Schema definition complete
- **To:** Service implementation can begin
- **Agent Transition:** agent-backend
- **Validation:** Schema deployment successful

### Handoff 2: Backend Services → Frontend UI (Cycle 20→31)
- **From:** Services tested and working
- **To:** Frontend can call backend APIs
- **Agent Transition:** agent-backend → agent-frontend
- **Validation:** Query/mutation contracts verified

### Handoff 3: Frontend Management → Page Builder (Cycle 35→41)
- **From:** Base UI established
- **To:** Complex interactions can be built
- **Agent Transition:** agent-frontend
- **Validation:** Management UI complete

### Handoff 4: Page Builder → Forms (Cycle 50→64)
- **From:** Element system complete
- **To:** Form elements can be integrated
- **Agent Transition:** agent-frontend → agent-backend (form service)
- **Validation:** Element rendering working

### Handoff 5: Forms → Payments (Cycle 70→84)
- **From:** Lead capture working
- **To:** Purchase flow can be built
- **Agent Transition:** agent-integrator (Stripe)
- **Validation:** Form submission tested

### Handoff 6: Implementation → Testing (Cycle 90→98)
- **From:** All features implemented
- **To:** Comprehensive testing begins
- **Agent Transition:** agent-quality (testing)
- **Validation:** All features implemented

### Handoff 7: Testing → Deployment (Cycle 98→100)
- **From:** All tests passing
- **To:** Production deployment
- **Agent Transition:** agent-quality → agent-ops
- **Validation:** Quality gate approved

---

## Quality Gates (Critical Milestones)

| Cycle | Gate | Owner | Pass Criteria |
|-------|------|-------|---------------|
| 20 | Backend Schema & Services Complete | agent-quality | All tests pass, >80% coverage |
| 30 | Step & Element Services Complete | agent-quality | All tests pass, sequencing verified |
| 40 | Funnel Management UI Complete | agent-quality | CRUD operations working, responsive |
| 50 | Page Builder Complete | agent-quality | Drag-and-drop functional, undo/redo works |
| 60 | Templates System Complete | agent-quality | Instantiation working, lineage tracked |
| 70 | Forms & Email Complete | agent-quality | Form submission → email → analytics |
| 80 | Analytics Dashboard Complete | agent-quality | Charts rendering, exports working |
| 90 | Payment Integration Complete | agent-quality | Stripe checkout end-to-end verified |
| 98 | Full Test Suite Passing | agent-quality | >90% coverage, all E2E tests pass |
| 100 | Production Deployment Complete | agent-ops | Live at web.one.ie, monitoring active |

---

## Risk Mitigation & Blockers

### Technical Risks

**Risk 1: Drag-and-drop performance on large pages**
- **Mitigation:** Use dnd-kit with virtualization; benchmark at cycle 41
- **Fallback:** Simplified grid-based placement if performance poor
- **Owner:** agent-frontend

**Risk 2: Complex event logging at scale**
- **Mitigation:** Implement event batching; test with 10k+ events at cycle 74
- **Fallback:** Eventual consistency with event replay
- **Owner:** agent-backend

**Risk 3: Stripe webhook reliability**
- **Mitigation:** Implement webhook retry logic; test failure scenarios at cycle 89
- **Fallback:** Manual payment verification UI
- **Owner:** agent-integrator

**Risk 4: Custom domain DNS propagation delays**
- **Mitigation:** Use Cloudflare API for instant DNS; documented at cycle 92
- **Fallback:** Subdomain forwarding until DNS propagates
- **Owner:** agent-ops

### Dependency Risks

**Risk 1: Backend API contract changes**
- **Mitigation:** Versioned API contracts; update frontend if schema changes
- **Detection:** Cycle 20 quality gate
- **Escalation:** Stop frontend work until resolved
- **Owner:** agent-backend

**Risk 2: Template design delays**
- **Mitigation:** Use placeholder templates if design incomplete
- **Detection:** Cycle 54 delivery check
- **Fallback:** Generic templates for MVP
- **Owner:** agent-designer

**Risk 3: Stripe integration complexity**
- **Mitigation:** Start with basic checkout; add order bumps/upsells later
- **Detection:** Cycle 83 testing
- **Fallback:** Simplified payment flow
- **Owner:** agent-integrator

---

## Success Metrics

### Cycle Completion Rate
- **Target:** 100% on-time completion
- **Measurement:** Cycles completed within estimated time budget
- **Reporting:** Weekly cycle velocity report

### Test Coverage
- **Target:** >90% overall coverage
- **Unit Tests:** >85% (critical path)
- **Integration Tests:** >80% (cross-component)
- **E2E Tests:** All major user flows covered

### Performance Targets
- **Page Builder Load:** <2 seconds
- **Element Drag Latency:** <100ms
- **Form Submission:** <1 second
- **Analytics Rendering:** <3 seconds

### Quality Gates
- **All Cycles:** Must pass quality check before advancing
- **Blocker Cycles (20, 30, 70, 90, 98):** Must achieve >90% pass rate
- **Deployment (Cycle 100):** Zero critical bugs

---

## Notes & Conventions

1. **Cycle Time Estimates:** Assume 2-4 hour focused work blocks; actual time depends on complexity
2. **Parallel Execution:** Cycles in same group can run simultaneously; different groups have dependencies
3. **Agent Coordination:** Handoffs happen via shared test results and API contracts, not manual communication
4. **Quality Gates:** Cycle cannot advance until quality gate passed
5. **Risk Register:** Blockers escalated immediately; tracked in separate incident log

---

**Ready to Execute:** This assignment matrix enables spawning specialist agents for each wave with clear ownership, dependencies, and quality gates.

**Next Step (Cycle 011):** Begin cycle 11 work with agent-backend designing schema changes.
