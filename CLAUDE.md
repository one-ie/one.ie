# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL RULES - NEVER BREAK THESE

**THESE RULES ARE NON-NEGOTIABLE:**

1. **NEVER run `git rebase`** - ever, under any circumstances
2. **NEVER run `git push --force`** - always ask first
3. **NEVER run commands that delete files** - always ask first
4. **ALWAYS ask before any potentially destructive operation** - staged deletion, force push, rewriting history, etc.

If you are about to run a command that could lose work, destroy commits, or overwrite history, STOP and ask the user for explicit approval first.

---

## Cascading Context System

**You are reading the ROOT context file.** As you navigate deeper into the codebase, read directory-specific CLAUDE.md files:

```
/CLAUDE.md (this file - global)
  ↓ Navigate to subdirectory
/backend/CLAUDE.md (backend-specific, takes precedence in backend/)
  ↓ Navigate deeper
/backend/convex/CLAUDE.md (Convex-specific, highest precedence in convex/)
```

**Precedence rule:** Closer to the file you're editing = higher precedence.

### Parallel Agent Execution

**CRITICAL:** When tasks can be done independently, spawn agents in PARALLEL (not sequentially).

**Send a SINGLE message with multiple Task tool calls** to execute agents concurrently:

- Frontend + Backend agents working simultaneously
- Multiple feature agents in parallel
- Documentation + Implementation at the same time

**Example:** If you need to create web/CLAUDE.md and backend/CLAUDE.md, spawn both agent-frontend and agent-backend in ONE message (not two sequential messages).

**Result:** 2-5x faster execution through parallelization.

---

## Architecture Overview

**ONE Platform** is a multi-tenant AI-native platform built on a **6-dimension ontology** that models reality itself (not just data).

**Every single thing in ONE platform exists within one of these 6 dimensions:**

```
┌──────────────────────────────────────────────────────────────┐
│                         1. GROUPS                             │
│  Multi-tenant isolation with hierarchical nesting - who owns  │
│  what at group level (friend circles → DAOs → governments)    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                         2. PEOPLE                             │
│  Authorization & governance - platform owner, group owners    │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                         3. THINGS                             │
│  Every "thing" - users, agents, content, tokens, courses      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                      4. CONNECTIONS                           │
│  Every relationship - owns, follows, taught_by, powers        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                         5. EVENTS                             │
│  Every action - purchased, created, viewed, completed         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                       6. KNOWLEDGE                            │
│  Labels + chunks + vectors powering RAG & search              │
└──────────────────────────────────────────────────────────────┘
```

**The architecture separates concerns into three layers:**

```
Web (Astro + React) → Backend (Convex) → 6-Dimension Ontology
```

**Why this architecture enables 98% AI code generation accuracy:** Each feature maps to the SAME 6 dimensions. Patterns converge (not diverge). Accuracy compounds over time (85% → 98%), not degrades (95% → 30%).

**Key Repositories:**

- `/web` - Main web application (Astro 5, React 19, Tailwind v4)
- `/backend` - Headless Convex backend (6-dimension ontology, auth, real-time)
- `/apps` - Example applications and integrations
- `/one` - Comprehensive platform documentation (41 files, 8 layers)

## Planning Paradigm: Cycle-Based Execution

**CRITICAL:** We don't plan in days. We plan in **cycle passes** (Cycle 1-100).

### Why Cycle-Based Planning?

Traditional planning uses time estimates ("Day 1-3", "Week 2"), which are:
- Inaccurate (time varies wildly)
- Context-heavy (requires re-planning)
- Sequential (blocks parallel work)

Cycle-based planning uses **sequence positions** ("Cycle 1-100"), which are:
- Precise (each cycle is a concrete step)
- Context-light (< 3000 tokens per cycle)
- Parallel-friendly (cycles can run concurrently when dependencies allow)

### The 100-Cycle Template

Every feature follows a **100-cycle sequence** (see `one/knowledge/todo.md`):

```
Cycle 1-10:    Foundation & Setup (validate, map, plan)
Cycle 11-20:   Backend Schema & Services (database, business logic)
Cycle 21-30:   Frontend Pages & Components (UI, interactions)
Cycle 31-40:   Integration & Connections (external systems)
Cycle 41-50:   Authentication & Authorization (security)
Cycle 51-60:   Knowledge & RAG (embeddings, search)
Cycle 61-70:   Quality & Testing (unit, integration, e2e)
Cycle 71-80:   Design & Wireframes (UI/UX, accessibility)
Cycle 81-90:   Performance & Optimization (speed, efficiency)
Cycle 91-100:  Deployment & Documentation (production, guides)
```

