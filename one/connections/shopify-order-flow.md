---
title: Shopify Order Flow → ONE Connections/Events Mapping
dimension: connections
category: shopify
tags: shopify, order, fulfillment, payment, transactions, ecommerce, mapping
related_dimensions: things, events, people
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  Complete mapping of Shopify Order lifecycle to ONE's Connections and Events dimensions.
  Includes line items, fulfillments, refunds, transactions, and the complete order state machine.
  Part of Shopify Integration (Cycle 5).
---

# Shopify Order Flow → ONE Connections/Events Mapping

**Version:** 1.0.0
**Cycle:** 5 of 100
**Purpose:** Map Shopify Orders to ONE's universal Connections + Events dimensions

---

## Executive Summary

**Shopify's Order Model:**
- Order represents customer purchase request
- Contains line items (products/variants purchased)
- Tracks fulfillment lifecycle (open → fulfilled)
- Manages financial transactions (payments, refunds)
- Supports partial fulfillments and refunds
- Maintains complete audit trail

**ONE Platform Mapping:**
- **Order Entity** → NO separate Thing (order is a relationship!)
- **Customer → Product Purchase** → `Connection` (type: "purchased")
- **Order Placed** → `Event` (type: "order_placed")
- **Order Fulfillment** → `Event` (type: "order_fulfilled")
- **Payment Processed** → `Event` (type: "payment_processed")
- **Order Refunded** → `Event` (type: "order_refunded")

**Key Decision:** Orders are NOT things - they are CONNECTIONS between customers and products, plus a sequence of EVENTS tracking the lifecycle. This aligns with ONE's philosophy: "things exist, connections relate, events happen."

---

## Shopify Order Structure (GraphQL/REST 2024)

### Core Order Fields

```graphql
type Order {
  id: ID!                          # Global ID (gid://shopify/Order/123)
  name: String!                    # Order number (#1001)
  email: String                    # Customer email
  phone: String                    # Customer phone

  # Customer
  customer: Customer               # Can be null (guest checkout)

  # Line Items (what was purchased)
  lineItems(first: Int!): LineItemConnection!

  # Financial Status
  displayFinancialStatus: OrderDisplayFinancialStatus!
    # AUTHORIZED, PENDING, PAID, PARTIALLY_PAID,
    # REFUNDED, PARTIALLY_REFUNDED, VOIDED

  # Fulfillment Status
  displayFulfillmentStatus: OrderDisplayFulfillmentStatus!
    # FULFILLED, IN_PROGRESS, ON_HOLD, OPEN,
    # PARTIALLY_FULFILLED, PENDING_FULFILLMENT,
    # RESTOCKED, SCHEDULED, UNFULFILLED

  # Pricing
  totalPriceSet: MoneyBag!         # Total order value
  subtotalPriceSet: MoneyBag!      # Before tax/shipping
  totalTaxSet: MoneyBag!           # Total tax
  totalShippingPriceSet: MoneyBag! # Shipping cost
  totalDiscountsSet: MoneyBag!     # Applied discounts

  # Currency
  currencyCode: CurrencyCode!

  # Fulfillments
  fulfillments: [Fulfillment!]!

  # Refunds
  refunds: [Refund!]!

  # Transactions
  transactions: [OrderTransaction!]!

  # Shipping
  shippingAddress: MailingAddress
  billingAddress: MailingAddress
  shippingLine: ShippingLine

  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!
  processedAt: DateTime!
  cancelledAt: DateTime
  closedAt: DateTime

  # Flags
  confirmed: Boolean!
  test: Boolean!                   # Test order flag
  cancelled: Boolean!
  cancelReason: OrderCancelReason
}
```

### Line Items (Products in Order)

