---
title: ClickFunnels Funnel Builder - 100 Cycle Implementation Plan
dimension: things
category: plans
tags: funnel-builder, clickfunnels, sales-funnel, page-builder, ecommerce, cycles
related_dimensions: connections, events, groups, knowledge, people, things
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete 100-cycle plan for implementing a ClickFunnels-style funnel builder
  into the ONE Platform following the 6-dimension ontology.
---

# ClickFunnels Funnel Builder - 100 Cycle Implementation Plan

**Planning Paradigm:** We plan in **cycle passes** (Cycle 1-100), not days.

Each cycle is a concrete, actionable step < 3k tokens following the principle: "Do the next thing, perfectly."

---

## Ontology Mapping Summary

### 6-Dimension Model for Funnel Builder

**1. GROUPS** → Multi-tenant funnel isolation (each org has their own funnels)

**2. PEOPLE** → 4 Roles
- `platform_owner` - Manages funnel builder platform
- `org_owner` - Creates and manages funnels for their organization
- `org_user` - Edits funnels, views analytics
- `customer` - Goes through funnels, makes purchases

**3. THINGS** (14 new types)
- `funnel` - Sales funnel container
- `funnel_step` - Individual page in funnel sequence
- `funnel_template` - Reusable funnel blueprint
- `page_template` - Reusable page design
- `page_element` - Individual UI component (headline, button, form, etc.)
- `form_submission` - Data collected from funnel forms
- `ab_test` - A/B test configuration for funnel optimization
- `funnel_domain` - Custom domain for funnel
- `funnel_analytics` - Analytics data for funnel performance
- `email_sequence` - Automated email follow-up
- `product` - Product/service being sold (already exists, enhanced)
- `payment` - Transaction record (already exists, enhanced)
- `stripe_account` - Stripe integration (already exists)
- `custom_code` - Custom HTML/CSS/JS snippets

**4. CONNECTIONS** (12 new types)
- `funnel_contains_step` - Links funnel to its steps in sequence
- `step_contains_element` - Links page to its UI elements
- `funnel_based_on_template` - Cloning relationship
- `step_based_on_template` - Page template usage
- `visitor_entered_funnel` - Tracking funnel entry
- `visitor_viewed_step` - Page view tracking
- `visitor_submitted_form` - Form submission tracking
- `customer_purchased_via_funnel` - Conversion tracking
- `funnel_leads_to_product` - Funnel-product relationship
- `ab_test_variant` - Links test to page variants
- `funnel_sends_email` - Email automation trigger
- `funnel_uses_domain` - Custom domain assignment

**5. EVENTS** (18 new types)
- `funnel_created` - Funnel initialization
- `funnel_published` - Funnel goes live
- `funnel_unpublished` - Funnel taken offline
- `funnel_duplicated` - Funnel cloned
- `step_added` - New page added to funnel
- `step_removed` - Page removed from funnel
- `step_reordered` - Funnel sequence changed
- `element_added` - UI element added to page
- `element_updated` - UI element modified
- `element_removed` - UI element deleted
- `form_submitted` - Lead captured
- `purchase_completed` - Sale made through funnel
- `ab_test_started` - A/B test launched
- `ab_test_completed` - A/B test concluded
- `email_sent` - Automated email delivered
- `domain_connected` - Custom domain linked
- `analytics_generated` - Stats calculated
- `funnel_archived` - Funnel soft-deleted

**6. KNOWLEDGE** → Labels & RAG
- Funnel categories: `ecommerce`, `webinar`, `lead-gen`, `book-launch`, `membership`
- Template labels: `high-converting`, `beginner-friendly`, `advanced`
- Industry tags: `saas`, `coaching`, `info-products`, `physical-products`
- Funnel embeddings for AI-powered recommendations

---

## Cycle 1-10: Foundation & Ontology Mapping

**1. [CYCLE-001]** Read ClickFunnels documentation and identify core features (page builder, funnel sequences, templates, A/B testing, analytics, integrations)

**2. [CYCLE-002]** Validate ontology mapping - ensure all 14 thing types, 12 connection types, and 18 event types map correctly to 6 dimensions