### How to Use Cycle Planning

1. **Start with the sequence:** Read `one/knowledge/todo.md` to understand the flow
2. **Do the next thing:** Execute the next cycle in sequence
3. **Use hooks for context:**
   - `.claude/hooks/todo` loads current cycle context automatically
   - `.claude/hooks/done` marks complete and advances to next
4. **Adapt as needed:** Skip irrelevant cycles, add extras for complex features
5. **Run in parallel:** Execute independent cycles concurrently (e.g., Backend + Frontend after schema defined)

### Commands for Cycle Workflow

```
     ██████╗ ███╗   ██╗███████╗
    ██╔═══██╗████╗  ██║██╔════╝
    ██║   ██║██╔██╗ ██║█████╗
    ██║   ██║██║╚██╗██║██╔══╝
    ╚██████╔╝██║ ╚████║███████╗
     ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real

   https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  /now   /next   /todo   /done
 /build /design /deploy  /see
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Workflow Commands:**
- `/now` - Display current cycle and what you're working on
- `/next` - Advance to next cycle and load context
- `/todo` - View complete task list (100-cycle sequence)
- `/done` - Mark current cycle complete and advance

**Creation Commands:**
- `/build` - Build features with AI specialists
- `/design` - Create wireframes & UI components
- `/deploy` - Ship to production

**Insight Commands:**
- `/see` - View analytics, refine vision, explore courses

### Benefits

- **98% context reduction:** 150k tokens → 3k tokens per cycle
- **5x faster execution:** 115s → 20s per feature average
- **Flawless execution:** "Do the next thing, perfectly"
- **Continuous learning:** Lessons captured after each cycle
- **Parallel execution:** Multiple cycles running concurrently

**Golden Rule:** Plan in cycles, not days. Where in the sequence does each thing belong?

## The 6-Dimension Ontology (Core Data Model)

**CRITICAL:** Every feature MUST map to these 6 dimensions. If it doesn't, rethink your approach.

### 1. groups

Hierarchical containers for collaboration - who belongs where and at what level

- **Infinite nesting:** Groups can contain groups (parent → child → grandchild...)
- **6 group types:** friend_circle, business, community, dao, government, organization
- **Data scoping:** All dimensions (things, connections, events, knowledge) scoped to groupId
- **Flexible scale:** From friend circles (2 people) to governments (billions of people)
- **Multi-tenancy:** Each group has independent data, billing, quotas, and customization
- **Hierarchical access:** Parent groups can access child group data (configurable)
- **Plans:** starter, pro, enterprise (at organization level)

### 2. people

Authorization & governance - who can do what

- **4 roles**: platform_owner, org_owner, org_user, customer
- Represented as things with `type: 'creator'` and `properties.role`
- Every action has an actor (person)

### 3. things (entities table)

All nouns in the system - users, agents, content, tokens, courses

- **66+ entity types** defined in schema
- Flexible `properties` field for type-specific data
- Status lifecycle: draft → active → published → archived
- Every thing belongs to a group (scoped via groupId)

### 4. connections

All relationships between entities

- **25+ connection types**: owns, authored, holds_tokens, enrolled_in, etc.
- **7 consolidated types** with rich metadata: transacted, communicated, delegated, etc.
- Bidirectional with temporal validity (validFrom/validTo)
- Scoped to groups (via groupId)

### 5. events

All actions and state changes over time

- **67+ event types** including cycle and blockchain events
- Complete audit trail with actor (person), target (thing), timestamp
- **Consolidated event families** with metadata.protocol for multi-protocol support
- Scoped to groups (via groupId)

### 6. knowledge

Labels, embeddings, and semantic search

- Vector storage for RAG (Retrieval-Augmented Generation)
- Linked to things via junction table
- Supports categorization and taxonomy
- Scoped to groups (via groupId)

**Golden Rule:** If you can't map a feature to these 6 dimensions, you're thinking about it wrong.

**Implementation:** The 6 dimensions are implemented using 5 database tables (groups, things, connections, events, knowledge), with people represented as things with role metadata.

**Schema Structure:**

```typescript
// groups table
{
  _id: Id<"groups">,
  name: string,
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  parentGroupId?: Id<"groups">,  // For hierarchical nesting
  properties: {
    description?: string,
    plan?: "starter" | "pro" | "enterprise",
    settings?: any,
    // ... type-specific fields
  },
  status: "draft" | "active" | "archived",
  createdAt: number,
  updatedAt: number
}

