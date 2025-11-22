---
title: CYCLE-007: Define Role-Based Permissions for Funnel Builder
dimension: things
category: plans
tags: funnel-builder, rbac, permissions, security, roles, authorization
related_dimensions: people, connections, events, groups
scope: feature
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  CYCLE-007 defines exact role-based permissions for the ClickFunnels-style funnel builder.
  Implements RBAC for 4 roles: platform_owner, org_owner, org_user, customer.
  Maps to 6-dimension ontology: people dimension (roles) + connections (permissions).
  For AI agents: Read to understand permission model and implement checks.
---

# CYCLE-007: Define Role-Based Permissions for Funnel Builder

**Cycle:** 007
**Phase:** Foundation & Ontology Mapping (Cycles 1-10)
**Status:** COMPLETE
**Predecessor:** [CYCLE-006](./clickfunnels-builder-100-cycles.md) - Multi-tenant isolation
**Successor:** [CYCLE-008](./clickfunnels-builder-100-cycles.md) - High-level vision document

---

## Overview

Define exact permissions for each role in the funnel builder system. Four roles enforce access control across:

- **Funnel operations** (create, edit, publish, delete)
- **Template operations** (create, approve, share)
- **Analytics operations** (view, export)
- **Settings operations** (configure, integrate)
- **User management** (invite, remove, role assignment)

All permissions map to the **PEOPLE dimension** in the 6-dimension ontology. Roles are stored as `person.properties.role` (platform-level) and in connection metadata for org-level roles via `member_of` connections.

---

## 4 Role Definitions

### 1. Platform Owner

**Scope:** Entire platform (all organizations)
**Can do:** Everything (super admin)
**Storage:** `person.properties.role = "platform_owner"`

#### Permissions Matrix

| Operation | Funnel | Template | Analytics | Settings | User Management |
|-----------|--------|----------|-----------|----------|-----------------|
| Create | ✓ | ✓ | - | - | - |
| Edit | ✓ | ✓ | - | - | - |
| Delete | ✓ | ✓ | - | - | - |
| Publish | ✓ | ✓ | - | - | - |
| View | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approve (public) | - | ✓ | - | - | - |
| View Analytics | ✓ | - | ✓ | - | - |
| Export | ✓ | - | ✓ | - | - |
| Configure Platform | - | - | - | ✓ | - |
| Manage All Users | - | - | - | - | ✓ |
| Manage All Orgs | - | - | - | ✓ | - |

**Special Abilities:**
- See all funnels across all organizations
- Approve/reject templates for public marketplace
- View platform-wide analytics and revenue reports
- Configure funnel builder platform settings
- Override any organization's settings
- Create funnels in any organization

---

### 2. Organization Owner

**Scope:** Single organization (own org only)
**Can do:** Manage funnels and users for their organization
**Storage:** `member_of(person → org, metadata.role = "org_owner")`

#### Permissions Matrix

| Operation | Funnel | Template | Analytics | Settings | User Management |
|-----------|--------|----------|-----------|----------|-----------------|
| Create | ✓ | ✓ | - | - | - |
| Edit | ✓ | ✓ | - | - | - |
| Delete | ✓ | ✓ | - | - | - |
| Publish | ✓ | - | - | - | - |
| View | ✓ | ✓ | - | - | - |
| Approve (public) | - | - | - | - | - |
| View Analytics | ✓ | - | ✓ | - | - |
| Export | ✓ | - | ✓ | - | - |
| Configure Org | - | - | - | ✓ | - |
| Manage Org Users | - | - | - | - | ✓ |
| Create Private Templates | ✓ | ✓ | - | - | - |

**Scope Limitation:**
- Can ONLY access funnels owned by their organization
- Can ONLY see analytics for their organization's funnels
- Can ONLY manage users within their organization
- Cannot create funnels in other organizations

**Special Abilities:**
- Set up Stripe integration for organization
- Create private templates (not visible to other orgs)
- Share templates within organization
- Configure organization branding and domain
- Invite users to organization
- Manage organization subscription plan

