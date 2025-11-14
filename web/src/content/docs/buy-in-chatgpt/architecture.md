---
title: Buy in ChatGPT - Architecture
description: Complete system architecture including ACP endpoints, Product Feed, Stripe SPT integration, webhooks, and database schema
category: Buy in ChatGPT
order: 2
tags:
  - architecture
  - acp
  - stripe
  - api
---

# Buy in ChatGPT - System Architecture

## Architecture Overview

Buy in ChatGPT implements the **Agentic Commerce Protocol (ACP)** to enable conversational commerce across AI platforms (ChatGPT, Claude, Gemini). The system consists of:

1. **5 ACP Checkout Endpoints** - REST API for checkout sessions
2. **Product Feed** - 80+ field catalog accessible by AI
3. **Stripe SPT Integration** - Shared Payment Tokens for instant checkout
4. **Webhook System** - Real-time payment confirmation
5. **6-Dimension Ontology** - Database schema for all entities

```
┌─────────────────────────────────────────────────────────────┐
│                       ChatGPT / Claude                       │
│                                                               │
│  Customer: "I need a gift for my wife"                       │
│  AI: "I recommend Chanel Coco Noir..."                       │
│  [Buy Now] ← ChatGPT Instant Checkout                        │
└──────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    ACP Checkout API                          │
│                                                               │
│  POST   /api/checkout_sessions           - Create            │
│  POST   /api/checkout_sessions/[id]      - Update            │
│  GET    /api/checkout_sessions/[id]      - Retrieve          │
│  POST   /api/checkout_sessions/[id]/complete - Complete      │
│  POST   /api/checkout_sessions/[id]/cancel   - Cancel        │
└──────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Stripe Integration                          │
│                                                               │
│  Shared Payment Token (SPT) → PaymentIntent                  │
│  Single-use, amount-scoped, PCI-compliant                    │
│  ONE line different from regular Stripe!                     │
└──────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  6-Dimension Ontology                        │
│                                                               │
│  Things: Products, Orders, Conversations, Customers          │
│  Connections: Purchased, Recommended, Owns                   │
│  Events: Created, Updated, Completed, Confirmed              │
│  Knowledge: Product embeddings, Customer preferences         │
│  Groups: Multi-tenant isolation (groupId scoping)            │
│  People: Customers, Merchants, Platform owners               │
└─────────────────────────────────────────────────────────────┘
```

## The 5 ACP Checkout Endpoints

### Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/api/checkout_sessions` | Create new checkout session |
| **POST** | `/api/checkout_sessions/[id]` | Update session (address, fulfillment) |
| **GET** | `/api/checkout_sessions/[id]` | Retrieve session state |
| **POST** | `/api/checkout_sessions/[id]/complete` | Complete purchase with SPT |
| **POST** | `/api/checkout_sessions/[id]/cancel` | Cancel session |

### 1. Create Checkout Session

**Endpoint:** `POST /api/checkout_sessions`

**Purpose:** Initialize a new checkout session with line items.

**Request:**

```typescript
{
  "items": [
    {
      "id": "product-123",      // Product ID from your catalog
      "quantity": 1
    }
  ],
  "buyer": {
    "first_name": "John",       // Or fore_name (Stripe spec)
    "last_name": "Doe",          // Or sur_name (Stripe spec)
    "email": "john@example.com",
    "phone_number": "+1234567890" // Optional
  },
  "fulfillment_address": {      // Optional - provide for shipping calc
    "name": "John Doe",
    "line_one": "123 Main St",
    "line_two": "Apt 4",         // Optional
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94102"
  }
}
```

**Response:**

