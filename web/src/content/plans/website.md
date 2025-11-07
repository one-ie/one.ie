---
title: "Website Builder with CMS v1.0.0"
description: "Comprehensive website builder with CMS, multi-language support, SEO tools, and version control"
feature: "website"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Knowledge", "Connections"]
assignedSpecialist: "agent-frontend"
totalCycles: 55
completedCycles: 0
createdAt: 2025-10-30
draft: false
---

# ONE Platform: Website Builder with CMS v1.0.0

**Focus:** Comprehensive website builder with visual editor, CMS, multi-language support, and SEO optimization
**Type:** Complete platform implementation (Astro + React 19 + Tailwind v4 + Convex)
**Integration:** Content management, localization, version control, performance monitoring
**Process:** `Cycle 1-55 optimized sequence`
**Timeline:** 16-20 cycles per specialist per day (3-4 days to MVP, 5-7 days complete)
**Target:** Fully functional website builder with enterprise features

---

## CYCLE BUDGET (55 Total)

**Quick Wins (Cycles 1-10):** Foundation + Backend + MVP Editor (45% effort → 80% value)
- Cycles 1-2: Requirements & ontology mapping
- Cycle 3: Backend schema implementation
- Cycles 4-8: Core editor components
- Cycles 9-10: MVP deployed and working

**Core Features (Cycles 11-30):** Components + CMS + Theme System (35% effort → 15% value)
- Cycles 11-20: Complete component library + media
- Cycles 21-25: Theme customization + responsive
- Cycles 26-30: Version control + publishing workflow

**Advanced Features (Cycles 31-45):** Multi-language + SEO + Analytics (15% effort → 4% value)
- Cycles 31-35: Multi-language support
- Cycles 36-40: SEO tools and optimization
- Cycles 41-45: Analytics and performance monitoring

**Polish + Deploy (Cycles 46-55):** Testing + Optimization + Documentation (5% effort → 1% value)
- Cycles 46-50: Cross-browser testing + accessibility
- Cycles 51-53: Performance optimization + Lighthouse
- Cycles 54-55: Documentation + final deployment

---

## QUICK WINS (Cycles 1-10) - MVP IN 10 CYCLES

**Goal:** Working website builder where you can create and edit a simple page, then deploy it.

**Tangible Progress Milestones:**
- ✅ **Cycle 3:** Backend schema live, can store pages in Convex
- ✅ **Cycle 5:** Can drag a component onto canvas
- ✅ **Cycle 8:** Can edit text inline, see changes live
- ✅ **Cycle 10:** MVP deployed to Cloudflare - create/edit/publish one page end-to-end

**Why this works:** Backend + Frontend in parallel. Schema first, then build on it. Ship early.

---

## PHASE 1: FOUNDATION + BACKEND + MVP EDITOR (Cycle 1-10)

**Purpose:** Define requirements, implement backend schema, build core editor with ONE working page

### Cycle 1: Define Website Builder Structure
- [ ] **Core Features:**
  - [ ] Visual page builder (drag-and-drop)
  - [ ] Content management system (pages, posts, media)
  - [ ] Template library (pre-built layouts)
  - [ ] Component library (reusable blocks)
  - [ ] Theme customization (colors, fonts, spacing)
  - [ ] Responsive preview (mobile, tablet, desktop)
  - [ ] Version control and rollback
  - [ ] Publishing workflow (draft, review, publish)
- [ ] **Content Types:**
  - [ ] Pages (home, about, contact, etc.)
  - [ ] Blog posts (articles, news)
  - [ ] Products (for e-commerce)
  - [ ] Custom content types
- [ ] **Editor Features:**
  - [ ] Drag-and-drop components
  - [ ] Inline text editing
  - [ ] Image upload and management
  - [ ] Style customization panel
  - [ ] Undo/redo
  - [ ] Keyboard shortcuts
  - [ ] Preview mode
  - [ ] Responsive editing
- [ ] **Advanced Features:**
  - [ ] Multi-language and localization
  - [ ] SEO tools and optimization
  - [ ] Performance monitoring
  - [ ] Analytics integration
  - [ ] Custom domains
  - [ ] SSL certificates
  - [ ] CDN integration

