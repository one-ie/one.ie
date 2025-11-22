# Cycle 55: Save Funnel as Template

**Status:** Complete ✅

**Files Created/Modified:**
- `/backend/convex/mutations/funnels.ts` - Added `saveAsTemplate` mutation
- `/web/src/components/templates/SaveAsTemplateModal.tsx` - New component

---

## Summary

Implemented "Save as Template" functionality that allows users to save their funnels as reusable templates for future use.

## Backend Implementation

### New Mutation: `api.mutations.funnels.saveAsTemplate`

**Location:** `/backend/convex/mutations/funnels.ts` (lines 576-742)

**Functionality:**
1. Authenticates user and validates access to funnel
2. Captures complete funnel structure:
   - All funnel steps (from `funnel_step` things)
   - All page elements (from `page_element` things)
   - Step settings and ordering
   - Element properties and positions
3. Creates new `funnel_template` thing with:
   - Template metadata (name, description, category, tags)
   - Visibility control (private/public)
   - Conversion rate benchmark (optional)
   - Complete funnel structure JSON
4. Creates two connections:
   - Ownership: `person` → `funnel_template` (owns)
   - Lineage: `funnel` → `funnel_template` (template_created_from)
5. Logs `template_created` event with full metadata

**Arguments:**
```typescript
{
  funnelId: Id<"things">,           // Source funnel to template
  templateName: string,              // Template name
  description: string,               // Template description
  category: string,                  // Category (lead-gen, webinar, etc.)
  tags: string[],                    // Searchable tags
  visibility: "private" | "public",  // Access control
  conversionRate?: number            // Optional benchmark (0-100)
}
```

**Returns:** `Id<"things">` (the created template ID)

**Access Control:**
- User must have access to the source funnel
- Template is created in user's group
- Private templates: only creator can use
- Public templates: accessible to entire organization

---

## Frontend Implementation

### Component: `SaveAsTemplateModal`

**Location:** `/web/src/components/templates/SaveAsTemplateModal.tsx`

**Features:**
- **Multi-step wizard** (4 steps)
  - Step 1: Template info (name, description, conversion rate)
  - Step 2: Category selection + visibility
  - Step 3: Tags (suggested + custom)
  - Step 4: Review and confirm
- **Progress indicator** - Visual step progress bar
- **Form validation** - Required fields enforced per step
- **Tag management** - Suggested tags + custom tag input
- **Real-time preview** - Review step shows complete template summary
- **Error handling** - Toast notifications for success/failure
- **Loading states** - Disabled controls during save

**Props:**
```typescript
interface SaveAsTemplateModalProps {
  funnelId: Id<"things">;           // Funnel to save as template
  funnelName: string;                // Pre-fill template name
  funnelDescription?: string;        // Pre-fill description
  stepCount: number;                 // Display in preview
  isOpen: boolean;                   // Control modal visibility
  onClose: () => void;               // Called when modal closes
  onSuccess?: (templateId: Id<"things">) => void; // Called after save
}
```

**Categories:**
- `lead-gen` - Lead Generation
- `product-launch` - Product Launch
- `webinar` - Webinar
- `ecommerce` - E-commerce
- `membership` - Membership
- `summit` - Summit/Event
- `other` - Other

**Suggested Tags:**
- `beginner-friendly`
- `high-converting`
- `quick-setup`
- `advanced`
- `automated`
- `interactive`
- `email-list`
- `sales`
- `upsell`
- `subscription`

---

## Usage Example

```tsx
import { useState } from "react";
import { SaveAsTemplateModal } from "@/components/templates/SaveAsTemplateModal";
import { Button } from "@/components/ui/button";

export function FunnelActions({ funnel }) {
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  return (
    <>
      <Button onClick={() => setShowSaveTemplate(true)}>
        Save as Template
      </Button>

      <SaveAsTemplateModal
        funnelId={funnel._id}
        funnelName={funnel.name}
        funnelDescription={funnel.properties?.description}
        stepCount={funnel.properties?.stepCount ?? 0}
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSuccess={(templateId) => {
          console.log("Template created:", templateId);
          // Navigate to templates page or show success message
        }}
      />
    </>
  );
}
```

---

## Data Structure

### Funnel Template Thing

