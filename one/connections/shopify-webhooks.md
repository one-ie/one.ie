---
title: Shopify Webhooks
dimension: connections
category: shopify-webhooks.md
tags: api, events, integration, real-time, shopify, webhooks
related_dimensions: events, knowledge, things
scope: global
created: 2025-11-22
updated: 2025-11-22
version: 1.0.0
ai_context: |
  This document is part of the connections dimension in the shopify-webhooks.md category.
  Location: one/connections/shopify-webhooks.md
  Purpose: Documents Shopify webhooks for real-time event notifications in ShopifyProvider
  Related dimensions: events, knowledge, things
  For AI agents: Read this to understand Shopify webhook system and event handling.
---

# Shopify Webhooks Guide

**Complete guide to Shopify webhooks for real-time event notifications**

**Last Updated:** 2025-11-22
**Status:** Research Complete
**API Version:** 2025-10 (Latest)

---

## Executive Summary

Shopify webhooks provide **real-time notifications** about events in a merchant's store (orders created, products updated, customers deleted, etc.). This guide covers webhook implementation for the **ShopifyProvider** integration with ONE Platform.

**Key Concepts:**
- ✅ Webhooks = HTTP callbacks sent by Shopify when events occur
- ✅ HMAC signature verification required (security)
- ✅ Idempotent processing (webhooks may be delivered multiple times)
- ✅ Must respond with 200 OK within 5 seconds

**ONE Platform Integration:**
- Shopify webhook → ShopifyProvider → ONE Event (in events table)

---

## Table of Contents

