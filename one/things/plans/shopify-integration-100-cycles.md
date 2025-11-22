---
title: Shopify Integration - 100 Cycle Plan
dimension: things
category: plans
tags: shopify, ecommerce, integration, provider, 6-dimensions
related_dimensions: connections, events, groups, knowledge, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete 100-cycle execution plan for deep Shopify integration into the ONE Platform.
  Maps Shopify entities to the 6-dimension ontology (groups, people, things, connections, events, knowledge).
  Follows the 6-phase workflow: Understand → Map → Design → Implement → Build → Test.
---

# Shopify Integration - 100 Cycle Plan

**Version:** 1.0.0
**Purpose:** Deep integration of Shopify e-commerce platform into ONE Platform using the 6-dimension ontology
**Timeline:** 100 cycles (not days - each cycle is a discrete, complete step)

---

## Executive Summary

**What:** Build a complete ShopifyProvider that maps Shopify's e-commerce system to ONE's 6-dimension ontology

**Why:** Enable ONE Platform users to:
- Sync products, customers, orders from existing Shopify stores
- Use ONE Platform as headless frontend for Shopify backend
- Gradually migrate from Shopify to ONE's native Convex backend
- Leverage ONE's AI features (clones, agents, RAG) with e-commerce data

**How:** Implement the universal DataProvider interface for Shopify API

**Outcome:** Full-featured e-commerce platform with Shopify backend compatibility

---

## Ontology Mapping

### Shopify → 6 Dimensions

```typescript
// GROUPS (Dimension 1)
Shopify Store          → groups (type: "business")
Shopify Collections    → groups (type: "collection") with parentGroupId: storeId

// PEOPLE (Dimension 2)
Shopify Customer       → people (role: "customer")
Shopify Admin          → people (role: "org_owner")
Shopify Staff          → people (role: "org_user")

// THINGS (Dimension 3)
Shopify Product        → things (type: "product")
Shopify Variant        → things (type: "product_variant")
Shopify Inventory      → properties on product thing
Shopify Discount       → things (type: "discount")
Shopify Gift Card      → things (type: "gift_card")
Shopify Fulfillment    → things (type: "fulfillment")

// CONNECTIONS (Dimension 4)
Product → Collection   → connections (type: "belongs_to")
Customer → Product     → connections (type: "purchased")
Customer → Cart        → connections (type: "in_cart")
Order → Product        → connections (type: "contains")
Customer → Wishlist    → connections (type: "favorited")

// EVENTS (Dimension 5)
Order Created          → events (type: "order_placed")
Payment Processed      → events (type: "payment_processed")
Product Viewed         → events (type: "product_viewed")
Cart Abandoned         → events (type: "cart_abandoned")
Fulfillment Created    → events (type: "fulfillment_created")
Customer Registered    → events (type: "customer_registered")

// KNOWLEDGE (Dimension 6)
Product SEO            → knowledge (type: "label", labels: ["seo", "product"])
Product Tags           → knowledge (type: "label")
Product Description    → knowledge (type: "chunk") for RAG
Customer Preferences   → knowledge (type: "chunk") for AI personalization
```

---

## Phase 1: UNDERSTAND (Cycles 1-15)

### Cycle 1: Study Shopify API Documentation
**Task:** Read Shopify Admin API docs and understand core entities
**Output:** Document Shopify data model
**File:** `one/connections/shopify-api-reference.md`

### Cycle 2: Study Shopify Authentication
**Task:** Understand Shopify OAuth flow and API authentication
**Output:** Document auth flow (OAuth 2.0, API tokens)
**File:** `one/connections/shopify-auth.md`

### Cycle 3: Study Shopify Webhooks
**Task:** Understand Shopify webhook system for real-time updates
**Output:** Document webhook events and payload formats
**File:** `one/connections/shopify-webhooks.md`

### Cycle 4: Analyze Shopify Product Model
**Task:** Deep dive into Shopify product structure (variants, options, inventory)
**Output:** Map product fields to ONE ontology
**File:** `one/things/shopify-product-mapping.md`

