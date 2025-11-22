---
title: "CYCLE-009: ClickFunnels Builder - 6-Phase Implementation Breakdown"
dimension: things
category: plans
tags: funnel-builder, phases, implementation, cycles, roadmap
related_dimensions: connections, events, groups, knowledge, people, things
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete 6-phase breakdown of the 100-cycle ClickFunnels-style funnel builder.
  Maps to the vision document and 100-cycle plan with detailed feature matrices,
  success criteria, dependencies, and risk mitigation strategies.
---

# CYCLE-009: ClickFunnels Builder - 6-Phase Implementation Breakdown

**Purpose:** Transform the 100-cycle plan into 6 major phases with clear feature lists, success criteria, dependencies, and parallel execution opportunities.

**Based on:**
- `/one/things/plans/cycle-008-vision-document.md` - What we're building
- `/one/things/plans/clickfunnels-builder-100-cycles.md` - The 100-cycle plan
- `/one/things/plans/clickfunnels-dependency-analysis.md` - Dependencies and parallel paths
- Existing architecture: ChatClientV2, services layer, 6-dimension ontology

---

## Executive Summary

The funnel builder is broken into **6 phases across 100 cycles**, with optimal parallelization enabling 5x speed increase through concurrent development.

| Phase | Cycles | Duration | Key Deliverable | Teams |
|-------|--------|----------|-----------------|-------|
| **Phase 1: Backend Foundation** | 11-30 | ~20 cycles | Funnel/step/element services + CRUD | Backend (5-10) |
| **Phase 2: AI Chat Integration** | 31-50 | ~20 cycles | Conversational funnel building via ChatClientV2 | AI/Chat (5-8) |
| **Phase 3: Template System** | 51-60 | ~10 cycles | 5+ templates + marketplace | Design/Backend (4-6) |
| **Phase 4: Forms & Lead Capture** | 61-70 | ~10 cycles | Form builder + submissions + email | Forms (4-5) |
| **Phase 5: Analytics & Payments** | 71-90 | ~20 cycles | Conversion tracking + Stripe + A/B testing | Analytics/Payments (6-8) |
| **Phase 6: Polish & Production** | 91-100 | ~10 cycles | Performance, testing, deployment | QA/DevOps (3-5) |

**Total:** 100 cycles. **Critical Path:** 31 cycles. **Parallelization:** 69% of work can run off critical path.

---

## Phase 1: Backend Foundation (Cycles 11-30)

### Purpose
Implement the database schema, core services, and CRUD operations for all funnel entities. Everything else depends on this phase.

### Feature List

#### Ontology Implementation (Cycles 11-20)
- [ ] **Cycle 11:** Design schema changes - map all 14 thing types to database
  - `funnel`, `funnel_step`, `funnel_template`, `page_template`, `page_element`
  - `form_submission`, `ab_test`, `funnel_domain`, `funnel_analytics`, `email_sequence`
  - `product`, `payment`, `stripe_account`, `custom_code`
- [ ] **Cycle 12:** Update `backend/convex/schema.ts` with new thing types and properties
- [ ] **Cycle 13:** Create `FunnelService` - pure Effect.ts business logic
- [ ] **Cycle 14:** Define errors - `FunnelNotFoundError`, `FunnelAlreadyPublishedError`, etc.
- [ ] **Cycle 15:** Write Convex queries - list, get, getBySlug, getPublished funnels

#### Core CRUD Operations (Cycles 16-20)
- [ ] **Cycle 16:** Write Convex mutations - create, update, publish, unpublish, duplicate, archive
- [ ] **Cycle 17:** Add event logging - log all mutations to events table
- [ ] **Cycle 18:** Implement organization scoping - all queries filtered by `groupId`
- [ ] **Cycle 19:** Add rate limiting - max 100 funnels/org, max 50 steps/funnel
- [ ] **Cycle 20:** Unit tests - FunnelService with mocked dependencies

#### Funnel Steps & Elements (Cycles 21-30)
- [ ] **Cycle 21:** Create `StepService` - manage sequences and ordering
- [ ] **Cycle 22:** Write step queries - getStepsByFunnel, getStep, getPublishedSteps
- [ ] **Cycle 23:** Write step mutations - addStep, updateStep, removeStep, reorderSteps
- [ ] **Cycle 24:** Create `ElementService` - manage page elements
- [ ] **Cycle 25:** Write element queries - getElementsByStep, getElement
- [ ] **Cycle 26:** Write element mutations - addElement, updateElement, removeElement, updatePosition
- [ ] **Cycle 27:** Implement element property schema - headline, button, form, image types
- [ ] **Cycle 28:** Create connection records - funnel_contains_step, step_contains_element
- [ ] **Cycle 29:** Add sequence validation - ensure no gaps, duplicates, valid types
- [ ] **Cycle 30:** Unit tests - StepService and ElementService

### Success Criteria

**Technical:**
- ✅ Schema 100% complies with 6-dimension ontology
- ✅ All CRUD operations tested (>90% coverage)
- ✅ Zero TypeScript errors
- ✅ Org scoping enforced on every query
- ✅ All mutations logged as events

**Functional:**
- ✅ Can create funnel with 5+ steps programmatically
- ✅ Can add/remove/reorder elements per step
- ✅ Can duplicate funnels with all contents
- ✅ Can publish/unpublish funnels atomically
- ✅ Can list funnels by org with filtering

**Performance:**
- ✅ Funnel queries < 50ms
- ✅ Mutation response time < 100ms
- ✅ Rate limiting prevents abuse

### Dependencies

**Must complete before starting:**
- ✅ Convex backend operational (already done)
- ✅ Better Auth configured (already done)
- ✅ Ontology mapping validated (Cycle 2)

**Critical path:** Cycle 11 → 12 → 13 → (15, 16, 17, 18, 19, 20-26 parallel) → 27-30

### Parallel Opportunities

**Can run simultaneously:**
- Cycles 13-14: FunnelService errors (independent research)
- Cycles 15-20: Queries, mutations, events (all use schema from cycle 12)
- Cycles 21-26: StepService and ElementService (parallel, minimal overlap)
- Cycles 27-30: Validation and tests (depend on all above, but can run together)

**Estimated parallelization:** 10 concurrent agents for cycles 15-26

### Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Schema design too rigid | Phase 2-5 blocked by rework | Medium | Review schema with full team before cycle 11 |
| Performance degradation at scale | Analytics queries slow | Medium | Add indexes, implement pagination in cycle 30 tests |
| Org scoping bugs | Security vulnerability | High | Extra review on all organization-related mutations |
| Connection record complexity | Confusing relationships | Medium | Document connection types clearly with diagrams |

### Estimated Complexity

**Overall: COMPLEX**
- Schema design: MEDIUM (well-defined ontology)
- Service implementation: MEDIUM (clear business logic)
- Event logging: SIMPLE (established pattern)
- Testing: MEDIUM (mocking dependencies)

---

## Phase 2: AI Chat Integration (Cycles 31-50)

### Purpose
Extend ChatClientV2 with funnel-building capabilities. Users will say "Create a product launch funnel" and AI will generate a complete funnel structure conversationally.

### Feature List

#### AI Funnel Generator (Cycles 31-36)
- [ ] **Cycle 31:** Extend ChatClientV2 with funnel-building prompts
  - New system prompt for funnel generation
  - Context-aware suggestions based on industry
  - Understand user intent ("3-step webinar", "lead magnet", etc.)
- [ ] **Cycle 32:** Create AI funnel suggestion templates
  - 5 base templates: Product Launch, Webinar, Lead Magnet, Book Launch, Membership
  - Industry variations (SaaS, Coaching, E-commerce, etc.)
  - Customizable by user input
- [ ] **Cycle 33:** Implement conversational funnel creation flow
  - User: "Create a product launch funnel for $197 course"
  - AI generates structure, asks clarification questions
  - User confirms or refines
  - System creates funnel via Phase 1 services
- [ ] **Cycle 34:** Create conversational page builder prompts
  - Allow "Add a testimonials section" via chat
  - Parse natural language to element placement
  - Suggest layouts and best practices
- [ ] **Cycle 35:** Implement AI element placement via natural language
  - Understand "Headline at top, button below testimonials"
  - Auto-position elements in responsive grid
  - Respect design best practices
- [ ] **Cycle 36:** Add AI design suggestion system
  - "Your headline is too long, try this version"
  - "High-converting funnels use countdown timers here"
  - "Based on your industry, consider social proof"

#### AI-Generated Content (Cycles 37-40)
- [ ] **Cycle 37:** Create /funnels dashboard - list all user's funnels
- [ ] **Cycle 38:** Build FunnelList component - cards with status, conversion rate
- [ ] **Cycle 39:** Implement funnel duplication - UI "Clone Funnel" button
- [ ] **Cycle 40:** Create archive functionality - soft delete with confirmation

#### Page Editor Integration (Cycles 41-50)
- [ ] **Cycle 41:** Create AI chat page editor interface
  - Open ChatClientV2 in side panel
  - Context: current step/page being edited
  - Bidirectional: chat updates page, page updates chat
- [ ] **Cycle 42:** Build page preview component
  - Real-time preview as user edits
  - Mobile/tablet/desktop responsive views
  - Shows how changes look
- [ ] **Cycle 43:** Implement conversational element editing
  - "Change headline to red" → updates element color
  - "Add 20px padding" → updates spacing
  - Full element properties editable via chat
- [ ] **Cycle 44:** Add AI-powered layout suggestions
  - "Try hero layout instead of 2-column"
  - Visual layout templates
  - One-click apply
- [ ] **Cycle 45:** AI copywriting for funnel elements
  - Generate headline alternatives
  - Improve existing copy
  - A/B copy suggestions
- [ ] **Cycle 46:** AI image suggestion system
  - "Generate 3 hero images for product launch"
  - Stock image integration
  - Auto-crop and resize
- [ ] **Cycle 47:** Conversational property editing
  - "Make the button bigger"
  - "Use our brand colors"
  - "Add 30% opacity background"
- [ ] **Cycle 48:** Implement undo/redo for AI changes
  - Track AI-generated elements
  - Cmd+Z to revert AI suggestions
  - Full change history
- [ ] **Cycle 49:** Add AI optimization suggestions
  - "This page has 4 form fields, try 2 fields"
  - "Checkout form takes 12 seconds, this template takes 6"
  - Suggest proven patterns
- [ ] **Cycle 50:** Write integration tests
  - End-to-end: chat input → funnel creation → persistence

### Success Criteria

**Technical:**
- ✅ ChatClientV2 extends without breaking existing features
- ✅ AI generation API calls < 2s response time
- ✅ All generated funnels persist to Phase 1 services
- ✅ Real-time preview updates as user types
- ✅ Conversational edits create valid elements

**User Experience:**
- ✅ User creates funnel from chat in < 5 minutes
- ✅ AI suggestions adopted > 60% of the time
- ✅ Page preview matches live rendering
- ✅ Conversation history preserved per funnel
- ✅ AI understands 10+ intent types (webinar, lead magnet, etc.)

**Functional:**
- ✅ "Create product launch funnel" generates 4-step funnel
- ✅ "Add testimonials section" adds social proof elements
- ✅ "Change headline to red" updates CSS color
- ✅ AI copyrighting generates 3 alternatives
- ✅ Undo/redo works for all AI changes

### Dependencies

**Must complete before starting:**
- ✅ Phase 1 backend (Cycles 11-30) - FunnelService, StepService, ElementService
- ✅ ChatClientV2 already exists - extend, don't rewrite
- ✅ AI/Anthropic API keys configured

**Critical path:** Phase 1 → Cycle 31 → 32 → 33 → (34, 35, 36 parallel) → (41-50)

### Parallel Opportunities

**Can run simultaneously:**
- Cycles 32-33: Template definition and chat integration (independent)
- Cycles 34-36: Page builder prompts (all use same infrastructure)
- Cycles 37-40: Dashboard UI (independent of chat system)
- Cycles 41-50: Page editor integration (depends on 31-36, but all parallel)

**With Phase 1 complete, Phase 2 can have:**
- Batch 6: Cycles 31-36 (6 agents)
- Batch 7: Cycles 37-40 (4 agents)
- Batch 8: Cycles 41-50 (10 agents in parallel)

### Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| AI hallucination in funnel generation | Invalid schema, broken funnels | High | Validate all AI-generated objects against Phase 1 schema |
| Latency in real-time preview | Poor UX feedback | Medium | Implement optimistic updates, lazy render |
| Chat context explosion | Memory/cost grows | Medium | Summarize old messages, implement context windows |
| AI copy quality poor | Users delete AI suggestions | Medium | Use high-quality training data, A/B test prompts |
| Conversational ambiguity | "Red" → font or background? | Medium | Confirm ambiguous edits before applying |

