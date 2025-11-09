# Component Development - CLAUDE.md

## ⚠️ CRITICAL: Create `.tsx` Files, Not `.astro` Files

**ALL components in this directory MUST be React components (`.tsx`), not Astro components (`.astro`).**

### Why TSX Instead of Astro Components?

1. **Testability** - React Testing Library works perfectly with TSX
2. **Portability** - TSX components work in any React environment
3. **TypeScript Integration** - Better type inference and IDE support
4. **Shadcn/ui Compatibility** - All shadcn components are React/TSX
5. **Developer Experience** - Most developers know React

### When to Use Each File Type

```
src/pages/       → .astro files (routing, SSR data fetching, page-level logic)
src/layouts/     → .astro files (page structure, SEO, meta tags)
src/components/  → .tsx files (reusable UI, interactive components) ← YOU ARE HERE
```

### Correct Pattern

```tsx
// ✅ CORRECT: src/components/features/products/ProductCard.tsx
interface ProductCardProps {
  name: string;
  price: number;
}

export function ProductCard({ name, price }: ProductCardProps) {
  return (
    <div className="product-card">
      <h3>{name}</h3>
      <p>${price}</p>
    </div>
  );
}
```

```astro
<!-- ❌ WRONG: Don't create .astro components in this directory -->
---
interface Props {
  name: string;
  price: number;
}
const { name, price } = Astro.props;
---
<div class="product-card">
  <h3>{name}</h3>
  <p>${price}</p>
</div>
```

---

## This is a Cascading Context File

**You've read `/CLAUDE.md` (root) → `/web/CLAUDE.md` (frontend).** This file adds COMPONENT-SPECIFIC patterns and guidance.

**What you learned from parent files:**
- 6-dimension ontology (Groups, People, Things, Connections, Events, Knowledge)
- Progressive complexity (5 layers)
- Pattern convergence (ONE ThingCard, ONE PersonCard, ONE EventItem)
- Astro islands architecture
- nanostores state management

**What this file adds:**
- TSX component patterns (React with TypeScript)
- Component props with TypeScript interfaces
- Island hydration decisions (client:load, client:idle, client:visible)
- How to use TSX components in Astro pages
- Real-world component patterns for 6-dimension ontology
- Common mistakes and how to avoid them

---

## Component Discovery Before Creation

**CRITICAL: Before building ANY component, search for existing ones:**

### Search Pattern - Priority Order

**1. Search shadcn/ui components FIRST (50+ pre-installed):**
```bash
# Check if shadcn/ui already has what you need
ls /Users/toc/Server/ONE/web/src/components/ui/

# Common shadcn components available:
# button, card, input, select, dialog, dropdown-menu, avatar,
# badge, skeleton, separator, table, tabs, toast, tooltip, etc.
```

**2. Search template components (product pages, shop, etc.):**
```bash
# Search for product/shop templates
Glob: "web/src/pages/**/*product*.astro"
Glob: "web/src/pages/**/*shop*.astro"
Glob: "web/src/pages/**/*landing*.astro"

# Example: product-landing.astro contains:
# - ProductGallery (image zoom and gallery)
# - ProductHeader (title and metadata)
# - InlineUrgencyBanner (stock/countdown)
# - ReviewsSection (customer reviews)
# - StickyBuyBar (purchase CTA)
# - RecentPurchaseToast (social proof)
```

**3. Search existing custom components:**
```bash
# Search by feature
Glob: "web/src/components/**/*product*.tsx"
Glob: "web/src/components/**/*cart*.tsx"
Glob: "web/src/components/**/*user*.tsx"

# Search by category
Glob: "web/src/components/ecommerce/**/*.tsx"
Glob: "web/src/components/shop/**/*.tsx"
Glob: "web/src/components/features/**/*.tsx"

# Search by ontology dimension
Glob: "web/src/components/**/*Thing*.tsx"
Glob: "web/src/components/**/*Person*.tsx"
Glob: "web/src/components/**/*Event*.tsx"
```

**4. Search content collections (for data patterns):**
```bash
# Check what content structures exist
ls /Users/toc/Server/ONE/web/src/content/

# Common collections: products, courses, blog, docs, tokens
```