### Cycle 5: Analyze Shopify Order Model
**Task:** Deep dive into Shopify order structure (line items, fulfillments, refunds)
**Output:** Map order flow to connections + events
**File:** `one/connections/shopify-order-flow.md`

### Cycle 6: Analyze Shopify Customer Model
**Task:** Deep dive into Shopify customer structure (addresses, tags, metafields)
**Output:** Map customers to people dimension
**File:** `one/people/shopify-customer-mapping.md`

### Cycle 7: Study Shopify Cart/Checkout
**Task:** Understand Shopify cart and checkout flow
**Output:** Map cart to connections, checkout to events
**File:** `one/events/shopify-checkout-flow.md`

### Cycle 8: Study Shopify Inventory Management
**Task:** Understand inventory tracking, locations, stock levels
**Output:** Map inventory to thing properties
**File:** `one/things/shopify-inventory-mapping.md`

### Cycle 9: Study Shopify Collections
**Task:** Understand collections, smart collections, manual collections
**Output:** Map collections to groups with hierarchical nesting
**File:** `one/groups/shopify-collections-mapping.md`

### Cycle 10: Study Shopify Metafields
**Task:** Understand metafields (custom data on products, customers, orders)
**Output:** Map metafields to thing properties
**File:** `one/knowledge/shopify-metafields.md`

### Cycle 11: Study Shopify GraphQL API
**Task:** Analyze GraphQL API vs REST API (performance, batching)
**Output:** Decide on API approach (prefer GraphQL for efficiency)
**File:** `one/connections/shopify-graphql-vs-rest.md`

### Cycle 12: Study Shopify Rate Limits
**Task:** Understand API rate limits and throttling
**Output:** Design rate limiting strategy
**File:** `one/knowledge/shopify-rate-limits.md`

### Cycle 13: Study Existing Shopify Integrations
**Task:** Research Shopify apps, headless commerce examples
**Output:** Best practices and patterns
**File:** `one/knowledge/shopify-best-practices.md`

### Cycle 14: Map Complete Data Model
**Task:** Create complete mapping of all Shopify entities to 6 dimensions
**Output:** Comprehensive ontology mapping diagram
**File:** `one/connections/shopify-complete-mapping.md`

### Cycle 15: Define Integration Scope
**Task:** Define MVP vs full feature set
**Output:** Prioritized feature list
**File:** `one/things/shopify-scope.md`

---

## Phase 2: MAP TO ONTOLOGY (Cycles 16-25)

### Cycle 16: Define Thing Types
**Task:** Create TypeScript types for all Shopify thing types
**Output:** Type definitions
**File:** `web/src/ontology/shopify-things.ts`

### Cycle 17: Define Connection Types
**Task:** Create TypeScript types for all Shopify connection types
**Output:** Type definitions
**File:** `web/src/ontology/shopify-connections.ts`

### Cycle 18: Define Event Types
**Task:** Create TypeScript types for all Shopify event types
**Output:** Type definitions
**File:** `web/src/ontology/shopify-events.ts`

### Cycle 19: Define Property Schemas
**Task:** Create Zod schemas for product, variant, customer properties
**Output:** Validation schemas
**File:** `web/src/ontology/shopify-schemas.ts`

### Cycle 20: Define Metadata Schemas
**Task:** Create Zod schemas for connection metadata (cart, order details)
**Output:** Validation schemas
**File:** `web/src/ontology/shopify-metadata-schemas.ts`

### Cycle 21: Map GraphQL Queries
**Task:** Define GraphQL queries for each entity type
**Output:** GraphQL query definitions
**File:** `web/src/providers/shopify/queries.ts`

### Cycle 22: Map GraphQL Mutations
**Task:** Define GraphQL mutations for create/update operations
**Output:** GraphQL mutation definitions
**File:** `web/src/providers/shopify/mutations.ts`

### Cycle 23: Design Transformation Functions
**Task:** Design functions to transform Shopify API responses → ONE Things
**Output:** Transformation function signatures
**File:** `web/src/providers/shopify/transformers.ts`

