# Order Bump System (Cycle 83)

Complete order bump implementation for increasing Average Order Value (AOV) at checkout.

## Features

✅ **Order bump checkbox** - "Yes, add X to my order for only $Y"
✅ **Product selection** - Choose which products to offer as bumps
✅ **Flexible discounts** - Percentage, fixed, BOGO, or free shipping
✅ **Smart positioning** - Before or after payment form
✅ **Analytics tracking** - Track acceptance rates with Google Analytics
✅ **Multiple bumps** - Support for up to 3 order bumps per checkout
✅ **Conditional logic** - Show bumps based on cart contents
✅ **Payment integration** - Automatically updates Stripe payment intent

## Components

### 1. OrderBump Component

Single order bump checkbox with product offer.

```tsx
import { OrderBump } from '@/components/checkout/OrderBump';

<OrderBump
  bump={orderBump}
  accepted={isAccepted}
  onToggle={handleToggle}
  variant="default" // or "compact" | "featured"
  showImage={true}
/>
```

**Props:**
- `bump` - Order bump configuration
- `accepted` - Whether bump is currently accepted
- `onToggle` - Callback when checkbox is toggled
- `variant` - Display style (default, compact, featured)
- `showImage` - Show product image (default: true)

### 2. OrderBumpList Component

Display multiple order bumps together.

```tsx
import { OrderBumpList } from '@/components/checkout/OrderBump';

<OrderBumpList
  bumps={orderBumps}
  acceptedBumpIds={acceptedIds}
  onToggle={handleToggle}
  maxBumps={3}
  variant="default"
/>
```

### 3. CheckoutWithBumps Component

Complete checkout flow with integrated order bumps.

```tsx
import { CheckoutWithBumps } from '@/components/checkout/CheckoutWithBumps';

<CheckoutWithBumps
  bumpConfigs={customBumps}
  maxBumps={3}
  showBumpsBeforePayment={true}
  showBumpsAfterPayment={false}
  onPaymentSuccess={() => router.push('/success')}
  onPaymentError={(error) => console.error(error)}
/>
```

## State Management

### Checkout Store

```typescript
import {
  $checkoutSession,
  $bumpTotal,
  checkoutActions
} from '@/stores/checkout';
import { useStore } from '@nanostores/react';

// Access state
const session = useStore($checkoutSession);
const bumpTotal = useStore($bumpTotal);

// Initialize bumps
checkoutActions.initializeOrderBumps(bumps);

// Toggle bump
checkoutActions.toggleOrderBump(bumpId);

// Get accepted bumps for payment
const acceptedBumps = checkoutActions.getAcceptedBumps();
```

## Order Bump Configuration

### Basic Configuration

```typescript
import type { OrderBumpConfig } from '@/lib/checkout/order-bump-logic';

const bumpConfig: OrderBumpConfig = {
  productId: 'express-shipping',
  productName: 'Express Shipping',
  productDescription: 'Get your order in 2-3 days instead of 5-7 days',
  productImage: '/images/shipping.jpg',
  originalPrice: 1500, // $15.00 in cents
  discountType: 'percentage',
  discountValue: 33, // 33% off
  position: 'before_payment',
};
```

### Discount Types

**Percentage Discount:**
```typescript
{
  discountType: 'percentage',
  discountValue: 25, // 25% off
}
```

**Fixed Amount Discount:**
```typescript
{
  discountType: 'fixed',
  discountValue: 500, // $5.00 off (in cents)
}
```

**Buy One Get One (BOGO):**
```typescript
{
  discountType: 'bogo',
  discountValue: 0, // Automatic 50% off
}
```

**Free Shipping:**
```typescript
{
  discountType: 'free_shipping',
  discountValue: 0,
}
```

### Conditional Bumps

Show bumps only when specific conditions are met:

```typescript
const bumpConfig: OrderBumpConfig = {
  // ... basic config
  conditions: {
    // Only show if cart total is over $50
    minCartValue: 5000,

    // Only show if cart contains specific products
    requiredProducts: ['product-123', 'product-456'],

    // Don't show if cart contains these products
    excludedProducts: ['product-789'],
  },
};
```