### Template Component Extraction

**Template pages contain reusable components you can extract:**

**Product Landing Template** (`/web/src/pages/shop/product-landing.astro`):
- **ProductGallery** - Image zoom, thumbnails, gallery navigation
- **ProductHeader** - Title, price, category, metadata
- **InlineUrgencyBanner** - Stock indicators, countdown timers
- **ReviewsSection** - Customer reviews, ratings, testimonials
- **StickyBuyBar** - Fixed purchase CTA on scroll
- **RecentPurchaseToast** - Social proof notifications

**To reuse template components:**
1. Read the template page to see component implementation
2. Extract component to `/web/src/components/features/<category>/`
3. Make it generic (remove hardcoded data)
4. Import and reuse across multiple pages

**Example extraction:**
```typescript
// FROM: /web/src/pages/shop/product-landing.astro
// Inline ProductGallery component

// TO: /web/src/components/features/products/ProductGallery.tsx
interface ProductGalleryProps {
  images: string[];
  alt: string;
  enableZoom?: boolean;
}

export function ProductGallery({ images, alt, enableZoom = true }: ProductGalleryProps) {
  // Extracted component logic
}
```

### Component Priority (Follow This Order)

**Priority 1: shadcn/ui components (ALWAYS CHECK FIRST)**
```typescript
// ✅ Use shadcn/ui for UI primitives
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// ❌ DON'T build custom buttons, cards, badges, avatars
```

**Priority 2: Existing template components**
```typescript
// ✅ Copy from product-landing.astro or similar templates
import { ProductGallery } from '@/components/features/products/ProductGallery';

// ❌ DON'T build image galleries from scratch
```

**Priority 3: Existing custom components**
```typescript
// ✅ Use existing ThingCard, PersonCard, EventItem
import { ThingCard } from '@/components/features/ontology/ThingCard';

// ❌ DON'T create ProductCard, CourseCard, TokenCard
```

**Priority 4: Build new component (LAST RESORT)**
```typescript
// ⚠️ ONLY if no existing component or template matches
// MUST follow naming convention and ontology mapping
```

### Component Categories

**E-commerce Components:**
- Product displays → ThingCard with `type="product"`
- Shopping cart → Search for "cart" in components
- Checkout flows → Search templates in `/pages/shop/`
- Payment forms → Stripe integration examples

**Course/Learning Components:**
- Course cards → ThingCard with `type="course"`
- Lesson lists → Search for "lesson" or "module"
- Progress tracking → Search for "progress"
- Enrollment → Search for "enroll"

**Landing Page Components:**
- Hero sections → Search templates in `/pages/`
- Feature grids → Search for "features" in components
- Testimonials → Search "reviews" or "testimonials"
- CTA sections → Search "cta" or templates

**Interactive Components:**
- Forms → shadcn/ui form components
- Search → Search for "search" in components
- Filters → Search for "filter" in components
- Modals/Dialogs → shadcn/ui dialog component

### Pattern Rules

**Ontology-based patterns (NEVER violate):**
- ✅ ONE ThingCard for all thing types (product, course, token, agent)
- ✅ ONE PersonCard for all people (users, creators, team members)
- ✅ ONE EventItem for all events (created, updated, purchased)
- ✅ Add props/variants instead of creating duplicate components
- ❌ DO NOT create ProductCard, CourseCard, TokenCard (use ThingCard variants)
- ❌ DO NOT create UserProfile, TeamCard, AgentCard (use PersonCard variants)

**Golden Rules:**
1. **Search before build** - 90% of components already exist in some form
2. **shadcn/ui first** - Use pre-built UI primitives
3. **Templates second** - Extract and customize template components
4. **Pattern convergence** - Extend existing patterns, don't create new ones
5. **Build last** - Only when absolutely nothing exists

**Why this matters:** Every component you build is a component that didn't need to be built. Search-first development reduces code duplication, maintains pattern consistency, and delivers features 10x faster.

---

## CRITICAL: Existing Code First (Legacy Search Commands)

**For manual searches (when Glob not available):**

