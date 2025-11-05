---
title: "Website Builder with CMS v1.0.0"
description: "Comprehensive website builder with CMS, multi-language support, SEO tools, and version control"
feature: "website"
organization: "ONE Platform"
personRole: "platform_owner"
ontologyDimensions: ["Things", "Knowledge", "Connections"]
assignedSpecialist: "agent-frontend"
totalCycles: 100
completedCycles: 0
createdAt: 2025-10-30
draft: false
---

# ONE Platform: Website Builder with CMS v1.0.0

**Focus:** Comprehensive website builder with visual editor, CMS, multi-language support, and SEO optimization
**Type:** Complete platform implementation (Astro + React 19 + Tailwind v4)
**Integration:** Content management, localization, version control, performance monitoring
**Process:** `Cycle 1-100 cycle sequence`
**Timeline:** 16-20 cycles per specialist per day
**Target:** Fully functional website builder with enterprise features

---

## PHASE 1: FOUNDATION & ARCHITECTURE (Cycle 1-10)

**Purpose:** Define website builder requirements, editor capabilities, CMS structure, design system

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

### Cycle 3: Design Page Builder Editor
- [ ] **Editor Layout:**
  - [ ] **Left Sidebar: Component Library**
    - [ ] Sections (hero, features, testimonials, CTA)
    - [ ] Layout components (container, grid, columns)
    - [ ] Content components (text, image, video, button)
    - [ ] Forms (input, textarea, checkbox, select)
    - [ ] Navigation (header, footer, menu)
    - [ ] Advanced (code, embed, custom)
    - [ ] Search components
    - [ ] Drag component to canvas
  - [ ] **Center Canvas: Visual Editor**
    - [ ] Live preview of page
    - [ ] Drop zones for components
    - [ ] Hover highlights
    - [ ] Click to select component
    - [ ] Inline text editing
    - [ ] Resize handles
    - [ ] Context menu (duplicate, delete, move)
  - [ ] **Right Sidebar: Properties Panel**
    - [ ] Component settings (content, props)
    - [ ] Style settings (colors, spacing, typography)
    - [ ] Layout settings (width, alignment, position)
    - [ ] Animation settings (entrance, scroll effects)
    - [ ] SEO settings (title, description, keywords)
  - [ ] **Top Bar: Editor Controls**
    - [ ] Page title input
    - [ ] Undo/redo buttons
    - [ ] Device preview (mobile, tablet, desktop)
    - [ ] Zoom controls
    - [ ] Save draft button
    - [ ] Publish button
    - [ ] Exit editor button

### Cycle 4: Design Component System
- [ ] **Layout Components:**
  - [ ] Container (max-width wrapper)
  - [ ] Grid (2-6 columns)
  - [ ] Columns (flexible columns)
  - [ ] Section (full-width sections)
  - [ ] Spacer (vertical spacing)
- [ ] **Content Components:**
  - [ ] Heading (h1-h6)
  - [ ] Text/paragraph
  - [ ] Image (with optimization)
  - [ ] Video (YouTube, Vimeo, self-hosted)
  - [ ] Button (primary, secondary, outline)
  - [ ] Link
  - [ ] Icon
  - [ ] Divider/separator
- [ ] **Section Components:**
  - [ ] Hero (headline, subheadline, CTA, background)
  - [ ] Features (grid of feature cards)
  - [ ] Testimonials (carousel or grid)
  - [ ] Pricing (pricing table)
  - [ ] FAQ (accordion)
  - [ ] Contact form
  - [ ] Newsletter signup
  - [ ] Gallery (image grid)
  - [ ] Stats (metric display)
- [ ] **Navigation Components:**
  - [ ] Header (logo, menu, CTA)
  - [ ] Footer (links, social, copyright)
  - [ ] Breadcrumbs
  - [ ] Sidebar menu
- [ ] **Each Component Has:**
  - [ ] Configurable props (text, images, links)
  - [ ] Style settings (colors, spacing, borders)
  - [ ] Responsive settings (hide on mobile, etc.)
  - [ ] Animation settings