**3. [CYCLE-003]** Research existing page builders (Webflow, Framer, Unbounce) to identify drag-and-drop patterns and component libraries

**4. [CYCLE-004]** Define funnel step types: landing page, sales page, upsell page, downsell page, thank you page, webinar registration, opt-in page

**5. [CYCLE-005]** Map page element types: headline, subheadline, paragraph, image, video, button, form, timer, testimonial, pricing table, FAQ

**6. [CYCLE-006]** Identify multi-tenant isolation requirements - all funnels scoped by `groupId`, support for white-label agencies

**7. [CYCLE-007]** Define role permissions - who can create funnels, publish funnels, view analytics, edit templates

**8. [CYCLE-008]** Create high-level vision document explaining how funnel builder solves conversion optimization problem

**9. [CYCLE-009]** Break down feature into 6 major phases: Backend (11-30), Frontend Builder (31-50), Templates (51-60), Analytics (61-70), Integrations (71-80), Polish (81-100)

**10. [CYCLE-010]** Assign features to specialists - backend agent, frontend agent, designer agent, integration agent, quality agent

---

## Cycle 11-20: Backend Schema & Core Services

**11. [CYCLE-011]** Design schema changes - add `funnel`, `funnel_step`, `funnel_template`, `page_template`, `page_element` to things table

**12. [CYCLE-012]** Update `backend/convex/schema.ts` with new thing types and their property schemas (name, status, settings, etc.)

**13. [CYCLE-013]** Create `FunnelService` in `backend/convex/services/funnel/funnel.ts` - pure Effect.ts business logic for funnel CRUD

**14. [CYCLE-014]** Define funnel errors: `FunnelNotFoundError`, `FunnelAlreadyPublishedError`, `InvalidFunnelSequenceError`, `UnauthorizedFunnelAccessError`

**15. [CYCLE-015]** Write Convex queries in `backend/convex/queries/funnels.ts` - list, get, getBySlug, getPublished

**16. [CYCLE-016]** Write Convex mutations in `backend/convex/mutations/funnels.ts` - create, update, publish, unpublish, duplicate, archive

**17. [CYCLE-017]** Add event logging to all mutations - `funnel_created`, `funnel_published`, `funnel_duplicated`, etc.

**18. [CYCLE-018]** Implement organization scoping - ensure all funnel queries filter by `groupId`, validate ownership on mutations

**19. [CYCLE-019]** Add rate limiting to prevent funnel spam - max 100 funnels per org, max 50 steps per funnel

**20. [CYCLE-020]** Write unit tests for `FunnelService` - test create, publish, duplicate flows with mocked dependencies

---

## Cycle 21-30: Funnel Step & Element Backend

**21. [CYCLE-021]** Create `StepService` in `backend/convex/services/funnel/step.ts` - manage funnel steps and sequences

**22. [CYCLE-022]** Write queries for steps - getStepsByFunnel, getStep, getPublishedSteps

**23. [CYCLE-023]** Write mutations for steps - addStep, updateStep, removeStep, reorderSteps

**24. [CYCLE-024]** Create `ElementService` in `backend/convex/services/funnel/element.ts` - manage page elements

**25. [CYCLE-025]** Write queries for elements - getElementsByStep, getElement

**26. [CYCLE-026]** Write mutations for elements - addElement, updateElement, removeElement, updateElementPosition

**27. [CYCLE-027]** Implement element property schema - each element type (headline, button, form) has specific properties (text, color, size, action)

**28. [CYCLE-028]** Create connection records for funnel structure - `funnel_contains_step`, `step_contains_element` with sequence metadata

**29. [CYCLE-029]** Add validation for funnel sequences - ensure no gaps, no duplicates, valid step types

**30. [CYCLE-030]** Write unit tests for `StepService` and `ElementService` - test sequencing, element positioning

---

## Cycle 31-40: Frontend - Funnel Management UI

**31. [CYCLE-031]** Create `/web/src/pages/funnels/index.astro` - funnel dashboard listing all user's funnels with status, stats

**32. [CYCLE-032]** Build `FunnelList` component in `/web/src/components/funnel/FunnelList.tsx` - display funnels as cards with thumbnails, status badges

