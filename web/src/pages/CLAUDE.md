# Page Development - CLAUDE.md

## This is a Cascading Context File

**You've read `/web/CLAUDE.md` (web-level).** This file adds PAGE-SPECIFIC patterns for `src/pages/`.

**What you learned from parent:**
- Progressive complexity (5 layers)
- Pattern convergence (ThingCard, PersonCard, EventItem)
- Islands architecture
- Provider pattern for backend-agnostic code

**What this file adds:**
- File-based routing in Astro
- Static vs dynamic vs on-demand pages
- `getStaticPaths()` pattern for dynamic routes
- Layout integration in pages
- Data fetching strategies in pages
- SEO and metadata patterns
- Common page structures and mistakes

---

## File-Based Routing Fundamentals

**Astro uses automatic file-based routing.** Every file in `src/pages/` becomes a route on your site.

```
src/pages/index.astro           → /
src/pages/about.astro           → /about
src/pages/blog/index.astro      → /blog
src/pages/blog/my-post.astro    → /blog/my-post
src/pages/docs/[slug].astro     → /docs/anything (dynamic)
src/pages/[...slug].astro       → / and /any/deep/path (catch-all)
```

**No routing config needed.** Add a file, get a route. Delete a file, route disappears.

**Key principle:** Always scope pages by `groupId` for multi-tenancy support.

---

## Page Template Catalog

**CRITICAL: Before creating ANY new page, check if a template exists.**

### Available Page Templates

#### E-commerce Templates
```
/web/src/pages/shop/product-landing.astro
├─ Features: Product gallery, reviews, Stripe checkout, urgency banners
├─ Guide: /web/src/pages/shop/TEMPLATE-README.md
├─ Use for: Product pages, shop pages, landing pages for merchandise
└─ Stripe-ready: Yes (just add API keys)
```

#### Other Page Templates
```bash
# Search all available pages
glob "web/src/pages/**/*.astro"

# Common patterns:
/web/src/pages/account/*.astro        # Auth flows
/web/src/pages/dashboard/*.astro      # Admin dashboards
/web/src/pages/docs/[...slug].astro   # Documentation
/web/src/pages/blog/[...slug].astro   # Blog posts
```

### Template Usage Pattern

**ALWAYS follow this pattern when creating pages:**

```bash
# Step 1: Search for similar pages
glob "web/src/pages/**/*.astro"

# Step 2: Read template
Read("/web/src/pages/shop/product-landing.astro")

# Step 3: Read template guide
Read("/web/src/pages/shop/TEMPLATE-README.md")

# Step 4: Copy and customize
# - Update product data
# - Modify layout/content
# - Keep component structure

# Step 5: Offer enhancements
# - "Make this your home page?"
# - "Add Stripe checkout?"
# - "Add more features?"
```

### Example: Creating a T-Shirt Shop Page

User: "I want to create a page that sells a t-shirt"

**Template-first approach:**
```
1. ✅ Use /web/src/pages/shop/product-landing.astro
2. ✅ Update product data (t-shirt details)
3. ✅ Ask: "Want this as home page?"
4. ✅ After creation: "Add Stripe for payments?"
```

**From-scratch approach (WRONG):**
```
1. ❌ Create new ProductPage.astro from blank file
2. ❌ Rebuild gallery component
3. ❌ Rebuild reviews section
4. ❌ Figure out Stripe integration
Result: Hours instead of minutes
```

---

## Page Types & Rendering Modes

### 1. Static Pages (Default)

**What they are:** Pre-rendered at build time, HTML file on disk.

**When to use:** Fixed routes like `/about`, `/contact`, product pages with stable data.

**Pattern:**
```astro
---
// src/pages/about.astro
import Layout from '../layouts/Layout.astro';
---

<Layout title="About">
  <h1>About Us</h1>
  <p>Our story...</p>
</Layout>
```

**Output:** `/about.html` (static file)

### 2. Dynamic Pages with getStaticPaths() (Static Generation)

**What they are:** Multiple pages from a single template, all pre-rendered at build time.

**When to use:** Product catalog (/products/1, /products/2), blog posts (/blog/post-1, /blog/post-2).

