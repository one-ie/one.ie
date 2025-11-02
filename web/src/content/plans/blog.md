---
title: "Blog Publishing Platform v1.0.0"
description: "Article publishing with categories, tags, search, and RSS feed generation"
feature: "blog"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Connections", "Knowledge"]
assignedSpecialist: "agent-frontend"
totalInferences: 100
completedInferences: 0
createdAt: 2025-10-30
draft: false
---

# ONE Platform: Blog Publishing Platform v1.0.0

**Focus:** Article publishing with markdown support, categories, tags, and full-text search
**Type:** Complete frontend implementation (Astro + React 19 + Tailwind v4)
**Integration:** Content collections, RSS feed, SEO optimization
**Process:** `Infer 1-100 inference sequence`
**Timeline:** 8-12 inferences per specialist per day
**Target:** Fully functional blog platform with content discovery features

---

## PHASE 1: FOUNDATION & DESIGN (Infer 1-10)

**Purpose:** Define blog structure, content model, user flows, design system

### Infer 1: Define Blog Structure
- [ ] **Content Organization:**
  - [ ] Article listing page with filters
  - [ ] Individual article pages with markdown rendering
  - [ ] Category browsing pages
  - [ ] Tag browsing pages
  - [ ] Author profile pages
  - [ ] Search functionality
- [ ] **Article Features:**
  - [ ] Markdown support with syntax highlighting
  - [ ] Reading time estimates
  - [ ] Table of contents
  - [ ] Social sharing buttons
  - [ ] Related articles suggestions
  - [ ] Comments (optional)
- [ ] **Discovery:**
  - [ ] Full-text search across articles
  - [ ] Filter by category
  - [ ] Filter by tag
  - [ ] Filter by author
  - [ ] Sort by date, popularity
- [ ] **RSS & Syndication:**
  - [ ] RSS feed generation
  - [ ] Sitemap generation
  - [ ] Social media meta tags

### Infer 2: Map Blog to 6-Dimension Ontology
- [ ] **Groups:** Blog's publication group (e.g., "Tech Blog")
- [ ] **People:** Author (writer), editor, reader
- [ ] **Things:**
  - [ ] article (title, content, slug, publish date, status)
  - [ ] category (name, description, slug)
  - [ ] tag (name, slug)
  - [ ] author (name, bio, avatar, social links)
- [ ] **Connections:**
  - [ ] article → author (written_by)
  - [ ] article → category (belongs_to)
  - [ ] article → tag (tagged_with)
  - [ ] article → article (related_to)
  - [ ] reader → article (viewed, liked)
- [ ] **Events:**
  - [ ] article_published, article_viewed, article_shared
  - [ ] article_searched, category_browsed, tag_clicked
- [ ] **Knowledge:** Search index, article embeddings, popular topics

### Infer 3: Design Article Data Model
- [ ] **Article Schema:**
  - [ ] ID, slug, title, description
  - [ ] Content (markdown)
  - [ ] Hero image, thumbnail
  - [ ] Author reference
  - [ ] Category, tags (array)
  - [ ] Published date, updated date
  - [ ] Reading time (calculated)
  - [ ] Status (draft, published, archived)
  - [ ] Featured flag
  - [ ] SEO metadata (title, description, keywords)
- [ ] **Article Page Shows:**
  - [ ] Hero image
  - [ ] Title, description
  - [ ] Author info with avatar
  - [ ] Published date, reading time
  - [ ] Category badge
  - [ ] Tag badges
  - [ ] Table of contents (for long articles)
  - [ ] Rendered markdown with syntax highlighting
  - [ ] Social sharing buttons
  - [ ] Related articles
  - [ ] Newsletter signup

### Infer 4: Design Blog Listing Experience
- [ ] **Blog Index Page Shows:**
  - [ ] Featured article (hero)
  - [ ] Recent articles grid (card layout)
  - [ ] Article cards display:
    - [ ] Thumbnail image
    - [ ] Title, excerpt
    - [ ] Author name, avatar
    - [ ] Published date
    - [ ] Reading time
    - [ ] Category badge
    - [ ] Tags (first 2-3)
  - [ ] Sidebar (desktop):
    - [ ] Search bar
    - [ ] Categories list with counts
    - [ ] Popular tags cloud
    - [ ] Newsletter signup
    - [ ] Recent articles
  - [ ] Pagination or infinite scroll
  - [ ] Load more button

### Infer 5: Design Category & Tag Pages
- [ ] **Category Page:**
  - [ ] Category name and description
  - [ ] Article count
  - [ ] Filtered articles list
  - [ ] Breadcrumb navigation
  - [ ] Related categories
- [ ] **Tag Page:**
  - [ ] Tag name
  - [ ] Article count
  - [ ] Articles with this tag
  - [ ] Related tags