```graphql
type LineItem {
  id: ID!
  title: String!                   # Product title
  quantity: Int!                   # Quantity ordered
  currentQuantity: Int!            # After removals/refunds

  # Variant
  variant: ProductVariant          # Can be null if deleted
  sku: String

  # Pricing
  originalUnitPriceSet: MoneyBag!
  discountedUnitPriceSet: MoneyBag!
  originalTotalSet: MoneyBag!
  discountedTotalSet: MoneyBag!

  # Discounts
  discountAllocations: [DiscountAllocation!]!

  # Fulfillment
  fulfillmentStatus: String        # null, fulfilled, partial, not_eligible
  fulfillableQuantity: Int!

  # Flags
  requiresShipping: Boolean!
  taxable: Boolean!
}
```

### Fulfillments

```graphql
type Fulfillment {
  id: ID!
  status: FulfillmentStatus!       # SUCCESS, CANCELLED, ERROR, FAILURE
  trackingInfo: [FulfillmentTrackingInfo!]!

  # Line Items
  fulfillmentLineItems(first: Int!): FulfillmentLineItemConnection!

  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!
  deliveredAt: DateTime
  inTransitAt: DateTime
}
```

### Refunds

```graphql
type Refund {
  id: ID!
  refundLineItems(first: Int!): RefundLineItemConnection!
  transactions: [OrderTransaction!]!
  totalRefundedSet: MoneyBag!

  # Timestamps
  createdAt: DateTime!
  updatedAt: DateTime!

  # Note
  note: String
}
```

### Transactions (Payments)

```graphql
type OrderTransaction {
  id: ID!
  kind: OrderTransactionKind!      # SALE, CAPTURE, AUTHORIZATION, VOID, REFUND
  status: OrderTransactionStatus!  # SUCCESS, FAILURE, PENDING, ERROR
  gateway: String!                 # Payment gateway (Shopify Payments, Stripe, etc.)
  amountSet: MoneyBag!
  processedAt: DateTime
}
```

---

## ONE Mapping Strategy

### The Core Insight: Orders Are Relationships + Events

**Traditional approach (WRONG):**
```typescript
// ❌ Creating Order as a Thing
{
  type: "order",
  name: "Order #1001",
  properties: { items: [...], total: 99.99 }
}
```

**ONE approach (CORRECT):**
```typescript
// ✅ Order is a Connection + Events
Connection: { type: "purchased", fromThingId: customerId, toThingId: variantId }
Event: { type: "order_placed", actorId: customerId, metadata: { orderNumber: "#1001" } }
Event: { type: "payment_processed", actorId: customerId, metadata: { amount: 99.99 } }
Event: { type: "order_fulfilled", actorId: fulfillerId, metadata: { trackingNumber: "..." } }
```

**Why?** Because an order is:
1. A RELATIONSHIP (customer purchased product)
2. A SEQUENCE OF EVENTS (placed → paid → fulfilled)
3. NOT a standalone entity that "exists" independently

---

## Connection Mapping

### Connection Type: "purchased"

Represents the relationship between a customer and a product variant they purchased.

```typescript
{
  _id: Id<'connections'>,
  groupId: Id<'groups'>,           // Shopify Store ID

  // Customer purchased ProductVariant
  fromThingId: Id<'things'>,       // Customer (type: "creator", role: "customer")
  toThingId: Id<'things'>,         // ProductVariant (type: "product_variant")

  relationshipType: "purchased",

  metadata: {
    // Order identification
    shopifyOrderId: string,        // "gid://shopify/Order/123" or "123"
    orderNumber: string,           // "#1001"
    orderName: string,             // "1001" (without #)

    // Line item details
    shopifyLineItemId: string,     // Unique line item ID
    quantity: number,              // How many purchased
    currentQuantity: number,       // After refunds/removals

    // Pricing (for THIS line item)
    unitPrice: number,             // Price per unit
    totalPrice: number,            // Total for this line item
    discountedPrice?: number,      // If discount applied
    currency: string,              // "USD", "EUR", etc.

    // Product details (snapshot at purchase time)
    productTitle: string,          // Product name
    variantTitle: string,          // Variant name
    sku?: string,                  // SKU code

    // Fulfillment status (per line item)
    fulfillmentStatus: "unfulfilled" | "partial" | "fulfilled" | "not_eligible",
    fulfillableQuantity: number,

    // Flags
    requiresShipping: boolean,
    taxable: boolean,

    // Timestamps
    purchasedAt: string,           // ISO 8601 (order.processedAt)
  },

  createdAt: number,               // ONE timestamp
  updatedAt: number
}
```

