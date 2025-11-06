---
title: Quick Start
description: Get up and running with ONE in 5 minutes
section: Getting Started
order: 1
tags:
  - getting-started
  - setup
  - installation
  - 6-dimensions
  - ontology
---

import { OntologyFlow } from '@/components/OntologyFlow';
import { QuickStartOptions } from '@/components/QuickStartOptions';
import { QuickWalkthrough } from '@/components/QuickWalkthrough';

# Quick Start Guide

Get your first ONE project running in 5 minutes and start building with the 6-dimension ontology.

## The Foundation: 6 Dimensions

Everything in ONE maps to these six dimensions. This universal model means you'll use the same patterns whether building a personal blog or an enterprise platform.

<OntologyFlow client:visible />

---

## Get Started: Choose Your Path

Pick the setup method that works best for you. All paths lead to the same destination - a fully functional ONE application.

<QuickStartOptions client:load />

---

## 5-Minute Walkthrough

Once you have your project set up, follow these 5 steps to create your first application:

<QuickWalkthrough client:idle />

---

## What You Just Built

Congratulations! You've built an application that demonstrates all the core concepts:

### ✅ Content Collections

Type-safe markdown files that automatically become TypeScript entities.

### ✅ Components

Beautiful, accessible UI using shadcn/ui components and Tailwind v4.

### ✅ Static Site Generation

100% static HTML by default - no JavaScript bloat, fast performance.

### ✅ The Things Dimension

Your products are Things - entities with flexible properties that scale from friend circles to enterprises.

---

## Understanding the Dimensions

### 1. Groups (Container)

Hierarchical organization of ownership and multi-tenancy:

```typescript
// Organizations, teams, communities
{
  _id: "org_123",
  type: "organization",
  parentGroupId: null,      // Top-level organization
  name: "My Company"
}

// Sub-groups with parent relationships
{
  _id: "dept_456",
  type: "organization",
  parentGroupId: "org_123", // Part of organization
  name: "Engineering Team"
}
```

### 2. People (Authorization)

Roles that grant access and permissions:

```typescript
interface Person {
  _id: "user_789",
  role: "org_owner"        // Platform owner, org owner, user, customer
  displayName: "Alice",
  avatarUrl: "..."
}

// Role-based UI rendering
{role === "org_owner" && <AdminPanel />}
```

### 3. Things (Entities)

66+ entity types with flexible properties - the core of your data model:

```typescript
// What's a Thing?
// - Products, users, agents, courses, tokens
// - Any noun in your system
// - Type-specific properties
// - Scoped to a group for multi-tenancy

{
  _id: "product_123",
  groupId: "org_123",      // Who owns this?
  type: "product",         // What is it?
  name: "Awesome Product",
  properties: {
    price: 29.99,
    inventory: 100,
    category: "software"
    // ... any properties you need
  },
  status: "active",        // Lifecycle: draft → active → archived
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

### 4. Connections (Relationships)

Link Things together with rich metadata:

```typescript
// Every relationship is a Connection
{
  fromThingId: "customer_456",
  toThingId: "product_123",
  relationshipType: "purchased",  // owns, follows, enrolled_in, etc.
  metadata: {
    purchaseDate: 1234567890,
    amount: 1,
    expiresAt: 9876543210
  },
  validFrom: 1234567890,
  validTo: null
}
```

### 5. Events (Actions)

Immutable audit trail of every action:

```typescript
// When someone does something, log an event
{
  groupId: "org_123",
  type: "product_purchased",
  actorId: "customer_456",      // Who did it?
  targetId: "product_123",      // What happened to?
  timestamp: 1234567890,
  metadata: {
    amount: 1,
    usd: 29.99
  }
}
```

### 6. Knowledge (Search)

Labels, embeddings, and semantic search:

```typescript
// For RAG, recommendations, and search
{
  label: "software product",
  thingId: "product_123",
  embedding: [0.1, 0.2, 0.3, ...],  // Vector for semantic search
  category: "product_type"
}
```

---

## Common Next Steps

### Add Authentication

The platform comes with 6 authentication methods:
- Email/password
- OAuth providers
- Magic links
- Password reset
- Email verification
- 2FA

See [Authentication Guide](/docs/backend/auth) for setup.

### Add Real-Time Data

Connect to Convex for real-time subscriptions and mutations:

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProductList() {
  // Automatically subscribes to real-time updates
  const products = useQuery(api.queries.entities.list, {
    type: "product"
  });

  return (
    <div className="grid gap-4">
      {products?.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### Add Backend Services

Build validation and business logic with Effect.ts:

```typescript
import { Effect } from "effect";

export type ProductError =
  | { _tag: "ValidationError"; message: string }
  | { _tag: "NotFoundError"; id: string };

export const validateProduct = (
  data: unknown
): Effect.Effect<Product, ProductError> =>
  Effect.gen(function* () {
    if (!data.name) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Product name required"
      });
    }
    return data as Product;
  });
```

### Add More Features

Use the Plain English DSL to describe features:

```
FEATURE: Let customers buy my products

WHEN customer clicks "Buy Now"
  CHECK they have payment method
  CALL Stripe to charge payment
  CREATE connection (customer purchased product)
  RECORD tokens_purchased event
  GIVE confirmation to customer
```

The system validates this against the ontology and generates TypeScript code.

---

## Troubleshooting

**Port 4321 already in use?**

```bash
bun run dev -- --port 3000
```

**Import or type errors?**

```bash
# Regenerate types
bunx astro check

# Regenerate content collections
bunx astro sync
```

**Build failing?**

```bash
# Clear cache and rebuild
rm -rf dist .astro
bun run build
```

**Need help with the ontology?**

Read the complete specification:

- [6-Dimension Ontology](/docs/core-concepts/ontology) - Full model
- [Architecture Guide](/docs/core-concepts/architecture) - How it fits together
- [Patterns & Best Practices](/docs/frontend/patterns) - Common implementations

---

## Learning Path

Now that you've built your first application:

1. **Understand the Ontology** - Read [Ontology](/docs/core-concepts/ontology) to deepen your knowledge
2. **Build Backend Services** - Learn [Backend Guide](/docs/backend/convex) for real-time data
3. **Create Components** - Explore [Frontend Architecture](/docs/frontend/architecture) for patterns
4. **Add Authentication** - Set up [Authentication](/docs/backend/auth) for user management
5. **Deploy to Production** - Learn [Deployment](/docs/deployment/cloudflare) for going live

---

## You're Ready!

You now understand:

- ✅ How the 6 dimensions organize all data
- ✅ How to create Things and display them
- ✅ How to scale from hobby projects to enterprises
- ✅ How to build with the ontology instead of custom schemas

**Next:** Choose a feature and build it. The ontology will guide you.
