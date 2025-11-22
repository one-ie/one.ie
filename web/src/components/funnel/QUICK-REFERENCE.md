# FunnelActions - Quick Reference

## Import

```tsx
import { FunnelActions, FunnelCard } from "@/components/funnel";
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `funnel` | `Thing` | Funnel object (required) |
| `onEdit` | `(funnel: Thing) => void \| Promise<void>` | Edit handler |
| `onDuplicate` | `(funnel: Thing) => void \| Promise<void>` | Duplicate handler |
| `onPublish` | `(funnel: Thing) => void \| Promise<void>` | Publish handler |
| `onUnpublish` | `(funnel: Thing) => void \| Promise<void>` | Unpublish handler |
| `onArchive` | `(funnel: Thing) => void \| Promise<void>` | Archive handler |
| `onDelete` | `(funnel: Thing) => void \| Promise<void>` | Delete handler |
| `onExport` | `(funnel: Thing) => void \| Promise<void>` | Export handler |
| `showShortcuts` | `boolean` | Show keyboard shortcuts (default: true) |
| `className` | `string` | Additional CSS classes |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ⌘E | Edit |
| ⌘D | Duplicate |
| ⌘P | Publish |
| ⌘U | Unpublish |
| ⌘⇧E | Export |
| ⌘⇧A | Archive |
| ⌘⌫ | Delete |

## Usage

```tsx
<FunnelActions
  funnel={funnel}
  onEdit={(f) => router.push(`/funnels/${f._id}/edit`)}
  onDuplicate={handleDuplicate}
  onPublish={handlePublish}
  onDelete={handleDelete}
  showShortcuts={true}
/>
```

## Confirmation Required

- Publish
- Unpublish
- Archive
- Delete

## Toast Notifications

All actions provide automatic toast feedback for success/error states.

## See Also

- Full documentation: `INTEGRATION.md`
- Examples: `FunnelActionsExample.tsx`
- Card component: `FunnelCard.tsx`