- [ ] **Author Page:**
  - [ ] Author name, bio, avatar
  - [ ] Social links
  - [ ] Articles by author
  - [ ] Article count

### Infer 6: Design Search & Filtering
- [ ] **Search Bar:**
  - [ ] Search input with icon
  - [ ] Real-time suggestions
  - [ ] Search results page
  - [ ] Highlight matching terms
- [ ] **Filters:**
  - [ ] Filter by category (dropdown or sidebar)
  - [ ] Filter by tag (multi-select)
  - [ ] Filter by author
  - [ ] Filter by date range
  - [ ] Sort by (newest, oldest, popular)
- [ ] **Search Results:**
  - [ ] Article cards with matched excerpt
  - [ ] Result count
  - [ ] Clear filters button
  - [ ] No results state

### Infer 7: Design Responsive Layout
- [ ] **Mobile-first (< 768px):**
  - [ ] Single column layout
  - [ ] Hamburger menu
  - [ ] Hidden sidebar (toggle)
  - [ ] Swipeable image galleries
  - [ ] Touch-friendly buttons
- [ ] **Tablet (768px-1023px):**
  - [ ] Two-column article grid
  - [ ] Collapsible sidebar
- [ ] **Desktop (1024px+):**
  - [ ] Three-column layout (sidebar, main, aside)
  - [ ] Fixed sidebar on scroll
  - [ ] Wider content area for articles

### Infer 8: Design Visual System
- [ ] **Color Palette:**
  - [ ] Primary: Brand color for links, CTAs
  - [ ] Secondary: Category colors
  - [ ] Neutral: Grays for text, borders
  - [ ] Success: Green for notifications
  - [ ] Dark mode support
- [ ] **Typography:**
  - [ ] Article heading: 36-48px
  - [ ] Section heading: 24-32px
  - [ ] Body text: 18px (readable)
  - [ ] Sidebar text: 16px
  - [ ] Font weights: Regular (400), medium (500), bold (700)
- [ ] **Components:**
  - [ ] Article card (with hover effects)
  - [ ] Category badge
  - [ ] Tag badge
  - [ ] Author card
  - [ ] Newsletter form
  - [ ] Search bar with autocomplete
  - [ ] Table of contents (sticky)

### Infer 9: Plan Content Strategy
- [ ] **Article Types:**
  - [ ] Tutorial/guide (step-by-step)
  - [ ] Opinion/analysis
  - [ ] News/announcement
  - [ ] Case study
  - [ ] List/roundup
- [ ] **SEO Optimization:**
  - [ ] Meta titles and descriptions
  - [ ] Open Graph tags (social sharing)
  - [ ] Twitter Card tags
  - [ ] Canonical URLs
  - [ ] Structured data (Article schema)
  - [ ] Sitemap XML
  - [ ] RSS feed
- [ ] **Performance:**
  - [ ] Image optimization (webp, responsive)
  - [ ] Lazy loading images
  - [ ] Code splitting
  - [ ] Markdown rendering optimization

### Infer 10: Define Success Metrics
- [ ] Blog complete when:
  - [ ] Article listing page displays beautifully
  - [ ] Individual articles render markdown correctly
  - [ ] Syntax highlighting works for code blocks
  - [ ] Search finds articles by title, content, tags
  - [ ] Category and tag filtering works
  - [ ] Author pages display correctly
  - [ ] RSS feed generates valid XML
  - [ ] Reading time calculates accurately
  - [ ] Table of contents works for long articles
  - [ ] Social sharing buttons functional
  - [ ] Related articles display
  - [ ] Mobile responsive on all screen sizes
  - [ ] Lighthouse score > 90
  - [ ] SEO meta tags properly set

---

## PHASE 2: CONTENT COLLECTIONS & DATA (Infer 11-20)

**Purpose:** Set up Astro content collections, schemas, and sample content

### Infer 11: Create Blog Content Collection
- [ ] **Define schema** (`src/content/config.ts`):
  - [ ] slug, title, description
  - [ ] heroImage, thumbnail
  - [ ] publishDate, updatedDate
  - [ ] author (reference)
  - [ ] category (string)
  - [ ] tags (array)
  - [ ] featured (boolean)
  - [ ] draft (boolean)
  - [ ] seo (object)

### Infer 12: Create Sample Articles
- [ ] **Create 10-15 sample articles:**
  - [ ] Various categories
  - [ ] Different authors
  - [ ] Mix of lengths
  - [ ] Code examples
  - [ ] Images and diagrams
  - [ ] Realistic content

### Infer 13: Create Authors Collection
- [ ] **Define author schema:**
  - [ ] name, slug, bio
  - [ ] avatar, email
  - [ ] social links (twitter, linkedin, github)
  - [ ] website
