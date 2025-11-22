---
title: Funnel View Toggle - Visual Guide
dimension: events
category: guide
tags: clickfunnels-builder, ui-patterns, view-toggle
created: 2025-11-22
---

# Funnel View Toggle - Visual Guide

**Feature:** Grid/List view toggle for funnel dashboard
**Cycle:** 32
**Component:** `/web/src/components/features/funnels/FunnelDashboard.tsx`

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUNNEL DASHBOARD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Funnels                                      ┌───────────────┐ │
│  Manage your sales funnels                    │ [GRID] [LIST] │ │
│  and conversion flows                         └───────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                  │
│  │  Total    │  │ Published │  │  Drafts   │                  │
│  │  Funnels  │  │           │  │           │                  │
│  │     8     │  │     5     │  │     2     │                  │
│  └───────────┘  └───────────┘  └───────────┘                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GRID VIEW (4 columns on desktop)                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Product │ │  Lead   │ │ Webinar │ │  Book   │              │
│  │ Launch  │ │ Magnet  │ │  Reg.   │ │ Launch  │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │Membership│ │  SaaS  │ │Coaching │ │ Summit  │              │
│  │ Sign-Up │ │  Trial  │ │ Program │ │  Reg.   │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## View Toggle Component

```tsx
// Toggle UI (bg-muted rounded container with 2 buttons)
┌────────────────────┐
│ [GRID ▣] [LIST ≡] │  ← Both buttons visible
└────────────────────┘

// Active state (grid selected)
┌────────────────────┐
│ [GRID ▣] [LIST ≡] │  ← GRID is bg-primary (highlighted)
└────────────────────┘

// Active state (list selected)
┌────────────────────┐
│ [GRID ▣] [LIST ≡] │  ← LIST is bg-primary (highlighted)
└────────────────────┘

// Mobile view (text hidden, icons only)
┌──────────┐
│ [▣] [≡] │  ← Text hidden with `hidden sm:inline`
└──────────┘
```

---

## Grid View (Default)

**Layout:** 4 columns (desktop), 2 columns (tablet), 1 column (mobile)

```
Desktop (4 cols):
┌────────────┬────────────┬────────────┬────────────┐
│ Funnel 1   │ Funnel 2   │ Funnel 3   │ Funnel 4   │
│ [Card]     │ [Card]     │ [Card]     │ [Card]     │
└────────────┴────────────┴────────────┴────────────┘
┌────────────┬────────────┬────────────┬────────────┐
│ Funnel 5   │ Funnel 6   │ Funnel 7   │ Funnel 8   │
│ [Card]     │ [Card]     │ [Card]     │ [Card]     │
└────────────┴────────────┴────────────┴────────────┘

Tablet (2 cols):
┌────────────┬────────────┐
│ Funnel 1   │ Funnel 2   │
│ [Card]     │ [Card]     │
└────────────┴────────────┘
┌────────────┬────────────┐
│ Funnel 3   │ Funnel 4   │
│ [Card]     │ [Card]     │
└────────────┴────────────┘

Mobile (1 col):
┌────────────┐
│ Funnel 1   │
│ [Card]     │
└────────────┘
┌────────────┐
│ Funnel 2   │
│ [Card]     │
└────────────┘
```

**ThingCard Content:**
```
┌─────────────────────────────────┐
│ 📊 Product Launch Funnel        │  ← Icon + Name
│ [Published]                     │  ← Status badge
│                                 │
│ Complete funnel for launching   │  ← Description
│ new products with webinar...    │
│                                 │
│ #ecommerce #product-launch      │  ← Tags (max 3)
│                                 │
│ Steps: 5                        │  ← Metadata
│ Conversions: 234                │
│                                 │
│ Created 7 days ago              │  ← Timestamps
└─────────────────────────────────┘
```

---

## List View

**Layout:** Vertical list with search, filter, sort, pagination

```
┌───────────────────────────────────────────────────────────────┐
│ [Search: 🔍 Search things...]  [Filter: All Types ▼]  [Sort ▼]│
├───────────────────────────────────────────────────────────────┤
│ Showing 8 of 8 things                     [Clear search]      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ 📊 Product Launch Funnel            [Published]          ││
│ │ Complete funnel for launching new products...            ││
│ │ #ecommerce #product-launch #high-converting              ││
│ │ Steps: 5 | Conversions: 234                              ││
│ │ Created 7 days ago | Updated 2 days ago                  ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ┌───────────────────────────────────────────────────────────┐│
│ │ 📊 Lead Magnet Funnel               [Published]          ││
│ │ Free guide download with email capture...                ││
│ │ #lead-gen #email-marketing                               ││
│ │ Steps: 3 | Conversions: 567                              ││
│ │ Created 14 days ago | Updated 5 days ago                 ││
│ └───────────────────────────────────────────────────────────┘│
│                                                               │
│ ... (more funnels)                                            │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ Page 1 of 1                [Previous] [1] [Next]             │
└───────────────────────────────────────────────────────────────┘
```

**Features:**
- **Search:** Filters by name and description
- **Type Filter:** Dropdown to filter by thing type (all types)
- **Sort:** Name A-Z/Z-A, Newest/Oldest, Recently Updated
- **Pagination:** 12 items per page with page numbers

---

## State Persistence Flow

```
1. User visits /funnels
   ↓
2. Page loads, reads localStorage['funnel-view-mode']
   ↓
3. If 'grid' (default): Show ThingGrid
   If 'list': Show ThingList
   ↓
4. User clicks toggle button
   ↓
5. setViewMode() called
   ↓
6. viewMode$ atom updates
   ↓
7. localStorage['funnel-view-mode'] = 'grid' or 'list'
   ↓
8. Component re-renders with new view
   ↓
9. User refreshes page → view preference persists
```