**Pattern:**
```astro
---
// src/pages/products/[id].astro
import Layout from '../../layouts/Layout.astro';

export function getStaticPaths() {
  return [
    { params: { id: "1" }, props: { name: "Widget" } },
    { params: { id: "2" }, props: { name: "Gadget" } },
    { params: { id: "3" }, props: { name: "Doohickey" } },
  ];
}

const { id } = Astro.params;
const { name } = Astro.props;
---

<Layout title={name}>
  <h1>{name}</h1>
  <p>Product ID: {id}</p>
</Layout>
```

**Output:** `/products/1.html`, `/products/2.html`, `/products/3.html` (3 static files)

**Data in getStaticPaths():**
- Return objects with `params` (required, URL parameters)
- Return objects with `props` (optional, passed to page component)

### 3. On-Demand Pages (SSR)

**What they are:** Rendered on request, not at build time.

**When to use:** User profiles (/user/123), dynamic user-generated content, personalized pages.

**Pattern:**
```astro
---
// src/pages/user/[id].astro
// Only use in SSR mode (adapter configured)

export const prerender = false;

const { id } = Astro.params;
const user = await fetchUserFromDB(id); // Runtime fetch
---

<h1>{user.name}</h1>
<p>User ID: {id}</p>
```

**Output:** No file at build time. Generated when someone requests `/user/123`.

---

## Dynamic Route Patterns

### Single Parameter

```astro
---
// src/pages/blog/[slug].astro
export function getStaticPaths() {
  return [
    { params: { slug: "hello-world" } },
    { params: { slug: "second-post" } },
  ];
}

const { slug } = Astro.params;
---
```

Routes: `/blog/hello-world`, `/blog/second-post`

### Multiple Parameters

```astro
---
// src/pages/[year]/[month]/[day].astro
export function getStaticPaths() {
  return [
    { params: { year: "2025", month: "01", day: "08" } },
    { params: { year: "2025", month: "01", day: "09" } },
  ];
}

const { year, month, day } = Astro.params;
---
```

Routes: `/2025/01/08`, `/2025/01/09`

### Rest Parameters (Catch-All)

```astro
---
// src/pages/docs/[...slug].astro
export function getStaticPaths() {
  return [
    { params: { slug: undefined } },           // /docs
    { params: { slug: "getting-started" } },   // /docs/getting-started
    { params: { slug: "api/reference" } },     // /docs/api/reference
    { params: { slug: "api/queries" } },       // /docs/api/queries
  ];
}

const { slug } = Astro.params;
const breadcrumbs = slug?.split("/") ?? [];
---
```

Routes: `/docs`, `/docs/getting-started`, `/docs/api/reference`, `/docs/api/queries`

### Mixed Parameters

```astro
---
// src/pages/[org]/[repo]/tree/[branch]/[...file].astro
export function getStaticPaths() {
  return [
    { params: { org: "withastro", repo: "astro", branch: "main", file: "docs/index.md" } },
  ];
}

const { org, repo, branch, file } = Astro.params;
---
```

Route: `/withastro/astro/tree/main/docs/index.md`

---

## getStaticPaths() Deep Dive

### How It Works

1. **Build time only:** Runs when you build, not in dev (dev regenerates on file change)
2. **Returns array:** Each object = one route
3. **params required:** URL parameters for this route
4. **props optional:** Data passed to component for this route

### Best Practices

**1. Data from content collections:**
```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const products = await getCollection('products');

  return products.map(product => ({
    params: { id: product.id },
    props: { product }
  }));
}

const { product } = Astro.props;
---
<h1>{product.data.name}</h1>
```

**2. Decoding URL parameters:**
```astro
---
export function getStaticPaths() {
  return [
    { params: { slug: decodeURI("%5Bpage%5D") } }, // decodes to "[page]"
  ];
}
---
```

**3. Performance (fetch once at build):**
```astro
---
export async function getStaticPaths() {
  // Fetch data once at build time
  const response = await fetch('https://api.example.com/products');
  const products = await response.json();

  // Generate one route per product
  return products.map(product => ({
    params: { slug: product.slug },
    props: { product }
  }));
}

const { product } = Astro.props;
---
```

---

## Layout Integration

