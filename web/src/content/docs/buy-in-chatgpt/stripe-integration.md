---
title: Buy in ChatGPT - Stripe Integration
description: Complete guide to Stripe Shared Payment Tokens including the ONE line difference, payment flows, security, and testing
category: Buy in ChatGPT
order: 5
tags:
  - stripe
  - spt
  - payment
  - security
---

# Stripe Integration - Shared Payment Tokens

## The ONE Line Difference

Buy in ChatGPT uses Stripe Shared Payment Tokens (SPT) for instant checkout. The integration is **99% identical** to regular Stripe - with just ONE line different.

### Regular Stripe Payment Intent

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5900,                 // $59.00 in cents
  currency: 'usd',
  payment_method: 'pm_card_visa',  // ← Regular Stripe
  confirm: true,
});
```

### Buy in ChatGPT Payment Intent

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5900,                 // $59.00 in cents
  currency: 'usd',
  shared_payment_granted_token: sharedPaymentToken,  // ← ONE LINE DIFFERENT!
  confirm: true,
  automatic_payment_methods: {
    enabled: true,
  },
});
```

**That's it!** Everything else - webhooks, refunds, disputes, reporting - works exactly the same.

## What are Shared Payment Tokens?

Shared Payment Tokens (SPT) are **single-use, amount-scoped payment tokens** created by Stripe for AI-powered checkout.

### Key Properties

**Single-Use:**
- SPT can only be charged once
- After first use, token becomes invalid
- Prevents duplicate charges

**Amount-Scoped:**
- SPT only works for exact amount specified
- Attempting different amount fails
- Prevents unauthorized charges

**Time-Limited:**
- SPT expires after 15 minutes
- Must be used quickly after creation
- Reduces attack window

**Merchant-Scoped:**
- SPT only works for specific Stripe account
- Cannot be used by other merchants
- Account-level isolation

### Security Model

Even if SPT is intercepted by attacker:

```
❌ Can't reuse (single-use)
❌ Can't change amount (amount-scoped)
❌ Can't use after 15 min (time-limited)
❌ Can't use with different merchant (merchant-scoped)
```

**Result:** SPTs are essentially worthless to attackers.

## How SPTs Work (Complete Flow)

### 1. Customer in ChatGPT

Customer has conversation with AI:

```
Customer: I need a padel racket for aggressive play
AI: I recommend StarVie Metheora Warrior ($139)...
Customer: Perfect, I'll buy it
```

### 2. ChatGPT Displays Checkout

ChatGPT shows summary:

```
StarVie Metheora Warrior
Quantity: 1
Price: $139.00
Shipping: $9.00
Tax: $11.12
Total: $159.12

[Confirm Purchase]
```

### 3. Customer Confirms

Customer clicks "Confirm Purchase"

ChatGPT prompts: "Confirm payment of $159.12 with card ending in 4242?"

Customer confirms.

### 4. Stripe Creates SPT

Stripe generates SPT:

```json
{
  "id": "spt_1234567890abcdef",
  "object": "shared_payment_granted_token",
  "amount": 15912,              // $159.12 in cents
  "currency": "usd",
  "merchant_account": "acct_YOUR_STRIPE_ACCOUNT",
  "created": 1704844800,
  "expires_at": 1704845700      // +15 minutes
}
```

### 5. ChatGPT Calls Your API

ChatGPT makes request to your `/complete` endpoint:

```bash
POST https://yourdomain.com/api/checkout_sessions/cs_123/complete
Authorization: Bearer your_api_key
Content-Type: application/json

{
  "shared_payment_granted_token": "spt_1234567890abcdef"
}
```

### 6. Your API Charges SPT

Your server uses SPT to charge customer:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 15912,
  currency: 'usd',
  shared_payment_granted_token: 'spt_1234567890abcdef',
  confirm: true,
  automatic_payment_methods: {
    enabled: true,
  },
  metadata: {
    orderId: 'order_9876543210',
    sessionId: 'cs_123',
    source: 'chatgpt',
  },
});
```

### 7. Payment Confirmed

Stripe processes payment and returns:

```json
{
  "id": "pi_1234567890",
  "status": "succeeded",
  "amount": 15912,
  "currency": "usd",
  "charges": {
    "data": [{
      "id": "ch_1234567890",
      "amount": 15912,
      "status": "succeeded"
    }]
  }
}
```

### 8. Order Created

Your API creates order and returns confirmation:

```json
{
  "id": "cs_123",
  "status": "completed",
  "order": {
    "id": "order_9876543210",
    "status": "confirmed",
    "payment_status": "paid",
    "total_amount": 15912,
    "confirmation_url": "https://yourdomain.com/orders/order_9876543210"
  }
}
```

### 9. Customer Notified

ChatGPT shows success message:

```
✓ Order confirmed!

