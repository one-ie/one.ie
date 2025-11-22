# One-Click Upsell System (Cycle 84)

Complete implementation of one-click upsell pages with countdown timers, urgency elements, and chained upsells.

## Overview

The upsell system allows you to present special offers to customers immediately after their initial purchase, using their saved payment method for frictionless one-click purchases.

## Features

✅ **One-Click Purchase** - Uses saved payment method from initial checkout
✅ **Countdown Timer** - Creates urgency with expiring offers
✅ **Product Presentation** - Image, headline, benefits, pricing
✅ **Urgency Elements** - Limited stock, countdown, scarcity messaging
✅ **Clear CTAs** - Accept and Decline buttons
✅ **Analytics Tracking** - Tracks views, accepts, declines, acceptance rates
✅ **Chained Upsells** - Support for multiple sequential upsells
✅ **Mobile Responsive** - Works perfectly on all devices
✅ **Dark Mode** - Full dark mode support

## File Structure

```
web/src/
├── pages/
│   └── upsell/
│       ├── [offerId].astro       # Dynamic upsell page
│       ├── example.astro          # Example/demo page
│       └── README.md              # This file
└── components/
    └── checkout/
        └── UpsellOffer.tsx        # Main upsell component
```

## Quick Start

### 1. Create an Upsell Offer

```typescript
import type { UpsellOffer } from "@/components/checkout/UpsellOffer";

const myUpsell: UpsellOffer = {
  id: "premium-upgrade",
  product: {
    id: "prod_premium",
    name: "Premium Package",
    headline: "🚀 Upgrade to Premium - Save 80%!",
    description: "Get lifetime access to all premium features",
    benefits: [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "API access",
    ],
    image: "https://example.com/image.jpg",
    originalPrice: 29900, // $299.00 in cents
    discountedPrice: 5900, // $59.00 in cents
    discountPercentage: 80,
    stockRemaining: 10, // Optional
  },
  timerSeconds: 600, // 10 minutes
  nextOfferId: "bonus-pack", // Optional - for chained upsells
};
```

### 2. Navigate to Upsell After Checkout

After successful initial checkout, redirect to the upsell page:

```typescript
// After checkout success
const paymentMethodId = paymentIntent.payment_method;
window.location.href = `/upsell/premium-upgrade?pm=${paymentMethodId}`;
```

### 3. Handle Upsell Callbacks

The upsell component provides callbacks for accept/decline:

```tsx
<UpsellOffer
  offer={myUpsell}
  paymentMethodId={paymentMethodId}
  onAccept={(orderId) => {
    // Upsell accepted - navigate to next upsell or thank you
    if (myUpsell.nextOfferId) {
      window.location.href = `/upsell/${myUpsell.nextOfferId}`;
    } else {
      window.location.href = "/thankyou";
    }
  }}
  onDecline={() => {
    // Upsell declined - navigate to next upsell or thank you
    if (myUpsell.nextOfferId) {
      window.location.href = `/upsell/${myUpsell.nextOfferId}`;
    } else {
      window.location.href = "/thankyou";
    }
  }}
/>
```

## Upsell Flow

```
1. Customer completes checkout
   ↓
2. Payment method saved
   ↓
3. Redirect to /upsell/[offerId]?pm=[paymentMethodId]
   ↓
4. Show upsell with countdown timer
   ↓
5a. Accept → Process payment → Next upsell or thank you
5b. Decline → Next upsell or thank you
   ↓
6. Repeat for each upsell in chain
   ↓
7. Final: Thank you page
```

## Backend Integration

### Required Mutation

The frontend expects a backend mutation at `api.mutations.payments.processUpsell`:

```typescript
// backend/convex/mutations/payments.ts
export const processUpsell = mutation({
  args: {
    offerId: v.string(),
    productId: v.string(),
    amount: v.number(),
    paymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify payment method exists and belongs to user
    // 2. Create Stripe payment intent with saved payment method
    // 3. Confirm payment
    // 4. Create order record
    // 5. Create product_purchased event
    // 6. Create purchased connection
    // 7. Return order ID

    return {
      success: true,
      orderId: "order_abc123",
      paymentIntentId: "pi_1234567890",
    };
  },
});
```