**Note:** Each line item becomes a separate Connection. A 5-item order creates 5 "purchased" connections.

---

## Event Mapping

### Event Flow for Typical Order

```
1. order_placed          → Customer initiated order
2. payment_authorized    → Payment gateway authorized charge
3. payment_processed     → Payment captured successfully
4. order_confirmed       → Order confirmed by merchant
5. fulfillment_created   → Fulfillment process started
6. order_shipped         → Package shipped with tracking
7. order_delivered       → Package delivered
8. order_fulfilled       → Order complete
```

### Event Type: "order_placed"

Fired when a customer creates an order (checkout complete).

```typescript
{
  _id: Id<'events'>,
  groupId: Id<'groups'>,

  type: "order_placed",
  actorId: Id<'things'>,           // Customer (or null for guest)
  targetId?: Id<'things'>,         // Optional: Shopify Store group

  metadata: {
    // Order identification
    shopifyOrderId: string,
    orderNumber: string,           // "#1001"
    orderName: string,             // "1001"

    // Customer info
    customerEmail: string,
    customerPhone?: string,

    // Financial summary
    subtotal: number,
    tax: number,
    shipping: number,
    discount: number,
    total: number,
    currency: string,

    // Line items summary
    itemCount: number,             // Total items purchased
    lineItems: Array<{
      productId: string,
      variantId: string,
      quantity: number,
      price: number
    }>,

    // Addresses
    shippingAddress?: {
      address1: string,
      city: string,
      province: string,
      country: string,
      zip: string
    },
    billingAddress?: {
      address1: string,
      city: string,
      province: string,
      country: string,
      zip: string
    },

    // Flags
    isTest: boolean,
    confirmed: boolean,

    // Shopify timestamps
    shopifyCreatedAt: string,
    shopifyProcessedAt: string
  },

  timestamp: number,               // ONE timestamp
  createdAt: number
}
```

### Event Type: "payment_processed"

Fired when payment is successfully captured.

```typescript
{
  _id: Id<'events'>,
  groupId: Id<'groups'>,

  type: "payment_processed",
  actorId: Id<'things'>,           // Customer

  metadata: {
    // Order
    shopifyOrderId: string,
    orderNumber: string,

    // Transaction
    shopifyTransactionId: string,
    transactionKind: "sale" | "capture" | "authorization",
    transactionStatus: "success" | "pending" | "failure",

    // Payment details
    amount: number,
    currency: string,
    gateway: string,               // "shopify_payments", "stripe", etc.

    // Timestamps
    processedAt: string
  },

  timestamp: number,
  createdAt: number
}
```

### Event Type: "order_fulfilled"

Fired when order is completely fulfilled.

```typescript
{
  _id: Id<'events'>,
  groupId: Id<'groups'>,

  type: "order_fulfilled",
  actorId: Id<'things'>,           // Staff member who fulfilled

  metadata: {
    // Order
    shopifyOrderId: string,
    orderNumber: string,

    // Fulfillment
    shopifyFulfillmentId: string,
    fulfillmentStatus: "success" | "cancelled" | "error",

    // Tracking
    trackingCompany?: string,
    trackingNumber?: string,
    trackingUrl?: string,

    // Line items fulfilled
    lineItemsFulfilled: Array<{
      lineItemId: string,
      quantity: number
    }>,

    // Timestamps
    fulfilledAt: string,
    deliveredAt?: string
  },

  timestamp: number,
  createdAt: number
}
```

