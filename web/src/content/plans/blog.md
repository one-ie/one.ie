---
title: "Blog Publishing Platform v1.0.0"
description: "Article publishing with categories, tags, search, and RSS feed generation"
feature: "blog"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Connections", "Knowledge"]
assignedSpecialist: "agent-frontend"
totalCycles: 30
completedCycles: 0
createdAt: 2025-10-30
draft: false
---

# ONE Platform: Blog Publishing Platform v1.0.0

**Focus:** Article publishing with markdown support, categories, tags, and full-text search
**Type:** Frontend-only implementation (Astro + Content Collections + shadcn/ui)
**Integration:** Content collections, RSS feed, SEO optimization
**Process:** `Cycle 1-30 optimized sequence`
**Timeline:** 15-20 cycles per specialist per day
**Target:** Working blog MVP by Cycle 10, full platform by Cycle 30

---

## Quick Wins (Cycles 1-10): Working Blog MVP

**Goal:** Ship a working blog with published articles by Cycle 10

**Milestone Targets:**
- **Cycle 3:** Basic blog structure with first article rendering
- **Cycle 8:** First post published with search working
- **Cycle 10:** MVP deployed to production (RSS, SEO, mobile-ready)

---

## Cycle Budget

**Total: 30 cycles** (optimized for speed)

**Foundation (1-10):** Working MVP with core features
**Enhancement (11-20):** Advanced features (TOC, related posts, authors)
**Polish (21-30):** Performance, SEO, accessibility, dark mode

**Key optimization:** Frontend-only (no backend) using Astro content collections

---

## PHASE 1: MVP FOUNDATION (Cycle 1-10)

**Purpose:** Ship working blog with published articles

### Cycle 1: Schema + Sample Content
- [ ] **Define blog schema** (`src/content/config.ts`):
  - [ ] slug, title, description
  - [ ] heroImage, publishDate
  - [ ] author (string), category, tags (array)
  - [ ] draft (boolean)
- [ ] **Create 3 sample articles** with realistic content
- [ ] **Run `bunx astro sync`** to generate types

### Cycle 2: Article Page (Dynamic Route)
- [ ] **Create `/blog/[...slug].astro`:**
  - [ ] Dynamic routing with `getStaticPaths()`
  - [ ] Article header (title, author, date)
  - [ ] Hero image (optimized)
  - [ ] Rendered markdown with syntax highlighting (Shiki)
  - [ ] Basic SEO meta tags
- [ ] **Test:** First article renders at `/blog/first-post`

### Cycle 3: Blog Index Page
- [ ] **Create `/blog/index.astro`:**
  - [ ] Fetch all published articles (sorted by date)
  - [ ] Display articles grid using shadcn Card
  - [ ] Show: title, excerpt, date, category badge
  - [ ] Basic layout with header/footer
- [ ] **Milestone:** Basic blog structure working

### Cycle 4: Category Filtering
- [ ] **Create `/blog/category/[category].astro`:**
  - [ ] Filter articles by category
  - [ ] Display category name and count
  - [ ] Breadcrumb navigation
- [ ] **Add category badges** to blog index (clickable)

### Cycle 5: Tag Filtering
- [ ] **Create `/blog/tag/[tag].astro`:**
  - [ ] Filter articles by tag
  - [ ] Display tag name and article count
- [ ] **Add tag badges** to article pages (clickable)

### Cycle 6: Reading Time + Utility Functions
- [ ] **Create `lib/blog.ts` utilities:**
  - [ ] `calculateReadingTime()` - Count words, estimate time
  - [ ] `formatDate()` - Format publish dates
  - [ ] `getExcerpt()` - Extract first 160 chars
- [ ] **Add reading time** to article cards and pages

### Cycle 7: Client-Side Search
- [ ] **Install Pagefind** (static search)
- [ ] **Create search page** (`/blog/search.astro`)
- [ ] **Add search bar** (client:load island)
- [ ] **Test:** Search finds articles by title/content

