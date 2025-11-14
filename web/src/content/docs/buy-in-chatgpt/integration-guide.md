---
title: Buy in ChatGPT - Integration Guide
description: Step-by-step integration instructions from setup to production deployment
category: Buy in ChatGPT
order: 3
tags:
  - integration
  - setup
  - tutorial
---

# Buy in ChatGPT - Integration Guide

Complete step-by-step guide to integrate Buy in ChatGPT into your e-commerce platform.

## Prerequisites

Before starting, ensure you have:

- [ ] **Stripe Account** (test mode enabled)
- [ ] **Product Catalog** (minimum 3 products with images)
- [ ] **HTTPS Domain** (required for webhooks and ChatGPT)
- [ ] **Node.js 18+** (for development)
- [ ] **API Development Experience** (REST APIs, webhooks)

**Time Estimate:** 2-4 hours for complete integration

## Step 1: Environment Setup

### 1.1 Install Dependencies

```bash
# ONE Platform (if using our stack)
cd web/
bun install

# Or add to existing project
npm install stripe nanoid
npm install -D @types/node
```

### 1.2 Configure Environment Variables

Create `/web/.env.local`:

```bash
# Stripe Keys (get from dashboard.stripe.com)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Commerce API (generate random key)
COMMERCE_API_KEY=your_secure_api_key_change_in_production

# Base URL (your domain)
PUBLIC_BASE_URL=https://yourdomain.com

# Convex (if using our backend)
CONVEX_URL=https://your-convex-deployment.convex.cloud
```

**Security Rules:**

- NEVER commit `.env.local` to Git
- Use different keys for test vs production
- Rotate API keys quarterly
- Store secrets in environment (not code)

### 1.3 Verify Stripe Account

1. Visit [dashboard.stripe.com](https://dashboard.stripe.com)
2. Toggle **Test mode** ON (top right)
3. Navigate to **Developers → API Keys**
4. Copy **Publishable key** (starts with `pk_test_`)
5. Copy **Secret key** (starts with `sk_test_`)

**Test your keys:**

```bash
# Should return your account info
curl https://api.stripe.com/v1/balance \
  -u sk_test_xxxxxxxxxxxxxxxxxxxxx:
```

## Step 2: API Key Configuration

### 2.1 Generate Commerce API Key

Your commerce API key protects ACP endpoints from unauthorized access.

```bash
# Generate secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output to `COMMERCE_API_KEY` in `.env.local`.

### 2.2 Test API Authentication

```bash
# Should return 401 Unauthorized
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Content-Type: application/json" \
  -d '{}'

# Should return 201 Created
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{"items":[{"id":"product-1","quantity":1}]}'
```

## Step 3: Product Catalog Setup

### 3.1 Product Data Structure

Each product needs these required fields:

```typescript
{
  // Required
  id: string,              // Unique product ID
  title: string,           // Product name
  description: string,     // Full description
  price: number,           // Price in dollars
  imageUrl: string,        // HTTPS image URL
  inStock: boolean,        // Availability

  // Recommended
  category: string,        // "Sports > Padel > Rackets"
  brand: string,           // Manufacturer
  rating: number,          // 0-5 scale
  reviewCount: number,     // Number of reviews
  attributes: object,      // Category-specific fields
}
```

### 3.2 Create Product Feed

**Option A: Static Data (Development)**

Create `/lib/data/products.ts`:

```typescript
export const products = [
  {
    id: "product-1",
    title: "Example Product",
    description: "A great product for...",
    price: 49.99,
    imageUrl: "https://yourdomain.com/images/product-1.jpg",
    inStock: true,
    category: "Category > Subcategory",
    brand: "Brand Name",
    rating: 4.8,
    reviewCount: 127,
    attributes: {
      weight: "365g",
      material: "Carbon fiber",
      skill_level: "Intermediate",
    },
  },
  // ... more products
];

export function getProductById(id: string) {
  return products.find(p => p.id === id);
}

export function getAllProducts() {
  return products;
}
```

**Option B: Database (Production)**

Use Convex queries:

```typescript
// convex/queries/products.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("things")
      .filter(q =>
        q.and(
          q.eq(q.field("groupId"), args.groupId),
          q.eq(q.field("type"), "product"),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();
  },
});