### Using Layouts in Pages

**Layouts provide consistent page structure.** Pass data through props.

```astro
---
// src/pages/blog/[slug].astro
import BlogLayout from '../../layouts/BlogLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
---

<BlogLayout title={post.data.title} author={post.data.author}>
  {post.data.excerpt}
</BlogLayout>
```

```astro
---
// src/layouts/BlogLayout.astro
interface Props {
  title: string;
  author: string;
}

const { title, author } = Astro.props;
---

<html>
  <head>
    <title>{title}</title>
    <meta name="author" content={author}>
  </head>
  <body>
    <header>
      <h1>{title}</h1>
      <p>By {author}</p>
    </header>
    <main>
      <slot /> <!-- page content inserted here -->
    </main>
  </body>
</html>
```

### Collapsing the Sidebar

**The default Layout includes a sidebar. Collapse it to maximize page width:**

```astro
---
// src/pages/chat/index.astro
import Layout from '@/layouts/Layout.astro';
import { ChatClient } from '@/components/ai/ChatClient';

const title = 'AI Chat';
---

<Layout title={title} sidebarInitialCollapsed={true}>
  <ChatClient client:only="react" />
</Layout>
```

**Sidebar behavior when collapsed:**
- Shows only icons (80px width instead of 256px)
- Users can hover to temporarily expand (desktop only)
- Desktop toggle button still works
- Mobile menu works normally

**When to collapse:**
- Chat interfaces (maximize chat area)
- Full-width editors
- Canvas/drawing apps
- Data visualization dashboards
- Wide tables or spreadsheets

**Default behavior:**
```astro
<!-- Sidebar expanded by default (256px) -->
<Layout title="Dashboard">
  <Content />
</Layout>

<!-- Sidebar collapsed (80px, icons only) -->
<Layout title="Chat" sidebarInitialCollapsed={true}>
  <ChatInterface />
</Layout>
```

### Nesting Layouts

**Layouts can use other layouts:**

```astro
---
// src/layouts/BlogLayout.astro (specialized)
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  author: string;
}

const { title, author } = Astro.props;
---

<BaseLayout title={title}>
  <article>
    <h2>{title}</h2>
    <p>By {author}</p>
    <slot />
  </article>
</BaseLayout>
```

```astro
---
// src/layouts/BaseLayout.astro (general)
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <nav><!-- navigation --></nav>
    <slot /> <!-- specialized layout inserted here -->
    <footer><!-- footer --></footer>
  </body>
</html>
```

---

## Data Fetching Strategies in Pages

### Strategy 1: Component Script (Build Time)

**Fetch data in the `.astro` component's frontmatter (runs at build time).**

```astro
---
// src/pages/products.astro
const response = await fetch('https://api.example.com/products');
const products = await response.json();
---

<div>
  {products.map(product => (
    <div>{product.name}</div>
  ))}
</div>
```

**Pros:** Fast, no JS sent to browser, SEO-friendly
**Cons:** Data fixed at build time, not real-time

### Strategy 2: getCollection() (Build Time)

**Query content collections with type safety.**

```astro
---
// src/pages/blog.astro
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
const sortedPosts = posts.sort((a, b) =>
  new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
);
---

<h1>Blog Posts</h1>
{sortedPosts.map(post => (
  <a href={`/blog/${post.slug}`}>{post.data.title}</a>
))}
```

**Pros:** Type-safe, no runtime overhead
**Cons:** Data fixed at build time

### Strategy 3: Convex HTTP Client (SSR)

**Fetch with Convex HTTP client in Astro component script (on-demand).**

```astro
---
// src/pages/products.astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

// Fetch at build time (static) or request time (SSR)
const products = await convex.query(api.queries.products.list, {
  groupId: Astro.params.groupId
});
---

<h1>Products</h1>
{products.map(product => (
  <div>{product.name}</div>
))}
```

**Pros:** Can access database, real-time data
**Cons:** Slower than static, JS required

### Strategy 4: Client Island with useQuery() (Real-Time)

**Fetch in React island with Convex real-time queries.**

```astro
---
// src/pages/dashboard.astro
import Dashboard from '../components/Dashboard.tsx';
import Layout from '../layouts/Layout.astro';
---

<Layout>
  <Dashboard client:load />
</Layout>
```