### Cycle 24: Design Reverse Transformations
**Task:** Design functions to transform ONE Things → Shopify API requests
**Output:** Reverse transformation function signatures
**File:** `web/src/providers/shopify/reverse-transformers.ts`

### Cycle 25: Validate Ontology Mapping
**Task:** Review all mappings, ensure no gaps
**Output:** Validation report
**File:** `one/events/shopify-mapping-validation.md`

---

## Phase 3: DESIGN SERVICES (Cycles 26-40)

### Cycle 26: Design ShopifyClient Service
**Task:** Design low-level GraphQL client with authentication
**Output:** Service interface
**File:** `web/src/providers/shopify/ShopifyClient.ts` (interface only)

### Cycle 27: Design ShopifyAuth Service
**Task:** Design OAuth flow and token management
**Output:** Service interface
**File:** `web/src/providers/shopify/ShopifyAuth.ts` (interface only)

### Cycle 28: Design ProductService
**Task:** Design product CRUD operations
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/ProductService.ts` (interface)

### Cycle 29: Design VariantService
**Task:** Design variant management (create, update variants)
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/VariantService.ts` (interface)

### Cycle 30: Design OrderService
**Task:** Design order retrieval and fulfillment
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/OrderService.ts` (interface)

### Cycle 31: Design CustomerService
**Task:** Design customer CRUD operations
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/CustomerService.ts` (interface)

### Cycle 32: Design CartService
**Task:** Design cart management (add, remove, update line items)
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/CartService.ts` (interface)

### Cycle 33: Design CollectionService
**Task:** Design collection management
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/CollectionService.ts` (interface)

### Cycle 34: Design InventoryService
**Task:** Design inventory tracking and updates
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/InventoryService.ts` (interface)

### Cycle 35: Design WebhookService
**Task:** Design webhook registration and handling
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/WebhookService.ts` (interface)

### Cycle 36: Design Error Types
**Task:** Define typed errors for all Shopify operations
**Output:** Error type definitions
**File:** `web/src/providers/shopify/errors.ts`

### Cycle 37: Design Sync Service
**Task:** Design batch sync operations (sync all products, customers, orders)
**Output:** Effect.ts service interface
**File:** `web/src/providers/shopify/services/SyncService.ts` (interface)

### Cycle 38: Design Cache Strategy
**Task:** Design caching for frequently accessed data
**Output:** Caching strategy document
**File:** `one/knowledge/shopify-cache-strategy.md`

### Cycle 39: Design Retry Strategy
**Task:** Design retry logic for failed API calls
**Output:** Retry strategy document
**File:** `one/knowledge/shopify-retry-strategy.md`

### Cycle 40: Review Service Architecture
**Task:** Review all service interfaces, ensure completeness
**Output:** Architecture review document
**File:** `one/events/shopify-service-review.md`

---

## Phase 4: IMPLEMENT BACKEND (Cycles 41-65)

### Cycle 41: Implement ShopifyClient
**Task:** Implement GraphQL client with authentication
**Output:** Working GraphQL client
**File:** `web/src/providers/shopify/ShopifyClient.ts`

### Cycle 42: Implement ShopifyAuth
**Task:** Implement OAuth flow and token refresh
**Output:** Working auth service
**File:** `web/src/providers/shopify/ShopifyAuth.ts`

### Cycle 43: Implement Product Queries
**Task:** Implement product list, get, search queries
**Output:** Product query functions
**File:** `web/src/providers/shopify/services/ProductService.ts` (queries)

### Cycle 44: Implement Product Mutations
**Task:** Implement product create, update, delete
**Output:** Product mutation functions
**File:** `web/src/providers/shopify/services/ProductService.ts` (mutations)

### Cycle 45: Implement Product Transformers
**Task:** Implement Shopify Product → ONE Thing
**Output:** Transformation functions
**File:** `web/src/providers/shopify/transformers/product.ts`

### Cycle 46: Implement Variant Service
**Task:** Implement variant CRUD operations
**Output:** Working variant service
**File:** `web/src/providers/shopify/services/VariantService.ts`

