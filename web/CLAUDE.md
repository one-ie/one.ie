# Frontend Development - CLAUDE.md

## ⚠️ CRITICAL RULES - NEVER BREAK THESE

**INHERITED FROM ROOT `/CLAUDE.md` - NON-NEGOTIABLE:**

1. **NEVER run `git rebase`** - ever, under any circumstances
2. **NEVER run `git push --force`** - always ask first
3. **NEVER run commands that delete files** - always ask first
4. **ALWAYS ask before any potentially destructive operation** - staged deletion, force push, rewriting history, etc.

If you are about to run a command that could lose work, destroy commits, or overwrite history, STOP and ask the user for explicit approval first.

---

## This is a Cascading Context File

**You've already read `/CLAUDE.md` (root).** This file provides FRONTEND-SPECIFIC patterns.

**What you learned from root:**
- 6-dimension ontology (groups, people, things, connections, events, knowledge)
- Compound structure accuracy (85% → 98%)
- Cascading context system
- Technology stack (Astro 5, React 19, Tailwind v4, shadcn/ui)

**What this file adds:**
- Frontend RENDERS the 6 dimensions
- Progressive complexity (5 layers)
- Provider pattern (backend-agnostic)
- Astro + React + shadcn/ui patterns
- Performance optimization (islands architecture)

---

## Your Role: Render the 6-Dimension Ontology

**The 6 dimensions exist in the backend. You RENDER them in the UI:**

```
Backend (Convex)                Frontend (You Build This)
─────────────────              ────────────────────────────
groups table         →         <GroupSelector>, <GroupHierarchy>
things table         →         <ThingCard type="product">, <ThingCard type="course">
connections table    →         <RelationshipList>, <ConnectionGraph>
events table         →         <ActivityFeed>, <EventTimeline>
knowledge table      →         <SearchResults>, <Recommendations>
people (via role)    →         <PersonCard>, <RoleBadge>
```

**Key principle:** The ontology NEVER changes. Your components DO change to render new thing types, connection types, and event types.

---

## Progressive Complexity Architecture

**CRITICAL:** Read these documents before implementing ANY feature:

1. **`/one/knowledge/astro-effect-simple-architecture.md`** - START HERE
   - Core architecture patterns
   - Layer 1 implementation (content collections + shadcn)
   - When to add complexity

2. **`/one/knowledge/astro-effect-complete-vision.md`** - Complete examples
   - Real-world workflows (blog, products, docs)
   - All 5 layers with examples
   - Development experience

3. **`/one/knowledge/provider-agnostic-content.md`** - Provider switching
   - Markdown ↔ API ↔ Hybrid
   - One env var to switch sources
   - Layer 4 implementation

### The 5 Layers

**Layer 1: Content + Pages** (80% of features - START HERE)
```astro
---
// Static content from content collections
import { getCollection } from "astro:content";
const products = await getCollection("products");
---

<Layout>
  {products.map(product => (
    <ThingCard thing={product.data} type="product" />
  ))}
</Layout>
```

**Layer 2: + Validation** (15% of features - Add when needed)
```typescript
// Effect.ts services for business logic
import { Effect } from "effect";

export const validateProduct = (data: unknown): Effect.Effect<Product, ProductError> =>
  Effect.gen(function* () {
    if (!data.name) {
      return yield* Effect.fail({
        _tag: "ValidationError",
        message: "Product name required",
      });
    }
    return data as Product;
  });
```

**Layer 3: + State** (4% of features - Add when components need to share state)
```typescript
// Nanostores for island communication
import { atom } from "nanostores";

export const cart$ = atom<CartItem[]>([]);

// Use in ANY island
const cart = useStore(cart$);
```

**Layer 4: + Multiple Sources** (1% of features - Add when switching between Markdown/API)
```typescript
// Provider pattern enables source switching
const provider = getContentProvider("products");
const products = await provider.list();

// Switch sources with env var:
// CONTENT_SOURCE=markdown → Uses .md files
// CONTENT_SOURCE=api → Uses REST API
// CONTENT_SOURCE=hybrid → Tries API, falls back to Markdown
```