### Event Type: "order_refunded"

Fired when order is fully or partially refunded.

```typescript
{
  _id: Id<'events'>,
  groupId: Id<'groups'>,

  type: "order_refunded",
  actorId: Id<'things'>,           // Staff member who processed refund

  metadata: {
    // Order
    shopifyOrderId: string,
    orderNumber: string,

    // Refund
    shopifyRefundId: string,
    refundAmount: number,
    currency: string,
    refundReason?: string,
    note?: string,

    // Line items refunded
    lineItemsRefunded: Array<{
      lineItemId: string,
      quantity: number,
      amount: number
    }>,

    // Transactions
    refundTransactions: Array<{
      transactionId: string,
      amount: number,
      gateway: string
    }>,

    // Timestamps
    refundedAt: string
  },

  timestamp: number,
  createdAt: number
}
```

### Event Type: "order_cancelled"

Fired when order is cancelled before fulfillment.

```typescript
{
  _id: Id<'events'>,
  groupId: Id<'groups'>,

  type: "order_cancelled",
  actorId: Id<'things'>,           // Who cancelled (customer or staff)

  metadata: {
    shopifyOrderId: string,
    orderNumber: string,
    cancelReason: "customer" | "fraud" | "inventory" | "declined" | "other",
    note?: string,
    cancelledAt: string
  },

  timestamp: number,
  createdAt: number
}
```

---

## Transformation Logic

### Step 1: Create "purchased" Connections (One Per Line Item)

```typescript
async function transformOrderToConnections(
  shopifyOrder: ShopifyOrder,
  customerId: Id<'things'> | null,  // Null for guest checkout
  groupId: Id<'groups'>
): Promise<ConnectionInput[]> {
  const connections: ConnectionInput[] = [];

  for (const lineItem of shopifyOrder.lineItems.edges) {
    const item = lineItem.node;

    // Skip if variant was deleted or customer is guest (no connection without customer Thing)
    if (!item.variant || !customerId) continue;

    // Find or create ProductVariant Thing
    const variantId = await findOrCreateVariant(item.variant, groupId);

    connections.push({
      groupId,
      fromThingId: customerId,
      toThingId: variantId,
      relationshipType: "purchased",

      metadata: {
        shopifyOrderId: extractNumericId(shopifyOrder.id),
        orderNumber: shopifyOrder.name,
        orderName: shopifyOrder.name.replace('#', ''),

        shopifyLineItemId: extractNumericId(item.id),
        quantity: item.quantity,
        currentQuantity: item.currentQuantity,

        unitPrice: parseFloat(item.discountedUnitPriceSet.shopMoney.amount),
        totalPrice: parseFloat(item.discountedTotalSet.shopMoney.amount),
        currency: item.discountedTotalSet.shopMoney.currencyCode,

        productTitle: item.title,
        variantTitle: item.variantTitle,
        sku: item.sku,

        fulfillmentStatus: item.fulfillmentStatus || "unfulfilled",
        fulfillableQuantity: item.fulfillableQuantity,

        requiresShipping: item.requiresShipping,
        taxable: item.taxable,

        purchasedAt: shopifyOrder.processedAt
      }
    });
  }

  return connections;
}
```

### Step 2: Create "order_placed" Event