### Cycle 47: Implement Order Queries
**Task:** Implement order list, get queries
**Output:** Order query functions
**File:** `web/src/providers/shopify/services/OrderService.ts` (queries)

### Cycle 48: Implement Order Transformers
**Task:** Implement Shopify Order → Connections + Events
**Output:** Order transformation logic
**File:** `web/src/providers/shopify/transformers/order.ts`

### Cycle 49: Implement Fulfillment Operations
**Task:** Implement fulfillment create, update, cancel
**Output:** Fulfillment service methods
**File:** `web/src/providers/shopify/services/OrderService.ts` (fulfillments)

### Cycle 50: Implement Customer Service
**Task:** Implement customer CRUD operations
**Output:** Working customer service
**File:** `web/src/providers/shopify/services/CustomerService.ts`

### Cycle 51: Implement Customer Transformers
**Task:** Implement Shopify Customer → ONE Person
**Output:** Customer transformation functions
**File:** `web/src/providers/shopify/transformers/customer.ts`

### Cycle 52: Implement Cart Service
**Task:** Implement cart operations (add to cart, update quantity)
**Output:** Working cart service
**File:** `web/src/providers/shopify/services/CartService.ts`

### Cycle 53: Implement Cart Transformers
**Task:** Implement Cart → Connections (in_cart)
**Output:** Cart transformation logic
**File:** `web/src/providers/shopify/transformers/cart.ts`

### Cycle 54: Implement Collection Service
**Task:** Implement collection CRUD operations
**Output:** Working collection service
**File:** `web/src/providers/shopify/services/CollectionService.ts`

### Cycle 55: Implement Collection Transformers
**Task:** Implement Collection → Groups
**Output:** Collection transformation logic
**File:** `web/src/providers/shopify/transformers/collection.ts`

### Cycle 56: Implement Inventory Service
**Task:** Implement inventory tracking and updates
**Output:** Working inventory service
**File:** `web/src/providers/shopify/services/InventoryService.ts`

### Cycle 57: Implement Webhook Registration
**Task:** Implement webhook create, list, delete
**Output:** Webhook registration functions
**File:** `web/src/providers/shopify/services/WebhookService.ts` (registration)

### Cycle 58: Implement Webhook Handler
**Task:** Implement webhook payload processing
**Output:** Webhook event handlers
**File:** `web/src/providers/shopify/services/WebhookService.ts` (handlers)

### Cycle 59: Implement Sync Service
**Task:** Implement batch sync operations
**Output:** Working sync service
**File:** `web/src/providers/shopify/services/SyncService.ts`

### Cycle 60: Implement ShopifyProvider
**Task:** Implement DataProvider interface for Shopify
**Output:** Complete ShopifyProvider
**File:** `web/src/providers/shopify/ShopifyProvider.ts`

### Cycle 61: Implement Rate Limiting
**Task:** Implement rate limit handling and backoff
**Output:** Rate limiter middleware
**File:** `web/src/providers/shopify/middleware/rateLimiter.ts`

### Cycle 62: Implement Retry Logic
**Task:** Implement automatic retry for failed requests
**Output:** Retry middleware
**File:** `web/src/providers/shopify/middleware/retry.ts`

### Cycle 63: Implement Error Handling
**Task:** Implement comprehensive error handling
**Output:** Error handler middleware
**File:** `web/src/providers/shopify/middleware/errorHandler.ts`

### Cycle 64: Implement Caching Layer
**Task:** Implement caching for products, collections
**Output:** Cache middleware
**File:** `web/src/providers/shopify/middleware/cache.ts`

### Cycle 65: Backend Integration Test
**Task:** Test all backend services with real Shopify API
**Output:** Integration test results
**File:** `one/events/shopify-backend-test-results.md`

---

## Phase 5: BUILD FRONTEND (Cycles 66-85)

### Cycle 66: Create Product List Component
**Task:** Build product grid/list component
**Output:** React component
**File:** `web/src/components/shopify/ProductList.tsx`