Order #9876543210
Total: $159.12
Arrives: Jan 21-23

You'll receive an email confirmation shortly.
```

**Total Time:** ~60 seconds from "I'll buy it" to "Order confirmed"

## Implementation

### Setup Stripe SDK

```bash
npm install stripe
```

```typescript
// lib/stripe/client.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});
```

### Create Payment Intent with SPT

```typescript
// lib/stripe/agentic-commerce.ts
import { stripe } from './client';

export async function createPaymentIntentWithSPT(
  sharedPaymentToken: string,
  amount: number,
  currency: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      // Amount in cents
      amount,

      // Currency (lowercase)
      currency: currency.toLowerCase(),

      // THE MAGIC LINE - Use SPT instead of payment_method
      shared_payment_granted_token: sharedPaymentToken,

      // Metadata for tracking
      metadata: {
        ...metadata,
        source: 'chatgpt_agentic_commerce',
      },

      // Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },

      // Confirm immediately (SPT is single-use)
      confirm: true,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating PaymentIntent with SPT:', error);
    throw error;
  }
}
```

### Complete Endpoint Implementation

```typescript
// pages/api/checkout_sessions/[id]/complete.ts
import type { APIRoute } from 'astro';
import { createPaymentIntentWithSPT } from '@/lib/stripe/agentic-commerce';

