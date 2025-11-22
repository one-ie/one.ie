# Stripe Payment Integration

Complete Stripe payment processing integration for the ONE Platform funnel builder.

## Overview

This integration enables funnels to accept payments through Stripe with the following features:

- **Payment Intents**: Create and confirm payments
- **Checkout Sessions**: Redirect to Stripe-hosted checkout
- **Customer Management**: Create and manage Stripe customers
- **Product/Price Management**: Create products and pricing
- **Webhook Handling**: Process Stripe webhook events
- **Event Logging**: Complete audit trail of payment events

## Architecture

```
Frontend (React)           Backend (Convex)              Stripe API
────────────────           ────────────────              ──────────
PaymentSettingsClient  →   mutations/payments.ts    →   Stripe SDK
stripe-client.ts       →   services/payments/stripe.ts  ↓
                           ↓                            Events
                           queries/payments.ts      ←   Webhooks
                           ↓
                           events table (audit trail)
```

## Files Created

### Backend

1. **`services/payments/stripe.ts`** - Effect.ts service layer
   - Stripe client initialization
   - Payment intent operations
   - Customer operations
   - Product/price operations
   - Webhook verification and processing

2. **`mutations/payments.ts`** - Convex mutations
   - `createPaymentIntent` - Create payment intent
   - `createCheckoutSession` - Create checkout session
   - `handleWebhook` - Process webhook events
   - `createStripeProduct` - Create Stripe product
   - `createStripePrice` - Create Stripe price

3. **`queries/payments.ts`** - Convex queries
   - `listFunnelPayments` - List payments for funnel
   - `getPayment` - Get payment details
   - `getFunnelPaymentSettings` - Get Stripe settings
   - `getPaymentStats` - Get payment statistics
   - `listOrganizationPayments` - List all payments

### Frontend

4. **`lib/stripe/stripe-client.ts`** - Frontend utilities
   - Stripe.js initialization
   - Payment Element mounting
   - Checkout redirection
   - Error handling
   - Currency formatting

5. **`components/payments/PaymentSettingsClient.tsx`** - Settings UI
   - Create Stripe products
   - Configure pricing
   - View current settings
   - Form validation

6. **`pages/funnels/[id]/payment-settings.astro`** - Settings page
   - Astro page wrapper
   - Layout integration

## Setup Instructions

### 1. Install Dependencies

Backend (already installed):
```bash
cd backend
npm install stripe
```

Frontend (already installed):
```bash
cd web
bun add @stripe/stripe-js
```

### 2. Get Stripe API Keys

1. Sign up for Stripe: https://dashboard.stripe.com/register
2. Get your API keys: https://dashboard.stripe.com/apikeys
3. Get webhook secret: https://dashboard.stripe.com/webhooks

### 3. Configure Environment Variables

**Backend (Convex):**

Add to `.env.local` or Convex dashboard:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

Set via Convex CLI:
```bash
cd backend
npx convex env set STRIPE_SECRET_KEY sk_test_YOUR_KEY_HERE
npx convex env set STRIPE_WEBHOOK_SECRET whsec_YOUR_SECRET_HERE
```

**Frontend (Astro):**

Add to `.env`:

```bash
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### 4. Configure Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-convex-url.convex.cloud/handleWebhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.created`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Usage

### 1. Configure Payment Settings

Navigate to funnel payment settings:
```
/funnels/[funnelId]/payment-settings
```

Steps:
1. Create Stripe product
2. Configure pricing (one-time or recurring)
3. View confirmation

### 2. Accept Payments (Payment Intent Flow)

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { mountPaymentElement, confirmPayment } from "@/lib/stripe/stripe-client";

function CheckoutForm({ funnelId, amount }) {
  const createPaymentIntent = useMutation(api.mutations.payments.createPaymentIntent);
  const [clientSecret, setClientSecret] = useState(null);
  const [elements, setElements] = useState(null);

  // 1. Create payment intent
  const handleCreatePayment = async () => {
    const result = await createPaymentIntent({
      funnelId,
      amount: amount * 100, // Convert to cents
      currency: "usd",
      description: "Purchase via funnel"
    });

    setClientSecret(result.clientSecret);
  };

  // 2. Mount payment element
  useEffect(() => {
    if (clientSecret) {
      mountPaymentElement({
        clientSecret,
        elementId: "payment-element"
      }).then(setElements);
    }
  }, [clientSecret]);

  // 3. Confirm payment
  const handleConfirm = async () => {
    if (!elements) return;

    const result = await confirmPayment(elements, "/success");
    if (result.success) {
      console.log("Payment successful!");
    }
  };

  return (
    <div>
      <div id="payment-element"></div>
      <button onClick={handleConfirm}>Pay Now</button>
    </div>
  );
}
```

### 3. Accept Payments (Checkout Session Flow)

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createCheckoutSession } from "@/lib/stripe/stripe-client";

function BuyButton({ funnelId, priceId }) {
  const createSession = useMutation(api.mutations.payments.createCheckoutSession);

  const handleCheckout = async () => {
    await createCheckoutSession(
      {
        funnelId,
        priceId,
        quantity: 1
      },
      createSession
    );
  };

  return <button onClick={handleCheckout}>Buy Now</button>;
}
```