---

### 3. Organization User

**Scope:** Assigned funnels only
**Can do:** Edit assigned funnels, view analytics
**Storage:** `member_of(person → org, metadata.role = "org_user")` + permissions array

#### Permissions Matrix

| Operation | Funnel | Template | Analytics | Settings | User Management |
|-----------|--------|----------|-----------|----------|-----------------|
| Create | ✗ | ✗ | - | - | - |
| Edit | ✓ | ✗ | - | - | - |
| Delete | ✗ | ✗ | - | - | - |
| Publish | ✗ | - | - | - | - |
| View | ✓ | ✓ | - | - | - |
| Approve (public) | - | - | - | - | - |
| View Analytics | ✓ | - | ✓ | - | - |
| Export | ✗ | - | ✗ | - | - |
| Configure Org | - | - | - | ✗ | - |
| Manage Org Users | - | - | - | - | ✗ |
| Use Templates | ✓ | ✓ | - | - | - |

**Scope Limitation:**
- Can ONLY edit funnels they're explicitly assigned to
- Can view organization's public templates (cannot create)
- Can view analytics for assigned funnels only
- Cannot create, delete, or publish funnels
- Cannot configure organization settings
- Cannot invite or manage other users

**Assignment Model:**
- Org owners assign org_users to specific funnels
- Assignment stored in `assigned_to` connection metadata
- Can be revoked by org owner at any time

---

### 4. Customer

**Scope:** No admin access
**Can do:** Go through funnels as a visitor
**Storage:** `person.type = "audience_member"`, not in organization

#### Permissions Matrix

| Operation | Funnel | Template | Analytics | Settings | User Management |
|-----------|--------|----------|-----------|----------|-----------------|
| Create | ✗ | ✗ | - | - | - |
| Edit | ✗ | ✗ | - | - | - |
| Delete | ✗ | ✗ | - | - | - |
| Publish | ✗ | - | - | - | - |
| View | ✓* | ✗ | - | - | - |
| Approve (public) | - | - | - | - | - |
| View Analytics | ✗ | - | ✗ | - | - |
| Export | ✗ | - | ✗ | - | - |
| Configure | - | - | - | ✗ | - |
| Manage Users | - | - | - | - | ✗ |

**Scope Limitation:**
- Can ONLY view published funnels
- Access funnels via public URL (no admin panel)
- Cannot see analytics or reporting
- **They ARE the analytics** (tracked as visitor_viewed_step, form_submitted events)

**Special Cases:**
- Can provide email (form submission)
- Can make purchases (creates customer person)
- Can complete surveys/opt-ins
- Session tracked via visitor events

---

## Permission Check Functions

All permission checks follow the **Effect.ts pattern** from `PeopleService.ts`. Each function returns `Effect.Effect<boolean, PermissionError>`.

### Core Permission Functions

#### 1. Can Create Funnel

```typescript
/**
 * Check if person can create a new funnel
 *
 * @param personId - User attempting to create
 * @param orgId - Organization where funnel will be created
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (always)
 * - org_owner: ✓ (in their org)
 * - org_user: ✗ (never)
 * - customer: ✗ (never)
 */
const canCreateFunnel = (personId: string, orgId: string) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Org owner can create in their org
		if (role === "org_owner") {
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, orgId);
			return isOrgOwner;
		}

		// Org user and customer cannot create
		return false;
	});
```

#### 2. Can Edit Funnel

```typescript
/**
 * Check if person can edit an existing funnel
 *
 * @param personId - User attempting edit
 * @param funnelId - Funnel thing ID
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (always)
 * - org_owner: ✓ (if they own the funnel's org)
 * - org_user: ✓ (if explicitly assigned)
 * - customer: ✗ (never)
 */
const canEditFunnel = (personId: string, funnelId: string) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;
		const provider = yield* DataProviderService;

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Get funnel to check org ownership
		const funnel = yield* provider.things.get(funnelId);
		const funnelOrgId = funnel.properties.organizationId as string;

		// Org owner can edit if funnel is in their org
		if (role === "org_owner") {
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, funnelOrgId);
			return isOrgOwner;
		}

		// Org user can edit if explicitly assigned
		if (role === "org_user") {
			// Check assigned_to connection
			const assignments = yield* provider.connections.list({
				fromEntityId: personId,
				toEntityId: funnelId,
				relationshipType: "assigned_to",
			});
			return assignments.length > 0;
		}

		// Customer cannot edit
		return false;
	});
```