### Cycle 2: Map Website Builder to 6-Dimension Ontology
- [ ] **Groups:** Website (organization), site (project)
- [ ] **People:** Owner (admin), editor, contributor, viewer
- [ ] **Things:**
  - [ ] website (domain, settings, theme)
  - [ ] page (slug, content, layout, meta)
  - [ ] component (type, props, styles)
  - [ ] template (layout, preset components)
  - [ ] media (images, videos, files)
  - [ ] theme (colors, fonts, spacing)
  - [ ] version (snapshot, timestamp, author)
- [ ] **Connections:**
  - [ ] website → page (contains)
  - [ ] page → component (includes)
  - [ ] page → template (based_on)
  - [ ] component → media (uses)
  - [ ] page → version (has_history)
  - [ ] user → page (created, edited)
- [ ] **Events:**
  - [ ] page_created, page_updated, page_published
  - [ ] component_added, component_moved, component_deleted
  - [ ] version_saved, version_restored
  - [ ] theme_changed, domain_configured
- [ ] **Knowledge:** SEO keywords, performance metrics, visitor analytics

### Cycle 3: Implement Backend Schema (CRITICAL - BACKEND FIRST)
- [ ] **Create Convex Schema (`backend/convex/schema.ts`):**
  - [ ] **websites table:**
    - [ ] _id, groupId, domain, name, status
    - [ ] properties: { theme, settings, customDomain }
  - [ ] **pages table:**
    - [ ] _id, websiteId, slug, title, status (draft/published)
    - [ ] content: JSON array of components
    - [ ] metadata: { description, keywords, ogImage }
    - [ ] createdAt, updatedAt, publishedAt
  - [ ] **components table:**
    - [ ] _id, pageId, type, position, props, styles
  - [ ] **media table:**
    - [ ] _id, websiteId, url, name, size, type
    - [ ] metadata: { alt, width, height }
  - [ ] **Indexes:**
    - [ ] by_website, by_slug, by_status
- [ ] **Create Basic Mutations:**
  - [ ] `websites.create` - Create new website
  - [ ] `pages.create` - Create new page
  - [ ] `pages.update` - Update page content
  - [ ] `pages.publish` - Change status to published
- [ ] **Create Basic Queries:**
  - [ ] `websites.list` - List all websites
  - [ ] `pages.list` - List pages for website
  - [ ] `pages.get` - Get single page by slug
- [ ] **Deploy to Convex:**
  - [ ] Run `npx convex dev` to generate types
  - [ ] Verify schema with sample data
  - [ ] Test mutations/queries in Convex dashboard

### Cycle 4: Create Basic Editor Layout
- [ ] **Create `/builder/edit/[pageId].astro` page:**
  - [ ] Three-panel layout (component library, canvas, properties)
  - [ ] Load page data from Convex
  - [ ] Render editor with client:load
- [ ] **Create `<PageEditor>` React component:**
  - [ ] Left sidebar placeholder (component library)
  - [ ] Center canvas placeholder (visual editor)
  - [ ] Right sidebar placeholder (properties panel)
  - [ ] Top bar with save/publish buttons
  - [ ] Wire up to Convex mutations
- [ ] **Test:** Can load editor page, see layout