**Layer 5: + Backend** (<1% of features - Coordinate with agent-backend)
```typescript
// Backend provides REST API
// Frontend uses via ApiProvider
// Same code works for both Markdown and API!
```

**Golden Rule:** Start at Layer 1. Add layers ONLY when pain is felt. Most features (80%) never leave Layer 1.

---

## Pattern Convergence (98% Accuracy)

**Your responsibility:** Make every new component REINFORCE the pattern, not introduce new ones.

### ONE Pattern (Good - AI learns)

```typescript
// Things (entities) - ONE component type
<ThingCard thing={product} type="product">
  <CardHeader>
    <CardTitle>{product.name}</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge>{product.properties.price}</Badge>
  </CardContent>
</ThingCard>

<ThingCard thing={course} type="course">
  <CardHeader>
    <CardTitle>{course.name}</CardTitle>
  </CardHeader>
  <CardContent>
    <Badge>{course.properties.price}</Badge>
  </CardContent>
</ThingCard>

// People (separate dimension) - ONE component type
<PersonCard person={user}>
  <CardHeader>
    <CardTitle>{user.displayName}</CardTitle>
  </CardHeader>
  <CardContent>
    <RoleBadge role={user.role} />
  </CardContent>
</PersonCard>

// Events - ONE component type
<EventItem event={event}>
  <EventIcon type={event.type} />
  <EventDescription event={event} />
</EventItem>
```

**AI sees:** 3 patterns (ThingCard, PersonCard, EventItem). Pattern confidence: 98%.

### Anti-Pattern (Bad - AI confused)

```typescript
// Different components for each thing type (WRONG!)
<ProductCard product={product}>...</ProductCard>
<CourseCard course={course}>...</CourseCard>
<UserProfile user={user}>...</UserProfile>
<ActivityItem activity={activity}>...</ActivityItem>
```

**AI sees:** 4+ different patterns. Pattern confidence: 30%. Accuracy degrades.

---

## Component Architecture Patterns

### Entity Display Components (Things Dimension)

```typescript
// Generic thing renderer (use for all thing types)
export function ThingCard({
  thing,
  type
}: {
  thing: Thing;
  type: string
}) {
  // Type-specific rendering via properties
  const price = thing.properties.price;
  const inventory = thing.properties.inventory;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{thing.name}</CardTitle>
        <Badge variant="outline">{type}</Badge>
      </CardHeader>
      <CardContent>
        {price && <div className="text-lg font-bold">${price}</div>}
        {inventory !== undefined && (
          <div className="text-sm text-muted-foreground">
            {inventory} in stock
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Use for ANY thing type
<ThingCard thing={product} type="product" />
<ThingCard thing={course} type="course" />
<ThingCard thing={agent} type="ai_clone" />
<ThingCard thing={token} type="token" />
```

### Person Display Components (People Dimension)

```typescript
// Person renderer (for all user types)
export function PersonCard({ person }: { person: Person }) {
  return (
    <Card>
      <CardHeader>
        <Avatar>
          <AvatarImage src={person.avatarUrl} />
          <AvatarFallback>{person.name[0]}</AvatarFallback>
        </Avatar>
        <CardTitle>{person.displayName}</CardTitle>
      </CardHeader>
      <CardContent>
        <RoleBadge role={person.role} />
      </CardContent>
    </Card>
  );
}
```

### Connection Display Components (Connections Dimension)

```typescript
// Relationship renderer
export function ConnectionList({
  thingId,
  type
}: {
  thingId: string;
  type: string
}) {
  const connections = useQuery(api.queries.connections.getRelated, {
    fromThingId: thingId,
    relationshipType: type,
  });

  return (
    <div className="space-y-2">
      {connections?.map((conn) => (
        <div key={conn._id} className="flex items-center gap-2">
          <Badge variant="secondary">{type}</Badge>
          <span>{conn.toThing.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### Event Display Components (Events Dimension)

```typescript
// Activity feed renderer
export function ActivityFeed({
  actorId
}: {
  actorId: string
}) {
  const events = useQuery(api.queries.events.getRecent, {
    actorId,
    limit: 20,
  });

  return (
    <div className="space-y-4">
      {events?.map((event) => (
        <EventItem key={event._id} event={event} />
      ))}
    </div>
  );
}