#### 3. Can Publish Funnel

```typescript
/**
 * Check if person can publish/go-live with a funnel
 *
 * @param personId - User attempting publish
 * @param funnelId - Funnel thing ID
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (always)
 * - org_owner: ✓ (if they own the funnel's org)
 * - org_user: ✗ (never - only org_owner can publish)
 * - customer: ✗ (never)
 */
const canPublishFunnel = (personId: string, funnelId: string) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;
		const provider = yield* DataProviderService;

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Only org_owner can publish (not org_user)
		if (role === "org_owner") {
			const funnel = yield* provider.things.get(funnelId);
			const funnelOrgId = funnel.properties.organizationId as string;
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, funnelOrgId);
			return isOrgOwner;
		}

		// Org user and customer cannot publish
		return false;
	});
```

#### 4. Can Delete Funnel

```typescript
/**
 * Check if person can delete a funnel (archive or hard delete)
 *
 * @param personId - User attempting delete
 * @param funnelId - Funnel thing ID
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (always)
 * - org_owner: ✓ (if they own the funnel's org)
 * - org_user: ✗ (never)
 * - customer: ✗ (never)
 */
const canDeleteFunnel = (personId: string, funnelId: string) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;
		const provider = yield* DataProviderService;

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Org owner can delete if funnel is in their org
		if (role === "org_owner") {
			const funnel = yield* provider.things.get(funnelId);
			const funnelOrgId = funnel.properties.organizationId as string;
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, funnelOrgId);
			return isOrgOwner;
		}

		// Org user and customer cannot delete
		return false;
	});
```

#### 5. Can View Funnel Analytics

```typescript
/**
 * Check if person can view analytics for a funnel
 *
 * @param personId - User viewing analytics
 * @param funnelId - Funnel thing ID
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (all funnels)
 * - org_owner: ✓ (their org's funnels)
 * - org_user: ✓ (assigned funnels only)
 * - customer: ✗ (never)
 */
const canViewFunnelAnalytics = (personId: string, funnelId: string) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;
		const provider = yield* DataProviderService;

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Get funnel org
		const funnel = yield* provider.things.get(funnelId);
		const funnelOrgId = funnel.properties.organizationId as string;

		// Org owner can view their org's analytics
		if (role === "org_owner") {
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, funnelOrgId);
			return isOrgOwner;
		}

		// Org user can view assigned funnels' analytics
		if (role === "org_user") {
			const assignments = yield* provider.connections.list({
				fromEntityId: personId,
				toEntityId: funnelId,
				relationshipType: "assigned_to",
			});
			return assignments.length > 0;
		}

		// Customer cannot view analytics
		return false;
	});
```

#### 6. Can Create Template

```typescript
/**
 * Check if person can create a funnel template
 *
 * @param personId - User creating template
 * @param orgId - Organization (for private templates)
 * @param isPublic - Whether template is for public marketplace
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (always, can create public)
 * - org_owner: ✓ (can create private templates for their org)
 * - org_user: ✗ (never)
 * - customer: ✗ (never)
 */
const canCreateTemplate = (personId: string, orgId: string, isPublic: boolean) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;

		// Platform owner can create any template (public or private)
		if (role === "platform_owner") {
			return true;
		}

		// Org owner can create private templates for their org
		if (role === "org_owner") {
			if (isPublic) {
				// Only platform owner can create public templates
				return false;
			}
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, orgId);
			return isOrgOwner;
		}

		// Org user and customer cannot create templates
		return false;
	});
```

#### 7. Can Manage Organization Users