### API Endpoint (Alternative)

If using REST API instead of Convex:

```typescript
// POST /api/checkout/upsell
{
  "offerId": "premium-upgrade",
  "productId": "prod_premium",
  "amount": 5900,
  "paymentMethodId": "pm_1234567890"
}

// Response (200 OK)
{
  "success": true,
  "orderId": "order_abc123",
  "paymentIntentId": "pi_1234567890"
}

// Response (400 Bad Request)
{
  "success": false,
  "error": "Payment failed",
  "code": "card_declined"
}
```

## Analytics Events

The system automatically tracks these Google Analytics events:

| Event | Description | Parameters |
|-------|-------------|------------|
| `upsell_viewed` | Upsell page loaded | `offer_id`, `product_id`, `product_name`, `price` |
| `upsell_accepted` | Customer clicked "Yes" | `offer_id`, `product_id`, `product_name`, `price`, `time_remaining`, `order_id` |
| `upsell_declined` | Customer clicked "No" | `offer_id`, `product_id`, `product_name`, `time_remaining` |
| `upsell_payment_failed` | Payment error | `offer_id`, `product_id`, `error` |
| `upsell_acceptance_rate` | Calculated rate | `offer_id`, `rate` |
| `upsell_timer_expired` | Timer ran out | `offer_id`, `timer_duration` |

### Acceptance Rate Calculation

The component automatically calculates and stores acceptance rates:

```typescript
// Stored in localStorage as:
{
  "upsell_stats_premium-upgrade": {
    "views": 100,
    "accepts": 35
  }
}

// Acceptance rate = (accepts / views) * 100 = 35%
```

## Chained Upsells

Create a sequence of upsells by linking them with `nextOfferId`:

```typescript
// Upsell 1: Advanced Training
{
  id: "advanced-training",
  // ... product details
  nextOfferId: "premium-support", // Link to next upsell
}

// Upsell 2: Premium Support
{
  id: "premium-support",
  // ... product details
  nextOfferId: "bonus-resources", // Link to next upsell
}

// Upsell 3: Bonus Resources (final)
{
  id: "bonus-resources",
  // ... product details
  // No nextOfferId - this is the last upsell
}
```

**Flow:**
1. `/upsell/advanced-training` → Accept → `/upsell/premium-support`
2. `/upsell/premium-support` → Accept → `/upsell/bonus-resources`
3. `/upsell/bonus-resources` → Accept → `/thankyou`

Or if any are declined:
1. `/upsell/advanced-training` → Decline → `/upsell/premium-support`
2. `/upsell/premium-support` → Decline → `/upsell/bonus-resources`
3. `/upsell/bonus-resources` → Decline → `/thankyou`

## Customization

### Timer Duration

Set the timer in seconds:

```typescript
{
  timerSeconds: 600, // 10 minutes
  timerSeconds: 300, // 5 minutes
  timerSeconds: 180, // 3 minutes
}
```

### Stock Scarcity

Display limited stock:

```typescript
{
  product: {
    stockRemaining: 5, // Shows "Only 5 left!"
  }
}
```

Omit `stockRemaining` to hide scarcity messaging.

### Pricing Display

Prices are in cents to avoid floating-point issues:

```typescript
{
  originalPrice: 99700,   // $997.00
  discountedPrice: 19700, // $197.00
  discountPercentage: 80, // 80% off
}
```

The component automatically calculates savings and displays formatted prices.

### Custom Benefits

Add any number of benefits:

```typescript
{
  benefits: [
    "Benefit 1 - Short and clear",
    "Benefit 2 - Focus on value",
    "Benefit 3 - Use action words",
    "Benefit 4 - Be specific",
  ]
}
```

## Best Practices