### 4. View Payment Data

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function PaymentDashboard({ funnelId }) {
  const payments = useQuery(api.queries.payments.listFunnelPayments, {
    funnelId,
    status: "published" // Successful payments
  });

  const stats = useQuery(api.queries.payments.getPaymentStats, {
    funnelId
  });

  return (
    <div>
      <h2>Revenue: ${stats?.totalRevenue / 100}</h2>
      <h3>Payments: {stats?.successfulPayments}</h3>

      {payments?.map(payment => (
        <div key={payment._id}>
          {payment.customer?.name} - ${payment.properties.amount / 100}
        </div>
      ))}
    </div>
  );
}
```

## Ontology Mapping

The Stripe integration follows the 6-dimension ontology:

### 1. Groups (Multi-Tenant Isolation)
- Every payment has `groupId`
- Payments scoped to organization
- No cross-tenant access

### 2. People (Authorization)
- Stripe customers linked to people
- `stripeCustomerId` stored in person properties
- Role-based access (org_owner can configure)

### 3. Things (Entities)
- Payment → `thing` with `type: "payment"`
- Properties: `stripePaymentIntentId`, `amount`, `currency`, `status`
- Funnel → `properties.stripeProductId`, `properties.stripePriceId`

### 4. Connections (Relationships)
- `customer_purchased_via_funnel` - Person → Payment
- Links customer to payment and funnel

### 5. Events (Audit Trail)
- `payment_event` - Generic payment event with `metadata.eventType`
  - `payment_intent_created`
  - `checkout_session_created`
  - `checkout_completed`
  - `webhook_received`
- `purchase_completed` - Successful purchase
- `entity_updated` - Funnel product/price created

### 6. Knowledge (Future)
- Could embed payment descriptions for search
- Customer purchase patterns for recommendations

## Event Flow

### Payment Intent Flow

```
1. User clicks "Pay Now"
   ↓
2. Frontend calls createPaymentIntent mutation
   ↓
3. Backend:
   - Authenticates user
   - Creates Stripe customer (if needed)
   - Creates payment intent via StripeService
   - Creates payment thing
   - Creates connection
   - Logs payment_event
   ↓
4. Frontend receives clientSecret
   ↓
5. Mounts Payment Element
   ↓
6. User enters card details
   ↓
7. Frontend confirms payment
   ↓
8. Stripe processes payment
   ↓
9. Webhook received:
   - payment_intent.succeeded
   - Updates payment status to "published"
   - Logs purchase_completed event
```

### Checkout Session Flow

```
1. User clicks "Buy Now"
   ↓
2. Frontend calls createCheckoutSession mutation
   ↓
3. Backend:
   - Creates Stripe customer (if needed)
   - Creates checkout session via StripeService
   - Logs payment_event
   ↓
4. Frontend redirects to Stripe Checkout
   ↓
5. User completes payment on Stripe
   ↓
6. Stripe redirects to success URL
   ↓
7. Webhook received:
   - checkout.session.completed
   - Logs payment_event
```

## Error Handling

### Backend Errors

All service functions return Effect types with error handling:

```typescript
// Stripe initialization error
StripeInitializationError { message }

// Payment errors
StripePaymentError { message, code }

// Customer errors
StripeCustomerError { message }

// Product errors
StripeProductError { message }

// Webhook errors
StripeWebhookError { message }
```

### Frontend Errors

```typescript
import { parseStripeError } from "@/lib/stripe/stripe-client";

try {
  await confirmPayment(elements);
} catch (error) {
  const message = parseStripeError(error);
  toast.error(message);
}
```

## Testing

### Test Mode

Development uses Stripe test mode:
- Test API keys (starts with `sk_test_` / `pk_test_`)
- Test cards: https://stripe.com/docs/testing#cards
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - 3D Secure: `4000 0025 0000 3155`

### Webhook Testing

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local Convex
stripe listen --forward-to https://your-convex-url.convex.cloud/handleWebhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
```

## Security

### API Key Protection

- Backend: Never expose `STRIPE_SECRET_KEY` to frontend
- Frontend: Only use `PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Webhook: Verify signature with `STRIPE_WEBHOOK_SECRET`

### Payment Verification

- Always verify payments via webhooks (not frontend)
- Check payment status before fulfillment
- Validate amounts match expected values

### Multi-Tenant Isolation

- All mutations check `groupId`
- Customers can only see their own payments
- Org owners can see all payments in their group

## Production Checklist

Before going live:

- [ ] Switch to live Stripe API keys (`sk_live_`, `pk_live_`)
- [ ] Configure production webhook endpoint
- [ ] Test payment flow end-to-end
- [ ] Set up payment failure notifications
- [ ] Configure email receipts in Stripe dashboard
- [ ] Enable fraud detection (Stripe Radar)
- [ ] Set up bank account for payouts
- [ ] Review Stripe pricing and fees
- [ ] Enable HTTPS for all endpoints
- [ ] Test refund flow
- [ ] Set up monitoring for failed payments

## Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Dashboard**: https://dashboard.stripe.com
- **API Reference**: https://stripe.com/docs/api
- **Testing**: https://stripe.com/docs/testing
- **Webhooks**: https://stripe.com/docs/webhooks
- **Security**: https://stripe.com/docs/security

## Support

For issues with this integration:
1. Check Stripe dashboard for errors
2. Check Convex logs for backend errors
3. Check browser console for frontend errors
4. Review webhook delivery in Stripe dashboard
5. Test with Stripe test cards
6. Verify environment variables are set correctly

---

**Built with the 6-dimension ontology. Payments never break because reality doesn't change.**
