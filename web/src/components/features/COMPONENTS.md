# Feature Components Quick Reference

## Import Barrel Export

```typescript
import {
  FeatureCard,
  FeatureStats,
  FeatureCategoryFilter,
  FeatureSidebarNav,
} from '@/components/features';
```

## FeatureCard

Displays a single feature in a card format.

```astro
<FeatureCard feature={feature} showCategory={true} />
```

**Props:**
- `feature: CollectionEntry<'features'>` - Feature data
- `showCategory?: boolean` - Show category badge (default: true)
- `className?: string` - Additional CSS classes

**Features:**
- Clickable card links to detail page
- Status badge with color coding
- Category badge
- Version, release date, capability count
- Hover animations

---

## FeatureStats

Shows aggregate statistics about features.

```astro
<FeatureStats
  client:visible
  features={allFeatures}
  showCompletionPercentage={true}
/>
```

**Props:**
- `features: CollectionEntry<'features'>[]` - All features
- `showCompletionPercentage?: boolean` - Show % complete (default: true)
- `className?: string` - Additional CSS classes

**Displays:**
- Total features
- Completed count
- In development count
- Planned count
- Completion percentage

---

## FeatureCategoryFilter

Interactive multi-select category filter.

```astro
<FeatureCategoryFilter
  client:load
  features={allFeatures}
  onFilterChange={(filtered) => console.log(filtered)}
  showCounts={true}
/>
```

**Props:**
- `features: CollectionEntry<'features'>[]` - All features
- `onFilterChange?: (filtered: CollectionEntry<'features'>[]) => void` - Filter callback
- `showCounts?: boolean` - Show feature count per category (default: true)
- `className?: string` - Additional CSS classes

**Features:**
- Multi-select category buttons
- Dynamic count display
- Clear filters button
- Shows only categories with features

---

## FeatureSidebarNav

Sticky sidebar navigation for detail pages.

```astro
<aside class="hidden lg:block">
  <FeatureSidebarNav
    client:load
    feature={feature}
    allFeatures={allFeatures}
  />
</aside>
```

**Props:**
- `feature: CollectionEntry<'features'>` - Current feature
- `allFeatures: CollectionEntry<'features'>[]` - All features
- `className?: string` - Additional CSS classes

**Sections:**
1. Quick Info (status, version, complexity, hours, priority)
2. On This Page (dynamic nav)
3. Documentation (user guide, API, video, blog)
4. Related Features (max 3)
5. Share (copy link, Twitter)

---

## Page Integration Examples

### Index Page

```astro
---
import { FeatureCard, FeatureStats } from '@/components/features';
import { getCollection } from 'astro:content';

const features = await getCollection('features');
---

<!-- Stats bar -->
<FeatureStats client:visible features={features} />

<!-- Feature grid -->
<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {features.map((f) => (
    <FeatureCard feature={f} showCategory={true} />
  ))}
</div>
```

### Detail Page

```astro
---
import { FeatureSidebarNav } from '@/components/features';

const { feature, allFeatures } = Astro.props;
---

<div class="grid gap-8 lg:grid-cols-[1fr_350px]">
  <div>
    {/* Main content */}
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

### Filtered List

```astro
---
import { FeatureCard, FeatureCategoryFilter } from '@/components/features';

const features = await getCollection('features');
---

<FeatureCategoryFilter client:load features={features} />

<div id="feature-list" class="grid gap-6 md:grid-cols-2">
  {features.map((f) => (
    <FeatureCard feature={f} />
  ))}
</div>
```

---

## Styling Notes

### Colors

**Status:**
- Completed: Green
- Beta: Blue
- In Development: Yellow
- Planned: Gray
- Deprecated: Red

**Categories:**
Each category has unique color scheme. See `categoryColors` object in component.

### Responsive

- Cards: 1 col mobile, 2 cols tablet, 3 cols desktop
- Sidebar: Hidden on mobile (`hidden lg:block`)
- Buttons: Flex wrap on mobile

### Animations

- Card hover: Scale 1.02, shadow increase
- Links: Underline on hover
- Transitions: 300ms smooth

---

## Performance Hints

- Use `client:visible` for FeatureStats (appears below fold)
- Use `client:load` for FeatureCategoryFilter (needs interactivity)
- Use `client:load` for FeatureSidebarNav (sticky positioning)
- Wrap filtered content in `client:visible` when possible

---

## Accessibility

All components follow WCAG 2.1 AA standards:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast
- Title attributes

---

## Troubleshooting

### Component not rendering
- Check that feature data has required fields (title, description)
- Verify CollectionEntry type is imported correctly
- Ensure `client:*` directive is present for React components

### Sidebar not showing on desktop
- Check viewport width (should be >= 1024px for `lg:block`)
- Verify `client:load` directive is present
- Check that browser DevTools isn't zoomed

### Styles not applying
- Verify Tailwind CSS is configured (should be automatic)
- Check for CSS class conflicts
- Use browser DevTools to inspect computed styles

---

## Files

```
src/components/features/
├── FeatureCard.tsx
├── FeatureStats.tsx
├── FeatureCategoryFilter.tsx
├── FeatureSidebarNav.tsx
├── index.ts (barrel export)
└── COMPONENTS.md (this file)
```

---

**For detailed documentation, see FEATURES_COMPONENTS.md**
