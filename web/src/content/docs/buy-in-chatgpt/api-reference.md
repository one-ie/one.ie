---
title: Buy in ChatGPT - API Reference
description: Complete API reference for all 5 ACP endpoints with request/response schemas, error codes, and examples
category: Buy in ChatGPT
order: 4
tags:
  - api
  - reference
  - endpoints
---

# Buy in ChatGPT - API Reference

Complete reference for all ACP (Agentic Commerce Protocol) endpoints.

## Base URL

```
https://yourdomain.com/api
```

## Authentication

All requests require API key authentication via the `Authorization` header:

```
Authorization: Bearer your_api_key_here
```

**Example:**

```bash
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer sk_commerce_xxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"product-1","quantity":1}]}'
```

## Common Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token for API authentication |
| `Content-Type` | Yes | `application/json` for all POST requests |
| `Idempotency-Key` | Recommended | Unique key to prevent duplicate requests |
| `Request-Id` | Optional | Client-generated request ID for tracking |

### Response Headers

| Header | Always Present | Description |
|--------|----------------|-------------|
| `Content-Type` | Yes | `application/json` |
| `Idempotency-Key` | If provided | Echoed from request |
| `Request-Id` | If provided | Echoed from request |

## Endpoints

### 1. Create Checkout Session

Initialize a new checkout session with line items.

**Endpoint:** `POST /checkout_sessions`

**Request Body:**

```typescript
{
  items: Array<{
    id: string;           // Product ID from catalog
    quantity: number;     // Must be >= 1
  }>;
  buyer?: {
    first_name?: string;  // Or fore_name (Stripe spec)
    last_name?: string;   // Or sur_name (Stripe spec)
    email?: string;
    phone_number?: string;
  };
  fulfillment_address?: {
    name: string;
    line_one: string;
    line_two?: string;
    city: string;
    state: string;        // 2-letter code (e.g., "CA")
    country: string;      // 2-letter code (e.g., "US")
    postal_code: string;
  };
}
```

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique_key_123" \
  -d '{
    "items": [
      {"id": "product-1", "quantity": 2},
      {"id": "product-2", "quantity": 1}
    ],
    "buyer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+14155551234"
    },
    "fulfillment_address": {
      "name": "John Doe",
      "line_one": "123 Main St",
      "line_two": "Apt 4B",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94102"
    }
  }'
