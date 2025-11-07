# /create - Create New Features & Projects

🚀 **Create features using AI specialists. Cycle-based planning, 100-cycle execution.**

## Quick Start

**First time?** Start with onboarding to extract your brand:
```bash
/onboard                          # Analyze website & extract brand identity
```

**Ready to build?** Choose your approach:
```bash
/create                           # Start feature wizard (guided mode)
/create [feature-name]            # Create specific feature
/create backend [feature-name]    # Create with backend (explicit)
/create help                      # Show help
```

## Feature Types & Cycle Counts

### 1. Frontend Feature
**Build UI components & pages using existing /web infrastructure**
- Reuse proven components from shadcn/ui + Astro
- Customize styling, layout, content
- No backend changes needed
- **Cycles:** 20-40 cycles

**Examples:**
- Page redesigns (landing, shop, portfolio)
- Component enhancements (cards, galleries, forms)
- Content collections (blog, courses)

### 2. Custom Backend Service
**Build new backend logic with database schema changes**
- Design database schema (groups, things, connections)
- Implement Convex mutations/queries
- Create Effect.ts services
- Build frontend for new functionality
- **Cycles:** 60-90 cycles

**Examples:**
- AI tutors, token economy, analytics
- Enrollment systems, billing, member tiers
- Custom workflows, integrations

### 3. Integration
**Connect external services or protocols**
- API integrations, webhooks
- Third-party services (payment, email, etc.)
- Protocol implementations
- **Cycles:** 30-60 cycles

### 4. Custom Feature
**Something else - describe what you need**
- Special requirements, specific tech
- Hybrid approaches, novel combinations
- **Cycles:** Variable

---

## What's Already Built

Based on your cycle.json state (Cycle 100/100 complete):

**Current Feature:** New Feature
**Organization:** Default Org
**Role:** platform_owner
**Status:** ✅ Complete (100 cycles executed)

**Lessons Learned:** 100+ successful cycle cycles documented

To start a NEW feature, run:
```bash
/create [new-feature-name]        # Begin new 100-cycle plan
/reset                            # Start fresh (clears current state)
```

---

## Ready-to-Build Projects (Optimized Plans Available)

**Use `/plan [project]` to see full optimized plan, or `/create [project]` to start building:**

### 1. Blog (30 cycles · Frontend-only)
```bash
/plan blog         # See full plan with quick wins
/create blog       # Start building article publishing system
/fast blog-post    # Quick: Create single blog post page
```
**Features:** Article publishing, categories, tags, search, RSS, SEO
**Quick Win:** Working blog by Cycle 3, MVP by Cycle 10
**Architecture:** Frontend-only (Astro content collections)

### 2. Pages (20 cycles · Frontend-only)
```bash
/plan pages        # See full plan with quick wins
/create pages      # Start building landing page builder
/fast landing      # Quick: Create single landing page
```
**Features:** Hero sections, features, testimonials, CTAs, responsive design
**Quick Win:** Hero section by Cycle 3, MVP by Cycle 8
**Architecture:** Frontend-only (static pages)

### 3. Shop (28 cycles · Frontend + Stripe)
```bash
/plan shop         # See full plan with quick wins
/create shop       # Start building e-commerce store
/fast product      # Quick: Add single product page
```
**Features:** Product catalog, cart, checkout, Stripe payments, orders
**Quick Win:** Product listing by Cycle 3, first sale by Cycle 8
**Architecture:** Frontend-only + Stripe.js (no backend initially)

### 4. Dashboard (40 cycles · Backend + Frontend)
```bash
/plan dashboard    # See full plan with quick wins
/create dashboard  # Start building analytics dashboard
```
**Features:** Real-time metrics, charts, activity feed, team management
**Quick Win:** Backend schema by Cycle 3, 3 metrics live by Cycle 8
**Architecture:** Backend (Convex real-time) + Frontend

