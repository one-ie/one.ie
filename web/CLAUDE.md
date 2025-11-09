# Frontend Development - CLAUDE.md

## This is a Cascading Context File

**You've read `/CLAUDE.md` (root).** This file adds FRONTEND-SPECIFIC patterns.

**What you learned from root:**
- 6-dimension ontology (groups, people, things, connections, events, knowledge)
- 6-phase workflow (UNDERSTAND → MAP → DESIGN → IMPLEMENT → BUILD → TEST)
- Cascading context system (closer to file = higher precedence)
- Technology stack (Astro 5, React 19, Tailwind v4, shadcn/ui)

**What this file adds:**
- Frontend RENDERS the 6 dimensions
- Progressive complexity (5 layers)
- Component patterns (ThingCard, PersonCard, EventItem)
- Astro islands + React hooks
- Performance optimization

---

## Your Role: Render the 6-Dimension Ontology

**Backend implements, Frontend renders:**

```
Backend (Convex)         Frontend (You Build)
────────────────         ────────────────────
groups table      →      <GroupSelector>, <GroupHierarchy>
things table      →      <ThingCard type="product|course|...">
connections       →      <ConnectionList>, <RelationshipGraph>
events            →      <ActivityFeed>, <EventTimeline>
knowledge         →      <SearchResults>, <Recommendations>
people (role)     →      <PersonCard>, <RoleBadge>
```

**Key principle:** Ontology never changes. Components do.

---

## Template-First Frontend Development

**Before building ANY page or component, search for existing templates:**

### Quick Template Guide

```bash
# Product/shop pages
/web/src/pages/shop/product-landing.astro  # Full e-commerce template with Stripe

# Search for similar pages
glob "web/src/pages/**/*.astro"

# Search for reusable components
glob "web/src/components/**/*.tsx"
```

### Template Usage Flow

1. **User asks for feature** → Identify type (product page, dashboard, etc.)
2. **Search templates first** → Use Glob to find similar patterns
3. **Copy template** → Use Read to examine, then copy structure
4. **Customize** → Modify for specific use case
5. **Enhance** → Add Stripe, features, interactivity

### E-commerce Template (/shop/product-landing.astro)

**When to use:**
- User wants to sell a product
- User needs a landing page for merchandise
- User mentions "shop", "buy", "sell", "product"

**Features included:**
- Product gallery with zoom
- Reviews section
- Urgency banners
- Stripe checkout integration
- Mobile-optimized
- Dark mode support

**Setup:**
1. Copy template to new page
2. Update product data (title, price, images)
3. Ask: "Would you like this as your home page?"
4. After creation: "Add Stripe? Just paste your keys: https://one.ie/docs/develop/stripe"

### Common Template Categories

**E-commerce:**
- Product landing pages → `/web/src/pages/shop/product-landing.astro`
- Product galleries → Search for ThingCard implementations
- Shopping cart → Search for cart stores in `/web/src/stores/`

**Content:**
- Blog posts → `/web/src/content/blog/`
- Documentation → `/web/src/content/docs/`
- Landing pages → `/web/src/pages/index.astro`

**Dashboards:**
- Admin interfaces → Search for "dashboard" in pages
- Analytics → Search for chart components
- User profiles → Search for PersonCard implementations

**Golden Rule:** Copy existing patterns first. Build new ONLY when no template exists.

---

## Progressive Complexity (5 Layers)

**Read full architecture:** `/one/knowledge/astro-effect-simple-architecture.md`

**Layer 1: Content + Pages** (80% of features - START HERE)

```astro
---
// Static content from content collections
import { getCollection } from "astro:content";
const products = await getCollection("products");
---

<Layout>
  <div class="grid gap-4">
    {products.map(product => (
      <ThingCard thing={product.data} type="product" />
    ))}
  </div>
</Layout>
```

**Layer 2: + Validation** (15% - Add when needed)

```typescript
// Effect.ts services for business logic
import { Effect } from "effect";

export const validateProduct = (
  data: unknown
): Effect.Effect<Product, ProductError> =>
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

**Layer 3: + State** (4% - Add for island communication)

```typescript
// Nanostores for island communication
import { atom } from "nanostores";

export const cart$ = atom<CartItem[]>([]);

// Use in ANY island
import { useStore } from "@nanostores/react";
const cart = useStore(cart$);
```

**Layer 4: + Multiple Sources** (1% - Add for provider switching)

```typescript
// Provider pattern enables source switching
const provider = getContentProvider("products");
const products = await provider.list();

// Switch sources with env var:
// CONTENT_SOURCE=markdown → Uses .md files
// CONTENT_SOURCE=api → Uses REST API
// CONTENT_SOURCE=hybrid → Tries API, falls back to Markdown
```

**Layer 5: + Backend** (<1% - Only when explicitly requested)

```typescript
// Backend provides real-time data via Convex
import { useQuery } from "convex/react";
const products = useQuery(api.queries.products.list);
```

**Golden Rule:** Start Layer 1. Add layers ONLY when pain is felt.

**Read full guide:** `/one/knowledge/provider-agnostic-content.md`

---

## Pattern Convergence (98% AI Accuracy)

**ONE component per dimension, MANY templates for common use cases:**

### Template-Based Development

**Start with templates, not components:**

```bash
# User says: "I want to sell coffee mugs"
# 1. Search templates first
glob "web/src/pages/**/*product*.astro"  # Find product templates
glob "web/src/pages/**/*shop*.astro"     # Find shop templates

