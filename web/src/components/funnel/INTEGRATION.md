# FunnelActions Integration Guide

Complete guide for integrating the FunnelActions component into your funnel builder.

## Quick Start

```tsx
import { FunnelActions } from "@/components/funnel";

<FunnelActions
  funnel={funnel}
  onEdit={handleEdit}
  onDuplicate={handleDuplicate}
  onPublish={handlePublish}
  onDelete={handleDelete}
  showShortcuts={true}
/>
```

## Integration Patterns

### 1. With ThingCard (Ontology Pattern)

Integrate FunnelActions into the existing ThingCard component:

```tsx
import { ThingCard } from "@/components/ontology-ui/things";
import { FunnelActions } from "@/components/funnel";

export function FunnelThingCard({ funnel }: { funnel: Thing }) {
  return (
    <ThingCard thing={funnel} type="funnel">
      <div className="absolute top-2 right-2">
        <FunnelActions
          funnel={funnel}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onPublish={handlePublish}
          onDelete={handleDelete}
        />
      </div>
    </ThingCard>
  );
}
```

### 2. In Funnel Detail Page Header

```astro
---
// src/pages/funnels/[id].astro
import Layout from '@/layouts/Layout.astro';
import { FunnelActionsExample } from '@/components/funnel/FunnelActionsExample';

const { id } = Astro.params;
const funnel = await getFunnel(id);
---

<Layout title={funnel.name}>
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold">{funnel.name}</h1>
      <p class="text-muted-foreground">{funnel.description}</p>
    </div>
    <FunnelActionsExample client:load funnel={funnel} />
  </div>

  <!-- Funnel builder canvas -->
</Layout>
```

### 3. In Funnels List/Grid

```tsx
import { FunnelCard } from "@/components/funnel";

export function FunnelsList({ funnels }: { funnels: Thing[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {funnels.map(funnel => (
        <FunnelCard
          key={funnel._id}
          funnel={funnel}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onPublish={handlePublish}
          onDelete={handleDelete}
          onClick={(f) => router.push(`/funnels/${f._id}`)}
        />
      ))}
    </div>
  );
}
```

### 4. With Convex Real-Time Updates

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FunnelActions } from "@/components/funnel";

export function FunnelActionsWithConvex({ funnel }: { funnel: Thing }) {
  const updateFunnel = useMutation(api.mutations.funnels.update);
  const deleteFunnel = useMutation(api.mutations.funnels.delete);
  const duplicateFunnel = useMutation(api.mutations.funnels.duplicate);

  return (
    <FunnelActions
      funnel={funnel}
      onEdit={() => router.push(`/funnels/${funnel._id}/edit`)}
      onDuplicate={async (f) => {
        const newFunnel = await duplicateFunnel({
          funnelId: f._id,
          name: `${f.name} (Copy)`,
        });
        router.push(`/funnels/${newFunnel._id}`);
      }}
      onPublish={async (f) => {
        await updateFunnel({ id: f._id, status: "published" });
      }}
      onUnpublish={async (f) => {
        await updateFunnel({ id: f._id, status: "draft" });
      }}
      onArchive={async (f) => {
        await updateFunnel({ id: f._id, status: "archived" });
      }}
      onDelete={async (f) => {
        await deleteFunnel({ id: f._id });
        router.push("/funnels");
      }}
      onExport={async (f) => {
        const data = await exportFunnel(f._id);
        downloadJSON(data, `${f.name}.json`);
      }}
    />
  );
}
```

## Keyboard Shortcuts

All shortcuts use Command (⌘) on Mac or Ctrl on Windows/Linux:

| Shortcut | Action | Confirmation Required |
|----------|--------|----------------------|
| ⌘E | Edit funnel | No |
| ⌘D | Duplicate funnel | No |
| ⌘P | Publish funnel | Yes |
| ⌘U | Unpublish funnel | Yes |
| ⌘⇧E | Export funnel | No |
| ⌘⇧A | Archive funnel | Yes |
| ⌘⌫ | Delete funnel | Yes |

**To disable shortcuts:** Set `showShortcuts={false}` prop.

## Status-Based Action Visibility

Actions automatically show/hide based on funnel status:

### Draft Funnels
- ✓ Edit
- ✓ Duplicate
- ✓ Publish
- ✗ Unpublish
- ✓ Archive
- ✓ Delete
- ✓ Export

### Published Funnels
- ✓ Edit
- ✓ Duplicate
- ✗ Publish
- ✓ Unpublish
- ✓ Archive
- ✓ Delete
- ✓ Export

### Archived Funnels
- ✗ Edit (disabled)
- ✓ Duplicate
- ✗ Publish
- ✗ Unpublish
- ✗ Archive
- ✓ Delete
- ✓ Export

## Confirmation Dialogs

Destructive and critical actions require confirmation:

### Publish
**Title:** "Publish funnel?"
**Description:** "This will make [name] publicly accessible. Are you sure you want to continue?"

### Unpublish
**Title:** "Unpublish funnel?"
**Description:** "This will make [name] private and inaccessible to visitors. Are you sure?"

### Archive
**Title:** "Archive funnel?"
**Description:** "This will archive [name]. You can restore it later from the archived funnels section."

### Delete
**Title:** "Delete funnel permanently?"
**Description:** "This will permanently delete [name]. This action cannot be undone."

## Toast Notifications

All actions provide feedback:

- **Success:** Green toast with action confirmation
- **Error:** Red toast with error message
- **Info:** Blue toast for export start

## Custom Actions

You can customize individual actions or add your own:

```tsx
import { FunnelActions, type FunnelAction } from "@/components/funnel";