### Estimated Complexity

**Overall: COMPLEX**
- Prompt engineering: COMPLEX (requires iteration)
- ChatClientV2 integration: MEDIUM (API already exists)
- Real-time preview: MEDIUM (WebSocket performance)
- Validation and error handling: COMPLEX (handle AI failures gracefully)

---

## Phase 3: Template System (Cycles 51-60)

### Purpose
Create pre-built funnel templates that users can clone and customize. Templates accelerate user adoption by 70% and provide data for AI training.

### Feature List

#### Template Backend (Cycles 51-55)
- [ ] **Cycle 51:** Create `TemplateService` - manage funnel and page templates
  - CRUD for templates
  - Share/public/private flags
  - Category and industry tags
- [ ] **Cycle 52:** Write template queries
  - listFunnelTemplates (paginated, filtered by category)
  - listPageTemplates (reusable page designs)
  - getTemplate (single template with preview)
  - Search templates by name/industry
- [ ] **Cycle 53:** Write template mutations
  - createTemplate (from scratch)
  - saveAsTemplate (save funnel as template)
  - instantiateTemplate (clone template to new funnel)
  - updateTemplate, deleteTemplate
- [ ] **Cycle 54:** Design 5 funnel templates
  - **Lead Magnet:** Email capture, 2 steps
  - **Product Launch:** Sales page, checkout, thank you, 4 steps
  - **Webinar Funnel:** Registration, replay, checkout, 4 steps
  - **Book Launch:** Pre-order, testimonials, checkout, 3 steps
  - **Membership Signup:** Features, pricing, checkout, recurring, 4 steps
- [ ] **Cycle 55:** Create template seed script
  - Insert 5 templates with full structure (steps + elements)
  - Include preview images
  - Tag with category and industry

#### Template Marketplace Frontend (Cycles 56-60)
- [ ] **Cycle 56:** Build /funnels/templates/index.astro - template marketplace
  - Grid of template cards
  - Filter by category (lead gen, sales, webinar, book, membership)
  - Filter by industry (SaaS, coaching, e-commerce, etc.)
  - Search by name
- [ ] **Cycle 57:** Create TemplateCard component
  - Template preview image
  - Description
  - Category badge
  - "Use Template" button
  - Ratings/usage count
- [ ] **Cycle 58:** Implement template instantiation
  - "Use Template" → creates new funnel from template
  - Clones all steps and elements
  - Preserves template structure, resets content
  - Redirects to page editor (Phase 2 chat)
- [ ] **Cycle 59:** Add "Save as Template" feature
  - Users can save their funnels as templates
  - Optionally share with community
  - Set category and tags
  - Preview auto-generated from live funnel
- [ ] **Cycle 60:** Create template usage connections
  - Log `funnel_based_on_template` connections
  - Track template lineage
  - Analytics: which templates convert best

### Success Criteria

**Technical:**
- ✅ TemplateService >90% test coverage
- ✅ Template queries < 100ms
- ✅ Can handle 1000+ templates efficiently
- ✅ Template instantiation creates valid funnel structure

**User Experience:**
- ✅ Users can discover template in < 2 minutes
- ✅ "Use Template" creates funnel in < 10 seconds
- ✅ 70% of new funnels start from templates
- ✅ Template marketplace has 50+ community templates by Month 6

**Functional:**
- ✅ All 5 base templates available and working
- ✅ Can filter by 5+ categories
- ✅ Can search templates by keyword
- ✅ Clone → edit → save as new template workflow works
- ✅ Preview images auto-generate and display

### Dependencies

**Must complete before starting:**
- ✅ Phase 1 backend (FunnelService, StepService, ElementService)
- ✅ Can run **parallel with Phase 2** (independent from chat)

**Critical path:** Phase 1 → Cycle 51 → 52 → (53, 54 parallel) → 55 → (56-60 parallel)

### Parallel Opportunities