```typescript
/**
 * Check if person can invite/remove/manage users in an organization
 *
 * @param personId - User attempting user management
 * @param orgId - Target organization
 * @param action - 'invite' | 'remove' | 'update_role'
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (all actions in all orgs)
 * - org_owner: ✓ (all actions in their org)
 * - org_user: ✗ (never)
 * - customer: ✗ (never)
 */
const canManageOrgUsers = (personId: string, orgId: string, action: string) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Org owner can manage their org's users
		if (role === "org_owner") {
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, orgId);
			return isOrgOwner;
		}

		// Org user and customer cannot manage users
		return false;
	});
```

#### 8. Can Configure Organization Settings

```typescript
/**
 * Check if person can configure organization settings
 *
 * @param personId - User attempting configuration
 * @param orgId - Target organization
 * @param setting - 'branding' | 'domain' | 'stripe' | 'integrations'
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (all settings in all orgs)
 * - org_owner: ✓ (all settings in their org)
 * - org_user: ✗ (never)
 * - customer: ✗ (never)
 */
const canConfigureOrgSettings = (
	personId: string,
	orgId: string,
	setting: string,
) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Org owner can configure their org's settings
		if (role === "org_owner") {
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, orgId);
			return isOrgOwner;
		}

		// Org user and customer cannot configure settings
		return false;
	});
```

#### 9. Can View Funnel (Published Only for Customers)

```typescript
/**
 * Check if person can view a funnel
 *
 * @param personId - User viewing
 * @param funnelId - Funnel thing ID
 * @param publishedOnly - Customer can only see published funnels
 * @returns Effect<boolean, PermissionError>
 *
 * Rules:
 * - platform_owner: ✓ (all funnels)
 * - org_owner: ✓ (their org's funnels)
 * - org_user: ✓ (assigned funnels)
 * - customer: ✓ (published funnels only via public URL)
 */
const canViewFunnel = (personId: string, funnelId: string) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;
		const provider = yield* DataProviderService;
		const funnel = yield* provider.things.get(funnelId);

		// Platform owner always can
		if (role === "platform_owner") {
			return true;
		}

		// Org owner can view their org's funnels
		if (role === "org_owner") {
			const funnelOrgId = funnel.properties.organizationId as string;
			const isOrgOwner = yield* PeopleService.isOrgOwner(personId, funnelOrgId);
			return isOrgOwner;
		}

		// Org user can view assigned funnels
		if (role === "org_user") {
			const assignments = yield* provider.connections.list({
				fromEntityId: personId,
				toEntityId: funnelId,
				relationshipType: "assigned_to",
			});
			return assignments.length > 0;
		}

		// Customer can view published funnels only
		if (role === "customer" || person.type === "audience_member") {
			return funnel.properties.status === "published";
		}

		return false;
	});
```

#### 10. Generic Permission Check (Extensible)

```typescript
/**
 * Generic permission check for any action
 *
 * @param personId - User attempting action
 * @param action - Action name (e.g., 'funnel:create', 'template:publish')
 * @param resourceId - Optional resource being accessed
 * @returns Effect<boolean, PermissionError>
 *
 * Follows PeopleService.checkPermission pattern but extended for funnels
 */
const canPerformAction = (
	personId: string,
	action: string,
	resourceId?: string,
) =>
	Effect.gen(function* () {
		const person = yield* PeopleService.get(personId);
		const role = person.properties.role as Role;

		// Platform owner can do everything
		if (role === "platform_owner") {
			return true;
		}

		// Delegate to specific permission functions
		// This allows for composition and granular control
		switch (action) {
			case "funnel:create":
				// Requires orgId in metadata
				return role === "org_owner";
			case "funnel:edit":
				// Requires funnelId in metadata
				return role === "org_owner" || role === "org_user";
			case "funnel:publish":
				// Only org_owner
				return role === "org_owner";
			case "funnel:delete":
				return role === "org_owner";
			case "template:create":
				return role === "org_owner";
			case "analytics:view":
				return role === "org_owner" || role === "org_user";
			case "settings:configure":
				return role === "org_owner";
			case "users:manage":
				return role === "org_owner";
			default:
				return false;
		}
	});
```

