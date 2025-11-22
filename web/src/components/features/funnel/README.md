# Funnel Components

Components for building and visualizing ClickFunnels-style marketing funnels.

## Components

### FunnelFlowGraph

A horizontal flow visualization showing funnel steps with conversion rates.

**Features:**
- ✅ Horizontal left-to-right layout
- ✅ Conversion rates displayed on arrows
- ✅ Click nodes to edit
- ✅ Drag and drop to reorder
- ✅ Delete steps
- ✅ Add new steps
- ✅ Overall metrics summary
- ✅ Responsive design

**Props:**

```typescript
interface FunnelFlowGraphProps {
  steps: FunnelStep[];              // Array of funnel steps
  onStepClick?: (step) => void;     // Called when step is clicked
  onStepReorder?: (from, to) => void; // Called when steps are reordered
  onStepDelete?: (stepId) => void;  // Called when step is deleted
  onAddStep?: () => void;           // Called when "Add Step" is clicked
  className?: string;               // Additional CSS classes
  showMetrics?: boolean;            // Show conversion metrics (default: true)
  editable?: boolean;               // Enable editing features (default: true)
}

interface FunnelStep extends Thing {
  order: number;                    // Step order in sequence (1, 2, 3...)
  conversionRate?: number;          // Conversion rate percentage
  visitors?: number;                // Number of visitors
  conversions?: number;             // Number of conversions
}
```

**Usage:**

```tsx
import { FunnelFlowGraph } from "@/components/features/funnel";

export function MyFunnelPage() {
  const steps = [
    {
      _id: "step1",
      name: "Landing Page",
      order: 1,
      visitors: 10000,
      conversions: 5000,
      conversionRate: 50.0,
    },
    // ... more steps
  ];

  const handleStepClick = (step) => {
    console.log("Edit step:", step);
    // Open edit modal
  };

  const handleReorder = (fromIndex, toIndex) => {
    // Save new order to backend
  };

  return (
    <FunnelFlowGraph
      steps={steps}
      onStepClick={handleStepClick}
      onStepReorder={handleReorder}
      showMetrics={true}
      editable={true}
    />
  );
}
```

### FunnelFlowExample

Example implementation showing how to integrate with Convex backend.

**Usage:**

```tsx
import { FunnelFlowExample } from "@/components/features/funnel";

// In your Astro page
<FunnelFlowExample funnelId={id} client:load />
```

## Integration with Convex

### 1. Create Backend Queries

```typescript
// backend/convex/queries/funnels.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSteps = query({
  args: { funnelId: v.id("things") },
  handler: async (ctx, args) => {
    const steps = await ctx.db
      .query("things")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "funnel_step"),
          q.eq(q.field("metadata.funnelId"), args.funnelId)
        )
      )
      .collect();

    return steps.sort((a, b) => a.metadata.order - b.metadata.order);
  },
});
```

### 2. Create Backend Mutations

```typescript
// backend/convex/mutations/funnels.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const reorderSteps = mutation({
  args: {
    funnelId: v.id("things"),
    steps: v.array(
      v.object({
        id: v.id("things"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const step of args.steps) {
      await ctx.db.patch(step.id, {
        metadata: { order: step.order },
      });
    }
  },
});

export const deleteStep = mutation({
  args: { stepId: v.id("things") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.stepId);
  },
});
```

### 3. Use in Component

```tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FunnelFlowGraph } from "@/components/features/funnel";

export function LiveFunnelFlow({ funnelId }) {
  const steps = useQuery(api.queries.funnels.getSteps, { funnelId });
  const reorderSteps = useMutation(api.mutations.funnels.reorderSteps);
  const deleteStep = useMutation(api.mutations.funnels.deleteStep);

  const handleReorder = async (fromIndex, toIndex) => {
    const newSteps = [...steps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);

    await reorderSteps({
      funnelId,
      steps: newSteps.map((s, i) => ({ id: s._id, order: i + 1 })),
    });
  };

  const handleDelete = async (stepId) => {
    await deleteStep({ stepId });
  };

  if (!steps) return <div>Loading...</div>;

  return (
    <FunnelFlowGraph
      steps={steps}
      onStepReorder={handleReorder}
      onStepDelete={handleDelete}
    />
  );
}
```

## Styling

The component uses:
- **Tailwind CSS v4** for styling
- **shadcn/ui** components (Card, Button, Badge)
- **lucide-react** icons (GripVertical, Edit, Trash2, Plus)

All styles are customizable via the `className` prop and Tailwind theme.

## Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Screen reader friendly
- ✅ Focus states on all buttons

## Mobile Responsive

- Horizontal scrolling on small screens
- Touch-friendly drag and drop
- Responsive text sizing
- Collapsible metrics on mobile

## Future Enhancements

- [ ] Vertical layout option
- [ ] Animation between reorders
- [ ] Undo/redo functionality
- [ ] Export to image
- [ ] Advanced analytics overlay
- [ ] A/B test comparison view
- [ ] Real-time collaboration
- [ ] Step templates library

## Related Components

- **ConnectionGraph** - Generic node/edge graph visualization
- **NetworkGraph** - Force-directed network visualization
- **ThingCard** - Generic thing renderer for ontology

## License

Part of ONE Platform - 6-Dimension Ontology UI Components
