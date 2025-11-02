---
title: "Landing Page & Project Onboarding v1.0.0"
description: "Entry point for new creators - Start a Project instead of Pick a Template"
feature: "landing-page"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "People", "Connections", "Events"]
assignedSpecialist: "Engineering Director"
totalInferences: 100
completedInferences: 0
createdAt: 2025-10-30
draft: false
---

# ONE Platform: Landing Page & Project Onboarding v1.0.0

**Focus:** Entry point for new creators - "Start a Project" instead of "Pick a Template"
**Process:** `Infer 1-100 inference sequence`
**Timeline:** 8-12 inferences per specialist per day
**Target:** Zero-friction creator onboarding (Wave 0 - ENTRY POINT)
**Integration:** Works with todo-onboard, todo-agents (via agent-clone)

---

## CRITICAL CONTEXT

**Current Problem:**
- Generic landing page ("Pick a template") doesn't guide creators
- Creators don't know where to start
- Templates are isolated (no context)

**Solution:**
- **"Start a Project"** workflow (not templates)
- **AI landing page generation** (paste URL/social → AI builds landing page)
- **Live demos** (see working examples before starting)
- **Guided paths** (beginner vs advanced)
- **Agent-powered** (agent-clone asks for context, generates content)

**User Journey:**
```
Land on one.ie
    ↓
See featured creators + demo projects
    ↓
Click "Start a Project"
    ↓
Choose: Beginner (simple project) or Advanced (dashboard)
    ↓
Beginner: "I have a URL" → Paste → AI generates landing page + product listings
Advanced: "I want a dashboard" → Linked to live demo
    ↓
Create account
    ↓
Onboarding guides them
    ↓
First creator ready to earn
```

---

## PHASE 1: FOUNDATION & SETUP (Infer 1-10)

**Purpose:** Understand entry point landscape, map to ontology, plan implementation

### Infer 1: Define "Start a Project" Concept
- [ ] Not "Pick a Template" - too generic
- [ ] Is "Start a Project" - guided journey
- [ ] Three paths for users:
  1. **Beginner Path:** "I have a website/social"
     - Paste URL or social profile
     - AI extracts info (who they are, what they do)
     - Generate landing page + product listings
     - Easy setup, fast to sell
  2. **Intermediate Path:** "I want to sell courses"
     - Product creation workflow
     - Course structure (modules, lessons)
     - Student dashboard
     - Certificate generation
  3. **Advanced Path:** "I want a full dashboard"
     - Creator analytics
     - Team management
     - Custom branding
     - API access
- [ ] Each path shows a DEMO before committing
  - [ ] Beginner demo: Working course site (like One.ie itself)
  - [ ] Intermediate demo: Padel course example
  - [ ] Advanced demo: Creator dashboard with metrics

### Infer 2: Map to 6-Dimension Ontology
- [ ] **Groups:** Creator's project (group as container)
- [ ] **People:**
  - [ ] Creator (initiates project)
  - [ ] AI agent-clone (generates content)
  - [ ] Platform admin (approves if needed)
- [ ] **Things:**
  - [ ] project (new thing type)
  - [ ] project_template (starter projects)
  - [ ] landing_page (generated or custom)
  - [ ] project_demo (working example)
- [ ] **Connections:**
  - [ ] creator → project (owns)
  - [ ] project → template (based_on)
  - [ ] project → demo (showcases)
  - [ ] agent-clone → project (generated)
- [ ] **Events:**
  - [ ] project_created
  - [ ] landing_page_generated
  - [ ] demo_viewed
  - [ ] project_published
- [ ] **Knowledge:**
  - [ ] project_category (course, service, marketplace, portfolio)
  - [ ] project_description (embedding for search)
  - [ ] creator_niche (what they teach/sell)

### Infer 3: Define Project Templates
- [ ] **Starter Projects** (not templates - frameworks):
  1. **Blog/Portfolio**
     - Landing page
     - Blog posts (markdown)
     - About page
     - Contact form
     - No CMS (manual updates)
     - Perfect for: Writers, consultants, coaches
  2. **Course Marketplace**
     - Landing page
     - Course listings
     - Lesson structure
     - Student enrollment
     - Certificate generation
     - Perfect for: Educators, experts, coaches
  3. **Service Directory**
     - Landing page
     - Service listings
     - Booking/scheduling
     - Payment processing (X402)
     - Client reviews
     - Perfect for: Consultants, agencies, professionals
  4. **Community/Membership**
     - Landing page
     - Member-only content
     - Discussion forums
     - Events calendar
     - Tier-based access
     - Perfect for: Communities, DAOs, groups
  5. **Newsletter**
     - Landing page
     - Subscriber signup
     - Email scheduling
     - Archive of posts
     - Paid tiers
     - Perfect for: Writers, journalists, thought leaders