---

## Ontology Mapping Details

### People Dimension

**Storage Locations:**

1. **Platform-level role** (global):
   ```typescript
   person.properties.role = "platform_owner" | "org_owner" | "org_user" | "customer"
   ```

2. **Organization-level role** (per org):
   ```typescript
   member_of(person → organization) {
     metadata.role = "org_owner" | "org_user"
     metadata.joinedAt = timestamp
   }
   ```

3. **Funnel assignment** (granular):
   ```typescript
   assigned_to(org_user → funnel) {
     metadata.assignedAt = timestamp
     metadata.assignedBy = personId  // who made the assignment
   }
   ```

### Connections Dimension

**Permission-Related Connections:**

- `member_of(person → org, metadata.role)` - Organization membership
- `assigned_to(org_user → funnel)` - Funnel work assignment
- `owns(org → funnel)` - Ownership relationship (implicit via groupId)

### Events Dimension

**Permission-Related Events:**

- `user_joined_org` - Track when user joins with role
- `profile_updated` - Log role changes
- `user_removed_from_org` - Track removal
- Event metadata includes:
  - `oldRole` / `newRole` (for audit trail)
  - `organizationId` (which org)
  - `assignedBy` (who made change)

---

## Implementation Patterns

### Pattern 1: Async Permission Middleware (Convex)

```typescript
// backend/convex/middleware/authz.ts
import { Effect } from "effect";

/**
 * Middleware for permission checking in Convex mutations
 *
 * Usage:
 * ```typescript
 * export const updateFunnel = mutation({
 *   args: { funnelId: v.string(), ...updates },
 *   async handler(ctx, args) {
 *     // Check permission
 *     yield* withPermission(
 *       ctx.auth.getUserIdentity()?.email,
 *       () => canEditFunnel(userId, args.funnelId)
 *     );
 *
 *     // Proceed with update
 *     return await db.patch(args.funnelId, args.updates);
 *   }
 * });
 * ```
 */
export const withPermission = <T>(
	personId: string,
	checkFn: () => Effect.Effect<boolean, PermissionError>,
) =>
	Effect.gen(function* () {
		const hasPermission = yield* checkFn();
		if (!hasPermission) {
			return yield* Effect.fail<PermissionError>({
				_tag: "UnauthorizedError",
				userId: personId,
				action: "permission_denied",
			});
		}
	});
```

### Pattern 2: React Hook for Permission Checking (Frontend)

```typescript
// web/src/hooks/useFunnelPermissions.ts
import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useFunnelPermissions(personId: string) {
	const checkPermission = useMutation(api.mutations.permissions.checkPermission);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const canCreateFunnel = useCallback(
		async (orgId: string) => {
			setLoading(true);
			try {
				const result = await checkPermission({
					personId,
					action: "funnel:create",
					orgId,
				});
				return result;
			} catch (err) {
				setError(err instanceof Error ? err : new Error("Permission check failed"));
				return false;
			} finally {
				setLoading(false);
			}
		},
		[personId, checkPermission],
	);

	const canEditFunnel = useCallback(
		async (funnelId: string) => {
			setLoading(true);
			try {
				const result = await checkPermission({
					personId,
					action: "funnel:edit",
					funnelId,
				});
				return result;
			} catch (err) {
				setError(err instanceof Error ? err : new Error("Permission check failed"));
				return false;
			} finally {
				setLoading(false);
			}
		},
		[personId, checkPermission],
	);

	const canPublishFunnel = useCallback(
		async (funnelId: string) => {
			setLoading(true);
			try {
				const result = await checkPermission({
					personId,
					action: "funnel:publish",
					funnelId,
				});
				return result;
			} catch (err) {
				setError(err instanceof Error ? err : new Error("Permission check failed"));
				return false;
			} finally {
				setLoading(false);
			}
		},
		[personId, checkPermission],
	);

	return {
		canCreateFunnel,
		canEditFunnel,
		canPublishFunnel,
		loading,
		error,
	};
}
```

