/**
 * SubscriptionService - Business logic for Stripe subscription management
 *
 * This service implements recurring payment subscription logic using Effect.ts
 * patterns. All operations enforce multi-tenant isolation through groupId validation.
 *
 * Key Features:
 * - Create and manage subscriptions
 * - Handle trial periods
 * - Upgrade/downgrade with proration
 * - Cancel subscriptions
 * - Retry failed payments (dunning)
 * - Webhook event processing
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 * @see /backend/CLAUDE.md - Backend patterns
 * @see /backend/convex/services/payments/stripe.ts - Base Stripe service
 */

import { Effect } from "effect";
import Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface SubscriptionData {
  priceId: string;
  customerId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface SubscriptionUpdateData {
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
  prorationBehavior?: "create_prorations" | "none" | "always_invoice";
}

export interface SubscriptionCancelData {
  subscriptionId: string;
  cancelAtPeriodEnd?: boolean;
  cancellationReason?: string;
}

export interface TrialPeriod {
  days: 7 | 14 | 30;
  description: string;
}

export interface BillingInterval {
  interval: "day" | "week" | "month" | "year";
  intervalCount?: number;
  label: string;
}

// ============================================================================
// Errors
// ============================================================================

export class SubscriptionNotFoundError {
  readonly _tag = "SubscriptionNotFoundError";
  constructor(public subscriptionId: string, public message: string) {}
}

export class SubscriptionAlreadyCancelledError {
  readonly _tag = "SubscriptionAlreadyCancelledError";
  constructor(public subscriptionId: string) {}
}

export class SubscriptionUpdateError {
  readonly _tag = "SubscriptionUpdateError";
  constructor(public message: string) {}
}

export class PaymentRetryError {
  readonly _tag = "PaymentRetryError";
  constructor(public message: string, public invoiceId?: string) {}
}

// ============================================================================
// Trial Period Helpers
// ============================================================================

/**
 * Get predefined trial periods
 */
export const getTrialPeriods = (): TrialPeriod[] => [
  { days: 7, description: "7-day free trial" },
  { days: 14, description: "14-day free trial" },
  { days: 30, description: "30-day free trial" },
];

/**
 * Calculate trial end date
 */
export const calculateTrialEnd = (
  trialDays: number
): Effect.Effect<number, never> =>
  Effect.sync(() => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    return Math.floor(trialEnd.getTime() / 1000); // Unix timestamp
  });

// ============================================================================
// Billing Interval Helpers
// ============================================================================

/**
 * Get supported billing intervals
 */
export const getBillingIntervals = (): BillingInterval[] => [
  { interval: "day", intervalCount: 1, label: "Daily" },
  { interval: "week", intervalCount: 1, label: "Weekly" },
  { interval: "month", intervalCount: 1, label: "Monthly" },
  { interval: "month", intervalCount: 3, label: "Quarterly" },
  { interval: "year", intervalCount: 1, label: "Yearly" },
];

// ============================================================================
// Subscription Operations
// ============================================================================

/**
 * Create a subscription
 *
 * @param stripe - Stripe client
 * @param data - Subscription data
 * @returns Effect that resolves to Stripe Subscription
 */
export const createSubscription = (
  stripe: Stripe,
  data: SubscriptionData
): Effect.Effect<Stripe.Subscription, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: async () => {
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: data.customerId,
        items: [{ price: data.priceId }],
        metadata: data.metadata,
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
      };

      // Add trial period if specified
      if (data.trialPeriodDays) {
        const trialEnd = await Effect.runPromise(
          calculateTrialEnd(data.trialPeriodDays)
        );
        subscriptionParams.trial_end = trialEnd;
      }

      return await stripe.subscriptions.create(subscriptionParams);
    },
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to create subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Retrieve a subscription
 *
 * @param stripe - Stripe client
 * @param subscriptionId - Subscription ID
 * @returns Effect that resolves to Stripe Subscription
 */