```typescript
function transformOrderToPlacedEvent(
  shopifyOrder: ShopifyOrder,
  customerId: Id<'things'> | null,
  groupId: Id<'groups'>
): EventInput {
  return {
    groupId,
    type: "order_placed",
    actorId: customerId,

    metadata: {
      shopifyOrderId: extractNumericId(shopifyOrder.id),
      orderNumber: shopifyOrder.name,
      orderName: shopifyOrder.name.replace('#', ''),

      customerEmail: shopifyOrder.email,
      customerPhone: shopifyOrder.phone,

      subtotal: parseFloat(shopifyOrder.subtotalPriceSet.shopMoney.amount),
      tax: parseFloat(shopifyOrder.totalTaxSet.shopMoney.amount),
      shipping: parseFloat(shopifyOrder.totalShippingPriceSet.shopMoney.amount),
      discount: parseFloat(shopifyOrder.totalDiscountsSet.shopMoney.amount),
      total: parseFloat(shopifyOrder.totalPriceSet.shopMoney.amount),
      currency: shopifyOrder.currencyCode,

      itemCount: shopifyOrder.lineItems.edges.reduce(
        (sum, item) => sum + item.node.quantity,
        0
      ),

      lineItems: shopifyOrder.lineItems.edges.map(edge => ({
        productId: edge.node.variant?.product.id,
        variantId: edge.node.variant?.id,
        quantity: edge.node.quantity,
        price: parseFloat(edge.node.discountedTotalSet.shopMoney.amount)
      })),

      shippingAddress: transformAddress(shopifyOrder.shippingAddress),
      billingAddress: transformAddress(shopifyOrder.billingAddress),

      isTest: shopifyOrder.test,
      confirmed: shopifyOrder.confirmed,

      shopifyCreatedAt: shopifyOrder.createdAt,
      shopifyProcessedAt: shopifyOrder.processedAt
    },

    timestamp: new Date(shopifyOrder.processedAt).getTime()
  };
}
```

### Step 3: Create Payment Events (One Per Transaction)

```typescript
function transformTransactionsToEvents(
  shopifyOrder: ShopifyOrder,
  customerId: Id<'things'> | null,
  groupId: Id<'groups'>
): EventInput[] {
  return shopifyOrder.transactions
    .filter(tx => tx.status === 'SUCCESS')
    .map(tx => ({
      groupId,
      type: getEventTypeFromTransactionKind(tx.kind),  // "payment_processed", etc.
      actorId: customerId,

      metadata: {
        shopifyOrderId: extractNumericId(shopifyOrder.id),
        orderNumber: shopifyOrder.name,

        shopifyTransactionId: extractNumericId(tx.id),
        transactionKind: tx.kind.toLowerCase(),
        transactionStatus: tx.status.toLowerCase(),

        amount: parseFloat(tx.amountSet.shopMoney.amount),
        currency: tx.amountSet.shopMoney.currencyCode,
        gateway: tx.gateway,

        processedAt: tx.processedAt
      },

      timestamp: new Date(tx.processedAt).getTime()
    }));
}
```

### Step 4: Create Fulfillment Events

```typescript
function transformFulfillmentsToEvents(
  shopifyOrder: ShopifyOrder,
  groupId: Id<'groups'>
): EventInput[] {
  return shopifyOrder.fulfillments.map(fulfillment => ({
    groupId,
    type: "order_fulfilled",
    actorId: null,  // TODO: Get staff member who fulfilled

    metadata: {
      shopifyOrderId: extractNumericId(shopifyOrder.id),
      orderNumber: shopifyOrder.name,

      shopifyFulfillmentId: extractNumericId(fulfillment.id),
      fulfillmentStatus: fulfillment.status.toLowerCase(),

      trackingCompany: fulfillment.trackingInfo[0]?.company,
      trackingNumber: fulfillment.trackingInfo[0]?.number,
      trackingUrl: fulfillment.trackingInfo[0]?.url,

      lineItemsFulfilled: fulfillment.fulfillmentLineItems.edges.map(edge => ({
        lineItemId: extractNumericId(edge.node.lineItem.id),
        quantity: edge.node.quantity
      })),

      fulfilledAt: fulfillment.createdAt,
      deliveredAt: fulfillment.deliveredAt
    },

    timestamp: new Date(fulfillment.createdAt).getTime()
  }));
}
```

---

## Complete Order Sync Example

### Shopify Order JSON (Simplified)