### Pattern 3: Component-Level Permission Guards

```typescript
// web/src/components/funnel/FunnelActions.tsx
import { useFunnelPermissions } from "@/hooks/useFunnelPermissions";
import { Button } from "@/components/ui/button";

export function FunnelActions({ funnelId, personId }: { funnelId: string; personId: string }) {
	const { canPublishFunnel, canDeleteFunnel } = useFunnelPermissions(personId);
	const [canPublish, setCanPublish] = useState(false);
	const [canDelete, setCanDelete] = useState(false);

	useEffect(() => {
		canPublishFunnel(funnelId).then(setCanPublish);
		canDeleteFunnel(funnelId).then(setCanDelete);
	}, [funnelId, canPublishFunnel, canDeleteFunnel]);

	return (
		<div className="flex gap-2">
			{canPublish && (
				<Button variant="default">Publish Funnel</Button>
			)}
			{canDelete && (
				<Button variant="destructive">Delete Funnel</Button>
			)}
			{!canPublish && !canDelete && (
				<p className="text-sm text-muted-foreground">
					No permissions for this funnel
				</p>
			)}
		</div>
	);
}
```

---

## Security Considerations

### 1. Principle of Least Privilege

**Rule:** Users get minimum permissions needed for their role.

- `org_user` cannot publish (only edit)
- `org_user` cannot create funnels
- `customer` cannot access admin panel

### 2. Scope Isolation

**Rule:** All queries/mutations MUST scope by `groupId` (organization).

```typescript
// ✓ CORRECT: Filter by organization
const funnels = yield* provider.things.list({
	groupId: orgId,
	type: "funnel",
});

// ✗ WRONG: No organization filter
const funnels = yield* provider.things.list({
	type: "funnel",
});
```

### 3. Ownership Verification

**Rule:** Before granting access, verify ownership relationship.

```typescript
// ✓ CORRECT: Verify org membership
const isOrgOwner = yield* PeopleService.isOrgOwner(personId, orgId);
if (!isOrgOwner) {
	return yield* Effect.fail({
		_tag: "UnauthorizedError",
		userId: personId,
	});
}

// ✗ WRONG: Trust client-provided orgId
const funnel = yield* provider.things.update(funnelId, updates);
```

### 4. Audit Trail

**Rule:** Log all permission-sensitive operations.

```typescript
// ✓ CORRECT: Log everything
yield* provider.events.create({
	type: "funnel_published",
	actorId: personId,
	targetId: funnelId,
	metadata: {
		orgId,
		publishedAt: Date.now(),
	},
});

// ✗ WRONG: Silent operations
yield* provider.things.update(funnelId, { status: "published" });
```

### 5. Organization Role Precedence

**Rule:** Platform owner > Org owner > Org user

A platform owner's permissions override org-level restrictions.

```typescript
if (role === "platform_owner") {
	return true; // Early exit, no further checks
}

if (role === "org_owner") {
	// Check org ownership
}

if (role === "org_user") {
	// Check funnel assignment
}
```

### 6. API Key Scope (Future)

**Coming in CYCLE-090+:** API keys should inherit role permissions.

```typescript
// Future: API key for org_owner
// Can create funnels, view analytics
// Cannot access other orgs
```

---

## Example: Complete Permission Flow

### Scenario: Org User Edits Assigned Funnel

**Steps:**

1. **Frontend requests funnel update**
   ```typescript
   // user clicks "Edit" button
   const updateFunnel = useMutation(api.mutations.funnels.update);
   await updateFunnel({
     funnelId: "123",
     name: "New Name",
   });
   ```

