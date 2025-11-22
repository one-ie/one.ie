# Template Sharing Components

**Cycle 59: Template Sharing System**

## Overview

Multi-tenant template sharing with granular permission controls.

## Components

### TemplateShareModal

Share funnel templates with team or publicly.

**Features:**
- ✅ Share visibility: Private, Team, Public
- ✅ Permission controls: View-only, Can-duplicate
- ✅ Shareable URL generation
- ✅ Copy to clipboard
- ✅ Track shares via connections (`shared_template`)
- ✅ Integrates with ThingActions

## Usage

### Basic Usage with ThingActions

```tsx
import { useState } from 'react';
import { ThingActions } from '@/components/ontology-ui/things/ThingActions';
import { TemplateShareModal } from '@/components/features/templates';

function TemplateCard({ template }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleShare = async (visibility, permission) => {
    // 1. Update template properties
    await updateTemplate({
      id: template._id,
      properties: {
        ...template.properties,
        visibility,
        sharePermission: permission,
      },
    });

    // 2. Create connection to track share
    await createConnection({
      fromThingId: currentUserId,
      toThingId: template._id,
      relationshipType: 'shared_template',
      metadata: {
        visibility,
        permission,
        sharedAt: Date.now(),
      },
    });
  };

  return (
    <div>
      <ThingActions
        thing={template}
        onShare={() => setShareModalOpen(true)}
      />

      <TemplateShareModal
        template={template}
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        onShare={handleShare}
      />
    </div>
  );
}
```

### Share Options

**Visibility Levels:**

| Visibility | Icon | Description |
|------------|------|-------------|
| `private` | 🔒 Lock | Only you can access |
| `team` | 👥 Users | Anyone in your organization |
| `public` | 🌐 Globe | Anyone with the link |

**Permissions:**

| Permission | Icon | Description |
|------------|------|-------------|
| `view` | 👁️ Eye | Can view template details only |
| `duplicate` | 📝 FileEdit | Can copy and customize template |

### URL Patterns

The component generates different URL patterns based on visibility:

```typescript
// Private (requires authentication)
/templates/{templateId}?private=true

// Team (requires organization membership)
/team/templates/{templateId}

// Public (open to all)
/templates/{templateId}
```

## Backend Integration

### Update Template Properties

```typescript
// mutations/templates.ts
export const updateShareSettings = mutation({
  args: {
    templateId: v.id("things"),
    visibility: v.union(
      v.literal("private"),
      v.literal("team"),
      v.literal("public")
    ),
    permission: v.union(
      v.literal("view"),
      v.literal("duplicate")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const person = await ctx.db.query("things")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(t => t.properties?.email === identity.email)
      .first();

    if (!person) throw new Error("User not found");

    // 2. Get template and verify ownership
    const template = await ctx.db.get(args.templateId);
    if (!template || template.groupId !== person.groupId) {
      throw new Error("Unauthorized");
    }

    // 3. Update template properties
    await ctx.db.patch(args.templateId, {
      properties: {
        ...template.properties,
        visibility: args.visibility,
        sharePermission: args.permission,
      },
      updatedAt: Date.now(),
    });

    // 4. Create connection to track share
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: args.templateId,
      relationshipType: "shared_template",
      metadata: {
        visibility: args.visibility,
        permission: args.permission,
        sharedAt: Date.now(),
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 5. Log event
    await ctx.db.insert("events", {
      type: "template_shared",
      actorId: person._id,
      targetId: args.templateId,
      timestamp: Date.now(),
      metadata: {
        visibility: args.visibility,
        permission: args.permission,
      },
    });

    return { success: true };
  },
});
```

### Query Shared Templates

```typescript
// queries/templates.ts
export const getSharedTemplates = query({
  args: {
    visibility: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const person = await ctx.db.query("things")
      .withIndex("by_type", q => q.eq("type", "creator"))
      .filter(t => t.properties?.email === identity.email)
      .first();

    if (!person?.groupId) return [];

    // Get templates based on visibility
    let query = ctx.db.query("things")
      .withIndex("by_group_type", q =>
        q.eq("groupId", person.groupId).eq("type", "funnel_template")
      );

    const templates = await query.collect();

    // Filter by visibility if specified
    if (args.visibility) {
      return templates.filter(
        t => t.properties?.visibility === args.visibility
      );
    }

    return templates;
  },
});
```

## Connection Type

The sharing system uses the `shared_template` connection type:

```typescript
{
  fromThingId: userId,           // Who shared
  toThingId: templateId,         // What was shared
  relationshipType: "shared_template",
  metadata: {
    visibility: "team",          // Share level
    permission: "duplicate",     // Permission granted
    sharedAt: Date.now(),        // When shared
  },
  validFrom: Date.now(),
  createdAt: Date.now(),
}
```

## Event Types

The system logs these events:

- `template_shared` - Template sharing settings updated
- `template_duplicated` - Template copied by another user
- `template_accessed` - Template viewed by shared user

## Multi-Tenant Isolation

**Critical:** All share operations respect groupId scoping:

- **Private:** Only creator can access
- **Team:** Only users in same groupId can access
- **Public:** Anyone can access (read-only unless duplicated)

## Accessibility

- All share options have descriptive labels
- Icons complement text labels
- Keyboard navigation supported
- Screen reader friendly

## Future Enhancements

Potential additions for future cycles:

1. **Share Analytics** - Track views, duplications
2. **Expiring Links** - Time-limited sharing
3. **Share Limits** - Max shares per plan tier
4. **Share Notifications** - Notify when template shared
5. **Bulk Sharing** - Share multiple templates at once
6. **Share Revocation** - Unshare previously shared templates

---

**Built for Cycle 59: Template Sharing**