**33. [CYCLE-033]** Create `/web/src/pages/funnels/[id]/index.astro` - funnel detail page with step sequence visualization

**34. [CYCLE-034]** Build `FunnelSequence` component - visual flowchart showing funnel steps with arrows, conversion rates between steps

**35. [CYCLE-035]** Create funnel settings page `/web/src/pages/funnels/[id]/settings.astro` - edit name, slug, domain, SEO

**36. [CYCLE-036]** Build `FunnelSettings` form component using shadcn/ui - validate slug uniqueness, domain format

**37. [CYCLE-037]** Add "Create Funnel" modal - choose from scratch or template, set name and category

**38. [CYCLE-038]** Implement funnel duplication - "Clone Funnel" button that copies all steps and elements

**39. [CYCLE-039]** Add publish/unpublish toggle - change funnel status, trigger `funnel_published`/`funnel_unpublished` events

**40. [CYCLE-040]** Create archive functionality - soft delete with confirmation modal, trigger `funnel_archived` event

---

## Cycle 41-50: Frontend - Drag-and-Drop Page Builder

**41. [CYCLE-041]** Research drag-and-drop libraries - evaluate `dnd-kit`, `react-beautiful-dnd`, `react-dnd` for performance and mobile support

**42. [CYCLE-042]** Create `/web/src/pages/funnels/[funnelId]/steps/[stepId]/edit.astro` - page builder interface

**43. [CYCLE-043]** Build `PageBuilder` component - left sidebar (elements), center canvas (preview), right panel (element properties)

**44. [CYCLE-044]** Implement canvas grid system - elements snap to 12-column responsive grid

**45. [CYCLE-045]** Create element palette - categorized UI elements (Text, Media, Forms, Commerce, Widgets) draggable to canvas

**46. [CYCLE-046]** Build element rendering system - map element type to React component (HeadlineElement, ButtonElement, FormElement, etc.)

**47. [CYCLE-047]** Implement element selection - click element to select, show bounding box, display properties panel

**48. [CYCLE-048]** Add element property editor - conditional fields based on element type (text → font/size/color, button → action/link, form → fields)

**49. [CYCLE-049]** Implement drag-to-reorder - reorder elements within page, update sequence via `updateElementPosition` mutation

**50. [CYCLE-050]** Add undo/redo stack - track element changes, allow reverting via Cmd+Z / Cmd+Shift+Z

---

## Cycle 51-60: Templates & Cloning System

**51. [CYCLE-051]** Create `TemplateService` in `backend/convex/services/funnel/template.ts` - manage funnel and page templates

**52. [CYCLE-052]** Write queries for templates - listFunnelTemplates, listPageTemplates, getTemplate

**53. [CYCLE-053]** Write mutations for templates - createTemplate, saveAsTemplate, instantiateTemplate

**54. [CYCLE-054]** Design 5 funnel templates - Lead Magnet, Product Launch, Webinar Funnel, Book Launch, Membership Signup

**55. [CYCLE-055]** Create template data seed script - insert funnel templates with pre-configured steps and elements

**56. [CYCLE-056]** Build `/web/src/pages/templates/index.astro` - template marketplace with filters by category and industry

**57. [CYCLE-057]** Create `TemplateCard` component - preview image, description, "Use Template" button

**58. [CYCLE-058]** Implement template instantiation - clicking "Use Template" clones funnel structure, creates connections, preserves element settings

**59. [CYCLE-059]** Add "Save as Template" feature - org owners can save their funnels as templates, optionally share with community

**60. [CYCLE-060]** Create connection records for template usage - `funnel_based_on_template`, `step_based_on_template` for tracking template lineage

---

## Cycle 61-70: Form Builder & Lead Capture

**61. [CYCLE-061]** Create `FormService` in `backend/convex/services/funnel/form.ts` - manage form configurations and submissions

**62. [CYCLE-062]** Design form field types - text, email, phone, select, checkbox, radio, textarea, date

**63. [CYCLE-063]** Write mutations for forms - submitForm, updateFormConfig, exportSubmissions

**64. [CYCLE-064]** Build `FormBuilder` component - drag fields, set labels, configure validation, set required fields