- [ ] Each template includes:
  - [ ] Demo (live working example)
  - [ ] Starter content (fills in blanks)
  - [ ] Onboarding guide (how to customize)
  - [ ] Success metrics (what to measure)

### Infer 4: Plan AI Landing Page Generation (agent-clone)
- [ ] **Flow:**
  1. User selects "I have a website/social"
  2. Paste: Website URL OR Social profile (Twitter, LinkedIn, YouTube)
  3. Agent-clone calls:
     - [ ] WebFetch to read URL content
     - [ ] Extract: Name, bio, what they do, links
     - [ ] Claude to summarize + understand niche
  4. Agent generates:
     - [ ] Landing page headline
     - [ ] Hero image (or template)
     - [ ] Value proposition
     - [ ] About section
     - [ ] Services/products list
     - [ ] Call-to-action
  5. User reviews + edits
  6. Landing page published

- [ ] **What if no URL?**
  - [ ] Chat-based: Agent asks questions
    - [ ] "What do you teach/sell?"
    - [ ] "Who is your audience?"
    - [ ] "What's your unique angle?"
  - [ ] Agent builds landing page from conversation

### Infer 5: Define Demo Projects
- [ ] **Live Demos** (working examples users can interact with):
  1. **Padel Course Demo**
     - Landing page (full sales page)
     - Course: "Master Padel Basics"
     - 3 modules, 9 lessons
     - Student dashboard
     - Certificate
     - Pricing: $99 (via X402)
     - URL: https://one.ie/demo/padel-course
     - Built with: Course Marketplace template
  2. **Coaching Services Demo**
     - Landing page
     - 3 services (group, 1:1, corporate)
     - Booking calendar
     - Reviews from past clients
     - Payment (X402)
     - URL: https://one.ie/demo/coaching
     - Built with: Service Directory template
  3. **Newsletter Demo**
     - Landing page
     - 5 published articles
     - Subscribe form
     - Paid tier ($5/month)
     - Archive
     - URL: https://one.ie/demo/newsletter
     - Built with: Newsletter template
  4. **Community Demo**
     - Landing page
     - Member directory
     - Discussion board (3 topics)
     - Events calendar
     - URL: https://one.ie/demo/community
     - Built with: Community template
  5. **Portfolio Demo**
     - Landing page
     - 5 portfolio projects
     - About section
     - Contact form
     - Blog (3 posts)
     - URL: https://one.ie/demo/portfolio
     - Built with: Blog/Portfolio template

- [ ] Each demo:
  - [ ] Is fully functional (can browse, read, click around)
  - [ ] Shows real usage patterns
  - [ ] Demonstrates platform capabilities
  - [ ] Has "Made with ONE" badge
  - [ ] Links back to "Create your own"

### Infer 6: Plan Landing Page Layout (https://one.ie)
- [ ] **Hero Section:**
  - [ ] Headline: "Start Your Creator Project"
  - [ ] Subheadline: "Share your expertise, build your audience, earn money"
  - [ ] CTA: "Start a Project" (big button)
  - [ ] Secondary: "View Demo Projects" (link)
  - [ ] Hero image: Creator working on project (motivational)

- [ ] **Featured Creators Section:**
  - [ ] Show 3-5 successful creators
  - [ ] Name, photo, project type, earnings
  - [ ] Quote: Why they love ONE Platform
  - [ ] Link: "View their project"

- [ ] **Project Types Section:**
  - [ ] 5 starter projects (cards)
  - [ ] Each card shows:
    - [ ] Icon
    - [ ] Name (Course, Services, Newsletter, etc)
    - [ ] Description (1 sentence)
    - [ ] "See Demo" button
    - [ ] "Start This" button
  - [ ] Visual differentiation (colors, icons)

- [ ] **How It Works Section:**
  - [ ] 5 steps:
    1. Choose your project type
    2. Paste your URL or answer questions
    3. AI builds your landing page
    4. Customize + publish
    5. Start earning
  - [ ] Animated flow diagram

- [ ] **FAQ Section:**
  - [ ] "Do I need to code?" → No
  - [ ] "How do I earn money?" → X402 payments
  - [ ] "Can I customize?" → Yes, fully customizable
  - [ ] "What if I need help?" → Community + docs
  - [ ] "How much does it cost?" → Free to start, small commission

- [ ] **CTA Section:**
  - [ ] "Ready to start?"
  - [ ] Big button: "Start Your Project Now"
  - [ ] Smaller text: "No credit card required"