// Custom action
const customAction: FunnelAction = {
  id: "clone-to-template",
  label: "Save as Template",
  icon: Save,
  onClick: async () => {
    await saveAsTemplate(funnel);
  },
  shortcut: "⌘T",
  variant: "default",
  confirm: true,
  confirmTitle: "Save as template?",
  confirmDescription: "This will create a reusable template from this funnel.",
};
```

## Permission-Based Visibility

Control which actions are available based on user permissions:

```tsx
export function PermissionAwareFunnelActions({ 
  funnel, 
  userRole 
}: { 
  funnel: Thing; 
  userRole: UserRole;
}) {
  const canEdit = userRole === "org_owner" || userRole === "org_user";
  const canDelete = userRole === "org_owner";
  const canPublish = userRole === "org_owner";

  return (
    <FunnelActions
      funnel={funnel}
      onEdit={canEdit ? handleEdit : undefined}
      onDuplicate={handleDuplicate} // Everyone can duplicate
      onPublish={canPublish ? handlePublish : undefined}
      onUnpublish={canPublish ? handleUnpublish : undefined}
      onArchive={canEdit ? handleArchive : undefined}
      onDelete={canDelete ? handleDelete : undefined}
      onExport={handleExport} // Everyone can export
    />
  );
}
```

## Error Handling

FunnelActions automatically handles errors and displays toast notifications:

```tsx
const handlePublish = async (funnel: Thing) => {
  // Throw error - FunnelActions will catch and show toast
  if (!funnel.metadata.steps || funnel.metadata.steps.length === 0) {
    throw new Error("Cannot publish funnel without steps");
  }

  await updateFunnel({ id: funnel._id, status: "published" });
};
```

## Loading States

The component disables all actions during execution:

```tsx
// User clicks "Delete"
// 1. Confirmation dialog appears
// 2. User confirms
// 3. All menu items disabled (showing "Processing...")
// 4. Delete executes
// 5. Toast notification shows result
// 6. Menu re-enables
```

## Accessibility

- Full keyboard navigation (Tab, Enter, Escape)
- ARIA labels for screen readers
- Focus management in dialogs
- Disabled state announcements
- Keyboard shortcut hints

## Testing

Example test cases:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { FunnelActions } from './FunnelActions';

describe('FunnelActions', () => {
  it('shows edit action for draft funnels', () => {
    const funnel = { ...mockFunnel, status: 'draft' };
    render(<FunnelActions funnel={funnel} onEdit={jest.fn()} />);
    
    fireEvent.click(screen.getByLabelText('Funnel actions'));
    expect(screen.getByText('Edit Funnel')).toBeInTheDocument();
  });

  it('requires confirmation for delete', async () => {
    const handleDelete = jest.fn();
    render(<FunnelActions funnel={mockFunnel} onDelete={handleDelete} />);
    
    fireEvent.click(screen.getByLabelText('Funnel actions'));
    fireEvent.click(screen.getByText('Delete'));
    
    // Confirmation dialog appears
    expect(screen.getByText('Delete funnel permanently?')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => expect(handleDelete).toHaveBeenCalled());
  });
});
```

## Performance

- Confirmation dialogs are lazy-loaded
- Event listeners cleaned up on unmount
- Prevents multiple simultaneous executions
- Optimized re-renders with React.memo (if needed)

## Migration from ThingActions

If you're currently using the generic ThingActions component:

```tsx
// Before
<ThingActions
  thing={funnel}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onDuplicate={handleDuplicate}
/>

// After (with more features)
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

## Next Steps

1. Implement Convex mutations for funnel operations
2. Add analytics tracking to actions
3. Implement undo/redo for destructive actions
4. Add bulk actions for multiple funnels
5. Create funnel templates system

