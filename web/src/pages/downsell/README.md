# Downsell Page Documentation

## Overview

The downsell page is part of the sales funnel optimization strategy. When a customer declines an upsell offer, they're presented with a lower-priced alternative as a "last chance" offer before completing their order.

## Purpose

- **Increase AOV (Average Order Value)**: Capture customers who declined the upsell but might accept a cheaper option
- **Maximize conversions**: Offer value at multiple price points
- **Reduce buyer's remorse**: Give customers a middle-ground option

## Flow Diagram

```
Customer Completes Purchase
         ↓
    Upsell Page
         ↓
    [User Decision]
         ↓
    ┌────┴────┐
    ↓         ↓
 Accept    Decline
    ↓         ↓
 Order   Downsell Page ← YOU ARE HERE
Complete      ↓
         [User Decision]
              ↓
         ┌────┴────┐
         ↓         ↓
      Accept    Decline
         ↓         ↓
      Order     Order
    Complete  Complete
```

## Usage

### 1. Redirect from Upsell Page

When user clicks "No thanks" on upsell:

```typescript
// In your upsell page
const handleDecline = () => {
  // Pass original order ID for payment method reuse
  window.location.href = `/downsell/basic-course?orderId=${originalOrderId}`;
};
```

### 2. Available Downsell Offers

Currently defined offers (in `[offerId].astro`):

- **`basic-course`** - $97 (from $297)
  - Complete video course
  - Workbooks and templates
  - Community access

- **`starter-toolkit`** - $197 (from $497)
  - 50+ templates
  - Quick-start tutorials
  - 1 month email coaching

- **`mini-membership`** - $297 (from $997)
  - 3 months platform access
  - Weekly coaching calls
  - All course materials

### 3. Add New Downsell Offers

Edit `/web/src/pages/downsell/[offerId].astro`:

```typescript
const downsellOffers: Record<string, {...}> = {
  "your-offer-id": {
    productName: "Your Product Name",
    originalPrice: 497,
    downsellPrice: 197,
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3",
    ],
    image: "/images/your-product.jpg", // Optional
  },
};
```

## Component: DownsellOffer

Location: `/web/src/components/checkout/DownsellOffer.tsx`

### Props

```typescript
interface DownsellOfferProps {
  offerId: string;              // Unique offer identifier
  productName: string;          // Display name
  originalPrice: number;        // Original price (for comparison)
  downsellPrice: number;        // Discounted price
  savings: number;              // Calculated savings amount
  features: string[];           // Value stack list
  image?: string;               // Product image URL
  onAccept: (offerId: string) => Promise<void>;  // Accept handler
  onDecline: () => void;        // Decline handler
}
```

### Features

✅ **One-click purchase** - Uses saved payment method from original order
✅ **Urgency messaging** - "Last chance" and "Won't last" copy
✅ **Value emphasis** - Shows savings percentage and dollar amount
✅ **Trust badges** - Secure payment, guarantee, instant access
✅ **Mobile responsive** - Works on all devices
✅ **Dark mode support** - Follows system theme
✅ **Error handling** - Displays payment errors gracefully
✅ **Analytics tracking** - Tracks views and declines

## Backend Integration

### Required API Endpoint

Create `/api/downsell/accept`:

```typescript
// POST /api/downsell/accept
{
  "offerId": "basic-course",
  "originalOrderId": "pi_xxxxxxxxxxxxx"
}

// Response
{
  "orderId": "order_yyyyyyyyyyy",
  "sessionId": "cs_zzzzzzzzzzzz",
  "success": true
}
```

### Implementation Steps

1. **Retrieve Original Payment Method**
   ```typescript
   const originalIntent = await stripe.paymentIntents.retrieve(
     originalOrderId
   );
   const paymentMethod = originalIntent.payment_method;
   const customer = originalIntent.customer;
   ```

