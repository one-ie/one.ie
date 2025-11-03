# Frontend Development - ONE Platform

**You've read the root README.** This explains frontend development.

**What you learned from root:**
- ONE maps everything to 6 dimensions (groups, people, things, connections, events, knowledge)
- 98% AI code generation accuracy through pattern convergence
- Scales from lemonade stands to enterprises without schema changes

**What this explains:**
- How to BUILD the frontend that renders the 6 dimensions
- Progressive complexity architecture (start simple, add layers when needed)
- Tech stack and development workflow

---

## Tech Stack

### Core Technologies

- **Astro 5.14+** - Static site generation + server-side rendering
- **React 19** - Islands architecture with selective hydration
- **Tailwind CSS v4** - CSS-based configuration (no JS config)
- **shadcn/ui** - 50+ pre-installed accessible components
- **TypeScript 5.9+** - Strict mode with path aliases
- **Nanostores** - Lightweight state management for islands

### Backend Integration

- **Convex** - Real-time database with typed functions
- **Better Auth** - Multi-method authentication (email, OAuth, magic links, 2FA)
- **Provider Pattern** - Backend-agnostic code (switch sources with env var)

### Deployment

- **Cloudflare Pages** - Edge SSR with React 19 compatibility
- **Convex Cloud** - Real-time backend at `shocking-falcon-870.convex.cloud`

---

## How Frontend Renders the 6 Dimensions

**The 6 dimensions exist in the backend. Frontend renders them in the UI:**

```
Backend (Convex)                Frontend Components
─────────────────              ────────────────────────────
groups table         →         <GroupSelector>, <GroupHierarchy>
things table         →         <ThingCard type="product">, <ThingCard type="course">
connections table    →         <RelationshipList>, <ConnectionGraph>
events table         →         <ActivityFeed>, <EventTimeline>
knowledge table      →         <SearchResults>, <Recommendations>
people (via role)    →         <PersonCard>, <RoleBadge>
```

**Example: Product Display (Thing Dimension)**

```typescript
// Backend: things table has type="product"
// Frontend: Render with ThingCard

<ThingCard thing={product} type="product">
  <CardHeader>
    <CardTitle>{product.name}</CardTitle>
    <Badge>{product.properties.category}</Badge>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      ${product.properties.price}
    </div>
  </CardContent>
  <CardFooter>
    <Button>Add to Cart</Button>
  </CardFooter>
</ThingCard>
```

**Same component works for ANY thing type:**
- Products, courses, agents, tokens, blog posts, events...
- Just change the `type` prop and `properties` data
- Pattern converges → AI gets smarter (98% accuracy)

---

## Progressive Complexity Architecture

**Golden Rule:** Start simple. Add layers ONLY when needed.

### Layer 1: Content + Pages (80% of features - START HERE)

**Use for:** Blog, marketing site, documentation, product catalog

**What you get:**
- Static content from Markdown/YAML files
- Type-safe schemas with Zod
- Pre-rendered HTML (ultra-fast)
- shadcn/ui components (beautiful by default)

**Example: Blog**
```
src/
├── content/
│   └── blog/
│       └── hello-world.md
└── pages/
    └── blog/
        └── [slug].astro
```

```astro
---
// Fetch static content
import { getCollection } from "astro:content";
const posts = await getCollection("blog");
---

<Layout>
  {posts.map(post => (
    <Card>
      <CardTitle>{post.data.title}</CardTitle>
      <p>{post.data.description}</p>
    </Card>
  ))}
</Layout>
```

**Stop here if:** No forms, no validation, no shared state needed. (This covers 80% of features!)

### Layer 2: + Validation (15% of features)

**Use for:** Forms, business logic, validation

**What you add:**
- Effect.ts services for validation
- Tagged union error types
- Composable business logic

**Example: Contact Form**
```typescript
import { Effect } from "effect";

export const validateContactForm = (data: unknown) =>
  Effect.gen(function* () {
    if (!data.email || !data.message) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Email and message required",
      });
    }
    return data as ContactForm;
  });
```

**Stop here if:** No component state sharing needed.

### Layer 3: + State Management (4% of features)

**Use for:** Shopping cart, real-time updates, components need shared state

**What you add:**
- Nanostores for global state
- Hooks for React integration
- State shared between islands

**Example: Shopping Cart**
```typescript
// stores/cart.ts
import { atom } from "nanostores";

export const cart$ = atom<CartItem[]>([]);

// Use in ANY island
const cart = useStore(cart$);
cart$.set([...cart, newItem]);
```

**Stop here if:** One data source (Markdown OR API, not both).

### Layer 4: + Multiple Sources (1% of features)

**Use for:** Switch between Markdown/API/Hybrid, API migration

**What you add:**
- Provider pattern
- Backend-agnostic code
- Switch sources with env var

**Example: Products**
```typescript
// Works with ANY backend
const provider = getContentProvider("products");
const products = await provider.list();

// Switch via env var:
// CONTENT_SOURCE=markdown → Static files
// CONTENT_SOURCE=convex → Real-time database
// CONTENT_SOURCE=api → REST API
```

**Stop here if:** No database, no auth, no real-time needed.

### Layer 5: + Backend Integration (<1% of features)

**Use for:** Database, authentication, real-time updates, compliance

**What you get:**
- REST API backend
- Database persistence
- Real-time subscriptions (Convex)
- Audit trails and compliance

**Example: User Authentication**
```typescript
// Frontend uses provider
const provider = getAuthProvider();
await provider.signIn({ email, password });

// Backend handles all logic
// Real-time updates via Convex subscriptions
```

---

## Development Workflow

### 1. Install Dependencies

```bash
bun install
```

### 2. Start Development Server

```bash
bun run dev
# Visit http://localhost:4321
```

