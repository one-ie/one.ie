# Template Preview Modal

Comprehensive modal component for previewing funnel templates before using them.

## Features

✅ **Template Overview** - Name, description, category, complexity
✅ **Key Metrics** - Conversion rate, setup time, step count
✅ **Use Cases** - Suggested applications with checkmarks
✅ **Step-by-Step Preview** - Tabbed interface for each funnel step
✅ **Visual Elements** - All page elements with content suggestions
✅ **Color Schemes** - Visual preview of each step's colors
✅ **Best Practices** - Conversion optimization tips
✅ **Quick Actions** - "Use Template" and "Preview Live" buttons

## Installation

The component is already set up and ready to use. It depends on:

- `@/components/ui/dialog` - shadcn/ui Dialog
- `@/components/ui/badge` - shadcn/ui Badge
- `@/components/ui/button` - shadcn/ui Button
- `@/components/ui/separator` - shadcn/ui Separator
- `@/components/ui/tabs` - shadcn/ui Tabs
- `lucide-react` - Icons

## Usage

### Basic Example

```tsx
import { useState } from "react";
import { TemplatePreviewModal } from "@/components/templates/TemplatePreviewModal";
import { leadMagnetBasic } from "@/lib/funnel-templates/templates";

function MyComponent() {
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleUseTemplate = () => {
    // Create funnel from template
    console.log("Using template:", leadMagnetBasic.id);
    setPreviewOpen(false);
  };

  return (
    <>
      <button onClick={() => setPreviewOpen(true)}>
        Preview Template
      </button>

      <TemplatePreviewModal
        template={leadMagnetBasic}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
}
```

### With Live Preview

```tsx
<TemplatePreviewModal
  template={template}
  open={open}
  onOpenChange={setOpen}
  onUseTemplate={handleUseTemplate}
  previewUrl="https://example.com/preview/funnel-123"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `template` | `FunnelTemplate` | Yes | Template data to preview |
| `open` | `boolean` | Yes | Modal open state |
| `onOpenChange` | `(open: boolean) => void` | Yes | Handler for open state changes |
| `onUseTemplate` | `() => void` | No | Handler when user clicks "Use Template" |
| `previewUrl` | `string` | No | URL for "Preview Live" button |

## Component Structure

```
TemplatePreviewModal
├── Header (Name, Description, Badges)
├── Key Metrics (Conversion, Time, Steps)
├── Suggested Use Cases (Grid with checkmarks)
├── Step Tabs
│   ├── Tab Triggers (Step 1, Step 2, ...)
│   └── Tab Contents
│       └── StepPreview
│           ├── Step Header (Icon, Name, Type)
│           ├── Color Scheme Preview
│           ├── Page Elements (Ordered list)
│           └── Best Practices (Checklist)
├── Feature Tags
└── Action Buttons (Use Template, Preview Live)
```

## Files Created

- `/web/src/components/templates/TemplatePreviewModal.tsx` - Main modal component
- `/web/src/components/templates/TemplatePreviewExample.tsx` - Usage example
- `/web/src/components/templates/README.md` - This documentation

---

**Created:** Cycle 52 - Template Preview Modal
**Dependencies:** shadcn/ui components, lucide-react
**Related:** Cycle 51 (Marketplace), Funnel Builder (Cycles 31-50)
