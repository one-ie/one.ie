---
title: Buy in ChatGPT - Troubleshooting
description: Common issues and solutions for build errors, API errors, payment failures, webhook problems, and debug mode
category: Buy in ChatGPT
order: 7
tags:
  - troubleshooting
  - debugging
  - errors
  - solutions
---

# Troubleshooting Guide

Common issues and solutions for Buy in ChatGPT integration.

## Quick Diagnosis

```bash
# Test your setup
curl https://yourdomain.com/api/commerce/feed.json | jq .         # Product feed
curl https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer your_api_key" \
  -d '{"items":[{"id":"product-1","quantity":1}]}'                 # Checkout API
```

If both return valid JSON, your integration is working.

---

## Build Errors

### Error: "Module not found: stripe"

**Cause:** Stripe SDK not installed

**Solution:**

```bash
npm install stripe
# or
bun add stripe
```

**Verify:**

```bash
npm list stripe
# Should show: stripe@X.X.X
```

### Error: "Cannot find module '@/lib/stripe/agentic-commerce'"

**Cause:** Missing import alias or file doesn't exist

**Solution:**

1. **Check file exists:**

```bash
ls web/src/lib/stripe/agentic-commerce.ts
# Should exist
```

2. **Verify tsconfig.json alias:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. **Restart dev server:**

```bash
bun run dev
```

### Error: "Property 'shared_payment_granted_token' does not exist on type 'PaymentIntentCreateParams'"

**Cause:** Old Stripe SDK version

**Solution:**

```bash
# Upgrade to latest
npm install stripe@latest

# Verify version (need 13.0.0+)
npm list stripe
```

**If still failing:**

```typescript
// Temporary workaround
const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency,
  // @ts-ignore - Stripe SDK types not updated yet
  shared_payment_granted_token: sharedPaymentToken,
  confirm: true,
} as any);
```

### Error: "Missing environment variable: STRIPE_SECRET_KEY"

**Cause:** Environment variables not loaded

**Solution:**

1. **Create `.env.local`:**

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

2. **Verify file exists:**

```bash
ls web/.env.local
# Should exist
```

3. **Restart dev server:**

```bash
bun run dev
```

4. **Check it loaded:**

```typescript
console.log('Stripe key:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Missing');
```

---

## API Errors

### Error: "401 Unauthorized"

**Cause:** Invalid or missing API key

**Solution:**

1. **Check Authorization header:**

```bash
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \  # ← Must include "Bearer "
  -d '{"items":[{"id":"product-1","quantity":1}]}'
```

2. **Verify API key matches environment:**

```bash
echo $COMMERCE_API_KEY
# Should match the key you're using
```

3. **Check header format:**

```
✓ "Authorization: Bearer sk_commerce_xxxxxxxxxxxxxxxxxxxxx"
✗ "Authorization: sk_commerce_xxxxxxxxxxxxxxxxxxxxx"  // Missing "Bearer "
✗ "X-API-Key: sk_commerce_xxxxxxxxxxxxxxxxxxxxx"      // Wrong header name
```

### Error: "400 Bad Request: Product not found"

**Cause:** Product ID doesn't exist in catalog

**Solution:**

1. **List all product IDs:**

```bash
curl https://yourdomain.com/api/commerce/feed.json | jq '.products[].id'
```

2. **Verify ID matches exactly:**

```bash
# Case-sensitive!
"product-1" ≠ "Product-1"
"product-1" ≠ "product_1"
```

3. **Check product status:**

```typescript
// Ensure product is active
{
  id: 'product-1',
  availability: 'in_stock',  // ← Must be in_stock
  enable_checkout: true,     // ← Must be true
}
```

### Error: "400 Bad Request: Items array is required"

**Cause:** Missing or empty items array

**Solution:**

```typescript
// ✗ Wrong
{
  items: []  // Empty array
}

// ✗ Wrong
{
  // Missing items field
}

// ✓ Correct
{
  items: [
    { id: 'product-1', quantity: 1 }
  ]
}
```