### 5. Email (45 cycles · Backend + Frontend)
```bash
/plan email        # See full plan with quick wins
/create email      # Start building messaging system
```
**Features:** Conversations, threads, search, notifications, attachments
**Quick Win:** Backend schema by Cycle 3, send/receive by Cycle 8
**Architecture:** Backend (Convex real-time) + Frontend

### 6. Website (55 cycles · Backend + Frontend)
```bash
/plan website      # See full plan with quick wins
/create website    # Start building website builder
```
**Features:** Page builder, CMS, templates, multi-language, SEO tools
**Quick Win:** Backend schema by Cycle 3, page editor by Cycle 8
**Architecture:** Backend (Convex CMS) + Frontend

---

## Or Build Custom Features

### Single Component/Page
```bash
/fast [feature]               # Build in minutes (< 5 files)
/create [feature-name]        # Build specific feature (plan generated)
```
**Location:** `/web/src/pages/blog/`
**Components:** Article cards, RSS feeds, tags, archives
**Cycles:** 20-30 cycles (frontend-only)

### Portfolio (Showcase)
```bash
/create portfolio-gallery          # Add portfolio gallery with filtering
/create portfolio-case-studies     # Add detailed case study pages
/create portfolio-testimonials     # Add client testimonials
/create portfolio-projects         # Add project showcase
```
**Location:** `/web/src/pages/portfolio.astro`
**Components:** Project cards, filtering, lightbox gallery
**Cycles:** 25-40 cycles (frontend-only)

### Courses
```bash
/create courses-preview            # Add course preview cards
/create courses-enrollment         # Add course enrollment UI
/create courses-progress           # Add student progress tracking
/create courses-certificates       # Add certificate generation UI
```
**Location:** `/web/src/components/features/courses/`
**Components:** Course cards, lesson player, progress bar
**Cycles:** 40-60 cycles (frontend + backend)

### Landing & Marketing
```bash
/create landing-hero               # Redesign hero section
/create landing-features           # Add features showcase
/create landing-pricing            # Add pricing section
/create landing-cta                # Add call-to-action sections
```
**Location:** `/web/src/pages/index.astro`
**Components:** Hero, feature cards, pricing tables
**Cycles:** 20-30 cycles (frontend-only)

### Customization Examples

```bash
# Redesign existing features
/create shop --rebrand             # Update shop branding
/create blog --dark-mode           # Add dark mode support
/create portfolio --animation      # Add animated transitions

# Add to existing features
/create shop --add-wishlist        # Add wishlist to shop
/create blog --add-comments        # Add comments to articles
/create portfolio --add-filters    # Add advanced filtering
```

## Custom Backend Features

**When you need NEW backend logic, explicitly request it:**

```bash
/create backend ai-tutors          # Custom AI tutor system
/create backend token-economy      # Custom token economy
/create backend analytics          # Custom analytics dashboard
/create backend enrollment         # Custom enrollment system
```

### Backend Request Format

```bash
/create backend [feature-name]     # Triggers agent-backend + agent-frontend
```

**Examples of valid backend requests:**
```bash
/create backend ai-tutors          # AI tutor integration (60-90 cycles)
/create backend token-economy      # Token economy system (70-100 cycles)
/create backend custom-analytics   # Custom analytics (50-80 cycles)
/create backend member-tiers       # Membership tier system (60-90 cycles)
/create backend invoice-system     # Invoice/billing system (70-100 cycles)
```

## Before You Start: Search for Existing Code

**CRITICAL:** Before implementing anything new:

1. **Search for existing implementations:**
   ```bash
   # Frontend components
   find /Users/toc/Server/ONE/web/src/components -name "*.tsx"

   # Pages
   find /Users/toc/Server/ONE/web/src/pages -name "*.astro" -o -name "*.tsx"

   # Backend functions
   find /Users/toc/Server/ONE/backend/convex -name "*.ts"

   # Search by keyword (example: "product")
   grep -r "Product" /Users/toc/Server/ONE/web/src/ /Users/toc/Server/ONE/backend/convex/
   ```

