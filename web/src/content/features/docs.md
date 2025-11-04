---
title: "Documentation System"
description: "Multi-view documentation site with search, filtering, and copy buttons for code blocks and entire pages."
featureId: "docs"
category: "developer-tools"
status: "completed"
version: "2.0.0"
releaseDate: 2025-11-04T00:00:00Z
organization: "ONE Platform"
ontologyDimensions: ["Things", "Knowledge"]
assignedSpecialist: "agent-frontend"
specification:
  complexity: "medium"
  estimatedHours: 48
  technologies: ["Astro", "React", "Markdown", "Zod", "TypeScript", "Tailwind v4"]
ontologyMapping:
  things: "Each doc page is a thing with type='documentation'"
  knowledge: "Docs indexed for search and discovery"
useCases:
  - title: "Developer Learning"
    description: "New developers read guides and tutorials with code examples"
    userType: "Developer"
  - title: "API Reference"
    description: "Engineers search and reference API documentation"
    userType: "Developer"
  - title: "Troubleshooting"
    description: "Users search docs for solutions to common problems"
    userType: "User"
  - title: "Code Reuse"
    description: "Developers copy code blocks and entire pages"
    userType: "Developer"
features:
  - name: "Multi-View Display"
    description: "5 different viewing modes (List, Compact, Grid 2/3/4)"
    status: "completed"
  - name: "Full-Text Search"
    description: "Real-time search across titles, descriptions, tags, sections"
    status: "completed"
  - name: "Tag Filtering"
    description: "Click badges to filter docs by tags"
    status: "completed"
  - name: "Folder Navigation"
    description: "Browse by category with icons and counters"
    status: "completed"
  - name: "Code Block Copy"
    description: "Copy buttons on every code block (visible by default, text on hover)"
    status: "completed"
  - name: "Page Copy Button"
    description: "Copy entire page content with one click"
    status: "completed"
  - name: "Syntax Highlighting"
    description: "Shiki-powered syntax highlighting with language labels"
    status: "completed"
  - name: "Responsive Design"
    description: "Fully responsive on mobile, tablet, and desktop"
    status: "completed"
  - name: "Dark Mode Support"
    description: "Automatic theme switching via Tailwind v4 HSL"
    status: "completed"
marketingPosition:
  tagline: "Beautiful documentation that developers love"
  valueProposition: "Search-first, multi-view documentation with instant copy"
  targetAudience: ["Developers", "Technical Writers", "Users"]
  pricingImpact: "free"
metrics:
  testCoverage: 90
  performanceScore: 95
  mobileScore: 94
  accessibilityScore: 92
tags: ["documentation", "search", "developer-tools", "astro", "react"]
featured: true
priority: "critical"
createdAt: 2025-11-04T00:00:00Z
updatedAt: 2025-11-04T00:00:00Z
draft: false
---

## Overview

A beautiful, multi-view documentation system built with **Astro 5 + React 19 + Tailwind v4**. Provides instant search, multiple viewing modes, and dual copy buttons for code blocks and entire pages.

## Key Features

### 📋 Five Viewing Modes

- **List View** (default) - Compact, description-focused with tags
- **Compact View** - Table-like format for quick scanning
- **Grid 2-Column** - Side-by-side cards with descriptions
- **Grid 3-Column** - Standard card layout with more whitespace
- **Grid 4-Column** - Minimal cards (titles only) for overview

All view modes preserve search context via URL parameters.

### 🔍 Real-Time Search & Filtering

**Full-Text Search** - Searches across:
- Document titles
- Descriptions
- Section names
- Tags

**Tag Filtering** - Click any badge to filter docs by tag

**Folder Navigation** - Browse by category:
- 🚀 Getting Started
- 📚 Core Concepts
- ⚡ Advanced
- 📖 Tutorials
- ℹ️ Troubleshooting

Combine filters - all parameters work together:
```
/docs?view=grid2&search=api&tag=backend
```

### 📋 Copy Buttons

**Code Block Buttons:**
- Always visible (icon only by default)
- Expand to show icon + text on hover
- Click to copy code with "Copied!" feedback
- Green checkmark animation on success
- Auto-reset after 2 seconds