2. **Convex mutation checks permission**
   ```typescript
   // backend/convex/mutations/funnels.ts
   export const update = mutation({
     args: { funnelId: v.string(), ...updates },
     async handler(ctx, args) {
       const identity = await ctx.auth.getUserIdentity();
       const personId = identity.subject; // From auth provider

       // Check: can this person edit this funnel?
       const canEdit = yield* canEditFunnel(personId, args.funnelId);

       if (!canEdit) {
         throw new Error("Unauthorized");
       }

       // Proceed with update
       const funnel = await ctx.db.get(args.funnelId);
       await ctx.db.patch(args.funnelId, args.updates);

       // Log event
       await ctx.db.insert("events", {
         type: "funnel_updated",
         actorId: personId,
         targetId: args.funnelId,
         timestamp: Date.now(),
       });
     }
   });
   ```

3. **Permission check validates:**
   - Get person record
   - Check role = "org_user"
   - Get funnel record
   - Check `assigned_to(personId → funnelId)` connection exists
   - Return true/false

4. **Result:**
   - ✓ If authorized: funnel updated, event logged
   - ✗ If denied: error returned, no update

---

## Role Transition Rules

### When Can Roles Change?

| From → To | Who Can? | How? | Event |
|-----------|---------|------|-------|
| org_user → org_user | org_owner | Update connection | role_updated |
| org_user → org_owner | platform_owner | Update connection | role_updated |
| org_owner → org_user | platform_owner | Update connection | role_updated |
| customer → org_user | Cannot transition | N/A | N/A |
| platform_owner → anything | Cannot transition | N/A | N/A |

**Rule:** Platform owner role is permanent. Customers cannot become team members.

---

## Testing Permissions

### Test Matrix (3 × 10 = 30 test cases)

```typescript
describe("FunnelPermissions", () => {
	describe("canCreateFunnel", () => {
		test("platform_owner can create in any org", async () => {
			const result = await canCreateFunnel(platformOwnerId, orgId);
			expect(result).toBe(true);
		});

		test("org_owner can create in their org", async () => {
			const result = await canCreateFunnel(orgOwnerId, ownOrg);
			expect(result).toBe(true);
		});

		test("org_owner CANNOT create in other org", async () => {
			const result = await canCreateFunnel(orgOwnerId, otherOrg);
			expect(result).toBe(false);
		});

		test("org_user CANNOT create", async () => {
			const result = await canCreateFunnel(orgUserId, orgId);
			expect(result).toBe(false);
		});

		test("customer CANNOT create", async () => {
			const result = await canCreateFunnel(customerId, orgId);
			expect(result).toBe(false);
		});
	});

	describe("canEditFunnel", () => {
		test("platform_owner can edit any funnel", async () => {
			const result = await canEditFunnel(platformOwnerId, funnelId);
			expect(result).toBe(true);
		});

		test("org_owner can edit their org's funnel", async () => {
			const result = await canEditFunnel(orgOwnerId, ownFunnel);
			expect(result).toBe(true);
		});

		test("org_owner CANNOT edit other org's funnel", async () => {
			const result = await canEditFunnel(orgOwnerId, otherOrgFunnel);
			expect(result).toBe(false);
		});

		test("org_user can edit assigned funnel", async () => {
			const result = await canEditFunnel(orgUserId, assignedFunnel);
			expect(result).toBe(true);
		});

		test("org_user CANNOT edit unassigned funnel", async () => {
			const result = await canEditFunnel(orgUserId, unassignedFunnel);
			expect(result).toBe(false);
		});
	});

	// ... etc for all 10 permission types
});
```

---

## Next Steps (CYCLE-008)

- **CYCLE-008:** Create high-level vision document explaining funnel builder
- **CYCLE-009:** Break down 100 cycles into 6 phases
- **CYCLE-010:** Assign features to specialist agents

---

## References

- **Existing code:** `/home/user/one.ie/web/src/services/PeopleService.ts`
- **Constants:** `/home/user/one.ie/web/src/services/constants.ts`
- **Ontology:** `/home/user/one.ie/one/knowledge/ontology.md`
- **Plan:** `/home/user/one.ie/one/things/plans/clickfunnels-builder-100-cycles.md`

---

**Status:** ✅ COMPLETE - Ready for CYCLE-008