// All other dimensions include groupId:
things → groupId: Id<"groups">
connections → groupId: Id<"groups">
events → groupId: Id<"groups">
knowledge → groupId: Id<"groups">
```

## Installation Folders

**NEW:** Each ONE installation can have a top-level folder for organization-specific customization.

### Architecture

```
/
├── one/                    # Global templates (everyone uses these)
│   └── knowledge/
│       └── ontology.md     # Universal 6-dimension ontology
├── <installation-name>/    # Customer-specific overrides
│   ├── knowledge/
│   │   ├── brand-guide.md  # Custom branding only
│   │   ├── features.md     # Organization features
│   │   └── rules.md        # Org-specific rules
│   └── groups/             # Hierarchical group docs
├── web/
├── backend/
└── .claude/
```

### What Goes Where

**Global (everyone uses):**
- `/one/knowledge/ontology.md` - Universal 6-dimension ontology
- `/one/knowledge/architecture.md` - Platform architecture
- All `/one/*` documentation

**Installation-specific (per organization):**
- Brand identity (colors, logos, fonts, tone)
- Organization features and capabilities
- Group-specific documentation
- Custom business rules

### Key Principle

**Data isolation happens via `groupId` in the database, NOT via schema customization.**

The 6-dimension ontology is universal and flexible enough for all use cases.

### Initialize Installation

```bash
npx oneie init
# Prompts for organization name and installation identifier
# Creates folder structure and updates .env.local
```

### Usage

**Add installation-specific branding:**
```bash
mkdir -p /acme/knowledge
echo "# Acme Brand Guide" > /acme/knowledge/brand-guide.md
```

**Document organization features:**
```bash
echo "# Acme Features" > /acme/knowledge/features.md
```

**Add group-specific docs:**
```bash
mkdir -p /acme/groups/engineering
echo "# Engineering Practices" > /acme/groups/engineering/practices.md
```

### Important Distinctions

- **Installation folder** = Filesystem customization for branding and features
- **Database groups** = Runtime data isolation per group (via `groupId`)
- One installation can serve many database groups
- **ONE ontology** = Universal schema shared by all installations

### Security

- Never store secrets in installation folders
- Use `.env.local` for sensitive configuration
- Installation folders excluded from git by default

## Development Commands

### Frontend Development

```bash
cd web/

# Development server (localhost:4321)
bun run dev

# Build for production (includes type checking)
bun run build

# Type checking only
bunx astro check

# Generate content collection types
bunx astro sync

# Linting
bun run lint

# Formatting
bun run format
```

## Frontend-First Development (Default Mode)

**CRITICAL:** All agents default to frontend-only development unless explicitly requested otherwise.

### Default Behavior

**Frontend-only is the DEFAULT for ALL agents across the platform.**

When building features, agents MUST:
1. Build ONLY frontend code by default
2. Use client-side state management (nanostores)
3. Integrate third-party services via direct API calls (Stripe.js, OpenAI client SDK, etc.)
4. Store data in browser (localStorage, IndexedDB) or third-party services
5. NEVER create backend code unless explicitly requested

### When Backend is NOT Needed

Frontend-only works perfectly for:

- **Ecommerce stores**: Stripe.js handles payments, no backend needed
- **LMS platforms**: Content in Astro pages, progress in localStorage
- **SaaS tools**: Third-party APIs (OpenAI, Anthropic, Stripe) via client SDKs
- **Marketing sites**: Static pages with forms, analytics, chat widgets
- **Documentation sites**: Content collections with search
- **Landing pages**: Interactive demos, forms, newsletters
- **Portfolio sites**: Projects, case studies, contact forms
- **Blogs**: Content collections with comments (Giscus, Utterances)

### Frontend Stack (Default Tools)

Use these tools for frontend-only development:

- **State Management**: nanostores (persistent atoms, maps, computed)
- **UI Components**: React 19 + shadcn/ui (50+ accessible components)
- **Styling**: Tailwind CSS v4 (CSS-based configuration)
- **Pages**: Astro 5 (file-based routing, SSR, islands)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: fetch API, SWR, React Query
- **Storage**: localStorage, sessionStorage, IndexedDB
- **Payments**: Stripe.js (client-side only)
- **Auth**: Better Auth (client-side hooks)
- **Analytics**: Plausible, Fathom (script tags)

### When to Use Backend

Backend is ONLY needed when user explicitly says:

1. **"Use backend"** - Direct request for backend integration
2. **"Add groups"** - Multi-tenant data isolation requires backend
3. **"Add multi-user"** - User collaboration requires backend
4. **"Track events"** - Immutable audit trail requires backend
5. **"Build RAG"** - Vector embeddings require backend
6. **"Real-time updates"** - WebSocket sync requires backend

### Backend Integration (Only When Requested)

If user explicitly requests backend, integrate via:

- **Services Layer**: `/web/src/services/` - Business logic and API wrappers
- **Providers Layer**: `/web/src/providers/` - React context for state management
- **Convex Client**: `useQuery` and `useMutation` hooks for backend calls
- **API Routes**: `/web/src/pages/api/` for serverless functions

Example structure when backend is explicitly requested:

```typescript
// /web/src/services/products.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const client = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

export const productService = {
  list: () => client.query(api.queries.products.list),
  create: (data) => client.mutation(api.mutations.products.create, data),
};

// /web/src/providers/ProductProvider.tsx
import { createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const products = useQuery(api.queries.products.list);
  return <ProductContext.Provider value={{ products }}>{children}</ProductContext.Provider>;
};

export const useProducts = () => useContext(ProductContext);
```

### Golden Rule

**Default to frontend-only. Only add backend when explicitly requested.**

- ✅ User says "build ecommerce store" → Frontend-only with Stripe.js
- ✅ User says "build ecommerce store with groups" → Add backend for multi-tenancy
- ✅ User says "build LMS" → Frontend-only with content collections
- ✅ User says "build LMS with real-time progress" → Add backend for events
- ✅ User says "add payments" → Frontend-only with Stripe.js
- ✅ User says "add payments and track events" → Add backend for event logging

**When in doubt, ask:** "Do you need multi-user groups, or can this work as a single-user frontend-only app?"

### Backend Development

```bash
cd backend/

# Start Convex dev server (watch mode)
npx convex dev

# Deploy to production
npx convex deploy

# Run query from CLI
npx convex run queries/entities:list '{"type": "user"}'

# View function logs
npx convex logs --history 50 --success
```

### Testing

```bash
cd web/

# Run all tests
bun test

# Run auth tests specifically
bun test test/auth

# Watch mode
bun test --watch
```

**Test Coverage:**

- 50+ test cases for authentication (6 methods: email/password, OAuth, magic links, password reset, email verification, 2FA)
- Integration tests verify frontend → backend auth flows
- Backend connection: `https://shocking-falcon-870.convex.cloud`

## Technology Stack

### Frontend Layer

- **Astro 5.14+**: Static site generation + server-side rendering
- **React 19**: Islands architecture with selective hydration
- **Tailwind CSS v4**: CSS-based configuration (no JS config)
- **shadcn/ui**: 50+ pre-installed accessible components
- **TypeScript 5.9+**: Strict mode with path aliases
- **Better Auth**: Multi-method authentication

### Backend Layer

- **Convex**: Real-time database with typed functions
- **Better Auth + Convex Adapter**: Authentication system
- **@convex-dev/resend**: Email component for transactional emails
- **@convex-dev/rate-limiter**: Brute force protection

### Deployment

- **Frontend**: Cloudflare Pages with React 19 SSR (using `react-dom/server.edge`)
- **Backend**: Convex Cloud (`shocking-falcon-870.convex.cloud`)
- **Edge Runtime**: Cloudflare Workers compatibility

## Root Directory File Policy

**CRITICAL:** Only these markdown files belong in the root directory:
- **README.md** - Platform overview and quick start
- **LICENSE.md** - Legal terms and conditions
- **SECURITY.md** - Security policy and vulnerability reporting
- **CLAUDE.md** - Claude Code instructions (this file)
- **AGENTS.md** - AI agent coordination and rules

All other documentation belongs in the `one/` directory following the 6-dimension ontology:
- **one/events/** - Deployment plans, release notes, test results, agent summaries
- **one/knowledge/** - Architecture, patterns, rules, guides
- **one/connections/** - Protocols, workflows, integrations
- **one/things/** - Specifications, plans, agent definitions
- **one/people/** - Roles, governance, organization

**Why:** This keeps the root clean and scannable, while organizing all documentation by ontology dimensions.

## File Structure

```
ONE/
├── web/                         # Main Astro application
│   ├── src/
│   │   ├── pages/              # File-based routing
│   │   ├── components/         # React components + shadcn/ui
│   │   ├── layouts/            # Page layouts
│   │   ├── content/            # Content collections (blog, etc.)
│   │   ├── lib/                # Utilities
│   │   └── styles/             # Global CSS + Tailwind config
│   ├── convex/                 # Convex schema and functions (legacy)
│   └── test/                   # Test suites
│
├── backend/                     # Headless Convex backend
│   └── convex/
│       ├── schema.ts           # 6-dimension ontology schema (5 tables)
│       ├── auth.ts             # Better Auth configuration
│       ├── queries/            # Read operations
│       ├── mutations/          # Write operations
│       └── _generated/         # Auto-generated types
│
├── one/                         # Platform documentation (41 files)
│   ├── connections/            # Ontology, protocols, patterns
│   ├── things/                 # Architecture, specifications
│   ├── events/                 # Event specifications, deployment history
│   ├── knowledge/              # RAG, AI, implementation
│   └── people/                 # Roles, governance, organization
│
├── .claude/                     # Claude Code configuration
│   ├── agents/                 # AI agent definitions (agent-ops, etc.)
│   └── commands/               # Slash commands (/release, etc.)
│
└── apps/                        # Example applications
    ├── one/                    # Assembly repository (synced from root)
    ├── eliza/                  # ElizaOS integration
    └── stack/                  # Stack Auth example
```

## Development Workflow (6-Phase Process)

Before implementing ANY feature, follow this workflow defined in `one/connections/workflow.md`:

### Phase 1: UNDERSTAND

1. Read `/one/knowledge/ontology.md` (universal 6-dimension ontology)
2. Read `web/AGENTS.md` (Convex patterns and quick reference)
3. Read `/one/knowledge/rules.md` (golden rules for AI agents)
4. Check installation folder for branding: `/<installation>/knowledge/brand-guide.md` (if exists)
5. Identify feature category (entity, relationship, action, query)
6. Find similar patterns in existing code

### Phase 2: MAP TO ONTOLOGY

1. Identify **groups** (which group owns this? any parent/child relationships?)
2. Identify **people** (who can access/modify this?)
3. Identify **things** (what entities are involved?)
4. Identify **connections** (how do they relate?)
5. Identify **events** (what actions need logging?)
6. Identify **knowledge** (what needs to be learned/searched?)
7. Check if group has specific docs in `/<installation-name>/groups/<group-slug>/`

### Phase 3: DESIGN SERVICES

1. Design Effect.ts service (pure business logic)
2. Define types (no `any` except in entity `properties`)
3. Define errors (tagged unions with `_tag`)
4. Plan dependencies and layers

### Phase 4: IMPLEMENT BACKEND

1. Update schema if needed (`backend/convex/schema.ts`)
2. Create Convex mutations/queries (thin wrappers)
3. Implement Effect.ts services (`convex/services/`)
4. Add proper error handling

### Phase 5: BUILD FRONTEND

1. Create React components (`src/components/features/`)
2. Use shadcn/ui components
3. Add loading/error states
4. Create Astro pages with SSR data fetching
5. Add `client:load` for interactive components

### Phase 6: TEST & DOCUMENT

1. Write unit tests for services
2. Write integration tests for full flows
3. Update documentation:
   - **Platform-wide features:** Add to `/one/<dimension>/`
   - **Organization features:** Add to `/<installation-name>/knowledge/features.md`
   - **Group-specific practices:** Add to `/<installation-name>/groups/<group-slug>/`
4. Run type checking (`bunx astro check`)

## Key Patterns and Best Practices

### Convex Query Pattern

```typescript
// backend/convex/queries/entities.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});
```

### Convex Mutation Pattern

```typescript
// backend/convex/mutations/entities.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    groupId: v.id("groups"),
    type: v.string(),
    name: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    const entityId = await ctx.db.insert("things", {
      groupId: args.groupId,
      type: args.type,
      name: args.name,
      properties: args.properties,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log creation event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "entity_created",
      actorId: ctx.auth?.getUserIdentity()?.tokenIdentifier,
      targetId: entityId,
      timestamp: Date.now(),
      metadata: { entityType: args.type },
    });

    return entityId;
  },
});
```

### Hierarchical Group Pattern

```typescript
// backend/convex/mutations/groups.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create parent group
export const createOrganization = mutation({
  args: {
    name: v.string(),
    plan: v.optional(v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise"))),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      type: "organization",
      parentGroupId: undefined,  // Top-level group
      properties: {
        plan: args.plan || "starter",
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return groupId;
  },
});

// Create child group (e.g., department within organization)
export const createSubGroup = mutation({
  args: {
    parentGroupId: v.id("groups"),
    name: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    ),
  },
  handler: async (ctx, args) => {
    // Verify parent exists
    const parent = await ctx.db.get(args.parentGroupId);
    if (!parent) throw new Error("Parent group not found");

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      type: args.type,
      parentGroupId: args.parentGroupId,  // Link to parent
      properties: {},
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return groupId;
  },
});
```

### React Component with Convex Hooks

```typescript
// frontend/src/components/features/EntityList.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EntityList({ groupId, type }: { groupId: string; type: string }) {
  const entities = useQuery(api.queries.entities.list, { groupId, type });

  if (entities === undefined) return <div>Loading...</div>;

  return (
    <div>
      {entities.map((entity) => (
        <div key={entity._id}>{entity.name}</div>
      ))}
    </div>
  );
}
```

### Astro Page with SSR

```astro
---
// frontend/src/pages/groups/[groupId]/entities/[type].astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import EntityList from "@/components/features/EntityList";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const entities = await convex.query(api.queries.entities.list, {
  groupId: Astro.params.groupId,
  type: Astro.params.type
});
---

<Layout>
  <h1>{Astro.params.type} Entities</h1>
  <EntityList
    client:load
    groupId={Astro.params.groupId}
    type={Astro.params.type}
  />
</Layout>
```

### Tailwind v4 Styling

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 222.2 47.4% 11.2%;
}

/* Dark mode overrides */
@variant dark (.dark &);

