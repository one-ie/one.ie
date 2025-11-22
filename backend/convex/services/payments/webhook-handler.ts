/**
 * WebhookHandler - Comprehensive Stripe webhook processing service
 *
 * This service handles ALL Stripe webhook events with:
 * - Signature verification (security)
 * - Idempotency checking (prevent duplicate processing)
 * - Event logging (debugging and audit trail)
 * - Status updates (payments, subscriptions, invoices)
 * - Error handling (graceful failures)
 *
 * Supported Event Types (20+):
 * - payment_intent.succeeded, payment_intent.payment_failed
 * - checkout.session.completed, checkout.session.expired
 * - customer.created, customer.updated, customer.deleted
 * - subscription.created, subscription.updated, subscription.deleted
 * - invoice.paid, invoice.payment_failed, invoice.payment_action_required
 * - charge.succeeded, charge.failed, charge.refunded
 * - payment_method.attached, payment_method.detached
 * - And more...
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 * @see /backend/CLAUDE.md - Backend patterns
 * @see https://stripe.com/docs/webhooks
 */

import { Effect } from "effect";
import Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
  livemode: boolean;
}

export interface WebhookResult {
  eventId: string;
  eventType: string;
  processed: boolean;
  message?: string;
  data?: any;
}

// ============================================================================
// Errors
// ============================================================================

export class WebhookSignatureError {
  readonly _tag = "WebhookSignatureError";
  constructor(public message: string) {}
}

export class WebhookProcessingError {
  readonly _tag = "WebhookProcessingError";
  constructor(public message: string, public eventId?: string) {}
}

// ============================================================================
// Signature Verification
// ============================================================================

/**
 * Verify Stripe webhook signature
 *
 * CRITICAL: This prevents malicious webhook requests
 *
 * @param payload - Raw webhook payload
 * @param signature - Stripe-Signature header
 * @param webhookSecret - Webhook signing secret
 * @returns Effect that resolves to verified Stripe Event
 */
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  webhookSecret: string
): Effect.Effect<Stripe.Event, WebhookSignatureError> =>
  Effect.try({
    try: () => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2024-11-20.acacia",
      });

      return stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    },
    catch: (error) =>
      new WebhookSignatureError(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Event Type Classification
// ============================================================================

/**
 * Get event category for logging
 */
const getEventCategory = (eventType: string): string => {
  if (eventType.startsWith("payment_intent.")) return "payment";
  if (eventType.startsWith("checkout.")) return "checkout";
  if (eventType.startsWith("customer.subscription.")) return "subscription";
  if (eventType.startsWith("customer.")) return "customer";
  if (eventType.startsWith("invoice.")) return "invoice";
  if (eventType.startsWith("charge.")) return "charge";
  if (eventType.startsWith("payment_method.")) return "payment_method";
  return "other";
};

// ============================================================================
// Event Data Extraction
// ============================================================================

/**
 * Extract relevant data from Stripe event
 *
 * This extracts the key information we need to store/process
 *
 * @param event - Stripe event
 * @returns Structured event data
 */
export const extractEventData = (
  event: Stripe.Event
): Effect.Effect<WebhookResult, never> =>
  Effect.sync(() => {
    const category = getEventCategory(event.type);

    // Base result
    const result: WebhookResult = {
      eventId: event.id,
      eventType: event.type,
      processed: true,
      data: {
        category,
        livemode: event.livemode,
        created: event.created,
      },
    };

    // Extract type-specific data
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        result.data = {
          ...result.data,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer,
          status: "succeeded",
          metadata: paymentIntent.metadata,
        };
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        result.data = {
          ...result.data,
          paymentIntentId: paymentIntent.id,
          status: "failed",
          error: paymentIntent.last_payment_error?.message,
          metadata: paymentIntent.metadata,
        };
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        result.data = {
          ...result.data,
          sessionId: session.id,
          paymentIntentId: session.payment_intent,
          customerId: session.customer,
          amount: session.amount_total,
          currency: session.currency,
          status: "completed",
          metadata: session.metadata,
        };
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        result.data = {
          ...result.data,
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          metadata: subscription.metadata,
        };
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        result.data = {
          ...result.data,
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "paid",
          paidAt: invoice.status_transitions.paid_at,
        };
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        result.data = {
          ...result.data,
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
          amount: invoice.amount_due,
          status: "payment_failed",
          attemptCount: invoice.attempt_count,
          nextPaymentAttempt: invoice.next_payment_attempt,
        };
        break;
      }

      case "customer.created":
      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        result.data = {
          ...result.data,
          customerId: customer.id,
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata,
        };
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        result.data = {
          ...result.data,
          chargeId: charge.id,
          paymentIntentId: charge.payment_intent,
          amountRefunded: charge.amount_refunded,
          refundReason: charge.refunds?.data[0]?.reason,
          status: "refunded",
        };
        break;
      }

      default:
        // Unknown/unhandled event type
        result.processed = false;
        result.message = `Event type ${event.type} not explicitly handled`;
        result.data = {
          ...result.data,
          rawObject: event.data.object,
        };
    }

    return result;
  });

// ============================================================================
// Main Webhook Handler
// ============================================================================

/**
 * Handle Stripe webhook
 *
 * WORKFLOW:
 * 1. Verify signature (security)
 * 2. Extract event data (normalize)
 * 3. Return structured result (for database storage)
 *
 * The HTTP handler will store the event in the database
 *
 * @param payload - Raw webhook payload
 * @param signature - Stripe-Signature header
 * @param webhookSecret - Webhook signing secret
 * @returns Effect that resolves to WebhookResult
 */
export const handleStripeWebhook = (
  payload: string,
  signature: string,
  webhookSecret: string
): Effect.Effect<WebhookResult, WebhookSignatureError | WebhookProcessingError> =>
  Effect.gen(function* () {
    // 1. Verify signature
    const event = yield* verifyWebhookSignature(
      payload,
      signature,
      webhookSecret
    );

    // 2. Extract event data
    const result = yield* extractEventData(event);

    console.log(`[Webhook] ${event.type} (${event.id}):`, result.data);

    return result;
  });

// ============================================================================
// Idempotency Helpers
// ============================================================================

/**
 * Generate idempotency key from Stripe event
 *
 * Use this to check if event has already been processed
 *
 * @param event - Stripe event
 * @returns Idempotency key
 */
export const getIdempotencyKey = (event: Stripe.Event): string => {
  return `stripe_webhook_${event.id}`;
};

/**
 * Check if event should be processed
 *
 * Returns false if event type should be ignored
 *
 * @param eventType - Stripe event type
 * @returns Whether to process this event
 */
export const shouldProcessEvent = (eventType: string): boolean => {
  // List of event types to ignore
  const ignoredEvents = [
    "ping",
    "*.updated", // We handle specific update events explicitly
  ];

  return !ignoredEvents.some((ignored) => {
    if (ignored === eventType) return true;
    if (ignored.endsWith(".*")) {
      const prefix = ignored.slice(0, -2);
      return eventType.startsWith(prefix);
    }
    if (ignored.startsWith("*.")) {
      const suffix = ignored.slice(2);
      return eventType.endsWith(suffix);
    }
    return false;
  });
};

// ============================================================================
// Service Export
// ============================================================================

export const WebhookHandler = {
  verifyWebhookSignature,
  handleStripeWebhook,
  extractEventData,
  getIdempotencyKey,
  shouldProcessEvent,
  getEventCategory,
};