- [ ] **Create 3-5 sample authors**

### Infer 14: Create Categories Data
- [ ] **Define categories:**
  - [ ] Technology, Design, Business, Marketing, etc.
  - [ ] Name, slug, description, color
  - [ ] Icon (optional)
- [ ] **Store in data file** (`src/data/categories.ts`)

### Infer 15: Implement Markdown Processing
- [ ] **Configure markdown:**
  - [ ] Syntax highlighting (Shiki or Prism)
  - [ ] Custom components in MDX
  - [ ] Image optimization
  - [ ] Heading IDs for table of contents
  - [ ] External link handling

### Infer 16: Calculate Reading Time
- [ ] **Create utility function:**
  - [ ] Count words in markdown
  - [ ] Calculate average reading time (200-250 words/min)
  - [ ] Return formatted time ("5 min read")

### Infer 17: Generate Table of Contents
- [ ] **Create TOC utility:**
  - [ ] Parse markdown headings (h2, h3)
  - [ ] Generate nested list with anchor links
  - [ ] Highlight active section on scroll

### Infer 18: Implement Search Index
- [ ] **Create search data:**
  - [ ] Build JSON index of all articles
  - [ ] Include title, description, content, tags
  - [ ] Optimize for client-side search
  - [ ] Consider Fuse.js or Pagefind

### Infer 19: Create RSS Feed
- [ ] **Generate RSS XML:**
  - [ ] Use `@astrojs/rss`
  - [ ] Include all published articles
  - [ ] Full content or excerpt
  - [ ] Proper XML formatting
  - [ ] Served at `/rss.xml`

### Infer 20: Implement Related Articles
- [ ] **Algorithm:**
  - [ ] Match by shared tags (weighted)
  - [ ] Match by category
  - [ ] Exclude current article
  - [ ] Return 3-4 most relevant
  - [ ] Cache for performance

---

## PHASE 3: ASTRO PAGES & LAYOUTS (Infer 21-40)

**Purpose:** Build page templates and layouts

### Infer 21: Create Blog Layout
- [ ] **BlogLayout.astro:**
  - [ ] Header with logo, navigation, search
  - [ ] Main content area
  - [ ] Sidebar (categories, tags, newsletter)
  - [ ] Footer with links, copyright
  - [ ] Dark mode toggle

### Infer 22: Create Blog Index Page
- [ ] **`/blog/index.astro`:**
  - [ ] Featured article hero
  - [ ] Recent articles grid
  - [ ] Sidebar with filters
  - [ ] Pagination
  - [ ] SEO meta tags

### Infer 23: Create Article Page
- [ ] **`/blog/[...slug].astro`:**
  - [ ] Dynamic routing
  - [ ] Article header (title, author, date)
  - [ ] Hero image
  - [ ] Table of contents
  - [ ] Rendered markdown content
  - [ ] Author bio
  - [ ] Related articles
  - [ ] Social sharing
  - [ ] SEO optimization

### Infer 24: Create Category Page
- [ ] **`/blog/category/[category].astro`:**
  - [ ] Category header
  - [ ] Filtered articles
  - [ ] Breadcrumbs
  - [ ] Pagination

### Infer 25: Create Tag Page
- [ ] **`/blog/tag/[tag].astro`:**
  - [ ] Tag header
  - [ ] Filtered articles
  - [ ] Related tags
  - [ ] Pagination

### Infer 26: Create Author Page
- [ ] **`/blog/author/[author].astro`:**
  - [ ] Author profile
  - [ ] Social links
  - [ ] Articles by author
  - [ ] Pagination

### Infer 27: Create Search Results Page
- [ ] **`/blog/search.astro`:**
  - [ ] Search query display
  - [ ] Results list
  - [ ] No results state
  - [ ] Suggested articles

### Infer 28-40: Continue with React components, styling, and polish

---

## SUCCESS CRITERIA

Blog platform is complete when:

- ✅ Blog listing displays all published articles
- ✅ Article pages render markdown with syntax highlighting
- ✅ Categories and tags filter articles correctly
- ✅ Search finds articles across title, content, and tags
- ✅ Author pages display with bio and articles
- ✅ Reading time calculates accurately
- ✅ Table of contents works and highlights active section
- ✅ Related articles display based on tags/category
- ✅ RSS feed generates valid XML
- ✅ Social sharing buttons work
- ✅ SEO meta tags properly set
- ✅ Mobile responsive on all devices
- ✅ Dark mode works
- ✅ Lighthouse score > 90
- ✅ Accessible (WCAG 2.1 AA compliant)

---

**Timeline:** 60-70 inferences for complete implementation
**Status:** Ready to build
**Next:** Use Claude Code to implement step by step following inference sequence
