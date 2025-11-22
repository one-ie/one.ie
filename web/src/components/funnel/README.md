# Funnel Components

React components for ClickFunnels-style funnel builder.

## Components

### FunnelActions

Comprehensive action menu for funnel operations with keyboard shortcuts and confirmation dialogs.

**Features:**
- Edit, Duplicate, Publish/Unpublish, Archive, Delete, Export actions
- Confirmation dialogs for destructive actions
- Keyboard shortcuts (⌘E, ⌘D, ⌘P, etc.)
- Status-based action visibility
- Toast notifications
- Loading states

**Usage:**

```tsx
import { FunnelActions } from "@/components/funnel";

<FunnelActions
  funnel={funnel}
  onEdit={handleEdit}
  onDuplicate={handleDuplicate}
  onPublish={handlePublish}
  onUnpublish={handleUnpublish}
  onArchive={handleArchive}
  onDelete={handleDelete}
  onExport={handleExport}
  showShortcuts={true}
/>
```

**Keyboard Shortcuts:**
- `⌘E` - Edit funnel
- `⌘D` - Duplicate funnel
- `⌘P` - Publish funnel
- `⌘U` - Unpublish funnel
- `⌘⇧E` - Export funnel
- `⌘⇧A` - Archive funnel
- `⌘⌫` - Delete funnel

### FunnelPropertyPanel

Property inspector for the funnel editor. Displays funnel metadata in organized, collapsible sections.

**Features:**
- Collapsible sections (Basic Info, Statistics, System Metadata)
- Displays funnel name, description, status, tags
- Shows performance metrics (views, conversion rate, revenue)
- System information (IDs, timestamps, owner)
- Uses ThingMetadata pattern for consistency with ontology UI

**Usage:**

```tsx
import { FunnelPropertyPanel } from '@/components/funnel';
import type { Thing } from '@/components/ontology-ui/types';

const funnel: Thing = {
  _id: "funnel_123",
  _creationTime: Date.now(),
  type: "content",
  name: "Product Launch Funnel",
  description: "High-converting funnel for product launches",
  groupId: "g_123",
  ownerId: "t_456",
  status: "published",
  tags: ["ecommerce", "launch"],
  metadata: {
    viewCount: 12845,
    conversionRate: 0.0876,
    revenue: 45678.90,
    stepCount: 5,
    publishedAt: Date.now(),
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

<FunnelPropertyPanel funnel={funnel} />
```

**In Astro Pages:**

```astro
---
import { FunnelPropertyPanel } from '@/components/funnel';
const funnel = await getFunnel(id);
---

<div class="property-panel">
  <FunnelPropertyPanel funnel={funnel} client:load />
</div>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `funnel` | `Thing` | Yes | The funnel thing object |
| `className` | `string` | No | Additional CSS classes |

**Metadata Fields:**

The component recognizes these metadata fields:
- `viewCount` - Total funnel views
- `conversionRate` - Conversion rate (0-1)
- `revenue` - Total revenue generated
- `stepCount` - Number of funnel steps
- `publishedAt` - First publish timestamp
- `lastPublishedAt` - Most recent publish timestamp

Any additional metadata fields will be displayed in the "Custom Metadata" section.

**Sections:**

1. **Basic Information** (expanded by default)
   - Name, description, step count, tags

2. **Publish Status** (NEW - Cycle 39)
   - Interactive status toggle for publish/unpublish
   - See FunnelStatusToggle component below

3. **Statistics** (expanded by default)
   - Views, conversion rate, revenue, publish dates

4. **System Metadata** (collapsed by default)
   - Thing ID, Group ID, Owner ID
   - Created, updated, and creation timestamps

### FunnelStatusToggle

Displays the current status of a funnel with a publish/unpublish toggle.

**Features:**
- Visual status indicators (Draft, Published, Archived)
- Toggle switch for publish/unpublish
- Validation before publish (must have at least 1 step)
- Shows publish timestamp
- Confirmation dialog for unpublish
- Loading states
- Toast notifications

**Usage:**

```tsx
import { FunnelStatusToggle } from '@/components/funnel';

function FunnelHeader({ funnel }) {
  return (
    <div>
      <h1>{funnel.name}</h1>

      <FunnelStatusToggle
        funnelId={funnel._id}
        status={funnel.status}
        stepCount={funnel.properties.stepCount}
        updatedAt={funnel.updatedAt}
        onStatusChange={(newStatus) => {
          console.log('Status changed to:', newStatus);
        }}
      />
    </div>
  );
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `funnelId` | `Id<"things">` | Yes | Convex ID of the funnel |
| `status` | `"draft" \| "active" \| "published" \| "archived"` | Yes | Current status |
| `stepCount` | `number` | No | Number of steps (defaults to 0) |
| `updatedAt` | `number` | Yes | Last update timestamp |
| `onStatusChange` | `(newStatus: string) => void` | No | Callback when status changes |

**Status States:**

- **Draft** (Gray) - Initial state, not published
- **Active** (Blue) - Active but not published
- **Published** (Green) - Live and accepting visitors
- **Archived** (Red) - No longer active

**Validation:**

The component validates that a funnel has at least one step before allowing publish. If validation fails, it shows:
1. Toast notification with error message
2. Visual warning banner below the toggle

**Confirmation:**

When unpublishing, the component shows an AlertDialog to confirm the action, explaining that:
- The funnel will go offline
- Visitors will no longer be able to access it
- The funnel can be republished at any time

**Backend Integration:**

Uses Convex mutations:
- `api.mutations.funnels.publish` - Publish a funnel
- `api.mutations.funnels.unpublish` - Unpublish a funnel

Both mutations handle:
- Authentication
- Authorization (org_owner or platform_owner only)
- Validation
- Event logging
- Group scoping

## Integration Examples

See complete integration examples with Convex, Astro pages, and ThingCard below.

### Example: Funnel Editor Page

The FunnelPropertyPanel is integrated into the funnel editor:

```
/web/src/pages/funnels/[id]/edit.astro
```

This demonstrates:
- Main editor area with canvas placeholder
- Property panel in right sidebar (80px width)
- Mock funnel data structure
- Responsive layout

## Related

- **Cycle 35**: Create Funnel Property Panel
- **Plan**: `/one/things/plans/clickfunnels-builder-100-cycles.md`
- **Ontology UI**: `/web/src/components/ontology-ui/`
- **ThingMetadata**: `/web/src/components/ontology-ui/things/ThingMetadata.tsx`