```bash
# 1. Search for similar components
ls -la /Users/toc/Server/ONE/web/src/components/

# 2. Check feature directories
ls -la /Users/toc/Server/ONE/web/src/components/features/

# 3. Search for pattern keywords
grep -r "ThingCard\|PersonCard\|EventItem" /Users/toc/Server/ONE/web/src/components/

# 4. Check shadcn/ui components
ls -la /Users/toc/Server/ONE/web/src/components/ui/
```

---

## Using TSX Components in Astro Pages

**Since components are TSX, pages import and render them with client directives.**

### Basic Page Structure

```astro
---
// src/pages/products.astro (this is a PAGE, not a component)
import { getCollection } from 'astro:content';
import { ProductCard } from '@/components/features/products/ProductCard';
import Layout from '@/layouts/Layout.astro';

const products = await getCollection('products');
---

<Layout title="Products">
  <div class="grid grid-cols-3 gap-4">
    {products.map(product => (
      <!-- Static rendering (no JavaScript) -->
      <ProductCard {...product.data} />

      <!-- Or with interactivity (loads JavaScript) -->
      <ProductCard client:load {...product.data} />
    ))}
  </div>
</Layout>
```

### Pattern: Component Receives Data from Page

```tsx
// src/components/features/products/ProductGrid.tsx
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  limit?: number;
  featured?: boolean;
}

export function ProductGrid({ products, limit = 12, featured = false }: ProductGridProps) {
  const filtered = featured
    ? products.filter(p => p.featured)
    : products;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {filtered.slice(0, limit).map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Pattern: Component with Client-Side Data Fetching

```tsx
// src/components/features/products/RemoteProducts.tsx
import { useEffect, useState } from 'react';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RemoteProductsProps {
  endpoint: string;
}

export function RemoteProducts({ endpoint }: RemoteProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, [endpoint]);

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## TSX Component Patterns

**All components in this directory use React with TypeScript (`.tsx`).**

### Component Hydration Strategy

| Use Case | Directive | Why |
|----------|-----------|-----|
| Display only (no interaction) | No directive | Zero JavaScript sent to client |
| Critical interactivity | `client:load` | Loads immediately |
| Secondary interaction | `client:idle` | Loads when browser idle |
| Below-fold content | `client:visible` | Loads when scrolled into view |
| Browser APIs only | `client:only="react"` | No SSR, client-only |

### Basic React Component

```typescript
// src/components/ProductCard.tsx
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  product: Product;
  onSelect?: (id: string) => void;
}

export function ProductCard({ product, onSelect }: Props) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-bold">${product.price}</span>
          <Button onClick={() => onSelect?.(product.id)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### React with Hooks and State

```typescript
// src/components/SearchProducts.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
}