export const POST: APIRoute = async ({ request, params }) => {
  try {
    // Get session
    const sessionId = params.id;
    const session = await getSession(sessionId);

    if (!session) {
      return new Response(JSON.stringify({
        type: 'invalid_request',
        code: 'not_found',
        message: 'Checkout session not found',
      }), { status: 404 });
    }

    // Verify session is ready
    if (session.status !== 'ready_for_payment') {
      return new Response(JSON.stringify({
        type: 'invalid_request',
        code: 'invalid',
        message: 'Session not ready for payment',
      }), { status: 400 });
    }

    // Parse request
    const body = await request.json();
    const { shared_payment_granted_token } = body;

    if (!shared_payment_granted_token) {
      return new Response(JSON.stringify({
        type: 'invalid_request',
        code: 'missing',
        message: 'shared_payment_granted_token is required',
        param: 'shared_payment_granted_token',
      }), { status: 400 });
    }

    // Calculate total from session
    const total = session.totals.find(t => t.type === 'total');
    if (!total) {
      throw new Error('Total not found in session');
    }

    // Create PaymentIntent with SPT
    const paymentIntent = await createPaymentIntentWithSPT(
      shared_payment_granted_token,
      total.amount,
      session.currency,
      {
        sessionId: sessionId,
      }
    );

    // Check payment status
    if (paymentIntent.status !== 'succeeded') {
      return new Response(JSON.stringify({
        type: 'payment_error',
        code: 'payment_failed',
        message: 'Payment failed',
        decline_code: paymentIntent.last_payment_error?.decline_code,
      }), { status: 402 });
    }

    // Create order
    const order = await createOrder({
      sessionId: sessionId,
      paymentIntentId: paymentIntent.id,
      amount: total.amount,
      currency: session.currency,
      buyer: session.buyer,
      lineItems: session.line_items,
      fulfillmentAddress: session.fulfillment_address,
      fulfillmentOptionId: session.fulfillment_option_id,
    });

    // Update session status
    session.status = 'completed';
    await updateSession(sessionId, session);

    // Return success
    return new Response(JSON.stringify({
      id: sessionId,
      status: 'completed',
      order: {
        id: order.id,
        status: 'confirmed',
        payment_status: 'paid',
        fulfillment_status: 'pending',
        created_at: new Date().toISOString(),
        total_amount: total.amount,
        currency: session.currency,
        tracking_number: null,
        confirmation_url: `https://yourdomain.com/orders/${order.id}`,
      },
      messages: [
        {
          type: 'success',
          content: "Order confirmed! You'll receive an email confirmation shortly.",
          content_type: 'text/plain',
        },
      ],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Complete checkout error:', error);

    return new Response(JSON.stringify({
      type: 'api_error',
      code: 'processing_error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

## Payment Flow Diagrams

### Happy Path

```
Customer → ChatGPT → Stripe (Create SPT) → Your API → Stripe (Charge SPT) → Order Created
   |                                             |
   |                                             v
   └────────── Order Confirmation ───────────────┘
```

### Failed Payment Path

```
Customer → ChatGPT → Stripe (Create SPT) → Your API → Stripe (Charge SPT)
                                                         |
                                                         v
                                                    Payment Failed
                                                         |
                                                         v
                                              Error Message to Customer
```

### SPT Expiration Path

```
Customer → ChatGPT → Stripe (Create SPT)
                            |
                            v
                     Wait 16 minutes
                            |
                            v
                       SPT Expired
                            |
                            v
                    "Please try again"
```

## Security Considerations

### PCI Compliance

**You are PCI-compliant by default:**

- Stripe handles all card data
- SPTs replace raw card numbers
- You never see payment methods
- PCI-DSS Level 1 certified

**Your responsibility:**

- Secure API keys (environment variables)
- HTTPS everywhere
- Webhook signature verification

### HTTPS Everywhere

**Required for:**

- All API endpoints
- Webhook endpoints
- Product feed endpoint
- Redirect URLs

**How to enforce:**

```typescript
// middleware.ts
export function onRequest({ request, redirect }) {
  const url = new URL(request.url);

  // Force HTTPS in production
  if (import.meta.env.PROD && url.protocol === 'http:') {
    url.protocol = 'https:';
    return redirect(url.toString(), 301);
  }
}
```

### API Key Security

**Best Practices:**

```bash
# ✓ Store in environment
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# ✗ NEVER in code
const apiKey = 'sk_live_xxxxxxxxxxxxxxxxxxxxx';  // DON'T!

# ✗ NEVER in Git
git add .env  # DON'T!

# ✓ Use .gitignore
echo ".env*" >> .gitignore
```

**Key Rotation:**

```bash
# 1. Generate new key in Stripe dashboard
# 2. Update production environment
# 3. Wait 24 hours
# 4. Delete old key
```

### Amount Verification

**ALWAYS verify amount server-side:**

```typescript
// ✗ BAD - Trusting client
const amount = request.body.amount;  // Client could modify!

// ✓ GOOD - Calculate server-side
const amount = calculateTotal(session);  // Your calculation
```

## Testing with Test Tokens

### Create Test SPT

Stripe provides test helpers for SPT in test mode:

```typescript
// Test only - do NOT use in production
export async function createTestSPT(params: {
  amount: number;
  currency: string;
  paymentMethod?: string;
}): Promise<string> {
  const token = await stripe.testHelpers.sharedPayment.grantedTokens.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    payment_method: params.paymentMethod || 'pm_card_visa',
  });

  return token.id;
}
```

### Test Cards

Use these test payment methods:

| Payment Method | Card Number | Result |
|----------------|-------------|--------|
| `pm_card_visa` | 4242 4242 4242 4242 | Success |
| `pm_card_visa_debit` | 4000 0566 5566 5556 | Success (debit) |
| `pm_card_mastercard` | 5555 5555 5555 4444 | Success |
| `pm_card_amex` | 3782 822463 10005 | Success (Amex) |
| `pm_card_chargeAfterSuccessfulPayment` | 4000 0000 0000 0341 | Dispute later |
| `pm_card_threeDSecure2Required` | 4000 0025 0000 3155 | 3D Secure |
| `pm_card_declinedInsufficientFunds` | 4000 0000 0000 9995 | Declined |

### Test Flow

```bash
# 1. Create test SPT
curl -X POST https://api.stripe.com/v1/test_helpers/shared_payment_granted_tokens \
  -u sk_test_xxxxxxxxxxxxxxxxxxxxx: \
  -d amount=5900 \
  -d currency=usd \
  -d payment_method=pm_card_visa

# Response:
# {
#   "id": "spt_test_1234567890",
#   "amount": 5900,
#   "currency": "usd",
#   ...
# }

# 2. Use test SPT in your complete endpoint
curl -X POST https://yourdomain.com/api/checkout_sessions/cs_123/complete \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"shared_payment_granted_token":"spt_test_1234567890"}'
```

### Test Scenarios

**Successful Payment:**

```typescript
const spt = await createTestSPT({
  amount: 5900,
  currency: 'usd',
  paymentMethod: 'pm_card_visa',
});

const result = await completeCheckout(sessionId, spt);
expect(result.status).toBe('completed');
expect(result.order.payment_status).toBe('paid');
```

**Declined Card:**

```typescript
const spt = await createTestSPT({
  amount: 5900,
  currency: 'usd',
  paymentMethod: 'pm_card_declinedInsufficientFunds',
});

const result = await completeCheckout(sessionId, spt);
expect(result.status).toBe(402);
expect(result.error.code).toBe('card_declined');
```

**Amount Mismatch:**

```typescript
// Create SPT for $59.00
const spt = await createTestSPT({
  amount: 5900,
  currency: 'usd',
});

// Try to charge $100.00
const result = await stripe.paymentIntents.create({
  amount: 10000,  // Different amount!
  currency: 'usd',
  shared_payment_granted_token: spt,
  confirm: true,
});

// Stripe rejects - amount doesn't match
```

## Production Deployment

### Pre-Launch Checklist

- [ ] **Switch to live keys** (`pk_live_`, `sk_live_`)
- [ ] **Verify Stripe account** (business details, bank account)
- [ ] **Test with real card** (small amount, then refund)
- [ ] **Webhook endpoint live** (HTTPS, signature verification)
- [ ] **Error logging enabled** (Sentry, LogRocket, etc.)
- [ ] **Rate limiting configured** (prevent abuse)
- [ ] **Amount verification** (server-side calculation)
- [ ] **Refund policy documented** (accessible URL)
- [ ] **Customer support ready** (email/phone)

### Go-Live Steps

1. **Update environment variables:**

```bash
# Production .env
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

2. **Register production webhook:**

- URL: `https://yourdomain.com/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Copy signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Test with real card:**

```bash
# Small test purchase
curl -X POST https://yourdomain.com/api/checkout_sessions \
  -H "Authorization: Bearer $PRODUCTION_API_KEY" \
  -d '{"items":[{"id":"test-product","quantity":1}]}' \
  | jq .
```

4. **Verify webhook delivery:**

- Make test purchase
- Check Stripe Dashboard → Webhooks → Logs
- Verify your endpoint received event
- Verify response was 200 OK

5. **Monitor for 24 hours:**

- Watch error logs
- Monitor webhook failures
- Track payment success rate
- Verify email confirmations sent

### Monitoring

**Key Metrics:**

- Payment success rate (target: >95%)
- Average completion time (target: <2s)
- Webhook delivery rate (target: 100%)
- Error rate (target: <1%)
- Refund rate (target: <5%)

**Alerts:**

```typescript
// Set up alerts for critical issues
if (paymentSuccessRate < 0.95) {
  alert('Payment success rate below 95%');
}

if (webhookFailureRate > 0.05) {
  alert('Webhook failures above 5%');
}
```

## Common Issues

### Issue: "Invalid SPT"

**Cause:** SPT expired (>15 min), already used, or amount mismatch

**Solution:**
- Check SPT age (must be <15 min)
- Verify amount matches exactly (in cents)
- Don't reuse SPTs (single-use)

### Issue: "Payment Intent creation failed"

**Cause:** Invalid API key, network error, or Stripe outage

**Solution:**
- Verify `STRIPE_SECRET_KEY` is correct (starts with `sk_`)
- Check Stripe status page
- Implement retry logic (exponential backoff)

### Issue: "Webhook signature verification failed"

**Cause:** Wrong secret, raw body modified, or replay attack

**Solution:**
- Use raw request body (not parsed JSON)
- Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
- Check webhook endpoint uses HTTPS

---

**Next:** [Product Feed](/docs/buy-in-chatgpt/product-feed) for catalog integration details.