```typescript
{
  "id": "cs_1234567890abcdef",
  "buyer": { /* ... */ },
  "payment_provider": {
    "provider": "stripe",
    "supported_payment_methods": ["card"]
  },
  "status": "ready_for_payment",  // or "not_ready_for_payment"
  "currency": "usd",
  "line_items": [
    {
      "id": "li_abc123",
      "item": {
        "id": "product-123",
        "quantity": 1
      },
      "base_amount": 5000,      // Price in cents
      "discount": 0,
      "subtotal": 5000,
      "tax": 400,               // Calculated from address
      "total": 5400
    }
  ],
  "fulfillment_address": { /* ... */ },
  "fulfillment_options": [
    {
      "type": "shipping",
      "id": "standard_shipping",
      "title": "Standard Shipping",
      "subtitle": "Arrives in 5-7 business days",
      "carrier_info": "USPS",
      "earliest_delivery_time": "2025-01-20T00:00:00Z",
      "latest_delivery_time": "2025-01-22T00:00:00Z",
      "subtotal": 500,          // $5.00 shipping
      "tax": 0,
      "total": 500
    },
    {
      "type": "shipping",
      "id": "express_shipping",
      "title": "Express Shipping",
      "subtitle": "Arrives in 1-2 business days",
      "carrier_info": "USPS",
      "earliest_delivery_time": "2025-01-16T00:00:00Z",
      "latest_delivery_time": "2025-01-17T00:00:00Z",
      "subtotal": 1500,         // $15.00 shipping
      "tax": 0,
      "total": 1500
    }
  ],
  "fulfillment_option_id": "standard_shipping",
  "totals": [
    {
      "type": "items_base_amount",
      "display_text": "Item(s) total",
      "amount": 5000
    },
    {
      "type": "subtotal",
      "display_text": "Subtotal",
      "amount": 5000
    },
    {
      "type": "fulfillment",
      "display_text": "Shipping",
      "amount": 500
    },
    {
      "type": "tax",
      "display_text": "Tax",
      "amount": 400
    },
    {
      "type": "total",
      "display_text": "Total",
      "amount": 5900            // $59.00 total
    }
  ],
  "messages": [],
  "links": [
    {
      "type": "terms_of_use",
      "value": "https://one.ie/terms"
    },
    {
      "type": "privacy_policy",
      "value": "https://one.ie/privacy"
    }
  ]
}
```

**Status Codes:**

- `201` - Session created successfully
- `400` - Invalid request (missing items, invalid product ID, out of stock)
- `401` - Unauthorized (invalid API key)
- `500` - Server error

### 2. Update Checkout Session

**Endpoint:** `POST /api/checkout_sessions/[id]`

**Purpose:** Update buyer info, address, or selected fulfillment option.

**Request:**

```typescript
{
  "buyer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "fulfillment_address": {
    "name": "John Doe",
    "line_one": "456 Market St",  // Changed address
    "city": "Los Angeles",
    "state": "CA",
    "country": "US",
    "postal_code": "90001"
  },
  "fulfillment_option_id": "express_shipping"  // Changed to express
}
```

**Response:** Same as Create response with updated values and recalculated tax/shipping.

**Status Codes:**

- `200` - Session updated successfully
- `400` - Invalid request
- `404` - Session not found
- `409` - Session already completed/canceled

### 3. Retrieve Checkout Session

**Endpoint:** `GET /api/checkout_sessions/[id]`

**Purpose:** Get current state of checkout session.

**Response:** Same as Create response.

**Status Codes:**

- `200` - Session retrieved successfully
- `404` - Session not found

### 4. Complete Checkout Session

**Endpoint:** `POST /api/checkout_sessions/[id]/complete`

**Purpose:** Finalize purchase using Stripe Shared Payment Token.

**Request:**

```typescript
{
  "shared_payment_granted_token": "spt_1234567890abcdef"  // From ChatGPT
}
```

**Response:**

```typescript
{
  "id": "cs_1234567890abcdef",
  "status": "completed",
  "order": {
    "id": "order_9876543210",
    "status": "confirmed",
    "payment_status": "paid",
    "fulfillment_status": "pending",
    "created_at": "2025-01-14T12:00:00Z",
    "total_amount": 5900,       // $59.00
    "currency": "usd",
    "tracking_number": null,     // Added when shipped
    "confirmation_url": "https://one.ie/orders/order_9876543210"
  },
  "messages": [
    {
      "type": "success",
      "content": "Order confirmed! You'll receive an email confirmation shortly.",
      "content_type": "text/plain"
    }
  ]
}
```

**Status Codes:**

- `200` - Payment successful, order created
- `400` - Invalid SPT or session not ready
- `402` - Payment failed (insufficient funds, declined card)
- `404` - Session not found
- `409` - Session already completed