### Cycle 67: Create Product Detail Component
**Task:** Build product detail page component
**Output:** React component
**File:** `web/src/components/shopify/ProductDetail.tsx`

### Cycle 68: Create Product Variant Selector
**Task:** Build variant selector (size, color, etc.)
**Output:** React component
**File:** `web/src/components/shopify/VariantSelector.tsx`

### Cycle 69: Create Add to Cart Component
**Task:** Build add to cart button with quantity selector
**Output:** React component
**File:** `web/src/components/shopify/AddToCart.tsx`

### Cycle 70: Create Cart Component
**Task:** Build cart sidebar/modal with line items
**Output:** React component
**File:** `web/src/components/shopify/Cart.tsx`

### Cycle 71: Create Cart Line Item
**Task:** Build individual cart line item component
**Output:** React component
**File:** `web/src/components/shopify/CartLineItem.tsx`

### Cycle 72: Create Checkout Button
**Task:** Build checkout button that redirects to Shopify checkout
**Output:** React component
**File:** `web/src/components/shopify/CheckoutButton.tsx`

### Cycle 73: Create Collection Page
**Task:** Build collection page with product filtering
**Output:** Astro page
**File:** `web/src/pages/shop/collections/[slug].astro`

### Cycle 74: Create Product Page
**Task:** Build product detail page
**Output:** Astro page
**File:** `web/src/pages/shop/products/[handle].astro`

### Cycle 75: Create Shop Home Page
**Task:** Build shop landing page with featured products
**Output:** Astro page
**File:** `web/src/pages/shop/index.astro`

### Cycle 76: Create Customer Account Page
**Task:** Build customer account page (order history)
**Output:** Astro page
**File:** `web/src/pages/account/index.astro`

### Cycle 77: Create Order History Component
**Task:** Build order history list
**Output:** React component
**File:** `web/src/components/shopify/OrderHistory.tsx`

### Cycle 78: Create Search Component
**Task:** Build product search with autocomplete
**Output:** React component
**File:** `web/src/components/shopify/ProductSearch.tsx`

### Cycle 79: Create Filter Component
**Task:** Build product filters (price, tags, availability)
**Output:** React component
**File:** `web/src/components/shopify/ProductFilters.tsx`

### Cycle 80: Create Wishlist Component
**Task:** Build wishlist/favorites feature
**Output:** React component
**File:** `web/src/components/shopify/Wishlist.tsx`

### Cycle 81: Implement Cart State Management
**Task:** Implement nanostores for cart state
**Output:** Nanostore definitions
**File:** `web/src/stores/cart.ts`

### Cycle 82: Implement Product State Management
**Task:** Implement nanostores for product filtering state
**Output:** Nanostore definitions
**File:** `web/src/stores/products.ts`

### Cycle 83: Create Product Gallery
**Task:** Build image gallery with zoom, thumbnails
**Output:** React component
**File:** `web/src/components/shopify/ProductGallery.tsx`

### Cycle 84: Style All Components
**Task:** Apply Tailwind v4 styling to all components
**Output:** Styled components
**Files:** All component files

### Cycle 85: Frontend Integration Test
**Task:** Test all UI components with ShopifyProvider
**Output:** Frontend test results
**File:** `one/events/shopify-frontend-test-results.md`

---

## Phase 6: TEST & DOCUMENT (Cycles 86-100)

### Cycle 86: Unit Test Product Service
**Task:** Write unit tests for ProductService
**Output:** Test suite
**File:** `web/src/providers/shopify/services/__tests__/ProductService.test.ts`

### Cycle 87: Unit Test Order Service
**Task:** Write unit tests for OrderService
**Output:** Test suite
**File:** `web/src/providers/shopify/services/__tests__/OrderService.test.ts`

### Cycle 88: Unit Test Customer Service
**Task:** Write unit tests for CustomerService
**Output:** Test suite
**File:** `web/src/providers/shopify/services/__tests__/CustomerService.test.ts`

