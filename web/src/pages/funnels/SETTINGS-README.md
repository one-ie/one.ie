# Funnel Settings Editor - Implementation Guide

## Overview

The Funnel Settings Editor provides a comprehensive interface for editing funnel metadata, settings, SEO configuration, tracking codes, and design customization.

## Files Created

### 1. Schema & Validation (`/web/src/lib/schemas/funnel-schema.ts`)

Defines the funnel data structure and validation rules:

```typescript
interface FunnelProperties {
  // Metadata
  name: string;
  slug: string;
  description?: string;

  // Settings
  domain?: string;
  customDomain?: string;

  // Tracking
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  customHeadCode?: string;
  customBodyCode?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;

  // Design
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  secondaryColor?: string;

  // Configuration
  enableComments?: boolean;
  enableAnalytics?: boolean;
  requireAuth?: boolean;

  // Status
  status: "draft" | "published" | "archived" | "paused";
  publishedAt?: number;
}
```

#### Validation Functions

- **validateFunnelProperties**: Validates complete funnel properties using Zod schema
- **validateSlugUniqueness**: Checks if slug is available (needs backend integration)
- **generateSlugFromName**: Auto-generates URL-friendly slug from name
- **validateGoogleAnalyticsId**: Validates GA4 or Universal Analytics format
- **validateFacebookPixelId**: Validates 15-16 digit numeric ID

#### Helper Functions

- **isFunnelPublished**: Check if funnel is published
- **canEditFunnel**: Check if funnel can be edited
- **getFunnelUrl**: Generate complete funnel URL

### 2. Editor Component (`/web/src/components/features/funnels/FunnelSettingsEditor.tsx`)

React component with the following features:

#### Features

1. **Real-time Validation**
   - Field-level validation on every change
   - Error messages displayed inline
   - Custom validators for tracking IDs

2. **Auto-save**
   - Configurable delay (default 1000ms)
   - Debounced to prevent excessive saves
   - Visual save status indicator

3. **Tabbed Interface**
   - **Metadata**: Name, slug, description
   - **Settings**: Domain, feature toggles, status
   - **SEO**: Meta tags, OG image
   - **Tracking**: Analytics codes, custom scripts
   - **Design**: Theme, colors

4. **Smart Slug Generation**
   - Auto-generates from name
   - Manual override supported
   - "Generate" button for regeneration

5. **Save Status Indicator**
   - Idle: No indicator
   - Saving: Loading spinner
   - Saved: Green checkmark (2s)
   - Error: Red alert icon

#### Props

```typescript
interface FunnelSettingsEditorProps {
  funnel: Thing & { properties: FunnelProperties };
  onSave?: (data: Partial<FunnelProperties>) => Promise<void>;
  autoSave?: boolean; // Default: true
  autoSaveDelay?: number; // Default: 1000ms
}
```

#### Usage

```tsx
import { FunnelSettingsEditor } from '@/components/features/funnels/FunnelSettingsEditor';

<FunnelSettingsEditor
  funnel={funnelData}
  onSave={handleSave}
  autoSave={true}
  autoSaveDelay={1000}
  client:load
/>
```

### 3. Settings Page (`/web/src/pages/funnels/[id]/settings.astro`)

Astro page that integrates the editor:

#### Features

- Breadcrumb navigation
- Page header with description
- Funnel info cards (ID, created date, owner)
- Quick action buttons (View, Edit Builder, Analytics)
- Mock data for demonstration (TODO: Replace with real data)

#### URL Structure

```
/funnels/[id]/settings
```

Example: `/funnels/funnel_123/settings`

## Implementation Status

### ✅ Completed

- [x] Funnel schema with Zod validation
- [x] Validation rules for all fields
- [x] Custom validators (GA, Facebook Pixel)
- [x] Slug generation utility
- [x] FunnelSettingsEditor component
- [x] Real-time field validation
- [x] Auto-save with debouncing
- [x] Save status indicator
- [x] Tabbed interface (5 tabs)
- [x] Settings page with layout
- [x] Breadcrumb navigation
- [x] Info cards and quick actions

### 🔄 TODO (Backend Integration)

- [ ] Replace mock data with real funnel fetch
- [ ] Implement Convex mutation for saving settings
- [ ] Add slug uniqueness check (database query)
- [ ] Add error handling for save failures
- [ ] Add optimistic updates
- [ ] Add undo/redo functionality
- [ ] Add change history/audit log

## Backend Integration Guide

### Step 1: Create Convex Mutation

Create `/backend/convex/mutations/funnels.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateSettings = mutation({
  args: {
    funnelId: v.id("things"),
    properties: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      // ... all other properties
    }),
  },
  handler: async (ctx, { funnelId, properties }) => {
    // Validate user has permission to edit funnel
    // Update funnel properties
    // Log event
    await ctx.db.patch(funnelId, {
      properties: {
        ...(await ctx.db.get(funnelId))?.properties,
        ...properties,
      },
    });

    return { success: true };
  },
});
```

### Step 2: Update Settings Page

Replace mock data with real fetch:

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const { id } = Astro.params;

// Fetch real funnel data
const funnel = await convex.query(api.queries.funnels.get, {
  id: id as Id<"things">,
});