2. **Create New PaymentIntent**
   ```typescript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: downsellPrice * 100, // Convert to cents
     currency: 'usd',
     customer: customer,
     payment_method: paymentMethod,
     off_session: true, // One-click, no customer interaction
     confirm: true,     // Immediately charge
     metadata: {
       type: 'downsell',
       offerId: offerId,
       originalOrderId: originalOrderId,
     },
   });
   ```

3. **Create Order Record**
   ```typescript
   const order = await db.orders.create({
     userId: userId,
     productId: offerId,
     amount: downsellPrice,
     type: 'downsell',
     parentOrderId: originalOrderId,
     status: 'completed',
   });
   ```

4. **Send Confirmation Email**
   ```typescript
   await sendEmail({
     to: customer.email,
     subject: 'Order Confirmation - Bonus Offer',
     template: 'downsell-confirmation',
     data: { order, product },
   });
   ```

5. **Return Response**
   ```typescript
   return {
     orderId: order.id,
     sessionId: paymentIntent.id,
     success: true,
   };
   ```

## Analytics Tracking

The page automatically tracks:

- **Page views** - `gtag('event', 'page_view')`
- **Downsell declined** - `gtag('event', 'downsell_declined')`

Add custom tracking for accepts:

```typescript
// In your API endpoint
gtag('event', 'downsell_accepted', {
  offer_id: offerId,
  revenue: downsellPrice,
});
```

## Conversion Optimization Tips

### Copy Best Practices

✅ **Use "Wait!" or "Before you go..."** - Creates pause
✅ **Emphasize scarcity** - "This price won't last"
✅ **Show savings** - "$200 OFF" is stronger than "60% discount"
✅ **One-time offer language** - "If you leave, you'll lose access"
✅ **Easy decline** - Don't hide the skip button

### Design Best Practices

✅ **Single focus** - One offer, one decision
✅ **Clear pricing** - Show original vs. downsell price
✅ **Visual value** - Use checkmarks and feature lists
✅ **Mobile-first** - Most traffic is mobile
✅ **Fast loading** - No heavy images or scripts

### Pricing Strategy

- **Downsell should be 30-50% of upsell price**
  - Too high: No added value
  - Too low: Devalues original offer

- **Example pricing ladder**:
  - Main product: $97
  - Upsell: $297 (3x)
  - Downsell: $147 (1.5x)

## Testing

### Manual Testing

1. Navigate to: `http://localhost:4321/downsell/basic-course`
2. Test accept flow (mock API response)
3. Test decline flow (redirects to confirmation)
4. Verify mobile responsive design
5. Test dark mode

### A/B Testing Ideas

- Test different discount levels (30% vs 50%)
- Test scarcity messaging ("limited time" vs "one-time")
- Test feature list length (3 vs 5 vs 10 features)
- Test image vs no image
- Test "Accept" button copy variations

## Metrics to Track

- **Downsell show rate** - % of upsell declines that see downsell
- **Downsell acceptance rate** - % who accept downsell
- **Revenue per downsell** - Average downsell order value
- **AOV increase** - How much downsell increases average order value

**Target benchmarks:**
- Downsell acceptance rate: 15-30%
- AOV increase: 10-20%

## Future Enhancements

- [ ] Dynamic pricing based on original order value
- [ ] Personalized offers based on customer history
- [ ] A/B testing framework built-in
- [ ] Countdown timer for urgency
- [ ] Exit-intent popup for second downsell
- [ ] Video testimonials
- [ ] Live chat support
- [ ] Payment plan option

## Related Files

- `/web/src/pages/downsell/[offerId].astro` - Main page
- `/web/src/components/checkout/DownsellOffer.tsx` - Component
- `/web/src/components/shop/buy-in-chatgpt/PaymentProcessor.tsx` - Payment reference
- `/web/src/pages/shop/orders/thank-you-product.astro` - Order confirmation

## Support

For questions or issues, see:
- [Sales Funnel Documentation](/docs/funnels)
- [Stripe Integration Guide](/docs/stripe)
- [Analytics Setup](/docs/analytics)