### Cycle 89: Unit Test Cart Service
**Task:** Write unit tests for CartService
**Output:** Test suite
**File:** `web/src/providers/shopify/services/__tests__/CartService.test.ts`

### Cycle 90: Unit Test Transformers
**Task:** Write unit tests for all transformation functions
**Output:** Test suite
**File:** `web/src/providers/shopify/transformers/__tests__/transformers.test.ts`

### Cycle 91: Integration Test E2E Flow
**Task:** Test complete flow: browse → add to cart → checkout
**Output:** E2E test suite
**File:** `web/test/e2e/shopify-checkout.test.ts`

### Cycle 92: Integration Test Webhook Flow
**Task:** Test webhook handling for order updates
**Output:** Integration test
**File:** `web/test/integration/shopify-webhooks.test.ts`

### Cycle 93: Performance Test Sync
**Task:** Test batch sync performance (1000+ products)
**Output:** Performance report
**File:** `one/events/shopify-performance-test.md`

### Cycle 94: Document ShopifyProvider API
**Task:** Write complete API documentation
**Output:** API docs
**File:** `one/connections/shopify-provider-api.md`

### Cycle 95: Document Setup Guide
**Task:** Write step-by-step setup instructions
**Output:** Setup guide
**File:** `one/knowledge/shopify-setup-guide.md`

### Cycle 96: Document Migration Guide
**Task:** Write guide for migrating from Shopify to Convex
**Output:** Migration guide
**File:** `one/knowledge/shopify-migration-guide.md`

### Cycle 97: Document Webhook Setup
**Task:** Write webhook configuration guide
**Output:** Webhook guide
**File:** `one/knowledge/shopify-webhook-setup.md`

### Cycle 98: Document Troubleshooting
**Task:** Write common issues and solutions
**Output:** Troubleshooting guide
**File:** `one/knowledge/shopify-troubleshooting.md`

### Cycle 99: Create Example Store
**Task:** Build example Shopify-powered store
**Output:** Example app
**File:** `apps/shopify-demo/`

### Cycle 100: Final Review & Release
**Task:** Review all code, docs, tests; prepare release
**Output:** Release checklist and v1.0.0 tag
**File:** `one/events/shopify-integration-v1-release.md`

---

## Success Metrics

**Feature Completeness:**
- [ ] All CRUD operations for products, variants, customers, orders
- [ ] Real-time webhook support for inventory, orders, customers
- [ ] Batch sync operations (full store import)
- [ ] Cart and checkout integration
- [ ] Customer account management

**Performance:**
- [ ] Product list page loads in < 1 second
- [ ] Cart operations complete in < 500ms
- [ ] Batch sync of 1000 products in < 5 minutes
- [ ] Webhook processing in < 100ms

**Quality:**
- [ ] 90%+ code coverage on critical paths
- [ ] Zero TypeScript errors
- [ ] All E2E tests passing
- [ ] Documentation complete

**Ontology Compliance:**
- [ ] All Shopify entities map to 6 dimensions
- [ ] No custom tables required
- [ ] Consistent with ONE's universal patterns
- [ ] Effect.ts services follow standard patterns

---

## Next Steps After v1.0

**v1.1 - Advanced Features:**
- Multi-currency support
- Shopify Markets integration
- Advanced discount rules
- Subscription products (via Shopify Subscriptions API)

**v1.2 - Admin Features:**
- Product import/export
- Bulk operations (price updates, inventory adjustments)
- Analytics dashboard (sales, customers, products)

**v1.3 - AI Features:**
- AI-powered product recommendations
- Semantic product search (using knowledge dimension)
- AI clone for customer support (trained on product data)

**v2.0 - Gradual Migration:**
- Hybrid mode (some entities in Shopify, some in Convex)
- Migration wizard (move products/customers to Convex)
- Complete independence from Shopify

---

## File Organization

