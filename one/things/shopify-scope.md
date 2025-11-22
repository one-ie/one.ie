---
title: Shopify Integration - Scope & Roadmap
dimension: things
category: plans
tags: shopify, scope, mvp, roadmap, features
related_dimensions: connections, events, knowledge
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Defines the scope, MVP features, full features, and roadmap for Shopify integration.
  Prioritizes features by importance and complexity.
  Provides clear v1.0, v1.1, v1.2, v2.0 roadmap.
---

# Shopify Integration - Scope & Roadmap

**Version:** 1.0.0
**Purpose:** Define integration scope, MVP features, and implementation roadmap
**Status:** Complete - Phase 1 Research (Cycle 15)

---

## Executive Summary

This document defines the complete scope for Shopify integration into the ONE Platform. Based on research of Shopify's capabilities and ONE's 6-dimension ontology, we define:

- **MVP (v1.0):** Core e-commerce operations (products, cart, checkout)
- **Enhanced (v1.1):** Advanced features (collections, search, recommendations)
- **Complete (v1.2):** Admin operations (inventory, orders, fulfillments)
- **Hybrid (v2.0):** Gradual migration from Shopify to Convex

**Timeline:** 100 cycles (MVP in 40 cycles, full v1.2 in 85 cycles)

**Success Criteria:**
- ✅ All CRUD operations for core entities
- ✅ Real-time webhook support
- ✅ Backend-agnostic frontend
- ✅ 90%+ code coverage
- ✅ Zero custom tables (6-dimension ontology only)

---

## Table of Contents

