# Cycle 58: Template Usage Statistics - Implementation Summary

**Status**: ✅ Complete
**Type**: Feature Implementation
**Part of**: ClickFunnels Builder (Cycles 1-100)

---

## Overview

Implemented comprehensive template usage tracking and statistics display system for funnel templates. Tracks popularity, conversions, and trending status.

---

## Backend Implementation

### 1. Queries (`/backend/convex/queries/templates.ts`)

Created three queries for template statistics:

#### `getStats(templateId)`
Returns comprehensive usage statistics for a template:
- `timesUsed` - Total number of funnels created from template
- `funnelsCreated` - Array of funnel IDs
- `totalConversions` - Sum of all purchase_completed events
- `avgConversionRate` - Average conversion rate across funnels
- `lastUsed` - Timestamp of most recent usage
- `activeFunnels` - Count of non-archived funnels

**How it works:**
1. Queries `connections` table for `funnel_based_on_template` relationships
2. Fetches all funnels created from template
3. Aggregates events (purchase_completed, visitor_entered_funnel)
4. Calculates conversion metrics

#### `getAllStats(limit?)`
Returns statistics for all templates in user's organization, sorted by recent usage.

**Use case:** Template gallery sorting and filtering

#### `getTrending(threshold?, limit?)`
Returns templates with high recent usage (default: 3+ uses in last 7 days).

**Use case:** Displaying "Trending" badge on popular templates

### 2. Mutations (`/backend/convex/mutations/templates.ts`)

Created three mutations for event logging:

#### `logViewed(templateId, metadata?)`
Logs `template_viewed` event when user views a template.

**Event structure:**
```typescript
{
  type: "template_viewed",
  actorId: person._id,
  targetId: templateId,
  timestamp: Date.now(),
  metadata: {
    templateName: "...",
    groupId: "...",
    source: "template_gallery", // custom metadata
  }
}
```

#### `logUsed(templateId, funnelId, metadata?)`
Logs `template_used` event and creates `funnel_based_on_template` connection.

**Creates:**
1. Connection: `funnel → template`
2. Event: `template_used`

**Use case:** Called when funnel is created from template

#### `update(id, name?, description?, properties?)`
Updates template properties and logs `entity_updated` event.

---

## Frontend Components

### 1. TrendingBadge (`/web/src/components/features/funnels/TrendingBadge.tsx`)

Displays "Trending" badge for popular templates.

**Props:**
- `recentUsage: number` - Uses in last 7 days
- `threshold?: number` - Minimum uses to show badge (default: 3)
- `size?: "sm" | "md" | "lg"` - Badge size

**Appearance:**
- Orange-to-pink gradient
- Pulse animation
- Fire emoji icon
- Only shows if `recentUsage >= threshold`

**Usage:**
```tsx
<TrendingBadge recentUsage={5} threshold={3} size="sm" />
```

### 2. TemplateStatsCard (`/web/src/components/features/funnels/TemplateStatsCard.tsx`)

Displays template usage statistics in card or compact format.

**Props:**
- `stats: TemplateStats | null | undefined` - Statistics data
- `recentUsage?: number` - For trending badge
- `compact?: boolean` - Show compact single-line view
- `className?: string` - Additional CSS classes

**Compact View:**
Single row with icons and metrics (for template cards)

**Full Card View:**
Grid of 4 metrics with icons:
- Times Used (with active funnel count)
- Total Conversions
- Average Conversion Rate
- Funnels Created

**Usage:**
```tsx
// Compact (on template card)
<TemplateStatsCard stats={stats} recentUsage={5} compact />

// Full card (on stats page)
<TemplateStatsCard stats={stats} recentUsage={5} />
```

### 3. TemplateUsageStats (`/web/src/components/features/funnels/TemplateUsageStats.tsx`)

Complete statistics dashboard with tabs.

**Features:**
- **Overview Tab**: Performance metrics, success rate, popularity
- **Activity Tab**: Event timeline (template_viewed, template_used)
- **Funnels Tab**: List of funnels created from template

**Props:**
- `templateId: Id<"things">` - Template to show stats for
- `trendingThreshold?: number` - Trending badge threshold (default: 3)

**Uses:**
- `useQuery(api.queries.templates.getStats)`
- `useQuery(api.queries.events.list)`
- Tabs from shadcn/ui

**Usage:**
```tsx
<TemplateUsageStats templateId={template._id} />
```

### 4. TemplateCardWithStats (`/web/src/components/features/funnels/TemplateCardWithStats.tsx`)

Template card with integrated usage statistics and view tracking.