```

**Success Response (201 Created):**

```json
{
  "id": "cs_1234567890abcdef",
  "buyer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "+14155551234"
  },
  "payment_provider": {
    "provider": "stripe",
    "supported_payment_methods": ["card"]
  },
  "status": "ready_for_payment",
  "currency": "usd",
  "line_items": [
    {
      "id": "li_abc123def456",
      "item": {
        "id": "product-1",
        "quantity": 2
      },
      "base_amount": 5000,
      "discount": 0,
      "subtotal": 10000,
      "tax": 800,
      "total": 10800
    },
    {
      "id": "li_ghi789jkl012",
      "item": {
        "id": "product-2",
        "quantity": 1
      },
      "base_amount": 7500,
      "discount": 0,
      "subtotal": 7500,
      "tax": 600,
      "total": 8100
    }
  ],
  "fulfillment_address": {
    "name": "John Doe",
    "line_one": "123 Main St",
    "line_two": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "postal_code": "94102"
  },
  "fulfillment_options": [
    {
      "type": "shipping",
      "id": "standard_shipping",
      "title": "Standard Shipping",
      "subtitle": "Arrives in 5-7 business days",
      "carrier_info": "USPS",
      "earliest_delivery_time": "2025-01-21T00:00:00Z",
      "latest_delivery_time": "2025-01-23T00:00:00Z",
      "subtotal": 900,
      "tax": 0,
      "total": 900
    },
    {
      "type": "shipping",
      "id": "express_shipping",
      "title": "Express Shipping",
      "subtitle": "Arrives in 1-2 business days",
      "carrier_info": "USPS",
      "earliest_delivery_time": "2025-01-16T00:00:00Z",
      "latest_delivery_time": "2025-01-17T00:00:00Z",
      "subtotal": 2100,
      "tax": 0,
      "total": 2100
    }
  ],
  "fulfillment_option_id": "standard_shipping",
  "totals": [
    {
      "type": "items_base_amount",
      "display_text": "Item(s) total",
      "amount": 17500
    },
    {
      "type": "subtotal",
      "display_text": "Subtotal",
      "amount": 17500
    },
    {
      "type": "fulfillment",
      "display_text": "Shipping",
      "amount": 900
    },
    {
      "type": "tax",
      "display_text": "Tax",
      "amount": 1400
    },
    {
      "type": "total",
      "display_text": "Total",
      "amount": 19800
    }
  ],
  "messages": [],
  "links": [
    {
      "type": "terms_of_use",
      "value": "https://yourdomain.com/terms"
    },
    {
      "type": "privacy_policy",
      "value": "https://yourdomain.com/privacy"
    }
  ]
}
```

**Error Responses:**

**401 Unauthorized:**

```json
{
  "type": "invalid_request",
  "code": "unauthorized",
  "message": "Invalid API key"
}
```

**400 Bad Request (Missing Items):**

```json
{
  "type": "invalid_request",
  "code": "missing",
  "message": "Items array is required and must not be empty",
  "param": "items"
}
```

**400 Bad Request (Invalid Product):**

```json
{
  "type": "invalid_request",
  "code": "invalid",
  "message": "Product product-999 not found",
  "param": "items"
}
```

**400 Bad Request (Out of Stock):**

```json
{
  "type": "invalid_request",
  "code": "invalid",
  "message": "Product product-1 is out of stock",
  "param": "items"
}
```

---

### 2. Update Checkout Session

Update buyer information, address, or selected fulfillment option.

**Endpoint:** `POST /checkout_sessions/{id}` or `PUT /checkout_sessions/{id}`

**Note:** Both POST and PUT are supported for compatibility.

**Request Body:**

```typescript
{
  buyer?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  };
  fulfillment_address?: {
    name: string;
    line_one: string;
    line_two?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  fulfillment_option_id?: string;  // ID from fulfillment_options
}
```

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/checkout_sessions/cs_1234567890abcdef \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "fulfillment_option_id": "express_shipping"
  }'
```

**Success Response (200 OK):**

Same structure as Create response, with updated values and recalculated tax/shipping.

**Error Responses:**

**404 Not Found:**

```json
{
  "type": "invalid_request",
  "code": "not_found",
  "message": "Checkout session cs_invalid not found"
}
```

**409 Conflict (Already Completed):**

```json
{
  "type": "invalid_request",
  "code": "conflict",
  "message": "Cannot update completed checkout session"
}
```

---

### 3. Retrieve Checkout Session

Get current state of checkout session.

**Endpoint:** `GET /checkout_sessions/{id}`

**Example Request:**

```bash
curl https://yourdomain.com/api/checkout_sessions/cs_1234567890abcdef \
  -H "Authorization: Bearer your_api_key"
```

**Success Response (200 OK):**

Same structure as Create response.

**Error Responses:**

**404 Not Found:**

```json
{
  "type": "invalid_request",
  "code": "not_found",
  "message": "Checkout session cs_invalid not found"
}
```

---

### 4. Complete Checkout Session

Finalize purchase using Stripe Shared Payment Token.

**Endpoint:** `POST /checkout_sessions/{id}/complete`

**Request Body:**

```typescript
{
  shared_payment_granted_token: string;  // From ChatGPT/Stripe
}
```

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/checkout_sessions/cs_1234567890abcdef/complete \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "shared_payment_granted_token": "spt_1234567890abcdef"
  }'