### Cycle 5: Design CMS Structure
- [ ] **Content Management:**
  - [ ] **Pages Tab:**
    - [ ] List of all pages
    - [ ] Status (draft, published, scheduled)
    - [ ] Create new page button
    - [ ] Duplicate page
    - [ ] Delete page
    - [ ] Search and filter
  - [ ] **Media Library:**
    - [ ] Grid of uploaded images/files
    - [ ] Upload button
    - [ ] Search and filter
    - [ ] File details (size, dimensions, URL)
    - [ ] Organize in folders
    - [ ] Bulk actions (delete, move)
  - [ ] **Templates:**
    - [ ] Pre-built page templates
    - [ ] Create from template
    - [ ] Save current page as template
  - [ ] **Settings:**
    - [ ] Site settings (title, description, logo)
    - [ ] Theme customization
    - [ ] SEO defaults
    - [ ] Domain configuration
    - [ ] Integrations (analytics, etc.)

### Cycle 6: Design Theme Customization
- [ ] **Theme Settings:**
  - [ ] **Colors:**
    - [ ] Primary color (brand)
    - [ ] Secondary color (accents)
    - [ ] Background colors (light, dark)
    - [ ] Text colors (heading, body, muted)
    - [ ] Success, warning, error colors
    - [ ] Custom color palette (10+ colors)
  - [ ] **Typography:**
    - [ ] Heading font (Google Fonts, custom)
    - [ ] Body font
    - [ ] Font sizes (scale: xs to 3xl)
    - [ ] Font weights (light, regular, medium, bold)
    - [ ] Line heights
    - [ ] Letter spacing
  - [ ] **Spacing:**
    - [ ] Spacing scale (4px to 128px)
    - [ ] Container max-width
    - [ ] Section padding
  - [ ] **Borders & Shadows:**
    - [ ] Border radius (none, sm, md, lg, xl)
    - [ ] Border colors
    - [ ] Box shadows (presets)
  - [ ] **Dark Mode:**
    - [ ] Enable/disable
    - [ ] Custom dark colors
    - [ ] Toggle position

### Cycle 7: Design Multi-Language Support
- [ ] **Localization Features:**
  - [ ] **Language Management:**
    - [ ] Add languages (English, Spanish, French, etc.)
    - [ ] Default language selection
    - [ ] Language picker UI
    - [ ] Language-specific URLs (/en, /es, /fr)
  - [ ] **Content Translation:**
    - [ ] Translate page by page
    - [ ] Show translation status (translated, outdated, missing)
    - [ ] Translate component text
    - [ ] Translate media alt text
    - [ ] Translate SEO metadata
  - [ ] **Translation Workflow:**
    - [ ] Export for translation (JSON, CSV)
    - [ ] Import translations
    - [ ] Translation memory (reuse translations)
    - [ ] Auto-translate via API (optional)
- [ ] **Localized Content:**
  - [ ] Date/time formats
  - [ ] Number formats
  - [ ] Currency formats
  - [ ] Right-to-left (RTL) support

### Cycle 8: Design SEO Tools
- [ ] **SEO Features:**
  - [ ] **Page-Level SEO:**
    - [ ] Meta title (with preview)
    - [ ] Meta description (with preview)
    - [ ] Meta keywords
    - [ ] Open Graph tags (social sharing)
    - [ ] Twitter Card tags
    - [ ] Canonical URL
    - [ ] Robots meta (index, noindex)
  - [ ] **Site-Level SEO:**
    - [ ] Sitemap generation (XML)
    - [ ] Robots.txt editor
    - [ ] Schema.org markup (structured data)
    - [ ] Google Analytics integration
    - [ ] Google Search Console integration
  - [ ] **SEO Analysis:**
    - [ ] Keyword density
    - [ ] Readability score
    - [ ] Image alt text checker
    - [ ] Heading structure analysis
    - [ ] Internal linking suggestions
    - [ ] Mobile-friendliness check
  - [ ] **Performance SEO:**
    - [ ] Page speed score
    - [ ] Core Web Vitals
    - [ ] Image optimization suggestions
    - [ ] Code minification

### Cycle 9: Design Version Control
- [ ] **Version History:**
  - [ ] Auto-save every 30 seconds
  - [ ] List of all versions (timestamp, author)
  - [ ] Compare versions (visual diff)
  - [ ] Restore previous version
  - [ ] Name versions (e.g., "Before redesign")
- [ ] **Publishing Workflow:**
  - [ ] Draft mode (unpublished changes)
  - [ ] Review mode (send for approval)
  - [ ] Scheduled publishing (future date/time)
  - [ ] Rollback published page
- [ ] **Collaboration:**
  - [ ] See who's editing (real-time presence)
  - [ ] Prevent simultaneous editing conflicts
  - [ ] Comments on components
  - [ ] Change history with authors