2. **Ask yourself:**
   - Does a similar component/function exist?
   - Can I extend it instead of creating new?
   - What patterns are already established?

3. **Build on what exists:**
   - ✅ Extend ThingCard, not create ProductCard
   - ✅ Add prop to existing component
   - ✅ Enhance existing mutation
   - ❌ Duplicate patterns

**Pattern convergence = 98% accuracy. Pattern divergence = 30% accuracy.**

---

## Workflow

### Step 1: Discover Existing Code (MANDATORY)

**Before generating ANY code:**

1. **Search codebase:**
   ```bash
   # Components
   ls -la /Users/toc/Server/ONE/web/src/components/features/

   # Pages
   ls -la /Users/toc/Server/ONE/web/src/pages/

   # Backend
   ls -la /Users/toc/Server/ONE/backend/convex/mutations/
   ls -la /Users/toc/Server/ONE/backend/convex/queries/

   # Search for patterns (replace <keyword> with your feature)
   grep -r "<keyword>" /Users/toc/Server/ONE/web/src/
   grep -r "<keyword>" /Users/toc/Server/ONE/backend/convex/
   ```

2. **Document what exists:**
   - Existing components that might be reusable
   - Existing mutations/queries to extend
   - Established patterns to follow

3. **Decision:**
   - ✅ Extend existing code (90% of cases)
   - ⚠️ Create new only if truly different (10% of cases)

### Step 2: Describe What You Want

```bash
/create shop-recommendations
# or
/create portfolio --add-filters
# or
/create backend ai-tutors
```

### Step 3: Agent-Director Validates & Plans

1. **Check existing /web components**
2. **Decide: Frontend-only or Backend-required?**
3. **Create 100-cycle plan** with cycle breakdown
4. **Assign to specialist(s)** (agent-frontend, agent-backend, etc.)
5. **Load dependencies** from cycle context

**Rule:** Prefer extending over creating new code.

### Step 4: See Your Plan

```bash
/plan show
# Shows:
# - 100-cycle breakdown
# - Phase descriptions (1-10 through 91-100)
# - Agent assignments
# - Dependencies & parallel opportunities
```

### Step 5: Execute Cycles

Follow the cycle workflow:
```bash
/now                               # See current cycle (1-100)
/next                              # Advance to next cycle
/done                              # Mark complete & capture lesson
```

Each cycle ~5-20 minutes depending on complexity.

---

## Examples

### Example 1: Frontend-Only (FASTEST)
You request: `/create landing-hero`

```
✅ Category: Frontend Feature
✅ No database changes needed
✅ Assigned to: agent-frontend + agent-designer
✅ Cycle cycles: 20-30
✅ Phase breakdown:
   • Cycle 1-5: Understand & validate
   • Cycle 6-10: Design wireframes
   • Cycle 11-20: Build components
   • Cycle 21-30: Test & deploy
```

### Example 2: Backend Service (COMPREHENSIVE)
You request: `/create backend ai-tutors`

```
✅ Category: Backend Service
✅ Needs: schema design, mutations, queries, Effect.ts services
✅ Assigned to: agent-backend + agent-frontend + agent-quality
✅ Cycle cycles: 60-90
✅ Phase breakdown:
   • Cycle 1-10: Foundation & plan
   • Cycle 11-20: Backend schema & services
   • Cycle 21-30: Frontend pages & components
   • Cycle 31-40: Integration & connections
   • Cycle 41-50: Auth & authorization
   • Cycle 51-60: Knowledge & RAG
   • Cycle 61-70: Quality & testing
   • Cycle 71-80: Design & wireframes
   • Cycle 81-90: Performance & optimization
   • Cycle 91-100: Deployment & documentation
```

### Example 3: Integration (VARIABLE)
You request: `/create backend stripe-payment`