```typescript
{
  _id: Id<"things">,
  type: "funnel_template",
  name: "High-Converting Webinar Funnel",
  groupId: Id<"groups">,
  properties: {
    slug: "high-converting-webinar-funnel",
    description: "Proven webinar funnel with 40% conversion rate...",
    category: "webinar",
    tags: ["high-converting", "automated", "sales"],
    visibility: "public",
    conversionRate: 40,
    originalFunnelId: Id<"things">,
    stepCount: 4,
    funnelStructure: {
      name: "Original Funnel Name",
      description: "...",
      settings: { seo: {...}, tracking: {...} },
      steps: [
        {
          id: Id<"things">,
          name: "Registration Page",
          type: "landing",
          order: 1,
          settings: {...},
          elements: [
            {
              id: Id<"things">,
              type: "headline",
              position: { row: 1, col: 1 },
              properties: {...}
            },
            // ... more elements
          ]
        },
        // ... more steps
      ]
    },
    createdBy: Id<"things">,      // Creator person ID
    createdByName: "John Doe",
    createdAt: timestamp
  },
  status: "published", // or "draft" if private
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Events Logged

**Event Type:** `template_created`

```typescript
{
  type: "template_created",
  actorId: Id<"things">,        // Creator
  targetId: Id<"things">,       // Template
  timestamp: number,
  metadata: {
    groupId: Id<"groups">,
    templateName: string,
    category: string,
    visibility: "private" | "public",
    originalFunnelId: Id<"things">,
    stepCount: number,
    protocol: "clickfunnels-builder"
  }
}
```

### Connections Created

**Ownership:**
```typescript
{
  fromThingId: personId,        // Creator
  toThingId: templateId,        // Template
  relationshipType: "owns",
  metadata: { role: "org_owner" }
}
```

**Lineage:**
```typescript
{
  fromThingId: funnelId,        // Source funnel
  toThingId: templateId,        // Created template
  relationshipType: "template_created_from",
  metadata: { category: "webinar" }
}
```

---

## Benefits

1. **Complete Capture** - All steps, elements, and settings preserved
2. **Reusability** - Use templates to quickly create new funnels
3. **Benchmarking** - Track conversion rates for template comparison
4. **Organization** - Categories and tags for easy discovery
5. **Access Control** - Private vs public visibility
6. **Audit Trail** - Full event logging for compliance
7. **Multi-tenant** - Templates scoped to groups
8. **Pattern Convergence** - Uses existing Thing/Connection/Event ontology

---

## Next Steps / Enhancements

**Immediate (Next Cycle):**
- [ ] Create "Browse Templates" page to view saved templates
- [ ] Add "Create from Template" functionality
- [ ] Template preview/thumbnail generation

**Future:**
- [ ] Template marketplace (share across organizations)
- [ ] Template versioning
- [ ] Template analytics (usage tracking, conversion comparisons)
- [ ] AI-suggested templates based on funnel goals
- [ ] Template export/import (JSON)
- [ ] Template A/B testing

---

## Testing Checklist

**Backend:**
- [x] Mutation authenticates user
- [x] Validates funnel access
- [x] Captures all steps and elements
- [x] Creates funnel_template thing
- [x] Creates ownership and lineage connections
- [x] Logs template_created event
- [x] Handles visibility (private/public)
- [x] Supports optional conversion rate

**Frontend:**
- [x] Modal opens/closes correctly
- [x] Multi-step navigation works
- [x] Form validation per step
- [x] Tag management (add/remove)
- [x] Suggested tags clickable
- [x] Custom tags supported
- [x] Review step shows all data
- [x] Save mutation called correctly
- [x] Success/error toasts shown
- [x] Loading states during save
- [x] Form resets on close

**Integration:**
- [ ] Create template from actual funnel
- [ ] Verify template in database
- [ ] Check connections created
- [ ] Verify event logged
- [ ] Test private vs public visibility
- [ ] Test with conversion rate set
- [ ] Test with/without optional fields

---

## File Locations

```
backend/
└── convex/
    └── mutations/
        └── funnels.ts          # saveAsTemplate mutation (lines 576-742)

web/
└── src/
    └── components/
        └── templates/
            ├── SaveAsTemplateModal.tsx      # New component
            └── CYCLE-55-SUMMARY.md          # This file
```

---

**Built with:**
- Backend: Convex mutations, multi-tenant scoping, event logging
- Frontend: React, shadcn/ui Dialog, multi-step form, Convex hooks
- Ontology: funnel_template thing type, ownership/lineage connections
- Validation: Required fields, category selection, tag management

**Pattern:** Complete capture → Thing creation → Connections → Events → Success

**Cycle 55 Complete! ✅**
