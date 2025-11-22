---
title: Shopify Checkout Flow Mapping
dimension: events
category: shopify-integration
tags: shopify, ecommerce, cart, checkout, events, connections
related_dimensions: things, connections, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document maps Shopify's Cart and Checkout system to ONE's Events and Connections dimensions.
  Location: one/events/shopify-checkout-flow.md
  Purpose: Documents how Shopify cart/checkout flow integrates with ONE's ontology
  Related dimensions: things (products), connections (cart relationships), people (customers)
  For AI agents: Read this to understand Shopify cart/checkout mapping to ONE Platform.
---

# Shopify Checkout Flow Mapping

**Status:** Planning
**Integration Phase:** Cycle 7 of 100
**Last Updated:** 2025-11-22

## Executive Summary

This document maps Shopify's Cart and Checkout system to ONE Platform's 6-dimension ontology, specifically focusing on **Events** (dimension 5) and **Connections** (dimension 4). Shopify's checkout flow transitions through three states: Cart → Checkout → Order, each with distinct events and relationships.

## Shopify Cart/Checkout Overview

### Key Concepts

**Cart (Storefront API)**
- New primary API as of 2025 (Checkout API deprecated April 1, 2025)
- Globally deployed with low-latency for buyers worldwide
- Manages items before checkout creation
- Persists across sessions
- Supports buyer identity, delivery preferences, and custom attributes

**Checkout**
- Transitional state from cart to order
- Handles payment processing
- Manages shipping/billing information
- Can be customized via Checkout UI extensions
- Creates order upon completion

**Flow Transition**
```
Cart Created → Items Added/Updated → Buyer Info Added → Checkout URL Generated
→ Payment Processed → Order Created → Fulfillment
```

### API Migration (Critical for 2025)

**DEPRECATED (April 1, 2025):**
- Storefront API Checkout mutations
- Admin API Checkout endpoints
- Version 2025-04 removes all Checkout API functionality

**CURRENT (Required):**
- Storefront Cart API (GraphQL)
- Cart mutations: `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`
- Buyer identity: `cartBuyerIdentityUpdate`
- Checkout URL retrieval from cart object

## Mapping to ONE Platform

### 1. CONNECTIONS Dimension (Cart Relationships)

#### Connection Type: `in_cart`

Maps Shopify cart lines to customer-product relationships.

```typescript
// Shopify Cart Line
{
  id: "gid://shopify/CartLine/123",
  quantity: 2,
  merchandise: {
    id: "gid://shopify/ProductVariant/456",
    product: { id: "gid://shopify/Product/789" }
  },
  cost: {
    totalAmount: { amount: "49.98", currencyCode: "USD" }
  },
  attributes: [
    { key: "gift_wrap", value: "true" },
    { key: "message", value: "Happy Birthday!" }
  ]
}

// ONE Platform Connection
{
  _id: Id<"connections">,
  type: "in_cart",
  fromId: Id<"things">,        // Customer (type: "creator")
  toId: Id<"things">,          // Product (type: "product")
  groupId: Id<"groups">,       // Store group
  properties: {
    quantity: 2,
    variantId: "456",          // Maps to Shopify variant
    totalAmount: 49.98,
    currency: "USD",
    attributes: {
      gift_wrap: true,
      message: "Happy Birthday!"
    },
    cartLineId: "123",         // Shopify cart line ID
    addedAt: 1700000000000,
  },
  status: "active",            // "active" = in cart, "archived" = removed
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
}
```

#### Connection Type: `checkout_initiated`

Tracks when customer begins checkout process.

```typescript
{
  _id: Id<"connections">,
  type: "checkout_initiated",
  fromId: Id<"things">,        // Customer
  toId: Id<"things">,          // Order (draft)
  groupId: Id<"groups">,
  properties: {
    checkoutUrl: "https://store.myshopify.com/checkouts/abc123",
    totalAmount: 49.98,
    currency: "USD",
    itemCount: 2,
    buyerIdentity: {
      email: "customer@example.com",
      phone: "+1234567890",
      countryCode: "US"
    },
    deliveryPreference: "SHIPPING",
  },
  status: "active",
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
}
```

### 2. EVENTS Dimension (Checkout Flow Events)

#### Event Type: `cart_created`

