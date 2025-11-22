/**
 * RefundService - Business logic for Stripe refund processing
 *
 * This service implements refund operations using Effect.ts patterns.
 * Supports full refunds, partial refunds, and dispute handling.
 *
 * Key Features:
 * - Full and partial refund processing
 * - Refund reason tracking
 * - Dispute/chargeback handling
 * - Refund analytics
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 * @see /backend/CLAUDE.md - Backend patterns
 */

import { Effect } from "effect";
import Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface RefundData {
  paymentIntentId: string;
  amount?: number; // Optional for partial refund (omit for full refund)
  reason?: RefundReason;
  metadata?: Record<string, string>;
}

export type RefundReason =
  | "duplicate"
  | "fraudulent"
  | "requested_by_customer"
  | "other";

export interface DisputeData {
  chargeId: string;
  evidence: {
    customerName?: string;
    customerEmailAddress?: string;
    customerPurchaseIp?: string;
    productDescription?: string;
    shippingDocumentation?: string;
    refundPolicy?: string;
    cancellationPolicy?: string;
    customerCommunication?: string;
  };
}

export interface RefundAnalytics {
  totalRefunds: number;
  totalRefundedAmount: number;
  refundRate: number; // percentage
  refundsByReason: Record<RefundReason, number>;
  averageRefundAmount: number;
}

// ============================================================================
// Errors
// ============================================================================

export class RefundError {
  readonly _tag = "RefundError";
  constructor(
    public message: string,
    public code?: string
  ) {}
}

export class DisputeError {
  readonly _tag = "DisputeError";
  constructor(public message: string) {}
}

export class RefundAnalyticsError {
  readonly _tag = "RefundAnalyticsError";
  constructor(public message: string) {}
}

// ============================================================================
// Refund Operations
// ============================================================================

/**
 * Create a refund (full or partial)
 *
 * @param stripe - Stripe client
 * @param data - Refund data
 * @returns Effect that resolves to Stripe Refund
 */