export function SearchProducts({ products }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(products);

  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(text.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search products..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-4">
        {results.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### React with Nanostores (Shared State)

```typescript
// src/components/ShoppingCart.tsx
import { useStore } from '@nanostores/react';
import { cart$, removeFromCart } from '@/stores/cart';
import { Button } from '@/components/ui/button';

export function ShoppingCart() {
  const $cart = useStore(cart$);

  return (
    <div className="space-y-2">
      {$cart.length === 0 && <p>Cart is empty</p>}

      {$cart.map(item => (
        <div key={item.id} className="flex justify-between">
          <span>{item.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFromCart(item.id)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
```

---

## Component Props & TypeScript

### Props Interface Pattern

```typescript
// Define props with TypeScript interface
interface Props {
  // Required props
  id: string;
  title: string;

  // Optional props
  description?: string;
  featured?: boolean;

  // Union types
  variant?: 'primary' | 'secondary' | 'outline';

  // Callback functions
  onClick?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;

  // Complex types
  items?: Array<{ id: string; name: string }>;
  metadata?: Record<string, unknown>;
}

export function MyComponent(props: Props) {
  // Use props
}
```

### Extending Base Props

```typescript
// Extend HTML element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant, size, loading, ...rest }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...rest}>
      {loading ? 'Loading...' : rest.children}
    </button>
  );
}
```

### Props with Ontology Types

```typescript
// Use types from 6-dimension ontology
import type { Thing, Person, Event, Connection } from '@/types';

// Thing renderer
interface ThingCardProps {
  thing: Thing;
  type: 'product' | 'course' | 'token' | 'agent';
  onSelect?: (id: string) => void;
}

// Person renderer
interface PersonCardProps {
  person: Person;
  role?: 'org_owner' | 'org_user' | 'customer';
  showRole?: boolean;
}

// Event renderer
interface EventItemProps {
  event: Event;
  compact?: boolean;
}

// Connection renderer
interface ConnectionListProps {
  connections: Connection[];
  type?: string;
}
```

---

## Island Hydration Decisions

**Astro principle:** Static HTML by default. Add JavaScript only where needed.

### Hydration Directives

```astro
---
import StaticComponent from './StaticComponent.astro';
import InteractiveComponent from './InteractiveComponent.tsx';
---

<!-- NO JavaScript (pure HTML) -->
<StaticComponent />

<!-- Load immediately (critical interactive) -->
<InteractiveComponent client:load />

<!-- Load when browser is idle (secondary) -->
<InteractiveComponent client:idle />

<!-- Load when visible in viewport (below fold) -->
<InteractiveComponent client:visible />

<!-- Load only on user interaction -->
<InteractiveComponent client:interaction />

<!-- Server-side rendering with fallback -->
<InteractiveComponent server:defer>
  <svg slot="fallback">Loading...</svg>
</InteractiveComponent>
```

### Decision Framework

**Ask these questions in order:**

1. **Does this need user interaction?**
   - No → Use Astro component (`.astro`)
   - Yes → Continue to next question

2. **Is this critical to page load?**
   - Yes (form, buttons above fold) → Use `client:load`
   - No → Continue to next question

3. **Is this visible on page load?**
   - Yes → Use `client:idle` (load after page renders)
   - No → Continue to next question

4. **Is this below the fold?**
   - Yes → Use `client:visible` (load when scrolled into view)
   - No → Use `client:idle`

### Pattern Examples

```astro
---
// src/pages/product.astro
import { getCollection } from 'astro:content';
import ProductCard from '@/components/ProductCard.astro';
import ShoppingCart from '@/components/ShoppingCart.tsx';
import RelatedProducts from '@/components/RelatedProducts.tsx';

const product = await getCollection('products');
---

<div>
  <!-- Static product info (no JS) -->
  <ProductCard product={product} />

  <!-- Interactive cart (critical, loads immediately) -->
  <ShoppingCart client:load />

  <!-- Related products (below fold, load when visible) -->
  <RelatedProducts products={related} client:visible />
</div>
```

---

## Static vs Interactive Component Architecture

### Static Component (Astro)

**Use when:** Display-only content, no user interaction

```astro
---
// src/components/ProductGrid.astro
import { getCollection } from 'astro:content';
import ProductCard from './ProductCard.astro';

const products = await getCollection('products');
---

<div class="grid grid-cols-3 gap-4">
  {products.map(product => (
    <ProductCard product={product} />
  ))}
</div>
```

**Characteristics:**
- Zero JavaScript sent to browser
- Server-side data fetching
- Renders to static HTML
- Suitable for SEO (no hydration needed)

### Interactive Component (React)

**Use when:** User interactions, state changes, real-time data

```typescript
// src/components/FilteredProducts.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
}

export function FilteredProducts({ products }: Props) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? products
    : products.filter(p => p.category === filter);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['all', 'electronics', 'books'].map(cat => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**Characteristics:**
- JavaScript sent to browser (hydration)
- Client-side state management
- React hooks for interactivity
- Heavier but interactive

### Hybrid Architecture

**Combine static + interactive strategically:**

```astro
---
// src/components/ProductPage.astro
import { getCollection } from 'astro:content';
import ProductHeader from './ProductHeader.astro';
import ProductReviews from './ProductReviews.tsx';
import RelatedProducts from './RelatedProducts.astro';
import CartButton from './CartButton.tsx';

const product = await getCollection('products').then(
  p => p.find(x => x.slug === Astro.params.id)
);
---

<!-- Static header (no JS) -->
<ProductHeader product={product} />

<!-- Interactive cart button (critical) -->
<CartButton product={product} client:load />

<!-- Interactive reviews (secondary) -->
<ProductReviews productId={product.id} client:idle />

<!-- Static related products (no JS) -->
<RelatedProducts similar={product.data.similar} />
```

**Benefits:**
- Only loads JavaScript where needed
- Fastest initial page load
- Best SEO scores
- Efficient resource usage

---

## Component Structure

### Directory Layout

```
/Users/toc/Server/ONE/web/src/components/
├── ui/                        # shadcn/ui components (never edit)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── features/                  # Custom feature components
│   ├── products/
│   │   ├── ProductCard.astro
│   │   ├── ProductGrid.tsx
│   │   └── ProductSearch.tsx
│   ├── cart/
│   │   ├── CartSummary.tsx
│   │   └── CartButton.tsx
│   └── ontology/              # 6-dimension ontology components
│       ├── ThingCard.tsx      # Generic thing renderer
│       ├── PersonCard.tsx     # Generic person renderer
│       └── EventItem.tsx      # Generic event renderer
├── layouts/                   # Page layouts
│   ├── BaseLayout.astro
│   └── ContentLayout.astro
├── landing/                   # Landing page components
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── CTA.tsx
└── CLAUDE.md                  # This file
```

### Feature Component Naming

```
// Good: Descriptive, action-oriented
ProductCard.astro          # Displays single product
ProductGrid.tsx            # Displays multiple products (interactive)
ProductSearch.tsx          # Searches products (interactive)
CartButton.tsx             # Add to cart button (interactive)
ReviewList.astro           # Lists reviews (static)

// Bad: Generic, doesn't describe purpose
Card.tsx                   # Too generic (use shadcn instead)
Product.astro              # What kind of product display?
Component.tsx              # Not descriptive
Item.astro                 # What item?
```

### Ontology Component Structure

```typescript
// src/components/features/ontology/ThingCard.tsx
// Handles ALL thing types (product, course, token, agent, etc.)

import type { Thing } from '@/types';

export type ThingType = 'product' | 'course' | 'token' | 'agent';

interface ThingCardProps {
  thing: Thing;
  type: ThingType;
  variant?: 'default' | 'compact' | 'featured';
  onSelect?: (id: string) => void;
}

export function ThingCard({ thing, type, variant = 'default', onSelect }: ThingCardProps) {
  // Single component handles all types
  const renderTypeSpecific = () => {
    switch (type) {
      case 'product':
        return <div>${thing.properties.price}</div>;
      case 'course':
        return <div>{thing.properties.enrollments} students</div>;
      case 'token':
        return <div>{thing.properties.supply} supply</div>;
      case 'agent':
        return <div>{thing.properties.model}</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{thing.name}</CardTitle>
        <Badge>{type}</Badge>
      </CardHeader>
      <CardContent>
        {thing.properties.description && (
          <p>{thing.properties.description}</p>
        )}
        {renderTypeSpecific()}
      </CardContent>
    </Card>
  );
}
```

---

## Common Patterns

### Pattern 1: Thing Card (All Entity Types)

```typescript
// src/components/features/ontology/ThingCard.tsx
import type { Thing } from '@/types/ontology';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ThingCardProps {
  thing: Thing;
  type: string;
}

export function ThingCard({ thing, type }: ThingCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{thing.name}</CardTitle>
        <Badge variant="secondary">{type}</Badge>
      </CardHeader>
      <CardContent>
        {thing.properties.image && (
          <img src={thing.properties.image} alt={thing.name} />
        )}
        <p className="text-sm text-muted-foreground">
          {thing.properties.description}
        </p>
      </CardContent>
    </Card>
  );
}
```

**Usage:**
```astro
---
import { ThingCard } from '@/components/features/ontology/ThingCard';
import { getCollection } from 'astro:content';

const products = await getCollection('products');
---

<div class="grid grid-cols-3 gap-4">
  {products.map(product => (
    <ThingCard thing={product} type="product" />
  ))}
</div>
```

### Pattern 2: Person Card (User/Team/Creator)

```typescript
// src/components/features/ontology/PersonCard.tsx
import type { Person } from '@/types/ontology';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PersonCardProps {
  person: Person;
  showRole?: boolean;
}

export function PersonCard({ person, showRole = true }: PersonCardProps) {
  const roleColors: Record<string, string> = {
    'org_owner': 'bg-red-100 text-red-800',
    'org_user': 'bg-blue-100 text-blue-800',
    'customer': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border">
      <Avatar>
        <AvatarImage src={person.properties.avatarUrl} />
        <AvatarFallback>{person.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium">{person.name}</p>
        {showRole && (
          <Badge className={roleColors[person.properties.role]}>
            {person.properties.role}
          </Badge>
        )}
      </div>
    </div>
  );
}
```

### Pattern 3: Event Item (Activity Feed)

```typescript
// src/components/features/ontology/EventItem.tsx
import type { Event } from '@/types/ontology';
import { formatDistanceToNow } from 'date-fns';

const eventIcons: Record<string, string> = {
  'created': '✨',
  'updated': '🔄',
  'purchased': '💳',
  'completed': '✓',
};

interface EventItemProps {
  event: Event;
  compact?: boolean;
}

export function EventItem({ event, compact = false }: EventItemProps) {
  return (
    <div className="flex gap-2 py-2">
      <span>{eventIcons[event.type] || '•'}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{event.type}</p>
        {!compact && event.data && (
          <p className="text-xs text-muted-foreground">{JSON.stringify(event.data)}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
      </span>
    </div>
  );
}
```

### Pattern 4: Data Provider (Multiple Sources)

```typescript
// src/components/features/products/ProductList.tsx
import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  source?: 'markdown' | 'api' | 'convex';
  limit?: number;
}

export function ProductList({ source = 'markdown', limit = 12 }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?source=${source}&limit=${limit}`);
        const data = await response.json();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [source, limit]);

  if (loading) return <div className="grid grid-cols-3 gap-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} />)}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Common Mistakes to Avoid

### Mistake 1: Creating Multiple Components for Same Pattern

```typescript
// BAD: Four different components for one pattern
<ProductCard product={p1} />
<CourseCard course={c1} />
<TokenCard token={t1} />
<AgentCard agent={a1} />

// GOOD: One component with type prop
<ThingCard thing={p1} type="product" />
<ThingCard thing={c1} type="course" />
<ThingCard thing={t1} type="token" />
<ThingCard thing={a1} type="agent" />
```

**Why:** Pattern divergence breaks AI code generation accuracy (95% → 30%).

### Mistake 2: Using `client:load` Everywhere

```typescript
// BAD: Loads JavaScript for everything
<ProductCard client:load />
<SearchBox client:load />
<RelatedProducts client:load />
<Footer client:load />

// GOOD: Strategic hydration
<ProductCard />                          {/* Static, no JS */}
<SearchBox client:load />                {/* Critical interactive */}
<RelatedProducts client:visible />       {/* Below fold */}
<Footer />                               {/* Static */}
```

**Why:** Unnecessary JavaScript increases page weight and slows initial load.

### Mistake 3: Creating Astro Components in Components Directory

```typescript
// BAD: Astro component in src/components/
---
// src/components/ProductList.astro ❌ WRONG LOCATION
interface Props {
  products: Product[];
}
const { products } = Astro.props;
---
<div>
  {products.map(p => <div>{p.name}</div>)}
</div>

// GOOD: TSX component in src/components/
// src/components/features/products/ProductList.tsx ✅ CORRECT
interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  return (
    <div>
      {products.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

### Mistake 4: Props Without TypeScript

```typescript
// BAD: No type safety
export function ProductCard(props) {
  return <Card>{props.name}</Card>;
}

// GOOD: Full TypeScript
interface Props {
  product: Product;
  onSelect?: (id: string) => void;
}

export function ProductCard({ product, onSelect }: Props) {
  return <Card>{product.name}</Card>;
}
```

### Mistake 5: Missing Ontology Mapping

```typescript
// BAD: Custom components that don't map to ontology
<ProductCard />
<CourseCard />
<CreatorCard />
<TimelineEvent />

// GOOD: All map to 6 dimensions
<ThingCard type="product" />
<ThingCard type="course" />
<PersonCard />
<EventItem />
```

### Mistake 6: Not Using shadcn/ui

```typescript
// BAD: Custom styling and components
export function Button() {
  return <button style={{ padding: '10px', backgroundColor: 'blue' }}>Click</button>;
}

// GOOD: Use shadcn/ui
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return <Button>Click</Button>;
}
```

### Mistake 7: Fetching Data in Components Instead of Pages

```typescript
// BAD: Component fetching data (creates loading states)
// src/components/features/products/ProductGrid.tsx
export function ProductGrid() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);

  return <div>{products.map(...)}</div>;
}

// GOOD: Page fetches, component receives props
// src/pages/products.astro
---
import { getCollection } from 'astro:content';
import { ProductGrid } from '@/components/features/products/ProductGrid';

const products = await getCollection('products');
---

<Layout>
  <ProductGrid products={products} />
</Layout>

// ALSO GOOD: Component uses Convex real-time
// src/components/features/products/LiveProducts.tsx
import { useQuery } from 'convex/react';

export function LiveProducts({ groupId }: { groupId: string }) {
  const products = useQuery(api.queries.products.list, { groupId });
  return <div>{products?.map(...)}</div>;
}
```

---

## Performance Best Practices

### Image Optimization

```astro
---
import { Image } from 'astro:assets';
import productImage from '@/assets/product.webp';
---

<!-- Optimized image (size, format, loading) -->
<Image
  src={productImage}
  alt="Product photo"
  width={400}
  height={300}
  format="webp"
  loading="lazy"
  densities={[1.5, 2]}
/>
```

### Code Splitting with Dynamic Imports

```typescript
// src/components/HeavyComponent.tsx
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const Chart = lazy(() => import('./Chart'));

export function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Chart />
    </Suspense>
  );
}
```

### Lighthouse Performance Checklist

- [ ] Critical path CSS inlined
- [ ] Unused CSS removed (Tailwind purge)
- [ ] Images optimized (WebP, lazy loading)
- [ ] JavaScript code-split (dynamic imports)
- [ ] Fonts preloaded
- [ ] No client:load unless critical
- [ ] Static components use Astro (not React)

---

## Development Workflow

### 1. Plan Component
- Which ontology dimension? (Things, People, Events, etc.)
- Static or interactive?
- Where does data come from? (collection, API, Convex)
- Props/interface definition

### 2. Create Component
- Create file in appropriate directory
- Define Props interface
- Implement component
- Use shadcn/ui for UI

### 3. Test Component
- Verify TypeScript compiles (bunx astro check)
- Test in browser (dev server)
- Check for console errors
- Verify accessibility

### 4. Document Component
- Add JSDoc comments
- Document Props interface
- Add usage example in comment

---

## Further Reading

**Parent Context:**
- `/CLAUDE.md` - Root instructions
- `/web/CLAUDE.md` - Frontend patterns

**Sibling Context:**
- `/web/src/pages/CLAUDE.md` - Page-specific patterns

**Architecture:**
- `/one/knowledge/ontology.md` - 6-dimension ontology
- `/one/knowledge/astro-effect-simple-architecture.md` - Progressive complexity
- `/one/connections/workflow.md` - Development workflow

**Components:**
- https://ui.shadcn.com/docs/components - shadcn/ui library
- `/docs/astro/basics/astro-components.mdx` - Astro component syntax

---

## Golden Rules Summary

1. **Always create `.tsx` files in `src/components/`** - Never create `.astro` files here
2. **Use named exports** - `export function Component() {}` not `export default`
3. **Define TypeScript interfaces** - All props must have types
4. **Follow feature-based organization** - Group by feature, not by type
5. **Use shadcn/ui components** - Don't reinvent UI primitives
6. **Add client directives in pages** - Components are used with `<Component client:load />`
7. **Pages fetch data, components render** - Separation of concerns
8. **Use Convex for real-time** - `useQuery` and `useMutation` hooks

---

**Component Specialist: TSX components only. Pattern convergence. Testable and portable.**