---

## Code Structure

### Store (`/web/src/stores/funnelView.ts`)
```typescript
import { persistentAtom } from '@nanostores/persistent';

export type ViewMode = 'grid' | 'list';

// Persistent state (localStorage)
export const viewMode$ = persistentAtom<ViewMode>(
  'funnel-view-mode',  // localStorage key
  'grid',              // default value
  {
    encode: (value) => value,
    decode: (value) => (value === 'list' ? 'list' : 'grid'),
  }
);

// Helper to set view mode
export function setViewMode(mode: ViewMode) {
  viewMode$.set(mode);
}
```

### Component (`/web/src/components/features/funnels/FunnelDashboard.tsx`)
```typescript
import { useStore } from '@nanostores/react';
import { viewMode$, setViewMode } from '@/stores/funnelView';

export function FunnelDashboard({ funnels }) {
  // Subscribe to view mode changes
  const viewMode = useStore(viewMode$);

  return (
    <div>
      {/* Toggle Buttons */}
      <Button onClick={() => setViewMode('grid')}>Grid</Button>
      <Button onClick={() => setViewMode('list')}>List</Button>

      {/* Conditional Rendering */}
      {viewMode === 'grid' ? (
        <ThingGrid things={funnels} columns={4} />
      ) : (
        <ThingList things={funnels} searchable sortable />
      )}
    </div>
  );
}
```

### Page (`/web/src/pages/funnels/index.astro`)
```astro
---
import { FunnelDashboard } from '@/components/features/funnels/FunnelDashboard';

const mockFunnels = [ /* 8 sample funnels */ ];
---

<Layout>
  <FunnelDashboard
    client:load
    funnels={mockFunnels}
    onFunnelClick={(funnel) => {
      window.location.href = `/funnels/${funnel._id}`;
    }}
  />
</Layout>
```

---

## Responsive Behavior

### Desktop (≥1024px)
- Grid: 4 columns
- Toggle: Full text + icons
- Stats: 3 columns

### Tablet (768px - 1023px)
- Grid: 2 columns
- Toggle: Full text + icons
- Stats: 3 columns

### Mobile (<768px)
- Grid: 1 column
- Toggle: Icons only (text hidden)
- Stats: 1 column

---

## Accessibility

### Keyboard Navigation
- Tab through toggle buttons
- Enter/Space to activate button
- Arrow keys for list navigation

### Screen Readers
- Button labels: "Grid" and "List"
- Icon aria-labels: "Grid view icon" and "List view icon"
- Active state announced: "Grid view active" or "List view active"

### Focus States
- Visible focus ring on buttons
- High contrast focus indicators

---

## Performance

### Initial Load
- HTML rendered server-side (static)
- Only FunnelDashboard hydrated (`client:load`)
- localStorage read on mount (synchronous, <1ms)

### View Toggle
- State update: <1ms (nanostores)
- Re-render: <16ms (React reconciliation)
- localStorage write: <1ms
- Total: <20ms (imperceptible to user)

### Bundle Size
- nanostores: 334 bytes
- persistentAtom: ~200 bytes
- Total: <1 KB

---

## Future Enhancements (Post-Cycle 32)

### Advanced Filtering (Cycle 61+)
- Filter by status (published, draft, archived)
- Filter by tags (ecommerce, webinar, etc.)
- Filter by date range
- Multi-select filters

### Saved Views (Cycle 71+)
- Save custom filter combinations
- Named views (e.g., "High-Converting Funnels")
- Quick view switcher

### Bulk Actions (Cycle 81+)
- Select multiple funnels
- Bulk publish/unpublish
- Bulk archive/delete
- Bulk tag editing

### Analytics Integration (Cycle 91+)
- Show conversion rate in cards
- Revenue per funnel
- Visitor count
- Sort by performance metrics

---

## Testing Checklist

### Functional Tests
- [ ] Grid view displays 4 columns on desktop
- [ ] List view displays vertical list
- [ ] Toggle switches between views
- [ ] View preference persists on reload
- [ ] Search filters funnels in list view
- [ ] Sort changes funnel order
- [ ] Pagination splits funnels across pages
- [ ] Click navigates to funnel detail

### Visual Tests
- [ ] Toggle buttons have correct active state
- [ ] Grid cards align properly
- [ ] List items have consistent spacing
- [ ] Stats summary displays correctly
- [ ] Empty state shows when no funnels

### Responsive Tests
- [ ] 4 columns on desktop (≥1024px)
- [ ] 2 columns on tablet (768-1023px)
- [ ] 1 column on mobile (<768px)
- [ ] Toggle text hides on mobile
- [ ] Stats collapse to 1 column on mobile

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader announces view changes
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA

---

## Common Issues & Solutions

### Issue: View preference not persisting
**Cause:** localStorage blocked or private browsing mode
**Solution:** Gracefully fall back to in-memory state

### Issue: Grid layout broken on some screen sizes
**Cause:** CSS grid classes not applying
**Solution:** Verify Tailwind responsive classes (`md:grid-cols-2`, etc.)

### Issue: Toggle button not responding
**Cause:** JavaScript not hydrated
**Solution:** Ensure `client:load` directive on FunnelDashboard

### Issue: Slow view switching
**Cause:** Large dataset re-rendering
**Solution:** Add React.memo or virtualization for >100 funnels

---

**Visual Guide Complete**

**Next Steps:**
- Cycle 33: Funnel Detail Page
- Cycle 34: Funnel Sequence Visualization
- Cycles 11-30: Backend integration for real data
