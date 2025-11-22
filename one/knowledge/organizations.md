---
title: Organizations & Multi-Tenancy
dimension: knowledge
category: architecture
tags: organizations, multi-tenancy, rbac, groups
related_dimensions: groups, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document is part of the knowledge dimension in the architecture category.
  Location: one/knowledge/organizations.md
  Purpose: Documents organization and multi-tenancy implementation
  Related: Cycles 50-64 (Phase 4: Organizations & Admin)
  For AI agents: Read this to understand organization architecture.
---

# Organizations & Multi-Tenancy Architecture

**Implementation:** Cycles 50-64 (Phase 4: Organizations & Admin)
**Status:** Complete
**Backend:** Custom Convex implementation (NOT Better Auth plugin)

---

## Overview

Organizations provide multi-tenant isolation in the ONE platform. Every organization is a **group** (Dimension 1 of the 6-dimension ontology), enabling hierarchical nesting and infinite scalability from friend circles to enterprises.

**Key Principle:** Multi-tenancy through `groupId` scoping, NOT schema customization.

---

## Architecture Mapping to 6 Dimensions

### 1. Groups Dimension (Organizations)

Organizations ARE groups. The `groups` table in Convex implements Dimension 1.

**Schema:**
```typescript
groups: defineTable({
  name: v.string(),
  slug: v.string(),
  plan: v.union(
    v.literal("free"),
    v.literal("starter"),
    v.literal("pro"),
    v.literal("enterprise")
  ),
  limits: v.object({
    users: v.number(),
    storage: v.number(),
    apiCalls: v.number(),
  }),
  usage: v.object({
    users: v.number(),
    storage: v.number(),
    apiCalls: v.number(),
  }),
  status: v.union(
    v.literal("active"),
    v.literal("suspended"),
    v.literal("deleted")
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

**Plans & Limits:**
- **Free:** 5 users, 1GB storage, 10k API calls/month
- **Starter:** 20 users, 10GB storage, 100k API calls/month
- **Pro:** 100 users, 100GB storage, 1M API calls/month
- **Enterprise:** 10k users, 1TB storage, 10M API calls/month

### 2. People Dimension (Members & Roles)

Members are users with `groupId` and roles. The `users` table implements Dimension 2.

**4 Roles (RBAC):**
1. **platform_owner** - Full system access, manages all organizations
2. **org_owner** - Full organization access, manages organization
3. **org_admin** - Administrative access, manages users and content
4. **org_user** - Standard member, uses organization features
5. **customer** - External user, limited to purchased content

**Permission Matrix:** See `/backend/convex/lib/permissions.ts`

### 3. Things Dimension (Resources)

All resources (products, courses, agents, etc.) have optional `groupId` for multi-tenant scoping.

**Pattern:**
```typescript
things: defineTable({
  type: v.string(),
  name: v.string(),
  groupId: v.optional(v.id("groups")), // Multi-tenant isolation
  properties: v.any(),
  status: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### 4. Connections Dimension (Invitations)

Team invitations use dedicated `invitations` table (simpler than connections for this use case).

**Schema:**
```typescript
invitations: defineTable({
  groupId: v.id("groups"),
  email: v.string(),
  role: v.union(v.literal("org_owner"), v.literal("org_admin"), v.literal("org_user")),
  invitedBy: v.id("users"),
  token: v.string(), // Secure random token
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("rejected"),
    v.literal("cancelled"),
    v.literal("expired")
  ),
  expiresAt: v.number(), // 7 days
  acceptedAt: v.optional(v.number()),
  createdAt: v.number(),
})
```

### 5. Events Dimension (Audit Trail)

All organization operations are logged as events:
- `organization_created`
- `organization_updated`
- `organization_deleted`
- `organization_ownership_transferred`
- `user_joined_org`
- `user_removed_from_org`
- `user_left_org`
- `user_role_changed`
- `invitation_sent`
- `invitation_accepted`
- `invitation_rejected`
- `invitation_cancelled`
- `invitation_resent`

### 6. Knowledge Dimension (Not yet implemented)

Future: Organization-specific knowledge bases and embeddings.

---

## Backend Implementation

### File Structure

```
backend/convex/
├── schema.ts                       # Updated with invitations table, org_admin role
├── lib/
│   └── permissions.ts              # NEW: RBAC utilities (Cycles 58-60)
├── mutations/
│   ├── organizations.ts            # NEW: Org CRUD (Cycles 53-54)
│   ├── members.ts                  # NEW: Member management (Cycles 61-62)
│   └── invitations.ts              # NEW: Invitation system (Cycles 55-57)
└── queries/
    ├── organizations.ts            # NEW: Org queries (Cycles 53-54)
    ├── members.ts                  # NEW: Member queries (Cycles 61-62)
    └── invitations.ts              # NEW: Invitation queries (Cycles 55-57)
```

### Key Mutations

**Organization CRUD:**
- `createOrganization` - Create new organization, user becomes org_owner
- `updateOrganization` - Update name, plan, limits
- `deleteOrganization` - Soft delete (sets status to deleted)
- `transferOwnership` - Transfer ownership to another member

**Member Management:**
- `addMember` - Add user to organization
- `removeMember` - Remove user from organization
- `changeMemberRole` - Change user's role
- `leaveOrganization` - User leaves their organization

**Invitations:**
- `createInvitation` - Generate secure token, send invitation
- `acceptInvitation` - Accept invitation, join organization
- `rejectInvitation` - Reject invitation
- `cancelInvitation` - Cancel pending invitation
- `resendInvitation` - Resend invitation with new token

### Key Queries

**Organization Queries:**
- `getOrganization` - Get organization details
- `listUserOrganizations` - List user's organizations
- `getOrganizationUsage` - Get usage vs limits
- `searchOrganizations` - Platform owner only

**Member Queries:**
- `listOrganizationMembers` - List all members
- `getMember` - Get member details
- `getMyPermissions` - Get authenticated user's permissions
- `countOrganizationMembers` - Count members by role

**Invitation Queries:**
- `listOrganizationInvitations` - List org invitations
- `listMyInvitations` - List invitations for authenticated user
- `getInvitationByToken` - Get invitation details (public)
- `countPendingInvitations` - Count pending invitations

---

## Permission System (RBAC)

### Permission Utilities

Located in `/backend/convex/lib/permissions.ts`:

**Core Functions:**
- `hasPermission(role, permission)` - Check if role has permission
- `canManageOrganization(role, permission, userGroupId, targetGroupId)` - Check org-specific permission
- `getAuthenticatedUser(ctx)` - Get user with session validation
- `requirePermission(ctx, permission)` - Require permission, throw if denied
- `requireOrganizationPermission(ctx, permission, groupId)` - Require org permission
- `requireOrganizationMembership(ctx, groupId)` - Require membership
- `validateOrganization(ctx, groupId)` - Validate org exists and is active
- `checkOrganizationLimit(ctx, groupId, limitType)` - Check resource limits

**Permission Types:**
```typescript
type Permission =
  | "org:create"
  | "org:read"
  | "org:update"
  | "org:delete"
  | "org:manage_members"
  | "org:invite_members"
  | "org:remove_members"
  | "org:change_roles"
  | "org:view_members"
  | "org:transfer_ownership"
  | "thing:create"
  | "thing:read"
  | "thing:update"
  | "thing:delete";
```

### Standard Mutation Pattern

```typescript
export const exampleMutation = mutation({
  args: {
    _csrfToken: v.string(), // CSRF protection
    groupId: v.id("groups"),
    // ... other args
  },
  handler: async (ctx, args) => {
    // 1. Validate CSRF
    await validateCSRFForMutation(ctx, args);

    // 2. Require permission
    const user = await requireOrganizationPermission(
      ctx,
      "org:update",
      args.groupId
    );

    // 3. Validate organization
    const group = await validateOrganization(ctx, args.groupId);

    // 4. Check limits (if creating resources)
    const limitCheck = await checkOrganizationLimit(ctx, args.groupId, "users");
    if (!limitCheck.allowed) {
      throw new Error(`Limit reached: ${limitCheck.current}/${limitCheck.limit}`);
    }

    // 5. Perform operation
    await ctx.db.patch(args.groupId, { /* updates */ });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "organization_updated",
      actorId: user._id,
      timestamp: Date.now(),
      metadata: { /* details */ },
    });

    return { success: true };
  },
});
```

---

## Multi-Tenancy Implementation (Cycle 63)

### Data Scoping

**Every query MUST filter by `groupId`:**

```typescript
// Good: Scoped by organization
const products = await ctx.db
  .query("things")
  .withIndex("by_group_type", (q) =>
    q.eq("groupId", user.groupId).eq("type", "product")
  )
  .collect();

// Bad: Not scoped (security vulnerability)
const products = await ctx.db
  .query("things")
  .filter((q) => q.eq(q.field("type"), "product"))
  .collect();
```

**Every mutation MUST validate organization context:**

```typescript
// Require membership before operations
const user = await requireOrganizationMembership(ctx, args.groupId);

// Or require specific permission
const user = await requireOrganizationPermission(ctx, "thing:create", args.groupId);
```

### Updating Existing Features

When adding multi-tenancy to existing features:

1. **Add `groupId` to schema** (already exists in `things` table)
2. **Update all queries** to filter by `groupId`
3. **Update all mutations** to validate organization context
4. **Check resource limits** before creating resources
5. **Update organization usage** after operations
6. **Add groupId to event metadata** for audit trail

---

## Frontend Integration (Cycles 61-62)

### Organization Switcher

**Component:** `/web/src/components/OrganizationSwitcher.tsx` (to be created)

**Features:**
- Display current organization
- List user's organizations
- Switch between organizations
- Create new organization
- Leave organization

**State Management:**
- Store active `groupId` in session/localStorage
- Update UI when organization changes
- Fetch organization-scoped data

### Admin Dashboard

**Route:** `/web/src/pages/admin/` (to be created)

**Features:**
- Organization settings
- Member management (list, invite, remove, change roles)
- Invitation management (pending, accepted, cancelled)
- Usage & limits display
- Billing & plan management (future)

**Protected Routes:**
- Use middleware to check permissions
- Redirect if not authorized
- Show 403 for permission denied

---

## Security Considerations

### CSRF Protection

All state-changing mutations require `_csrfToken` parameter.

### Token Security

Invitation tokens:
- Generated with cryptographically secure random (256-bit)
- Single-use (marked as accepted/rejected after use)
- Time-limited (7 days expiration)
- Validated server-side before acceptance

### Permission Checks

Every mutation validates:
1. User authentication (session exists and valid)
2. User authorization (has required permission)
3. Organization membership (belongs to organization)
4. Resource limits (not exceeded)

### Data Isolation

Multi-tenant isolation enforced at query level:
- Platform owners can access all organizations
- Other users can only access their own organization
- Cross-organization queries throw errors

---

## Testing Checklist (Cycle 64)

### Organization CRUD
- [ ] Create organization with valid plan
- [ ] Update organization name and plan
- [ ] Delete organization (soft delete)
- [ ] Transfer ownership to another member
- [ ] Validate slug uniqueness

### Team Invitations
- [ ] Create invitation with secure token
- [ ] Accept invitation and join organization
- [ ] Reject invitation
- [ ] Cancel pending invitation
- [ ] Resend invitation with new token
- [ ] Handle expired invitations
- [ ] Validate email matches invitee

### Member Management
- [ ] Add member to organization
- [ ] Remove member from organization
- [ ] Change member role
- [ ] Leave organization (not as only owner)
- [ ] List organization members
- [ ] Count members by role

### RBAC & Permissions
- [ ] Platform owner can manage all organizations
- [ ] Org owner can manage their organization
- [ ] Org admin can invite members
- [ ] Org user can view members
- [ ] Customer cannot manage organizations
- [ ] Permission checks enforce rules

### Multi-Tenancy
- [ ] Queries filter by groupId
- [ ] Cross-organization access blocked
- [ ] Resource limits enforced
- [ ] Usage tracking accurate
- [ ] Data isolation verified

### Admin Dashboard
- [ ] Organization settings page
- [ ] Member list and management
- [ ] Invitation management
- [ ] Usage/limits display
- [ ] Route protection works

---

## Usage Examples

### Create Organization

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createOrg = useMutation(api.mutations.organizations.createOrganization);

await createOrg({
  _csrfToken: csrfToken,
  name: "Acme Corp",
  slug: "acme-corp",
  plan: "pro",
});
```

### Invite Member

```typescript
const inviteMember = useMutation(api.mutations.invitations.createInvitation);

await inviteMember({
  _csrfToken: csrfToken,
  groupId: organizationId,
  email: "user@example.com",
  role: "org_user",
});
```

### List Members

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const members = useQuery(api.queries.members.listOrganizationMembers, {
  groupId: organizationId,
});
```

### Check Permissions

```typescript
const permissions = useQuery(api.queries.members.getMyPermissions);

if (permissions?.permissions.canInviteMembers) {
  // Show invite button
}
```

---

## Future Enhancements

### Phase 5+
- Billing integration (Stripe subscriptions tied to organizations)
- Organization-specific branding
- Hierarchical organizations (nested groups)
- Organization analytics dashboard
- Organization-specific knowledge bases
- Organization webhooks
- Organization API keys
- SSO/SAML for enterprise organizations

---

## Related Documentation

- **Ontology:** `/one/knowledge/ontology.md` - 6-dimension model
- **RBAC:** `/backend/convex/lib/permissions.ts` - Permission system
- **Schema:** `/backend/convex/schema.ts` - Database schema
- **Better Auth Roadmap:** `/one/things/plans/better-auth-roadmap.md` - Auth phases

---

**Built with the 6-dimension ontology. Organizations are groups. Multi-tenancy through groupId scoping, not schema customization.**