### 5. Cancel Checkout Session

**Endpoint:** `POST /api/checkout_sessions/[id]/cancel`

**Purpose:** Cancel checkout session (user abandoned or changed mind).

**Request:** Empty body or optional reason:

```typescript
{
  "reason": "user_canceled"
}
```

**Response:**

```typescript
{
  "id": "cs_1234567890abcdef",
  "status": "canceled",
  "messages": [
    {
      "type": "info",
      "content": "Checkout session canceled",
      "content_type": "text/plain"
    }
  ]
}
```

**Status Codes:**

- `200` - Session canceled successfully
- `404` - Session not found
- `409` - Session already completed

## Product Feed Specification

### Purpose

The Product Feed provides AI agents with complete product information for search and recommendations. ChatGPT queries this feed to answer customer questions.

### Endpoint

`GET /api/commerce/feed.json`

**Caching:** 15-minute cache recommended (balance freshness vs performance)

### Response Format

```typescript
{
  "meta": {
    "generated_at": "2025-01-14T12:00:00Z",
    "total_products": 150,
    "format": "json",
    "version": "1.0.0",
    "merchant": {
      "name": "ONE Platform",
      "id": "merchant_123",
      "url": "https://one.ie"
    }
  },
  "products": [
    {
      // OpenAI Flags
      "enable_search": true,      // Searchable in ChatGPT
      "enable_checkout": true,    // Purchasable via ACP

      // Basic Info
      "id": "product-123",
      "gtin": "012345678905",     // Universal product ID (UPC/ISBN)
      "mpn": "SKU-ABC-123",       // Manufacturer part number
      "title": "StarVie Metheora Warrior Padel Racket",
      "description": "Professional-grade padel racket with soft carbon-fiber core...",
      "link": "https://one.ie/products/starv ie-metheora-warrior",

      // Item Details
      "condition": "new",
      "product_category": "Sports > Racket Sports > Padel > Rackets",
      "brand": "StarVie",
      "material": "Carbon fiber, EVA foam",
      "dimensions": "18x10x1.5 in",
      "weight": "365g",
      "age_group": "adult",

      // Media
      "image_link": "https://one.ie/images/products/racket-1.jpg",
      "additional_image_link": [
        "https://one.ie/images/products/racket-1-side.jpg",
        "https://one.ie/images/products/racket-1-detail.jpg"
      ],
      "video_link": "https://one.ie/videos/racket-1-demo.mp4",
      "model_3d_link": null,

      // Pricing
      "price": "139.00 USD",
      "sale_price": "119.00 USD",  // Optional discount
      "sale_price_effective_date": "2025-01-14T00:00:00Z/2025-01-31T23:59:59Z",

      // Availability
      "availability": "in_stock",
      "inventory_quantity": 25,
      "pickup_method": "not_supported",

      // Variants (if applicable)
      "item_group_id": "racket-warrior-group",
      "color": "Black/Orange",
      "size": "Standard",

      // Fulfillment
      "shipping": [
        "US:CA:Standard:5.00 USD",
        "US:CA:Express:15.00 USD"
      ],
      "delivery_estimate": "2025-01-21T00:00:00Z",

      // Merchant
      "seller_name": "ONE Platform",
      "seller_url": "https://one.ie",
      "seller_privacy_policy": "https://one.ie/privacy",
      "seller_tos": "https://one.ie/terms",

      // Returns
      "return_policy": "https://one.ie/returns",
      "return_window": 30,        // Days

      // Performance Signals
      "popularity_score": 4.5,
      "return_rate": 5,           // 5% return rate

      // Reviews
      "product_review_count": 127,
      "product_review_rating": 4.9,
      "store_review_count": 1543,
      "store_review_rating": 4.8,

      // Related Products
      "related_product_id": ["product-456", "product-789"],
      "relationship_type": "often_bought_with"
    }
    // ... more products
  ]
}
```

### 80+ Fields Reference

The Product Feed supports 80+ fields divided into categories:

**OpenAI Flags (2):**
- `enable_search` - Searchable in ChatGPT
- `enable_checkout` - Purchasable via ACP