1. [Webhook Overview](#webhook-overview)
2. [Webhook Topics](#webhook-topics)
3. [Webhook Payload Structure](#webhook-payload-structure)
4. [Webhook Registration](#webhook-registration)
5. [HMAC Verification](#hmac-verification)
6. [Handling Webhooks](#handling-webhooks)
7. [Webhook Delivery](#webhook-delivery)
8. [Error Handling & Retries](#error-handling--retries)
9. [Testing Webhooks](#testing-webhooks)
10. [Mapping to ONE Events](#mapping-to-one-events)

---

## Webhook Overview

### What Are Webhooks?

Webhooks are **HTTP POST requests** sent by Shopify to your app when specific events occur in a merchant's store.

**Benefits:**
- ✅ Real-time notifications (no polling required)
- ✅ Efficient (only receive data when events occur)
- ✅ Complete payload (full resource data included)
- ✅ Reliable (automatic retries on failure)

### How Webhooks Work

```
┌─────────────────────┐
│  Shopify Store      │
│  - Order created    │
└──────────┬──────────┘
           │
           │ 1. Event occurs
           ↓
┌─────────────────────┐
│  Shopify Webhook    │
│  System             │
└──────────┬──────────┘
           │
           │ 2. POST request
           ↓
┌─────────────────────┐
│  Your Endpoint      │
│  /api/webhooks      │
└──────────┬──────────┘
           │
           │ 3. Verify HMAC
           │ 4. Process event
           │ 5. Return 200 OK
           ↓
┌─────────────────────┐
│  ONE Platform       │
│  Events Table       │
└─────────────────────┘
```

### Webhook Requirements

1. **HTTPS endpoint** - Webhooks are only sent to HTTPS URLs
2. **HMAC verification** - Verify all webhooks to prevent spoofing
3. **Fast response** - Respond with 200 OK within 5 seconds
4. **Idempotent processing** - Handle duplicate deliveries gracefully

---

## Webhook Topics

### Topic Format

Webhook topics follow the pattern: `{resource}/{event}`

**Examples:**
- `products/create` - Product created
- `orders/paid` - Order paid
- `customers/delete` - Customer deleted

### Core Webhook Topics

#### Products

| Topic | Description | Payload |
|-------|-------------|---------|
| `products/create` | Product created | Full product object |
| `products/update` | Product updated | Full product object |
| `products/delete` | Product deleted | Product ID only |

#### Orders

| Topic | Description | Payload |
|-------|-------------|---------|
| `orders/create` | Order created | Full order object |
| `orders/updated` | Order updated | Full order object |
| `orders/paid` | Order payment completed | Full order object |
| `orders/cancelled` | Order cancelled | Full order object |
| `orders/fulfilled` | Order fulfilled | Full order object |
| `orders/partially_fulfilled` | Order partially fulfilled | Full order object |
| `orders/delete` | Order deleted | Order ID only |

#### Customers

| Topic | Description | Payload |
|-------|-------------|---------|
| `customers/create` | Customer created | Full customer object |
| `customers/update` | Customer updated | Full customer object |
| `customers/delete` | Customer deleted | Customer ID only |
| `customers/enable` | Customer account enabled | Full customer object |
| `customers/disable` | Customer account disabled | Full customer object |

#### Inventory

| Topic | Description | Payload |
|-------|-------------|---------|
| `inventory_levels/update` | Inventory quantity changed | Inventory level object |
| `inventory_items/create` | Inventory item created | Inventory item object |
| `inventory_items/update` | Inventory item updated | Inventory item object |
| `inventory_items/delete` | Inventory item deleted | Inventory item ID |

#### Fulfillments

| Topic | Description | Payload |
|-------|-------------|---------|
| `fulfillments/create` | Fulfillment created | Fulfillment object |
| `fulfillments/update` | Fulfillment updated | Fulfillment object |

#### Carts

| Topic | Description | Payload |
|-------|-------------|---------|
| `carts/create` | Cart created | Cart object |
| `carts/update` | Cart updated | Cart object |

#### Collections

| Topic | Description | Payload |
|-------|-------------|---------|
| `collections/create` | Collection created | Collection object |
| `collections/update` | Collection updated | Collection object |
| `collections/delete` | Collection deleted | Collection ID |

#### Checkouts

| Topic | Description | Payload |
|-------|-------------|---------|
| `checkouts/create` | Checkout created | Checkout object |
| `checkouts/update` | Checkout updated | Checkout object |
| `checkouts/delete` | Checkout deleted | Checkout ID |

#### Shop

| Topic | Description | Payload |
|-------|-------------|---------|
| `shop/update` | Shop details updated | Shop object |
| `app/uninstalled` | App uninstalled | Shop domain |

**Full list:** https://shopify.dev/docs/api/webhooks

---

## Webhook Payload Structure

### Webhook Headers

Every webhook includes these headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-Shopify-Topic` | Webhook topic | `orders/create` |
| `X-Shopify-Hmac-Sha256` | HMAC signature (base64) | `mVBW8...` |
| `X-Shopify-Shop-Domain` | Shop domain | `example.myshopify.com` |
| `X-Shopify-API-Version` | API version | `2025-10` |
| `X-Shopify-Webhook-Id` | Unique webhook ID | `abc123...` |
| `X-Shopify-Triggered-At` | Timestamp (ISO 8601) | `2025-11-22T10:30:00Z` |
| `X-Shopify-Event-Id` | Unique event ID | `def456...` |

### Webhook Body

The body contains the resource data in JSON format.

**Example: `orders/create` Webhook**

```json
{
  "id": 5678901234567,
  "admin_graphql_api_id": "gid://shopify/Order/5678901234567",
  "app_id": 1234567,
  "browser_ip": "192.168.1.1",
  "buyer_accepts_marketing": false,
  "cancel_reason": null,
  "cancelled_at": null,
  "cart_token": "abcd1234",
  "checkout_id": 9876543210,
  "checkout_token": "efgh5678",
  "client_details": {
    "accept_language": "en-US",
    "browser_height": 1080,
    "browser_ip": "192.168.1.1",
    "browser_width": 1920,
    "session_hash": null,
    "user_agent": "Mozilla/5.0..."
  },
  "closed_at": null,
  "confirmed": true,
  "contact_email": "customer@example.com",
  "created_at": "2025-11-22T10:30:00-05:00",
  "currency": "USD",
  "current_subtotal_price": "199.00",
  "current_total_discounts": "0.00",
  "current_total_price": "209.00",
  "current_total_tax": "10.00",
  "customer": {
    "id": 1234567890,
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "state": "enabled",
    "total_spent": "199.00",
    "orders_count": 1
  },
  "email": "customer@example.com",
  "financial_status": "paid",
  "fulfillment_status": null,
  "line_items": [
    {
      "id": 11111111111,
      "variant_id": 22222222222,
      "title": "Awesome T-Shirt",
      "quantity": 1,
      "sku": "TSHIRT-001",
      "variant_title": "Large / Blue",
      "vendor": "ONE Store",
      "fulfillment_service": "manual",
      "product_id": 33333333333,
      "requires_shipping": true,
      "taxable": true,
      "gift_card": false,
      "name": "Awesome T-Shirt - Large / Blue",
      "price": "199.00",
      "properties": []
    }
  ],
  "name": "#1001",
  "note": null,
  "number": 1,
  "order_number": 1001,
  "order_status_url": "https://example.myshopify.com/...",
  "payment_gateway_names": ["shopify_payments"],
  "phone": "+1234567890",
  "presentment_currency": "USD",
  "processed_at": "2025-11-22T10:30:00-05:00",
  "processing_method": "direct",
  "source_name": "web",
  "subtotal_price": "199.00",
  "tags": "",
  "tax_lines": [
    {
      "price": "10.00",
      "rate": 0.05,
      "title": "State Tax"
    }
  ],
  "total_discounts": "0.00",
  "total_line_items_price": "199.00",
  "total_price": "209.00",
  "total_tax": "10.00",
  "total_weight": 0,
  "updated_at": "2025-11-22T10:30:00-05:00",
  "user_id": null,
  "billing_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address1": "123 Main St",
    "address2": "",
    "city": "New York",
    "province": "NY",
    "country": "United States",
    "zip": "10001",
    "phone": "+1234567890"
  },
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address1": "123 Main St",
    "address2": "",
    "city": "New York",
    "province": "NY",
    "country": "United States",
    "zip": "10001",
    "phone": "+1234567890"
  },
  "shipping_lines": [
    {
      "id": 44444444444,
      "title": "Standard Shipping",
      "price": "10.00",
      "code": "STANDARD",
      "source": "shopify"
    }
  ]
}
```

---

## Webhook Registration

### Methods to Register Webhooks

1. **GraphQL Admin API** (Recommended)
2. **REST Admin API** (Legacy)
3. **Shopify Admin UI** (Manual)

### Register via GraphQL Admin API

**Create Webhook Subscription:**

```graphql
mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
  webhookSubscriptionCreate(
    topic: $topic
    webhookSubscription: $webhookSubscription
  ) {
    webhookSubscription {
      id
      topic
      format
      endpoint {
        __typename
        ... on WebhookHttpEndpoint {
          callbackUrl
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables:**

```json
{
  "topic": "ORDERS_CREATE",
  "webhookSubscription": {
    "format": "JSON",
    "callbackUrl": "https://one.ie/api/webhooks/shopify"
  }
}
```

**Example Implementation:**

```typescript
import { GraphQLClient } from 'graphql-request';

async function createWebhook(
  client: GraphQLClient,
  topic: string,
  callbackUrl: string
) {
  const mutation = `
    mutation CreateWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(
        topic: $topic
        webhookSubscription: $webhookSubscription
      ) {
        webhookSubscription {
          id
          topic
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await client.request(mutation, {
    topic,
    webhookSubscription: {
      format: 'JSON',
      callbackUrl,
    },
  });

  return result.webhookSubscriptionCreate;
}

// Usage
await createWebhook(client, 'ORDERS_CREATE', 'https://one.ie/api/webhooks/shopify');
await createWebhook(client, 'PRODUCTS_UPDATE', 'https://one.ie/api/webhooks/shopify');
await createWebhook(client, 'CUSTOMERS_CREATE', 'https://one.ie/api/webhooks/shopify');
```

### List Existing Webhooks

```graphql
query GetWebhooks {
  webhookSubscriptions(first: 50) {
    edges {
      node {
        id
        topic
        format
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
        createdAt
        updatedAt
      }
    }
  }
}
```

### Delete Webhook

```graphql
mutation DeleteWebhook($id: ID!) {
  webhookSubscriptionDelete(id: $id) {
    deletedWebhookSubscriptionId
    userErrors {
      field
      message
    }
  }
}
```

---

## HMAC Verification

### Why Verify?

**CRITICAL:** Always verify HMAC signatures to prevent webhook spoofing attacks.

Shopify signs each webhook with your app's **client secret** (for OAuth apps) or **API secret key** (for custom apps).

### Verification Process

1. Get raw request body (before parsing JSON)
2. Get `X-Shopify-Hmac-Sha256` header (base64-encoded)
3. Calculate HMAC-SHA256 of raw body using your secret
4. Compare calculated HMAC with header value (constant-time comparison)

### Implementation (Node.js)

```typescript
import crypto from 'crypto';

function verifyWebhook(
  body: string | Buffer,
  hmacHeader: string,
  secret: string
): boolean {
  // Calculate HMAC
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  // Constant-time comparison (prevents timing attacks)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
}

// Usage
const rawBody = request.rawBody; // MUST be raw, not parsed
const hmac = request.headers['x-shopify-hmac-sha256'];
const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

if (!verifyWebhook(rawBody, hmac, secret)) {
  throw new Error('Invalid webhook signature');
}
```

### Implementation (Express.js)

**IMPORTANT:** You need the **raw body**, not parsed JSON.

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();

// Middleware to capture raw body
app.use('/api/webhooks/shopify', express.raw({ type: 'application/json' }));

app.post('/api/webhooks/shopify', (req, res) => {
  const hmac = req.headers['x-shopify-hmac-sha256'] as string;
  const topic = req.headers['x-shopify-topic'] as string;
  const shop = req.headers['x-shopify-shop-domain'] as string;
  const rawBody = req.body; // Buffer (raw body)

  // Verify HMAC
  if (!verifyWebhook(rawBody, hmac, process.env.SHOPIFY_WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }

  // Parse JSON after verification
  const data = JSON.parse(rawBody.toString('utf8'));

  // Process webhook
  processWebhook(topic, shop, data);

  // Respond quickly
  res.status(200).send('OK');
});
```

### Common Mistakes

❌ **Parsing JSON before verification:**
```typescript
app.use(express.json()); // ❌ This destroys raw body
app.post('/webhooks', (req, res) => {
  verifyWebhook(req.body, hmac, secret); // ❌ req.body is parsed object
});
```

✅ **Correct approach:**
```typescript
app.use('/webhooks', express.raw({ type: 'application/json' })); // ✅
app.post('/webhooks', (req, res) => {
  verifyWebhook(req.body, hmac, secret); // ✅ req.body is Buffer
  const data = JSON.parse(req.body.toString('utf8')); // ✅ Parse after verification
});
```

---

## Handling Webhooks

### Best Practices

1. **Respond quickly** - Return 200 OK within 5 seconds
2. **Process asynchronously** - Queue webhook for background processing
3. **Idempotent processing** - Handle duplicate deliveries gracefully
4. **Retry logic** - Handle transient failures

### Pattern: Queue-Based Processing

```typescript
import { Queue } from 'bullmq';

const webhookQueue = new Queue('shopify-webhooks');

app.post('/api/webhooks/shopify', async (req, res) => {
  // 1. Verify HMAC
  const hmac = req.headers['x-shopify-hmac-sha256'] as string;
  if (!verifyWebhook(req.body, hmac, process.env.SHOPIFY_WEBHOOK_SECRET)) {
    return res.status(401).send('Unauthorized');
  }

  // 2. Parse data
  const topic = req.headers['x-shopify-topic'] as string;
  const shop = req.headers['x-shopify-shop-domain'] as string;
  const webhookId = req.headers['x-shopify-webhook-id'] as string;
  const data = JSON.parse(req.body.toString('utf8'));

  // 3. Queue for processing
  await webhookQueue.add('process-webhook', {
    webhookId,
    topic,
    shop,
    data,
    receivedAt: new Date(),
  });

  // 4. Respond immediately
  res.status(200).send('OK');
});
```

### Pattern: Idempotent Processing

```typescript
// Worker processing webhooks from queue
async function processWebhook(job: Job) {
  const { webhookId, topic, shop, data } = job.data;

  // Check if already processed (idempotency)
  const existing = await db.processedWebhooks.findOne({ webhookId });
  if (existing) {
    console.log('Webhook already processed:', webhookId);
    return;
  }

  try {
    // Process webhook based on topic
    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(shop, data);
        break;
      case 'products/update':
        await handleProductUpdated(shop, data);
        break;
      case 'customers/delete':
        await handleCustomerDeleted(shop, data);
        break;
      default:
        console.warn('Unhandled webhook topic:', topic);
    }

    // Mark as processed
    await db.processedWebhooks.insert({
      webhookId,
      topic,
      shop,
      processedAt: new Date(),
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    throw error; // Retry via queue
  }
}
```

### Pattern: Topic Routing

```typescript
const webhookHandlers = {
  'orders/create': handleOrderCreated,
  'orders/paid': handleOrderPaid,
  'orders/fulfilled': handleOrderFulfilled,
  'products/create': handleProductCreated,
  'products/update': handleProductUpdated,
  'products/delete': handleProductDeleted,
  'customers/create': handleCustomerCreated,
  'customers/update': handleCustomerUpdated,
  'inventory_levels/update': handleInventoryUpdated,
  'app/uninstalled': handleAppUninstalled,
};

async function processWebhook(topic: string, shop: string, data: any) {
  const handler = webhookHandlers[topic];

  if (!handler) {
    console.warn('No handler for topic:', topic);
    return;
  }

  await handler(shop, data);
}
```

---

## Webhook Delivery

### Delivery Guarantees

- **At-least-once delivery** - Webhooks may be delivered multiple times
- **Best-effort ordering** - Events may arrive out of order
- **Automatic retries** - Failed deliveries are retried

### Retry Behavior

**Shopify retries failed webhooks:**
- Immediately after initial failure
- 1 minute later
- 5 minutes later
- 30 minutes later
- 2 hours later
- 6 hours later
- 24 hours later (final attempt)

**Failure conditions:**
- HTTP status code ≠ 200
- Connection timeout (> 5 seconds)
- SSL/TLS errors
- DNS errors

### Webhook Response Requirements

**✅ Successful response:**
```http
HTTP/1.1 200 OK
Content-Length: 0
```

**❌ Failed responses:**
- `400 Bad Request` - Will NOT retry
- `401 Unauthorized` - Will NOT retry
- `404 Not Found` - Will NOT retry
- `500 Internal Server Error` - WILL retry
- `503 Service Unavailable` - WILL retry
- Timeout (> 5 seconds) - WILL retry

**Best Practice:** Return 200 immediately, process asynchronously.

---

## Error Handling & Retries

### Handle Duplicates (Idempotency)

```typescript
// Use webhook ID or event ID for deduplication
const webhookId = req.headers['x-shopify-webhook-id'];
const eventId = req.headers['x-shopify-event-id'];

// Check if already processed
const processed = await db.webhooks.findOne({ webhookId });
if (processed) {
  console.log('Duplicate webhook, skipping');
  return res.status(200).send('OK');
}

// Process webhook
await handleWebhook(data);

// Record processing
await db.webhooks.insert({ webhookId, processedAt: new Date() });
res.status(200).send('OK');
```

### Handle Out-of-Order Delivery

```typescript
async function handleProductUpdate(shop: string, data: any) {
  const shopifyUpdatedAt = new Date(data.updated_at);

  // Get existing product from database
  const existing = await db.products.findOne({
    shopifyId: data.id,
    shop,
  });

  // Only update if webhook is newer
  if (existing && existing.updatedAt > shopifyUpdatedAt) {
    console.log('Ignoring stale webhook');
    return;
  }

  // Apply update
  await db.products.upsert({
    shopifyId: data.id,
    shop,
    title: data.title,
    updatedAt: shopifyUpdatedAt,
  });
}
```

### Handle Transient Failures

```typescript
async function processWebhook(job: Job) {
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await handleWebhook(job.data);
      return; // Success
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        await sleep(retryDelay * attempt);
      } else {
        // Final attempt failed
        await logFailedWebhook(job.data, error);
        throw error;
      }
    }
  }
}
```

---

## Testing Webhooks

### Local Development with ngrok

Shopify requires HTTPS webhooks. Use **ngrok** for local testing:

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
npm run dev  # http://localhost:3000

# Create tunnel
ngrok http 3000
```

**Output:**
```
Forwarding https://abc123.ngrok.io -> http://localhost:3000
```

**Use ngrok URL for webhook:**
```
https://abc123.ngrok.io/api/webhooks/shopify
```

### Trigger Test Webhooks

**Method 1: Perform actions in Shopify admin**
- Create a product → `products/create` webhook
- Create an order → `orders/create` webhook
- Update customer → `customers/update` webhook

**Method 2: Use Shopify CLI**
```bash
shopify webhook trigger --topic orders/create
```

**Method 3: GraphQL API**
```graphql
mutation {
  webhookSubscriptionCreate(
    topic: ORDERS_CREATE
    webhookSubscription: {
      format: JSON
      callbackUrl: "https://abc123.ngrok.io/api/webhooks/shopify"
    }
  ) {
    webhookSubscription {
      id
    }
  }
}
```

### Manual Testing

```bash
curl -X POST https://abc123.ngrok.io/api/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Shop-Domain: example.myshopify.com" \
  -H "X-Shopify-Hmac-Sha256: $(echo -n '{"id":123}' | openssl dgst -sha256 -hmac 'your-secret' -binary | base64)" \
  -H "X-Shopify-Webhook-Id: test-webhook-123" \
  -d '{"id":123,"name":"#1001"}'
```

---

## Mapping to ONE Events

### Webhook → Event Mapping

Map Shopify webhooks to ONE Platform events:

| Shopify Webhook | ONE Event Type | Notes |
|-----------------|----------------|-------|
| `orders/create` | `order_created` | New order placed |
| `orders/paid` | `payment_completed` | Order payment processed |
| `orders/fulfilled` | `order_fulfilled` | Order shipped |
| `orders/cancelled` | `order_cancelled` | Order cancelled |
| `products/create` | `product_created` | New product added |
| `products/update` | `product_updated` | Product modified |
| `products/delete` | `product_deleted` | Product removed |
| `customers/create` | `customer_created` | New customer registered |
| `customers/update` | `customer_updated` | Customer info changed |
| `inventory_levels/update` | `inventory_adjusted` | Stock quantity changed |
| `app/uninstalled` | `integration_disconnected` | App removed |

### Implementation Example

```typescript
import { api } from '../_generated/api';
import { Id } from '../_generated/dataModel';

async function handleOrderCreated(shop: string, orderData: any) {
  const ctx = /* get Convex context */;

  // 1. Find or create customer (Thing)
  const customerId = await findOrCreateCustomer(ctx, shop, orderData.customer);

  // 2. Create order (Thing)
  const orderId = await ctx.db.insert('things', {
    type: 'order',
    groupId: shopId as Id<'groups'>,
    properties: {
      orderNumber: orderData.name,
      totalPrice: orderData.total_price,
      currency: orderData.currency,
      financialStatus: orderData.financial_status,
      fulfillmentStatus: orderData.fulfillment_status,
    },
    metadata: {
      provider: 'shopify',
      shopifyId: orderData.admin_graphql_api_id,
      shopifyOrderId: orderData.id.toString(),
    },
  });

  // 3. Create line items (Things)
  for (const lineItem of orderData.line_items) {
    const lineItemId = await ctx.db.insert('things', {
      type: 'order_line_item',
      groupId: shopId as Id<'groups'>,
      properties: {
        title: lineItem.title,
        quantity: lineItem.quantity,
        price: lineItem.price,
        sku: lineItem.sku,
      },
      metadata: {
        provider: 'shopify',
        shopifyLineItemId: lineItem.id.toString(),
        shopifyProductId: lineItem.product_id.toString(),
        shopifyVariantId: lineItem.variant_id.toString(),
      },
    });

    // Connection: order → contains → line_item
    await ctx.db.insert('connections', {
      fromEntityId: orderId,
      toEntityId: lineItemId,
      relationshipType: 'contains',
      metadata: {
        provider: 'shopify',
      },
    });
  }

  // 4. Create connection: customer → purchased → order
  await ctx.db.insert('connections', {
    fromEntityId: customerId,
    toEntityId: orderId,
    relationshipType: 'purchased',
    metadata: {
      provider: 'shopify',
      purchasedAt: orderData.created_at,
    },
  });

  // 5. Create event
  await ctx.db.insert('events', {
    type: 'order_created',
    actorId: customerId,
    targetId: orderId,
    timestamp: new Date(orderData.created_at).getTime(),
    metadata: {
      provider: 'shopify',
      shopifyOrderId: orderData.admin_graphql_api_id,
      orderNumber: orderData.name,
      totalPrice: orderData.total_price,
      currency: orderData.currency,
      webhookTopic: 'orders/create',
    },
  });
}
```

### Product Update Example

```typescript
async function handleProductUpdated(shop: string, productData: any) {
  const ctx = /* get Convex context */;

  // Update product (Thing)
  const existingProduct = await ctx.db
    .query('things')
    .filter(q =>
      q.and(
        q.eq(q.field('type'), 'product'),
        q.eq(q.field('metadata.shopifyId'), productData.admin_graphql_api_id)
      )
    )
    .first();

  if (!existingProduct) {
    console.warn('Product not found, creating...');
    // Handle creation
    return;
  }

  // Update product
  await ctx.db.patch(existingProduct._id, {
    properties: {
      title: productData.title,
      description: productData.body_html,
      status: productData.status,
      vendor: productData.vendor,
      productType: productData.product_type,
      tags: productData.tags.split(','),
    },
  });

  // Create event
  await ctx.db.insert('events', {
    type: 'product_updated',
    actorId: existingProduct._id, // Self-update
    targetId: existingProduct._id,
    timestamp: new Date(productData.updated_at).getTime(),
    metadata: {
      provider: 'shopify',
      shopifyProductId: productData.admin_graphql_api_id,
      changedFields: ['title', 'description', 'status'], // Track changes
      webhookTopic: 'products/update',
    },
  });
}
```

---

## Resources & References

**Official Documentation:**
- [About Webhooks](https://shopify.dev/docs/apps/build/webhooks)
- [Webhooks API Reference](https://shopify.dev/docs/api/webhooks)
- [HTTPS Webhook Delivery](https://shopify.dev/docs/apps/build/webhooks/subscribe/https)
- [Webhook Topics List](https://shopify.dev/docs/api/admin-rest/latest/resources/webhook)

**Tools:**
- [ngrok](https://ngrok.com) - Secure tunnels for local development
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) - Trigger test webhooks
- [Hookdeck](https://hookdeck.com) - Webhook debugging and reliability

---

## Summary

**Key Takeaways:**
1. ✅ Webhooks provide real-time notifications of store events
2. ✅ Always verify HMAC signatures (security)
3. ✅ Respond with 200 OK within 5 seconds
4. ✅ Process webhooks asynchronously (queue-based)
5. ✅ Handle duplicates idempotently (use webhook ID)
6. ✅ Handle out-of-order delivery (check timestamps)
7. ✅ Map webhooks to ONE events for unified event stream

**Implementation Checklist:**
- [ ] Create HTTPS webhook endpoint
- [ ] Implement HMAC verification
- [ ] Register webhooks via GraphQL API
- [ ] Queue webhooks for async processing
- [ ] Implement idempotent handlers
- [ ] Map webhooks to ONE events
- [ ] Test with ngrok during development
- [ ] Monitor webhook delivery and failures

---

## Next Steps

1. **Implement Webhook Endpoint:**
   - Create `/api/webhooks/shopify` endpoint
   - Add HMAC verification
   - Queue webhooks for processing

2. **Register Webhooks:**
   - Use GraphQL API to subscribe
   - Register all needed topics

3. **Build Event Handlers:**
   - Map each webhook to ONE event
   - Update Things, Connections, Events tables

4. **Test Integration:**
   - Use ngrok for local testing
   - Trigger test webhooks
   - Verify events in ONE Platform

5. **Read Next:**
   - [Shopify API Reference](./shopify-api-reference.md)
   - [Shopify Authentication](./shopify-auth.md)

---

**This documentation is part of the Shopify Integration for ONE Platform. See the 100-cycle plan in `/one/events/shopify-integration-plan.md` for implementation roadmap.**