.dark {
  --color-background: 222.2 84% 4.9%;
  --color-foreground: 210 40% 98%;
}

/* Use colors with hsl() wrapper */
.my-component {
  background-color: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
}
```

## Important Guidelines

### Authentication

- Backend handles all auth logic (`backend/convex/auth.ts`)
- Frontend uses Better Auth client hooks
- 6 authentication methods supported
- All auth pages under `/account/*` route

### Environment Variables

**Root (.env) - CRITICAL FOR DEPLOYMENTS:**

```bash
# Cloudflare Global API Key - FULL ACCESS to Cloudflare API
# This provides complete programmatic access for automated deployments
CLOUDFLARE_GLOBAL_API_KEY=your-cloudflare-global-api-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_EMAIL=your-cloudflare-email

# Alternative: Cloudflare API Token (scoped access)
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```

**IMPORTANT:** The `CLOUDFLARE_GLOBAL_API_KEY` in `.env` provides **FULL ACCESS** to the Cloudflare API. This enables automated deployments via `./scripts/cloudflare-deploy.sh` and the `/release` command without manual intervention. Keep this key secure and never commit `.env` to version control.

**Web (.env.local):**

```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:4321
# OAuth credentials...
```

**Backend (.env.local):**

```bash
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Tailwind v4 Specifics

- NO `tailwind.config.mjs` file - use CSS `@theme` blocks
- ALWAYS use HSL format: `--color-name: 0 0% 100%`
- ALWAYS wrap with `hsl()`: `hsl(var(--color-background))`
- NO `@apply` directive in Tailwind v4
- Use `@variant dark (.dark &)` for dark mode
- Add `@source` directive to scan component files

### React 19 + Cloudflare

- Uses `react-dom/server.edge` for SSR compatibility
- Configured in `astro.config.mjs` with Vite alias
- Deployed to Cloudflare Pages with edge rendering

### Content Collections

- Blog posts in `src/content/blog/`
- Type-safe schemas in `src/content/config.ts`
- Run `bunx astro sync` after content changes
- Use `CollectionEntry<"blog">` type (lowercase)

## Common Issues and Solutions

### Issue: TypeScript errors after schema changes

```bash
cd backend && npx convex dev  # Regenerate types
cd web && bunx astro check
```

### Issue: Auth not working

Check that BETTER_AUTH_SECRET matches between frontend and backend `.env.local` files.

### Issue: Hydration mismatch

Add `client:load` directive to interactive React components used in Astro pages.

### Issue: Tailwind styles not applying

Ensure colors use HSL format wrapped with `hsl()` function, not OKLCH or raw values.

### Issue: Build fails on Cloudflare

Verify `react-dom/server.edge` alias is set in `astro.config.mjs` under `vite.resolve.alias`.

## Critical Reading Before Coding

**For ANY feature implementation, read in this order:**

1. **`/one/knowledge/ontology.md`** - Universal 6-dimension ontology specification (Version 1.0.0)
2. **`web/AGENTS.md`** - Quick reference for Convex patterns
3. **`/one/knowledge/rules.md`** - Golden rules for AI development
4. **`/one/connections/workflow.md`** - 6-phase development workflow
5. **`/one/connections/patterns.md`** - Proven code patterns to replicate
6. **Check installation folder** (if `INSTALLATION_NAME` is set):
   - `/<installation-name>/knowledge/brand-guide.md` (custom branding)
   - `/<installation-name>/knowledge/features.md` (organization features)
   - `/<installation-name>/knowledge/rules.md` (org-specific rules)
   - `/<installation-name>/groups/<group-slug>/` (group-specific docs)

**For specific feature types:**

- **Protocol integration**: `one/connections/protocols.md` + specific protocol doc
- **External integration**: `one/connections/communications.md` + specific integration doc
- **Blockchain features**: `one/connections/cryptonetworks.md`
- **Agent features**: `one/things/agentkit.md`, `one/things/copilotkit.md`
- **Cycle/AI**: `one/connections/cycle.md`

## Documentation Structure

The `one/` directory contains **41 documentation files** organized in **8 layers**:

1. **Strategy Layer**: Vision, revenue, organization
2. **Ontology Layer**: Core data model and 6 dimensions
3. **Protocols Layer**: A2A, ACP, AP2, X402, AG-UI specifications
4. **Services Layer**: Effect.ts patterns, service providers
5. **Implementation Layer**: Frontend, architecture, patterns
6. **Integration Layer**: ElizaOS, CopilotKit, MCP, N8N
7. **Examples Layer**: Lemonade stand, enterprise CRM
8. **Plans Layer**: Future enhancements and technical debt

**Use targeted reading:** Don't read everything - follow the critical path for your specific feature type.

## Deployment

### Automated Release (v3.0.0+)

**Use `/release` command for complete deployment:**

```bash
# Patch release (bug fixes)
/release patch

# Minor release (new features)
/release minor

# Major release (breaking changes)
/release major

# Sync files without version bump
/release sync
```

**The release process automatically:**
1. Bumps version in `cli/package.json`
2. Syncs 518+ files from root to `cli/` and `apps/one/`:
   - `/one/*` → `cli/one/` and `apps/one/one/`
   - `/.claude/*` → `cli/.claude/` and `apps/one/one/.claude/`
   - `/web/*` → `apps/one/web/` (git subtree)
   - `CLAUDE.md`, `README.md`, `LICENSE.md`, `SECURITY.md` → all targets
   - `web/AGENTS.md` → `apps/one/one/AGENTS.md`
3. Commits and pushes to:
   - `github.com/one-ie/cli`
   - `github.com/one-ie/web`
   - `github.com/one-ie/one` (apps/one assembly repo)
4. Publishes to npm: `oneie@<version>`
5. Builds and deploys web to Cloudflare Pages

**Live URLs:**
- npm: https://www.npmjs.com/package/oneie
- Web: https://web.one.ie
- CLI: https://github.com/one-ie/cli
- One: https://github.com/one-ie/one

See `.claude/commands/release.md` and `.claude/agents/agent-ops.md` for details.

### Manual Deployment

**Web (Cloudflare Pages):**

```bash
cd web/
bun run build
wrangler pages deploy dist --project-name=web
```

**Backend (Convex Cloud):**

```bash
cd backend/
npx convex deploy
```

Convex automatically deploys on git push when connected to GitHub.

## The English → Code → Reality Workflow

**In Minutes, Not Months**

Describe your feature in plain English. The system validates it against the ontology, compiles to TypeScript, generates tests, and deploys to the edge.

### The Four-Step Workflow

#### 1️⃣ Write in English

Describe what you want: `"CREATE ai clone"`, `"CALL OpenAI"`, `"RECORD purchase"`. Use 15 simple commands anyone can understand.

```
Creator: "CREATE my AI clone"
Seller: "RECORD purchase event"
Engineer: "CONNECT to Stripe API"
```

#### 2️⃣ System Validates

Checks against the ontology: Do these entity types exist? Are connections valid? Are services available? Instant feedback.

```
✓ ai_clone entity type exists
✓ tokens_purchased event valid
✓ Stripe service available
```

#### 3️⃣ Code Generated

Compiles to production TypeScript with Effect.ts, Convex functions, React components, full test suite. Type-safe, tested, ready.

```
Backend          Frontend         Tests
├─ Mutations    ├─ Components    └─ 50+ cases
├─ Queries      └─ Pages
└─ Services
```

#### 4️⃣ Deploy to Edge

Push to Cloudflare's global network. Unlimited requests, instant updates, zero configuration. Live in 60 seconds.

```
330+ locations worldwide
< 330ms average response time
Free tier unlimited
```

### Why This Works

Every feature follows this flow:

1. **English → Ontology** - Validates intent against 6 dimensions
2. **Ontology → Code** - Generates type-safe services
3. **Code → Tests** - Creates 50+ test cases automatically
4. **Tests → Deploy** - Pushes to edge with zero downtime

The ontology ensures consistency. The compiler ensures quality. The edge ensures performance.

## Plain English DSL

### Write Features in English. The System Builds Everything.

Describe what you want in plain English. The compiler checks every line against the ontology, generates TypeScript and tests, and deploys to the edge.

**Example: Chat with AI Clone**

```
FEATURE: Let fans chat with my AI clone

WHEN a fan sends a message
  CHECK they own tokens
  GET conversation history
  CALL OpenAI with my personality
  RECORD the interaction
  REWARD fan with 10 tokens
  GIVE AI response to fan
```

**What maps to ontology:**

- **Things Touched:** fan, ai_clone, message, token — all typed rows
- **Connections Updated:** fan `holds_tokens` token, fan `interacted_with` clone with metadata
- **Events Logged:** message_sent, tokens_earned, clone_interaction with timestamps
- **Knowledge Indexed:** Clone personality, embeddings, conversation history for retrieval

**5 Core Commands:**

| Command   | Purpose                             | Example                          |
| --------- | ----------------------------------- | -------------------------------- |
| `CREATE`  | Add typed Things into the graph     | `CREATE ai clone WITH voice ID`  |
| `CONNECT` | Define relationships with metadata  | `CONNECT fan to token as holder` |
| `RECORD`  | Append immutable Events             | `RECORD tokens purchased BY fan` |
| `CALL`    | Invoke services and persist outputs | `CALL Stripe to charge payment`  |
| `CHECK`   | Enforce guardrails before action    | `CHECK user has tokens`          |

## Philosophy

**Simple enough for children. Powerful enough for enterprises.**

- Groups partition the space (hierarchical containers from friend circles to governments)
- People authorize and govern (role-based access)
- Things exist (entities with flexible properties)
- Connections relate (relationships with metadata)
- Events record (complete audit trail)
- Knowledge understands (embeddings and vectors)

Everything else is just data. This ontology scales from friend circles (2 people) to global governments (billions) without schema changes.

## 🤖 Claude Automation Stack

### `.claude/agents/*`

- **Director (`agent-director.md`)** validates ideas against the 6 dimensions, sequences numbered plans, and routes work to the right specialist.
- **Builder squad (`agent-builder.md`, `agent-backend.md`, `agent-frontend.md`)** implements Convex services, Astro interfaces, and cross-cutting features while preserving multi-tenant boundaries and typed contracts.
- **Integration lead (`agent-integrator.md`)** connects external protocols (A2A, ACP, AP2, X402, AG-UI) and reconciles third-party data so it lands in groups, people, things, connections, events, and knowledge.
- **Quality loop (`agent-quality.md`, `agent-clean.md`, `agent-problem-solver.md`)** defines acceptance up front, enforces guardrails, diagnoses failures, and refactors without breaking ontology guarantees.
- **Design + knowledge (`agent-designer.md`, `agent-documenter.md`)** translate specs into accessible UI systems, tokens, and documentation so the knowledge dimension stays queryable for future generations.
- **Growth ops (`agent-clone.md`, `agent-sales.md`)** migrate legacy assets, build AI clones, manage trials, and tie revenue attribution back to event streams.

**Cascade in practice:** Director validates → Quality defines tests → Designers supply artifacts → Specialists build → Clean and Problem Solver close gaps → Documenter updates knowledge. Every agent reads and writes to the same ontology, so each run leaves richer context for the next.

### MCP Servers (`.mcp.json`)

- **shadcn** (`npx shadcn@latest mcp`) gives UI agents instant access to audited component recipes without leaving Claude Code.
- **cloudflare-builds** (`npx -y mcp-remote https://builds.mcp.cloudflare.com/sse`) lets release flows trigger deployments, inspect logs, and roll back while emitting auditable events.
- **cloudflare-docs** (`npx -y mcp-remote https://docs.mcp.cloudflare.com/sse`) streams authoritative references so integrators and quality agents stay aligned with platform guidance.
- **chrome-devtools** (`npx -y chrome-devtools-mcp@latest`) enables live performance profiling; findings roll into knowledge chunks for future optimizations.

**How it fits:** `.claude/commands/*` orchestrate the workflow (plan → build → release), `.claude/hooks/*` enforce guardrails, agents execute the steps, and MCP servers provide live tool access—all grounded in the ONE ontology as the single source of truth.

## Getting Help

For questions about:

- **6-Dimension Ontology**: Read `one/knowledge/ontology.md` (Version 1.0.0 - complete specification)
- **Convex patterns**: Read `web/AGENTS.md`
- **Architecture**: Read `one/knowledge/architecture.md`
- **Workflows**: Read `one/connections/workflow.md`
- **Best practices**: Read `one/knowledge/rules.md`
- **Release process**: Read `.claude/commands/release.md` and `.claude/agents/agent-ops.md`
- **Migration from 4-table**: Read `one/things/plans/ontology-6-dimensions.md`

---

**Built with clarity, simplicity, and infinite scale in mind.**
