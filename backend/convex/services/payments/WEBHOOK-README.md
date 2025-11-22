# Stripe Webhook Handler

## Overview

This webhook handler processes all Stripe payment events with:
- **Signature verification** (prevents unauthorized requests)
- **Idempotency checking** (prevents duplicate processing)
- **Event logging** (complete audit trail)
- **Error handling** (graceful failure recovery)
- **20+ event types** (payments, subscriptions, invoices, refunds)

## Architecture

```
Stripe → /api/webhooks/stripe → WebhookHandler → Database
                ↓                      ↓              ↓
          Verify Signature      Extract Data    Log Events
          Check Idempotency     Normalize       Update Status
```

## Setup

### 1. Configure Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://<your-domain>/api/webhooks/stripe`
4. Select events to listen for (see Supported Events below)
5. Copy the **Signing secret** (starts with `whsec_`)

### 2. Add Environment Variable

Add the webhook secret to your Convex environment:

```bash
# Backend environment (.env.local or Convex dashboard)
STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### 3. Deploy Backend

```bash
cd backend/
npx convex deploy
```

Your webhook endpoint is now live at:
- **Production**: `https://<your-convex-app>.convex.site/api/webhooks/stripe`
- **Development**: `http://localhost:3000/api/webhooks/stripe`

## Supported Events

### Payment Events
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Payment refunded

### Checkout Events
- `checkout.session.completed` - Checkout session completed

### Subscription Events
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated (plan change, cancellation)
- `customer.subscription.deleted` - Subscription cancelled

### Invoice Events
- `invoice.paid` - Invoice paid successfully
- `invoice.payment_failed` - Invoice payment failed
- `invoice.payment_action_required` - Payment requires customer action

### Customer Events
- `customer.created` - Customer account created
- `customer.updated` - Customer details updated

## Event Flow

### 1. Payment Intent Succeeded

```
Stripe sends webhook → Verify signature → Find payment thing
                                        ↓
                        Update payment status to "succeeded"
                                        ↓
                        Log purchase_completed event
                                        ↓
                        Return 200 OK to Stripe
```

**Database Updates:**
- `things` table: Update payment status to "published"
- `events` table: Create "purchase_completed" event
- `connections` table: Link customer to payment

### 2. Subscription Created

```
Stripe sends webhook → Verify signature → Find customer
                                        ↓
                        Create subscription thing
                                        ↓
                        Create ownership connection
                                        ↓
                        Log subscription_event
                                        ↓
                        Return 200 OK to Stripe
```

**Database Updates:**
- `things` table: Create subscription thing
- `connections` table: Link customer to subscription
- `events` table: Create "subscription_event"

### 3. Invoice Payment Failed

```
Stripe sends webhook → Verify signature → Find subscription
                                        ↓
                        Log payment failure event
                                        ↓
                        (Trigger retry logic if needed)
                                        ↓
                        Return 200 OK to Stripe
```

**Database Updates:**
- `events` table: Create "payment_event" with failure details

## Testing

### Test in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select event type (e.g., `payment_intent.succeeded`)
5. Click **Send test webhook**
6. Check Convex logs for processing confirmation

### Test with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Trigger a test event
stripe trigger payment_intent.succeeded
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

### Test Endpoint (Development Only)

```bash
# Send test webhook without signature verification
curl -X POST http://localhost:3000/api/webhooks/stripe/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 5000,
        "currency": "usd"
      }
    }
  }'
```

## Idempotency

The webhook handler ensures each event is processed exactly once:

1. **Stripe Event ID**: Each event has unique ID (e.g., `evt_1234567890`)
2. **Database Check**: Query `events` table for `stripeEventId`
3. **Skip Duplicates**: If event exists, return 200 without processing
4. **Log New Events**: Store event ID in `events` table

This prevents:
- Duplicate payments
- Multiple subscription creations
- Duplicate email notifications

## Error Handling

### Signature Verification Fails

```json
{
  "error": "Missing signature",
  "status": 400
}
```

**Action**: Check `stripe-signature` header is present

### Webhook Secret Not Configured

```json
{
  "error": "Webhook not configured",
  "status": 500
}
```

**Action**: Set `STRIPE_WEBHOOK_SECRET` environment variable

### Event Processing Fails

```json
{
  "received": true,
  "error": "Failed to update payment",
  "details": "Error stack trace..."
}
```

**Action**: Check Convex logs for detailed error, fix bug, Stripe will retry

## Webhook Retry Logic

Stripe automatically retries failed webhooks:
- **Retry Schedule**: Stripe retries up to 3 days
- **Success Response**: Return 200 status to stop retries
- **Failure Response**: Return 500 status to trigger retry
- **Best Practice**: Return 200 even on errors (prevents excessive retries)

## Security

### Signature Verification

```typescript
// Stripe constructs event from payload + signature
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  webhookSecret
);

// If signature invalid, throws error
// This prevents unauthorized webhook requests
```

### HTTPS Required

- **Production**: MUST use HTTPS
- **Development**: HTTP acceptable (use Stripe CLI for local testing)

### Webhook Secret Rotation

If webhook secret is compromised:
1. Generate new secret in Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` environment variable
3. Redeploy backend

## Monitoring

### Webhook Logs

All webhook events are logged to `events` table:

```sql
SELECT * FROM events
WHERE metadata.protocol = 'stripe'
  AND metadata.eventType = 'webhook_received'
ORDER BY timestamp DESC
LIMIT 100
```

### Failed Webhooks

```sql
SELECT * FROM events
WHERE metadata.protocol = 'stripe'
  AND metadata.processed = false
ORDER BY timestamp DESC
```

### Webhook Performance

Check Convex logs for:
- Processing time: `[Webhook] payment_intent.succeeded processed in 250ms`
- Errors: `[Webhook] Failed to process event: Error message`
- Retries: `[Webhook] Event evt_123 already processed, skipping`

## Troubleshooting

### Webhook Not Receiving Events

1. **Check Stripe Dashboard**: Verify webhook endpoint is active
2. **Check URL**: Ensure URL matches deployed Convex app
3. **Check Logs**: Look for incoming webhook requests in Convex logs

### Signature Verification Fails

1. **Check Secret**: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. **Check Payload**: Ensure raw body is passed to verification (not parsed JSON)
3. **Check Headers**: Ensure `stripe-signature` header is present

### Events Not Updating Database

1. **Check Logs**: Look for error messages in Convex logs
2. **Check Permissions**: Ensure internal mutations are accessible
3. **Check Data**: Verify payment/subscription exists in database

## Production Checklist

- [ ] HTTPS enabled on webhook URL
- [ ] `STRIPE_WEBHOOK_SECRET` configured in production environment
- [ ] Webhook endpoint added to Stripe Dashboard
- [ ] All relevant events selected in Stripe
- [ ] Test webhook sending from Stripe Dashboard
- [ ] Monitor webhook logs for errors
- [ ] Set up alerts for failed webhooks
- [ ] Remove development test endpoint

## Files

- `/backend/convex/http.ts` - HTTP endpoint definition
- `/backend/convex/services/payments/webhook-handler.ts` - Event processing logic
- `/backend/convex/internal/webhooks.ts` - Database update mutations
- `/backend/convex/mutations/payments.ts` - Existing payment mutations

## Support

For questions or issues:
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Convex HTTP Actions Documentation](https://docs.convex.dev/functions/http-actions)
- Check Convex logs for detailed error messages
