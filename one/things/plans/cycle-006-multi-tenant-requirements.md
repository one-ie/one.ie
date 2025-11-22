---
title: Cycle 006 - Multi-Tenant Isolation for Funnel Builder
dimension: things
category: plans
tags: funnel-builder, multi-tenancy, isolation, security, data-architecture
related_dimensions: groups, people, things, connections, events, knowledge
scope: feature
cycle: 6
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
status: Complete
---

# CYCLE 006: Multi-Tenant Isolation Requirements for Funnel Builder

**Objective:** Define multi-tenant isolation strategy ensuring organizations can't access each other's funnels, steps, elements, form submissions, and analytics.

**Status:** Planning Complete
**Dependency:** Requires Groups Dimension (Dimension 1 of 6-Dimension Ontology)
**Enterprise Readiness:** Critical - Data isolation is non-negotiable

---

## Executive Summary

The funnel builder must enforce complete data isolation at the group level while supporting:

- **Organizational hierarchy** (parent groups can optionally access child group funnels)
- **Cross-organization template sharing** (public templates accessible to all orgs)
- **White-label support** (custom branding, domains, and feature flags per organization)
- **Role-based access** (platform_owner → org_owner → org_user → customer)
- **Form submission privacy** (each org's submissions completely isolated)
- **Analytics scoping** (metrics visible only to owning organization)

**Golden Rule:** `groupId` is the FIRST filter in EVERY query. No exceptions.

---

## 1. Group Scoping Architecture

### 1.1 Organizational Hierarchy Model

```
Platform Owner (platform_owner role)
    ↓
Organization (Group type: business)
    ├─ name: "Acme Corp"
    ├─ slug: "acme-corp"
    ├─ groupId: acme_org_id
    ├─ settings.plan: "enterprise"
    ├─ settings.features: { aiClone, customDomain, whiteLabel }
    ├─ settings.limits: { maxFunnels, maxSteps, maxFormSubmissions }
    │
    └─ Child Group 1: "Marketing Team"
       ├─ parentGroupId: acme_org_id
       ├─ groupId: acme_marketing_id
       └─ Can view parent's funnels (configurable)

    └─ Child Group 2: "Sales Team"
       ├─ parentGroupId: acme_org_id
       ├─ groupId: acme_sales_id
       └─ Can view parent's funnels (configurable)
```

### 1.2 Multi-Tenant Isolation Principle

**Every resource MUST belong to exactly ONE group:**

```typescript
// Funnel entity
{
  _id: "funnel_123",
  groupId: "acme_org_id",        // ← CRITICAL: Which org owns this?
  type: "funnel",
  name: "Product Launch Sales Page",
  properties: { /* ... */ },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now()
}

// Step entity (inherits parent funnel's groupId)
{
  _id: "step_456",
  groupId: "acme_org_id",        // ← Same as funnel
  type: "funnel_step",
  funnelId: "funnel_123",
  properties: { /* ... */ }
}

// Element entity (inherits parent step's groupId)
{
  _id: "element_789",
  groupId: "acme_org_id",        // ← Same as step
  type: "funnel_element",
  stepId: "step_456",
  properties: { /* ... */ }
}

// Form submission (scoped to funnel's groupId)
{
  _id: "submission_abc",
  groupId: "acme_org_id",        // ← Same as funnel
  type: "form_submission",
  funnelId: "funnel_123",
  properties: { submittedData: { /* ... */ } }
}

// Analytics event (scoped to funnel's groupId)
{
  _id: "event_def",
  groupId: "acme_org_id",        // ← Same as funnel
  type: "funnel_view",
  funnelId: "funnel_123",
  actorId: "visitor_xyz",
  timestamp: Date.now()
}
```

### 1.3 Why Every Entity Needs `groupId`

**Prevents data leaks:**

```typescript
// ❌ DANGEROUS: Query without groupId
const allFunnels = await db
  .query("entities")
  .filter(q => q.eq(q.field("type"), "funnel"))
  .collect();
// This returns ALL funnels from ALL organizations!

// ✅ CORRECT: Query with groupId first
const orgFunnels = await db
  .query("entities")
  .withIndex("group_type", q =>
    q.eq("groupId", orgId).eq("type", "funnel")
  )
  .collect();
// This returns ONLY the organization's funnels
```

---

## 2. Data Isolation Strategy

### 2.1 Table Structure for Funnels

**Core entities (all inherit `groupId` from their parent):**

```typescript
// Dimension 3: Things (Entities Table)
entities: defineTable({
  groupId: v.id("groups"),           // REQUIRED: Multi-tenant scope

  // Funnel entity
  type: v.union(
    v.literal("funnel"),              // Top-level funnel
    v.literal("funnel_step"),          // Step within funnel
    v.literal("funnel_element"),       // Element within step
    v.literal("funnel_page"),          // Page/view in funnel
  ),

  name: v.string(),

  // Hierarchical references
  funnelId: v.optional(v.id("entities")),    // Step → Funnel
  stepId: v.optional(v.id("entities")),      // Element → Step

  // Generic properties
  properties: v.any(),
  status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_group", ["groupId"])
  .index("by_group_type", ["groupId", "type"])
  .index("by_funnel_steps", ["funnelId", "type"])  // Get all steps for a funnel
  .index("by_step_elements", ["stepId", "type"])   // Get all elements for a step
```

**Form submissions (scoped to funnel's groupId):**

```typescript
submissions: defineTable({
  groupId: v.id("groups"),           // REQUIRED: Same as funnel
  funnelId: v.id("entities"),        // Which funnel
  stepId: v.optional(v.id("entities")),

  visitorId: v.optional(v.string()),  // Visitor identifier
  formId: v.optional(v.string()),     // Which form on the page

  data: v.any(),                      // Submitted field values
  ipAddress: v.optional(v.string()),  // For duplicate detection
  userAgent: v.optional(v.string()),

  status: v.union(v.literal("submitted"), v.literal("verified")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_group", ["groupId"])
  .index("by_funnel", ["funnelId"])
  .index("by_funnel_date", ["funnelId", "createdAt"])  // Time-series queries
```

**Analytics events (scoped to funnel's groupId):**

```typescript
events: defineTable({
  groupId: v.id("groups"),           // REQUIRED: Same as funnel

  type: v.string(),
  // Examples: "funnel_view", "step_view", "form_submitted", "conversion"

  funnelId: v.optional(v.id("entities")),
  stepId: v.optional(v.id("entities")),
  submissionId: v.optional(v.id("entities")),

  visitorId: v.optional(v.string()),
  actorId: v.optional(v.id("entities")),  // For authenticated users

  metadata: v.optional(v.any()),
  timestamp: v.number(),
})
  .index("by_group", ["groupId"])
  .index("by_group_type", ["groupId", "type"])
  .index("by_funnel", ["funnelId"])
  .index("by_funnel_time", ["funnelId", "timestamp"])  // Analytics queries
```

### 2.2 Access Control Hierarchy

**Who can access what:**

| Role | Can See Own Org | Can See Parent Org | Can See Child Orgs | Can Create | Can Delete |
|------|-----------------|-------------------|-------------------|------------|-----------|
| **platform_owner** | ✅ All | N/A | ✅ All | ✅ | ✅ |
| **org_owner** | ✅ Yes | ⚙️ Config | ⚙️ Config | ✅ | ✅ |
| **org_user** | ✅ Read | ❌ No | ❌ No | ✅ Limited | ⚙️ Own |
| **customer** | ❌ No | ❌ No | ❌ No | ❌ | ❌ |

**Configuration options per organization:**

```typescript
group.settings.access = {
  inherit_from_parent: false,     // Can org see parent's funnels?
  inherit_to_children: false,     // Can children see this org's funnels?
  share_templates: true,          // Can share templates with other orgs?
  public_templates: false,        // Are templates public to all orgs?
}
```

---

## 3. Query Patterns (With Examples)

### 3.1 List Funnels (Organization)

**Pattern: Always start with `groupId`**

```typescript
export const listOrgFunnels = query({
  args: {
    groupId: v.id("groups"),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // 1. Validate group exists
    const group = await ctx.db.get(args.groupId);
    if (!group || group.status !== "active") {
      throw new Error("Organization not found");
    }

    // 2. Query with compound index (groupId first!)
    let query = ctx.db
      .query("entities")
      .withIndex("by_group_type", q =>
        q.eq("groupId", args.groupId).eq("type", "funnel")
      );

    // 3. Optional filtering by status
    if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    }

    // 4. Return results
    return await query.collect();
  }
});

// Usage (from React component)
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function FunnelList({ groupId }) {
  // ✅ Always pass groupId from authenticated user's context
  const funnels = useQuery(api.queries.funnels.listOrgFunnels, { groupId });

  return (
    <div>
      {funnels?.map(funnel => (
        <FunnelCard key={funnel._id} funnel={funnel} />
      ))}
    </div>
  );
}
```

**Why this pattern is critical:**

1. Index `by_group_type` starts with `groupId` (fast filtering)
2. Database only scans organization's data
3. No cross-org data leakage possible
4. Follows principle: "Always validate group first"

### 3.2 Get Funnel Details with Steps

**Pattern: Validate ownership, then fetch hierarchy**

```typescript
export const getFunnelWithSteps = query({
  args: {
    groupId: v.id("groups"),
    funnelId: v.id("entities")
  },
  handler: async (ctx, args) => {
    // 1. Get funnel AND validate it belongs to this group
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== args.groupId || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    // 2. Get steps using funnel's groupId (not user input)
    const steps = await ctx.db
      .query("entities")
      .withIndex("by_funnel_steps", q =>
        q.eq("funnelId", args.funnelId).eq("type", "funnel_step")
      )
      .collect();

    // 3. Get elements for each step (using funnel's groupId as scope)
    const stepsWithElements = await Promise.all(
      steps.map(async (step) => {
        const elements = await ctx.db
          .query("entities")
          .withIndex("by_step_elements", q =>
            q.eq("stepId", step._id).eq("type", "funnel_element")
          )
          .collect();

        return { ...step, elements };
      })
    );

    return { funnel, steps: stepsWithElements };
  }
});

// ⚠️ CRITICAL: Notice we NEVER use groupId from client input for queries
// We validate once, then trust the entity's embedded groupId
```

**Key security principle:**

```typescript
// ❌ NEVER do this:
const funnel = await ctx.db.get(args.funnelId);
if (funnel.groupId !== args.groupId) throw new Error("Unauthorized");
// Problem: Attacker can guess IDs. We should validate BEFORE fetch.

// ✅ DO THIS:
const funnel = await ctx.db.get(args.funnelId);
if (!funnel || funnel.groupId !== args.groupId) {
  throw new Error("Not found");  // Don't reveal if it exists
}
// Attacker can't distinguish "not found" from "not yours"
```

### 3.3 List Form Submissions

**Pattern: Group scoping + time-based filtering**

```typescript
export const listFormSubmissions = query({
  args: {
    groupId: v.id("groups"),
    funnelId: v.id("entities"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // 1. Validate funnel belongs to group
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== args.groupId) {
      throw new Error("Funnel not found");
    }

    // 2. Query submissions with group scope
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_funnel_date", q =>
        q.eq("funnelId", args.funnelId)
      )
      .order("desc")
      .take(args.limit || 50);

    return submissions;
  }
});
```

### 3.4 Get Analytics (With Security)

**Pattern: Aggregate events within group scope**

```typescript
export const getFunnelAnalytics = query({
  args: {
    groupId: v.id("groups"),
    funnelId: v.id("entities"),
    startDate: v.number(),
    endDate: v.number()
  },
  handler: async (ctx, args) => {
    // 1. Validate funnel ownership
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== args.groupId) {
      throw new Error("Funnel not found");
    }

    // 2. Query analytics events in date range
    const events = await ctx.db
      .query("events")
      .withIndex("by_funnel_time", q =>
        q.eq("funnelId", args.funnelId)
      )
      .filter(q =>
        q.and(
          q.gte(q.field("timestamp"), args.startDate),
          q.lte(q.field("timestamp"), args.endDate)
        )
      )
      .collect();

    // 3. Aggregate analytics
    const views = events.filter(e => e.type === "funnel_view").length;
    const submissions = events.filter(e => e.type === "form_submitted").length;
    const conversions = events.filter(e => e.type === "conversion").length;

    return {
      funnelId: args.funnelId,
      dateRange: { start: args.startDate, end: args.endDate },
      metrics: {
        views,
        submissions,
        conversions,
        conversionRate: submissions > 0 ? (conversions / submissions * 100).toFixed(2) : "0"
      }
    };
  }
});
```

---

## 4. White-Label Implementation

### 4.1 Organization Settings Schema

```typescript
// In groups table
group.settings = {
  // Branding
  branding: {
    logo_url: "https://...",
    favicon_url: "https://...",
    primary_color: "#FF5733",
    secondary_color: "#33FF57",
    font_family: "Inter, sans-serif",
    theme: "light" | "dark"
  },

  // Custom Domain
  custom_domain: {
    enabled: true,
    domain: "funnels.acmecorp.com",
    ssl_status: "active" | "pending" | "failed"
  },

  // Feature Flags
  features: {
    advanced_analytics: true,
    ai_optimizer: false,        // Plan-based
    multi_language: true,
    custom_css: false,          // Enterprise only
    api_access: true
  },

  // Funnel Limits
  limits: {
    max_funnels: 100,
    max_steps_per_funnel: 50,
    max_elements_per_step: 100,
    monthly_form_submissions: 10000,
    storage_gb: 50
  }
}
```

### 4.2 Feature Gating Pattern

```typescript
export function useFeatureFlag(groupId: string, feature: string) {
  const query = useQuery(api.queries.groups.getSettings, { groupId });

  if (query === undefined) return undefined;  // Loading
  if (query === null) return false;           // Not found

  return query?.features?.[feature] ?? false;
}

// Usage
export function FunnelEditor({ groupId, funnelId }) {
  const hasAdvancedAnalytics = useFeatureFlag(groupId, "advanced_analytics");

  return (
    <div>
      {hasAdvancedAnalytics && <AdvancedAnalyticsPanel />}
      <BasicEditorPanel />
    </div>
  );
}
```

---

## 5. Cross-Organization Templates

### 5.1 Public Template Schema

```typescript
// In entities table
{
  _id: "template_xyz",
  groupId: "system",               // Special system group for global templates
  type: "funnel_template",

  name: "SaaS Landing Page",
  properties: {
    description: "High-converting landing page for SaaS products",
    category: "landing_page",
    tags: ["saas", "high-converting", "recommended"],

    // Actual template structure
    steps: [
      { name: "Hero", elements: [...] },
      { name: "Features", elements: [...] },
      { name: "Pricing", elements: [...] },
      { name: "CTA", elements: [...] }
    ],

    // Who can use this?
    access: "public",  // or "private" (only creator's org)
    created_by: "user_abc"
  },

  status: "published"
}
```

### 5.2 Clone Template Pattern

```typescript
export const cloneTemplate = mutation({
  args: {
    groupId: v.id("groups"),
    templateId: v.id("entities"),
    newName: v.string()
  },
  handler: async (ctx, args) => {
    // 1. Get template
    const template = await ctx.db.get(args.templateId);
    if (!template || template.type !== "funnel_template") {
      throw new Error("Template not found");
    }

    // 2. Validate access
    if (template.properties.access !== "public" && template.groupId !== args.groupId) {
      throw new Error("You don't have access to this template");
    }

    // 3. Create new funnel in requesting org
    const newFunnelId = await ctx.db.insert("entities", {
      groupId: args.groupId,          // ← Target organization
      type: "funnel",
      name: args.newName,
      properties: {
        // Copy template structure
        steps: template.properties.steps.map(step => ({
          ...step,
          // Regenerate IDs
        }))
      },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // 4. Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "template_cloned",
      targetId: newFunnelId,
      metadata: { template_id: args.templateId },
      timestamp: Date.now()
    });

    return newFunnelId;
  }
});
```

---

## 6. Role-Based Access Control

### 6.1 Permission Matrix

```typescript
const PERMISSIONS = {
  // Viewing
  "view_funnels": {
    platform_owner: true,
    org_owner: true,
    org_user: true,
    customer: false
  },

  // Creating
  "create_funnel": {
    platform_owner: true,
    org_owner: true,
    org_user: true,
    customer: false
  },

  // Editing
  "edit_funnel": {
    platform_owner: true,
    org_owner: true,
    org_user: true,       // Can edit own funnels
    customer: false
  },

  // Deleting
  "delete_funnel": {
    platform_owner: true,
    org_owner: true,
    org_user: false,
    customer: false
  },

  // Analytics
  "view_analytics": {
    platform_owner: true,
    org_owner: true,
    org_user: true,
    customer: false
  },

  // Settings
  "manage_settings": {
    platform_owner: true,
    org_owner: true,
    org_user: false,
    customer: false
  },

  // Form submissions
  "view_submissions": {
    platform_owner: true,
    org_owner: true,
    org_user: true,
    customer: false
  },

  "export_submissions": {
    platform_owner: true,
    org_owner: true,
    org_user: false,
    customer: false
  }
};
```

### 6.2 Permission Checking Middleware

```typescript
export const requirePermission = (permission: string) => {
  return async (ctx, args, next) => {
    // 1. Get user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 2. Get user's role in this group
    const groupId = args.groupId;
    const userRole = await getUserRoleInGroup(ctx.db, identity.subject, groupId);

    // 3. Check permission
    if (!PERMISSIONS[permission]?.[userRole]) {
      throw new Error("Insufficient permissions");
    }

    // 4. Continue
    return next();
  };
};

// Usage
export const createFunnel = mutation({
  args: { groupId: v.id("groups"), name: v.string() },
  handler: requirePermission("create_funnel")(async (ctx, args) => {
    // User is guaranteed to have permission
    const funnelId = await ctx.db.insert("entities", {
      groupId: args.groupId,
      type: "funnel",
      name: args.name,
      // ...
    });
    return funnelId;
  })
});
```

---

## 7. Agency (Parent → Child) Access Pattern

### 7.1 Hierarchical Access Model

```typescript
// Scenario: Marketing Agency manages 5 client accounts

// Parent Group: "Marketing Agency LLC" (type: business)
const agencyId = await db.insert("groups", {
  slug: "marketing-agency",
  name: "Marketing Agency LLC",
  type: "business",
  parentGroupId: undefined,  // Top-level
  settings: { access: { inherit_to_children: true } }
});

// Child Groups: Each client
const client1Id = await db.insert("groups", {
  slug: "client-acme",
  name: "Acme Corp (Client)",
  type: "business",
  parentGroupId: agencyId,   // Nested under agency
  settings: { access: { inherit_from_parent: true } }  // Can see parent's resources
});

const client2Id = await db.insert("groups", {
  slug: "client-beta",
  name: "Beta Inc (Client)",
  type: "business",
  parentGroupId: agencyId,
  settings: { access: { inherit_from_parent: true } }
});
```

### 7.2 Access Resolution Query

```typescript
export const canAccessFunnel = async (
  ctx,
  userId: string,
  funnelId: Id<"entities">
): Promise<boolean> => {
  // 1. Get the funnel and its group
  const funnel = await ctx.db.get(funnelId);
  if (!funnel) return false;

  const funnelGroupId = funnel.groupId;

  // 2. Get user's groups (all groups they belong to)
  const userGroups = await getUserGroups(ctx.db, userId);

  // 3. Check direct access (user in same group)
  if (userGroups.includes(funnelGroupId)) {
    return true;
  }

  // 4. Check hierarchical access (parent group)
  for (const userGroupId of userGroups) {
    const userGroup = await ctx.db.get(userGroupId);

    // Walk up user's group hierarchy to see if funnel's group is a child
    let currentGroupId = funnelGroupId;
    while (currentGroupId) {
      if (currentGroupId === userGroupId) {
        // User's group is an ancestor of funnel's group
        // Check if parent->child sharing is enabled
        const parentGroup = await ctx.db.get(userGroupId);
        if (parentGroup?.settings?.access?.inherit_to_children) {
          return true;  // Parent can access child's funnels
        }
      }

      const group = await ctx.db.get(currentGroupId);
      currentGroupId = group?.parentGroupId;
    }
  }

  return false;
};
```

---

## 8. Security Checklist

### ✅ Data Isolation

- [ ] All queries start with `groupId` validation
- [ ] `groupId` is stored on every entity (funnel, step, element, submission, event)
- [ ] Index strategy uses compound indexes `(groupId, type)` or `(groupId, ...)`
- [ ] No queries that cross group boundaries without explicit authorization
- [ ] Submissions inherit funnel's `groupId` (never from user input)
- [ ] Analytics events inherit funnel's `groupId`

### ✅ Access Control

- [ ] Role validation before every mutation
- [ ] Permission checks use role from database, not client
- [ ] Cross-org access throws "not found" (not "unauthorized")
- [ ] Parent→child access respects `inherit_to_children` flag
- [ ] API keys scoped to organization (if implemented)

### ✅ Form Submissions

- [ ] Submissions only visible to owning organization
- [ ] Visitor IPs logged (for duplicate detection)
- [ ] GDPR compliance: ability to delete submissions
- [ ] Encryption at rest (sensitive form data)
- [ ] Rate limiting per funnel to prevent spam

### ✅ Analytics

- [ ] Visitor tracking is anonymous (no personal data)
- [ ] Events include `groupId` for proper scoping
- [ ] Aggregation respects organization boundaries
- [ ] Export functionality restricted to org_owner+
- [ ] Conversion tracking accurate per funnel

### ✅ White-Label

- [ ] Feature flags stored in group.settings
- [ ] Branding applied per organization
- [ ] Custom domains validated (SSL certificate)
- [ ] CSS injection prevented (if custom CSS enabled)
- [ ] Limits enforced (max funnels, submissions, etc.)

### ✅ API Security

- [ ] All mutations require `groupId` validation
- [ ] Query parameters can't override authenticated user's group
- [ ] Public templates have explicit access model
- [ ] Template cloning respects access permissions
- [ ] No debugging tools expose organizational data

### ✅ Audit & Compliance

- [ ] All mutations logged to events table with `groupId`
- [ ] User actions traceable to actor
- [ ] Data deletion events logged (audit trail)
- [ ] Quota usage tracked per organization
- [ ] Activity visible to org_owner for compliance

---

## 9. Implementation Checklist

### Phase 1: Schema & Database

- [ ] Add `groupId` field to entities table
- [ ] Add `groupId` field to submissions table
- [ ] Add `groupId` field to events table
- [ ] Create indexes:
  - [ ] entities: `by_group`, `by_group_type`, `by_funnel_steps`, `by_step_elements`
  - [ ] submissions: `by_group`, `by_funnel`, `by_funnel_date`
  - [ ] events: `by_group`, `by_group_type`, `by_funnel`, `by_funnel_time`
- [ ] Update group.settings schema to include access, branding, features, limits
- [ ] Add validation constraints (no orphaned funnels, groupId consistency)

### Phase 2: Backend Queries & Mutations

- [ ] Query: listOrgFunnels (with groupId validation)
- [ ] Query: getFunnelWithSteps (with ownership check)
- [ ] Query: listFormSubmissions (with funnel ownership check)
- [ ] Query: getFunnelAnalytics (with date range scoping)
- [ ] Mutation: createFunnel (validate group active + quota)
- [ ] Mutation: createStep (validate funnel ownership)
- [ ] Mutation: createElement (validate step ownership)
- [ ] Mutation: submitForm (log submission with groupId)
- [ ] Mutation: publishFunnel (validate ownership + permissions)
- [ ] Mutation: deleteFunnel (soft delete + audit log)

### Phase 3: Frontend Integration

- [ ] FunnelSelector component (shows only user's org funnels)
- [ ] FunnelEditor component (group-scoped data loading)
- [ ] AnalyticsDashboard component (org-specific metrics)
- [ ] FormSubmissionsTable component (org-scoped submissions)
- [ ] TemplateLibrary component (public + org templates)
- [ ] OrganizationSettings component (branding, features, limits)

### Phase 4: Testing & Validation

- [ ] Unit tests: groupId validation in all queries
- [ ] Integration tests: cross-org data isolation
- [ ] E2E tests: complete funnel creation → submission flow
- [ ] Security tests: attempted cross-org access (should fail)
- [ ] Performance tests: query performance with compound indexes
- [ ] Load tests: 1000+ funnels per organization

### Phase 5: Documentation

- [ ] Architecture diagram: group hierarchy + data scoping
- [ ] API documentation: all endpoints with groupId requirements
- [ ] Security guide: multi-tenant isolation best practices
- [ ] Migration guide: existing non-scoped data → scoped
- [ ] Troubleshooting: common isolation issues

---

## 10. Success Metrics

### Security

- ✅ Zero cross-organization data leaks
- ✅ All queries validated for group membership
- ✅ Audit trail complete for all mutations
- ✅ No unscoped queries in production

### Performance

- ✅ Query response time < 100ms (99th percentile)
- ✅ Index hit rate > 95%
- ✅ Database load balanced across groups

### Compliance

- ✅ GDPR: ability to export/delete org's data
- ✅ SOC 2: complete audit trail
- ✅ White-label: custom branding per org
- ✅ API: all endpoints properly scoped

---

## 11. Enterprise Readiness Validation

### Organizational Hierarchy ✅

- [x] Support for parent-child group relationships
- [x] Configurable inheritance (parent can access children)
- [x] Independent quotas per group
- [x] Role-based access at each level

### White-Label Support ✅

- [x] Custom branding (logo, colors, fonts)
- [x] Custom domain support
- [x] Feature flags per organization
- [x] Theme customization (light/dark)

### Data Privacy ✅

- [x] Complete organization isolation
- [x] Form submission privacy
- [x] Analytics scoped to organization
- [x] Audit trail for compliance

### Scalability ✅

- [x] Supports unlimited organizations
- [x] Supports unlimited funnels per organization
- [x] Efficient queries via compound indexes
- [x] No cross-organization performance coupling

---

## 12. Next Steps (Cycle 007)

**After Cycle 006 planning is complete:**

1. **Cycle 007:** Implement database schema and indexes
2. **Cycle 008:** Implement core queries (list, get, filter)
3. **Cycle 009:** Implement mutations (create, update, delete)
4. **Cycle 010:** Implement role-based access control
5. **Cycle 011:** Frontend integration (components using queries)
6. **Cycle 012:** White-label features (branding, domains)
7. **Cycle 013:** Analytics implementation
8. **Cycle 014:** Form submission handling
9. **Cycle 015:** Testing & security validation

---

## Appendix A: Example: Complete Funnel Flow with Multi-Tenancy

### Scenario: Acme Corp Creates a Sales Funnel

**Step 1: Create Organization**
```typescript
// Platform admin creates Acme Corp
const acmeGroupId = await db.insert("groups", {
  slug: "acme-corp",
  name: "Acme Corporation",
  type: "business",
  settings: {
    plan: "pro",
    features: { advanced_analytics: true, custom_domain: false },
    limits: { max_funnels: 50, max_submissions: 5000 }
  }
});
```

**Step 2: Create Funnel**
```typescript
// Alice (org_owner) creates sales funnel
const salesFunnelId = await db.insert("entities", {
  groupId: acmeGroupId,              // ← Scoped to Acme
  type: "funnel",
  name: "Product Launch - Sales Funnel",
  properties: { /* ... */ }
});
```

**Step 3: Add Steps**
```typescript
// Create "Hero" step
const heroStepId = await db.insert("entities", {
  groupId: acmeGroupId,              // ← Same as funnel
  type: "funnel_step",
  funnelId: salesFunnelId,
  name: "Hero Section",
  properties: { /* ... */ }
});

// Create "Features" step
const featuresStepId = await db.insert("entities", {
  groupId: acmeGroupId,              // ← Same as funnel
  type: "funnel_step",
  funnelId: salesFunnelId,
  name: "Features",
  properties: { /* ... */ }
});
```

**Step 4: Add Elements**
```typescript
// Add headline element to Hero
await db.insert("entities", {
  groupId: acmeGroupId,              // ← Same as funnel
  type: "funnel_element",
  stepId: heroStepId,
  name: "Main Headline",
  properties: { text: "Launch Your Product", fontSize: 48 }
});

// Add feature card to Features
await db.insert("entities", {
  groupId: acmeGroupId,              // ← Same as funnel
  type: "funnel_element",
  stepId: featuresStepId,
  name: "Feature Card 1",
  properties: { icon: "⚡", text: "Fast" }
});
```

**Step 5: Visitor Submits Form**
```typescript
// Customer visits funnel, fills form
await db.insert("submissions", {
  groupId: acmeGroupId,              // ← Same as funnel
  funnelId: salesFunnelId,
  stepId: heroStepId,
  visitorId: "visitor_xyz",
  data: { email: "customer@example.com", name: "John" },
  status: "submitted",
  createdAt: Date.now()
});

// Log event
await db.insert("events", {
  groupId: acmeGroupId,              // ← Same as funnel
  type: "form_submitted",
  funnelId: salesFunnelId,
  visitorId: "visitor_xyz",
  timestamp: Date.now()
});
```

**Step 6: View Analytics (Alice sees only Acme's data)**
```typescript
// Query: Alice's browser calls
const response = await convex.query(api.queries.funnels.getFunnelAnalytics, {
  groupId: acmeGroupId,              // ← Her organization
  funnelId: salesFunnelId,
  startDate: startOfMonth,
  endDate: endOfMonth
});

// Returns:
// {
//   metrics: {
//     views: 1500,
//     submissions: 245,
//     conversions: 98,
//     conversionRate: "40%"
//   }
// }
// → Acme only sees Acme's data, no cross-org leakage
```

**Step 7: Bob (Competitor's org_owner) Tries to Access Acme's Funnel**
```typescript
// Bob's browser calls
const response = await convex.query(api.queries.funnels.getFunnelWithSteps, {
  groupId: betaCorpGroupId,          // ← Bob's organization
  funnelId: salesFunnelId            // ← Acme's funnel
});

// Backend checks: Does salesFunnelId.groupId match betaCorpGroupId?
// No! It's acmeGroupId.
// Returns: Error("Funnel not found")
// → Bob can't access Acme's data, no security breach
```

---

## Appendix B: Quick Reference - Do's and Don'ts

### ✅ DO

```typescript
// Always validate groupId first
const group = await db.get(args.groupId);
if (!group || group.status !== "active") throw new Error("Not found");

// Always use compound indexes
const funnels = await db.query("entities")
  .withIndex("by_group_type", q =>
    q.eq("groupId", groupId).eq("type", "funnel")
  )
  .collect();

// Always include groupId in creates
const funnelId = await db.insert("entities", {
  groupId: args.groupId,    // ← FROM VALIDATION
  type: "funnel",
  name: args.name
});

// Always check ownership
const funnel = await db.get(args.funnelId);
if (!funnel || funnel.groupId !== args.groupId) throw new Error("Not found");
```

### ❌ DON'T

```typescript
// Never query without groupId
const allFunnels = await db.query("entities")
  .filter(q => q.eq(q.field("type"), "funnel"))
  .collect();
// ← This returns ALL funnels from ALL organizations!

// Never trust user input for groupId
const funnels = await getFunnels(userSuppliedGroupId);
// ← Use groupId from authenticated user's session instead

// Never create entities without groupId
const funnelId = await db.insert("entities", {
  type: "funnel",
  name: args.name
  // ← Missing groupId! This is a security bug
});

// Never skip ownership validation
const funnel = await db.get(args.funnelId);
if (!funnel) return null;  // ← What if funnel belongs to different org?
return funnel;
```

---

**Document Status:** Complete - Ready for Implementation
**Next Review:** After Cycle 007 (Database Schema Implementation)
**Last Updated:** 2025-11-22
