# Backend Development

**You've read root README.** This explains backend development for the ONE platform.

---

## What is the Backend?

The backend implements the **6-dimension ontology** as executable code using:

- **Convex** - Real-time database with typed functions
- **Effect.ts** - Functional business logic with explicit errors
- **Better Auth** - Multi-method authentication system

**Architecture:**
```
Web (Astro + React) → Backend (Convex) → 6-Dimension Ontology
```

---

## Tech Stack

### Convex Database

Real-time database with:
- Typed schema (TypeScript-first)
- Reactive queries (auto-update UI)
- Serverless functions (no infrastructure)
- Built-in auth support

**Connection:** `https://shocking-falcon-870.convex.cloud`

### Effect.ts

Functional programming library for:
- Explicit error types (AI knows what can fail)
- Service composition (pipe operations)
- Dependency injection (testing/mocking)
- Retry/fallback logic

**Why Effect.ts?** Traditional try/catch is ambiguous for AI. Effect.ts makes errors explicit in type signatures.

### Better Auth

Multi-method authentication:
- Email/password
- OAuth (Google, GitHub, etc.)
- Magic links
- Password reset
- Email verification
- 2FA

**Integration:** Convex adapter connects Better Auth to Convex database.

---

## Directory Structure

```
backend/
├── convex/
│   ├── schema.ts           # 6-dimension schema (5 tables)
│   ├── auth.ts             # Better Auth configuration
│   ├── mutations/          # Write operations
│   │   ├── things.ts       # CRUD for entities
│   │   ├── connections.ts  # CRUD for relationships
│   │   ├── groups.ts       # CRUD for groups
│   │   └── ...
│   ├── queries/            # Read operations
│   │   ├── things.ts       # Entity queries
│   │   ├── connections.ts  # Relationship queries
│   │   └── ...
│   ├── services/           # Effect.ts business logic (future)
│   └── types/
│       └── ontology.ts     # Auto-generated types from YAML
└── .env.local              # Environment variables
```

---

## Database Schema

**5 tables implement 6 dimensions:**

1. **groups** - Multi-tenant containers (Dimension 1)
2. **entities** - People (Dimension 2) + Things (Dimension 3)
3. **connections** - Relationships (Dimension 4)
4. **events** - Audit trail (Dimension 5)
5. **knowledge** - Embeddings + labels (Dimension 6)

**Why 5 tables for 6 dimensions?**

People are stored as entities with `type: "user"`. This eliminates joins and simplifies queries.

### Groups Table

```typescript
{
  _id: Id<"groups">,
  slug: string,
  name: string,
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  parentGroupId?: Id<"groups">,  // Hierarchical nesting
  settings: {
    visibility: "public" | "private",
    plan?: "starter" | "pro" | "enterprise"
  },
  status: "active" | "archived",
  createdAt: number,
  updatedAt: number
}
```

### Entities Table

```typescript
{
  _id: Id<"entities">,
  groupId: Id<"groups">,           // REQUIRED: Multi-tenant scope
  type: string,                    // 66+ types from ontology
  name: string,
  properties: any,                 // Type-specific JSON data
  status: "draft" | "active" | "published" | "archived",
  schemaVersion: number,
  createdAt: number,
  updatedAt: number,
  deletedAt?: number               // Soft delete
}
```

### Connections Table

```typescript
{
  _id: Id<"connections">,
  groupId: Id<"groups">,
  fromEntityId: Id<"entities">,
  toEntityId: Id<"entities">,
  relationshipType: string,        // 25+ types from ontology
  metadata?: any,
  strength?: number,
  validFrom?: number,
  validTo?: number,
  createdAt: number,
  updatedAt: number
}
```

### Events Table

```typescript
{
  _id: Id<"events">,
  groupId: Id<"groups">,
  type: string,                    // 67+ types from ontology
  actorId?: Id<"entities">,        // Who did this
  targetId?: Id<"entities">,       // What was affected
  timestamp: number,
  metadata?: any,
  archived?: boolean
}
```

### Knowledge Table

```typescript
{
  _id: Id<"knowledge">,
  groupId: Id<"groups">,
  knowledgeType: "label" | "document" | "chunk" | "vector_only",
  text?: string,
  embedding?: number[],            // Vector for RAG
  embeddingModel?: string,
  sourceThingId?: Id<"entities">,
  labels?: string[],
  metadata?: any,
  createdAt: number,
  updatedAt: number
}
```

---

## Development Commands

### Start Development Server

```bash
cd backend/
npx convex dev
```

**What this does:**
- Watches for code changes
- Auto-deploys to dev environment
- Hot-reloads functions
- Shows logs in terminal

### Deploy to Production

```bash
npx convex deploy
```

**What this does:**
- Builds production bundle
- Deploys to Convex Cloud
- Runs migrations if needed
- Updates function endpoints

### Run Queries from CLI

```bash
# List entities of a type
npx convex run queries/things:list '{"groupId": "...", "type": "user"}'

# Get specific entity
npx convex run queries/things:get '{"entityId": "..."}'

# List connections
npx convex run queries/connections:list '{"groupId": "...", "relationshipType": "owns"}'
```

### View Function Logs

```bash
# Last 50 logs (all)
npx convex logs --history 50

# Only successful calls
npx convex logs --history 50 --success

# Only errors
npx convex logs --history 50 --error

# Watch live logs
npx convex logs --watch
```

### Generate Ontology Types

```bash
cd ..  # Go to root
bun run scripts/generate-ontology-types.ts
```

**What this does:**
- Reads YAML ontology files
- Generates TypeScript types
- Creates `backend/convex/types/ontology.ts`
- Exports THING_TYPES, CONNECTION_TYPES, EVENT_TYPES arrays

---

## Environment Variables