```json
{
  "id": "gid://shopify/Order/5555555555",
  "name": "#1001",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "customer": {
    "id": "gid://shopify/Customer/7777777777"
  },
  "lineItems": {
    "edges": [
      {
        "node": {
          "id": "gid://shopify/LineItem/11111",
          "title": "Classic T-Shirt",
          "quantity": 2,
          "currentQuantity": 2,
          "variant": {
            "id": "gid://shopify/ProductVariant/4567890",
            "title": "Small / Blue",
            "sku": "TSHIRT-SM-BLU"
          },
          "discountedUnitPriceSet": {
            "shopMoney": { "amount": "19.99", "currencyCode": "USD" }
          },
          "discountedTotalSet": {
            "shopMoney": { "amount": "39.98", "currencyCode": "USD" }
          },
          "fulfillmentStatus": "fulfilled"
        }
      }
    ]
  },
  "subtotalPriceSet": {
    "shopMoney": { "amount": "39.98", "currencyCode": "USD" }
  },
  "totalTaxSet": {
    "shopMoney": { "amount": "3.20", "currencyCode": "USD" }
  },
  "totalShippingPriceSet": {
    "shopMoney": { "amount": "5.00", "currencyCode": "USD" }
  },
  "totalPriceSet": {
    "shopMoney": { "amount": "48.18", "currencyCode": "USD" }
  },
  "displayFinancialStatus": "PAID",
  "displayFulfillmentStatus": "FULFILLED",
  "processedAt": "2024-11-22T10:00:00Z",
  "transactions": [
    {
      "id": "gid://shopify/OrderTransaction/99999",
      "kind": "SALE",
      "status": "SUCCESS",
      "gateway": "shopify_payments",
      "amountSet": {
        "shopMoney": { "amount": "48.18", "currencyCode": "USD" }
      },
      "processedAt": "2024-11-22T10:00:05Z"
    }
  ],
  "fulfillments": [
    {
      "id": "gid://shopify/Fulfillment/88888",
      "status": "SUCCESS",
      "trackingInfo": [
        {
          "company": "USPS",
          "number": "1Z999AA10123456784",
          "url": "https://tools.usps.com/go/TrackConfirmAction?tLabels=1Z999AA10123456784"
        }
      ],
      "createdAt": "2024-11-22T14:00:00Z"
    }
  ]
}
```

### ONE Platform Transformation

**1. Connection (customer purchased variant):**

```typescript
{
  _id: "k500...",
  groupId: "k999...",              // Shopify Store
  fromThingId: "k777...",          // Customer Thing
  toThingId: "k124...",            // ProductVariant Thing (Small / Blue)
  relationshipType: "purchased",

  metadata: {
    shopifyOrderId: "5555555555",
    orderNumber: "#1001",
    orderName: "1001",

    shopifyLineItemId: "11111",
    quantity: 2,
    currentQuantity: 2,

    unitPrice: 19.99,
    totalPrice: 39.98,
    currency: "USD",

    productTitle: "Classic T-Shirt",
    variantTitle: "Small / Blue",
    sku: "TSHIRT-SM-BLU",

    fulfillmentStatus: "fulfilled",
    fulfillableQuantity: 0,

    requiresShipping: true,
    taxable: true,

    purchasedAt: "2024-11-22T10:00:00Z"
  },

  createdAt: 1732269600000,
  updatedAt: 1732269600000
}
```

**2. Event (order_placed):**

```typescript
{
  _id: "k600...",
  groupId: "k999...",
  type: "order_placed",
  actorId: "k777...",              // Customer

  metadata: {
    shopifyOrderId: "5555555555",
    orderNumber: "#1001",
    orderName: "1001",

    customerEmail: "customer@example.com",
    customerPhone: "+1234567890",

    subtotal: 39.98,
    tax: 3.20,
    shipping: 5.00,
    discount: 0,
    total: 48.18,
    currency: "USD",

    itemCount: 2,

    lineItems: [
      {
        productId: "7891234567890",
        variantId: "4567890",
        quantity: 2,
        price: 39.98
      }
    ],

    isTest: false,
    confirmed: true,

    shopifyCreatedAt: "2024-11-22T10:00:00Z",
    shopifyProcessedAt: "2024-11-22T10:00:00Z"
  },

  timestamp: 1732269600000,
  createdAt: 1732269600000
}
```

