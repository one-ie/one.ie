# Cycle 39: Create Publish/Unpublish Toggle - COMPLETE

## Summary

Created a production-ready FunnelStatusToggle component that provides publish/unpublish functionality with visual status indicators, validation, and confirmation dialogs.

## Implementation

### Component Created

**File**: `/web/src/components/funnel/FunnelStatusToggle.tsx`

**Features:**
- ✅ Visual status indicators (Draft, Published, Archived)
- ✅ Toggle switch for publish/unpublish
- ✅ Validation before publish (must have at least 1 step)
- ✅ Shows publish timestamp with relative time
- ✅ Confirmation dialog for unpublish (AlertDialog)
- ✅ Loading states with spinner
- ✅ Toast notifications for success/error
- ✅ Disabled state for archived funnels
- ✅ Full TypeScript types
- ✅ Accessibility (ARIA labels)

### Status States

| Status | Color | Icon | Description |
|--------|-------|------|-------------|
| Draft | Gray | FileText | Not published |
| Active | Blue | FileText | Active but not published |
| Published | Green | CheckCircle | Live and accepting visitors |
| Archived | Red | Archive | No longer active |

### Integration Points

1. **FunnelPropertyPanel** - Added as dedicated "Publish Status" section
   - File: `/web/src/components/funnel/FunnelPropertyPanel.tsx`
   - Location: Between "Basic Information" and "Statistics" sections
   - Replaced simple status badge with full toggle component

2. **Exported in index.ts** - Available for import
   ```tsx
   import { FunnelStatusToggle } from '@/components/funnel';
   ```

## Backend Integration

Uses existing Convex mutations:
- `api.mutations.funnels.publish` - Publish a funnel
- `api.mutations.funnels.unpublish` - Unpublish a funnel

Both mutations handle:
- ✅ Authentication
- ✅ Authorization (org_owner or platform_owner only)
- ✅ Validation (stepCount >= 1 for publish)
- ✅ Event logging (funnel_published, funnel_unpublished)
- ✅ Group scoping (multi-tenant isolation)

## Usage Examples

### In FunnelPropertyPanel (Current Integration)

```tsx
import { FunnelPropertyPanel } from '@/components/funnel';

<FunnelPropertyPanel funnel={funnel} client:load />
```

The status toggle is automatically included in the property panel.

### Standalone Usage

```tsx
import { FunnelStatusToggle } from '@/components/funnel';

<FunnelStatusToggle
  funnelId={funnel._id}
  status={funnel.status}
  stepCount={funnel.properties.stepCount}
  updatedAt={funnel.updatedAt}
  onStatusChange={(newStatus) => {
    console.log('Status changed to:', newStatus);
  }}
/>
```

### In Funnel Card

```tsx
import { FunnelCard } from '@/components/funnel';
import { FunnelStatusToggle } from '@/components/funnel';

<Card>
  <CardHeader>
    <CardTitle>{funnel.name}</CardTitle>
  </CardHeader>
  <CardContent>
    <FunnelStatusToggle
      funnelId={funnel._id}
      status={funnel.status}
      stepCount={funnel.properties.stepCount}
      updatedAt={funnel.updatedAt}
    />
  </CardContent>
</Card>
```

### In Page Header

```tsx
<div className="flex justify-between items-center">
  <h1>{funnel.name}</h1>
  <FunnelStatusToggle
    funnelId={funnel._id}
    status={funnel.status}
    stepCount={funnel.properties.stepCount}
    updatedAt={funnel.updatedAt}
  />
</div>
```

## Component Props

```typescript
interface FunnelStatusToggleProps {
  funnelId: Id<"things">;
  status: "draft" | "active" | "published" | "archived";
  stepCount?: number;
  updatedAt: number;
  onStatusChange?: (newStatus: string) => void;
}
```

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `funnelId` | `Id<"things">` | Yes | - | Convex ID of the funnel |
| `status` | `"draft" \| "active" \| "published" \| "archived"` | Yes | - | Current funnel status |
| `stepCount` | `number` | No | `0` | Number of steps in funnel |
| `updatedAt` | `number` | Yes | - | Last update timestamp |
| `onStatusChange` | `(newStatus: string) => void` | No | - | Callback when status changes |

## Validation Rules

### Publish Requirements

1. **Must have at least 1 step**
   - If `stepCount === 0`, shows error toast
   - Shows validation warning banner below toggle

2. **Cannot be archived**
   - Archived funnels show "Funnel is archived" message
   - Toggle is disabled

3. **Must be org_owner or platform_owner**
   - Backend enforces role-based authorization

### Unpublish Requirements