### Error: "404 Not Found: Checkout session not found"

**Cause:** Session ID doesn't exist or expired

**Solution:**

1. **Verify session ID:**

```bash
# Create session
SESSION_ID=$(curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer your_api_key" \
  -d '{"items":[{"id":"product-1","quantity":1}]}' \
  | jq -r '.id')

echo $SESSION_ID
# Should be cs_xxxxxxxxxxxxxxxxxxxxx
```

2. **Check session expiration:**

Sessions expire after 1 hour by default.

3. **Verify session storage:**

```typescript
// If using in-memory storage, sessions reset on server restart
// Solution: Use database (Convex) for persistence
```

### Error: "409 Conflict: Session already completed"

**Cause:** Attempting to update/complete already-completed session

**Solution:**

1. **Check session status:**

```bash
curl https://yourdomain.com/api/checkout_sessions/cs_xxx \
  -H "Authorization: Bearer your_api_key" \
  | jq '.status'
```

2. **Don't reuse sessions:**

```typescript
// ✗ Wrong
completeSession('cs_123');  // First time
completeSession('cs_123');  // Error! Already completed

// ✓ Correct
createNewSession();         // Create fresh session
completeSession(newId);     // Complete new session
```

---

## Payment Failures

### Error: "402 Payment Required: Card declined"

**Cause:** Payment method declined by bank

**Solution:**

1. **Check decline reason:**

```typescript
{
  type: 'payment_error',
  code: 'card_declined',
  decline_code: 'insufficient_funds'  // ← Reason
}
```

**Common decline codes:**

- `insufficient_funds` - Not enough money
- `expired_card` - Card expired
- `incorrect_cvc` - Wrong security code
- `card_not_supported` - Card type not accepted
- `do_not_honor` - Bank declined (call bank)

2. **Test cards in development:**

```bash
# Use test cards
pm_card_visa           # Success
pm_card_declinedInsufficientFunds  # Declined
```

3. **Check production setup:**

```bash
# Verify live keys (not test keys)
echo $STRIPE_SECRET_KEY | grep "sk_live_"
# Should start with sk_live_ in production
```

### Error: "Invalid SPT token"

**Cause:** SPT expired, already used, or amount mismatch

**Solution:**

1. **Check SPT age:**

SPTs expire after 15 minutes.

```typescript
// Get fresh SPT
const spt = await createTestSPT({
  amount: 5900,
  currency: 'usd',
});

// Use immediately
await completeCheckout(sessionId, spt);
```

2. **Verify amount matches:**

```typescript
// SPT created for $59.00
const spt = await createTestSPT({ amount: 5900 });

// ✗ Wrong - different amount
await charge({ amount: 10000, spt });  // Error!

// ✓ Correct - same amount
await charge({ amount: 5900, spt });   // Success
```

3. **Don't reuse SPTs:**

```typescript
// SPTs are single-use
const spt = await createTestSPT({ amount: 5900 });

await charge({ amount: 5900, spt });  // ✓ Success
await charge({ amount: 5900, spt });  // ✗ Error! Already used
```

### Error: "Payment Intent creation failed"

**Cause:** Stripe API error or network issue

**Solution:**

1. **Check Stripe API status:**

