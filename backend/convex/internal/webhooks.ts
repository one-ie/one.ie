/**
 * Internal Webhook Mutations
 *
 * These are internal mutations called by the webhook handler to update
 * the database. They are NOT exposed to the frontend - only accessible
 * via the webhook handler service.
 *
 * CRITICAL:
 * - These mutations bypass authentication (called from HTTP handler)
 * - Still enforce data integrity and validation
 * - Log all events to audit trail
 * - Maintain multi-tenant isolation via groupId
 *
 * @see /backend/convex/services/payments/webhook-handler.ts
 * @see /backend/convex/http.ts
 */

import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// Idempotency Check
// ============================================================================

/**
 * Check if webhook event has already been processed
 *
 * @param stripeEventId - Stripe event ID
 * @returns Event record if already processed, null otherwise
 */
export const checkEvent = internalQuery({
  args: {
    stripeEventId: v.string(),
  },
  handler: async (ctx, args) => {
    // Query events table for this Stripe event ID
    const existingEvent = await ctx.db
      .query("events")
      .filter((e) =>
        e.metadata?.stripeEventId === args.stripeEventId &&
        e.metadata?.protocol === "stripe"
      )
      .first();

    return existingEvent;
  },
});

// ============================================================================
// Webhook Logging
// ============================================================================

/**
 * Log webhook event for debugging
 */
export const logEvent = internalMutation({
  args: {
    stripeEventId: v.string(),
    stripeEventType: v.string(),
    processed: v.boolean(),
    error: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    // Create system event (no actorId)
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: "system" as any, // System-generated event
      timestamp: args.timestamp,
      metadata: {
        ...args.metadata,
        stripeEventId: args.stripeEventId,
        stripeEventType: args.stripeEventType,
        processed: args.processed,
        error: args.error,
      },
    });
  },
});

// ============================================================================
// Payment Operations
// ============================================================================

/**
 * Find payment by Stripe payment intent ID
 */
export const findPayment = internalQuery({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "payment"))
      .filter((t) =>
        t.properties?.stripePaymentIntentId === args.stripePaymentIntentId
      )
      .first();

    return payment;
  },
});

/**
 * Update payment status
 */
export const updatePaymentStatus = internalMutation({
  args: {
    paymentId: v.id("things"),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment properties
    await ctx.db.patch(args.paymentId, {
      properties: {
        ...payment.properties,
        status: args.status,
        ...(args.metadata || {}),
      },
      status: args.status === "succeeded" ? "published" : "archived",
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: payment.properties?.personId || ("system" as any),
      targetId: args.paymentId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: `payment_${args.status}`,
        groupId: payment.groupId,
        ...args.metadata,
      },
    });
  },
});

/**
 * Record checkout completion
 */
export const recordCheckoutCompleted = internalMutation({
  args: {
    sessionId: v.string(),
    paymentIntentId: v.string(),
    customerId: v.string(),
    funnelId: v.string(),
    personId: v.string(),
    groupId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    // Create or update payment thing
    const paymentId = await ctx.db.insert("things", {
      type: "payment",
      name: `Checkout Payment ${args.sessionId}`,
      groupId: args.groupId as any,
      properties: {
        stripePaymentIntentId: args.paymentIntentId,
        stripeSessionId: args.sessionId,
        stripeCustomerId: args.customerId,
        amount: args.amount,
        currency: args.currency,
        status: "succeeded",
        funnelId: args.funnelId,
        personId: args.personId,
      },
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create connection: person purchased via funnel
    await ctx.db.insert("connections", {
      fromThingId: args.personId as any,
      toThingId: paymentId,
      relationshipType: "customer_purchased_via_funnel",
      metadata: {
        funnelId: args.funnelId,
        amount: args.amount,
        currency: args.currency,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "purchase_completed",
      actorId: args.personId as any,
      targetId: paymentId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        funnelId: args.funnelId,
        amount: args.amount,
        currency: args.currency,
        sessionId: args.sessionId,
        groupId: args.groupId,
      },
    });

    return paymentId;
  },
});

/**
 * Record refund
 */
export const recordRefund = internalMutation({
  args: {
    stripePaymentIntentId: v.string(),
    refundAmount: v.number(),
    refundReason: v.string(),
  },
  handler: async (ctx, args) => {
    // Find payment
    const payment = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "payment"))
      .filter((t) =>
        t.properties?.stripePaymentIntentId === args.stripePaymentIntentId
      )
      .first();

    if (!payment) {
      console.error("Payment not found for refund:", args.stripePaymentIntentId);
      return;
    }

    // Update payment with refund info
    await ctx.db.patch(payment._id, {
      properties: {
        ...payment.properties,
        refunded: true,
        refundAmount: args.refundAmount,
        refundReason: args.refundReason,
        refundedAt: Date.now(),
      },
      status: "archived",
      updatedAt: Date.now(),
    });

    // Log refund event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: "system" as any,
      targetId: payment._id,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "payment_refunded",
        refundAmount: args.refundAmount,
        refundReason: args.refundReason,
        groupId: payment.groupId,
      },
    });
  },
});