```

**Success Response (200 OK):**

```json
{
  "id": "cs_1234567890abcdef",
  "status": "completed",
  "order": {
    "id": "order_9876543210",
    "status": "confirmed",
    "payment_status": "paid",
    "fulfillment_status": "pending",
    "created_at": "2025-01-14T12:00:00Z",
    "total_amount": 19800,
    "currency": "usd",
    "tracking_number": null,
    "confirmation_url": "https://yourdomain.com/orders/order_9876543210"
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

**Error Responses:**

**400 Bad Request (Session Not Ready):**

```json
{
  "type": "invalid_request",
  "code": "invalid",
  "message": "Session not ready for payment. Please add fulfillment address first.",
  "param": "status"
}
```

**402 Payment Required (Payment Failed):**

```json
{
  "type": "payment_error",
  "code": "card_declined",
  "message": "Your card was declined. Please try a different payment method.",
  "decline_code": "insufficient_funds"
}
```

**404 Not Found:**

```json
{
  "type": "invalid_request",
  "code": "not_found",
  "message": "Checkout session cs_invalid not found"
}
```

**409 Conflict (Already Completed):**

```json
{
  "type": "invalid_request",
  "code": "conflict",
  "message": "Checkout session already completed"
}
```

---

### 5. Cancel Checkout Session

Cancel checkout session (user abandoned or changed mind).

**Endpoint:** `POST /checkout_sessions/{id}/cancel`

**Request Body (Optional):**

```typescript
{
  reason?: string;  // "user_canceled" | "timeout" | "inventory_unavailable"
}
```

**Example Request:**

```bash
curl -X POST https://yourdomain.com/api/checkout_sessions/cs_1234567890abcdef/cancel \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "user_canceled"
  }'
```

**Success Response (200 OK):**

```json
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

**Error Responses:**

**404 Not Found:**

```json
{
  "type": "invalid_request",
  "code": "not_found",
  "message": "Checkout session cs_invalid not found"
}
```

**409 Conflict (Already Completed):**

```json
{
  "type": "invalid_request",
  "code": "conflict",
  "message": "Cannot cancel completed checkout session"
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request succeeded |
| `201` | Created | Session created successfully |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Invalid or missing API key |
| `402` | Payment Required | Payment failed |
| `404` | Not Found | Session not found |
| `409` | Conflict | Session already completed/canceled |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Error Types

| Type | Description |
|------|-------------|
| `invalid_request` | Invalid parameters or missing required fields |
| `payment_error` | Payment processing failed |
| `authentication_error` | API key invalid or missing |
| `rate_limit_error` | Too many requests |
| `api_error` | Internal server error |

### Error Codes

| Code | Description |
|------|-------------|
| `unauthorized` | Invalid API key |
| `missing` | Required parameter missing |
| `invalid` | Parameter value invalid |
| `not_found` | Resource not found |
| `conflict` | Resource state conflict |
| `out_of_stock` | Product unavailable |
| `card_declined` | Payment card declined |
| `insufficient_funds` | Insufficient funds |
| `expired_card` | Card expired |
| `incorrect_cvc` | Invalid CVC code |

### Error Response Structure

```typescript
{
  type: string;        // Error type
  code: string;        // Specific error code
  message: string;     // Human-readable message
  param?: string;      // Parameter that caused error (RFC 9535 JSONPath)
  decline_code?: string;  // Payment decline reason (if applicable)
}
```

**Example:**

```json
{
  "type": "invalid_request",
  "code": "invalid",
  "message": "Quantity must be greater than 0",
  "param": "items[0].quantity"
}
```

---

## Rate Limits

**Default Limits:**

- **100 requests per minute** per API key
- **1000 requests per hour** per API key
- **10,000 requests per day** per API key

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704844800
```

**Rate Limit Exceeded Response (429):**

```json
{
  "type": "rate_limit_error",
  "code": "rate_limit_exceeded",
  "message": "Rate limit exceeded. Please try again in 60 seconds.",
  "retry_after": 60
}
```

---

## Idempotency

Prevent duplicate requests by including an `Idempotency-Key` header:

```bash
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer your_api_key" \
  -H "Idempotency-Key: unique_key_123" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"product-1","quantity":1}]}'
```

**Behavior:**

- Same `Idempotency-Key` = Same response (cached for 24 hours)
- Different `Idempotency-Key` = New request processed
- No `Idempotency-Key` = No idempotency guarantee

**Use Cases:**

- Network failures (retry without duplicate)
- Concurrent requests (prevent double checkout)
- Integration testing (replay requests)

---

## Webhooks

Listen for payment confirmation events:

**Endpoint:** `POST /api/webhooks/stripe`

**Headers:**

```
Stripe-Signature: t=1704844800,v1=signature_here
```

**Event Types:**

| Event | Description |
|-------|-------------|
| `payment_intent.succeeded` | Payment completed successfully |
| `payment_intent.payment_failed` | Payment failed |
| `charge.refunded` | Payment refunded |

**Event Structure:**

```json
{
  "id": "evt_1234567890",
  "type": "payment_intent.succeeded",
  "created": 1704844800,
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 19800,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "orderId": "order_9876543210",
        "sessionId": "cs_1234567890abcdef"
      }
    }
  }
}
```

**Webhook Security:**

Always verify signature using Stripe SDK:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);

// event is verified and safe to process
```