```
✅ Category: Integration
✅ Type: Third-party service (Stripe)
✅ Assigned to: agent-integrator + agent-frontend
✅ Cycle cycles: 30-50
✅ Phase breakdown:
   • Cycle 1-10: API exploration & validation
   • Cycle 11-25: Backend integration layer
   • Cycle 26-40: Frontend payment UI
   • Cycle 41-50: Testing & deployment
```

### Example 4: Direct Commands
Quick feature building:

```bash
/create shop-recommendations     # → Frontend feature (25-35 cycles)
/create blog --add-comments      # → Frontend enhancement (15-25 cycles)
/create backend token-economy    # → Backend service (70-100 cycles)
```

## Available Components by Feature

### Shop Components
- Product cards with images, pricing, ratings
- Shopping cart with quantity management
- Checkout flow with shipping & payment
- Product filters (category, price, rating)
- Search functionality
- Order history & tracking

### Blog Components
- Article cards with preview & metadata
- Featured articles section
- Category/tag navigation
- Search & filtering
- RSS feeds
- Newsletter signup
- Comment system (optional)

### Portfolio Components
- Project showcase cards
- Portfolio filtering (by category, skills)
- Lightbox image gallery
- Case study detail pages
- Client testimonials
- Skills/expertise listing
- Project links & CTAs

### Course Components
- Course cards with preview
- Course detail pages
- Lesson player
- Progress tracking
- Quiz/assessment UI
- Certificate preview
- Instructor profiles
- Student reviews

### Landing Components
- Hero section with CTA
- Feature showcase with icons
- Pricing tables with tiers
- Testimonial carousel
- FAQ accordion
- Email capture forms
- Social proof (reviews, numbers)
- Footer with links

## Cycle Cycle Estimates

| Type | Cycles | Typical | Agents |
|------|--------|---------|--------|
| Frontend-only (reuse) | 20-40 | 25 cycles | agent-frontend |
| Frontend enhancement | 15-25 | 20 cycles | agent-frontend |
| Custom backend | 60-90 | 75 cycles | agent-backend + agent-frontend |
| Integration | 30-60 | 45 cycles | agent-integrator + agent-frontend |

**Each cycle:** 5-20 minutes (depends on complexity)

## Pro Tips

**Start with frontend-only features:**
- ✅ Reuse components from /web (fast, proven, tested)
- ✅ Customize styling, layout, branding
- ✅ Add filtering, search, or sorting
- ✅ Reorganize content, add new pages
- ✅ Integrate existing third-party services

**Go backend when you need:**
- ❌ New data models or database schema
- ❌ Custom business logic not in existing code
- ❌ Real-time features (WebSockets, live updates)
- ❌ Complex calculations or transformations
- ❌ Multi-step workflows or state machines

**Key principle:** If you can solve it with styling or layout, it's frontend-only. If you need new data or logic, it's backend.

## Commands

```bash
/create                           # Start feature creator (guided wizard)
/create help                      # Show this help
/create [feature-name]            # Create specific feature (skip wizard)
/create backend [feature-name]    # Create with backend support
/onboard                          # Analyze website & extract brand (first time)

# During execution:
/now                              # See current cycle (1-100)
/next                             # Advance to next cycle
/done                             # Mark complete, capture lesson, advance
/plan show                        # View your 100-cycle plan
/reset                            # Start new feature (clear current state)
```

## Workflow Integration

The `/create` command integrates with the cycle workflow:

```
/create [feature]   →   agent-director plans   →   /now shows progress
                        (100-cycle breakdown)
                               ↓
                        /next / /done execute
                        each cycle cycle
```

---

**Golden Rule:** Always ask "Can I solve this with existing components?" before choosing backend.

**Cycle comparison:**
- Frontend feature: 20-40 cycles (typically 20-30 minutes each)
- Backend service: 60-90 cycles (typically 10-20 minutes each)
- Integration: 30-60 cycles (typically 15-25 minutes each)