// ============================================================================
// Subscription Operations
// ============================================================================

/**
 * Create subscription thing
 */
export const createSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    status: v.string(),
    priceId: v.optional(v.string()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    // Find person by Stripe customer ID
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.stripeCustomerId === args.stripeCustomerId)
      .first();

    if (!person || !person.groupId) {
      console.error("Person not found for subscription:", args.stripeCustomerId);
      return null;
    }

    // Create subscription thing
    const subscriptionId = await ctx.db.insert("things", {
      type: "subscription",
      name: `Subscription ${args.stripeSubscriptionId}`,
      groupId: person.groupId,
      properties: {
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripeCustomerId: args.stripeCustomerId,
        priceId: args.priceId,
        status: args.status,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        metadata: args.metadata,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create connection: person owns subscription
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: subscriptionId,
      relationshipType: "owns",
      metadata: {
        subscriptionStatus: args.status,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: person._id,
      targetId: subscriptionId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "subscription_created",
        status: args.status,
        groupId: person.groupId,
      },
    });

    return subscriptionId;
  },
});

/**
 * Update subscription thing
 */
export const updateSubscription = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    priceId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find subscription
    const subscription = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "subscription"))
      .filter((t) =>
        t.properties?.stripeSubscriptionId === args.stripeSubscriptionId
      )
      .first();

    if (!subscription) {
      console.error("Subscription not found:", args.stripeSubscriptionId);
      return null;
    }

    // Update subscription
    await ctx.db.patch(subscription._id, {
      properties: {
        ...subscription.properties,
        status: args.status,
        ...(args.priceId && { priceId: args.priceId }),
        ...(args.currentPeriodEnd && {
          currentPeriodEnd: args.currentPeriodEnd,
        }),
        ...(args.cancelAtPeriodEnd !== undefined && {
          cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        }),
      },
      status: args.status === "canceled" ? "archived" : "active",
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: subscription.properties?.personId || ("system" as any),
      targetId: subscription._id,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "subscription_updated",
        status: args.status,
        groupId: subscription.groupId,
      },
    });

    return { subscriptionId: subscription._id };
  },
});

// ============================================================================
// Invoice Operations
// ============================================================================

/**
 * Record invoice paid
 */
export const recordInvoicePaid = internalMutation({
  args: {
    stripeInvoiceId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    paidAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Find person by customer ID
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.stripeCustomerId === args.stripeCustomerId)
      .first();

    if (!person || !person.groupId) {
      console.error("Person not found for invoice:", args.stripeCustomerId);
      return;
    }

    // Create invoice thing
    const invoiceId = await ctx.db.insert("things", {
      type: "invoice",
      name: `Invoice ${args.stripeInvoiceId}`,
      groupId: person.groupId,
      properties: {
        stripeInvoiceId: args.stripeInvoiceId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripeCustomerId: args.stripeCustomerId,
        amount: args.amount,
        currency: args.currency,
        status: args.status,
        paidAt: args.paidAt,
      },
      status: "published",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: person._id,
      targetId: invoiceId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "invoice_paid",
        amount: args.amount,
        currency: args.currency,
        groupId: person.groupId,
      },
    });
  },
});

/**
 * Record invoice payment failed
 */
export const recordInvoicePaymentFailed = internalMutation({
  args: {
    stripeInvoiceId: v.string(),
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    amount: v.number(),
    attemptCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Find person by customer ID
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.stripeCustomerId === args.stripeCustomerId)
      .first();

    if (!person || !person.groupId) {
      console.error("Person not found for failed invoice:", args.stripeCustomerId);
      return;
    }

    // Log event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: person._id,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "invoice_payment_failed",
        stripeInvoiceId: args.stripeInvoiceId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        amount: args.amount,
        attemptCount: args.attemptCount,
        groupId: person.groupId,
      },
    });
  },
});

// ============================================================================
// Customer Operations
// ============================================================================

/**
 * Update person with Stripe customer ID
 */
export const updatePersonStripeCustomer = internalMutation({
  args: {
    personId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.personId as any);
    if (!person) {
      console.error("Person not found:", args.personId);
      return;
    }

    // Update person with Stripe customer ID
    await ctx.db.patch(person._id, {
      properties: {
        ...person.properties,
        stripeCustomerId: args.stripeCustomerId,
      },
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: person._id,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "customer_created",
        stripeCustomerId: args.stripeCustomerId,
        groupId: person.groupId,
      },
    });
  },
});