## Predefined Templates

Use ready-made bump templates:

```typescript
import { orderBumpTemplates } from '@/lib/checkout/order-bump-logic';

// Express shipping bump
const expressShipping = orderBumpTemplates.expressShipping;

// Gift wrapping bump
const giftWrap = orderBumpTemplates.giftWrapping;

// Extended warranty bump
const warranty = orderBumpTemplates.extendedWarranty;

// VIP membership bump
const membership = orderBumpTemplates.membershipTrial;
```

## Analytics Tracking

### Automatic Tracking

Order bumps automatically track these events to Google Analytics:

- `order_bump_offered` - When bump is displayed
- `order_bump_accepted` - When user checks the box
- `order_bump_rejected` - When user unchecks the box
- `order_bump_added` - When bump is added to cart
- `order_bump_removed` - When bump is removed from cart

### Manual Tracking

```typescript
import { trackOrderBumpEvent } from '@/lib/checkout/order-bump-logic';

trackOrderBumpEvent('accepted', bump);
trackOrderBumpEvent('rejected', bump);
```

### Analytics Data

```typescript
import { calculateAnalytics } from '@/lib/checkout/order-bump-logic';

const analytics = calculateAnalytics(allBumps, acceptedBumpIds);

console.log({
  totalOffered: analytics.totalOffered,
  totalAccepted: analytics.totalAccepted,
  acceptanceRate: analytics.acceptanceRate, // percentage
  averageOrderValue: analytics.averageOrderValue,
  totalRevenue: analytics.totalRevenue,
  totalSavings: analytics.totalSavings,
});
```

## Payment Integration

### Update Payment Intent

```typescript
import { updatePaymentIntentWithBumps } from '@/lib/checkout/order-bump-logic';

const baseRequest = {
  items: cartItems.map(item => ({
    productId: item.id,
    quantity: item.quantity,
  })),
  currency: 'usd',
};

const acceptedBumps = checkoutActions.getAcceptedBumps();
const updatedRequest = updatePaymentIntentWithBumps(baseRequest, acceptedBumps);

// Send to Stripe API
const response = await fetch('/api/checkout/create-intent', {
  method: 'POST',
  body: JSON.stringify(updatedRequest),
});
```

### Backend Integration

```typescript
// Example: Update Stripe payment intent
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Extract bump items from request
const bumpItems = request.items.filter(item =>
  item.metadata?.isOrderBump === 'true'
);

// Calculate total including bumps
const total = calculateTotal(request.items);

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: total,
  currency: request.currency,
  metadata: {
    orderBumpCount: request.metadata.orderBumpCount,
    orderBumpRevenue: request.metadata.orderBumpRevenue,
  },
});
```

## Complete Example

### Page Implementation

```astro
---
// src/pages/checkout.astro
import Layout from '@/layouts/Layout.astro';
import { CheckoutWithBumps } from '@/components/checkout/CheckoutWithBumps';
import { orderBumpTemplates } from '@/lib/checkout/order-bump-logic';
import type { OrderBumpConfig } from '@/lib/checkout/order-bump-logic';

// Define custom order bumps
const customBumps: OrderBumpConfig[] = [
  {
    ...orderBumpTemplates.expressShipping,
    position: 'before_payment',
  },
  {
    productId: 'care-kit',
    productName: 'Premium Care Kit',
    productDescription: 'Everything you need to maintain your purchase',
    productImage: '/images/care-kit.jpg',
    originalPrice: 2999,
    discountType: 'percentage',
    discountValue: 40,
    position: 'before_payment',
    conditions: {
      minCartValue: 5000, // Only show if cart > $50
    },
  },
  {
    ...orderBumpTemplates.membershipTrial,
    position: 'after_payment',
  },
];
---

<Layout title="Checkout" sidebarInitialCollapsed={true}>
  <div class="container mx-auto max-w-6xl py-8">
    <CheckoutWithBumps
      client:load
      bumpConfigs={customBumps}
      maxBumps={3}
      showBumpsBeforePayment={true}
      showBumpsAfterPayment={false}
    />
  </div>
</Layout>
```