```
web/src/providers/shopify/
├── ShopifyProvider.ts          # Main provider (implements DataProvider)
├── ShopifyClient.ts            # GraphQL client
├── ShopifyAuth.ts              # OAuth & token management
├── queries.ts                  # GraphQL queries
├── mutations.ts                # GraphQL mutations
├── errors.ts                   # Typed errors
├── services/
│   ├── ProductService.ts       # Product operations
│   ├── VariantService.ts       # Variant operations
│   ├── OrderService.ts         # Order operations
│   ├── CustomerService.ts      # Customer operations
│   ├── CartService.ts          # Cart operations
│   ├── CollectionService.ts    # Collection operations
│   ├── InventoryService.ts     # Inventory operations
│   ├── WebhookService.ts       # Webhook handling
│   └── SyncService.ts          # Batch sync
├── transformers/
│   ├── product.ts              # Product transformations
│   ├── order.ts                # Order transformations
│   ├── customer.ts             # Customer transformations
│   ├── cart.ts                 # Cart transformations
│   └── collection.ts           # Collection transformations
└── middleware/
    ├── rateLimiter.ts          # Rate limiting
    ├── retry.ts                # Retry logic
    ├── errorHandler.ts         # Error handling
    └── cache.ts                # Caching layer

web/src/components/shopify/
├── ProductList.tsx             # Product grid/list
├── ProductDetail.tsx           # Product detail view
├── VariantSelector.tsx         # Variant selection
├── AddToCart.tsx               # Add to cart button
├── Cart.tsx                    # Cart sidebar/modal
├── CartLineItem.tsx            # Cart line item
├── CheckoutButton.tsx          # Checkout button
├── OrderHistory.tsx            # Order history
├── ProductSearch.tsx           # Product search
├── ProductFilters.tsx          # Product filters
├── Wishlist.tsx                # Wishlist
└── ProductGallery.tsx          # Image gallery

web/src/pages/shop/
├── index.astro                 # Shop home
├── products/[handle].astro     # Product detail page
├── collections/[slug].astro    # Collection page
└── cart.astro                  # Cart page

web/src/stores/
├── cart.ts                     # Cart state (nanostores)
└── products.ts                 # Product filter state

one/connections/
├── shopify-api-reference.md    # API documentation
├── shopify-auth.md             # Auth flow
├── shopify-webhooks.md         # Webhook reference
├── shopify-complete-mapping.md # Complete ontology mapping
└── shopify-provider-api.md     # Provider API docs

one/knowledge/
├── shopify-setup-guide.md      # Setup instructions
├── shopify-migration-guide.md  # Migration guide
├── shopify-webhook-setup.md    # Webhook setup
├── shopify-troubleshooting.md  # Common issues
├── shopify-best-practices.md   # Best practices
└── shopify-rate-limits.md      # Rate limit handling
```

---

## Dependencies

**Required Packages:**
```json
{
  "@shopify/shopify-api": "^8.0.0",
  "graphql": "^16.8.0",
  "graphql-request": "^6.1.0"
}
```

**Environment Variables:**
```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxx
SHOPIFY_WEBHOOK_SECRET=xxxxx
```

---

## Risks & Mitigations

**Risk 1: Rate Limits**
- **Mitigation:** Implement exponential backoff, caching, batch operations

**Risk 2: API Changes**
- **Mitigation:** Use stable API version, monitor Shopify changelog

**Risk 3: Webhook Reliability**
- **Mitigation:** Implement retry logic, idempotent event handling

**Risk 4: Large Catalog Performance**
- **Mitigation:** Pagination, incremental sync, GraphQL query optimization

**Risk 5: Complex Variant Logic**
- **Mitigation:** Thorough testing, clear transformation logic

---

## Key Principles

1. **Ontology First:** Every Shopify entity maps to 6 dimensions
2. **Provider Pattern:** ShopifyProvider implements DataProvider interface
3. **Effect.ts Services:** All business logic uses Effect.ts
4. **Type Safety:** 100% TypeScript, Zod schemas for validation
5. **Real-time Updates:** Webhooks keep data in sync
6. **Backend Agnostic:** Frontend never knows it's Shopify
7. **Gradual Migration:** Enable hybrid Shopify + Convex mode

---

**Built with clarity, simplicity, and infinite scale in mind.**