# 2. Found: /web/src/pages/shop/product-landing.astro
# 3. Copy and customize for coffee mugs
# 4. Ask about Stripe integration
```

**Template priority over raw components:**
- ✅ Copy `/shop/product-landing.astro` → customize for your product
- ❌ Build page from scratch using ThingCard

**Why templates win:**
- Complete page structure (header, gallery, reviews, footer)
- Stripe integration pre-configured
- Mobile-responsive layouts
- Dark mode support
- SEO optimization
- Performance best practices

### Things Dimension → ThingCard

```typescript
// Generic thing renderer (use for ALL thing types)
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
<ThingCard thing={token} type="token" />
```

### People Dimension → PersonCard

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

### Events Dimension → EventItem

```typescript
// Activity feed renderer
export function EventItem({ event }: { event: Event }) {
  return (
    <div className="flex items-start gap-3">
      <EventIcon type={event.type} />
      <div>
        <div className="font-medium">{formatEventType(event.type)}</div>
        <div className="text-sm text-muted-foreground">
          {formatDistance(event.timestamp, Date.now())} ago
        </div>
      </div>
    </div>
  );
}
```

**Why this works:** AI sees 3 patterns (not 100), confidence = 98%.

**Anti-pattern:** ProductCard, CourseCard, UserProfile, ActivityItem (4+ patterns, confidence = 30%)

**Read full patterns:** `/one/knowledge/patterns/frontend/component-template.md`

---

## Astro Islands Architecture

**Performance principle:** Static HTML by default. Add interactivity strategically.

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

**Read full guide:** `/one/knowledge/astro-effect-simple-architecture.md#layer-3`

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

## Provider Pattern (Backend-Agnostic)

**Power:** Frontend code never changes when backend switches.

```typescript
// Development: markdown files
// .env: CONTENT_SOURCE=markdown
const provider = getContentProvider("products");

// Production: Convex real-time
// .env: CONTENT_SOURCE=convex
const provider = getContentProvider("products");

// SAME CODE. DIFFERENT SOURCE.
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

**Read full pattern:** `/one/knowledge/provider-agnostic-content.md`

---

## shadcn/ui Components

**Always use shadcn components for UI:**

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

**Read component list:** https://ui.shadcn.com/docs/components

---

## Tailwind v4 Styling

**CRITICAL:** Uses CSS-based configuration (NO tailwind.config.mjs).

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

**Key rules:**
- ALWAYS use HSL format: `--color-name: 0 0% 100%`
- ALWAYS wrap with `hsl()`: `hsl(var(--color-background))`
- NO `@apply` directive in Tailwind v4
- Use `@variant dark (.dark &)` for dark mode

**Usage in components:**

```typescript
// ALWAYS wrap colors with hsl()
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

**Read full guidelines:** `/one/knowledge/guidelines.md#tailwind-v4`

---

## Performance Optimization

**Core Web Vitals Requirements:**
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Lighthouse:** 90+

**Techniques:**

1. **Image Optimization:**

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

2. **Code Splitting:**

```typescript
// Dynamic imports for heavy components
const ProductBuilder = lazy(() => import('./ProductBuilder'));

{role === 'org_owner' && (
  <Suspense fallback={<Skeleton />}>
    <ProductBuilder />
  </Suspense>
)}
```

3. **Strategic Hydration:**

```astro
<!-- Above fold: client:load -->
<ShoppingCart client:load />

<!-- Below fold: client:visible -->
<RelatedProducts client:visible />
```

**Read full optimization guide:** `/one/knowledge/performance.md`

---

## Role-Based UI (People Dimension)

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

**Before coding, answer:**

### Ontology Mapping
1. Which dimension? (groups/people/things/connections/events/knowledge)
2. Which thing type? (product, course, token, agent, etc.)
3. Which connection type? (owns, purchased, enrolled_in, holds_tokens)
4. Which event type? (created, updated, purchased, completed)

### Performance
1. Can this be static HTML? → Astro component (no JS)
2. Needs interactivity? → Client island (`client:load|idle|visible`)
3. Real-time data? → Convex `useQuery`
4. Heavy component? → Dynamic import + code splitting

### Component Selection
1. Static content? → Astro component
2. Simple interactivity? → React component + hooks
3. Complex state? → React + nanostores
4. Form handling? → React + Effect.ts validation

**Read full decision tree:** `/one/connections/workflow.md#phase-5`

---

## Common Mistakes

**Ontology violations:**
- ❌ Creating custom tables
- ✅ Map to 6 dimensions

**Performance anti-patterns:**
- ❌ `client:load` everywhere
- ✅ Use appropriate directive (idle, visible)

**Pattern divergence:**
- ❌ ProductCard, CourseCard, UserCard (many patterns)
- ✅ ThingCard, PersonCard (ONE pattern)

**Read full list:** `/one/knowledge/rules.md#common-mistakes`

---

## Development Commands

```bash
cd web/
bun run dev      # Development server (localhost:4321)
bun run build    # Build for production
bunx astro check # Type checking
bunx astro sync  # Generate content collection types
bun test         # Run tests
bun test --watch # Watch mode
```

**Read full commands:** `/one/knowledge/development-commands.md`

---

## Further Cascading

**For more specific context:**
- Component patterns: `/web/src/components/CLAUDE.md`
- Page patterns: `/web/src/pages/CLAUDE.md`
- Service layer: `/web/src/lib/services/CLAUDE.md` (if exists)

**Precedence rule:** Closer to file = higher precedence.

---

**Frontend Specialist: Render the 6-dimension ontology with performance and pattern convergence.**