Visit [status.stripe.com](https://status.stripe.com)

2. **Verify API key:**

```bash
curl https://api.stripe.com/v1/balance \
  -u sk_test_xxxxxxxxxxxxxxxxxxxxx:
# Should return balance, not error
```

3. **Check network:**

```bash
curl -I https://api.stripe.com
# Should return 200 OK
```

4. **Implement retry logic:**

```typescript
async function createPaymentIntentWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await stripe.paymentIntents.create(params);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i));  // Exponential backoff
    }
  }
}
```

---

## Webhook Issues

### Error: "Webhook signature verification failed"

**Cause:** Wrong secret, raw body modified, or replay attack

**Solution:**

1. **Use raw request body:**

```typescript
// ✗ Wrong - body already parsed
const body = await request.json();
const event = stripe.webhooks.constructEvent(body, signature, secret);

// ✓ Correct - raw body text
const body = await request.text();
const event = stripe.webhooks.constructEvent(body, signature, secret);
```

2. **Verify webhook secret:**

```bash
# Get from Stripe Dashboard → Webhooks → Select endpoint → Signing secret
echo $STRIPE_WEBHOOK_SECRET
# Should be whsec_xxxxxxxxxxxxxxxxxxxxx
```

3. **Check signature header:**

```typescript
const signature = request.headers.get('stripe-signature');
console.log('Signature:', signature);
// Should be: t=1234567890,v1=abc123...
```

### Error: "Webhook endpoint not found (404)"

**Cause:** Wrong webhook URL configured in Stripe

**Solution:**

1. **Verify endpoint exists:**

```bash
curl -X POST https://yourdomain.com/api/webhooks/stripe
# Should return 400 (missing signature), not 404
```

2. **Check Stripe webhook settings:**

Dashboard → Webhooks → Endpoint URL should be:
`https://yourdomain.com/api/webhooks/stripe`

3. **Test locally with Stripe CLI:**

```bash
stripe listen --forward-to http://localhost:4321/api/webhooks/stripe
```

### Error: "Webhook timeout"

**Cause:** Webhook handler takes too long (>30s)

**Solution:**

1. **Return 200 immediately:**

```typescript
export const POST: APIRoute = async ({ request }) => {
  const event = verifyWebhook(request);

  // Return 200 immediately
  const response = new Response(JSON.stringify({ received: true }), {
    status: 200,
  });

  // Process async (don't await)
  processWebhookAsync(event);

  return response;
};
```

2. **Use queue for heavy processing:**

```typescript
// Queue webhook for background processing
await queue.add('webhook', { eventId: event.id });

// Return immediately
return new Response(JSON.stringify({ queued: true }), {
  status: 200,
});
```

### Error: "Duplicate webhook events"

**Cause:** Stripe retries failed webhooks

**Solution:**

**Implement idempotency:**

```typescript
const processedEvents = new Set();

export const POST: APIRoute = async ({ request }) => {
  const event = verifyWebhook(request);

  // Check if already processed
  if (processedEvents.has(event.id)) {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  }

  // Process event
  await handleEvent(event);

  // Mark as processed
  processedEvents.add(event.id);

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
  });
};
```

**Better: Use database:**

```typescript
const processed = await db.query.webhookEvents.findFirst({
  where: eq(webhookEvents.eventId, event.id),
});

if (processed) {
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

// Process and store
await handleEvent(event);
await db.insert(webhookEvents).values({ eventId: event.id });
```

---

## Debug Mode

### Enable Verbose Logging

```typescript
// lib/stripe/agentic-commerce.ts
const DEBUG = import.meta.env.DEV;

export async function createPaymentIntentWithSPT(spt, amount, currency) {
  if (DEBUG) {
    console.log('Creating PaymentIntent:', {
      spt: spt.substring(0, 10) + '...',  // Don't log full SPT
      amount,
      currency,
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({ /* ... */ });

    if (DEBUG) {
      console.log('PaymentIntent created:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
      });
    }

    return paymentIntent;
  } catch (error) {
    if (DEBUG) {
      console.error('PaymentIntent error:', error);
    }
    throw error;
  }
}
```

### Test with curl

```bash
# Enable verbose output
curl -v https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"product-1","quantity":1}]}'

# Shows:
# > POST /api/checkout_sessions HTTP/1.1
# > Authorization: Bearer your_api_key
# > Content-Type: application/json
# < HTTP/1.1 201 Created
# < Content-Type: application/json
# { "id": "cs_...", ... }
```

### Stripe Dashboard Logs

View real-time Stripe API calls:

1. Visit [dashboard.stripe.com/logs](https://dashboard.stripe.com/logs)
2. Filter by:
   - **API version:** `2025-09-30.clover`
   - **Request:** `payment_intents.create`
   - **Status:** Success / Error
3. Click request to see full details

### Webhook Logs

Monitor webhook delivery:

1. Visit [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click your endpoint
3. View **Recent events** tab
4. Check:
   - Delivery status (✓ Success / ✗ Failed)
   - Response code (200 = success)
   - Response time (<1s ideal)
5. Click event to see request/response

---

## Performance Issues

### Slow Product Feed Response

**Symptom:** Feed takes >2 seconds to load

**Solutions:**

1. **Enable caching:**

```typescript
headers: {
  'Cache-Control': 'public, max-age=900',
}
```

2. **Use CDN:**

```bash
# Cloudflare, Fastly, or similar
```

3. **Optimize database query:**

```typescript
// ✗ Slow - loads all relations
const products = await db.query.products.findMany({
  with: { variants: true, images: true, reviews: true },
});

// ✓ Fast - only needed fields
const products = await db.query.products.findMany({
  columns: { id: true, title: true, price: true, imageUrl: true },
});
```

4. **Paginate large catalogs:**

```typescript
// For 10,000+ products
?page=1&limit=100
```

### Slow Checkout Completion

**Symptom:** `/complete` endpoint takes >3 seconds

**Solutions:**

1. **Parallel operations:**

```typescript
// ✗ Sequential - 3s total
const payment = await charge(spt);          // 1s
const order = await createOrder(payment);   // 1s
const email = await sendEmail(order);       // 1s

// ✓ Parallel - 1s total
const [payment, _] = await Promise.all([
  charge(spt),                              // 1s
  Promise.all([
    createOrder(payment),                   // Waits for payment
    sendEmailAsync(order),                  // Background task
  ]),
]);
```

2. **Async email sending:**

```typescript
// Don't wait for email
sendEmailAsync(order);  // Fire and forget

// Return immediately
return { status: 'completed', order };
```

3. **Cache tax calculations:**

```typescript
// Cache tax rates
const cachedRate = taxRateCache.get(state);
if (cachedRate) return cachedRate;
```

---

## Common Error Codes

### HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | OK | Request succeeded |
| 201 | Created | Session created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid API key |
| 402 | Payment Required | Payment failed |
| 404 | Not Found | Session doesn't exist |
| 409 | Conflict | Session already completed |
| 429 | Too Many Requests | Rate limit hit |
| 500 | Server Error | Internal error |

### Stripe Error Codes

| Code | Cause | Solution |
|------|-------|----------|
| `card_declined` | Bank declined | Try different card |
| `expired_card` | Card expired | Update expiration |
| `incorrect_cvc` | Wrong CVC | Check security code |
| `insufficient_funds` | Not enough money | Add funds or use different card |
| `invalid_number` | Invalid card number | Check card number |
| `processing_error` | Temporary Stripe issue | Retry in a few minutes |

---

## Getting Help

### Check Documentation

1. **This guide** - Common issues and solutions
2. **[API Reference](/docs/buy-in-chatgpt/api-reference)** - Complete endpoint docs
3. **[Stripe Docs](https://docs.stripe.com/agentic-commerce)** - Official ACP specification

### Stripe Support

- **Dashboard:** [dashboard.stripe.com/support](https://dashboard.stripe.com/support)
- **Docs:** [docs.stripe.com](https://docs.stripe.com)
- **Status:** [status.stripe.com](https://status.stripe.com)

### Enable Debug Mode

```bash
# Development
DEBUG=true bun run dev

# Production (temporarily)
DEBUG=true npm run start
```

### Collect Diagnostic Info

Before requesting help, gather:

```bash
# System info
node --version
npm --version

# Package versions
npm list stripe
npm list astro

# Environment check
echo "Stripe key: ${STRIPE_SECRET_KEY:0:10}..."
echo "API key: ${COMMERCE_API_KEY:0:10}..."

# Test endpoints
curl https://yourdomain.com/api/commerce/feed.json | head
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer $COMMERCE_API_KEY" \
  -d '{"items":[{"id":"product-1","quantity":1}]}'
```

---

**Next:** [FAQ](/docs/buy-in-chatgpt/faq) for frequently asked questions.