Create `backend/.env.local`:

```bash
# Convex deployment
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Resend (for transactional emails)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Better Auth (same secret as frontend)
BETTER_AUTH_SECRET=your-secret-key
```

**Security:**
- Never commit `.env.local` to git
- Use different secrets for dev/prod
- Rotate secrets periodically

---

## Key Concepts

### Multi-Tenant Isolation

Every entity belongs to a **group** (via `groupId`).

**Why?**
- Data separation between organizations
- Access control per group
- Billing per group
- Hierarchical nesting (parent → child groups)

**Implementation:**
```typescript
// ALWAYS filter by groupId first
const entities = await ctx.db
  .query("entities")
  .withIndex("group_type", q =>
    q.eq("groupId", args.groupId).eq("type", args.type)
  )
  .collect();
```

### Ontology Types

Types are **dynamically generated from YAML files**:

```
ontologies/
├── core.yaml          # Base types (user, creator, agent)
├── blog.yaml          # Blog types (blog_post, comment)
├── portfolio.yaml     # Portfolio types (project, skill)
└── ...
```

**Generated types:**
- THING_TYPES: 66+ entity types
- CONNECTION_TYPES: 25+ relationship types
- EVENT_TYPES: 67+ event types

**Validation:**
```typescript
import { isThingType } from "../types/ontology";

if (!isThingType(args.type)) {
  throw new Error(`Invalid type: ${args.type}`);
}
```

### Event Logging

Every mutation logs an event:

```typescript
await ctx.db.insert("events", {
  groupId: groupId,
  type: "thing_created",
  actorId: actor._id,
  targetId: entityId,
  timestamp: Date.now(),
  metadata: {
    entityType: args.type,
    entityName: args.name
  }
});
```

**Why log events?**
- Audit compliance (who did what when)
- Analytics (user behavior)
- Debugging (trace operations)
- AI training (learn from past actions)

### Authentication Flow

1. User signs in via Better Auth (frontend)
2. Better Auth creates session token
3. Token passed to Convex functions via `ctx.auth`
4. Backend validates token and gets identity
5. Backend finds user entity in group
6. Backend checks permissions (role-based)

```typescript
// Get identity
const identity = await ctx.auth.getUserIdentity();

// Find user entity
const user = await ctx.db
  .query("entities")
  .withIndex("group_type", q =>
    q.eq("groupId", groupId).eq("type", "user")
  )
  .filter(q =>
    q.eq(q.field("properties.userId"), identity.tokenIdentifier)
  )
  .first();

// Check role
const role = user.properties.role;
if (role === "customer" && operation === "delete") {
  throw new Error("Insufficient permissions");
}
```

---

## Common Patterns

### Create Entity

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    groupId: v.id("groups"),
    type: v.string(),
    name: v.string(),
    properties: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // 2. Validate group
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    // 3. Create entity
    const entityId = await ctx.db.insert("entities", {
      groupId: args.groupId,
      type: args.type,
      name: args.name,
      properties: args.properties || {},
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // 4. Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "thing_created",
      targetId: entityId,
      timestamp: Date.now(),
      metadata: { entityType: args.type }
    });

    return entityId;
  }
});
```

### Query Entities

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    groupId: v.id("groups"),
    type: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entities")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId).eq("type", args.type)
      )
      .filter(q => q.eq(q.field("deletedAt"), undefined))
      .collect();
  }
});
```

### Create Connection

```typescript
export const connect = mutation({
  args: {
    groupId: v.id("groups"),
    fromEntityId: v.id("entities"),
    toEntityId: v.id("entities"),
    relationshipType: v.string()
  },
  handler: async (ctx, args) => {
    // Authenticate + validate...

    const connectionId = await ctx.db.insert("connections", {
      groupId: args.groupId,
      fromEntityId: args.fromEntityId,
      toEntityId: args.toEntityId,
      relationshipType: args.relationshipType,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "connection_created",
      targetId: connectionId,
      timestamp: Date.now(),
      metadata: { relationshipType: args.relationshipType }
    });

    return connectionId;
  }
});
```

---

## Testing

### Unit Tests (Future)

```bash
bun test backend/
```

### Integration Tests

Use Convex dev environment for testing:

```bash
# Start dev server
npx convex dev

# Run test mutations/queries
npx convex run mutations/things:create '{"groupId": "...", "type": "user", "name": "Test"}'
```

### Manual Testing

1. Open Convex dashboard: https://dashboard.convex.dev
2. Navigate to your deployment
3. Use "Functions" tab to call mutations/queries
4. Check "Data" tab to verify database state

---

## Troubleshooting

### Schema changes not reflecting

```bash
# Restart dev server
npx convex dev
```

### Type errors after ontology changes

```bash
# Regenerate types
bun run scripts/generate-ontology-types.ts

# Restart Convex dev server
npx convex dev
```

### Authentication not working

Check that `BETTER_AUTH_SECRET` matches between frontend and backend `.env.local` files.

### Query performance issues

Check indexes in schema. Queries without indexes scan entire table (slow).

```typescript
// Good: Uses index
.withIndex("group_type", q =>
  q.eq("groupId", groupId).eq("type", type)
)

// Bad: Full table scan
.filter(q => q.eq(q.field("groupId"), groupId))
```

---

## Next Steps

**For deeper implementation details:**
- Read `/backend/CLAUDE.md` - Backend patterns for AI agents
- Read `/backend/convex/CLAUDE.md` - Convex-specific database patterns

**For ontology details:**
- Read `/one/knowledge/ontology.md` - Complete 6-dimension specification

**For development workflow:**
- Read `/one/connections/workflow.md` - 6-phase feature development

---

**Backend: Implementing reality as code. 98% AI accuracy through pattern convergence.**