### 3. Create Content (Layer 1)

```bash
# Create schema
echo "import { z } from 'astro/zod';" > src/content/config.ts

# Add content
echo "---
name: Acme Corp
type: organization
---" > src/content/groups/acme.yaml
```

### 4. Generate Types

```bash
bunx astro sync
# Generates types from content collections
```

### 5. Build Component

```typescript
// src/components/features/GroupCard.tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function GroupCard({ group }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}
```

### 6. Create Page

```astro
---
// src/pages/groups/index.astro
import { getCollection } from "astro:content";
import GroupCard from "@/components/features/GroupCard";

const groups = await getCollection("groups");
---

<Layout>
  <h1>Groups</h1>
  <div class="grid gap-4">
    {groups.map(group => (
      <GroupCard group={group.data} />
    ))}
  </div>
</Layout>
```

### 7. Test

```bash
bun test
```

### 8. Build for Production

```bash
bun run build
```

---

## File Structure

```
web/
├── src/
│   ├── pages/              # File-based routing
│   │   └── groups/
│   │       └── [groupId]/
│   │           └── things/
│   │               └── [type].astro
│   ├── components/         # React components
│   │   ├── features/       # Feature-specific
│   │   │   ├── ThingCard.tsx
│   │   │   ├── PersonCard.tsx
│   │   │   └── EventItem.tsx
│   │   └── ui/             # shadcn/ui (50+ components)
│   ├── content/            # Static content (Layer 1)
│   │   ├── config.ts       # Zod schemas
│   │   ├── blog/
│   │   ├── products/
│   │   └── groups/
│   ├── lib/
│   │   ├── services/       # Effect.ts validation (Layer 2)
│   │   └── providers/      # Provider pattern (Layer 4)
│   ├── stores/             # Nanostores (Layer 3)
│   └── styles/             # Tailwind v4 CSS
└── test/                   # Test suites
```

---

## Performance Features

### Islands Architecture

**Concept:** Ship 0 JS by default. Add interactivity only where needed.

```astro
<!-- Static HTML (NO JavaScript) -->
<ProductCard product={product} />

<!-- Interactive cart (loads immediately) -->
<ShoppingCart client:load />

<!-- Lazy load below fold -->
<RelatedProducts client:visible />
```

**Result:**
- Lighthouse scores: 95-100
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### Image Optimization

```astro
import { Image } from "astro:assets";

<Image
  src={thumbnail}
  alt="Product"
  width={400}
  height={300}
  format="webp"  // Auto-converts to WebP
  loading="lazy"  // Lazy loads below fold
/>
```

### Real-Time Updates (Convex)

```typescript
// Automatically re-renders when data changes
const products = useQuery(api.queries.entities.list, {
  groupId: currentGroupId,
  type: "product",
});
```

---

## Component Library (shadcn/ui)

**50+ pre-installed components:**

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
```

**Example: Product Card**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Premium Course</CardTitle>
    <Badge>Featured</Badge>
  </CardHeader>
  <CardContent>
    <p>Learn React 19 and Astro 5</p>
    <div className="text-2xl font-bold">$99</div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Enroll Now</Button>
  </CardFooter>
</Card>
```

---

## Styling with Tailwind v4

**CRITICAL:** Tailwind v4 uses CSS configuration (NO tailwind.config.mjs).

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Colors in HSL format */
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 222.2 47.4% 11.2%;
}

/* Dark mode */
@variant dark (.dark &);

.dark {
  --color-background: 222.2 84% 4.9%;
  --color-foreground: 210 40% 98%;
}
```

**Usage:**
```typescript
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

---

## Testing

```bash
# Run all tests
bun test

# Run auth tests
bun test test/auth

# Watch mode
bun test --watch
```

**Test Coverage:**
- 50+ test cases for authentication
- Integration tests (frontend → backend)
- Performance benchmarks
- Accessibility compliance

---

## Common Commands

```bash
# Development
bun run dev              # Start dev server (localhost:4321)
bun run build            # Build for production
bunx astro check         # Type checking
bunx astro sync          # Generate content types

# Testing
bun test                 # Run all tests
bun test --watch         # Watch mode

# Linting & Formatting
bun run lint             # ESLint
bun run format           # Prettier
```

---

## Environment Variables

```bash
# web/.env.local
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:4321

# Content source (Layer 4)
CONTENT_SOURCE=markdown  # or "api", "convex", "hybrid"
```

---

## Getting Help

### Core Documentation

- **6-Dimension Ontology:** `/one/knowledge/ontology.md`
- **Progressive Complexity:** `/one/knowledge/astro-effect-simple-architecture.md`
- **Complete Examples:** `/one/knowledge/astro-effect-complete-vision.md`
- **Provider Pattern:** `/one/knowledge/provider-agnostic-content.md`

### Frontend Guides

- **AI Agent Instructions:** `/web/CLAUDE.md`
- **Architecture Guide:** `/one/knowledge/architecture.md`
- **Workflow:** `/one/connections/workflow.md`
- **Best Practices:** `/one/knowledge/rules.md`

### Tech Stack Docs

- **Astro:** https://docs.astro.build
- **React 19:** https://react.dev
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind v4:** https://tailwindcss.com
- **Convex:** https://docs.convex.dev

---

## Philosophy

**Simple enough for children. Powerful enough for enterprises.**

- Start with Layer 1 (content + pages) - 80% of features
- Add layers ONLY when pain is felt
- Use ONE pattern for entities (ThingCard)
- Use ONE pattern for people (PersonCard)
- Use ONE pattern for events (EventItem)
- Pattern convergence → AI gets smarter (98% accuracy)

**Result:** Clean code. Fast sites. Happy users.

---

**Built for performance. Aligned with ontology. Optimized for users.**
