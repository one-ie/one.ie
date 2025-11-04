---
title: The 6-Dimension Ontology
description: Understanding the fundamental data model that powers ONE
section: Core Concepts
order: 1
tags:
  - architecture
  - ontology
  - data-model
---

# The 6-Dimension Ontology

The ONE Platform is built on a **6-dimension ontology** that models reality itself. This is the core of everything—from data structures to feature design to AI reasoning.

## Why an Ontology?

Instead of designing separate data models for each feature, ONE uses a universal ontology that:

- **Scales infinitely** - From friend circles (2 people) to governments (billions)
- **Never needs schema changes** - Add new entity types without modifying tables
- **Enables AI reasoning** - Clear, consistent patterns AI can learn and apply
- **Ensures consistency** - Every feature follows the same mental model

## The 6 Dimensions

```
┌──────────────────────────────────────────────────────────────┐
│                      1. GROUPS                                │
│        Multi-tenant isolation with hierarchical nesting       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      2. PEOPLE                                │
│              Authorization & governance                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      3. THINGS                                │
│                    Entities & domain objects                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    4. CONNECTIONS                             │
│                  Relationships & metadata                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                      5. EVENTS                                │
│                    Actions & audit trail                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    6. KNOWLEDGE                               │
│              Labels, embeddings, semantic search              │
└──────────────────────────────────────────────────────────────┘
```

### 1. Groups

**Hierarchical containers for organizing entities**

Groups provide multi-tenant isolation at every level:

- **Friend circles** - 2+ people
- **Businesses** - Teams, departments, organizations
- **Communities** - Open membership, shared interests
- **DAOs** - Decentralized autonomous organizations
- **Governments** - Cities, states, countries
- **Organizations** - Companies, nonprofits

Groups can nest infinitely (parent → child → grandchild), creating hierarchies like:

```
Company (organization)
├── Engineering (organization)
│   ├── Backend Team (business)
│   └── Frontend Team (business)
└── Sales (organization)
    ├── US Region (business)
    └── EU Region (business)
```

**Database implementation:**

```sql
groups {
  _id: ID,
  name: string,
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  parentGroupId: ID?,  -- For hierarchy
  properties: { /* type-specific data */ },
  groupId: ID  -- Which group does this belong to
}
```

### 2. People

**Authorization and governance**

People represent actors in the system—anyone who can take actions:

- **platform_owner** - Owns the entire ONE installation
- **org_owner** - Owns a group (company, DAO, etc.)
- **org_user** - Member of a group
- **customer** - External user (no group membership)

**Implementation**: People are represented as `things` with type `"creator"` and role metadata.

```typescript
person: {
  _id: "user_123",
  type: "creator",
  name: "Alice",
  role: "org_owner",
  groupId: "company_abc"
}
```

### 3. Things

**Entities and domain objects**

Things are the "nouns" of your system—everything that exists:

- **Core**: users, groups, organizations
- **Content**: posts, articles, documents, files
- **Commerce**: products, orders, invoices
- **Learning**: courses, lessons, assignments
- **AI**: agents, models, embeddings
- **Social**: follows, subscriptions, memberships
- **Tokens**: cryptocurrencies, NFTs, access tokens
- **50+ more types**

Each thing has:

```typescript
thing: {
  _id: ID,
  type: string,  -- "product", "course", "agent", etc.
  name: string,
  description: string,
  properties: { /* type-specific data */ },
  status: "draft" | "active" | "published" | "archived",
  groupId: ID,  -- Which group owns this
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Connections

**Relationships between entities**

Connections model how things relate:

- **owns** - A owns B (group owns product, user owns post)
- **authored** - A authored B
- **follows** - A follows B (person follows creator)
- **subscribed** - A is subscribed to B
- **teaches** - A teaches B (instructor teaches course)
- **enrolled** - A is enrolled in B (student in course)
- **holds_tokens** - A holds N of B (person owns NFTs)
- **purchases** - A purchased B with metadata (price, date)
- **20+ more types**

```typescript
connection: {
  _id: ID,
  type: string,  -- "owns", "follows", "enrolled_in", etc.
  fromThingId: ID,  -- Source entity
  toThingId: ID,    -- Target entity
  metadata: {
    price?: number,
    startDate?: Date,
    endDate?: Date,
    quantity?: number
  },
  groupId: ID,  -- Which group is this relationship in
  createdAt: Date,
  validFrom: Date,  -- When relationship starts
  validTo: Date?    -- When relationship ends
}
```

### 5. Events

**Complete audit trail of all actions**

Every action in the system creates an event:

- **entity_created** - Someone created a thing
- **entity_updated** - Someone modified a thing
- **connection_created** - Someone created a relationship
- **connection_deleted** - Someone ended a relationship
- **entity_published** - Content was published
- **order_completed** - Customer completed a purchase
- **70+ more event types**

```typescript
event: {
  _id: ID,
  type: string,  -- "entity_created", "order_completed", etc.
  actorId: ID,   -- WHO did this (a person)
  targetId: ID,  -- WHAT they acted on (a thing)
  timestamp: Date,
  metadata: {
    entityType?: string,
    price?: number,
    reason?: string
  },
  groupId: ID,  -- Which group context
}
```

### 6. Knowledge

**Intelligence layer for RAG and search**

Knowledge enables semantic understanding:

```typescript
knowledge: {
  _id: ID,
  thingId: ID,      -- Links to a thing
  labels: [string], -- "tutorial", "advanced", "beginner"
  chunks: [
    {
      text: string,
      embedding: float[],  -- Vector representation
      section: string
    }
  ],
  tags: [string],
  groupId: ID
}
```

## Example: E-Commerce Platform

Let's see how an e-commerce platform uses the 6 dimensions:

### Groups
```
Acme Corp (organization)
├── Merch Store (business)
└── Support (community)
```

### People
```
owner: role="org_owner", groupId="acme"
customer: role="customer"
support_agent: role="org_user", groupId="acme/support"
```

### Things
```
laptop_pro: type="product", properties={price: 999, stock: 50}
order_123: type="order", properties={total: 999}
```

### Connections
```
customer --owns--> order_123
order_123 --contains--> laptop_pro (via connection metadata: quantity=1)
```

### Events
```
product_published: "laptop_pro published"
order_created: "order_123 created"
order_completed: "order_123 paid"
```

### Knowledge
```
laptop_pro knowledge:
  labels: ["electronics", "computers", "bestseller"]
  chunks: [
    {text: "16GB RAM, Apple M3...", embedding: [...]}
  ]
```

## Benefits

1. **Universal Composition** - Combine any entity types without schema changes
2. **Query Flexibility** - Find relationships across any dimensions
3. **Audit Compliance** - Complete history of all actions
4. **AI-Ready** - Clear patterns for LLMs to reason about
5. **Future-Proof** - New types/connections don't require schema migration

## Next Steps

- Learn about [Entities](/docs/core-concepts/entities)
- Explore [Relationships](/docs/core-concepts/connections)
- Check the [API Reference](/docs/api/overview)
