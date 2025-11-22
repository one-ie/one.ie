# Click Heatmap Tracking - Quick Start Guide

## Overview

Track user clicks and scroll behavior with visual heatmap overlays. Perfect for understanding where users interact with your pages and optimizing UI/UX.

## Quick Start

### 1. Initialize Tracking

Add to your main layout or app initialization:

```typescript
// src/layouts/Layout.astro or similar
<script>
  import { initializeHeatmapTracking } from '@/lib/analytics/heatmap-tracker';
  initializeHeatmapTracking();
</script>
```

### 2. Add Heatmap Viewer

Create an analytics page to view heatmaps:

```astro
---
// src/pages/analytics/clicks.astro
import Layout from '@/layouts/Layout.astro';
import { HeatmapViewer } from '@/components/analytics/HeatmapViewer';
---

<Layout title="Click Analytics">
  <HeatmapViewer
    client:load
    page="/products"
    refreshInterval={5000}
    showStatistics={true}
    gridSize={50}
  />
</Layout>
```

### 3. View Results

Visit your analytics page to see:
- Click density heatmap (red = high, blue = low)
- Top clicked elements
- Device breakdown
- Scroll depth metrics

## API Reference

### `initializeHeatmapTracking()`

Starts tracking all clicks and scroll events. Call once on app load.

### `getClickEvents(filters?)`

Get raw click data with optional filters:

```typescript
const clicks = getClickEvents({
  page: '/products',           // Filter by page path
  deviceType: 'mobile',        // 'desktop' | 'tablet' | 'mobile'
  startDate: Date.now() - 7d,  // Timestamp
  endDate: Date.now(),         // Timestamp
});
```

### `getHeatmapData(options)`

Get aggregated data for heatmap visualization:

```typescript
const heatmap = getHeatmapData({
  page: '/products',
  deviceType: 'mobile',
  gridSize: 50,  // Size of heatmap cells in pixels
});
```

### `getClickStatistics(filters?)`

Get aggregated statistics:

```typescript
const stats = getClickStatistics({ page: '/products' });

console.log(stats.totalClicks);           // 1234
console.log(stats.clicksByElement);       // { button: 500, a: 300, ... }
console.log(stats.averageScrollDepth);    // 67.5%
```

### `getScrollDepthEvents()`

Get scroll depth data for all pages:

```typescript
const scrolls = getScrollDepthEvents();
// { '/products': { maxDepth: 85, ... }, '/about': { maxDepth: 60, ... } }
```

## HeatmapViewer Props

```typescript
interface HeatmapViewerProps {
  page?: string;              // Filter by specific page
  refreshInterval?: number;    // Auto-refresh in milliseconds
  showStatistics?: boolean;    // Show stats dashboard
  gridSize?: number;          // Heatmap cell size (default: 50px)
}
```

## Data Structure

### ClickEvent

```typescript
interface ClickEvent {
  x: number;                  // Document X coordinate
  y: number;                  // Document Y coordinate
  viewportX: number;          // Viewport X coordinate
  viewportY: number;          // Viewport Y coordinate

  element: {
    tagName: string;          // 'button', 'a', 'div', etc.
    id?: string;
    className?: string;
    textContent?: string;
    ariaLabel?: string;
  };

  page: {
    url: string;
    path: string;
    title: string;
    width: number;
    height: number;
    scrollY: number;
    scrollDepth: number;      // Percentage (0-100)
  };

  device: {
    type: 'desktop' | 'tablet' | 'mobile';
    width: number;
    height: number;
    userAgent: string;
  };

  sessionId: string;
  timestamp: number;
}
```

## Use Cases

### 1. Optimize Call-to-Action Buttons

**Goal:** Increase button click-through rates

**How:**
1. Filter heatmap by page: `/landing`
2. Identify low-click CTAs (blue areas)
3. Move or redesign underperforming buttons

### 2. Mobile vs Desktop Comparison

**Goal:** Ensure mobile users can access key features

**How:**
1. Filter by device type
2. Compare desktop vs mobile heatmaps
3. Adjust mobile layout for better accessibility

### 3. Identify User Confusion

**Goal:** Find broken or confusing UI elements

**How:**
1. Look for high-density click areas (red)
2. Check "Top Elements" tab for rage clicks
3. Fix non-interactive elements getting many clicks

### 4. Content Engagement

**Goal:** Understand which content users read

**How:**
1. Check scroll depth by page
2. Identify where users drop off
3. Move important content higher if needed

## Storage & Privacy

- **Storage:** localStorage (client-side only)
- **Size:** ~1KB per 10 clicks
- **Limit:** 1000 clicks (sliding window)
- **Session:** 30-minute timeout
- **Privacy:** No PII captured, only element metadata

## Performance

- Click tracking: < 1ms overhead
- Scroll tracking: Debounced to 150ms
- Storage write: < 5ms
- Heatmap render: < 100ms for 1000 points

## Browser Support

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ Requires localStorage support

## Examples

### Track Specific Page

```typescript
// Only show heatmap for /products page
<HeatmapViewer client:load page="/products" />
```

### Auto-Refresh Every 10 Seconds

```typescript
<HeatmapViewer client:load refreshInterval={10000} />
```

### Custom Grid Size for Fine Detail

```typescript
// Smaller grid = more detail
<HeatmapViewer client:load gridSize={30} />
```

### Programmatic Access

```typescript
import {
  getClickEvents,
  getHeatmapData,
  getClickStatistics
} from '@/lib/analytics/heatmap-tracker';

// Get all mobile clicks from last 7 days
const clicks = getClickEvents({
  deviceType: 'mobile',
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
});

// Get heatmap data for checkout page
const heatmap = getHeatmapData({
  page: '/checkout',
  gridSize: 40,
});

// Get statistics
const stats = getClickStatistics({
  page: '/checkout',
  deviceType: 'mobile',
});

console.log(`Mobile users clicked ${stats.totalClicks} times on checkout`);
console.log(`Average scroll: ${stats.averageScrollDepth}%`);
```

## Troubleshooting

### No clicks showing up

**Solution:** Make sure `initializeHeatmapTracking()` is called:

```astro
<script>
  import { initializeHeatmapTracking } from '@/lib/analytics/heatmap-tracker';
  initializeHeatmapTracking();
</script>
```

### Heatmap not updating

**Solution:** Add `refreshInterval` prop:

```typescript
<HeatmapViewer client:load refreshInterval={5000} />
```

### Data not persisting

**Solution:** Check localStorage is enabled in browser settings.

### Session keeps resetting

**Solution:** Session timeout is 30 minutes. This is normal behavior for privacy.

## Next Steps

- [View Demo Page](/analytics/heatmap)
- [Read Full Documentation](./CYCLE-77-SUMMARY.md)
- [Explore Analytics Dashboard](/analytics)

## Related Features

- Traffic Source Tracking (`utm-tracker.ts`)
- Session Recording (`session-recorder.ts`)
- Custom Events (`custom-events.ts`)
- Analytics Dashboard (`AnalyticsDashboard.tsx`)