### 1. Keep Timer Reasonable
- 5-15 minutes is optimal
- Too short: customers feel rushed
- Too long: loses urgency

### 2. Clear Value Proposition
- Show significant discount (50%+ recommended)
- Highlight savings in dollars and percentage
- Use compelling benefits, not features

### 3. Scarcity and Urgency
- Limited stock messaging
- Countdown timer
- "One-time offer" language
- Social proof (e.g., "97 customers viewing")

### 4. Multiple Upsells
- Start with highest-value offer
- Each subsequent offer should be lower in price
- Maximum 3 upsells recommended
- Declining one should show the next, not skip all

### 5. A/B Testing
- Test different headlines
- Test different timer durations
- Test discount percentages
- Track acceptance rates for optimization

## Example Implementation

See the live example at `/upsell/example` which demonstrates:
- Complete upsell offer with countdown timer
- Product presentation with image and benefits
- Pricing display with savings calculation
- Accept/decline callbacks
- Analytics tracking
- Implementation notes and API contract

## Stripe Integration

The upsell system uses Stripe's saved payment method feature:

1. **Initial Checkout**: Customer enters payment details
2. **Save Payment Method**: Stripe saves the payment method
3. **Upsell**: Use saved payment method for one-click purchase

```typescript
// In Stripe, this looks like:
const paymentIntent = await stripe.paymentIntents.create({
  amount: 5900, // $59.00
  currency: "usd",
  customer: customerId,
  payment_method: paymentMethodId, // Saved from initial checkout
  confirm: true,
  off_session: true, // Allow charging without customer present
});
```

**Security**: Stripe validates the payment method belongs to the customer and handles 3D Secure if required.

## Ontology Mapping

Upsells map to the 6-dimension ontology:

### Events
```typescript
{
  type: "product_purchased",
  groupId: "org_acme",
  actorId: "customer_id",
  thingId: "product_id",
  properties: {
    source: "upsell",
    offerId: "premium-upgrade",
    amount: 5900,
    paymentMethodId: "pm_1234567890",
  }
}
```

### Connections
```typescript
{
  type: "purchased",
  fromId: "customer_id",
  toId: "product_id",
  groupId: "org_acme",
  properties: {
    purchaseType: "upsell",
    offerId: "premium-upgrade",
    discountApplied: 80,
  }
}
```

## Troubleshooting

### Timer Doesn't Count Down
- Check that component has `client:load` directive
- Verify `timerSeconds` is set correctly
- Check browser console for errors

### Payment Fails
- Verify payment method ID is valid
- Check backend mutation is implemented
- Ensure Stripe secret key is configured
- Test with Stripe test cards

### Analytics Not Tracking
- Verify Google Analytics is configured
- Check `window.gtag` is available
- Open browser console to see event logs
- Use Google Analytics DebugView

### Upsell Chain Broken
- Verify `nextOfferId` matches next upsell's `id`
- Check redirect URLs are correct
- Ensure payment method ID is passed in URL

## Performance

The upsell page is optimized for fast loading:

- ✅ Sidebar collapsed by default (more space for offer)
- ✅ Minimal JavaScript (only countdown and payment logic)
- ✅ Images lazy-loaded
- ✅ Analytics events debounced
- ✅ LocalStorage for acceptance rate tracking

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ High contrast mode support

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari
- ✅ Mobile Chrome

## Next Steps

1. **Implement Backend Mutation** - Create `api.mutations.payments.processUpsell`
2. **Configure Stripe** - Set up saved payment methods
3. **Create Upsell Offers** - Define your upsell products
4. **Test Flow** - Use `/upsell/example` to test
5. **Monitor Analytics** - Track acceptance rates and optimize
6. **A/B Test** - Try different offers and timings

## Support

For questions or issues:
- Check `/upsell/example` for working demo
- Review this README
- Check browser console for errors
- Verify backend mutation is implemented

---

**Built with ❤️ for ONE Platform - Cycle 84 Complete**
