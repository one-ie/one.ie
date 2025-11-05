# Features Components Documentation

## Overview

A complete set of reusable React components for displaying and managing feature documentation across the ONE Platform. These components work together to create a polished, interactive feature browsing experience.

## Components

### 1. FeatureCard (`src/components/features/FeatureCard.tsx`)

**Purpose:** Displays a single feature in a card format.

**Key Features:**
- Shows feature title, description, and status badge
- Displays category with color-coding
- Shows version, release date, and capability count
- Responsive hover states with smooth transitions
- Full TypeScript typing with `CollectionEntry<'features'>`

**Props:**
```typescript
interface FeatureCardProps {
  feature: CollectionEntry<'features'>;
  showCategory?: boolean;        // Default: true
  className?: string;
}
```

**Usage:**
```astro
---
import { FeatureCard } from '@/components/features/FeatureCard';
import { getCollection } from 'astro:content';

const features = await getCollection('features');
---

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {features.map((feature) => (
    <FeatureCard feature={feature} showCategory={true} />
  ))}
</div>
```

**Styling:**
- Uses shadcn/ui Card component
- Status color classes: green (completed), blue (beta), yellow (in_development), gray (planned)
- Hover effects include scale and shadow transitions
- Category badges use distinct color schemes per category

---

### 2. FeatureStats (`src/components/features/FeatureStats.tsx`)

**Purpose:** Displays statistics about the features collection.

**Key Features:**
- Shows total feature count
- Displays breakdown by status (completed, in development, planned)
- Calculates and shows completion percentage
- Responsive badge layout
- Memoized calculations for performance
- Accessible with ARIA labels

**Props:**
```typescript
interface FeatureStatsProps {
  features: CollectionEntry<'features'>[];
  showCompletionPercentage?: boolean;  // Default: true
  className?: string;
}
```

**Usage:**
```astro
---
import { FeatureStats } from '@/components/features/FeatureStats';

const features = await getCollection('features');
---

<FeatureStats
  client:visible
  features={features}
  showCompletionPercentage={true}
/>
```

**Statistics Calculated:**
- Total features
- Completed features (status === 'completed')
- In development features (status === 'in_development' OR 'beta')
- Planned features (status === 'planned')
- Completion percentage: `(completed / total) * 100`

---

### 3. FeatureCategoryFilter (`src/components/features/FeatureCategoryFilter.tsx`)

**Purpose:** Provides interactive filtering of features by category.

**Key Features:**
- Multi-select category filtering
- Shows category counts
- Dynamic feature count updates
- Clear filters button
- Callback pattern for parent communication
- Mobile-responsive button layout
- Keyboard accessible

**Props:**
```typescript
interface FeatureCategoryFilterProps {
  features: CollectionEntry<'features'>[];
  onFilterChange?: (filtered: CollectionEntry<'features'>[]) => void;
  className?: string;
  showCounts?: boolean;  // Default: true
}
```

**Usage:**
```astro
---
import { FeatureCategoryFilter } from '@/components/features/FeatureCategoryFilter';

const features = await getCollection('features');
---

<FeatureCategoryFilter
  client:load
  features={features}
  onFilterChange={(filtered) => console.log(filtered)}
  showCounts={true}
/>
```

**Categories Supported:**
- authentication
- ecommerce
- ai-agents
- protocols
- payments
- analytics
- content
- communication
- infrastructure
- integrations
- developer-tools
- other

**Features:**
- Only shows categories that have features
- Displays count of features per category
- Dynamic filter updates with real-time count display
- Clear button appears when filters active
- Color-coded category buttons

---

### 4. FeatureSidebarNav (`src/components/features/FeatureSidebarNav.tsx`)

**Purpose:** Sidebar navigation component for feature detail pages.

**Key Features:**
- Sticky positioning on desktop
- Quick stats section (status, version, complexity, priority)
- "On this page" navigation with dynamic section generation
- Related features display (max 3)
- Documentation links (user guide, API reference, video, blog)
- Share functionality (copy link, Twitter)
- All cards use glassmorphism styling

**Props:**
```typescript
interface FeatureSidebarNavProps {
  feature: CollectionEntry<'features'>;
  allFeatures: CollectionEntry<'features'>[];
  className?: string;
}
```

**Usage:**
```astro
---
import { FeatureSidebarNav } from '@/components/features/FeatureSidebarNav';

const feature = /* current feature */;
const allFeatures = await getCollection('features');
---

<aside class="hidden lg:block">
  <FeatureSidebarNav
    client:load
    feature={feature}
    allFeatures={allFeatures}
  />
</aside>
```

**Sidebar Sections:**

1. **Quick Info**
   - Feature status
   - Version
   - Complexity level
   - Estimated hours
   - Priority

2. **On This Page**
   - Dynamically generated from feature data
   - Sections included if present: Marketing, Ontology Alignment, Capabilities, Use Cases, Code Examples, Technical Specifications, Quality Metrics, Related Features
   - Hash-based navigation links

3. **Documentation**
   - Shows only if documentation links exist
   - Links to User Guide, API Reference, Video Tutorial, Blog Post
   - Opens in new tabs

4. **Related Features**
   - Shows max 3 related features
   - Links to other feature pages
   - Displays status badge

5. **Share**
   - Copy current URL to clipboard
   - Share on Twitter with pre-filled text

---

## Integration with Feature Pages

### Index Page (`src/pages/features/index.astro`)

The features index page has been enhanced with:

```astro
<!-- Hero section with stats -->
<FeatureStats
  client:visible
  features={sortedFeatures}
  showCompletionPercentage={true}
/>

<!-- Feature grids using new component -->
<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {completedFeatures.map((feature) => (
    <FeatureCard feature={feature} showCategory={true} />
  ))}
</div>
```

