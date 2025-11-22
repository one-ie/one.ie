# Downsell Integration Example

## Complete Funnel Flow

This example shows how to integrate the downsell page into a complete sales funnel.

## Step-by-Step Integration

### Step 1: Checkout/Order Completion

```astro
---
// /web/src/pages/checkout.astro
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

// After successful payment, redirect to upsell
---

<CheckoutForm
  onSuccess={(orderId) => {
    // Redirect to upsell page
    window.location.href = `/upsell/premium-upgrade?orderId=${orderId}`;
  }}
/>
```

### Step 2: Upsell Page

```astro
---
// /web/src/pages/upsell/[offerId].astro
import { UpsellOffer } from '@/components/checkout/UpsellOffer';

const { offerId } = Astro.params;
const originalOrderId = Astro.url.searchParams.get('orderId');

const upsellOffers = {
  'premium-upgrade': {
    name: 'Premium Membership',
    price: 297,
    features: [
      'All courses included',
      'Private coaching calls',
      '1-year access',
    ],
  },
};

const offer = upsellOffers[offerId];
---

<UpsellOffer
  client:load
  offerId={offerId}
  productName={offer.name}
  price={offer.price}
  features={offer.features}
  onAccept={async (offerId) => {
    // Process upsell payment
    const response = await fetch('/api/upsell/accept', {
      method: 'POST',
      body: JSON.stringify({ offerId, originalOrderId }),
    });

    const { sessionId } = await response.json();

    // Redirect to order confirmation (skip downsell)
    window.location.href = `/shop/orders/thank-you-product?session_id=${sessionId}&upsell=true`;
  }}
  onDecline={() => {
    // ⭐ KEY INTEGRATION: Redirect to downsell
    window.location.href = `/downsell/basic-course?orderId=${originalOrderId}`;
  }}
/>
```

### Step 3: Downsell Page (Already Created)

The downsell page at `/downsell/[offerId].astro` handles:
- Showing lower-priced alternative
- One-click purchase with saved payment method
- Redirecting to order confirmation on accept
- Redirecting to order confirmation on decline

### Step 4: Order Confirmation

```astro
---
// /web/src/pages/shop/orders/thank-you-product.astro

const sessionId = Astro.url.searchParams.get('session_id');
const isUpsell = Astro.url.searchParams.get('upsell') === 'true';
const isDownsell = Astro.url.searchParams.get('downsell') === 'true';

// Retrieve order details from Stripe
const session = await stripe.checkout.sessions.retrieve(sessionId);
---

<Layout title="Order Confirmed">
  <h1>Thank You for Your Purchase!</h1>

  {isUpsell && (
    <p class="text-green-600">
      🎉 Congratulations on upgrading to Premium!
    </p>
  )}

  {isDownsell && (
    <p class="text-green-600">
      Great choice! You saved money and got great value.
    </p>
  )}

  <!-- Order details -->
  <OrderSummary session={session} />
</Layout>
```

## Complete Flow Diagram

```
┌─────────────────────┐
│  Product Page       │
│  Add to Cart        │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Checkout Page      │
│  Enter Payment Info │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Payment Success    │
│  (orderId created)  │
└──────────┬──────────┘
           ↓
┌─────────────────────────────────────────┐
│         UPSELL PAGE                     │
│  "Upgrade to Premium - $297"            │
│  [YES, UPGRADE] [NO THANKS]            │
└──────────┬─────────────┬────────────────┘
           ↓             ↓
      [Accept]      [Decline]
           ↓             ↓
    Order Confirmed  DOWNSELL PAGE ← NEW
                         ↓
           ┌─────────────────────────────┐
           │  "Last Chance - Basic $97"  │
           │  [YES] [NO THANKS]          │
           └──────┬──────────┬───────────┘
                  ↓          ↓
             [Accept]   [Decline]
                  ↓          ↓
                  └─────┬────┘
                        ↓
              ┌──────────────────┐
              │ Order Confirmed  │
              │ Thank You Page   │
              └──────────────────┘
```

## Revenue Scenarios

### Without Downsell
- Main product: $97
- 20% accept upsell ($297): **$356 AOV**
- 80% decline upsell: **$97 AOV**
- **Average: $148.80 AOV**

### With Downsell
- Main product: $97
- 20% accept upsell ($297): **$356 AOV**
- Of 80% who decline upsell:
  - 25% accept downsell ($147): **$244 AOV**
  - 75% decline downsell: **$97 AOV**