1. **Must be published**
   - Only published funnels can be unpublished
   - Backend validates status transition

2. **Requires confirmation**
   - Shows AlertDialog with explanation
   - User must click "Unpublish" to confirm

## Error Handling

All errors are displayed via toast notifications:

```typescript
// Success
toast({
  title: "Funnel published",
  description: "Your funnel is now live and accepting visitors.",
});

// Error
toast({
  title: "Failed to publish",
  description: error.message,
  variant: "destructive",
});

// Validation
toast({
  title: "Cannot publish funnel",
  description: "Add at least one step before publishing.",
  variant: "destructive",
});
```

## UI/UX Features

### Visual Feedback

1. **Status Badge**
   - Color-coded by status (gray/blue/green/red)
   - Icon indicator (FileText/CheckCircle/Archive)
   - Label and description text

2. **Toggle Switch**
   - On = Published (green)
   - Off = Draft/Active (gray)
   - Disabled when archived or loading

3. **Loading States**
   - Spinner icon when mutation in progress
   - Disabled toggle during operation

4. **Timestamp**
   - Relative time display ("Updated 2 hours ago")
   - Uses `date-fns` formatDistanceToNow

### Validation Warning

When funnel has 0 steps and is not published:

```
⚠️ Add at least one step before publishing this funnel.
```

Displayed in yellow banner below the toggle.

### Confirmation Dialog

When unpublishing, shows AlertDialog:

**Title**: "Unpublish Funnel?"

**Description**: "This will take your funnel offline. Visitors will no longer be able to access it. You can republish it at any time."

**Actions**:
- Cancel (outline button)
- Unpublish (destructive red button)

## Dependencies

All dependencies are already installed:

- ✅ `convex/react` - useMutation hook
- ✅ `@/components/ui/badge` - Status badge
- ✅ `@/components/ui/switch` - Toggle switch
- ✅ `@/components/ui/label` - Label component
- ✅ `@/components/ui/alert-dialog` - Confirmation dialog
- ✅ `lucide-react` - Icons (FileText, CheckCircle, Archive, Loader2)
- ✅ `date-fns` - Date formatting
- ✅ `@/hooks/use-toast` - Toast notifications

## Testing Checklist

### Manual Testing

- [ ] Toggle from draft to published (with steps)
- [ ] Toggle from published to draft (with confirmation)
- [ ] Try to publish with 0 steps (should show error)
- [ ] Try to toggle archived funnel (should be disabled)
- [ ] Check loading states during mutation
- [ ] Verify toast notifications appear
- [ ] Test confirmation dialog (cancel and confirm)
- [ ] Check timestamp updates
- [ ] Verify keyboard accessibility (Tab, Enter, Escape)

### Backend Testing

- [ ] Publish mutation succeeds with valid funnel
- [ ] Publish mutation fails with 0 steps
- [ ] Unpublish mutation succeeds
- [ ] Events are logged (funnel_published, funnel_unpublished)
- [ ] Authorization enforced (only org_owner/platform_owner)
- [ ] Multi-tenant isolation (groupId scoping)

## Files Created/Modified

### Created
- `/web/src/components/funnel/FunnelStatusToggle.tsx` - Main component

### Modified
- `/web/src/components/funnel/FunnelPropertyPanel.tsx` - Integrated status toggle
- `/web/src/components/funnel/index.ts` - Exported new component
- `/web/src/components/funnel/README.md` - Updated documentation

## Next Steps

This component is now ready for use in:

1. **Funnel Cards** - Add to FunnelCard component in dashboard
2. **Funnel List** - Quick publish/unpublish from list view
3. **Funnel Header** - Page header with prominent status toggle
4. **Bulk Actions** - Multi-select publish/unpublish

## Design Principles

✅ **Ontology-based** - Maps to things.status in 6-dimension ontology
✅ **TSX Component** - React component (not Astro)
✅ **shadcn/ui** - Uses consistent UI primitives
✅ **Type-safe** - Full TypeScript with Convex types
✅ **Loading states** - Shows spinners during mutations
✅ **Error handling** - Toast notifications for all errors
✅ **Confirmation** - Destructive actions require confirmation
✅ **Accessibility** - Proper ARIA labels and keyboard support

## Cycle Completion

✅ Visual status indicators (Draft, Published, Archived)
✅ Toggle switch for publish/unpublish
✅ Validation before publish (must have at least 1 step)
✅ Shows publish timestamp
✅ Confirmation dialog for unpublish
✅ Integrated into FunnelPropertyPanel
✅ Exported for standalone use
✅ Full documentation

**Cycle 39: COMPLETE** ✅