### Cycle 10: Define Success Metrics
- [ ] Website builder complete when:
  - [ ] Visual editor loads with drag-and-drop
  - [ ] Components can be added, moved, deleted
  - [ ] Inline text editing works
  - [ ] Style customization applies in real-time
  - [ ] Responsive preview switches devices
  - [ ] Pages save as drafts
  - [ ] Pages publish successfully
  - [ ] Theme customization persists
  - [ ] Multi-language content translates
  - [ ] SEO metadata displays correctly
  - [ ] Version history saves and restores
  - [ ] Media library uploads and displays files
  - [ ] Mobile responsive on all devices
  - [ ] Lighthouse score > 90
  - [ ] Accessible (WCAG 2.1 AA compliant)

---

## PHASE 2: BACKEND SCHEMA & SERVICES (Cycle 11-20)

**Purpose:** Define Convex schema, queries, mutations for website builder data

### Cycle 11: Define Website Builder Schema
- [ ] **Tables:**
  - [ ] websites (domain, settings, theme)
  - [ ] pages (slug, content, layout, status)
  - [ ] components (type, props, styles)
  - [ ] media (files, images, metadata)
  - [ ] versions (page snapshots, timestamps)
  - [ ] translations (locale, page, content)
- [ ] **Indexes:**
  - [ ] by_website, by_slug, by_status, by_locale

### Cycle 12: Create Page Queries
- [ ] **Convex queries:**
  - [ ] `pages.list` (all pages for website)
  - [ ] `pages.get` (single page by slug)
  - [ ] `pages.byStatus` (draft, published)
  - [ ] `pages.search` (search by title, content)

### Cycle 13: Create Page Mutations
- [ ] **Convex mutations:**
  - [ ] `pages.create` (new page)
  - [ ] `pages.update` (update content, layout)
  - [ ] `pages.publish` (change status to published)
  - [ ] `pages.unpublish` (revert to draft)
  - [ ] `pages.delete` (remove page)
  - [ ] `pages.duplicate` (copy page)

### Cycle 14: Create Component Mutations
- [ ] **Convex mutations:**
  - [ ] `components.add` (add to page)
  - [ ] `components.update` (update props, styles)
  - [ ] `components.move` (reorder on page)
  - [ ] `components.delete` (remove from page)

### Cycle 15: Create Media Mutations
- [ ] **Convex mutations:**
  - [ ] `media.upload` (store file reference)
  - [ ] `media.delete` (remove file)
  - [ ] `media.organize` (move to folder)

### Cycle 16: Create Version Control Mutations
- [ ] **Convex mutations:**
  - [ ] `versions.save` (create snapshot)
  - [ ] `versions.list` (get history)
  - [ ] `versions.restore` (rollback to version)

### Cycle 17: Create Translation Mutations
- [ ] **Convex mutations:**
  - [ ] `translations.create` (add translation)
  - [ ] `translations.update` (edit translation)
  - [ ] `translations.sync` (sync from default language)

### Cycle 18: Create Theme Mutations
- [ ] **Convex mutations:**
  - [ ] `theme.update` (save theme settings)
  - [ ] `theme.reset` (revert to defaults)

### Cycle 19-20: Continue with real-time subscriptions and optimization

---

## PHASE 3: REACT COMPONENTS (Cycle 21-50)

**Purpose:** Build interactive React components for website builder

### Cycle 21: Create Page Editor Layout
- [ ] **PageEditor component:**
  - [ ] Three-panel layout
  - [ ] Component library sidebar (left)
  - [ ] Visual canvas (center)
  - [ ] Properties panel (right)
  - [ ] Top bar with controls

### Cycle 22: Create Component Library Sidebar
- [ ] **ComponentLibrary component:**
  - [ ] Categorized components
  - [ ] Search filter
  - [ ] Draggable component items
  - [ ] Component preview thumbnails

### Cycle 23: Create Visual Canvas
- [ ] **VisualCanvas component:**
  - [ ] Render page components
  - [ ] Drop zones for new components
  - [ ] Selection highlighting
  - [ ] Drag handles for reordering
  - [ ] Inline editing for text
  - [ ] Context menu (right-click)