**Benefits:**
- Cleaner, more maintainable code
- Consistent styling across sections
- Reusable components for future features
- Better separation of concerns

### Detail Page (`src/pages/features/[slug].astro`)

The feature detail page has been enhanced with:

```astro
<!-- Two-column layout -->
<div class="grid gap-8 lg:grid-cols-[1fr_350px]">
  <div class="min-w-0">
    <!-- Main content -->
  </div>

  <aside class="hidden lg:block">
    <FeatureSidebarNav
      client:load
      feature={feature}
      allFeatures={allFeatures}
    />
  </aside>
</div>
```

**Benefits:**
- Improved desktop experience with sidebar navigation
- Easy access to related features
- Quick access to documentation
- Sticky sidebar for better UX
- Hidden on mobile for space efficiency

---

## Styling Approach

All components use:

1. **Tailwind CSS v4**
   - No `@apply` directive
   - HSL color variables
   - CSS-based configuration

2. **shadcn/ui Components**
   - Card, Badge, Button components
   - Consistent theming
   - Accessible by default

3. **Lucide React Icons**
   - Consistent icon set
   - 4px sizing for UI icons
   - Semantic icon usage

4. **Glassmorphism Effects**
   - `backdrop-blur` on cards
   - Semi-transparent backgrounds
   - Modern, clean aesthetic

---

## TypeScript Support

All components are fully typed:

```typescript
// Feature collection type
type Feature = CollectionEntry<'features'>;

// Status types are tagged unions
type Status = 'planned' | 'in_development' | 'beta' | 'completed' | 'deprecated';

// Category types are literals
type Category =
  | 'authentication'
  | 'ecommerce'
  | 'ai-agents'
  | 'protocols'
  | 'payments'
  | 'analytics'
  | 'content'
  | 'communication'
  | 'infrastructure'
  | 'integrations'
  | 'developer-tools'
  | 'other';
```

---

## Performance Optimizations

1. **FeatureStats**: Uses `React.useMemo` to avoid recalculating statistics
2. **FeatureCategoryFilter**: Memoizes category counts and filtered results
3. **FeatureSidebarNav**: Memoizes related features lookup
4. **Client Directives**:
   - `FeatureStats`: `client:visible` (loads when visible)
   - `FeatureCategoryFilter`: `client:load` (loads immediately for interactivity)
   - `FeatureSidebarNav`: `client:load` (needed for sticky positioning)

---

## Accessibility

Components follow WCAG 2.1 AA standards:

1. **FeatureCard**
   - Semantic link elements
   - Descriptive link text

2. **FeatureStats**
   - ARIA label on stats container
   - Title attributes on badges

3. **FeatureCategoryFilter**
   - Semantic button elements
   - `aria-pressed` state tracking
   - Title attributes with counts

4. **FeatureSidebarNav**
   - Semantic nav elements
   - Proper heading hierarchy
   - Clear link destinations

---

## Color System

**Status Colors:**
- Completed: Green (`#10b981`)
- Beta: Blue (`#3b82f6`)
- In Development: Yellow/Amber (`#f59e0b`)
- Planned: Gray (`#6b7280`)
- Deprecated: Red (`#ef4444`)

**Category Colors:**
Each category has a unique color scheme with background, text, and border colors.

---

## Files Created

```
src/components/features/
├── FeatureCard.tsx              (5.6 KB)
├── FeatureStats.tsx             (2.9 KB)
├── FeatureCategoryFilter.tsx     (5.6 KB)
├── FeatureSidebarNav.tsx        (10.8 KB)
└── index.ts                     (barrel export)

src/pages/features/
├── index.astro                  (enhanced)
└── [slug].astro                 (enhanced)

src/content/features/
└── _README.md                   (renamed from README.md)
```

---

## Usage Patterns

### Simple Feature Grid
```astro
---
import { FeatureCard } from '@/components/features';
import { getCollection } from 'astro:content';

const features = await getCollection('features');
---

<div class="grid gap-6 md:grid-cols-3">
  {features.map(f => <FeatureCard feature={f} />)}
</div>
```

### With Filtering
```astro
---
import { FeatureCard, FeatureCategoryFilter } from '@/components/features';
---

<FeatureCategoryFilter
  client:load
  features={features}
/>

<div class="grid gap-6">
  {filteredFeatures.map(f => <FeatureCard feature={f} />)}
</div>
```

### Feature Detail Page
```astro
---
import { FeatureSidebarNav } from '@/components/features';
---

<div class="grid lg:grid-cols-[1fr_350px]">
  <main>{content}</main>
  <FeatureSidebarNav
    client:load
    feature={feature}
    allFeatures={allFeatures}
  />
</div>
```

---

## Future Enhancements

1. **Search Integration**
   - Add feature search component
   - Support Cmd+K keyboard shortcut

2. **Advanced Filtering**
   - Filter by status
   - Filter by complexity
   - Filter by priority

3. **Comparison View**
   - Compare multiple features side-by-side
   - Show feature dependencies

4. **Analytics**
   - Track feature views
   - Popular features dashboard

5. **Export Functionality**
   - Export feature list as CSV/JSON
   - Generate feature matrix

---

## Notes

- All components use React 19 features (no legacy class components)
- Built for Astro 5.14+ with proper SSR support
- Fully compatible with the existing ONE Platform design system
- Mobile-first responsive design
- No external dependencies beyond React and shadcn/ui

---

**Last Updated:** November 4, 2025
**Status:** Production Ready