### Cycle 8: RSS Feed Generation
- [ ] **Create `/rss.xml.ts`** endpoint
- [ ] **Use `@astrojs/rss`** package
- [ ] **Include all published articles** with full content
- [ ] **Add RSS link** to blog layout
- [ ] **Milestone:** First post searchable + RSS working

### Cycle 9: SEO Optimization
- [ ] **Add structured data** (Article schema JSON-LD)
- [ ] **Open Graph tags** for social sharing
- [ ] **Twitter Card tags**
- [ ] **Sitemap generation** (built-in Astro)
- [ ] **Canonical URLs**

### Cycle 10: Mobile Optimization + Deploy
- [ ] **Make fully responsive:**
  - [ ] Mobile-first grid layout
  - [ ] Touch-friendly buttons
  - [ ] Optimized images (responsive sizes)
- [ ] **Test Lighthouse score** (target > 90)
- [ ] **Deploy to production**
- [ ] **Milestone:** MVP deployed and live

---

## PHASE 2: ENHANCEMENT (Cycle 11-20)

**Purpose:** Add advanced features that improve UX

### Cycle 11: Table of Contents
- [ ] **Create TOC component:**
  - [ ] Parse article headings (h2, h3)
  - [ ] Generate nested anchor links
  - [ ] Sticky sidebar on desktop
  - [ ] Highlight active section (client:visible)

### Cycle 12: Related Articles
- [ ] **Create recommendation algorithm:**
  - [ ] Match by shared tags (weighted scoring)
  - [ ] Match by category
  - [ ] Exclude current article
  - [ ] Return top 3-4 matches
- [ ] **Display at bottom** of article pages

### Cycle 13: Author System
- [ ] **Create authors collection** (`src/content/authors/`)
- [ ] **Define author schema:**
  - [ ] name, slug, bio, avatar
  - [ ] social links (twitter, github, linkedin)
- [ ] **Create author pages** (`/blog/author/[author].astro`)

### Cycle 14: Enhanced Article Cards
- [ ] **Use shadcn Card component:**
  - [ ] Hover effects (scale, shadow)
  - [ ] Featured badge for featured posts
  - [ ] Better typography hierarchy
  - [ ] Optimized thumbnail images

### Cycle 15: Pagination
- [ ] **Add pagination to blog index:**
  - [ ] Show 12 articles per page
  - [ ] Previous/Next buttons
  - [ ] Page numbers
- [ ] **Add to category/tag pages**

### Cycle 16: Newsletter Signup
- [ ] **Create signup component:**
  - [ ] Email input with validation
  - [ ] Success/error states
  - [ ] Connect to email service (Resend, ConvertKit)
- [ ] **Add to blog layout sidebar**

### Cycle 17: Social Sharing
- [ ] **Create ShareButtons component:**
  - [ ] Twitter, LinkedIn, Facebook, Copy link
  - [ ] Native share API for mobile
  - [ ] Share counts (optional)
- [ ] **Add to article pages**

### Cycle 18: Code Syntax Highlighting
- [ ] **Configure Shiki:**
  - [ ] Multiple theme support (light/dark)
  - [ ] Line numbers
  - [ ] Line highlighting
  - [ ] Copy button for code blocks

### Cycle 19: Image Optimization
- [ ] **Use Astro Image:**
  - [ ] Responsive image sizes
  - [ ] WebP format with fallback
  - [ ] Lazy loading
  - [ ] Blur placeholder

### Cycle 20: Blog Sidebar
- [ ] **Create BlogSidebar component:**
  - [ ] Categories list with counts
  - [ ] Popular tags cloud
  - [ ] Recent articles (5)
  - [ ] Newsletter signup
  - [ ] Sticky on desktop

---

## PHASE 3: POLISH (Cycle 21-30)

**Purpose:** Performance, accessibility, and production readiness

### Cycle 21: Dark Mode
- [ ] **Implement theme toggle:**
  - [ ] Tailwind v4 dark variant
  - [ ] Theme persistence (localStorage)
  - [ ] System preference detection
- [ ] **Style all components** for dark mode