### Cycle 24: Create Properties Panel
- [ ] **PropertiesPanel component:**
  - [ ] Content settings tab
  - [ ] Style settings tab
  - [ ] Layout settings tab
  - [ ] Animation settings tab
  - [ ] Conditional logic
  - [ ] Component-specific controls

### Cycle 25: Create Component Renderer
- [ ] **ComponentRenderer component:**
  - [ ] Dynamically render component by type
  - [ ] Apply styles from props
  - [ ] Handle responsive settings
  - [ ] Support nested components

### Cycle 26: Create Device Preview Switcher
- [ ] **DevicePreview component:**
  - [ ] Desktop, tablet, mobile buttons
  - [ ] Canvas resize animation
  - [ ] Orientation toggle (portrait/landscape)
  - [ ] Custom breakpoint preview

### Cycle 27: Create Media Library
- [ ] **MediaLibrary component:**
  - [ ] Grid of uploaded files
  - [ ] Upload button with drag-and-drop
  - [ ] File details modal
  - [ ] Search and filter
  - [ ] Select mode for editor

### Cycle 28: Create Theme Customizer
- [ ] **ThemeCustomizer component:**
  - [ ] Color pickers
  - [ ] Font selectors
  - [ ] Spacing controls
  - [ ] Live preview of changes
  - [ ] Reset to defaults

### Cycle 29: Create Translation Manager
- [ ] **TranslationManager component:**
  - [ ] Language selector
  - [ ] Translation status table
  - [ ] Edit translation modal
  - [ ] Export/import buttons

### Cycle 30: Create SEO Panel
- [ ] **SEOPanel component:**
  - [ ] Meta title and description inputs
  - [ ] Preview snippets (Google, social)
  - [ ] Keyword suggestions
  - [ ] SEO score display

### Cycle 31-50: Continue with templates, publishing workflow, version control UI

---

## PHASE 4: ASTRO PAGES & INTEGRATION (Cycle 51-70)

**Purpose:** Create Astro pages and integrate builder components

### Cycle 51: Create Builder Dashboard
- [ ] **`/builder/index.astro`:**
  - [ ] List of websites
  - [ ] Create new website button
  - [ ] Website cards with quick actions

### Cycle 52: Create Pages Manager
- [ ] **`/builder/[websiteId]/pages.astro`:**
  - [ ] List of pages
  - [ ] Create, edit, delete actions
  - [ ] Status filters

### Cycle 53: Create Page Editor
- [ ] **`/builder/[websiteId]/edit/[pageId].astro`:**
  - [ ] Full page editor interface
  - [ ] Load page data via Convex
  - [ ] Save changes in real-time

### Cycle 54: Create Media Manager
- [ ] **`/builder/[websiteId]/media.astro`:**
  - [ ] Media library UI
  - [ ] Upload functionality
  - [ ] File management

### Cycle 55: Create Settings Page
- [ ] **`/builder/[websiteId]/settings.astro`:**
  - [ ] Site settings
  - [ ] Theme customization
  - [ ] Domain configuration
  - [ ] SEO defaults

### Cycle 56-70: Continue with templates, translations, analytics integration

---

## PHASE 5: POLISH & OPTIMIZATION (Cycle 71-100)

**Purpose:** Refine UX, performance, accessibility, testing

### Cycle 71-80: Animations, transitions, loading states
### Cycle 81-85: Accessibility, keyboard navigation
### Cycle 86-90: Performance optimization
### Cycle 91-95: Testing, cross-browser compatibility
### Cycle 96-100: Documentation, deployment, final polish

---

## SUCCESS CRITERIA

Website builder is complete when:

- ✅ Visual page editor loads with drag-and-drop functionality
- ✅ All component types can be added, configured, and styled
- ✅ Inline text editing works smoothly
- ✅ Responsive preview switches between devices
- ✅ Theme customization applies globally
- ✅ Pages save, publish, and unpublish correctly
- ✅ Version history saves and restores pages
- ✅ Multi-language content translates and displays
- ✅ SEO metadata generates correctly
- ✅ Media library uploads and manages files
- ✅ Performance monitoring tracks metrics
- ✅ Custom domains can be configured
- ✅ Mobile responsive on all screen sizes
- ✅ Dark mode works
- ✅ Lighthouse score > 90
- ✅ Accessible (WCAG 2.1 AA compliant)
- ✅ Cross-browser tested

---

**Timeline:** 90-100 cycles for complete implementation
**Status:** Ready to build
**Next:** Use Claude Code to implement step by step following cycle sequence