---

## Field Reference

### CheckoutSession Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique session ID |
| `buyer` | object | Buyer information |
| `payment_provider` | object | Payment provider details |
| `status` | string | Session status |
| `currency` | string | 3-letter ISO code (e.g., "usd") |
| `line_items` | array | Cart items with pricing |
| `fulfillment_address` | object | Shipping address |
| `fulfillment_options` | array | Available shipping methods |
| `fulfillment_option_id` | string | Selected shipping method |
| `totals` | array | Price breakdown |
| `messages` | array | Info/error messages |
| `links` | array | Related URLs (terms, privacy) |

### LineItem Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique line item ID |
| `item.id` | string | Product ID |
| `item.quantity` | number | Quantity ordered |
| `base_amount` | number | Unit price (cents) |
| `discount` | number | Discount applied (cents) |
| `subtotal` | number | base_amount × quantity - discount |
| `tax` | number | Tax amount (cents) |
| `total` | number | subtotal + tax |

### Total Object

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Total type (items_base_amount, subtotal, fulfillment, tax, total) |
| `display_text` | string | Label for UI (e.g., "Item(s) total") |
| `amount` | number | Amount in cents |

### Order Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique order ID |
| `status` | string | Order status (confirmed, processing, shipped, delivered) |
| `payment_status` | string | Payment status (paid, pending, failed, refunded) |
| `fulfillment_status` | string | Fulfillment status (pending, shipped, delivered) |
| `created_at` | string | ISO 8601 timestamp |
| `total_amount` | number | Total in cents |
| `currency` | string | 3-letter ISO code |
| `tracking_number` | string | Shipment tracking number (null until shipped) |
| `confirmation_url` | string | Order confirmation page URL |

---

## Examples

### Complete Purchase Flow

```bash
# 1. Create session
SESSION_ID=$(curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"product-1","quantity":1}]}' \
  | jq -r '.id')

# 2. Add address
curl -X POST https://yourdomain.com/api/checkout_sessions/$SESSION_ID \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fulfillment_address": {
      "name": "John Doe",
      "line_one": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "US",
      "postal_code": "94102"
    }
  }'

# 3. Select express shipping
curl -X POST https://yourdomain.com/api/checkout_sessions/$SESSION_ID \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fulfillment_option_id":"express_shipping"}'

# 4. Complete with SPT
curl -X POST https://yourdomain.com/api/checkout_sessions/$SESSION_ID/complete \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"shared_payment_granted_token":"spt_test_token"}'
```

---

**Next:** [Stripe Integration](/docs/buy-in-chatgpt/stripe-integration) for SPT payment details.