export const get = query({
  args: { id: v.id("things") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### 3.3 Implement Product Feed Endpoint

Create `/pages/api/commerce/feed.json.ts`:

```typescript
import type { APIRoute } from 'astro';
import { getAllProducts } from '@/lib/data/products';
import type { ProductFeed } from '@/lib/types/product-feed';

export const GET: APIRoute = async () => {
  const products = getAllProducts();

  const feed: ProductFeed = {
    meta: {
      generated_at: new Date().toISOString(),
      total_products: products.length,
      format: 'json',
      version: '1.0.0',
      merchant: {
        name: 'Your Store Name',
        id: 'merchant_123',
        url: 'https://yourdomain.com',
      },
    },
    products: products.map(p => ({
      // OpenAI flags
      enable_search: true,
      enable_checkout: true,

      // Basic info
      id: p.id,
      title: p.title,
      description: p.description,
      link: `https://yourdomain.com/products/${p.id}`,

      // Media
      image_link: p.imageUrl,

      // Pricing
      price: `${p.price.toFixed(2)} USD`,

      // Availability
      availability: p.inStock ? 'in_stock' : 'out_of_stock',
      inventory_quantity: p.inStock ? 100 : 0,

      // Category
      product_category: p.category,
      brand: p.brand,

      // Merchant
      seller_name: 'Your Store Name',
      seller_url: 'https://yourdomain.com',
      seller_privacy_policy: 'https://yourdomain.com/privacy',
      seller_tos: 'https://yourdomain.com/terms',

      // Returns
      return_policy: 'https://yourdomain.com/returns',
      return_window: 30,

      // Reviews
      product_review_count: p.reviewCount,
      product_review_rating: p.rating,

      // Weight (required)
      weight: p.attributes?.weight || '1lb',
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=900', // 15-minute cache
    },
  });
};
```

**Test the feed:**

```bash
curl https://yourdomain.com/api/commerce/feed.json | jq .
```

## Step 4: ACP Endpoint Implementation

### 4.1 Copy Reference Implementation

ONE Platform provides complete ACP endpoint implementations:

```bash
# Copy ACP endpoints
cp -r /path/to/ONE/web/src/pages/api/checkout_sessions* your-project/src/pages/api/

# Copy Stripe helpers
cp /path/to/ONE/web/src/lib/stripe/agentic-commerce.ts your-project/src/lib/stripe/

# Copy types
cp /path/to/ONE/web/src/lib/types/agentic-checkout.ts your-project/src/lib/types/
```

### 4.2 Customize for Your Products

Edit `/pages/api/checkout_sessions.ts`:

```typescript
// Replace mock product lookup with your data source
import { getProductById } from '@/lib/data/products';  // Your import