**Basic Product Data (6):**
- `id`, `gtin`, `mpn`, `title`, `description`, `link`

**Item Information (11):**
- `condition`, `product_category`, `brand`, `material`, `dimensions`, `length`, `width`, `height`, `weight`, `age_group`

**Media (4):**
- `image_link`, `additional_image_link`, `video_link`, `model_3d_link`

**Price & Promotions (7):**
- `price`, `sale_price`, `sale_price_effective_date`, `unit_pricing_measure`, `base_measure`, `pricing_trend`

**Availability & Inventory (6):**
- `availability`, `availability_date`, `inventory_quantity`, `expiration_date`, `pickup_method`, `pickup_sla`

**Variants (11):**
- `item_group_id`, `item_group_title`, `color`, `size`, `size_system`, `gender`, `offer_id`, `custom_variant1-3_category/option`

**Fulfillment (2):**
- `shipping`, `delivery_estimate`

**Merchant Info (5):**
- `seller_name`, `seller_url`, `seller_privacy_policy`, `seller_tos`

**Returns (2):**
- `return_policy`, `return_window`

**Performance Signals (2):**
- `popularity_score`, `return_rate`

**Compliance (3):**
- `warning`, `warning_url`, `age_restriction`

**Reviews and Q&A (7):**
- `product_review_count`, `product_review_rating`, `store_review_count`, `store_review_rating`, `q_and_a`, `raw_review_data`

**Related Products (2):**
- `related_product_id`, `relationship_type`

**Geo Tagging (2):**
- `geo_price`, `geo_availability`

**Total: 80+ fields**

See `/lib/types/product-feed.ts` for complete TypeScript definitions.

## Stripe SPT Integration

### The ONE Line Difference

Regular Stripe checkout uses `payment_method`:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5900,
  currency: 'usd',
  payment_method: 'pm_card_visa',  // Regular Stripe
  confirm: true,
});
```

Buy in ChatGPT uses `shared_payment_granted_token`:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5900,
  currency: 'usd',
  shared_payment_granted_token: sharedPaymentToken,  // ← ONE LINE DIFFERENT!
  confirm: true,
  automatic_payment_methods: {
    enabled: true,
  },
});
```

**That's it!** Everything else is identical to regular Stripe integration.

### How Shared Payment Tokens Work

1. **Customer in ChatGPT** clicks "Buy Now"
2. **ChatGPT** prompts for payment confirmation
3. **Stripe creates SPT** (single-use, amount-scoped)
4. **ChatGPT sends SPT** to your `/complete` endpoint
5. **Your API uses SPT** to charge customer
6. **Order confirmed** in 60 seconds

**Security Features:**

- **Single-use:** SPT works once, then expires
- **Amount-scoped:** SPT only works for exact amount
- **Time-limited:** SPT expires after 15 minutes
- **Merchant-scoped:** SPT only works for your Stripe account

Even if intercepted, SPT is useless to attackers.

### Implementation

```typescript
// lib/stripe/agentic-commerce.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

export async function createPaymentIntentWithSPT(
  sharedPaymentToken: string,
  amount: number,
  currency: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    shared_payment_granted_token: sharedPaymentToken,
    metadata: {
      ...metadata,
      source: 'chatgpt_agentic_commerce',
    },
    automatic_payment_methods: {
      enabled: true,
    },
    confirm: true,  // Immediately confirm (SPT is single-use)
  });

  return paymentIntent;
}
```

## Webhook System

### Stripe Webhooks

Listen for payment confirmations and update order status:

**Endpoint:** `POST /api/webhooks/stripe`

**Events to Handle:**

- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund issued
- `checkout.session.completed` - Checkout completed (if using Checkout)

**Implementation:**

```typescript
import { verifyWebhookSignature } from '@/lib/stripe/agentic-commerce';

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  try {
    const event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update order status to "paid"
        await updateOrderStatus(paymentIntent.metadata.orderId, 'paid');
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        // Update order status to "failed"
        await updateOrderStatus(failedIntent.metadata.orderId, 'failed');
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Webhook verification failed' }), {
      status: 400,
    });
  }
};
```

**Webhook Security:**