**65. [CYCLE-065]** Implement form submission handling - validate fields, create `form_submission` thing, create `visitor_submitted_form` connection

**66. [CYCLE-066]** Create `/web/src/pages/funnels/[id]/submissions.astro` - view all form submissions in table with export to CSV

**67. [CYCLE-067]** Build form integration with email - trigger email sequence on submission, create `funnel_sends_email` connection

**68. [CYCLE-068]** Add email verification field type - send verification email, validate before allowing funnel progression

**69. [CYCLE-069]** Implement form analytics - track submission rate, completion rate by field, identify drop-off points

**70. [CYCLE-070]** Write integration tests for form flow - visitor submits form → submission saved → email sent → analytics updated

---

## Cycle 71-80: Analytics & Conversion Tracking

**71. [CYCLE-071]** Create `AnalyticsService` in `backend/convex/services/funnel/analytics.ts` - calculate funnel metrics

**72. [CYCLE-072]** Design analytics schema - track views, unique visitors, submissions, purchases per step and funnel

**73. [CYCLE-073]** Write queries for analytics - getFunnelStats, getStepStats, getConversionRate, getRevenueByFunnel

**74. [CYCLE-074]** Implement event aggregation - process `visitor_viewed_step`, `visitor_submitted_form`, `customer_purchased_via_funnel` events to calculate metrics

**75. [CYCLE-075]** Create `/web/src/pages/funnels/[id]/analytics.astro` - analytics dashboard with charts

**76. [CYCLE-076]** Build `FunnelAnalytics` component - display funnel overview (total visitors, conversion rate, revenue)

**77. [CYCLE-077]** Create conversion funnel visualization - vertical chart showing drop-off between steps

**78. [CYCLE-078]** Add time-based analytics - filter by date range, show trends over time with line charts

**79. [CYCLE-079]** Implement A/B test result tracking - compare variants, calculate statistical significance

**80. [CYCLE-080]** Create analytics export - download CSV with detailed visitor journey data

---

## Cycle 81-90: Payment Integration & E-commerce

**81. [CYCLE-081]** Create `PaymentService` in `backend/convex/services/funnel/payment.ts` - handle Stripe integration for funnels

**82. [CYCLE-082]** Design payment element type - pricing table, buy button, checkout form with Stripe integration

**83. [CYCLE-083]** Write mutations for payments - createCheckoutSession, handlePaymentSuccess, handlePaymentFailed

**84. [CYCLE-084]** Build `PaymentElement` component - configurable pricing display, one-time/subscription options, Stripe Checkout integration

**85. [CYCLE-085]** Implement order bumps - add checkbox for additional product during checkout

**86. [CYCLE-086]** Create upsell/downsell flow - after purchase, show additional offer, track acceptance rate

**87. [CYCLE-087]** Add coupon code support - discount codes with expiration, usage limits, percentage/fixed amount

**88. [CYCLE-088]** Implement payment analytics - track revenue per funnel, average order value, lifetime value

**89. [CYCLE-089]** Create webhook handler for Stripe - process payment_intent.succeeded, update connections, log events

**90. [CYCLE-090]** Write integration tests for purchase flow - visitor clicks buy → Stripe checkout → payment success → customer_purchased_via_funnel connection created

---

## Cycle 91-100: Polish, Deployment & Documentation

**91. [CYCLE-091]** Build responsive preview - mobile/tablet/desktop preview modes in page builder

**92. [CYCLE-092]** Add custom domain support - connect Cloudflare, configure DNS, SSL certificates

**93. [CYCLE-093]** Implement SEO settings per step - meta title, description, OG image, schema markup

**94. [CYCLE-094]** Create custom code injection - allow custom HTML/CSS/JS per page for advanced users

**95. [CYCLE-095]** Build A/B testing UI - create variants, set traffic split, declare winner

**96. [CYCLE-096]** Add collaboration features - invite team members, role-based editing permissions

**97. [CYCLE-097]** Optimize performance - lazy load elements, cache templates, prefetch funnel data

**98. [CYCLE-098]** Run full test suite - unit tests, integration tests, e2e tests for complete funnel journey

**99. [CYCLE-099]** Write documentation in `/one/things/funnel-builder.md` - architecture, ontology mapping, usage guide, API reference