```tsx
// src/components/Dashboard.tsx
import { useQuery } from 'convex/react';
import { api } from '@/lib/convex';

export function Dashboard() {
  const products = useQuery(api.queries.products.list);

  if (products === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {products.map(product => (
        <div key={product._id}>{product.name}</div>
      ))}
    </div>
  );
}
```

**Pros:** Real-time updates, reactive
**Cons:** Requires JavaScript, API call on load

### Strategy 5: Mix Strategies (Hybrid)

**Static page with client island for real-time data.**

```astro
---
// src/pages/products.astro
import { getCollection } from 'astro:content';
import ProductGrid from '../components/ProductGrid.tsx';
import Layout from '../layouts/Layout.astro';

// Static data at build time
const products = await getCollection('products');
---

<Layout>
  {/* Static grid from content collection */}
  <div class="grid">
    {products.map(product => (
      <div key={product.id}>
        {product.data.name}
      </div>
    ))}
  </div>

  {/* Client island for real-time pricing */}
  <ProductGrid productIds={products.map(p => p.id)} client:idle />
</Layout>
```

```tsx
// src/components/ProductGrid.tsx
import { useQuery } from 'convex/react';
import { api } from '../lib/convex';

export function ProductGrid({ productIds }: { productIds: string[] }) {
  const prices = useQuery(api.queries.products.getPrices, { ids: productIds });

  if (!prices) return <div>Loading prices...</div>;

  return (
    <div>
      {prices.map(price => (
        <div key={price.productId}>${price.current}</div>
      ))}
    </div>
  );
}
```

---

## Page Structure Template

```astro
---
// 1. IMPORTS
import Layout from '../layouts/Layout.astro';
import { getCollection } from 'astro:content';
import Card from '../components/Card.astro';

// 2. DYNAMIC ROUTES (if applicable)
export async function getStaticPaths() {
  const items = await getCollection('items');

  return items.map(item => ({
    params: { id: item.id },
    props: { item }
  }));
}

// 3. DATA FETCHING (build-time)
const { item } = Astro.props;
const relatedItems = await getCollection('items');

// 4. TYPE DEFINITIONS (optional)
interface PageProps {
  title: string;
}
---

<!-- 5. LAYOUT WRAPPER -->
<Layout title={item.data.title}>
  <!-- 6. STATIC CONTENT -->
  <h1>{item.data.title}</h1>

  <!-- 7. COMPONENT COMPOSITION -->
  {relatedItems.map(related => (
    <Card item={related} />
  ))}

  <!-- 8. CLIENT ISLANDS (interactive parts) -->
  <ShoppingCart client:load />
</Layout>
```

---

## SEO & Metadata in Pages

### Page-Level Meta Tags

```astro
---
// src/pages/blog/[slug].astro
import { SEOHead } from '../components/SEOHead.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');

  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<html>
  <head>
    <SEOHead
      title={post.data.title}
      description={post.data.excerpt}
      image={post.data.image}
      canonicalURL={canonicalURL}
    />
  </head>
  <body>
    {/* page content */}
  </body>
</html>
```

### SEOHead Component

```astro
---
// src/components/SEOHead.astro
interface Props {
  title: string;
  description: string;
  image?: string;
  canonicalURL: URL;
}

const { title, description, image, canonicalURL } = Astro.props;
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
{image && <meta property="og:image" content={image} />}
<meta property="og:url" content={canonicalURL} />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{image && <meta name="twitter:image" content={image} />}

<!-- Canonical -->
<link rel="canonical" href={canonicalURL} />
```

---

## Common Page Patterns

### Pattern 1: Blog Index

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import BlogCard from '../../components/BlogCard.astro';

const posts = await getCollection('blog');
const sortedPosts = posts
  .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
---

<Layout title="Blog">
  <h1>Latest Posts</h1>
  <div class="grid">
    {sortedPosts.map(post => (
      <BlogCard post={post} />
    ))}
  </div>
</Layout>
```

### Pattern 2: Dynamic Product Page

```astro
---
// src/pages/products/[id].astro
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import ShoppingCart from '../../components/ShoppingCart.tsx';