**Features:**
- Template preview image
- Name, description, category
- Compact stats display
- Trending badge
- Action buttons (Use Template, View Stats)
- **Automatic view tracking** (logs template_viewed on mount)

**Props:**
- `templateId: Id<"things">` - Template to display
- `compactStats?: boolean` - Show compact stats (default: true)
- `trackViews?: boolean` - Enable view tracking (default: true)
- `onSelect?: (id) => void` - Callback when "Use Template" clicked

**Auto-tracking:**
```tsx
useEffect(() => {
  if (trackViews && !hasTrackedView && template) {
    logViewed({
      templateId,
      metadata: { source: "template_gallery" }
    });
  }
}, [trackViews, hasTrackedView, template]);
```

**Usage:**
```tsx
<TemplateCardWithStats
  templateId={template._id}
  trackViews={true}
  onSelect={(id) => createFunnelFromTemplate(id)}
/>
```

---

## Pages

### Template Statistics Page (`/web/src/pages/templates/[id]/stats.astro`)

Dedicated page for viewing template statistics.

**Route:** `/templates/{templateId}/stats`

**Features:**
- Breadcrumb navigation
- Full TemplateUsageStats dashboard
- Client-side data fetching with Convex

**Example URL:** `https://one.ie/templates/abc123/stats`

---

## Data Flow

### Viewing a Template

```
User visits template gallery
  ↓
TemplateCardWithStats renders
  ↓
useEffect triggers on mount
  ↓
useMutation(api.mutations.templates.logViewed)
  ↓
Event logged to database:
{
  type: "template_viewed",
  actorId: user._id,
  targetId: template._id,
  timestamp: Date.now()
}
```

### Using a Template

```
User clicks "Use Template"
  ↓
createFunnelFromTemplate(templateId)
  ↓
1. Create funnel (useMutation)
2. Call api.mutations.templates.logUsed
  ↓
Database updates:
- Connection created: funnel → template
- Event logged: template_used
```

### Viewing Statistics

```
User visits /templates/{id}/stats
  ↓
TemplateUsageStats component loads
  ↓
useQuery(api.queries.templates.getStats)
  ↓
Backend aggregates:
1. Count connections (funnel_based_on_template)
2. Fetch all funnels
3. Aggregate conversion events
4. Calculate metrics
  ↓
Display in tabbed interface
```

---

## Ontology Mapping

### Dimension 4: Connections

**New connection type:**
- `funnel_based_on_template` - Links funnel to its source template

```typescript
{
  fromThingId: funnelId,
  toThingId: templateId,
  relationshipType: "funnel_based_on_template",
  metadata: {
    createdBy: user._id,
    createdByEmail: user.email
  }
}
```

### Dimension 5: Events

**New event types:**
1. `template_viewed` - User viewed template
2. `template_used` - User created funnel from template

**Event structure:**
```typescript
{
  type: "template_viewed" | "template_used",
  actorId: person._id,
  targetId: templateId,
  timestamp: Date.now(),
  metadata: {
    templateName: string,
    groupId: Id<"groups">,
    funnelId?: Id<"things">, // Only for template_used
    source?: string // e.g., "template_gallery"
  }
}
```

---

## Usage Examples

### Template Gallery with Stats

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TemplateCardWithStats } from "@/components/features/funnels/TemplateCardWithStats";

export function TemplateGallery() {
  const templates = useQuery(api.queries.funnels.list, {
    status: "published",
  });

  const handleSelectTemplate = async (templateId) => {
    // Create funnel from template
    const funnelId = await createFunnel({
      name: "My Funnel",
      templateId,
    });

    // Log usage
    await logTemplateUsed({ templateId, funnelId });

    // Redirect to funnel editor
    window.location.href = `/funnels/${funnelId}/edit`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates?.map(template => (
        <TemplateCardWithStats
          key={template._id}
          templateId={template._id}
          trackViews={true}
          onSelect={handleSelectTemplate}
        />
      ))}
    </div>
  );
}
```

### Trending Templates Section

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TemplateCardWithStats } from "@/components/features/funnels/TemplateCardWithStats";

export function TrendingTemplates() {
  const trending = useQuery(api.queries.templates.getTrending, {
    threshold: 3,
    limit: 6,
  });

  if (!trending || trending.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        🔥 Trending Templates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trending.map(template => (
          <TemplateCardWithStats
            key={template._id}
            templateId={template._id}
            trackViews={true}
          />
        ))}
      </div>
    </section>
  );
}
```

### Template Detail Page with Stats Preview