- **Average: $172.80 AOV** (16% increase!)

## Implementation Checklist

- [ ] Create main product checkout page
- [ ] Create upsell page with accept/decline handlers
- [ ] Create downsell page (✅ Done in Cycle 85)
- [ ] Implement `/api/upsell/accept` endpoint
- [ ] Implement `/api/downsell/accept` endpoint
- [ ] Update thank-you page to handle upsell/downsell flags
- [ ] Add analytics tracking to all pages
- [ ] Test complete funnel flow
- [ ] Set up email confirmations for each purchase type

## API Endpoints Needed

### POST /api/upsell/accept

```typescript
// Request
{
  "offerId": "premium-upgrade",
  "originalOrderId": "pi_xxxxx"
}

// Response
{
  "sessionId": "cs_xxxxx",
  "success": true
}
```

### POST /api/downsell/accept

```typescript
// Request
{
  "offerId": "basic-course",
  "originalOrderId": "pi_xxxxx"
}

// Response
{
  "orderId": "order_yyyyy",
  "sessionId": "cs_zzzzz",
  "success": true
}
```

## Database Schema

Track funnel steps in database:

```sql
CREATE TABLE orders (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR,
  product_id VARCHAR,
  amount DECIMAL,
  type ENUM('main', 'upsell', 'downsell'),
  parent_order_id VARCHAR, -- Links to original order
  stripe_session_id VARCHAR,
  status ENUM('pending', 'completed', 'failed'),
  created_at TIMESTAMP
);

CREATE TABLE funnel_events (
  id VARCHAR PRIMARY KEY,
  order_id VARCHAR,
  event_type ENUM('upsell_shown', 'upsell_accepted', 'upsell_declined', 'downsell_shown', 'downsell_accepted', 'downsell_declined'),
  metadata JSON,
  created_at TIMESTAMP
);
```

## Analytics Events

Track these events for optimization:

```typescript
// Upsell shown
gtag('event', 'upsell_shown', {
  offer_id: 'premium-upgrade',
  order_id: originalOrderId,
});

// Upsell accepted
gtag('event', 'upsell_accepted', {
  offer_id: 'premium-upgrade',
  revenue: 297,
});

// Upsell declined → downsell shown
gtag('event', 'upsell_declined', {
  offer_id: 'premium-upgrade',
});

gtag('event', 'downsell_shown', {
  offer_id: 'basic-course',
  order_id: originalOrderId,
});

// Downsell accepted
gtag('event', 'downsell_accepted', {
  offer_id: 'basic-course',
  revenue: 97,
});

// Downsell declined
gtag('event', 'downsell_declined', {
  offer_id: 'basic-course',
});
```

## Testing Scenarios

### Scenario 1: Accept Upsell
1. Buy main product ($97)
2. See upsell ($297)
3. Click "Yes, upgrade"
4. See order confirmation with both items
5. ✅ Total: $394

### Scenario 2: Decline Upsell, Accept Downsell
1. Buy main product ($97)
2. See upsell ($297)
3. Click "No thanks"
4. See downsell ($97)
5. Click "Yes, add to order"
6. See order confirmation with both items
7. ✅ Total: $194

### Scenario 3: Decline Both
1. Buy main product ($97)
2. See upsell ($297)
3. Click "No thanks"
4. See downsell ($97)
5. Click "No thanks"
6. See order confirmation
7. ✅ Total: $97

## Common Issues & Solutions

### Issue: Payment fails on downsell
**Solution**: Ensure payment method is still valid, handle errors gracefully

### Issue: User refreshes page
**Solution**: Store offer state in session/localStorage, don't show again

### Issue: Conversion tracking duplicate
**Solution**: Use unique event IDs, deduplicate in analytics

### Issue: Users skip downsell by editing URL
**Solution**: That's okay! The goal is to offer, not force.

## Next Steps After Implementation

1. **Monitor metrics**: Track acceptance rates for 2-4 weeks
2. **A/B test pricing**: Try different downsell price points
3. **Test copy variations**: Experiment with urgency messaging
4. **Add countdown timer**: Create urgency with time limit
5. **Personalize offers**: Match downsell to customer segment
6. **Email follow-up**: Send offer to those who declined

## Related Documentation

- [Downsell Page README](./README.md)
- [Funnel Builder Cycles](/web/src/components/templates/CYCLE-52-SUMMARY.md)
- [Stripe Integration Guide](/docs/stripe)
- [Analytics Setup](/docs/analytics)
