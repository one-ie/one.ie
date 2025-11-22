# Cycle 73: Traffic Source Tracking - Implementation Summary

## Overview

Implemented comprehensive traffic source tracking with UTM parameters, referrer analysis, and visualization using TreemapChart.

## Files Created

### 1. `/web/src/lib/analytics/utm-tracker.ts` (422 lines)

**Purpose:** Client-side UTM tracking and traffic source attribution

**Features:**
- UTM parameter parsing (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`)
- Document.referrer tracking and categorization
- Traffic source categorization (organic, paid, email, social, direct, referral)
- Session management with 30-minute timeout
- localStorage persistence
- Traffic source history (last 50 visits)
- Helper functions for analytics

**Key Functions:**
```typescript
// Initialize tracking on app load
initializeTrafficTracking()

// Track a page visit (automatic on navigation)
trackPageVisit(url?: string): TrafficSource | null

// Get current traffic source
getCurrentTrafficSource(): TrafficSource | null

// Get metadata for event logging
getTrafficSourceMetadata(): Record<string, unknown>

// Get breakdown by type/source/campaign
getTrafficSourceBreakdown(): Record<TrafficSourceType, number>
getTrafficSourcesBySources(): Record<string, number>
getTrafficSourcesByCampaign(): Record<string, number>
```

**Traffic Source Types:**
- `organic` - Search engines (Google, Bing, Yahoo, DuckDuckGo)
- `paid` - Paid advertising (CPC, PPC)
- `email` - Email campaigns
- `social` - Social media (Facebook, Twitter, LinkedIn, Instagram, TikTok, YouTube)
- `direct` - Direct traffic (no referrer or UTM)
- `referral` - Other website referrals

### 2. `/web/src/components/analytics/TrafficSourcesChart.tsx` (454 lines)

**Purpose:** Visualization component for traffic source analytics

**Features:**
- TreemapChart visualization with hierarchical breakdown (Type → Source → Campaign)
- Interactive drilldown navigation
- Source comparison table with conversion rates and ROI
- Bar chart alternative view
- Filter by traffic source type
- Real-time updates from Convex
- Top 10 sources view

**Props:**
```typescript
interface TrafficSourcesChartProps {
  funnelId?: string;      // Filter by funnel
  groupId?: string;       // Multi-tenant filtering
  dateRange?: DateRange;  // "today" | "7days" | "30days" | "custom"
}
```

**Metrics Displayed:**
- Total visitors
- Total conversions
- Total revenue
- Average conversion rate
- Average ROI
- Per-source performance metrics

### 3. `/web/src/components/analytics/TrafficTracker.tsx` (157 lines)

**Purpose:** Client-side component for automatic page tracking

**Features:**
- Initializes UTM tracking on mount
- Tracks page views automatically
- Sends events to Convex with metadata
- Supports SPA navigation tracking
- Debug mode for development

**Usage:**
```astro
---
// Add to Layout.astro
import { TrafficTracker } from '@/components/analytics/TrafficTracker';
---

<TrafficTracker
  client:load
  groupId={groupId}
  funnelId={funnelId}
  debug={import.meta.env.DEV}
/>
```

### 4. Updated `/web/src/components/analytics/AnalyticsDashboard.tsx`

**Changes:**
- Added "Traffic Sources" tab
- Integrated TrafficSourcesChart component
- Passes dateRange to child component

## Data Flow

```
User visits page with UTM parameters
↓
utm-tracker.ts parses URL and referrer
↓
Categorizes traffic source (organic/paid/email/social/direct/referral)
↓
Stores in localStorage (persistent across sessions)
↓
TrafficTracker component sends event to Convex
↓
Event stored with metadata: { source, medium, campaign, content, term, referrer, type, sessionId }
↓
Backend query aggregates data
↓
TrafficSourcesChart visualizes with TreemapChart
```

## UTM Parameter Examples

### Paid Search Campaign
```
https://example.com/product?utm_source=google&utm_medium=cpc&utm_campaign=summer-sale&utm_content=ad-variant-a&utm_term=buy+shoes
```

**Result:**
- Type: `paid`
- Source: `google`
- Medium: `cpc`
- Campaign: `summer-sale`
- Content: `ad-variant-a`
- Term: `buy+shoes`

### Email Campaign
```
https://example.com/offer?utm_source=newsletter&utm_medium=email&utm_campaign=weekly-digest
```

**Result:**
- Type: `email`
- Source: `newsletter`
- Medium: `email`
- Campaign: `weekly-digest`

### Social Media Post
```
https://example.com/blog?utm_source=facebook&utm_medium=social&utm_campaign=product-launch
```

**Result:**
- Type: `social`
- Source: `facebook`
- Medium: `social`
- Campaign: `product-launch`

### Organic Search (No UTM)
```
https://example.com/
Referrer: https://www.google.com/search?q=...
```

**Result:**
- Type: `organic`
- Source: `google.com`
- Medium: `organic`
- Referrer: `https://www.google.com/search?q=...`

## Backend Requirements

### Convex Query: `api.queries.analytics.getTrafficSources`

**Expected signature:**
```typescript
export const getTrafficSources = query({
  args: {
    funnelId: v.optional(v.id("things")),
    dateRange: v.union(
      v.literal("today"),
      v.literal("7days"),
      v.literal("30days"),
      v.literal("custom")
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Query events table for page_view events
    // Filter by funnelId and dateRange
    // Aggregate by source, medium, campaign
    // Calculate conversions and revenue per source
    // Return SourceMetrics
  }
});
```

**Expected return type:**
```typescript
interface SourceMetrics {
  totalVisitors: number;
  totalConversions: number;
  totalRevenue: number;
  averageConversionRate: number;
  averageROI: number;
  sources: Array<{
    source: string;
    medium: string;
    campaign?: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    roi?: number;
  }>;
}
```

### Convex Mutation: `api.mutations.analytics.logTrafficEvent`

**Expected signature:**
```typescript
export const logTrafficEvent = mutation({
  args: {
    type: v.string(),
    groupId: v.string(),
    funnelId: v.optional(v.id("things")),
    metadata: v.object({
      source: v.optional(v.string()),
      medium: v.optional(v.string()),
      campaign: v.optional(v.string()),
      content: v.optional(v.string()),
      term: v.optional(v.string()),
      referrer: v.optional(v.string()),
      type: v.optional(v.string()),
      sessionId: v.optional(v.string()),
      url: v.optional(v.string()),
      path: v.optional(v.string()),
      title: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Insert into events table
    return await ctx.db.insert("events", {
      type: args.type,
      groupId: args.groupId,
      targetId: args.funnelId,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  }
});
```

## Integration Guide

### Step 1: Add TrafficTracker to Layout

```astro
---
// web/src/layouts/Layout.astro
import { TrafficTracker } from '@/components/analytics/TrafficTracker';

interface Props {
  title: string;
  groupId?: string;
  funnelId?: string;
}

const { title, groupId, funnelId } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{title}</title>
  </head>
  <body>
    <!-- Automatic traffic tracking -->
    <TrafficTracker
      client:load
      groupId={groupId}
      funnelId={funnelId}
      debug={import.meta.env.DEV}
    />

    <slot />
  </body>
</html>
```

### Step 2: Use TrafficSourcesChart in Dashboard

```astro
---
// web/src/pages/analytics/[funnelId].astro
import Layout from '@/layouts/Layout.astro';
import { TrafficSourcesChart } from '@/components/analytics/TrafficSourcesChart';

const { funnelId } = Astro.params;
---

<Layout title="Analytics Dashboard">
  <TrafficSourcesChart
    client:load
    funnelId={funnelId}
    dateRange="30days"
  />
</Layout>
```

### Step 3: Track Conversions

```typescript
// In any React component
import { trackConversion } from '@/components/analytics/TrafficTracker';

function CheckoutButton() {
  const handlePurchase = async () => {
    // ... process payment

    // Track conversion
    await trackConversion('purchase', {
      revenue: 99.99,
      productId: 'prod_123',
      quantity: 1,
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

## Testing

### Manual Testing with UTM Parameters

1. Visit page with UTM parameters:
   ```
   http://localhost:4321/product?utm_source=test&utm_medium=email&utm_campaign=test-campaign
   ```

2. Open browser console and check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('traffic-source'))
   ```

3. Expected output:
   ```json
   {
     "current": {
       "type": "email",
       "source": "test",
       "medium": "email",
       "campaign": "test-campaign",
       "landingPage": "http://localhost:4321/product?...",
       "timestamp": 1234567890,
       "sessionId": "session_..."
     },
     "history": [...],
     "sessionId": "session_...",
     "firstVisit": 1234567890,
     "lastVisit": 1234567890
   }
   ```

### Testing Different Traffic Sources

**Organic (Google):**
```
http://localhost:4321/
Referrer: https://www.google.com/search?q=test
```

**Paid (Google Ads):**
```
http://localhost:4321/?utm_source=google&utm_medium=cpc&utm_campaign=brand
```

**Social (Facebook):**
```
http://localhost:4321/?utm_source=facebook&utm_medium=social&utm_campaign=product-launch
```

**Email:**
```
http://localhost:4321/?utm_source=newsletter&utm_medium=email&utm_campaign=weekly
```

**Direct:**
```
http://localhost:4321/
(no referrer, no UTM parameters)
```

## Performance Considerations

1. **localStorage limits:** Stores last 50 visits (~50KB typical)
2. **Session timeout:** 30 minutes of inactivity creates new session
3. **Event batching:** Consider batching page_view events for high-traffic sites
4. **Real-time updates:** TreemapChart updates when Convex query changes

## Future Enhancements

1. **Attribution modeling:**
   - First-touch attribution
   - Last-touch attribution
   - Multi-touch attribution
   - Time-decay models

2. **Advanced analytics:**
   - Cohort analysis by traffic source
   - Customer lifetime value by source
   - A/B testing integration
   - Predictive analytics

3. **Export capabilities:**
   - CSV export with full UTM data
   - PDF reports with charts
   - Integration with Google Analytics, Facebook Pixel

4. **Alerts and notifications:**
   - Traffic spike detection
   - Conversion rate drops
   - ROI threshold alerts

## Success Criteria

- ✅ UTM parameters parsed and stored
- ✅ Referrer tracking implemented
- ✅ Traffic source categorization (6 types)
- ✅ TreemapChart visualization with drilldown
- ✅ Source comparison with conversion rates
- ✅ ROI calculation per source
- ✅ Event metadata storage
- ✅ Integration with AnalyticsDashboard
- ✅ Client-side tracking component
- ✅ localStorage persistence

## Dependencies

- **Recharts:** TreemapChart visualization
- **Nanostores:** Not used (using localStorage directly)
- **Convex:** Backend event storage and queries
- **ontology-ui:** TreemapChart component

## Completion

**Status:** ✅ Complete

**Files created:** 4
**Lines of code:** 1,033
**Components:** 2 (TrafficSourcesChart, TrafficTracker)
**Utilities:** 1 (utm-tracker.ts)
**Documentation:** This file

**Ready for:** Production use after backend implementation