**Page Copy Button:**
- Located at top right of page
- Shows icon + "Copy Page" text
- Copies entire page content (all text, preserving structure)
- Toast notification: "Page copied to clipboard!"
- Visual feedback (green icon)

### 🎨 Code Highlighting

- Shiki-powered syntax highlighting
- Language labels on code blocks
- Dark/light theme support
- Responsive code blocks

### 🌓 Theme Support

- Automatic dark/light mode via Tailwind v4
- HSL color variables for consistency
- Gradient backgrounds for visual polish
- WCAG AA accessibility compliant

## Architecture

### File Structure

```
web/src/
├── pages/docs/
│   ├── index.astro              # Hub with all views + search
│   └── [...slug].astro          # Individual doc pages
├── layouts/
│   └── DocsDetail.astro         # Doc page layout with copy buttons
└── components/docs/
    ├── DocList.tsx              # List view renderer
    ├── DocGrid.tsx              # Grid view renderers
    ├── DocCompact.tsx           # Compact view renderer
    ├── DocSearch.tsx            # Search input
    ├── DocViewToggle.tsx        # View mode switcher
    ├── DocFolderNav.tsx         # Folder sidebar
    └── DocFilterResults.tsx     # Filter display
```

### Content Schema

```typescript
const DocsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  section: z.string().optional(),        // Folder/category
  order: z.number().optional(),          // Sort within section
  tags: z.array(z.string()).optional(),  // Searchable tags
  status: z.enum(['draft', 'public', 'private']),
});
```

### Content Organization

```
web/src/content/docs/
├── getting-started/
│   ├── installation.md
│   ├── first-project.md
│   └── hello-world.md
├── core-concepts/
│   ├── ontology.md
│   ├── architecture.md
│   └── data-model.md
├── frontend/
├── backend/
├── tutorials/
└── troubleshooting/
```

## Technical Stack

- **Astro 5.14+** - Static site generation with SSR
- **React 19** - Islands architecture for interactivity
- **TypeScript 5.9+** - Full type safety
- **Tailwind CSS v4** - HSL-based theming
- **shadcn/ui** - Pre-built accessible components
- **Lucide Icons** - Icon system for UI elements

## Performance

- **Build:** Static HTML generation (zero JavaScript per page)
- **Search:** Client-side with real-time filtering
- **Core Web Vitals:** LCP < 1.5s, CLS < 0.05
- **Lighthouse Score:** 95+
- **Mobile Score:** 94+
- **Accessibility:** WCAG AA compliant

## Usage

### For Developers

1. **Navigate to `/docs`** - Browse all documentation with 5 view modes
2. **Search** - Use the search bar to find docs
3. **Filter by tags** - Click badges to filter
4. **Copy code** - Hover over code blocks, click copy button
5. **Copy page** - Click "Copy Page" button to get all content

### For Content Creators

1. **Create markdown file** in `web/src/content/docs/[section]/[slug].md`
2. **Add frontmatter:**
   ```yaml
   ---
   title: Your Doc Title
   description: One-line summary
   section: getting-started
   order: 1
   tags:
     - astro
     - frontend
     - component
   status: public
   ---
   ```
3. **Write markdown content** with code blocks
4. **Auto-generated:** Search indexing, view modes, copy buttons

## Deployment

- **Deployed to:** Cloudflare Pages via `/deploy` command
- **Build command:** `bun run build`
- **Output directory:** `dist/`
- **Environment:** No additional env vars needed

## Future Enhancements

- [ ] Version switching (v1, v2, v3)
- [ ] Multilingual support (EN, FR, ES, ZH)
- [ ] API reference auto-generation
- [ ] Analytics (most-viewed, popular searches)
- [ ] Related docs suggestions
- [ ] Table of contents sidebar
- [ ] Breadcrumb navigation
- [ ] Edit on GitHub links
- [ ] Offline support (PWA)

## Integration with ONE Platform

**Maps to 6-Dimension Ontology:**
- **Things** - Each doc is a documentation entity
- **Knowledge** - Docs indexed for semantic search
- **Connections** - Links between related docs
- **Events** - Track doc views and interactions

**Compatible with:**
- Content collections
- Zod schemas
- Astro routing
- React islands
- Tailwind v4 theming