export function EventItem({ event }: { event: Event }) {
  return (
    <div className="flex items-start gap-3">
      <EventIcon type={event.type} />
      <div>
        <div className="font-medium">{event.type.replace(/_/g, ' ')}</div>
        <div className="text-sm text-muted-foreground">
          {formatDistance(event.timestamp, Date.now())} ago
        </div>
      </div>
    </div>
  );
}
```

---

## Astro Islands Architecture

**Performance principle:** Generate static HTML by default. Add interactivity (client JS) only where needed.

### Hydration Directives

```astro
<!-- Static HTML (NO JavaScript) -->
<ProductCard product={product} />

<!-- Critical interactivity (loads immediately) -->
<ShoppingCart client:load />

<!-- Deferred interactivity (loads when browser idle) -->
<SearchBox client:idle />

<!-- Lazy loading (loads when visible) -->
<RelatedProducts client:visible />

<!-- Responsive features (loads on mobile) -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- Framework-specific (no SSR) -->
<ComplexWidget client:only="react" />
```

### Nanostores for Island Communication

**Problem:** Astro islands are isolated React trees. They can't share state via props.

**Solution:** Nanostores provide global state accessible from ANY island.

```typescript
// stores/cart.ts (ONE file, ONE pattern)
import { atom } from "nanostores";

export const cart$ = atom<CartItem[]>([]);

// Island 1: Header.tsx
import { useStore } from "@nanostores/react";
import { cart$ } from "@/stores/cart";

export function Header() {
  const cart = useStore(cart$);
  return <Badge>{cart.length}</Badge>;
}

// Island 2: ProductCard.tsx
import { useStore } from "@nanostores/react";
import { cart$ } from "@/stores/cart";

export function ProductCard({ product }) {
  const cart = useStore(cart$);

  const addToCart = () => {
    cart$.set([...cart, product]);
  };

  return <Button onClick={addToCart}>Add to Cart</Button>;
}

// Island 3: CartSidebar.tsx
import { useStore } from "@nanostores/react";
import { cart$ } from "@/stores/cart";

export function CartSidebar() {
  const cart = useStore(cart$);
  return (
    <div>
      {cart.map(item => <CartItem item={item} />)}
    </div>
  );
}
```

**Pattern:** ONE way to share state across islands. NO localStorage hacks. NO URL params. NO window events.

---

## Provider Pattern (Backend-Agnostic Code)

**The power:** Frontend code NEVER changes when backend switches.

```typescript
// Development: Static markdown files
// .env: CONTENT_SOURCE=markdown
const provider = getContentProvider("products");
const products = await provider.list();

// Production: Convex real-time database
// .env: CONTENT_SOURCE=convex
const provider = getContentProvider("products");
const products = await provider.list();

// E-commerce: Shopify API
// .env: CONTENT_SOURCE=shopify
const provider = getContentProvider("products");
const products = await provider.list();

// SAME CODE. SAME ASTRO PAGE. SAME COMPONENTS.
```

**Implementation:**

```typescript
// lib/providers/ContentProvider.ts
export interface ContentProvider {
  list(): Promise<Thing[]>;
  get(id: string): Promise<Thing>;
  create(data: Partial<Thing>): Promise<Thing>;
  update(id: string, data: Partial<Thing>): Promise<Thing>;
  delete(id: string): Promise<void>;
}