- Always verify signature using `stripe.webhooks.constructEvent`
- Use HTTPS endpoint
- Return 200 quickly (process async if needed)
- Implement idempotency (handle duplicate events)

## Database Schema (6-Dimension Ontology)

### Things Table

Stores all entities (products, orders, conversations, customers):

```typescript
things: defineTable({
  // Universal fields
  type: v.string(),           // "product" | "order" | "conversation" | "customer"
  name: v.string(),
  status: v.string(),         // "draft" | "active" | "archived" | "deleted"
  groupId: v.id("groups"),    // Multi-tenant isolation

  // Type-specific data in properties
  properties: v.object({
    // For type: "product"
    price: v.optional(v.number()),
    inventory: v.optional(v.number()),
    category: v.optional(v.string()),
    brand: v.optional(v.string()),

    // For type: "order"
    total: v.optional(v.number()),
    currency: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),

    // For type: "conversation"
    sessionId: v.optional(v.string()),
    platform: v.optional(v.string()), // "chatgpt" | "web" | "mobile"

    // For type: "customer"
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  }),

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### Connections Table

Stores relationships between things:

```typescript
connections: defineTable({
  groupId: v.id("groups"),
  fromThingId: v.id("things"),
  toThingId: v.id("things"),
  type: v.string(),           // "purchased" | "recommended" | "owns" | "related"

  metadata: v.optional(v.object({
    confidence: v.optional(v.number()),  // For recommendations
    reason: v.optional(v.string()),      // Why recommended
  })),

  createdAt: v.number(),
})
```

### Events Table

Complete audit trail of all actions:

```typescript
events: defineTable({
  groupId: v.id("groups"),
  type: v.string(),           // "checkout_created" | "payment_completed" | etc.
  actorId: v.id("things"),    // Who did it
  targetId: v.id("things"),   // What was affected
  timestamp: v.number(),

  metadata: v.object({
    // Event-specific data
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    platform: v.optional(v.string()),
  }),
})
```

### Knowledge Table

Semantic search and embeddings:

```typescript
knowledge: defineTable({
  type: v.string(),           // "chunk" | "label"
  text: v.string(),
  embedding: v.optional(v.array(v.number())),  // 3072-dim for text-embedding-3-large
  embeddingModel: v.optional(v.string()),
  embeddingDim: v.optional(v.number()),
  sourceThingId: v.id("things"),  // Link to product/conversation
  groupId: v.id("groups"),
  labels: v.array(v.string()),    // ["product:padel", "category:rackets"]

  createdAt: v.number(),
  updatedAt: v.number(),
})
```

## Security Considerations

### Authentication

**API Key Authentication:**

```
Authorization: Bearer your_api_key_here
```

- Store API key in environment variable
- Rotate keys regularly
- Use different keys for test vs production

### HTTPS Everywhere

- All endpoints must use HTTPS in production
- Stripe requires HTTPS for webhooks
- ChatGPT requires HTTPS for API calls

### Payment Security

- Never store payment methods (use Stripe SPT)
- Validate all prices server-side (never trust client)
- Verify webhook signatures
- Log all payment attempts
- Implement rate limiting

### Data Privacy

- Encrypt customer data at rest
- PCI-DSS compliance via Stripe
- GDPR-compliant data handling
- SOC 2 ready architecture
- Customer data scoped by groupId (multi-tenancy)

## Performance Optimization

### Caching Strategy

**Product Feed:**
- Cache for 15 minutes
- CDN distribution
- ETag/If-None-Match support

**Checkout Sessions:**
- In-memory cache (or Redis)
- TTL of 1 hour
- Purge on completion/cancellation

**Database Queries:**
- Index on groupId (multi-tenancy)
- Index on type (things filtering)
- Index on sessionId (lookup)

### Response Times

**Target SLAs:**
- Product Feed: < 200ms
- Create Session: < 500ms
- Update Session: < 300ms
- Complete Session: < 1000ms (includes Stripe call)

### Scalability

- Horizontal scaling via Cloudflare Workers
- Database: Convex (auto-scaling)
- CDN: Cloudflare (global distribution)
- Webhook processing: Queue-based (async)

---

**Next:** [Integration Guide](/docs/buy-in-chatgpt/integration-guide) for step-by-step setup instructions.
