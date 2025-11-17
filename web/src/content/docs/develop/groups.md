---
title: Groups - Multi-Tenant Organization
description: Complete guide to using Groups in the ONE Platform 6-dimension ontology
section: Develop
order: 5
tags:
  - groups
  - multi-tenant
  - organization
  - ontology
---

# Groups - Multi-Tenant Organization

Groups are the first dimension of the ONE Ontology. They provide **multi-tenant isolation**, **infinite nesting**, and **permission inheritance** for organizing any type of collective—from friend circles to global enterprises.

## Quick Example

```
groups/acme-corp
  type: "business"
  parentGroupId: null
  properties: {
    plan: "enterprise",
    limits: { users: 50, agents: 20, inference: "1M/month" },
    usage: { users: 12, agents: 8, inference: "234K" },
    status: "active"
  }
  owned_by → people/anthony-o-connell

groups/engineering
  type: "organization"
  parentGroupId: "acme-corp"
  inherited_permissions: true
```

## How Groups Work

### URL-Based Creation

Create groups instantly by visiting `one.ie/group/slug`

```
one.ie/group/cooldao → creates "cooldao" group
one.ie/group/cooldao/treasury → creates nested "treasury" group
one.ie/group/emmas-birthday → creates "emmas-birthday" group
```

### Type-Specific Defaults

Each group type has smart defaults based on its use case:

#### friend_circle
- Private, invitation-only
- No billing
- Perfect for: Party planning, trip coordination, small gatherings

#### business
- Billing enabled
- Quotas enforced
- Perfect for: Company org charts, department isolation, permission inheritance

#### dao
- Token-gated
- On-chain governance
- Perfect for: Token-gated communities, on-chain governance, decentralized collaboration

#### community
- Public
- Open membership
- Perfect for: Open communities, public forums, collaborative projects

### Multi-Tenant Isolation

Every group gets its own isolated data space. Resources from one group never leak into another—perfect for SaaS, white-label deployment, and enterprise scale.

## 3 Example Scenarios

### Scenario 1: Friend Circle

Emma creates: `one.ie/group/emmas-friends`

```
groups/emmas-friends (friend_circle)
  owned_by → people/emma
  members → [emma, sarah, jake, alex]

  └─ groups/birthday-party (friend_circle)
      event_date: "2025-10-20"
      location: "Emma's House"
      members → [emma, sarah, jake]  # Subset of parent
```

**Perfect for:** Party planning, trip coordination, small gatherings

### Scenario 2: Business Organization

Anthony creates: `one.ie/group/acme-corp`

```
groups/acme-corp (business)
  owned_by → people/anthony
  plan: "enterprise"
  billing: { seats: 50, price: "$5000/mo" }

  ├─ groups/engineering (organization)
  │   ├─ groups/backend (organization)
  │   │   members → [dev1, dev2, dev3]
  │   └─ groups/frontend (organization)
  │       members → [dev4, dev5]
  │
  └─ groups/marketing (organization)
      members → [marketing1, marketing2]
```

**Perfect for:** Company org charts, department isolation, permission inheritance

### Scenario 3: Decentralized Organization

Community creates: `one.ie/group/cooldao`

```
groups/cooldao (dao)
  token_address: "0x..."
  voting_threshold: 100_000
  members → [wallet1, wallet2, wallet3...]

  ├─ groups/treasury (dao)
  │   governance: "multisig"
  │   signers → [wallet1, wallet2, wallet3]
  │   funds → $500K USDC
  │
  └─ groups/governance (dao)
      proposals → [prop1, prop2, prop3]
      voting_power → weighted by token holdings
```

**Perfect for:** Token-gated communities, on-chain governance, decentralized collaboration

## Group Properties

Groups support flexible properties for different use cases:

```typescript
interface Group {
  id: string;
  type: "friend_circle" | "business" | "dao" | "community" | "organization";
  parentGroupId?: string;
  properties: {
    // Business-specific
    plan?: string;
    limits?: { users: number; agents: number; inference: string };
    usage?: { users: number; agents: number; inference: string };
    status?: "active" | "suspended" | "trial";

    // DAO-specific
    token_address?: string;
    voting_threshold?: number;
    governance?: string;

    // Friend circle-specific
    event_date?: string;
    location?: string;

    // Any custom properties
    [key: string]: any;
  };
}
```

## Permission Inheritance

Child groups inherit permissions from parent groups by default:

```
groups/acme-corp
  permissions: { admin: [user1], member: [user2, user3] }

  └─ groups/engineering (inherits permissions)
      permissions: { inherited: true }
      # user1 is admin, user2 and user3 are members
```

Override inheritance by setting `inherited_permissions: false`:

```
groups/engineering
  inherited_permissions: false
  permissions: { admin: [user4], member: [user5] }
  # Independent permission structure
```

## Querying Groups

### Get all groups

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const groups = useQuery(api.queries.groups.list);
```

### Get groups by type

```typescript
const businessGroups = useQuery(api.queries.groups.list, {
  type: "business"
});
```

### Get nested groups

```typescript
const childGroups = useQuery(api.queries.groups.listChildren, {
  parentGroupId: "acme-corp"
});
```

## Creating Groups

### From the UI

Visit `https://one.ie/group/your-group-name`

The platform automatically creates the group based on URL parameters.

### From Code

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const createGroup = useMutation(api.mutations.groups.create);

await createGroup({
  type: "business",
  name: "Acme Corp",
  properties: {
    plan: "enterprise",
    limits: { users: 50, agents: 20, inference: "1M/month" }
  }
});
```

## Multi-Tenant Scoping

**CRITICAL:** Always scope queries by `groupId` for multi-tenant isolation:

```typescript
// ✅ CORRECT - Scoped to group
const products = useQuery(api.queries.things.list, {
  groupId: currentGroup.id,
  type: "product"
});

// ❌ WRONG - No groupId, potential data leak
const products = useQuery(api.queries.things.list, {
  type: "product"
});
```

## Next Steps

- Learn about [People (Dimension 2)](/docs/develop/people)
- Understand [Things (Dimension 3)](/docs/develop/things)
- Explore [Connections (Dimension 4)](/docs/develop/connections)

## Further Reading

- [6-Dimension Ontology Overview](/ontology)
- [Multi-Tenant Architecture](/docs/overview/architecture)
- [Permission System](/docs/develop/permissions)