// lib/providers/getContentProvider.ts
export function getContentProvider(collection: string): ContentProvider {
  const source = import.meta.env.CONTENT_SOURCE || "markdown";

  switch (source) {
    case "convex":
      return new ConvexProvider(collection);
    case "api":
      return new ApiProvider(collection);
    case "hybrid":
      return new HybridProvider(
        new ApiProvider(collection),
        new MarkdownProvider(collection)
      );
    default:
      return new MarkdownProvider(collection);
  }
}
```

---

## Real-Time Data with Convex

### useQuery (Real-Time Subscriptions)

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProductList({ groupId }: { groupId: string }) {
  // Automatically updates when data changes
  const products = useQuery(api.queries.entities.list, {
    groupId,
    type: "product",
    status: "published",
  });

  if (products === undefined) {
    return <Skeleton />;
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <ThingCard key={product._id} thing={product} type="product" />
      ))}
    </div>
  );
}
```

### useMutation (Optimistic Updates)

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProductCard({ product }: { product: Thing }) {
  const updateProduct = useMutation(api.mutations.entities.update);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      await updateProduct({
        id: product._id,
        name: "New Name",
      });
      toast.success("Product updated!");
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button onClick={handleUpdate} disabled={isUpdating}>
      Update Product
    </Button>
  );
}
```

---

## shadcn/ui Component Library

**Always use shadcn components for UI.** Never create custom components for common UI elements.

```typescript
// Available components (50+ pre-installed)
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Example usage
export function ProductCard({ product }: { product: Thing }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <Badge variant="outline">{product.properties.category}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {product.properties.description}
        </p>
        <Separator className="my-4" />
        <div className="text-2xl font-bold">
          ${product.properties.price}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
```

---

## Tailwind v4 CSS Styling

**CRITICAL:** Tailwind v4 uses CSS-based configuration (NO tailwind.config.mjs).

### Theme Configuration

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Colors in HSL format (NO OKLCH!) */
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 222.2 47.4% 11.2%;
  --color-secondary: 210 40% 96.1%;
  --color-muted: 210 40% 96.1%;
  --color-accent: 210 40% 96.1%;
  --color-destructive: 0 84.2% 60.2%;
}

/* Dark mode overrides */
@variant dark (.dark &);

.dark {
  --color-background: 222.2 84% 4.9%;
  --color-foreground: 210 40% 98%;
  --color-primary: 210 40% 98%;
}
```

### Usage in Components

```typescript
// ALWAYS wrap colors with hsl()
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// Generated CSS:
.bg-background {
  background-color: hsl(var(--color-background));
}

.text-foreground {
  color: hsl(var(--color-foreground));
}
```

---

## Performance Optimization Standards

### Core Web Vitals Requirements

- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Lighthouse Performance Score:** 90+

### Implementation Techniques

**1. Image Optimization:**
```astro
import { Image } from "astro:assets";

<Image
  src={thumbnail}
  alt="Product thumbnail"
  width={400}
  height={300}
  format="webp"
  quality={85}
  loading="lazy"
/>
```

**2. Code Splitting:**
```typescript
// Dynamic imports for heavy components
const ProductBuilder = lazy(() => import('./ProductBuilder'));

{role === 'org_owner' && (
  <Suspense fallback={<Skeleton />}>
    <ProductBuilder />
  </Suspense>
)}
```

**3. Critical CSS Inlining:**
```astro
---
// Astro automatically inlines critical CSS
---
```

**4. Strategic Hydration:**
```astro
<!-- Above fold: client:load -->
<ShoppingCart client:load />

<!-- Below fold: client:visible -->
<RelatedProducts client:visible />
```

---

## Role-Based UI Rendering (People Dimension)

```typescript
// Permission-aware navigation
export function Navigation({
  role,
  permissions
}: {
  role: Role;
  permissions: string[]
}) {
  return (
    <nav className="flex items-center gap-4">
      {/* All roles see dashboard */}
      <NavLink href="/dashboard">Dashboard</NavLink>

      {/* Org owners and platform owners see admin */}
      {(role === 'org_owner' || role === 'platform_owner') && (
        <NavLink href="/admin">Admin</NavLink>
      )}

      {/* Platform owners see all groups */}
      {role === 'platform_owner' && (
        <NavLink href="/platform/groups">All Groups</NavLink>
      )}

      {/* Customers see marketplace */}
      {role === 'customer' && (
        <NavLink href="/marketplace">Marketplace</NavLink>
      )}
    </nav>
  );
}
```

---

## Decision Framework

### Ontology Mapping Questions (Ask BEFORE coding)

1. **Groups:** Is this scoped to a group? Filter by groupId?
2. **People:** Who can see this? Check role and permissions?
3. **Things:** What entity types are displayed? Use correct thing type?
4. **Connections:** What relationships need showing? Query connections table?
5. **Events:** What actions need logging? Create event on mutation?
6. **Knowledge:** How is this categorized? Add knowledge labels for search?

### Performance Questions

1. Can this be static HTML? → Use Astro component (no JS)
2. Does this need interactivity? → Client island with appropriate directive
3. Is data real-time? → Convex useQuery subscription
4. Is this above the fold? → `client:load` or eager loading
5. Is this below the fold? → `client:visible` or lazy loading
6. Is this heavy? → Dynamic import with code splitting

### Component Selection

1. Static content? → Astro component (.astro file)
2. Simple interactivity? → React component (hooks, state)
3. Complex state? → React component + nanostores
4. Form handling? → React component + Effect.ts validation

---

## Common Mistakes to Avoid

### Ontology Violations

- ❌ Creating custom tables instead of using 6 dimensions
- ✅ Map all features to things, connections, events, knowledge
- ❌ Forgetting to filter by groupId
- ✅ Always scope queries to current group

### Performance Anti-Patterns

- ❌ Using client:load for all components
- ✅ Use appropriate hydration directive (idle, visible)
- ❌ Fetching data client-side when it could be static
- ✅ SSR data at build time or request time
- ❌ Large unoptimized images
- ✅ Use Astro Image with webp format and lazy loading

### Pattern Divergence

- ❌ Creating ProductCard, CourseCard, UserCard (different patterns)
- ✅ Creating ThingCard, PersonCard (converging patterns)
- ❌ Custom state management (localStorage, URL params)
- ✅ Nanostores for ALL island communication

---

## File Structure

```
web/
├── src/
│   ├── pages/              # File-based routing (Astro)
│   │   └── groups/
│   │       └── [groupId]/
│   │           └── things/
│   │               └── [type].astro
│   ├── components/         # React components + shadcn/ui
│   │   ├── features/       # Feature-specific components
│   │   │   ├── ThingCard.tsx
│   │   │   ├── PersonCard.tsx
│   │   │   └── EventItem.tsx
│   │   └── ui/             # shadcn/ui components
│   ├── content/            # Content collections (markdown)
│   │   ├── config.ts       # Zod schemas
│   │   └── products/
│   ├── lib/                # Utilities
│   │   ├── services/       # Effect.ts services (Layer 2)
│   │   └── providers/      # Provider pattern (Layer 4)
│   ├── stores/             # Nanostores (Layer 3)
│   └── styles/             # Global CSS + Tailwind config
└── test/                   # Test suites
```

---

## Development Commands

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

# Run tests
bun test

# Run specific test suite
bun test test/auth

# Watch mode
bun test --watch
```

---

## Further Cascading

When working in subdirectories, check for more specific CLAUDE.md files:

- `/web/src/pages/CLAUDE.md` - Page-specific patterns (if exists)
- `/web/src/components/CLAUDE.md` - Component patterns (if exists)

**Precedence rule:** Closer to the file you're editing = higher precedence.

---

## Success Criteria

### Immediate (Feature-Level)

- [ ] Component maps to correct dimension (groups/people/things/connections/events/knowledge)
- [ ] Queries filtered by groupId (multi-tenant)
- [ ] Role-based UI rendering (people dimension)
- [ ] Events logged for all user actions
- [ ] Static HTML by default, client islands strategic
- [ ] Core Web Vitals > 90 (LCP, FID, CLS)

### Near-Term (Quality Validation)

- [ ] All frontend tests pass
- [ ] Performance benchmarks met (Lighthouse 90+)
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Real-time updates working (Convex subscriptions)
- [ ] Responsive on mobile, tablet, desktop
- [ ] No hydration mismatches or errors

---

**Built for performance. Aligned with ontology. Optimized for users.**