### Cycle 5: Implement Drag-and-Drop
- [ ] **Install @dnd-kit packages:**
  - [ ] `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] **Create `<ComponentLibrary>` sidebar:**
  - [ ] List 3 basic components: Heading, Text, Button
  - [ ] Make each draggable with useDraggable
- [ ] **Create `<VisualCanvas>` area:**
  - [ ] Drop zone with useDroppable
  - [ ] Handle component drops
  - [ ] Add component to page content array
  - [ ] Save to Convex on drop
- [ ] **Test:** Drag Heading from library → drop on canvas → saves to Convex

### Cycle 6: Render Components on Canvas
- [ ] **Create `<ComponentRenderer>` component:**
  - [ ] Switch statement for component types
  - [ ] Heading → render h1-h6 with editable text
  - [ ] Text → render p with editable content
  - [ ] Button → render button with text + link
- [ ] **Map over page.content array:**
  - [ ] Render each component with ComponentRenderer
  - [ ] Show in visual order
  - [ ] Add wrapper divs for selection
- [ ] **Test:** Components dropped on canvas appear visually

### Cycle 7: Add Component Selection + Properties Panel
- [ ] **Component Selection:**
  - [ ] Click component on canvas to select
  - [ ] Show blue outline on selected component
  - [ ] Store selectedComponentId in state
- [ ] **Create `<PropertiesPanel>` sidebar:**
  - [ ] Show selected component type
  - [ ] For Heading: text input + level dropdown (h1-h6)
  - [ ] For Text: textarea for content
  - [ ] For Button: text input + URL input
  - [ ] Update component props on change
  - [ ] Save to Convex on blur
- [ ] **Test:** Click component → edit in properties panel → see changes live

### Cycle 8: Implement Inline Text Editing
- [ ] **Inline editing with contentEditable:**
  - [ ] Make Heading text contentEditable on double-click
  - [ ] Make Text paragraph contentEditable on double-click
  - [ ] Capture onBlur event to save changes
  - [ ] Update component props in state
  - [ ] Call Convex mutation to persist
- [ ] **Keyboard shortcuts:**
  - [ ] Cmd+S / Ctrl+S to save draft
  - [ ] Escape to deselect component
- [ ] **Test:** Double-click text → edit inline → see changes save

### Cycle 9: Create Page List + Publishing Workflow
- [ ] **Create `/builder/[websiteId]/pages.astro` page:**
  - [ ] Query all pages from Convex
  - [ ] Display in table with status badges
  - [ ] "Create New Page" button
  - [ ] Edit/Delete actions per page
- [ ] **Implement publish/unpublish:**
  - [ ] Add "Publish" button to editor top bar
  - [ ] Call `pages.publish` mutation (status = "published")
  - [ ] Show success toast
  - [ ] Add "Unpublish" to revert to draft
- [ ] **Test:** Create page → edit → publish → see status change

### Cycle 10: Deploy MVP + End-to-End Test
- [ ] **Create public page renderer:**
  - [ ] Create `/[websiteId]/[slug].astro` route
  - [ ] Query page from Convex by slug
  - [ ] Filter for status = "published"
  - [ ] Render components with ComponentRenderer
  - [ ] Apply basic styles (Tailwind)
- [ ] **Deploy to Cloudflare Pages:**
  - [ ] Build with `bun run build`
  - [ ] Deploy with `wrangler pages deploy`
  - [ ] Verify published page loads
- [ ] **End-to-End Test (MVP Complete):**
  - [ ] Create website via Convex dashboard
  - [ ] Create new page via pages list
  - [ ] Drag Heading + Text components onto canvas
  - [ ] Edit text inline
  - [ ] Edit text via properties panel
  - [ ] Publish page
  - [ ] Visit public URL → see published page
- [ ] **Success Criteria:**
  - [ ] ✅ Backend schema stores pages in Convex
  - [ ] ✅ Can drag components from library to canvas
  - [ ] ✅ Can edit text inline with double-click
  - [ ] ✅ Can edit text in properties panel
  - [ ] ✅ Can publish page (status change)
  - [ ] ✅ Published page renders at public URL
  - [ ] ✅ MVP deployed to Cloudflare

---

## PHASE 2: COMPLETE COMPONENT LIBRARY + MEDIA (Cycle 11-30)

**Purpose:** Expand component library, add media upload, implement CMS features

### Cycle 11-15: Add More Components
- [ ] **Section Components:**
  - [ ] Hero (headline, subheadline, CTA, background image)
  - [ ] Features (grid of 3-4 feature cards)
  - [ ] Testimonial (quote, author, avatar)
  - [ ] CTA Section (heading, text, button)
  - [ ] Image (with alt text, size controls)
- [ ] **Layout Components:**
  - [ ] Container (max-width wrapper)
  - [ ] Grid (2-4 columns responsive)
  - [ ] Spacer (vertical spacing)
- [ ] **Update ComponentRenderer to handle all types**
- [ ] **Test:** Can drag all component types onto canvas

### Cycle 16-18: Implement Media Library
- [ ] **Media Upload:**
  - [ ] Create `/builder/[websiteId]/media.astro` page
  - [ ] File upload component (drag-and-drop)
  - [ ] Use Convex file storage API
  - [ ] Save file URLs to media table
- [ ] **Media Selector:**
  - [ ] Add "Choose Image" button to Image component props
  - [ ] Modal to select from media library
  - [ ] Update component props with selected image URL
- [ ] **Test:** Upload image → select in Image component → renders on canvas

### Cycle 19-22: Add Component Reordering + Deletion
- [ ] **Reorder Components:**
  - [ ] Use @dnd-kit/sortable for reordering
  - [ ] Drag component up/down to change position
  - [ ] Update position in Convex
- [ ] **Delete Components:**
  - [ ] Add delete icon on component hover
  - [ ] Confirm deletion modal
  - [ ] Remove from page content array
  - [ ] Save to Convex
- [ ] **Test:** Reorder components, delete components

### Cycle 23-25: Add Responsive Design Controls
- [ ] **Device Preview:**
  - [ ] Add mobile/tablet/desktop buttons to top bar
  - [ ] Change canvas width on click
  - [ ] Show viewport dimensions
- [ ] **Responsive Settings per Component:**
  - [ ] Hide on mobile checkbox
  - [ ] Hide on tablet checkbox
  - [ ] Different spacing per breakpoint
- [ ] **Test:** Toggle device preview, hide components on mobile

### Cycle 26-30: Implement Version Control
- [ ] **Auto-save Versions:**
  - [ ] Save snapshot every 5 minutes
  - [ ] Create versions table in Convex
  - [ ] Store full page content JSON
- [ ] **Version History UI:**
  - [ ] List versions in sidebar (timestamp, author)
  - [ ] Preview version on hover
  - [ ] Restore version button
- [ ] **Test:** Edit page → auto-save → restore previous version

---

## PHASE 3: THEME SYSTEM + ADVANCED FEATURES (Cycle 31-45)

**Purpose:** Theme customization, multi-language, SEO, analytics

### Cycle 31-35: Implement Multi-Language Support
- [ ] **Add translations table to Convex schema**
- [ ] **Language switcher in editor:**
  - [ ] Add language dropdown to top bar
  - [ ] Store default language per website
  - [ ] Store translations per component + language
- [ ] **Translation UI:**
  - [ ] Duplicate page content for new language
  - [ ] Edit component text per language
  - [ ] Show translation status (translated/missing)
- [ ] **Public page rendering:**
  - [ ] Detect language from URL (/en/about, /es/about)
  - [ ] Render translated content
- [ ] **Test:** Create English page → translate to Spanish → render both

### Cycle 36-40: Implement SEO Tools
- [ ] **Add SEO fields to pages table:**
  - [ ] metaTitle, metaDescription, keywords
  - [ ] ogImage, ogTitle, ogDescription
- [ ] **SEO Panel in editor:**
  - [ ] Meta title/description inputs
  - [ ] Preview snippet (Google result)
  - [ ] Character count warnings
  - [ ] Open Graph image uploader
- [ ] **Public page rendering:**
  - [ ] Add meta tags to page <head>
  - [ ] Add Open Graph tags
  - [ ] Add Twitter Card tags
  - [ ] Generate sitemap.xml
- [ ] **Test:** Add SEO metadata → view source → verify tags

### Cycle 41-45: Add Analytics + Performance Monitoring
- [ ] **Analytics Integration:**
  - [ ] Add Plausible script tag option
  - [ ] Add Google Analytics option
  - [ ] Store analytics ID in website settings
  - [ ] Inject script on published pages
- [ ] **Performance Metrics:**
  - [ ] Add Lighthouse CI to build process
  - [ ] Track Core Web Vitals
  - [ ] Image optimization checks
  - [ ] Show performance score in editor
- [ ] **Test:** Publish page → run Lighthouse → see score

---

## PHASE 4: POLISH + TESTING + DEPLOYMENT (Cycle 46-55)

**Purpose:** Cross-browser testing, accessibility, performance, documentation

### Cycle 46-48: Accessibility + Keyboard Navigation
- [ ] **Keyboard shortcuts:**
  - [ ] Tab to navigate components
  - [ ] Delete key to remove selected component
  - [ ] Cmd+Z / Ctrl+Z to undo
  - [ ] Cmd+Shift+Z / Ctrl+Shift+Z to redo
- [ ] **ARIA labels:**
  - [ ] Add aria-labels to all interactive elements
  - [ ] Add focus indicators
  - [ ] Screen reader testing
- [ ] **Test:** Navigate editor with keyboard only, run axe DevTools

### Cycle 49-50: Cross-Browser Testing
- [ ] **Test in browsers:**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
- [ ] **Fix browser-specific issues:**
  - [ ] CSS compatibility
  - [ ] contentEditable behavior
  - [ ] Drag-and-drop quirks
- [ ] **Test:** All features work in all browsers

### Cycle 51-53: Performance Optimization
- [ ] **Frontend optimizations:**
  - [ ] Code splitting for editor components
  - [ ] Lazy load component library
  - [ ] Debounce auto-save mutations
  - [ ] Optimize images (automatic compression)
- [ ] **Backend optimizations:**
  - [ ] Add indexes to Convex queries
  - [ ] Batch component updates
  - [ ] Cache published pages
- [ ] **Lighthouse Audit:**
  - [ ] Target score > 90 on all metrics
  - [ ] Fix performance issues
- [ ] **Test:** Run Lighthouse, achieve >90 score

### Cycle 54-55: Documentation + Final Deployment
- [ ] **User Documentation:**
  - [ ] How to create a website
  - [ ] How to add components
  - [ ] How to customize theme
  - [ ] How to publish pages
  - [ ] How to add languages
  - [ ] How to configure SEO
- [ ] **Developer Documentation:**
  - [ ] How to add new component types
  - [ ] How to extend theme system
  - [ ] API reference for Convex functions
- [ ] **Final Deployment:**
  - [ ] Deploy to production Cloudflare Pages
  - [ ] Configure custom domain
  - [ ] Set up SSL certificate
  - [ ] Test end-to-end in production
- [ ] **Test:** Complete user journey in production

---

## SUCCESS CRITERIA

**MVP (Cycle 10) - Can ship a basic website:**
- ✅ Backend schema stores pages in Convex
- ✅ Visual editor loads with three-panel layout
- ✅ Can drag 3 component types (Heading, Text, Button) from library to canvas
- ✅ Can edit text inline with double-click
- ✅ Can edit component props in properties panel
- ✅ Can publish page (status change to "published")
- ✅ Published page renders at public URL with components
- ✅ MVP deployed to Cloudflare Pages

**Complete (Cycle 55) - Production-ready website builder:**
- ✅ 15+ component types (sections, layouts, content, navigation)
- ✅ Media library with upload + selection
- ✅ Component reordering via drag-and-drop
- ✅ Responsive design controls (mobile/tablet/desktop preview)
- ✅ Version control with auto-save + restore
- ✅ Multi-language support with translations
- ✅ SEO metadata (title, description, Open Graph, sitemap)
- ✅ Analytics integration (Plausible or Google Analytics)
- ✅ Keyboard shortcuts + accessibility (WCAG 2.1 AA)
- ✅ Cross-browser tested (Chrome, Firefox, Safari, Edge)
- ✅ Lighthouse score > 90 on all metrics
- ✅ Documentation (user + developer)
- ✅ Deployed to production with custom domain + SSL

---

## OPTIMIZED TIMELINE

**Total:** 55 cycles (down from 100)
**Savings:** 45% reduction through aggressive prioritization

**Why this is faster:**
1. **Backend first (Cycle 3):** Build on solid foundation, not mocks
2. **MVP in 10 cycles:** Ship early, iterate based on real usage
3. **Parallel work:** Backend + Frontend can run simultaneously after Cycle 3
4. **Cut ceremony:** No separate "design" cycles, design while building
5. **Quick wins first:** 80% value in first 40% of cycles

**Specialist assignment:**
- **Backend (agent-backend):** Cycles 3, 16-18 (schema, media storage)
- **Frontend (agent-frontend):** Cycles 4-15, 19-55 (editor, components, UI)
- **Parallel execution:** After Cycle 3, both can work simultaneously

**Status:** Ready to build
**Next:** Start Cycle 1 - Define website builder requirements