```typescript
{
  _id: Id<"events">,
  type: "cart_created",
  thingId: Id<"things">,       // Cart represented as thing
  groupId: Id<"groups">,
  userId: Id<"things">,        // Customer who created cart
  properties: {
    cartId: "gid://shopify/Cart/abc123",
    createdVia: "storefront_api",
    buyerIP: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `cart_item_added`

```typescript
{
  _id: Id<"events">,
  type: "cart_item_added",
  thingId: Id<"things">,       // Product added
  groupId: Id<"groups">,
  userId: Id<"things">,        // Customer
  properties: {
    cartId: "gid://shopify/Cart/abc123",
    cartLineId: "gid://shopify/CartLine/123",
    productId: "789",
    variantId: "456",
    quantity: 2,
    price: 24.99,
    currency: "USD",
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `cart_item_updated`

```typescript
{
  _id: Id<"events">,
  type: "cart_item_updated",
  thingId: Id<"things">,       // Product updated
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    cartLineId: "gid://shopify/CartLine/123",
    previousQuantity: 2,
    newQuantity: 3,
    quantityDelta: 1,
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `cart_item_removed`

```typescript
{
  _id: Id<"events">,
  type: "cart_item_removed",
  thingId: Id<"things">,       // Product removed
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    cartLineId: "gid://shopify/CartLine/123",
    productId: "789",
    variantId: "456",
    quantity: 2,
    reason: "user_action",     // or "out_of_stock"
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `cart_buyer_identity_updated`

```typescript
{
  _id: Id<"events">,
  type: "cart_buyer_identity_updated",
  thingId: Id<"things">,       // Cart
  groupId: Id<"groups">,
  userId: Id<"things">,        // Customer
  properties: {
    cartId: "gid://shopify/Cart/abc123",
    email: "customer@example.com",
    phone: "+1234567890",
    countryCode: "US",
    deliveryPreference: "SHIPPING",
    walletPreferences: ["shop_pay"],
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `checkout_url_generated`

```typescript
{
  _id: Id<"events">,
  type: "checkout_url_generated",
  thingId: Id<"things">,       // Cart/Order
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    cartId: "gid://shopify/Cart/abc123",
    checkoutUrl: "https://store.myshopify.com/checkouts/xyz789",
    totalAmount: 49.98,
    currency: "USD",
    itemCount: 2,
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `checkout_started`

Triggered when customer navigates to checkout URL.

```typescript
{
  _id: Id<"events">,
  type: "checkout_started",
  thingId: Id<"things">,       // Order (draft)
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    checkoutUrl: "https://store.myshopify.com/checkouts/xyz789",
    totalAmount: 49.98,
    currency: "USD",
    shippingRequired: true,
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `checkout_address_added`

```typescript
{
  _id: Id<"events">,
  type: "checkout_address_added",
  thingId: Id<"things">,       // Order
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    addressType: "shipping",   // or "billing"
    address: {
      firstName: "John",
      lastName: "Doe",
      address1: "123 Main St",
      city: "New York",
      province: "NY",
      country: "US",
      zip: "10001"
    },
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `checkout_payment_initiated`

```typescript
{
  _id: Id<"events">,
  type: "checkout_payment_initiated",
  thingId: Id<"things">,       // Order
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    paymentMethod: "credit_card",
    gateway: "shopify_payments",
    amount: 49.98,
    currency: "USD",
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `checkout_completed`

```typescript
{
  _id: Id<"events">,
  type: "checkout_completed",
  thingId: Id<"things">,       // Order (now confirmed)
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    orderId: "gid://shopify/Order/12345",
    orderNumber: "#1001",
    totalAmount: 49.98,
    currency: "USD",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    confirmationEmail: "customer@example.com",
  },
  timestamp: 1700000000000,
}
```

#### Event Type: `cart_abandoned`

Triggered when cart inactive for configured period (typically 24-48 hours).

```typescript
{
  _id: Id<"events">,
  type: "cart_abandoned",
  thingId: Id<"things">,       // Cart
  groupId: Id<"groups">,
  userId: Id<"things">,
  properties: {
    cartId: "gid://shopify/Cart/abc123",
    totalAmount: 49.98,
    currency: "USD",
    itemCount: 2,
    lastActivityAt: 1699913600000,
    abandonedAt: 1700000000000,
    recoveryUrl: "https://store.myshopify.com/cart/recover/abc123",
  },
  timestamp: 1700000000000,
}
```

## Checkout Flow State Machine

```
┌─────────────┐
│  CART       │ ← cart_created
│  ACTIVE     │ ← cart_item_added/updated/removed
└──────┬──────┘ ← cart_buyer_identity_updated
       │
       ├─── (24-48h inactive) ──→ cart_abandoned
       │
       ↓ checkout_url_generated
┌─────────────┐
│  CHECKOUT   │ ← checkout_started
│  IN_PROGRESS│ ← checkout_address_added
└──────┬──────┘ ← checkout_payment_initiated
       │
       ├─── (abandoned) ──→ checkout_abandoned
       │
       ↓ checkout_completed
┌─────────────┐
│  ORDER      │ ← order_placed (see shopify-order-mapping.md)
│  CREATED    │
└─────────────┘
```

## Real-Time Updates via Webhooks

### Cart Webhooks

Shopify provides webhooks for cart events (available in Shopify Plus):

```
carts/create         → Trigger: cart_created event
carts/update         → Trigger: cart_item_added/updated/removed events
```

### Checkout Webhooks

```
checkouts/create     → Trigger: checkout_started event
checkouts/update     → Trigger: checkout_address_added event
checkouts/delete     → Trigger: checkout_abandoned event (if not completed)
```

### Webhook Processing Pattern

```typescript
// Webhook handler (Convex mutation)
export const handleCartUpdate = mutation({
  args: { webhookData: v.any() },
  handler: async (ctx, args) => {
    const { id, line_items, buyer_identity } = args.webhookData;

    // 1. Find or create cart thing
    const cart = await ctx.db
      .query("things")
      .withIndex("by_external_id", q =>
        q.eq("properties.shopifyCartId", id)
      )
      .first();

    // 2. Update connections (in_cart relationships)
    for (const item of line_items) {
      await updateCartConnection(ctx, cart._id, item);
    }

    // 3. Create event
    await ctx.db.insert("events", {
      type: "cart_item_updated",
      thingId: cart._id,
      groupId: cart.groupId,
      userId: cart.properties.customerId,
      properties: { /* ... */ },
      timestamp: Date.now(),
    });
  }
});
```

## Integration with ONE Platform Features

### 1. Cart Abandonment Recovery

Use `cart_abandoned` events to trigger automated recovery:

```typescript
// Effect.ts service
export const CartRecoveryService = Effect.gen(function* (_) {
  const events = yield* _(EventsService);
  const notifications = yield* _(NotificationService);

  // Listen for abandoned carts
  const abandoned = yield* _(
    events.subscribe({ type: "cart_abandoned" })
  );

  // Send recovery email after 1 hour
  yield* _(
    Effect.schedule(
      notifications.sendEmail({
        template: "cart_recovery",
        data: abandoned.properties
      }),
      Schedule.delayed(Duration.hours(1))
    )
  );
});
```

### 2. Cart Analytics

Use events for analytics and insights:

```typescript
// Query cart conversion rate
export const getCartConversionRate = query({
  args: { groupId: v.id("groups"), startDate: v.number() },
  handler: async (ctx, args) => {
    const cartsCreated = await ctx.db
      .query("events")
      .withIndex("by_type_and_group", q =>
        q.eq("type", "cart_created").eq("groupId", args.groupId)
      )
      .filter(q => q.gte(q.field("timestamp"), args.startDate))
      .collect();

    const checkoutsCompleted = await ctx.db
      .query("events")
      .withIndex("by_type_and_group", q =>
        q.eq("type", "checkout_completed").eq("groupId", args.groupId)
      )
      .filter(q => q.gte(q.field("timestamp"), args.startDate))
      .collect();

    return {
      cartsCreated: cartsCreated.length,
      checkoutsCompleted: checkoutsCompleted.length,
      conversionRate: checkoutsCompleted.length / cartsCreated.length,
    };
  }
});
```

### 3. AI-Powered Personalization

Use cart events to personalize recommendations:

```typescript
// Clone analyzes cart abandonment patterns
const analysis = await clone.analyze({
  context: "cart_abandonment",
  events: pastAbandonedCarts,
  question: "Why do customers abandon at checkout?"
});

// Suggest interventions
// - Offer free shipping threshold
// - Show trust badges
// - Simplify checkout form
```

## Implementation Considerations

### 1. Cart Persistence

**Shopify Approach:**
- Carts persist for 10 days by default
- Associated with customer ID or browser session
- Can retrieve cart by ID later

**ONE Platform:**
- Store cart as `connections` with `status: "active"`
- Archive connections when cart expires or converts to order
- Keep events permanently for analytics

### 2. Checkout URL Generation

**Critical:** The checkout URL is the bridge between cart and order:

```graphql
mutation {
  cartCreate(input: {
    lines: [
      { merchandiseId: "gid://shopify/ProductVariant/123", quantity: 2 }
    ]
  }) {
    cart {
      id
      checkoutUrl  # ← This URL directs customer to Shopify checkout
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
    }
  }
}
```

**ONE Platform Integration:**
- Store `checkoutUrl` in order thing properties
- Redirect customers to Shopify for payment processing
- Listen for `checkouts/update` webhook to track completion

### 3. Multi-Currency Support

Shopify supports multiple currencies via markets:

```typescript
// ONE Platform: Store currency per connection
{
  type: "in_cart",
  properties: {
    price: 24.99,
    currency: "USD",
    presentmentCurrency: "CAD",  // Currency shown to buyer
    presentmentPrice: 32.49,
  }
}
```

### 4. Discount Codes

**Shopify:** Applied at checkout via discount codes or automatic discounts

**ONE Platform:** Track as event when applied:

```typescript
{
  type: "discount_applied",
  thingId: Id<"things">,  // Cart/Order
  properties: {
    code: "SUMMER2025",
    type: "percentage",   // or "fixed_amount", "free_shipping"
    value: 10,            // 10% off
    appliedAmount: 4.99,
  }
}
```

## Next Steps

1. **Cycle 8:** Map Shopify inventory to Thing properties → `one/things/shopify-inventory-mapping.md`
2. **Cycle 9:** Map Collections to Groups → `one/groups/shopify-collections-mapping.md`
3. **Cycle 10:** Implement ShopifyProvider base class
4. **Cycle 11:** Implement cart sync methods

## References

- [Shopify Cart API Documentation](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart)
- [Migrate to Cart API Guide](https://shopify.dev/custom-storefronts/checkout)
- [Cart GraphQL Mutations](https://shopify.dev/docs/api/storefront/latest)
- [Shopify Webhooks](https://shopify.dev/docs/api/admin-rest/latest/resources/webhook)

---

**Document Status:** Draft - Awaiting review and implementation
**Next Review:** After Cycles 8-9 complete