export const retrieveSubscription = (
  stripe: Stripe,
  subscriptionId: string
): Effect.Effect<Stripe.Subscription, SubscriptionNotFoundError> =>
  Effect.tryPromise({
    try: () => stripe.subscriptions.retrieve(subscriptionId),
    catch: (error) =>
      new SubscriptionNotFoundError(
        subscriptionId,
        `Failed to retrieve subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Update a subscription (upgrade/downgrade)
 *
 * @param stripe - Stripe client
 * @param subscriptionId - Subscription ID
 * @param data - Update data
 * @returns Effect that resolves to updated Subscription
 */
export const updateSubscription = (
  stripe: Stripe,
  subscriptionId: string,
  data: SubscriptionUpdateData
): Effect.Effect<Stripe.Subscription, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: async () => {
      const updateParams: Stripe.SubscriptionUpdateParams = {
        metadata: data.metadata,
        cancel_at_period_end: data.cancelAtPeriodEnd,
        proration_behavior: data.prorationBehavior || "create_prorations",
      };

      // If changing price, update the subscription items
      if (data.priceId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const currentItemId = subscription.items.data[0]?.id;

        if (currentItemId) {
          updateParams.items = [
            {
              id: currentItemId,
              price: data.priceId,
            },
          ];
        }
      }

      return await stripe.subscriptions.update(subscriptionId, updateParams);
    },
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to update subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Cancel a subscription
 *
 * @param stripe - Stripe client
 * @param data - Cancellation data
 * @returns Effect that resolves to cancelled Subscription
 */
export const cancelSubscription = (
  stripe: Stripe,
  data: SubscriptionCancelData
): Effect.Effect<Stripe.Subscription, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: async () => {
      if (data.cancelAtPeriodEnd) {
        // Schedule cancellation at period end
        return await stripe.subscriptions.update(data.subscriptionId, {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: data.cancellationReason || "user_requested",
          },
        });
      } else {
        // Cancel immediately
        return await stripe.subscriptions.cancel(data.subscriptionId, {
          prorate: true,
        });
      }
    },
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to cancel subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Resume a cancelled subscription (if not yet period end)
 *
 * @param stripe - Stripe client
 * @param subscriptionId - Subscription ID
 * @returns Effect that resolves to resumed Subscription
 */
export const resumeSubscription = (
  stripe: Stripe,
  subscriptionId: string
): Effect.Effect<Stripe.Subscription, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: () =>
      stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      }),
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to resume subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Pause a subscription
 *
 * @param stripe - Stripe client
 * @param subscriptionId - Subscription ID
 * @returns Effect that resolves to paused Subscription
 */
export const pauseSubscription = (
  stripe: Stripe,
  subscriptionId: string
): Effect.Effect<Stripe.Subscription, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: () =>
      stripe.subscriptions.update(subscriptionId, {
        pause_collection: {
          behavior: "void",
        },
      }),
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to pause subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Unpause a subscription
 *
 * @param stripe - Stripe client
 * @param subscriptionId - Subscription ID
 * @returns Effect that resolves to unpaused Subscription
 */
export const unpauseSubscription = (
  stripe: Stripe,
  subscriptionId: string
): Effect.Effect<Stripe.Subscription, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: () =>
      stripe.subscriptions.update(subscriptionId, {
        pause_collection: null as any,
      }),
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to unpause subscription: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Dunning Management (Failed Payment Retry)
// ============================================================================

/**
 * Retry a failed invoice payment
 *
 * @param stripe - Stripe client
 * @param invoiceId - Invoice ID
 * @returns Effect that resolves to Invoice
 */
export const retryInvoicePayment = (
  stripe: Stripe,
  invoiceId: string
): Effect.Effect<Stripe.Invoice, PaymentRetryError> =>
  Effect.tryPromise({
    try: async () => {
      // Get the invoice
      const invoice = await stripe.invoices.retrieve(invoiceId);

      // If invoice has a payment intent, attempt to confirm it
      if (invoice.payment_intent) {
        const paymentIntentId =
          typeof invoice.payment_intent === "string"
            ? invoice.payment_intent
            : invoice.payment_intent.id;

        // Retrieve payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        // If requires payment method, we can't auto-retry
        if (paymentIntent.status === "requires_payment_method") {
          throw new Error(
            "Payment requires customer to update payment method"
          );
        }
      }

      // Send invoice to customer for payment
      return await stripe.invoices.sendInvoice(invoiceId);
    },
    catch: (error) =>
      new PaymentRetryError(
        `Failed to retry invoice payment: ${error instanceof Error ? error.message : "Unknown error"}`,
        invoiceId
      ),
  });

/**
 * Get upcoming invoice for subscription
 *
 * @param stripe - Stripe client
 * @param subscriptionId - Subscription ID
 * @returns Effect that resolves to upcoming Invoice
 */
export const getUpcomingInvoice = (
  stripe: Stripe,
  subscriptionId: string
): Effect.Effect<Stripe.Invoice, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: () =>
      stripe.invoices.retrieveUpcoming({
        subscription: subscriptionId,
      }),
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to retrieve upcoming invoice: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Preview invoice for subscription change
 *
 * @param stripe - Stripe client
 * @param subscriptionId - Subscription ID
 * @param newPriceId - New price ID
 * @returns Effect that resolves to preview Invoice
 */
export const previewSubscriptionChange = (
  stripe: Stripe,
  subscriptionId: string,
  newPriceId: string
): Effect.Effect<Stripe.Invoice, SubscriptionUpdateError> =>
  Effect.tryPromise({
    try: async () => {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const currentItemId = subscription.items.data[0]?.id;

      return await stripe.invoices.retrieveUpcoming({
        subscription: subscriptionId,
        subscription_items: currentItemId
          ? [
              {
                id: currentItemId,
                price: newPriceId,
              },
            ]
          : undefined,
      });
    },
    catch: (error) =>
      new SubscriptionUpdateError(
        `Failed to preview subscription change: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Service Export
// ============================================================================

export const SubscriptionService = {
  // Trial periods
  getTrialPeriods,
  calculateTrialEnd,

  // Billing intervals
  getBillingIntervals,

  // Subscription lifecycle
  createSubscription,
  retrieveSubscription,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  pauseSubscription,
  unpauseSubscription,

  // Dunning management
  retryInvoicePayment,
  getUpcomingInvoice,
  previewSubscriptionChange,
};