function buildLineItems(items) {
  const lineItems = [];

  for (const item of items) {
    const product = getProductById(item.id);  // Your function

    if (!product) {
      return { error: `Product ${item.id} not found` };
    }

    // ... rest of implementation
  }

  return { lineItems, itemsBaseAmount };
}
```

### 4.3 Implement Shipping Calculator

Customize shipping logic in `/lib/stripe/agentic-commerce.ts`:

```typescript
export function calculateShipping(items, address) {
  // Option 1: Flat rate
  return {
    standard: 500,   // $5.00
    express: 1500,   // $15.00
  };

  // Option 2: Weight-based
  const totalWeight = items.reduce((sum, item) => {
    const product = getProductById(item.id);
    return sum + (product.weight * item.quantity);
  }, 0);

  const standardRate = totalWeight * 0.50;  // $0.50 per lb
  const expressRate = totalWeight * 1.50;   // $1.50 per lb

  return {
    standard: Math.round(standardRate * 100),
    express: Math.round(expressRate * 100),
  };

  // Option 3: Real-time rates (Shippo/EasyPost)
  const rates = await fetch('https://api.shippo.com/rates', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.SHIPPO_API_KEY}` },
    body: JSON.stringify({ /* ... */ }),
  }).then(r => r.json());

  return {
    standard: rates.find(r => r.service === 'USPS_GROUND').amount * 100,
    express: rates.find(r => r.service === 'USPS_PRIORITY').amount * 100,
  };
}
```

### 4.4 Implement Tax Calculator

```typescript
export function calculateTax(subtotal, shippingCost, state) {
  // Option 1: Flat rate (simple)
  const taxRate = 0.08;  // 8%
  return Math.round((subtotal + shippingCost) * taxRate);

  // Option 2: State-specific rates
  const stateTaxRates = {
    CA: 0.0725,  // California 7.25%
    NY: 0.04,    // New York 4%
    TX: 0.0625,  // Texas 6.25%
    // ... all states
  };

  const rate = stateTaxRates[state] || 0;
  return Math.round((subtotal + shippingCost) * rate);

  // Option 3: Stripe Tax (automatic, accurate)
  const taxCalculation = await stripe.tax.calculations.create({
    currency: 'usd',
    line_items: [
      {
        amount: subtotal,
        reference: 'products',
      },
      {
        amount: shippingCost,
        reference: 'shipping',
      },
    ],
    customer_details: {
      address: {
        line1: address.line_one,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        country: address.country,
      },
      address_source: 'shipping',
    },
  });

  return taxCalculation.tax_amount_exclusive;
}
```

## Step 5: Webhook Setup

### 5.1 Create Webhook Endpoint

Create `/pages/api/webhooks/stripe.ts`:

```typescript
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe/agentic-commerce';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(
      body,
      signature,
      import.meta.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Webhook received:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        // Update order status
        const orderId = paymentIntent.metadata.orderId;
        if (orderId) {
          await updateOrderStatus(orderId, 'paid');
          await sendOrderConfirmationEmail(orderId);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedIntent.id);

        // Notify customer
        const failedOrderId = failedIntent.metadata.orderId;
        if (failedOrderId) {
          await updateOrderStatus(failedOrderId, 'payment_failed');
          await sendPaymentFailedEmail(failedOrderId);
        }
        break;

      case 'charge.refunded':
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);

        // Update order status
        const refundedOrderId = charge.metadata.orderId;
        if (refundedOrderId) {
          await updateOrderStatus(refundedOrderId, 'refunded');
        }
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);

    return new Response(
      JSON.stringify({ error: 'Webhook verification failed' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

async function updateOrderStatus(orderId: string, status: string) {
  // TODO: Update in your database
  console.log(`Update order ${orderId} to status: ${status}`);
}

async function sendOrderConfirmationEmail(orderId: string) {
  // TODO: Send email via SendGrid/Postmark/etc
  console.log(`Send confirmation email for order ${orderId}`);
}

async function sendPaymentFailedEmail(orderId: string) {
  // TODO: Send email
  console.log(`Send payment failed email for order ${orderId}`);
}
```

### 5.2 Register Webhook with Stripe

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev
stripe listen --forward-to http://localhost:4321/api/webhooks/stripe

# Copy webhook signing secret to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**For production:**

1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy signing secret to production environment

## Step 6: Testing Checklist

### 6.1 Unit Tests

Test individual components:

```bash
# Test product feed
curl https://yourdomain.com/api/commerce/feed.json | jq '.products | length'

# Test create session
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key" \
  -d '{
    "items": [{"id": "product-1", "quantity": 1}]
  }' | jq .

# Test retrieve session
curl https://yourdomain.com/api/checkout_sessions/cs_123 \
  -H "Authorization: Bearer your_api_key" | jq .
```

### 6.2 Integration Tests

Test complete flow:

```typescript
// test/integration/checkout.test.ts
import { test, expect } from 'vitest';

test('Complete checkout flow', async () => {
  // 1. Create session
  const createResponse = await fetch('/api/checkout_sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_key',
    },
    body: JSON.stringify({
      items: [{ id: 'product-1', quantity: 1 }],
    }),
  });

  expect(createResponse.status).toBe(201);
  const session = await createResponse.json();
  expect(session.id).toBeDefined();

  // 2. Update with address
  const updateResponse = await fetch(`/api/checkout_sessions/${session.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_key',
    },
    body: JSON.stringify({
      fulfillment_address: {
        name: 'Test User',
        line_one: '123 Test St',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        postal_code: '94102',
      },
    }),
  });

  expect(updateResponse.status).toBe(200);
  const updatedSession = await updateResponse.json();
  expect(updatedSession.status).toBe('ready_for_payment');

  // 3. Complete with test SPT
  const completeResponse = await fetch(
    `/api/checkout_sessions/${session.id}/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_key',
      },
      body: JSON.stringify({
        shared_payment_granted_token: 'spt_test_token',
      }),
    }
  );

  expect(completeResponse.status).toBe(200);
  const completed = await completeResponse.json();
  expect(completed.status).toBe('completed');
  expect(completed.order).toBeDefined();
});
```

### 6.3 Stripe Test Cards

Use these test cards for payment testing:

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | 3D Secure authentication required |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0069` | Expired card |

**For all cards:**
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

## Step 7: Go-Live Checklist

### 7.1 Pre-Launch Checks

- [ ] **Stripe account verified** (business details submitted)
- [ ] **Live API keys configured** (pk_live_, sk_live_)
- [ ] **HTTPS enabled** (SSL certificate installed)
- [ ] **Product feed accessible** (returns 200 OK)
- [ ] **All 5 ACP endpoints tested** (create, update, retrieve, complete, cancel)
- [ ] **Webhooks registered** (production URL)
- [ ] **Error handling implemented** (try/catch, user-friendly messages)
- [ ] **Logging configured** (track errors and transactions)
- [ ] **Rate limiting enabled** (prevent abuse)
- [ ] **CORS configured** (if needed)

### 7.2 Security Audit

- [ ] **API keys in environment** (not in code)
- [ ] **Webhook signatures verified** (all webhooks)
- [ ] **HTTPS enforced** (all endpoints)
- [ ] **Input validation** (all user inputs)
- [ ] **SQL injection prevention** (parameterized queries)
- [ ] **XSS prevention** (sanitize outputs)
- [ ] **CSRF protection** (if using forms)
- [ ] **Rate limiting** (prevent brute force)

### 7.3 Performance Check

- [ ] **Product feed < 200ms** (measured)
- [ ] **Checkout endpoints < 1s** (measured)
- [ ] **CDN configured** (for images)
- [ ] **Database indexed** (common queries)
- [ ] **Caching enabled** (product feed, sessions)
- [ ] **Load testing completed** (100+ concurrent users)

### 7.4 Legal Compliance

- [ ] **Terms of Service** (accessible URL)
- [ ] **Privacy Policy** (accessible URL)
- [ ] **Return Policy** (accessible URL)
- [ ] **GDPR compliance** (if serving EU)
- [ ] **PCI compliance** (via Stripe)
- [ ] **Tax collection** (if required in your region)

### 7.5 Monitoring Setup

- [ ] **Error tracking** (Sentry, LogRocket, etc.)
- [ ] **Performance monitoring** (New Relic, Datadog, etc.)
- [ ] **Uptime monitoring** (Pingdom, UptimeRobot, etc.)
- [ ] **Analytics tracking** (conversion rate, revenue, etc.)
- [ ] **Alerts configured** (payment failures, errors, downtime)

## Step 8: Deploy to Production

### 8.1 Update Environment Variables

Production `.env`:

```bash
# Stripe Live Keys
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Commerce API
COMMERCE_API_KEY=your_production_api_key

# Base URL
PUBLIC_BASE_URL=https://yourdomain.com

# Convex
CONVEX_URL=https://your-production.convex.cloud
```

### 8.2 Deploy Application

```bash
# Build for production
cd web/
bun run build

# Deploy (example: Cloudflare Pages)
wrangler pages deploy dist

# Or deploy via CI/CD pipeline
git push origin main  # Triggers deployment
```

### 8.3 Verify Deployment

```bash
# Test product feed
curl https://yourdomain.com/api/commerce/feed.json | jq .

# Test create session (should work)
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_production_api_key" \
  -d '{"items":[{"id":"product-1","quantity":1}]}' | jq .

# Test without auth (should fail)
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Common Issues & Solutions

### Issue: "Product not found"

**Cause:** Product ID in request doesn't match catalog

**Solution:**
1. Check product feed: `curl /api/commerce/feed.json | jq '.products[].id'`
2. Verify product IDs match exactly (case-sensitive)
3. Ensure product status is "active"

### Issue: "Webhook signature verification failed"

**Cause:** Wrong webhook secret or raw body modified

**Solution:**
1. Use raw request body (not parsed JSON)
2. Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
3. Check Stripe webhook logs for details

### Issue: "Session not ready for payment"

**Cause:** Missing fulfillment address

**Solution:**
1. Update session with address first
2. Verify `status === 'ready_for_payment'` before completing
3. Check tax calculation doesn't fail

### Issue: "SPT payment failed"

**Cause:** SPT expired, amount mismatch, or already used

**Solution:**
1. SPTs expire after 15 minutes - get fresh token
2. Verify amount matches exactly (in cents)
3. SPTs are single-use - can't reuse same token

---

**Next:** [API Reference](/docs/buy-in-chatgpt/api-reference) for complete endpoint documentation.