- [ ] **Footer:**
  - [ ] Links: Docs, Blog, Discord, Twitter
  - [ ] Legal: Privacy, Terms, Security

### Infer 7: Plan Authentication Gate
- [ ] **When user clicks "Start a Project":**
  1. Check if logged in
  2. If not → Show login/signup modal
  3. If logged in but NOT onboarded → Redirect to todo-onboard
  4. If logged in AND onboarded → Show project selection

- [ ] **Modal experience:**
  - [ ] Email signup (simple)
  - [ ] Show what's next: "Next, we'll create your project"
  - [ ] Privacy note: "We'll never spam you"

### Infer 8: Plan Agent-Clone Integration
- [ ] **What is agent-clone?**
  - [ ] Described in CLAUDE.md as: "AI clones of creators using their content as training data"
  - [ ] For landing pages: Custom AI that understands creator's voice + brand
  - [ ] Uses: WebFetch (read their site), Claude (analyze + generate), Convex (store)

- [ ] **How agent-clone helps:**
  1. User pastes URL
  2. agent-clone reads content (WebFetch)
  3. Extracts: Name, bio, what they do, tone of voice
  4. Creates vector embedding (semantic understanding)
  5. Claude generates landing page in THEIR voice
  6. Result: Landing page feels authentic, not generic

- [ ] **Implementation:**
  - [ ] New service: `backend/convex/services/landing-page-generator.ts`
  - [ ] Uses agent-clone internally
  - [ ] Returns: Generated landing page HTML + metadata

### Infer 9: Plan "Start a Project" Flow UX
- [ ] **Step 1: Choose Project Type**
  - [ ] 5 cards: Course, Service, Newsletter, Community, Portfolio
  - [ ] Each shows: Icon, name, description, demo button
  - [ ] User clicks one

- [ ] **Step 2: Choose Creation Method**
  - [ ] Option A: "I have a website/social" → Paste URL
  - [ ] Option B: "Start from scratch" → Blank project
  - [ ] Option C: "Talk to me" → Chat with AI
  - [ ] User picks one

- [ ] **Step 3: Input**
  - [ ] If URL: Paste and submit
  - [ ] If scratch: Show blank canvas
  - [ ] If chat: Show conversation interface (agent-clone asks questions)

- [ ] **Step 4: Generate**
  - [ ] Show spinner: "Creating your landing page..."
  - [ ] agent-clone processes
  - [ ] Returns draft landing page

- [ ] **Step 5: Review**
  - [ ] Show generated landing page
  - [ ] Buttons: Edit, Publish, Start Over
  - [ ] Edit mode: In-browser editor (no code)

- [ ] **Step 6: Publish**
  - [ ] Landing page goes live
  - [ ] User added to project
  - [ ] Onboarding tutorials shown
  - [ ] Success! "Your project is live"

### Infer 10: Define Success Metrics
- [ ] Landing page complete when:
  - [ ] https://one.ie landing page live
  - [ ] 5 demo projects functional (can click around)
  - [ ] "Start a Project" button routes to auth/onboard
  - [ ] AI landing page generation working (end-to-end)
  - [ ] Agent-clone integrated (reads URL, generates content)
  - [ ] First creator uses AI to generate landing page
  - [ ] Project published and shows on their dashboard
  - [ ] Mobile responsive (looks good on phone)
  - [ ] < 2 second page load
  - [ ] 10+ creators started projects in first week
  - [ ] 50%+ of creators use AI generation (vs manual)
  - [ ] Positive sentiment in early feedback

---

## PHASE 2: BACKEND SCHEMA & SERVICES (Infer 11-20)

**Purpose:** Add project + landing page things to schema

[Content continues with remaining phases...]

---

## SUCCESS CRITERIA

Landing page complete when:

- ✅ https://one.ie landing page live
- ✅ 5 demo projects fully functional
- ✅ "Start a Project" button works (auth gate)
- ✅ AI landing page generation working (end-to-end)
- ✅ Agent-clone extracts voice (URL, social, chat)
- ✅ Generated landing pages feel authentic
- ✅ First 20 creators use AI generation
- ✅ Mobile responsive (<2s load)
- ✅ 100+ views first week
- ✅ 20%+ click-through (landing page → start project)
- ✅ Positive sentiment ("This is amazing!")
- ✅ Zero errors in generation (monitored)

---

**Status:** Wave 0 - ENTRY POINT (before Wave 1)
**Timeline:** Can start immediately (low dependency on other todos)
**Priority:** CRITICAL (first impression for all creators)
**Revenue Impact:** MEDIUM (reduces signup friction, higher creator conversion)