### Standalone Usage

```tsx
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $cart } from '@/stores/cart';
import {
  $checkoutSession,
  checkoutActions
} from '@/stores/checkout';
import { OrderBumpList } from '@/components/checkout/OrderBump';
import {
  selectOrderBumps,
  orderBumpTemplates
} from '@/lib/checkout/order-bump-logic';

export function MyCheckout() {
  const cart = useStore($cart);
  const session = useStore($checkoutSession);

  useEffect(() => {
    // Initialize bumps
    const configs = [
      orderBumpTemplates.expressShipping,
      orderBumpTemplates.giftWrapping,
    ];

    const bumps = selectOrderBumps(cart.items, configs, 2);
    checkoutActions.initializeOrderBumps(bumps);
  }, [cart.items.length]);

  return (
    <div>
      <h2>Special Offers</h2>
      <OrderBumpList
        bumps={session.orderBumps}
        acceptedBumpIds={session.acceptedBumpIds}
        onToggle={checkoutActions.toggleOrderBump}
        maxBumps={2}
      />
    </div>
  );
}
```

## Styling Variants

### Default Variant
Full product display with image, description, and pricing.

```tsx
<OrderBump bump={bump} accepted={accepted} onToggle={toggle} variant="default" />
```

### Compact Variant
Minimal one-line display for space-constrained layouts.

```tsx
<OrderBump bump={bump} accepted={accepted} onToggle={toggle} variant="compact" />
```

### Featured Variant
Emphasized display with urgency indicators and special styling.

```tsx
<OrderBump bump={bump} accepted={accepted} onToggle={toggle} variant="featured" />
```

## Best Practices

### 1. Positioning Strategy

**Before Payment:**
- Express shipping
- Gift wrapping
- Product protection
- Insurance

**After Payment:**
- Extended warranties
- Membership trials
- Future discounts
- Referral bonuses

### 2. Discount Strategy

**High acceptance (40-60%):**
- 30-50% off
- Free shipping upgrades
- Small add-ons under $20

**Medium acceptance (20-40%):**
- 20-30% off
- Extended warranties
- Premium services

**Low acceptance (10-20%):**
- 10-20% off
- High-value add-ons
- Subscription trials

### 3. Limit Bumps

Show **maximum 3 bumps** to avoid overwhelming customers:
- 2 before payment (most important)
- 1 after payment (bonus offer)

### 4. Test and Optimize

Track metrics:
- Acceptance rate by product
- Average order value increase
- Revenue per bump
- Conversion impact

## Troubleshooting

### Bumps not showing

Check that:
1. Bumps are initialized: `checkoutActions.initializeOrderBumps(bumps)`
2. Conditions are met: `meetsConditions(cart, conditions)`
3. MaxBumps setting allows bumps: `maxBumps={3}`

### Analytics not tracking

Verify:
1. Google Analytics is loaded: `window.gtag`
2. Events are firing: Check browser console
3. GA4 measurement ID is configured

### Payment intent not updating

Ensure:
1. Accepted bumps are retrieved: `checkoutActions.getAcceptedBumps()`
2. Payment intent is updated: `updatePaymentIntentWithBumps()`
3. Backend receives bump items in request

## Files Created

- `/web/src/stores/checkout.ts` - State management
- `/web/src/components/checkout/OrderBump.tsx` - UI components
- `/web/src/lib/checkout/order-bump-logic.ts` - Business logic
- `/web/src/components/checkout/CheckoutWithBumps.tsx` - Complete checkout
- `/web/src/components/checkout/ORDER-BUMP-README.md` - This documentation

## Next Steps

1. **Integrate with CheckoutWidget** - Add bumps to crypto checkout
2. **A/B testing** - Test different bump configurations
3. **Dynamic bumps** - AI-powered bump recommendations
4. **Email bumps** - Post-purchase bump offers via email
5. **Mobile optimization** - Optimize bump display for mobile

---

**Cycle 83 Complete** ✅ Order bump system ready for production!