**3. Event (payment_processed):**

```typescript
{
  _id: "k601...",
  groupId: "k999...",
  type: "payment_processed",
  actorId: "k777...",

  metadata: {
    shopifyOrderId: "5555555555",
    orderNumber: "#1001",

    shopifyTransactionId: "99999",
    transactionKind: "sale",
    transactionStatus: "success",

    amount: 48.18,
    currency: "USD",
    gateway: "shopify_payments",

    processedAt: "2024-11-22T10:00:05Z"
  },

  timestamp: 1732269605000,
  createdAt: 1732269605000
}
```

**4. Event (order_fulfilled):**

```typescript
{
  _id: "k602...",
  groupId: "k999...",
  type: "order_fulfilled",
  actorId: null,                   // Staff member (TODO)

  metadata: {
    shopifyOrderId: "5555555555",
    orderNumber: "#1001",

    shopifyFulfillmentId: "88888",
    fulfillmentStatus: "success",

    trackingCompany: "USPS",
    trackingNumber: "1Z999AA10123456784",
    trackingUrl: "https://tools.usps.com/go/TrackConfirmAction?tLabels=1Z999AA10123456784",

    lineItemsFulfilled: [
      { lineItemId: "11111", quantity: 2 }
    ],

    fulfilledAt: "2024-11-22T14:00:00Z"
  },

  timestamp: 1732284000000,
  createdAt: 1732284000000
}
```

---

## Edge Cases & Challenges

### 1. Guest Checkout (No Customer Account)

**Scenario:** Customer checks out without creating account

**Shopify:** `order.customer` is null

**ONE Mapping:**
- Option A: Create temporary Customer Thing for guest (email as identifier)
- Option B: Store order events WITHOUT connections (events only, no "purchased" connection)
- **Recommendation:** Option A - create guest customer for data consistency

```typescript
// Create guest customer
{
  type: "creator",
  name: "Guest",
  slug: `guest-${email}`,
  properties: {
    email,
    isGuest: true,
    shopifyCustomerId: null
  }
}
```

### 2. Partial Fulfillments

**Scenario:** Order has 3 items, only 2 shipped initially

**Shopify:** Multiple fulfillments, `displayFulfillmentStatus: "PARTIALLY_FULFILLED"`

**ONE Mapping:**
- Create multiple `order_fulfilled` events (one per fulfillment)
- Update connection metadata `fulfillmentStatus: "partial"`
- Track `fulfillableQuantity` to show remaining items

### 3. Partial Refunds

**Scenario:** Customer returns 1 of 2 items

**Shopify:** `displayFinancialStatus: "PARTIALLY_REFUNDED"`

**ONE Mapping:**
- Create `order_refunded` event
- Update connection `currentQuantity` (2 → 1)
- Don't delete connection (keeps purchase history)

### 4. Order Cancellation Before Fulfillment

**Scenario:** Order cancelled, payment refunded, no items shipped

**Shopify:** `cancelled: true`, `cancelReason: "customer"`

**ONE Mapping:**
- Keep all connections (purchase history intact)
- Create `order_cancelled` event
- Create `payment_refunded` event
- Update connection metadata `status: "cancelled"`

### 5. Test Orders

**Scenario:** Merchant creates test orders for testing

**Shopify:** `test: true`

**ONE Mapping:**
- Still sync to ONE (for testing integrations)
- Add flag in metadata `isTest: true`
- Filter out in production queries

### 6. Deleted Products

**Scenario:** Product deleted after order placed

**Shopify:** `lineItem.variant` is null

**ONE Mapping:**
- Store product/variant info in connection metadata (snapshot at purchase time)
- Don't create connection if variant Thing doesn't exist
- Rely on event metadata for historical data