**100. [CYCLE-100]** Deploy to production - `npx convex deploy`, `wrangler pages deploy`, announce funnel builder launch

---

## Extended Feature Roadmap (Post-Launch)

**Phase 2 (Cycles 101-120):** Advanced Features
- **101-105:** Email automation builder (visual email sequence designer)
- **106-110:** Membership area integration (protect pages, grant access after purchase)
- **111-115:** Webinar integration (live/automated webinars, countdown timers)
- **116-120:** Affiliate system (track referrals, commissions via connections)

**Phase 3 (Cycles 121-140):** AI-Powered Features
- **121-125:** AI copywriting assistant (generate headlines, CTAs, body copy)
- **126-130:** AI funnel optimizer (suggest improvements based on conversion data)
- **131-135:** AI image generation (create page backgrounds, product images)
- **136-140:** AI analytics insights (natural language queries, anomaly detection)

**Phase 4 (Cycles 141-160):** Marketplace & White-Label
- **141-145:** Template marketplace (creators sell funnel templates)
- **146-150:** White-label platform (agencies rebrand funnel builder)
- **151-155:** API for funnel management (headless funnel builder)
- **156-160:** Migration tools (import from ClickFunnels, Leadpages, Kartra)

---

## Success Metrics

**Technical Metrics:**
- **Schema Compliance:** 100% of funnel data maps to 6-dimension ontology
- **Test Coverage:** >90% for funnel services and components
- **Performance:** Page builder loads in <2s, element drag <16ms latency
- **Type Safety:** Zero TypeScript errors in funnel codebase

**Business Metrics:**
- **Adoption:** 50+ organizations create funnels in first month
- **Conversion:** Average funnel conversion rate >15%
- **Revenue:** $10k+ processed through funnels in first month
- **Templates:** 20+ high-quality templates available

**User Experience Metrics:**
- **Time to First Funnel:** <10 minutes from signup to published funnel
- **Builder Satisfaction:** >4.5/5 rating for ease of use
- **Template Usage:** >70% of funnels start from templates
- **Mobile Responsiveness:** All funnels render correctly on mobile

---

## Dependencies

**Required Before Starting:**
- ✅ Convex backend operational
- ✅ Better Auth configured
- ✅ Stripe integration working
- ✅ Cloudflare Pages deployment pipeline
- ✅ shadcn/ui components installed

**Parallel Development Opportunities:**
- **Cycles 11-30 (Backend)** can run in parallel with **Cycles 71-80 (Analytics Schema Design)**
- **Cycles 31-50 (Frontend Core)** can run in parallel with **Cycles 51-60 (Template Data)**
- **Cycles 61-70 (Forms)** can run in parallel with **Cycles 81-90 (Payments)**

---

## Risk Mitigation

**Technical Risks:**
1. **Drag-and-drop performance** - Mitigation: Use `dnd-kit` with virtualization for large pages
2. **Mobile page builder UX** - Mitigation: Responsive grid system, touch-optimized controls
3. **Custom domain DNS complexity** - Mitigation: Clear setup wizard, Cloudflare API integration

**Business Risks:**
1. **ClickFunnels feature parity** - Mitigation: Start with MVP (80% of features users actually use)
2. **Migration from competitors** - Mitigation: Build import tools in Phase 4
3. **Template quality** - Mitigation: Hire conversion designers for initial template library

---

## Ontology Compliance Checklist

- ✅ All funnels scoped by `groupId` (multi-tenant isolation)
- ✅ All entities use `things` table (no custom tables)
- ✅ All relationships use `connections` table
- ✅ All actions logged in `events` table
- ✅ Authorization via `people` roles
- ✅ Categorization via `knowledge` labels
- ✅ Protocol field set to `clickfunnels-builder` where applicable

---

**Philosophy:** This plan builds a funnel builder that doesn't just replicate ClickFunnels—it transcends it by mapping to universal reality (the 6-dimension ontology). This enables AI agents to enhance, optimize, and extend the funnel builder with 98% accuracy, creating a system that compounds in capability over time.

**Next Step:** Execute `/build` to assign cycles to specialist agents and begin implementation.