```astro
---
// /web/src/pages/templates/[id]/index.astro
import Layout from "@/layouts/Layout.astro";
import { TemplateStatsCard } from "@/components/features/funnels/TemplateStatsCard";

const { id } = Astro.params;
---

<Layout title="Template Details">
  <div className="container">
    <h1>Template Name</h1>

    <!-- Quick stats preview -->
    <TemplateStatsCard
      client:load
      templateId={id}
      compact
    />

    <!-- Link to full stats -->
    <a href={`/templates/${id}/stats`}>
      View Detailed Statistics →
    </a>
  </div>
</Layout>
```

---

## Multi-Tenant Isolation

All queries and mutations enforce multi-tenant isolation:

```typescript
// 1. Authenticate
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

// 2. Get user's group
const person = await ctx.db
  .query("things")
  .withIndex("by_type", q => q.eq("type", "creator"))
  .filter(t => t.properties?.email === identity.email)
  .first();

if (!person?.groupId) throw new Error("User must belong to a group");

// 3. Verify template access
const template = await ctx.db.get(templateId);
const hasAccess = role === "platform_owner" || template.groupId === person.groupId;

if (!hasAccess) throw new Error("No access to this template");
```

**Result:** Users can only see statistics for templates in their organization.

---

## Performance Considerations

### Query Optimization

1. **Indexed queries** - Uses `by_group_type` and `to_type` indexes
2. **Filtered results** - Only queries active funnels (status !== "archived")
3. **Aggregation at query time** - Calculates metrics server-side
4. **Limit results** - Default limits prevent over-fetching

### Frontend Optimization

1. **Lazy loading** - Stats only load when component visible
2. **Skeleton states** - Shows loading placeholders
3. **Client-side caching** - Convex automatically caches queries
4. **Compact view** - Reduces data displayed on template cards

---

## Testing Checklist

- [ ] ✅ Backend queries return correct stats for template
- [ ] ✅ Multi-tenant isolation prevents cross-group data leaks
- [ ] ✅ TrendingBadge only shows for templates with 3+ recent uses
- [ ] ✅ TemplateStatsCard displays all 4 metrics correctly
- [ ] ✅ TemplateUsageStats tabs work (Overview, Activity, Funnels)
- [ ] ✅ View tracking logs template_viewed event on mount
- [ ] ✅ Usage tracking creates connection and logs template_used event
- [ ] ✅ /templates/{id}/stats page renders statistics dashboard
- [ ] ✅ Compact stats view shows on template cards
- [ ] ✅ Skeleton states display during loading

---

## Next Steps

### Suggested Enhancements

1. **Real-time updates** - Use Convex subscriptions for live stats
2. **Analytics charts** - Add trend graphs (usage over time)
3. **Template ratings** - User reviews and ratings system
4. **Revenue tracking** - Track revenue per template
5. **A/B testing** - Compare template variants
6. **Export stats** - Download CSV of template performance
7. **Email notifications** - Alert when template goes trending

### Integration Points

1. **Funnel builder** - Auto-log template_used when creating from template
2. **Template gallery** - Display TemplateCardWithStats
3. **Admin dashboard** - Show trending templates
4. **User notifications** - "Your template is trending!"
5. **Analytics page** - Template performance leaderboard

---

## Files Created

### Backend
- `/backend/convex/queries/templates.ts` (3 queries, 185 lines)
- `/backend/convex/mutations/templates.ts` (3 mutations, 245 lines)

### Frontend Components
- `/web/src/components/features/funnels/TrendingBadge.tsx` (58 lines)
- `/web/src/components/features/funnels/TemplateStatsCard.tsx` (288 lines)
- `/web/src/components/features/funnels/TemplateUsageStats.tsx` (352 lines)
- `/web/src/components/features/funnels/TemplateCardWithStats.tsx` (268 lines)

### Pages
- `/web/src/pages/templates/[id]/stats.astro` (42 lines)

**Total:** 7 files, ~1,438 lines of code

---

## Summary

Implemented a complete template usage tracking system with:

✅ **Backend queries** for statistics aggregation
✅ **Event logging** for view and usage tracking
✅ **Trending detection** based on recent usage
✅ **Stats components** with compact and full views
✅ **Auto-tracking** on component mount
✅ **Multi-tenant isolation** for security
✅ **Ontology-compliant** (connections + events)
✅ **Production-ready** with loading states and error handling

**Key Innovation:** Trending badge automatically highlights popular templates, driving user engagement and template discovery.

---

**Cycle 58 Complete** ✅