### 7. Multi-Currency Orders

**Scenario:** Customer pays in different currency than store default

**Shopify:** `presentmentCurrencyCode` vs `shopMoney` currency

**ONE Mapping:**
- Store both currencies if needed
- Use `shopMoney` (store currency) for consistency
- Add presentment currency in metadata if different

---

## Query Patterns

### Get All Orders for Customer

```typescript
// Get all purchases
const purchases = await provider.connections.query({
  groupId,
  fromThingId: customerId,
  relationshipType: "purchased"
});

// Group by order
const ordersByOrderNumber = groupBy(purchases, c => c.metadata.orderNumber);
```

### Get Order Timeline (Events)

```typescript
const orderEvents = await provider.events.query({
  groupId,
  filters: {
    "metadata.orderNumber": "#1001"
  },
  orderBy: "timestamp"
});

// Returns: [order_placed, payment_processed, order_fulfilled, ...]
```

### Calculate Customer Lifetime Value

```typescript
const purchases = await provider.connections.query({
  groupId,
  fromThingId: customerId,
  relationshipType: "purchased"
});

const totalSpent = purchases.reduce(
  (sum, p) => sum + p.metadata.totalPrice,
  0
);
```

### Get Unfulfilled Orders

```typescript
const unfulfilled = await provider.connections.query({
  groupId,
  relationshipType: "purchased",
  filters: {
    "metadata.fulfillmentStatus": "unfulfilled"
  }
});
```

---

## Sync Strategy

### Initial Sync (Historical Orders)

1. Fetch all orders from Shopify (paginated, oldest first)
2. For each order:
   - Get or create Customer Thing
   - Create "purchased" Connections (one per line item)
   - Create "order_placed" Event
   - Create payment Events (from transactions)
   - Create fulfillment Events (if fulfilled)
3. Store sync cursor (last synced order date)

### Incremental Sync (Webhooks)

**Webhook topics:**
- `orders/create` → Create connections + order_placed event
- `orders/updated` → Update connection metadata
- `orders/cancelled` → Create order_cancelled event
- `orders/fulfilled` → Create order_fulfilled event
- `orders/paid` → Create payment_processed event
- `refunds/create` → Create order_refunded event

---

## Performance Considerations

### Large Orders (100+ Line Items)

- Batch create connections (Convex supports batching)
- Create single order_placed event (not per line item)
- Consider pagination for order history queries

### High-Volume Stores (1000+ orders/day)

- Use webhook-based incremental sync (not polling)
- Queue webhook processing (avoid overwhelming database)
- Index by orderNumber, shopifyOrderId, customerId

### Historical Data (Years of Orders)

- Implement date-range syncing
- Archive old fulfilled orders (move to cold storage)
- Keep events forever (audit trail)

---

## Related Dimensions

**Things:**
- Customer → (role: "customer")
- ProductVariant → (type: "product_variant")

**Connections:**
- `purchased` - Customer → ProductVariant
- `fulfilled_by` - Order → Staff member (future)

**Events:**
- `order_placed`, `payment_processed`, `order_fulfilled`, `order_refunded`, `order_cancelled`

**Knowledge:**
- Order notes → chunks
- Customer purchase patterns → embeddings (for AI recommendations)

---

## Next Steps

**Cycle 6:** Map Shopify Customers to People dimension

---

## References

**Shopify Documentation:**
- [Order GraphQL Object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Order)
- [Order REST API](https://shopify.dev/docs/api/admin-rest/latest/resources/order)
- [Fulfillment Order API](https://www.shopify.com/partners/blog/shopify-fulfillment-orders-api)

**ONE Platform:**
- `/one/knowledge/ontology.md` - 6-dimension specification (Connections, Events)
- `/one/things/plans/shopify-integration-100-cycles.md` - Integration plan

---

**Built with clarity, simplicity, and infinite scale in mind.**