1. [Feature Classification](#feature-classification)
2. [MVP Scope (v1.0)](#mvp-scope-v10)
3. [Enhanced Features (v1.1)](#enhanced-features-v11)
4. [Complete Features (v1.2)](#complete-features-v12)
5. [Hybrid Mode (v2.0)](#hybrid-mode-v20)
6. [Feature Prioritization](#feature-prioritization)
7. [Complexity Analysis](#complexity-analysis)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Success Metrics](#success-metrics)
10. [Risk Assessment](#risk-assessment)

---

## Feature Classification

### Core Features (Must Have)
Essential for basic e-commerce functionality.

### Enhanced Features (Should Have)
Improve UX and enable advanced use cases.

### Advanced Features (Nice to Have)
Differentiate from competitors, enable unique capabilities.

### Migration Features (v2.0+)
Support gradual migration from Shopify to Convex.

---

## MVP Scope (v1.0)

**Goal:** Basic headless storefront with Shopify as backend
**Timeline:** Cycles 1-65 (Phase 1-4)
**Target:** Launch a functional online store

### 1. Product Management (Read)

**Features:**
- ✅ List products with pagination
- ✅ Get product by ID/handle
- ✅ View product variants
- ✅ Display product images
- ✅ Show product pricing
- ✅ Display inventory status

**API Operations:**
```typescript
// Storefront API (GraphQL)
- products.list({ first: 20, after: cursor })
- products.get(id)
- products.search(query)
```

**Ontology Mapping:**
```typescript
Shopify Product → things (type: "product")
Shopify Variant → things (type: "product_variant")
Connection: variant_of
```

**UI Components:**
- `<ProductList />` - Grid/list view
- `<ProductCard />` - Product card
- `<ProductDetail />` - Detail page
- `<VariantSelector />` - Size/color picker
- `<ProductGallery />` - Image carousel

**Complexity:** Low (Cycles 43-45, 66-68)

---

### 2. Cart Management

**Features:**
- ✅ Add product to cart
- ✅ Update quantity
- ✅ Remove from cart
- ✅ View cart total
- ✅ Persist cart (local storage + Shopify checkout)

**API Operations:**
```typescript
// Shopify Storefront API
- checkout.create()
- checkout.lineItemsAdd()
- checkout.lineItemsUpdate()
- checkout.lineItemsRemove()
```

**Ontology Mapping:**
```typescript
Connection: in_cart (customer → product)
metadata: { quantity, variantId, addedAt }

Thing: checkout (type: "checkout")
properties: { cartToken, totalPrice, lineItems }
```

**UI Components:**
- `<Cart />` - Cart sidebar/modal
- `<CartLineItem />` - Line item
- `<AddToCart />` - Add to cart button
- `<CartSummary />` - Price summary

**State Management:**
```typescript
// Nanostore
export const cart = atom<CartItem[]>([]);
export const cartTotal = computed(cart, items =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);
```

**Complexity:** Medium (Cycles 52-53, 69-71, 81)

---

### 3. Checkout Flow

**Features:**
- ✅ Redirect to Shopify checkout
- ✅ Handle checkout completion (webhook)
- ✅ Display order confirmation

**API Operations:**
```typescript
// Redirect to checkout
window.location.href = checkout.webUrl;

// Webhook handling
POST /webhooks/checkouts/create
POST /webhooks/orders/create
```

**Ontology Mapping:**
```typescript
Event: order_placed (type: "order_placed")
Thing: order (type: "order")
Connection: contains (order → product)
Connection: purchased (customer → product)
```

**UI Components:**
- `<CheckoutButton />` - Redirect to checkout
- `<OrderConfirmation />` - Thank you page

**Complexity:** Low (Cycles 58, 72)

---

### 4. Basic Product Pages

**Features:**
- ✅ Product detail page
- ✅ Product listing page
- ✅ Shop home page

**Routes:**
```typescript
/shop                       // Shop home
/shop/products/[handle]     // Product detail
/shop/collections/all       // All products
```

**Page Structure:**
```astro
---
// /shop/products/[handle].astro
import { ShopifyProvider } from '@/providers/shopify';

const provider = new ShopifyProvider();
const product = await provider.things.get({ handle });
---

<ProductDetail product={product} />
```

**Complexity:** Low (Cycles 73-75)

---

### 5. Real-Time Webhooks (Core Events)

**Features:**
- ✅ Product created/updated/deleted
- ✅ Order created/paid/fulfilled
- ✅ Checkout created/updated

**Webhook Topics:**
```typescript
const MVP_WEBHOOKS = [
  'products/create',
  'products/update',
  'products/delete',
  'orders/create',
  'orders/paid',
  'orders/fulfilled',
  'checkouts/create',
  'checkouts/update'
];
```

**Event Processing:**
```typescript
app.post('/webhooks/:topic', async (req, res) => {
  // 1. Verify HMAC
  if (!verifyHMAC(req)) return res.status(401).send();

  // 2. Respond immediately
  res.status(200).send('OK');

  // 3. Queue for async processing
  await queue.add('webhook', {
    topic: req.params.topic,
    payload: req.body,
    webhookId: req.headers['x-shopify-webhook-id']
  });
});
```

**Complexity:** Medium (Cycles 57-58)

---

### 6. Customer Authentication (Optional for MVP)

**Features:**
- ✅ Customer login via Shopify
- ✅ View order history
- ✅ Manage account

**Implementation:**
```typescript
// Option 1: Shopify multipass (if Shopify Plus)
const multipassToken = generateMultipassToken(customer);
window.location.href = `https://store.myshopify.com/account/login/multipass/${multipassToken}`;

// Option 2: Better Auth + Shopify Customer API
const customer = await shopify.customer.get(email);
// Create session in Better Auth
```

**Ontology Mapping:**
```typescript
Person: customer (role: "customer")
properties: { shopifyCustomerId, email, firstName, lastName }
```

**Complexity:** Medium (Cycles 50-51, 76-77)

---

### MVP Feature Summary

| Feature | Cycles | Complexity | Priority |
|---------|--------|------------|----------|
| Product read operations | 43-45 | Low | P0 |
| Product UI components | 66-68 | Low | P0 |
| Cart management | 52-53, 69-71 | Medium | P0 |
| Checkout redirect | 72 | Low | P0 |
| Product pages | 73-75 | Low | P0 |
| Webhooks (core) | 57-58 | Medium | P0 |
| Customer auth | 50-51, 76-77 | Medium | P1 |

**Total Cycles for MVP:** ~40 cycles (Cycles 26-65)

**MVP Deliverable:**
- Functional headless storefront
- Browse products
- Add to cart
- Checkout via Shopify
- Real-time product sync
- Order tracking

---

## Enhanced Features (v1.1)

**Goal:** Improve UX and add customer-facing features
**Timeline:** Cycles 66-85
**Target:** Production-ready e-commerce platform

### 1. Collections & Categories

**Features:**
- ✅ Browse collections
- ✅ Nested collections
- ✅ Smart collections
- ✅ Collection filtering

**Ontology Mapping:**
```typescript
Group: collection (type: "collection")
parentGroupId: storeGroupId or parentCollectionId

Connection: belongs_to (product → collection)
metadata: { position, featured }
```

**API Operations:**
```typescript
- collections.list()
- collections.get(id)
- collections.products(id)
```

**UI Components:**
- `<CollectionList />` - Collection grid
- `<CollectionPage />` - Collection view

**Complexity:** Medium (Cycles 54-55, 73)

---

### 2. Product Search & Filtering

**Features:**
- ✅ Keyword search
- ✅ Filter by price, availability, tags
- ✅ Sort by relevance, price, date

**Implementation:**
```typescript
// Option 1: Shopify Storefront API search
const results = await shopify.products.search({
  query: "summer shirt",
  filters: [
    { available: true },
    { price: { min: 20, max: 50 } }
  ],
  sortBy: "PRICE_ASC"
});

// Option 2: Semantic search (knowledge dimension)
const embedding = await generateEmbedding(query);
const results = await provider.knowledge.vectorSearch({
  embedding,
  limit: 20,
  filters: { type: "product_description" }
});
```

**UI Components:**
- `<ProductSearch />` - Search bar with autocomplete
- `<ProductFilters />` - Filter sidebar
- `<SearchResults />` - Results page

**Complexity:** Medium (Cycles 78-79)

---

### 3. Wishlist / Favorites

**Features:**
- ✅ Add to wishlist
- ✅ View wishlist
- ✅ Share wishlist

**Ontology Mapping:**
```typescript
Connection: favorited (customer → product)
metadata: { favoritedAt, notes }
```

**UI Components:**
- `<AddToWishlist />` - Heart icon button
- `<Wishlist />` - Wishlist page

**Complexity:** Low (Cycle 80)

---

### 4. Product Recommendations

**Features:**
- ✅ Related products
- ✅ Frequently bought together
- ✅ AI-powered personalization

**Implementation:**
```typescript
// Option 1: Based on collection
const relatedProducts = await provider.things.list({
  type: "product",
  groupId: product.collectionId,
  limit: 4
});

// Option 2: Semantic similarity (knowledge dimension)
const productEmbedding = await provider.knowledge.get({
  thingId: product.id,
  type: "chunk"
});

const similar = await provider.knowledge.vectorSearch({
  embedding: productEmbedding.embedding,
  limit: 4,
  exclude: [product.id]
});

// Option 3: Purchase history (connections)
const connections = await provider.connections.list({
  type: "purchased",
  toThingId: product.id
});

const customerIds = connections.map(c => c.fromThingId);
const otherPurchases = await provider.connections.list({
  type: "purchased",
  fromThingId: { $in: customerIds }
});
```

**Complexity:** High (AI/ML features)

---

### 5. Reviews & Ratings (External App)

**Features:**
- ✅ Display product reviews
- ✅ Star ratings
- ✅ Review filtering

**Note:** Use Shopify app like Judge.me, Yotpo, or custom solution

**Ontology Mapping:**
```typescript
Thing: review (type: "review")
Connection: reviewed (customer → product)
Knowledge: chunk (review text for RAG)
```

**Complexity:** Medium (requires app integration)

---

### 6. Advanced Product Gallery

**Features:**
- ✅ Image zoom
- ✅ 360° product view
- ✅ Video support

**UI Components:**
- `<ProductGallery />` - Enhanced gallery

**Complexity:** Low (Cycle 83)

---

### Enhanced Features Summary

| Feature | Cycles | Complexity | Priority |
|---------|--------|------------|----------|
| Collections | 54-55, 73 | Medium | P1 |
| Search & filters | 78-79 | Medium | P1 |
| Wishlist | 80 | Low | P2 |
| Recommendations | TBD | High | P2 |
| Reviews | TBD | Medium | P2 |
| Advanced gallery | 83 | Low | P2 |

**Total Cycles for v1.1:** +15 cycles (Cycles 66-80)

---

## Complete Features (v1.2)

**Goal:** Admin operations and complete feature parity
**Timeline:** Cycles 86-100
**Target:** Enterprise-ready platform

### 1. Order Management (Admin)

**Features:**
- ✅ View all orders
- ✅ Update order status
- ✅ Create manual orders
- ✅ Process refunds
- ✅ Cancel orders

**API Operations:**
```typescript
// Admin API
- orders.list({ first: 50, status: "unfulfilled" })
- orders.update(id, { note: "..." })
- orders.cancel(id)
- refunds.create(orderId, { amount, reason })
```

**UI Components:**
- `<OrderList />` - Admin order list
- `<OrderDetail />` - Admin order detail
- `<RefundForm />` - Refund interface

**Complexity:** Medium

---

### 2. Inventory Management

**Features:**
- ✅ Track inventory levels
- ✅ Multi-location inventory
- ✅ Low stock alerts
- ✅ Inventory adjustments

**Ontology Mapping:**
```typescript
Group: location (type: "location")

Thing: product_variant
properties: {
  inventoryQuantity: 100,
  inventoryPolicy: "deny"
}

Event: inventory_adjusted
metadata: {
  locationId,
  oldQuantity,
  newQuantity,
  reason: "sold" | "damaged" | "restocked"
}
```

**Complexity:** High (Cycle 56)

---

### 3. Fulfillment Management

**Features:**
- ✅ Create fulfillments
- ✅ Update tracking info
- ✅ Mark as delivered
- ✅ Handle returns

**API Operations:**
```typescript
- fulfillments.create(orderId, { lineItems, trackingNumber })
- fulfillments.update(id, { status: "delivered" })
- fulfillments.cancel(id)
```

**Complexity:** Medium (Cycles 49, 57)

---

### 4. Discount Management

**Features:**
- ✅ Create discount codes
- ✅ Automatic discounts
- ✅ BOGO offers
- ✅ Tiered pricing

**Ontology Mapping:**
```typescript
Thing: discount (type: "discount")
Connection: discounted_by (order → discount)
Event: discount_applied
```

**Complexity:** Medium

---

### 5. Gift Cards

**Features:**
- ✅ Issue gift cards
- ✅ Check balance
- ✅ Apply to checkout

**Complexity:** Low

---

### 6. Analytics Dashboard

**Features:**
- ✅ Sales metrics
- ✅ Top products
- ✅ Customer analytics
- ✅ Conversion funnels

**Implementation:**
```typescript
// Query events dimension
const revenue = await provider.events.aggregate({
  type: "order_placed",
  groupBy: "createdAt:day",
  sum: "metadata.totalPrice",
  dateRange: { start: "2025-01-01", end: "2025-01-31" }
});

const topProducts = await provider.connections.aggregate({
  type: "purchased",
  groupBy: "toThingId",
  count: "*",
  orderBy: { count: "desc" },
  limit: 10
});
```

**Complexity:** High

---

### 7. Multi-Currency & Markets

**Features:**
- ✅ Display prices in local currency
- ✅ Shopify Markets integration
- ✅ Currency conversion

**Complexity:** High (Shopify Plus feature)

---

### 8. Subscriptions

**Features:**
- ✅ Recurring orders
- ✅ Subscription management
- ✅ Billing cycles

**Note:** Requires Shopify Subscriptions API

**Complexity:** High

---

### Complete Features Summary

| Feature | Complexity | Priority | Version |
|---------|------------|----------|---------|
| Order management | Medium | P1 | v1.2 |
| Inventory management | High | P1 | v1.2 |
| Fulfillment | Medium | P1 | v1.2 |
| Discounts | Medium | P2 | v1.2 |
| Gift cards | Low | P2 | v1.2 |
| Analytics | High | P2 | v1.2 |
| Multi-currency | High | P3 | v1.3 |
| Subscriptions | High | P3 | v1.3 |

---

## Hybrid Mode (v2.0)

**Goal:** Gradual migration from Shopify to Convex
**Timeline:** Post v1.2
**Target:** Backend independence

### Phase 1: Data Replication

**Features:**
- ✅ Sync all Shopify data to Convex
- ✅ Maintain dual write (Shopify + Convex)
- ✅ Webhooks update both systems

**Implementation:**
```typescript
class HybridProvider implements DataProvider {
  private shopify = new ShopifyProvider();
  private convex = new ConvexProvider();

  async things.create(data) {
    // Write to Shopify first
    const shopifyThing = await this.shopify.things.create(data);

    // Sync to Convex
    await this.convex.things.create({
      ...data,
      properties: {
        ...data.properties,
        shopifyId: shopifyThing.properties.shopifyProductId,
        syncedAt: new Date()
      }
    });

    return shopifyThing;
  }

  async things.list(query) {
    // Read from Convex (faster, more flexible)
    return this.convex.things.list(query);
  }
}
```

---

### Phase 2: Selective Migration

**Features:**
- ✅ Move specific entity types to Convex
- ✅ Keep products in Shopify, courses in Convex
- ✅ Unified storefront

**Example:**
```typescript
// Products from Shopify
const products = await shopifyProvider.things.list({ type: "product" });

// Courses from Convex
const courses = await convexProvider.things.list({ type: "course" });

// Unified catalog
const catalog = [...products, ...courses];
```

---

### Phase 3: Complete Migration

**Features:**
- ✅ Move all data to Convex
- ✅ Deprecate Shopify
- ✅ Export historical data

**Migration Script:**
```typescript
async function migrateToConvex() {
  const shopify = new ShopifyProvider();
  const convex = new ConvexProvider();

  // 1. Export products
  const products = await shopify.things.list({
    type: "product",
    limit: 1000
  });

  // 2. Import to Convex
  for (const product of products) {
    await convex.things.create({
      type: "product",
      name: product.name,
      description: product.description,
      properties: {
        ...product.properties,
        migratedFrom: "shopify",
        migratedAt: new Date()
      }
    });
  }

  // 3. Verify data integrity
  const convexCount = await convex.things.count({ type: "product" });
  console.log(`Migrated ${convexCount} products`);
}
```

---

### Hybrid Mode Summary

| Phase | Features | Timeline | Complexity |
|-------|----------|----------|------------|
| Phase 1 | Data replication | v2.0 | High |
| Phase 2 | Selective migration | v2.1 | Medium |
| Phase 3 | Complete migration | v2.2 | High |

---

## Feature Prioritization

### Priority Matrix

```
High Impact, Low Complexity (Do First)
├── Product listing (P0)
├── Product detail (P0)
├── Cart management (P0)
├── Checkout redirect (P0)
└── Basic webhooks (P0)

High Impact, High Complexity (Do Second)
├── Inventory management (P1)
├── Order management (P1)
├── Search & filters (P1)
└── Collections (P1)

Low Impact, Low Complexity (Do Third)
├── Wishlist (P2)
├── Gift cards (P2)
└── Advanced gallery (P2)

Low Impact, High Complexity (Do Last)
├── Multi-currency (P3)
├── Subscriptions (P3)
├── AI recommendations (P3)
└── Analytics dashboard (P3)
```

### Priority Definitions

- **P0 (Blocker):** Cannot ship without this
- **P1 (Critical):** Needed for production launch
- **P2 (Important):** Improves UX significantly
- **P3 (Nice to Have):** Differentiating features

---

## Complexity Analysis

### Complexity Factors

1. **Technical Complexity**
   - API integration difficulty
   - Data transformation complexity
   - State management requirements

2. **Business Logic Complexity**
   - Number of edge cases
   - Validation requirements
   - Error handling scenarios

3. **Testing Complexity**
   - Number of test cases
   - Integration test requirements
   - E2E test coverage

### Complexity Ratings

| Feature | Technical | Business | Testing | Overall |
|---------|-----------|----------|---------|---------|
| Product listing | Low | Low | Low | **Low** |
| Cart management | Medium | Medium | Medium | **Medium** |
| Inventory | High | High | High | **High** |
| Checkout | Low | Medium | Medium | **Medium** |
| Search | Medium | Low | Medium | **Medium** |
| Analytics | High | Medium | High | **High** |
| AI recommendations | High | High | High | **High** |

---

## Implementation Roadmap

### v1.0 MVP (Cycles 1-65)

**Phase 1: Understand (Cycles 1-15)**
- ✅ Study Shopify API
- ✅ Map to ontology
- ✅ Define scope

**Phase 2: Design (Cycles 16-25)**
- TypeScript types
- Service interfaces
- Transformation functions

**Phase 3: Implement (Cycles 26-40)**
- ShopifyClient
- ProductService
- CartService
- WebhookService

**Phase 4: Build UI (Cycles 41-55)**
- Product components
- Cart components
- Product pages

**Phase 5: Test (Cycles 56-65)**
- Unit tests
- Integration tests
- E2E tests

**Deliverable:** Functional headless storefront

---

### v1.1 Enhanced (Cycles 66-80)

**Features:**
- Collections
- Search & filters
- Wishlist
- Advanced gallery

**Deliverable:** Production-ready e-commerce platform

---

### v1.2 Complete (Cycles 81-100)

**Features:**
- Order management (admin)
- Inventory management
- Fulfillment
- Analytics

**Deliverable:** Enterprise-ready platform

---

### v1.3 Advanced (Post-100)

**Features:**
- Multi-currency
- Subscriptions
- AI recommendations
- Advanced analytics

**Deliverable:** Best-in-class e-commerce

---

### v2.0 Hybrid (Future)

**Features:**
- Data replication
- Selective migration
- Complete independence

**Deliverable:** Backend-agnostic platform

---

## Success Metrics

### Technical Metrics

- ✅ **Code Coverage:** 90%+ on critical paths
- ✅ **TypeScript Errors:** 0
- ✅ **Lighthouse Score:** 90+ (Performance, Accessibility, SEO)
- ✅ **Bundle Size:** < 200KB (main bundle)
- ✅ **API Response Time:** < 500ms (p95)

### Business Metrics

- ✅ **Page Load Time:** < 1 second
- ✅ **Cart Operations:** < 500ms
- ✅ **Webhook Processing:** < 100ms
- ✅ **Batch Sync:** 1000 products in < 5 minutes

### Ontology Compliance

- ✅ All Shopify entities map to 6 dimensions
- ✅ Zero custom tables required
- ✅ Consistent with ONE's universal patterns
- ✅ Effect.ts services follow standard patterns

### User Experience

- ✅ **Add to Cart:** 1-click
- ✅ **Search:** Instant results
- ✅ **Checkout:** < 3 steps
- ✅ **Mobile:** 90+ Lighthouse mobile score

---

## Risk Assessment

### High Risk

**1. Rate Limiting**
- **Risk:** Hit Shopify API rate limits during sync
- **Mitigation:** Implement exponential backoff, caching, batch operations
- **Likelihood:** High
- **Impact:** High

**2. Webhook Reliability**
- **Risk:** Missed webhooks cause data inconsistency
- **Mitigation:** Implement reconciliation jobs, idempotent handlers
- **Likelihood:** Medium
- **Impact:** High

**3. Large Catalog Performance**
- **Risk:** Slow page loads for stores with 10,000+ products
- **Mitigation:** Pagination, incremental sync, GraphQL optimization
- **Likelihood:** Medium
- **Impact:** Medium

---

### Medium Risk

**4. Complex Variant Logic**
- **Risk:** Shopify's variant system is complex (3 options × 100 values)
- **Mitigation:** Thorough testing, clear transformation logic
- **Likelihood:** Medium
- **Impact:** Medium

**5. API Version Changes**
- **Risk:** Shopify API changes break integration
- **Mitigation:** Use stable API version, monitor changelog, automated tests
- **Likelihood:** Low
- **Impact:** High

---

### Low Risk

**6. Multi-Currency Edge Cases**
- **Risk:** Rounding errors, conversion issues
- **Mitigation:** Use Shopify's built-in conversion, test edge cases
- **Likelihood:** Low
- **Impact:** Low

---

## Out of Scope (Explicitly Excluded)

### Not in v1.0-v1.2

- ❌ Custom checkout UI (use Shopify's checkout)
- ❌ POS integration (requires Shopify Plus)
- ❌ Multi-language support (Shopify Markets feature)
- ❌ Advanced shipping rules (use Shopify's shipping)
- ❌ Tax calculation (use Shopify's tax engine)
- ❌ Payment gateway integration (use Shopify Payments)
- ❌ Email notifications (use Shopify's email system)

### Requires Shopify Apps

- Reviews & ratings (use Judge.me, Yotpo, etc.)
- Live chat support (use Gorgias, Zendesk, etc.)
- Advanced SEO (use Plug in SEO, etc.)
- Product bundles (use Bold, etc.)
- Pre-orders (use Pre-Order Manager, etc.)

### Future Consideration (v2.0+)

- Custom checkout UI (when migrating to Convex)
- Native payment processing
- Email automation
- Advanced shipping rules
- Tax calculation

---

## Decision Framework

### When to Build vs Buy

**Build if:**
- ✅ Core to product differentiation
- ✅ Tight integration with ONE ontology required
- ✅ Shopify app doesn't exist or is expensive

**Buy (Shopify App) if:**
- ✅ Commodity feature (reviews, live chat)
- ✅ Requires specialized expertise (tax, shipping)
- ✅ Time to market is critical

### When to Use Shopify vs Convex

**Use Shopify for:**
- ✅ Checkout & payment processing
- ✅ Inventory management (initially)
- ✅ Order fulfillment
- ✅ Tax & shipping calculation

**Use Convex for:**
- ✅ Custom content (courses, memberships)
- ✅ AI features (recommendations, chatbots)
- ✅ Real-time collaboration
- ✅ Complex queries & analytics

---

## Summary

### MVP (v1.0) - 40 Cycles
**Core e-commerce operations**
- Products (read)
- Cart
- Checkout
- Basic webhooks

**Deliverable:** Functional headless storefront

---

### Enhanced (v1.1) - +15 Cycles
**Customer-facing features**
- Collections
- Search & filters
- Wishlist
- Advanced gallery

**Deliverable:** Production-ready platform

---

### Complete (v1.2) - +20 Cycles
**Admin operations**
- Order management
- Inventory management
- Fulfillment
- Analytics

**Deliverable:** Enterprise-ready platform

---

### Hybrid (v2.0) - Future
**Gradual migration**
- Data replication
- Selective migration
- Complete independence

**Deliverable:** Backend-agnostic platform

---

## Next Steps

1. **Review & Approve Scope** (this document)
2. **Begin Phase 2: Design** (Cycles 16-25)
   - Define TypeScript types
   - Design service interfaces
   - Create transformation functions
3. **Implement MVP** (Cycles 26-65)
4. **Launch v1.0** (Cycle 65)
5. **Iterate to v1.1, v1.2** (Cycles 66-100)

---

**Built with clarity, simplicity, and infinite scale in mind.**