export async function getStaticPaths() {
  const products = await getCollection('products');

  return products.map(product => ({
    params: { id: product.id },
    props: { product }
  }));
}

const { product } = Astro.props;
---

<Layout title={product.data.name}>
  <div class="product">
    <img src={product.data.image} alt={product.data.name} />
    <h1>{product.data.name}</h1>
    <p>{product.data.description}</p>
    <ShoppingCart product={product} client:load />
  </div>
</Layout>
```

### Pattern 3: Filtered Catalog

```astro
---
// src/pages/products/[category].astro
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';
import ProductCard from '../../components/ProductCard.astro';

export async function getStaticPaths() {
  const products = await getCollection('products');

  // Get unique categories
  const categories = [...new Set(products.map(p => p.data.category))];

  return categories.map(category => ({
    params: { category },
    props: { category }
  }));
}

const { category } = Astro.props;
const products = await getCollection('products');
const filtered = products.filter(p => p.data.category === category);
---

<Layout title={category}>
  <h1>{category}</h1>
  <div class="grid">
    {filtered.map(product => (
      <ProductCard product={product} />
    ))}
  </div>
</Layout>
```

### Pattern 4: Catch-All Documentation

```astro
---
// src/pages/docs/[...slug].astro
import { getCollection } from 'astro:content';
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const docs = await getCollection('docs');

  return docs.map(doc => ({
    params: { slug: doc.slug },
    props: { doc }
  }));
}

const { doc } = Astro.props;
---

<Layout title={doc.data.title}>
  <nav class="toc">
    {/* Table of contents */}
  </nav>
  <article>
    <h1>{doc.data.title}</h1>
    <div set:html={doc.body} />
  </article>
</Layout>
```

### Pattern 5: Group-Scoped Things (Ontology)

```astro
---
// src/pages/groups/[groupId]/things/[type].astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Layout from '@/layouts/Layout.astro';
import ThingCard from '@/components/features/ThingCard';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

const { groupId, type } = Astro.params;

// Fetch things of specific type in group
const things = await convex.query(api.queries.things.list, {
  groupId,
  type
});
---

<Layout title={`${type} in Group`}>
  <div class="grid gap-4">
    {things.map(thing => (
      <ThingCard thing={thing} type={type} />
    ))}
  </div>
</Layout>
```

---

## Common Mistakes to Avoid

### Mistake 1: Forgetting getStaticPaths()

```astro
<!-- WRONG - Dynamic route without getStaticPaths() -->
const { id } = Astro.params; <!-- Build fails, params undefined -->
```

**Fix:** Always export `getStaticPaths()` for dynamic routes:

```astro
---
export async function getStaticPaths() {
  return [
    { params: { id: "1" } },
    { params: { id: "2" } },
  ];
}

const { id } = Astro.params;
---
```

### Mistake 2: Over-Hydrating Pages

```astro
<!-- WRONG - client:load everywhere -->
<Button client:load />
<Card client:load />
<Image client:load />
<Text client:load />
```

**Fix:** Only hydrate interactive parts. Use `client:idle` or `client:visible` for deferred loading:

```astro
<!-- RIGHT -->
<Button client:load />        <!-- Immediately interactive -->
<SearchBox client:idle />     <!-- Interactive when idle -->
<RelatedProducts client:visible /> <!-- Interactive when scrolled into view -->
<Card />                      <!-- Static, no JS -->
```

### Mistake 3: Fetching in Component Script During SSG

```astro
---
// WRONG - Trying to fetch at build time for every request
const user = await fetch(`/api/user/${Astro.params.userId}`);
---
```

**Fix:** Use appropriate strategy for your mode. In SSG, use `getStaticPaths()` with props:

```astro
---
export async function getStaticPaths() {
  const users = await getCollection('users');

  return users.map(user => ({
    params: { userId: user.id },
    props: { user }
  }));
}

const { user } = Astro.props;
---
```

### Mistake 4: Not Using Content Collections for Content

```astro
---
// WRONG - Loading from files manually
const files = import.meta.glob('../content/blog/*.md');
---
```

**Fix:** Use content collections API with type safety:

```astro
---
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
---
```

### Mistake 5: Ignoring Layout in Dynamic Routes

```astro
---
// WRONG - Missing layout wrapper
export async function getStaticPaths() { /* ... */ }
const { product } = Astro.props;
---

