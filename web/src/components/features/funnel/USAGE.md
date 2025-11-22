# FunnelFlowGraph - Quick Start Guide

## Installation

The component is already included in your ONE Platform installation. No additional setup required!

**Dependencies:**
- React 19 ✅
- Tailwind CSS v4 ✅
- shadcn/ui components ✅
- lucide-react (icons) ✅

## Quick Start (3 Steps)

### 1. Import the Component

```tsx
import { FunnelFlowGraph } from "@/components/features/funnel";
```

### 2. Prepare Your Data

```tsx
const steps = [
  {
    _id: "step1",
    type: "content",
    name: "Landing Page",
    order: 1,
    visitors: 10000,
    conversions: 5000,
    // ... other Thing properties
  },
  {
    _id: "step2",
    type: "content",
    name: "Product Page",
    order: 2,
    visitors: 5000,
    conversions: 2500,
  },
  // ... more steps
];
```

### 3. Render the Component

```tsx
<FunnelFlowGraph
  steps={steps}
  onStepClick={(step) => console.log("Clicked:", step)}
  showMetrics={true}
  editable={true}
/>
```

That's it! You now have a fully interactive funnel visualization.

## Common Use Cases

### Read-Only View (No Editing)

```tsx
<FunnelFlowGraph
  steps={steps}
  showMetrics={true}
  editable={false}  // Disable drag, delete, add
/>
```

### With All Handlers

```tsx
<FunnelFlowGraph
  steps={steps}
  onStepClick={handleEdit}
  onStepReorder={handleReorder}
  onStepDelete={handleDelete}
  onAddStep={handleAdd}
  showMetrics={true}
  editable={true}
/>
```

### Hide Metrics (Cleaner View)

```tsx
<FunnelFlowGraph
  steps={steps}
  showMetrics={false}  // Hide visitors, conversions, rates
/>
```

## Integration Examples

### Static Data (Astro Page)

```astro
---
// src/pages/funnels/[id].astro
import { FunnelFlowGraph } from "@/components/features/funnel";
import Layout from "@/layouts/Layout.astro";

// Fetch from content collection or API
const steps = [...];
---

<Layout>
  <FunnelFlowGraph steps={steps} client:load />
</Layout>
```

### Real-Time Data (Convex)

```tsx
// src/components/features/funnel/LiveFunnel.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FunnelFlowGraph } from "./FunnelFlowGraph";

export function LiveFunnel({ funnelId }) {
  const steps = useQuery(api.queries.funnels.getSteps, { funnelId });

  if (!steps) return <div>Loading...</div>;

  return <FunnelFlowGraph steps={steps} />;
}
```

### With State Management

```tsx
import { useState } from "react";
import { FunnelFlowGraph } from "@/components/features/funnel";

export function EditableFunnel() {
  const [steps, setSteps] = useState(initialSteps);

  const handleReorder = (from, to) => {
    const newSteps = [...steps];
    const [moved] = newSteps.splice(from, 1);
    newSteps.splice(to, 0, moved);
    setSteps(newSteps.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <FunnelFlowGraph
      steps={steps}
      onStepReorder={handleReorder}
    />
  );
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `FunnelStep[]` | required | Array of funnel steps |
| `onStepClick` | `(step) => void` | undefined | Called when step clicked |
| `onStepReorder` | `(from, to) => void` | undefined | Called when steps reordered |
| `onStepDelete` | `(id) => void` | undefined | Called when step deleted |
| `onAddStep` | `() => void` | undefined | Called when "Add Step" clicked |
| `className` | `string` | undefined | Additional CSS classes |
| `showMetrics` | `boolean` | true | Show conversion metrics |
| `editable` | `boolean` | true | Enable editing features |

## Data Format

Each step must follow the `Thing` schema with additional funnel properties:

```typescript
interface FunnelStep extends Thing {
  // Required Thing properties
  _id: Id<"things">;
  type: ThingType;
  name: string;
  groupId: Id<"groups">;
  ownerId: Id<"things">;

  // Required funnel properties
  order: number;                 // 1, 2, 3, 4...

  // Optional metrics
  visitors?: number;             // Total visitors to this step
  conversions?: number;          // Visitors who converted
  conversionRate?: number;       // Percentage (calculated or manual)
}
```

## Styling Customization

### Custom Width

```tsx
<FunnelFlowGraph
  steps={steps}
  className="max-w-6xl"
/>
```

### Custom Theme

The component uses Tailwind CSS variables that can be customized in your theme:

```css
/* src/styles/global.css */
@theme {
  --color-primary: 222.2 47.4% 11.2%;
  --color-secondary: 210 40% 96.1%;
  /* ... */
}
```

## Troubleshooting

### Steps not showing?

**Check:**
1. ✅ Steps array is not empty
2. ✅ Each step has an `order` property
3. ✅ Component has `client:load` directive in Astro

### Drag not working?

**Check:**
1. ✅ `editable={true}` is set
2. ✅ `onStepReorder` handler is provided
3. ✅ Browser supports drag events (all modern browsers do)

### Metrics not showing?

**Check:**
1. ✅ `showMetrics={true}` is set
2. ✅ Steps have `visitors` and `conversions` properties
3. ✅ Values are numbers, not strings

## Next Steps

1. **Add Backend Integration** - See [README.md](./README.md#integration-with-convex)
2. **Customize Styling** - Override Tailwind classes
3. **Add Analytics** - Track funnel performance
4. **Build Step Editor** - Modal for editing step details

## Examples

See live examples at:
- `/web/src/pages/funnels/[id]/index.astro` - Funnel detail page
- `/web/src/components/features/funnel/FunnelFlowExample.tsx` - Complete example

## Support

For questions or issues:
- Read the [full README](./README.md)
- Check [ONE Platform docs](/one/knowledge/)
- Review [6-dimension ontology](/one/knowledge/ontology.md)