**Can run simultaneously:**
- Cycles 52-53: Template queries and mutations (independent)
- Cycles 54-55: Template design and seed data (design doesn't block queries)
- Cycles 56-60: All marketplace frontend (depends only on cycles 52-53)

**Can truly parallelize with Phase 2:**
- While chat integration happens (cycles 31-50)
- Template backend can be built (cycles 51-55)
- Then marketplace frontend (cycles 56-60)

**Optimal wave:** After Phase 1 completes, spawn 2 parallel branches:
- Branch A: Phase 2 (AI Chat) - 6-10 agents
- Branch B: Phase 3 (Templates) - 4-6 agents

### Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Template quality poor | Low adoption | Medium | Hire conversion designers for initial 5 templates |
| Template previews outdated | Misleading users | Medium | Auto-regenerate previews weekly |
| Duplicated template structure | Redundancy, confusion | Low | Clear naming convention, hide duplicates |
| Community spam templates | Low signal/noise ratio | Medium | Moderate new templates, upvote system |

### Estimated Complexity

**Overall: MEDIUM**
- Backend services: SIMPLE (follows Phase 1 patterns)
- Frontend marketplace: SIMPLE (list/filter/search pattern)
- Template design: MEDIUM (requires UX/design thinking)

---

## Phase 4: Forms & Lead Capture (Cycles 61-70)

### Purpose
Enable funnels to capture leads with forms, collect submissions, and integrate with email automation.

### Feature List

#### Form Backend (Cycles 61-65)
- [ ] **Cycle 61:** Create `FormService` - manage form configurations
  - Form field types: text, email, phone, select, checkbox, radio, textarea, date
  - Field validation rules
  - Form submission handling
  - CSV export
- [ ] **Cycle 62:** Design form field types and properties
  - Each field type has: label, placeholder, required, validation regex
  - Conditional fields (show/hide based on other fields)
  - Pre-fill from user data
  - Custom field names
- [ ] **Cycle 63:** Write form mutations
  - submitForm (validate, create form_submission thing, emit event)
  - updateFormConfig (change fields, validation, redirect)
  - exportSubmissions (CSV download)
  - deleteSubmissions (batch delete old data)
- [ ] **Cycle 64:** Build AI FormBuilder component (conversational)
  - "Add an email field" → adds email input
  - "Make phone required" → updates validation
  - "Move name field to top" → reorder
  - Powered by Phase 2 chat integration
- [ ] **Cycle 65:** Implement form submission handling
  - Validate all fields
  - Create form_submission thing in database
  - Create visitor_submitted_form connection
  - Emit form_submitted event
  - Trigger email sequence (Cycle 67)

#### Form Frontend & Automation (Cycles 66-70)
- [ ] **Cycle 66:** Create /funnels/[id]/submissions.astro
  - Table of all form submissions
  - Filter by date range
  - Export to CSV
  - View individual submission details
- [ ] **Cycle 67:** Build form email integration
  - On submission, trigger email sequence
  - Send confirmation email to user
  - Send notification email to funnel owner
  - Create funnel_sends_email connection
- [ ] **Cycle 68:** Add email verification field type
  - Email field with verification step
  - Send verification link
  - Validate before allowing funnel progression
  - Reduce spam leads
- [ ] **Cycle 69:** Implement form analytics
  - Track submission rate per form
  - Track completion rate by field
  - Identify drop-off fields
  - Show abandonment heatmap
- [ ] **Cycle 70:** Write integration tests
  - Visitor fills form → submission saved → email sent → analytics updated
  - All in correct sequence, no missing events

### Success Criteria

**Technical:**
- ✅ FormService >90% test coverage
- ✅ Form submission < 500ms (end-to-end)
- ✅ Email triggers within 5 seconds of submission
- ✅ All submissions queryable and exportable
- ✅ Zero form field loss (100% data integrity)

**User Experience:**
- ✅ Forms render mobile-responsive
- ✅ Inline validation feedback < 100ms
- ✅ Submission confirmation email arrives in < 1 minute
- ✅ Form owner receives lead notifications
- ✅ Submission data exported in < 5 seconds

**Functional:**
- ✅ Forms with 5+ fields work correctly
- ✅ Conditional fields display/hide based on logic
- ✅ Email verification workflow completes
- ✅ Form abandonment tracked accurately
- ✅ CSV export includes all fields + metadata

### Dependencies

**Must complete before starting:**
- ✅ Phase 1 backend (CRUD services)
- ✅ Phase 2 AI chat (optional, for conversational form building)

**Critical path:** Phase 1 → Cycle 61 → (62 parallel) → (63, 64, 65 parallel) → (66-69) → 70

### Parallel Opportunities

**Can run simultaneously:**
- Cycles 62-65: Form field types, mutations, and AI builder (independent)
- Cycles 66-69: Frontend, email, analytics (depend on 63-65 but parallel)
- Cycle 70: Tests (last after all above)

**Can run parallel with Phase 3 (templates):**
- While Phase 3 builds marketplace (cycles 51-60)
- Phase 4 starts form backend (cycles 61-65)

### Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Email delivery failures | Lost leads | Medium | Implement email queue, retry logic, webhook verification |
| Form spam/bots | Data pollution | High | Add CAPTCHA, email verification, rate limiting |
| Field validation too strict | User frustration | Medium | Test regex patterns, allow international formats |
| Email verification links expire | Users can't submit | Medium | 24-hour expiration, resend link option |
| Abandonment tracking inaccuracy | Bad analytics | Medium | Log every field interaction as event |

### Estimated Complexity

**Overall: MEDIUM**
- Form backend: MEDIUM (validation, state management)
- Email integration: MEDIUM (async queues, retries)
- Conversational builder: SIMPLE (follows Phase 2 patterns)
- Analytics: MEDIUM (event aggregation)

---

## Phase 5: Analytics & Payments (Cycles 71-90)

### Purpose
Track conversion funnels, process payments via Stripe, and provide ROI analytics. This is where funnels generate real value.

### Feature List

#### Analytics Backend (Cycles 71-80)
- [ ] **Cycle 71:** Create `AnalyticsService` - funnel metrics calculation
  - Track views, submissions, conversions per step
  - Calculate conversion rates
  - Revenue attribution
  - A/B test comparisons
- [ ] **Cycle 72:** Design analytics schema
  - Daily aggregations (views, conversions, revenue)
  - Hourly for real-time dashboards
  - Segment by step, traffic source, user segment
- [ ] **Cycle 73:** Write analytics queries
  - getFunnelStats (overall metrics)
  - getStepStats (per-step breakdown)
  - getConversionRate (by step, overall)
  - getRevenueByFunnel, getRevenueByStep
  - getABTestWinner (statistical significance)
- [ ] **Cycle 74:** Implement event aggregation
  - Process visitor_viewed_step events
  - Process visitor_submitted_form events
  - Process customer_purchased_via_funnel events
  - Batch compute daily aggregations
- [ ] **Cycle 75:** Create /funnels/[id]/analytics.astro - dashboard page
  - Overview card: total visitors, conversion %, revenue
  - Funnel visualization (step-by-step drop-off)
  - Time-based charts (visitors over time)
  - Revenue attribution
- [ ] **Cycle 76:** Build FunnelAnalytics component
  - Display funnel overview stats
  - Highlight top and bottom performers
  - Show visitor journey summary
- [ ] **Cycle 77:** Create conversion funnel visualization
  - Vertical chart: Step 1 (100) → Step 2 (75) → Step 3 (45) → Step 4 (18)
  - Show drop-off percentage between each step
  - Click step for detailed metrics
- [ ] **Cycle 78:** Add time-based analytics
  - Date range picker
  - Trend charts (daily/weekly/monthly)
  - Compare periods (this week vs last week)
  - Export date-range data
- [ ] **Cycle 79:** Implement A/B test result tracking
  - Compare variants (A vs B)
  - Calculate statistical significance
  - Declare winner when > 95% confidence
  - Detailed breakdown per variant
- [ ] **Cycle 80:** Create analytics export
  - Download CSV with detailed metrics
  - Include visitor journey data
  - Include conversion funnel breakdown

#### Payment Integration (Cycles 81-90)
- [ ] **Cycle 81:** Create `PaymentService` - Stripe integration
  - Create checkout sessions
  - Handle payment webhooks
  - Manage subscriptions (one-time + recurring)
  - Order bump logic
- [ ] **Cycle 82:** Design payment element type
  - Pricing table (display prices, features)
  - Buy button (one-time purchases)
  - Subscription button (recurring billing)
  - Coupon code input
- [ ] **Cycle 83:** Write payment mutations
  - createCheckoutSession (Stripe Checkout)
  - handlePaymentSuccess (webhook)
  - handlePaymentFailed (webhook)
  - applyCoupon (discount logic)
- [ ] **Cycle 84:** Build PaymentElement component
  - Display product with price
  - One-time vs recurring option toggle
  - Stripe Checkout integration
  - Success/failure redirect handling
- [ ] **Cycle 85:** Implement order bumps
  - Checkbox: "Add [product] for $47 more?"
  - Add to order before payment
  - Track order bump acceptance rate
  - Analytics on upsell effectiveness
- [ ] **Cycle 86:** Create upsell/downsell flow
  - After purchase, show additional offer
  - One-click purchase option
  - Track acceptance rate
  - Different offers based on purchased product
- [ ] **Cycle 87:** Add coupon code support
  - Create discount codes in dashboard
  - Percentage or fixed amount discounts
  - Expiration dates
  - Usage limits (max 100 uses, etc.)
  - Track coupon usage in analytics
- [ ] **Cycle 88:** Implement payment analytics
  - Track revenue per funnel, per step
  - Average order value
  - Customer lifetime value
  - Coupon effectiveness
  - Order bump acceptance rate
- [ ] **Cycle 89:** Create webhook handler for Stripe
  - payment_intent.succeeded → create customer_purchased_via_funnel connection
  - payment_intent.payment_failed → log event for retry
  - charge_dispute.created → alert funnel owner
  - Verify webhook signatures
- [ ] **Cycle 90:** Write integration tests
  - End-to-end: user clicks buy → Stripe checkout → payment success → revenue tracked → funnel owner sees payment

### Success Criteria

**Technical:**
- ✅ Analytics queries < 500ms even with 100k+ events
- ✅ All payments verified against Stripe
- ✅ Zero revenue loss (all transactions recorded)
- ✅ Webhook failures retried and logged
- ✅ A/B test statistics mathematically sound (> 95% confidence)

**User Experience:**
- ✅ Analytics dashboard loads in < 2 seconds
- ✅ Checkout completes in < 30 seconds
- ✅ Payment confirmation email in < 1 minute
- ✅ Analytics show revenue updates within 5 minutes
- ✅ Users understand where drop-off happens

**Functional:**
- ✅ Funnel tracks 100% of visitors through all steps
- ✅ Conversion rate calculated correctly
- ✅ Revenue attributed to correct funnels
- ✅ A/B test winner declared after 100 conversions or 7 days
- ✅ Coupons apply correctly and expire on schedule
- ✅ Order bumps track acceptance rate

### Dependencies

**Must complete before starting:**
- ✅ Phase 1 backend (event logging, connections)
- ✅ Phase 4 forms (form submissions create tracking connections)
- ✅ Stripe account connected and API keys configured

**Critical path:** Phase 1 → Phase 4 → Cycle 71 → (72-80 parallel) → (81-89 parallel) → 90

### Parallel Opportunities

**Can run truly in parallel:**
- Cycles 72-80: Analytics design, queries, frontend (independent)
- Cycles 81-89: Payment backend, elements, webhooks (independent)
- Both branches run simultaneously, unite at cycle 90 tests

**Can run parallel with Phase 2-4:**
- Analytics schema design (cycle 72) while chat integration happens
- Payment element design (cycle 82) while forms are built

**Optimal setup:**
- After Phase 1 + Phase 4 complete
- Spawn 2 branches:
  - Branch A: Analytics (cycles 71-80) - 5 agents
  - Branch B: Payments (cycles 81-89) - 5 agents
  - Then joint testing (cycle 90) - 2 agents

### Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Stripe webhook failures | Payments recorded but not attributed | High | Implement webhook queue, manual reconciliation |
| A/B test false positives | Wrong variant declared winner | Medium | Use Bayesian inference, require 100+ conversions |
| Revenue attribution lag | Analytics show delayed data | Medium | Real-time event processing, batch backfill nightly |
| Payment fraud/chargebacks | Revenue clawback, churn | Medium | Implement fraud detection, chargeback handling |
| Coupon code abuse | Revenue loss from unlimited usage | Medium | Track per-user limits, IP-based throttling |
| Order bump low adoption | Feature underperforms | Low | A/B test button text, pricing, positioning |

### Estimated Complexity

**Overall: COMPLEX**
- Analytics architecture: COMPLEX (real-time aggregation, eventual consistency)
- Stripe integration: COMPLEX (webhooks, idempotency, error handling)
- A/B test statistics: COMPLEX (requires domain expertise)
- Event pipeline: COMPLEX (high-volume processing)

---

## Phase 6: Polish & Production (Cycles 91-100)

### Purpose
Finalize, test, optimize, and deploy to production. Everything must work flawlessly.

### Feature List

#### Polish & Features (Cycles 91-96)
- [ ] **Cycle 91:** Build responsive preview modes
  - Mobile / tablet / desktop toggles
  - Responsive grid adaptation
  - Touch-friendly controls on mobile
  - Real-time preview updates
- [ ] **Cycle 92:** Add custom domain support
  - Connect Cloudflare to funnel
  - Configure DNS settings
  - Auto SSL certificate via Cloudflare
  - Custom domain assignment UI
- [ ] **Cycle 93:** Implement SEO settings per step
  - Meta title, description editable per page
  - OG image for social sharing
  - Schema.json (product/event schema)
  - JSON-LD markup for rich snippets
- [ ] **Cycle 94:** Create custom code injection
  - Allow HTML/CSS/JS custom code per page
  - HTML <head> injection for tracking pixels
  - Page-specific CSS
  - Advanced user feature with warnings
- [ ] **Cycle 95:** Build A/B testing UI
  - Create variants button
  - Set traffic split (50/50, 70/30, etc.)
  - Manual variant selection for testing
  - Declare winner workflow
- [ ] **Cycle 96:** Add collaboration features
  - Invite team members to edit funnel
  - Role-based permissions (view, edit, publish)
  - Realtime collaboration awareness
  - Audit log of all changes

#### Performance & Testing (Cycles 97-99)
- [ ] **Cycle 97:** Optimize performance
  - Lazy load elements below fold
  - Cache template library
  - Prefetch funnel data on navigation
  - Image optimization (WebP, lazy loading)
  - Lighthouse score > 90
- [ ] **Cycle 98:** Run full test suite
  - Unit tests (>90% coverage)
  - Integration tests (end-to-end flows)
  - Performance tests (page load < 2s)
  - Security tests (XSS, CSRF, SQL injection)
  - Accessibility tests (WCAG AA compliance)
- [ ] **Cycle 99:** Write documentation
  - Architecture guide in `/one/things/funnel-builder.md`
  - API reference for services
  - User guide (getting started, advanced features)
  - Troubleshooting guide
  - Migration guide from ClickFunnels

#### Deployment (Cycle 100)
- [ ] **Cycle 100:** Deploy to production
  - `npx convex deploy` (backend)
  - `wrangler pages deploy` (frontend)
  - Configure environment variables
  - Run smoke tests
  - Monitor for errors
  - Announce launch

### Success Criteria

**Technical:**
- ✅ All tests passing (>90% coverage)
- ✅ Zero TypeScript errors
- ✅ Zero console errors in production
- ✅ Page builder loads in < 2 seconds
- ✅ Lighthouse score ≥ 90 all pages
- ✅ Custom domains work correctly
- ✅ Email verification successful
- ✅ WCAG AA accessibility compliance

**Production:**
- ✅ Uptime > 99.9%
- ✅ Error rate < 0.1%
- ✅ All metrics monitored (errors, latency, usage)
- ✅ Automated backups enabled
- ✅ Incident response plan documented

**User-Facing:**
- ✅ Can create, edit, publish funnel in < 10 minutes
- ✅ Funnels render correctly on all devices
- ✅ Form submission works reliably
- ✅ Payment processing < 30 seconds
- ✅ Analytics update within 5 minutes
- ✅ User support documentation complete

### Dependencies

**Must complete before starting:**
- ✅ All Phases 1-5 fully implemented and tested
- ✅ Production infrastructure (Convex hosting, Cloudflare, domain)
- ✅ Monitoring/alerting configured

**Critical path:** All phases → Cycle 97 (optimization) → Cycle 98 (testing) → Cycle 99 (docs) → Cycle 100 (deploy)

### Parallel Opportunities

**Can run simultaneously:**
- Cycles 91-96: All polish features (independent)
- Cycle 97-99: Overlapping (optimization runs while tests write, docs write while tests run)
- Cycle 100: Sequential (only after 97-99 pass)

**Optimal setup:**
- After all Phase 1-5 complete
- Spawn batch:
  - Cycles 91-96 in parallel (6 agents on polish)
  - Cycles 97-99 in parallel (3 agents on perf/test/docs)
  - Then cycle 100 deploy (1 agent)

### Risk Factors

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Production bugs discovered | User data loss, reputational damage | Medium | Comprehensive testing in cycle 98, staging environment |
| Migration data loss | Historical funnels inaccessible | Low | Backup database before deploy, rollback plan |
| Performance regression | Page builder becomes slow | Low | Load testing with production data volume |
| Custom domain DNS issues | Users can't access funnels | Medium | Clear setup guide, automated DNS validation |
| Security vulnerability discovered | User accounts compromised | Low | Penetration testing before launch, bug bounty |

### Estimated Complexity

**Overall: MEDIUM**
- Polish features: SIMPLE (isolated improvements)
- Performance optimization: MEDIUM (requires profiling)
- Testing: MEDIUM (comprehensive but straightforward)
- Documentation: SIMPLE (write-once, reference)

---

## Feature Matrix: Phases × Features

| Feature | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 |
|---------|---------|---------|---------|---------|---------|---------|
| **Funnel CRUD** | ✅ | | | | | |
| **Step Management** | ✅ | | | | | |
| **Element Management** | ✅ | | | | | |
| **AI Chat Builder** | | ✅ | | | | |
| **Page Preview** | | ✅ | | | | |
| **Funnel Templates** | | | ✅ | | | |
| **Template Marketplace** | | | ✅ | | | |
| **Forms** | | | | ✅ | | |
| **Lead Capture** | | | | ✅ | | |
| **Email Automation** | | | | ✅ | | |
| **Form Analytics** | | | | ✅ | | |
| **Conversion Analytics** | | | | | ✅ | |
| **A/B Testing** | | | | | ✅ | ✅ |
| **Stripe Integration** | | | | | ✅ | |
| **Order Bumps/Upsells** | | | | | ✅ | |
| **Coupons** | | | | | ✅ | |
| **Custom Domains** | | | | | | ✅ |
| **SEO Settings** | | | | | | ✅ |
| **Responsive Preview** | | ✅ | | | | ✅ |
| **Team Collaboration** | | | | | | ✅ |

---

## Dependency Graph

```
Phase 1 (Cycles 11-30): Backend Foundation
    ├─ FunnelService, StepService, ElementService
    ├─ Schema & CRUD operations
    └─ Event logging & connections
         │
         ├─── Phase 2 (Cycles 31-50): AI Chat ← Depends on Phase 1
         │    ├─ ChatClientV2 extensions
         │    ├─ Conversational funnel building
         │    └─ Page preview & editing
         │         └─── Phase 4 (Cycles 61-70): Forms ← Depends on Phase 2
         │              ├─ Form builder (conversational)
         │              ├─ Lead capture
         │              └─ Email automation
         │                   └─── Phase 5 (Cycles 71-90): Analytics & Payments
         │
         ├─── Phase 3 (Cycles 51-60): Templates ← Depends on Phase 1 (parallel with Phase 2)
         │    ├─ TemplateService
         │    ├─ Template marketplace
         │    └─ Community templates
         │
         ├─── Phase 5 (Cycles 71-90): Analytics & Payments ← Depends on Phase 1 & 4
         │    ├─ AnalyticsService
         │    ├─ Conversion tracking
         │    ├─ Stripe integration
         │    └─ Revenue analytics
         │
         └─── Phase 6 (Cycles 91-100): Polish ← Depends on ALL phases
              ├─ Performance optimization
              ├─ Testing & documentation
              └─ Production deployment
```

---

## Critical Path Analysis

**Longest dependency chain (31 cycles):**
```
1 (research) → 2 (planning) → 9 (phase breakdown) → 10 (assignments)
→ 11 (schema) → 12 (update schema) → 13 (FunnelService)
→ 15 (queries) → 16 (mutations) → 31 (chat extension)
→ 32 (templates) → 33 (funnel creation) → 37 (dashboard)
→ 61 (FormService) → 65 (submission handling)
→ 71 (AnalyticsService) → 81 (PaymentService)
→ 91 (polish) → 98 (testing) → 100 (deploy)
```

**Total cycles:** 100
**Critical path cycles:** 31
**Parallelization opportunity:** 69% (69 cycles off critical path)

**Speed increase with parallelization:** 5x-10x
- Sequential: ~100 cycles
- Parallel (max): ~10-20 cycles (critical path only)

---

## Execution Waves

### Wave 1: Foundation Research (Cycles 1-10)
**Duration:** Immediate (1-2 cycles, 8 parallel agents)
```
Cycle 1: ClickFunnels research
Cycle 3: Page builder research
Cycles 4-8: Ontology mapping, roles, requirements
Result: Vision + roadmap + team assignments
```

### Wave 2: Planning (Cycles 9-10)
**Duration:** 1-2 cycles after Wave 1
```
Cycle 9: This document (6-phase breakdown)
Cycle 10: Specialist assignment to 6 phases
Result: Clear feature assignments per team
```

### Wave 3: Phase 1 Backend (Cycles 11-30)
**Duration:** 3-4 waves, 10 parallel agents
```
Wave 3A: Schema design & FunnelService (cycles 11-13)
Wave 3B: CRUD operations (cycles 15-26 parallel, 10 agents)
Wave 3C: Testing & validation (cycles 27-30)
Result: Working backend CRUD API
```

### Wave 4: Phase 2 & 3 Parallel (Cycles 31-60)
**Duration:** 2 concurrent waves, 16 parallel agents
```
Branch A - Phase 2 Chat (cycles 31-50, 8-10 agents)
  ├─ Chat extension (cycles 31-36)
  ├─ Dashboard UI (cycles 37-40)
  └─ Page editor (cycles 41-50)

Branch B - Phase 3 Templates (cycles 51-60, 6-8 agents)
  ├─ Template backend (cycles 51-55)
  └─ Marketplace frontend (cycles 56-60)

Result: Conversational funnel builder + template system
```

### Wave 5: Phase 4 & 5 Parallel (Cycles 61-90)
**Duration:** 3 concurrent waves, 12 parallel agents
```
Branch A - Phase 4 Forms (cycles 61-70, 5-6 agents)
  ├─ Form backend (cycles 61-65)
  └─ Submissions & email (cycles 66-70)

Branch B - Phase 5 Analytics (cycles 71-80, 5-6 agents)
  ├─ Analytics backend (cycles 71-74)
  └─ Dashboard frontend (cycles 75-80)

Branch C - Phase 5 Payments (cycles 81-90, 5-6 agents)
  ├─ Stripe integration (cycles 81-85)
  └─ Webhooks & analytics (cycles 86-90)

Result: Complete form→email→payment→analytics pipeline
```

### Wave 6: Phase 6 Polish (Cycles 91-100)
**Duration:** 2 waves, 8 parallel agents
```
Wave 6A: Polish features + performance (cycles 91-97, 6-8 agents)
  ├─ Responsive preview, domains, SEO (cycles 91-96)
  └─ Performance optimization (cycle 97)

Wave 6B: Testing & deployment (cycles 98-100, 2-3 agents)
  ├─ Comprehensive testing (cycle 98)
  ├─ Documentation (cycle 99)
  └─ Production deployment (cycle 100)

Result: Production-ready funnel builder live on one.ie
```

---

## Success Metrics by Phase

### Phase 1 Success (Backend Complete)
- ✅ Can create funnel with any structure programmatically
- ✅ Can manage 1000+ funnels with < 100ms queries
- ✅ Zero data loss, 100% event logging
- ✅ Full org isolation enforced

### Phase 2 Success (AI Chat Live)
- ✅ User says "create webinar funnel" → 4-step funnel generated
- ✅ Conversations updated in < 2 seconds
- ✅ AI suggestions adopted > 60% of time
- ✅ Page previews update in real-time

### Phase 3 Success (Templates Available)
- ✅ 5+ high-quality templates in marketplace
- ✅ 70%+ of new funnels start from templates
- ✅ Can clone template to live funnel in < 10 seconds
- ✅ 50+ community templates by Month 6

### Phase 4 Success (Forms Working)
- ✅ Forms capture emails with < 2% bounce rate
- ✅ Email verification prevents spam
- ✅ Form submissions exported to CSV
- ✅ Confirmation emails deliver in < 1 minute

### Phase 5 Success (Money Flowing)
- ✅ First funnel generates $100+ revenue
- ✅ Analytics show accurate conversion funnels
- ✅ A/B test winners declared with 95% confidence
- ✅ Stripe webhook 100% reliable (zero transaction loss)

### Phase 6 Success (Production Ready)
- ✅ Funnels fully responsive (mobile/tablet/desktop)
- ✅ Custom domains work (users own their funnels)
- ✅ Zero production errors for 1 week before launch
- ✅ Full documentation + user guides ready
- ✅ Team can respond to support requests < 2 hours

---

## Risk Mitigation Summary

### Technical Risks
| Risk | Phase(s) | Mitigation |
|------|----------|-----------|
| Schema design too rigid | 1 | Review with team, build flexibility in properties |
| AI hallucination | 2 | Validate all AI outputs against schema |
| Real-time preview latency | 2 | Implement optimistic updates, async rendering |
| Performance at scale | 1,5 | Load testing, caching, pagination |
| Org scoping bugs | 1 | Security review, test all mutation boundaries |
| Email delivery failures | 4 | Implement queue, retry logic, verification |

### Business Risks
| Risk | Phase(s) | Mitigation |
|------|----------|-----------|
| Low template adoption | 3 | Hire conversion designers, A/B test designs |
| Payment processing issues | 5 | PCI compliance, fraud detection |
| Negative competitor response | All | Patent key innovations, move fast |
| Team burnout (100 cycles) | All | Break into waves, celebrate wins, clear ownership |

### Security Risks
| Risk | Phase(s) | Mitigation |
|------|----------|-----------|
| Org isolation vulnerability | 1 | Extra testing, security review |
| XSS in funnel content | 6 | Sanitize all HTML, Content Security Policy |
| Payment data exposure | 5 | PCI DSS compliance, Stripe handling |
| Email phishing | 4 | Authentication, sender verification |

---

## Team Composition & Assignments

### Phase 1 Backend (10-12 people)
- **Lead:** Backend architect (1)
- **Service developers:** FunnelService, StepService, ElementService (3-4)
- **Schema/database:** Schema design, migrations, testing (2-3)
- **QA/Testing:** Integration tests, performance testing (2-3)

### Phase 2 AI Chat (6-8 people)
- **Lead:** AI/Chat specialist (1)
- **Prompt engineers:** Funnel generation, design suggestions (2-3)
- **Frontend developers:** Page builder UI, preview (2-3)
- **QA/Testing:** Conversation flows, integration tests (1-2)

### Phase 3 Templates (4-6 people)
- **Lead:** Template architect (1)
- **Backend developer:** TemplateService (1-2)
- **Design:** Template designs, marketplace UI (2-3)
- **QA/Testing:** Template instantiation, seed data (1)

### Phase 4 Forms (4-5 people)
- **Lead:** Forms engineer (1)
- **Backend developer:** FormService, submissions (1-2)
- **Frontend developer:** Form builder, analytics (1-2)
- **QA/Testing:** Form flows, validation, email (1)

### Phase 5 Analytics & Payments (10-12 people)
- **Analytics team (5-6):**
  - Lead architect (1)
  - Backend developers: AnalyticsService (2)
  - Frontend developers: Dashboards, charts (2-3)
- **Payments team (5-6):**
  - Lead architect (1)
  - Stripe specialist (1-2)
  - Backend developers: PaymentService, webhooks (1-2)
  - Frontend developers: Payment UI (1-2)

### Phase 6 Polish (8-10 people)
- **Performance engineer:** Optimization, monitoring (1-2)
- **QA lead:** Full test suite, security testing (2-3)
- **DevOps:** Deployment, monitoring, incident response (1-2)
- **Documentation writer:** Architecture, guides, API docs (1)
- **Floating:** Support, bug fixes, integration (1-2)

**Total recommended:** 40-50 people across all phases (not all concurrent)

---

## Go-to-Market Timing

### Minimum Viable Product (End of Phase 2, Cycle 50)
**Can launch with:**
- ✅ Funnel creation (manual + AI chat)
- ✅ Page editing (conversational)
- ✅ Basic form capture
- ✅ Simple analytics (visitor count)
- ❌ No templates
- ❌ No payments
- ❌ No A/B testing

**Target:** Beta launch with 100 early users, gather feedback

### MVP+Templates (End of Phase 3, Cycle 60)
**Add:**
- ✅ Template marketplace (5 templates)
- ✅ Community templates

**Target:** Broader launch, measure template adoption (goal: 70%)

### Production Ready (End of Phase 6, Cycle 100)
**Complete feature set:**
- ✅ All 6 phases complete
- ✅ Payments processing
- ✅ Full analytics
- ✅ A/B testing
- ✅ Custom domains
- ✅ Team collaboration

**Target:** Full public launch, positioning as ClickFunnels replacement

---

## Next Steps

**IMMEDIATE (Cycle 009):**
1. ✅ Create this 6-phase breakdown document
2. ⏳ **Schedule team review meeting** - Validate phases, adjust cycle allocation
3. ⏳ **Form phase teams** - Assign leads to each phase
4. ⏳ **Create phase roadmaps** - Each phase gets detailed cycle-by-cycle plan

**CYCLE 010:**
1. ⏳ **Assign specialists** - DevOps, QA lead, docs writer
2. ⏳ **Setup infrastructure** - Staging environment, monitoring, CI/CD
3. ⏳ **Begin Phase 1** - Schema design, ontology validation

**CYCLE 011+:**
1. ⏳ **Execute Phase 1** - Full backend foundation
2. ⏳ **Queue Phase 2-3** - Start after Phase 1 cycle 12 complete
3. ⏳ **Monitor progress** - Weekly phase syncs, blockers resolution

---

## How to Use This Document

**For Phase Leads:**
- Use your phase section to understand scope, dependencies, risks
- Break cycles further into daily/hourly tasks
- Track progress against success criteria
- Flag blockers immediately

**For Project Managers:**
- Track 6 parallel phases using wave timelines
- Use dependency graph to identify critical path items
- Allocate teams according to recommended composition
- Monitor risk factors weekly

**For Executives:**
- Phase 1 unblocks everything (20 cycles = ~4 weeks with parallel work)
- Phases 2-3 can run simultaneously (10 cycles overlap)
- Phases 4-5 can run simultaneously (20 cycles overlap)
- Phase 6 polish/deploy (10 cycles sequential at end)
- Total: 100 cycles, ~10-15 weeks calendar time with 40-50 people

**For Engineers:**
- Your phase is self-contained but depends on prior phases
- Success criteria define "done"
- Cycles can be broken into smaller stories
- Integration tests are critical between phases

---

## Appendix: Cycle-by-Cycle Quick Reference

### Phase 1: Backend Foundation
- 11-12: Schema design and implementation
- 13-20: FunnelService, queries, mutations, events, scoping
- 21-26: StepService, ElementService, properties
- 27-30: Connections, validation, testing

### Phase 2: AI Chat Integration
- 31-33: ChatClientV2 extension, funnel generation flow
- 34-36: Page builder prompts, element placement, suggestions
- 37-40: Dashboard, duplication, publish, archive
- 41-50: Page editor interface, preview, element editing, undo/redo, suggestions, content generation

### Phase 3: Template System
- 51-53: TemplateService, queries, mutations
- 54-55: Template design, seed data
- 56-60: Marketplace page, cards, instantiation, save as template, connections

### Phase 4: Forms & Lead Capture
- 61-65: FormService, field types, mutations, submissions, builders
- 66-70: Submissions page, email integration, verification, analytics, tests

### Phase 5: Analytics & Payments
- 71-74: AnalyticsService, schema, queries, event aggregation
- 75-80: Dashboard page, components, visualizations, time-based, A/B tracking, export
- 81-85: PaymentService, element design, mutations, PaymentElement, order bumps
- 86-90: Upsells, coupons, analytics, webhooks, tests

### Phase 6: Polish & Production
- 91-96: Responsive preview, custom domains, SEO, custom code, A/B UI, collaboration
- 97: Performance optimization
- 98-99: Testing, documentation
- 100: Production deployment

---

**This 6-phase breakdown is the master implementation roadmap. Each phase has clear deliverables, success criteria, and dependencies. With disciplined execution and parallelization, the funnel builder goes from concept to production in 100 cycles.**

**Philosophy:** "Do the next thing, perfectly." Each cycle compounds. Phase 1 foundation enables Phase 2-5. Parallel branches maximize speed. Phase 6 ensures excellence. Together: ONE funnel builder that outperforms ClickFunnels.