### Cycle 22: Accessibility Audit
- [ ] **WCAG 2.1 AA compliance:**
  - [ ] Keyboard navigation
  - [ ] Focus indicators
  - [ ] ARIA labels
  - [ ] Color contrast (4.5:1 minimum)
  - [ ] Screen reader testing

### Cycle 23: Performance Optimization
- [ ] **Lighthouse audit (target 95+):**
  - [ ] Minimize CSS/JS bundles
  - [ ] Preload critical fonts
  - [ ] Optimize image loading
  - [ ] Remove unused code

### Cycle 24: Advanced SEO
- [ ] **Schema.org markup:**
  - [ ] Article structured data
  - [ ] Breadcrumb markup
  - [ ] Author markup
- [ ] **XML sitemap** with priorities
- [ ] **Robots.txt** configuration

### Cycle 25: Error States
- [ ] **Create error pages:**
  - [ ] 404 with search/suggestions
  - [ ] Empty states (no articles, no results)
  - [ ] Loading skeletons
- [ ] **Add fallback images**

### Cycle 26: Blog Analytics
- [ ] **Add Plausible Analytics:**
  - [ ] Page views tracking
  - [ ] Event tracking (clicks, shares)
  - [ ] Privacy-friendly
  - [ ] No cookie banner needed

### Cycle 27: Content Enhancements
- [ ] **Add 10+ more articles** (total 15-20)
- [ ] **Mix of categories** and lengths
- [ ] **Real code examples**
- [ ] **Quality images** and diagrams

### Cycle 28: Cross-Browser Testing
- [ ] **Test on:**
  - [ ] Chrome, Firefox, Safari
  - [ ] Mobile Safari, Chrome Mobile
  - [ ] Edge
- [ ] **Fix browser-specific issues**

### Cycle 29: Final QA Pass
- [ ] **Test all features:**
  - [ ] Navigation flows
  - [ ] Search functionality
  - [ ] Filter combinations
  - [ ] Mobile responsiveness
  - [ ] Form submissions
- [ ] **Fix bugs and polish**

### Cycle 30: Production Deploy + Documentation
- [ ] **Deploy to Cloudflare Pages**
- [ ] **Add monitoring** (uptime, performance)
- [ ] **Document features** in `/one/knowledge/`
- [ ] **Create usage guide** for adding content
- [ ] **Milestone:** Production-ready blog platform

---

## SUCCESS CRITERIA

**Blog platform is complete when:**

**MVP (Cycle 10):**
- ✅ Blog index displays published articles
- ✅ Article pages render markdown with syntax highlighting
- ✅ Category and tag filtering works
- ✅ Client-side search functional
- ✅ RSS feed generates valid XML
- ✅ SEO meta tags properly set
- ✅ Mobile responsive (Lighthouse > 90)

**Full Platform (Cycle 30):**
- ✅ Table of contents with active highlighting
- ✅ Related articles based on tags/category
- ✅ Author pages with bio and articles
- ✅ Dark mode with theme persistence
- ✅ Social sharing buttons
- ✅ Newsletter signup integration
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Performance optimized (Lighthouse 95+)
- ✅ Production deployed with monitoring

---

## Implementation Summary

**Optimization Results:**
- **Cycles reduced:** 100 → 30 (70% reduction)
- **Time to MVP:** 10 cycles (1-2 days)
- **Time to production:** 30 cycles (3-4 days)
- **Approach:** Frontend-only (Astro + Content Collections)
- **Backend:** Not needed (static content)

**Key Optimizations:**
1. ✅ Immediate value delivery (working blog by Cycle 3)
2. ✅ Frontend-only approach (no backend complexity)
3. ✅ Progressive enhancement (MVP → Full → Polish)
4. ✅ Clear milestones every 3-5 cycles
5. ✅ Aggressive timeline with quality maintained

**Timeline:** 30 cycles total (3-4 days at 8-10 cycles/day)
**Status:** Optimized and ready to build
**Next:** Execute Cycle 1 - Schema + Sample Content