<h1>{product.name}</h1>
<p>{product.description}</p>
```

**Fix:** Wrap with layout for consistent structure:

```astro
---
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() { /* ... */ }
const { product } = Astro.props;
---

<Layout title={product.name}>
  <h1>{product.name}</h1>
  <p>{product.description}</p>
</Layout>
```

### Mistake 6: Building Without Island Architecture

```astro
<!-- WRONG - Interactive form in static Astro template -->
<form>
  <input type="text" name="search" />
  <button onclick="handleClick()">Search</button>
</form>

<script>
  function handleClick() { /* won't work */ }
</script>
```

**Fix:** Use client island for interactivity:

```astro
---
import SearchForm from '../components/SearchForm.tsx';
---

<!-- Static page -->
<h1>Search Products</h1>

<!-- Interactive island -->
<SearchForm client:load />
```

---

## Decision Tree: When to Use Each Pattern

```
Do you have a static route?
├─ YES → src/pages/about.astro
└─ NO → Do you know all URLs at build time?
     ├─ YES → src/pages/[id].astro + getStaticPaths()
     └─ NO → Do you have SSR adapter configured?
          ├─ YES → src/pages/[id].astro (no getStaticPaths())
          └─ NO → Use getStaticPaths() or deploy with SSR
```

---

## Performance Tips

### 1. Use getStaticPaths() props for data

```astro
<!-- GOOD - Data passed via props (no serialization) -->
export async function getStaticPaths() {
  return items.map(item => ({
    params: { id: item.id },
    props: { item } // ← Passed directly
  }));
}

const { item } = Astro.props;
```

### 2. Lazy load client islands

```astro
<!-- Static page loads fast -->
<Hero />

<!-- Search is idle, won't load JS until needed -->
<SearchBox client:idle />

<!-- Products load when scrolled into view -->
<ProductGrid client:visible />
```

### 3. Minimize props to islands

```astro
<!-- GOOD - Minimal data to island -->
<ProductGrid productIds={[1,2,3]} client:load />

<!-- BAD - Huge data to island -->
<ProductGrid products={allProducts} client:load />
```

---

## SEO Checklist

- [ ] Each page has `<title>` tag with unique, descriptive text
- [ ] Meta description is 150-160 characters
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Twitter Card tags for social sharing
- [ ] Canonical URL to prevent duplicates
- [ ] Structured data (JSON-LD) for rich results
- [ ] Alt text on all images
- [ ] Heading hierarchy (h1 → h2 → h3)
- [ ] Internal links use `href="/path"` (root-relative)

---

## Before Creating a New Page

**Search existing pages first:**

```bash
# List all existing pages
find /Users/toc/Server/ONE/web/src/pages -name "*.astro" -o -name "*.tsx"

# Search for similar routes
ls -la /Users/toc/Server/ONE/web/src/pages/groups/

# Search for SSR patterns
grep -r "ConvexHttpClient" /Users/toc/Server/ONE/web/src/pages/

# Check for similar data fetching
grep -r "api.queries" /Users/toc/Server/ONE/web/src/pages/ | grep -i <entity-type>
```

**Ask yourself:**
- Does a similar page route already exist?
- Can I use dynamic routes `[param]` instead of static pages?
- Does an existing page use the same data fetching pattern?
- Can I extend an existing layout instead of creating a new one?

---

## Further Learning

**Parent context:** `/web/CLAUDE.md`

**Related contexts:**
- Component patterns: `/web/src/components/CLAUDE.md`
- Content collections: `/one/knowledge/astro-effect-complete-vision.md`

**Astro docs:**
- Pages: `/docs/astro/basics/astro-pages.mdx`
- Routing: `/docs/astro/guides/routing.mdx`
- Layouts: `/docs/astro/basics/layouts.mdx`

---

**Key Principle:** Pages render the 6-dimension ontology. Use layouts for consistency. Fetch data at build time when possible. Hydrate only what needs interaction. Always scope by groupId for multi-tenancy.