if (!funnel) {
  return Astro.redirect('/404');
}
---
```

### Step 3: Implement Save Handler

Add save handler to FunnelSettingsEditor:

```typescript
const handleSave = async (properties: Partial<FunnelProperties>) => {
  const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

  await convex.mutation(api.mutations.funnels.updateSettings, {
    funnelId: funnel._id,
    properties,
  });
};
```

## Validation Rules

### Name
- Required
- 1-200 characters
- No special validation

### Slug
- Required
- 3-100 characters
- Lowercase letters, numbers, hyphens only
- Cannot start or end with hyphen
- Auto-generated from name

### Description
- Optional
- Max 500 characters

### Domain
- Optional
- Valid domain format
- Regex: `/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/`

### Google Analytics ID
- Optional
- Format: `G-XXXXXXXXXX` (GA4) or `UA-XXXXXXXX-X` (Universal)

### Facebook Pixel ID
- Optional
- Format: 15-16 digit number

### Colors
- Optional
- Format: `#RGB` or `#RRGGBB`
- Hex color codes only

### Meta Title
- Optional
- Recommended: Under 60 characters for SEO

### Meta Description
- Optional
- Recommended: Under 160 characters for SEO

### Custom Code
- Optional
- Max 10,000 characters
- No validation of code content

## UI Components Used

All components from shadcn/ui:

- `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardDescription`
- `Input`, `Label`, `Textarea`
- `Button`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Switch`
- `Badge`

Icons from `lucide-react`:

- `AlertCircle`, `Check`, `Loader2`, `ExternalLink`

## Testing

### Manual Testing Checklist

- [ ] Load settings page for funnel
- [ ] Edit name field → slug auto-updates
- [ ] Edit slug manually → no longer auto-updates
- [ ] Click "Generate" button → slug regenerates from name
- [ ] Add invalid slug (spaces, uppercase) → error shown
- [ ] Add Google Analytics ID (valid format) → saves successfully
- [ ] Add invalid GA ID → error shown
- [ ] Add Facebook Pixel ID (valid format) → saves successfully
- [ ] Add invalid Pixel ID → error shown
- [ ] Toggle switches → changes save
- [ ] Change status dropdown → saves
- [ ] Edit meta title → character counter updates
- [ ] Edit meta description → character counter updates
- [ ] Select color picker → hex value updates
- [ ] Type hex value → color picker updates
- [ ] Save status indicator shows during save
- [ ] Success indicator shows after save
- [ ] Changes persist after page reload

### Unit Tests (TODO)

```typescript
// Test slug generation
expect(generateSlugFromName("My Awesome Funnel")).toBe("my-awesome-funnel");
expect(generateSlugFromName("Hello   World!")).toBe("hello-world");

// Test validation
expect(validateGoogleAnalyticsId("G-ABC123XYZ")).toBe(true);
expect(validateGoogleAnalyticsId("UA-12345-1")).toBe(true);
expect(validateGoogleAnalyticsId("invalid")).toBe(false);

expect(validateFacebookPixelId("123456789012345")).toBe(true);
expect(validateFacebookPixelId("12345")).toBe(false);
```

## Performance Considerations

1. **Auto-save Debouncing**: Prevents excessive save operations
2. **Field-level Validation**: Only validates changed field, not entire form
3. **Partial Updates**: Only sends changed fields to backend
4. **Lazy Loading**: Editor component uses `client:load` (could use `client:idle`)

## Accessibility

- [ ] All form fields have labels
- [ ] Error messages are announced to screen readers
- [ ] Color picker has keyboard navigation
- [ ] Tab order is logical
- [ ] Focus management on error states

## Future Enhancements

### Phase 1 (Current Implementation)
- ✅ Basic settings editor
- ✅ Auto-save
- ✅ Validation

### Phase 2 (Next Steps)
- [ ] Slug availability check in real-time
- [ ] Preview funnel URL before save
- [ ] Undo/redo functionality
- [ ] Unsaved changes warning

### Phase 3 (Advanced)
- [ ] Change history/audit log
- [ ] Collaborative editing (real-time)
- [ ] Template presets for SEO/tracking
- [ ] A/B testing configuration
- [ ] Advanced analytics integration

## Architecture Alignment

### 6-Dimension Ontology Mapping

- **Thing**: Funnel is a Thing with `type: "funnel"`
- **Group**: Funnel belongs to a group (`groupId`)
- **Owner**: Funnel has an owner (`ownerId`)
- **Events**: All changes logged as events
- **Connections**: Funnel connects to pages, steps, etc.
- **Knowledge**: SEO metadata stored as knowledge

### Progressive Complexity

- **Layer 1**: ✅ Content + Pages (settings page structure)
- **Layer 2**: ✅ Validation (Zod schema, field validators)
- **Layer 3**: ✅ State (React useState for form state)
- **Layer 4**: ⏳ Multiple Sources (will support API/Convex)
- **Layer 5**: ⏳ Backend (Convex mutations for persistence)

Currently at Layer 3, ready for Layer 4-5 integration.

## Support

For questions or issues:

1. Check this README
2. Review `/one/knowledge/ontology.md` for entity patterns
3. Check `/web/CLAUDE.md` for frontend patterns
4. Review `/web/src/components/CLAUDE.md` for component guidelines

---

**Status**: ✅ Cycle 34 Complete - Ready for backend integration