export const createRefund = (
  stripe: Stripe,
  data: RefundData
): Effect.Effect<Stripe.Refund, RefundError> =>
  Effect.tryPromise({
    try: () =>
      stripe.refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount, // Omit for full refund
        reason: data.reason,
        metadata: data.metadata,
      }),
    catch: (error) =>
      new RefundError(
        `Failed to create refund: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

/**
 * Retrieve a refund
 *
 * @param stripe - Stripe client
 * @param refundId - Refund ID
 * @returns Effect that resolves to Stripe Refund
 */
export const retrieveRefund = (
  stripe: Stripe,
  refundId: string
): Effect.Effect<Stripe.Refund, RefundError> =>
  Effect.tryPromise({
    try: () => stripe.refunds.retrieve(refundId),
    catch: (error) =>
      new RefundError(
        `Failed to retrieve refund: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

/**
 * List refunds for a payment intent
 *
 * @param stripe - Stripe client
 * @param paymentIntentId - Payment intent ID
 * @returns Effect that resolves to list of Stripe Refunds
 */
export const listRefunds = (
  stripe: Stripe,
  paymentIntentId: string
): Effect.Effect<Stripe.Refund[], RefundError> =>
  Effect.tryPromise({
    try: async () => {
      const refunds = await stripe.refunds.list({
        payment_intent: paymentIntentId,
      });
      return refunds.data;
    },
    catch: (error) =>
      new RefundError(
        `Failed to list refunds: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

/**
 * Cancel a pending refund
 *
 * @param stripe - Stripe client
 * @param refundId - Refund ID
 * @returns Effect that resolves to cancelled Stripe Refund
 */
export const cancelRefund = (
  stripe: Stripe,
  refundId: string
): Effect.Effect<Stripe.Refund, RefundError> =>
  Effect.tryPromise({
    try: () => stripe.refunds.cancel(refundId),
    catch: (error) =>
      new RefundError(
        `Failed to cancel refund: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

// ============================================================================
// Dispute Operations
// ============================================================================

/**
 * Retrieve a dispute
 *
 * @param stripe - Stripe client
 * @param disputeId - Dispute ID
 * @returns Effect that resolves to Stripe Dispute
 */
export const retrieveDispute = (
  stripe: Stripe,
  disputeId: string
): Effect.Effect<Stripe.Dispute, DisputeError> =>
  Effect.tryPromise({
    try: () => stripe.disputes.retrieve(disputeId),
    catch: (error) =>
      new DisputeError(
        `Failed to retrieve dispute: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Update dispute evidence
 *
 * @param stripe - Stripe client
 * @param disputeId - Dispute ID
 * @param data - Evidence data
 * @returns Effect that resolves to updated Stripe Dispute
 */
export const updateDisputeEvidence = (
  stripe: Stripe,
  disputeId: string,
  data: DisputeData
): Effect.Effect<Stripe.Dispute, DisputeError> =>
  Effect.tryPromise({
    try: () =>
      stripe.disputes.update(disputeId, {
        evidence: {
          customer_name: data.evidence.customerName,
          customer_email_address: data.evidence.customerEmailAddress,
          customer_purchase_ip: data.evidence.customerPurchaseIp,
          product_description: data.evidence.productDescription,
          shipping_documentation: data.evidence.shippingDocumentation,
          refund_policy: data.evidence.refundPolicy,
          cancellation_policy: data.evidence.cancellationPolicy,
          customer_communication: data.evidence.customerCommunication,
        },
      }),
    catch: (error) =>
      new DisputeError(
        `Failed to update dispute evidence: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Close a dispute (accept the dispute)
 *
 * @param stripe - Stripe client
 * @param disputeId - Dispute ID
 * @returns Effect that resolves to closed Stripe Dispute
 */
export const closeDispute = (
  stripe: Stripe,
  disputeId: string
): Effect.Effect<Stripe.Dispute, DisputeError> =>
  Effect.tryPromise({
    try: () => stripe.disputes.close(disputeId),
    catch: (error) =>
      new DisputeError(
        `Failed to close dispute: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Refund Analytics
// ============================================================================

/**
 * Calculate refund analytics from refund data
 *
 * @param refunds - Array of Stripe refunds
 * @param totalPayments - Total number of payments
 * @returns Effect that resolves to RefundAnalytics
 */
export const calculateRefundAnalytics = (
  refunds: Stripe.Refund[],
  totalPayments: number
): Effect.Effect<RefundAnalytics, RefundAnalyticsError> =>
  Effect.sync(() => {
    const totalRefunds = refunds.length;
    const totalRefundedAmount = refunds.reduce(
      (sum, refund) => sum + refund.amount,
      0
    );

    // Calculate refund rate
    const refundRate =
      totalPayments > 0 ? (totalRefunds / totalPayments) * 100 : 0;

    // Group by reason
    const refundsByReason: Record<RefundReason, number> = {
      duplicate: 0,
      fraudulent: 0,
      requested_by_customer: 0,
      other: 0,
    };

    refunds.forEach((refund) => {
      const reason = (refund.reason as RefundReason) || "other";
      refundsByReason[reason] = (refundsByReason[reason] || 0) + 1;
    });

    // Calculate average refund amount
    const averageRefundAmount =
      totalRefunds > 0 ? totalRefundedAmount / totalRefunds : 0;

    return {
      totalRefunds,
      totalRefundedAmount,
      refundRate,
      refundsByReason,
      averageRefundAmount,
    };
  });

/**
 * Validate refund request
 *
 * @param paymentIntent - Stripe PaymentIntent
 * @param refundAmount - Amount to refund (optional for full refund)
 * @returns Effect that validates refund is possible
 */
export const validateRefundRequest = (
  paymentIntent: Stripe.PaymentIntent,
  refundAmount?: number
): Effect.Effect<void, RefundError> =>
  Effect.gen(function* () {
    // Check payment intent is succeeded
    if (paymentIntent.status !== "succeeded") {
      return yield* Effect.fail(
        new RefundError(
          `Cannot refund payment with status: ${paymentIntent.status}`
        )
      );
    }

    // Check if already fully refunded
    if (
      paymentIntent.amount_received === 0 ||
      (paymentIntent.amount_capturable === 0 &&
        paymentIntent.charges.data.length > 0 &&
        paymentIntent.charges.data[0].refunded)
    ) {
      return yield* Effect.fail(
        new RefundError("Payment has already been fully refunded")
      );
    }

    // Validate partial refund amount
    if (refundAmount !== undefined) {
      if (refundAmount <= 0) {
        return yield* Effect.fail(
          new RefundError("Refund amount must be greater than 0")
        );
      }

      if (refundAmount > paymentIntent.amount) {
        return yield* Effect.fail(
          new RefundError(
            `Refund amount (${refundAmount}) cannot exceed payment amount (${paymentIntent.amount})`
          )
        );
      }

      // Check available amount for partial refund
      const charge = paymentIntent.charges.data[0];
      if (charge) {
        const availableToRefund = charge.amount - charge.amount_refunded;
        if (refundAmount > availableToRefund) {
          return yield* Effect.fail(
            new RefundError(
              `Refund amount (${refundAmount}) exceeds available amount (${availableToRefund})`
            )
          );
        }
      }
    }

    return yield* Effect.succeed(undefined);
  });

// ============================================================================
// Service Export
// ============================================================================

export const RefundService = {
  // Refund operations
  createRefund,
  retrieveRefund,
  listRefunds,
  cancelRefund,

  // Dispute operations
  retrieveDispute,
  updateDisputeEvidence,
  closeDispute,

  // Analytics
  calculateRefundAnalytics,

  // Validation
  validateRefundRequest,
};
