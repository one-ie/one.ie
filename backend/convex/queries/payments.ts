/**
 * Payment Queries - Read operations for Stripe payments
 *
 * All queries MUST:
 * 1. Authenticate user
 * 2. Filter by groupId (multi-tenant isolation)
 * 3. Return only authorized data
 *
 * @see /backend/CLAUDE.md - Query patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// List Payments for Funnel
// ============================================================================

/**
 * List all payments for a specific funnel
 */
export const listFunnelPayments = query({
  args: {
    funnelId: v.id("things"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Get funnel and validate access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return [];
    }

    // 4. Query payments
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "payment")
      )
      .filter((t) => t.properties?.funnelId === args.funnelId);

    // Apply status filter if provided
    if (args.status) {
      q = q.filter((t) => t.status === args.status);
    }

    const payments = await q.collect();

    // 5. Enrich with customer data
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        // Find the connection to get the customer
        const connection = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", payment._id)
              .eq("relationshipType", "customer_purchased_via_funnel")
          )
          .first();

        let customer = null;
        if (connection) {
          customer = await ctx.db.get(connection.fromThingId);
        }

        return {
          ...payment,
          customer: customer
            ? {
                _id: customer._id,
                name: customer.name,
                email: customer.properties?.email,
              }
            : null,
        };
      })
    );

    return enrichedPayments;
  },
});

// ============================================================================
// Get Payment Details
// ============================================================================

/**
 * Get detailed information about a specific payment
 */
export const getPayment = query({
  args: {
    paymentId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get payment and validate access
    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.groupId !== person.groupId) {
      return null;
    }

    // 4. Get funnel
    const funnel = payment.properties?.funnelId
      ? await ctx.db.get(payment.properties.funnelId as any)
      : null;

    // 5. Get customer
    const connection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q
          .eq("toThingId", payment._id)
          .eq("relationshipType", "customer_purchased_via_funnel")
      )
      .first();

    let customer = null;
    if (connection) {
      customer = await ctx.db.get(connection.fromThingId);
    }

    // 6. Get payment events
    const events = await ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", payment._id))
      .order("desc")
      .take(10);

    return {
      ...payment,
      funnel: funnel
        ? {
            _id: funnel._id,
            name: funnel.name,
            slug: funnel.properties?.slug,
          }
        : null,
      customer: customer
        ? {
            _id: customer._id,
            name: customer.name,
            email: customer.properties?.email,
          }
        : null,
      events,
    };
  },
});

// ============================================================================
// Get Funnel Payment Settings
// ============================================================================

/**
 * Get Stripe payment settings for a funnel
 */
export const getFunnelPaymentSettings = query({
  args: {
    funnelId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get funnel and validate access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return null;
    }

    // 4. Return Stripe settings
    return {
      funnelId: funnel._id,
      funnelName: funnel.name,
      stripeProductId: funnel.properties?.stripeProductId,
      stripePriceId: funnel.properties?.stripePriceId,
      hasStripeSetup: !!(
        funnel.properties?.stripeProductId && funnel.properties?.stripePriceId
      ),
    };
  },
});

// ============================================================================
// Get Payment Statistics
// ============================================================================

/**
 * Get payment statistics for a funnel
 */
export const getPaymentStats = query({
  args: {
    funnelId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get funnel and validate access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.groupId !== person.groupId) {
      return null;
    }

    // 4. Get all payments for this funnel
    const payments = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "payment")
      )
      .filter((t) => t.properties?.funnelId === args.funnelId)
      .collect();

    // 5. Calculate statistics
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(
      (p) => p.properties?.status === "succeeded"
    ).length;
    const failedPayments = payments.filter(
      (p) => p.properties?.status === "failed"
    ).length;
    const pendingPayments = payments.filter(
      (p) =>
        p.properties?.status !== "succeeded" &&
        p.properties?.status !== "failed"
    ).length;

    const totalRevenue = payments
      .filter((p) => p.properties?.status === "succeeded")
      .reduce((sum, p) => sum + (p.properties?.amount || 0), 0);

    const averagePayment =
      successfulPayments > 0 ? totalRevenue / successfulPayments : 0;

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalRevenue,
      averagePayment,
      currency: payments[0]?.properties?.currency || "usd",
    };
  },
});

// ============================================================================
// List All Payments for Organization
// ============================================================================

/**
 * List all payments for the user's organization
 */
export const listOrganizationPayments = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Query payments
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "payment")
      );

    // Apply status filter
    if (args.status) {
      q = q.filter((t) => t.status === args.status);
    }

    const limit = args.limit || 100;
    const payments = await q.order("desc").take(limit);

    // 4. Enrich with funnel and customer data
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const funnel = payment.properties?.funnelId
          ? await ctx.db.get(payment.properties.funnelId as any)
          : null;

        const connection = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q
              .eq("toThingId", payment._id)
              .eq("relationshipType", "customer_purchased_via_funnel")
          )
          .first();

        let customer = null;
        if (connection) {
          customer = await ctx.db.get(connection.fromThingId);
        }

        return {
          ...payment,
          funnel: funnel
            ? {
                _id: funnel._id,
                name: funnel.name,
              }
            : null,
          customer: customer
            ? {
                _id: customer._id,
                name: customer.name,
                email: customer.properties?.email,
              }
            : null,
        };
      })
    );

    return enrichedPayments;
  },
});

// ============================================================================
// List Subscriptions
// ============================================================================

/**
 * List all subscriptions for the user's organization
 */
export const listSubscriptions = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Query subscriptions
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "subscription")
      );

    // Apply status filter
    if (args.status) {
      q = q.filter((t) => t.status === args.status);
    }

    const limit = args.limit || 100;
    const subscriptions = await q.order("desc").take(limit);

    // 4. Enrich with product and customer data
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (subscription) => {
        const product = subscription.properties?.productId
          ? await ctx.db.get(subscription.properties.productId as any)
          : null;

        const connection = await ctx.db
          .query("connections")
          .withIndex("to_type", (q) =>
            q.eq("toThingId", subscription._id).eq("relationshipType", "purchased")
          )
          .first();

        let customer = null;
        if (connection) {
          customer = await ctx.db.get(connection.fromThingId);
        }

        return {
          ...subscription,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                type: product.type,
              }
            : null,
          customer: customer
            ? {
                _id: customer._id,
                name: customer.name,
                email: customer.properties?.email,
              }
            : null,
        };
      })
    );

    return enrichedSubscriptions;
  },
});

// ============================================================================
// Get Subscription Details
// ============================================================================

/**
 * Get detailed information about a specific subscription
 */
export const getSubscription = query({
  args: {
    subscriptionId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get subscription and validate access
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription || subscription.groupId !== person.groupId) {
      return null;
    }

    // 4. Get product
    const product = subscription.properties?.productId
      ? await ctx.db.get(subscription.properties.productId as any)
      : null;

    // 5. Get customer
    const connection = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", subscription._id).eq("relationshipType", "purchased")
      )
      .first();

    let customer = null;
    if (connection) {
      customer = await ctx.db.get(connection.fromThingId);
    }

    // 6. Get subscription events
    const events = await ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", subscription._id))
      .order("desc")
      .take(10);

    return {
      ...subscription,
      product: product
        ? {
            _id: product._id,
            name: product.name,
            type: product.type,
          }
        : null,
      customer: customer
        ? {
            _id: customer._id,
            name: customer.name,
            email: customer.properties?.email,
          }
        : null,
      events,
    };
  },
});

// ============================================================================
// Get User Subscriptions
// ============================================================================

/**
 * Get all subscriptions for the current user
 */
export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person) {
      return [];
    }

    // 3. Get user's subscriptions
    const connections = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", person._id).eq("relationshipType", "purchased")
      )
      .filter((c) => c.metadata?.subscriptionType === "recurring")
      .collect();

    // 4. Get subscription details
    const subscriptions = await Promise.all(
      connections.map(async (connection) => {
        const subscription = await ctx.db.get(connection.toThingId);
        if (!subscription) return null;

        const product = subscription.properties?.productId
          ? await ctx.db.get(subscription.properties.productId as any)
          : null;

        return {
          ...subscription,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                type: product.type,
              }
            : null,
        };
      })
    );

    return subscriptions.filter((s) => s !== null);
  },
});

// ============================================================================
// Get Subscription Statistics
// ============================================================================

/**
 * Get subscription statistics for the organization
 */
export const getSubscriptionStats = query({
  args: {},
  handler: async (ctx) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get all subscriptions
    const subscriptions = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "subscription")
      )
      .collect();

    // 4. Calculate statistics
    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "active" && !s.properties?.cancelAtPeriodEnd
    ).length;
    const cancelledSubscriptions = subscriptions.filter(
      (s) => s.status === "archived" || s.properties?.cancelAtPeriodEnd
    ).length;
    const pausedSubscriptions = subscriptions.filter(
      (s) => s.properties?.pausedAt
    ).length;

    const trialSubscriptions = subscriptions.filter(
      (s) =>
        s.properties?.trialEnd && s.properties.trialEnd > Date.now()
    ).length;

    // Calculate MRR (Monthly Recurring Revenue)
    // This is a simplified calculation - real MRR would need pricing data
    const monthlyRevenue = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        // This would need actual price data from Stripe
        return sum;
      }, 0);

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      pausedSubscriptions,
      trialSubscriptions,
      monthlyRevenue, // Would need pricing integration
      churnRate:
        totalSubscriptions > 0
          ? (cancelledSubscriptions / totalSubscriptions) * 100
          : 0,
    };
  },
});

// ============================================================================
// List Refunds for Payment
// ============================================================================

/**
 * List all refunds for a specific payment
 */
export const listPaymentRefunds = query({
  args: {
    paymentId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Get payment and validate access
    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.groupId !== person.groupId) {
      return [];
    }

    // 4. Get refund connections
    const refundConnections = await ctx.db
      .query("connections")
      .withIndex("to_type", (q) =>
        q.eq("toThingId", args.paymentId).eq("relationshipType", "references")
      )
      .filter((c) => c.metadata?.connectionType === "refund_for_payment")
      .collect();

    // 5. Get refund things
    const refunds = await Promise.all(
      refundConnections.map(async (conn) => {
        const refund = await ctx.db.get(conn.fromThingId);
        return refund;
      })
    );

    return refunds.filter((r) => r !== null);
  },
});

// ============================================================================
// Get Refund Analytics
// ============================================================================

/**
 * Get refund analytics for the organization
 */
export const getRefundAnalytics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return null;
    }

    // 3. Get all payments and refunds for the group
    const payments = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "payment")
      )
      .filter((t) => !t.properties?.stripeRefundId) // Exclude refund records
      .collect();

    // Apply date filters
    let filteredPayments = payments;
    if (args.startDate || args.endDate) {
      filteredPayments = payments.filter((p) => {
        const createdAt = p.createdAt;
        if (args.startDate && createdAt < args.startDate) return false;
        if (args.endDate && createdAt > args.endDate) return false;
        return true;
      });
    }

    // 4. Get all refund things
    const refunds = await ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "payment")
      )
      .filter((t) => !!t.properties?.stripeRefundId) // Only refund records
      .collect();

    // Apply date filters to refunds
    let filteredRefunds = refunds;
    if (args.startDate || args.endDate) {
      filteredRefunds = refunds.filter((r) => {
        const createdAt = r.createdAt;
        if (args.startDate && createdAt < args.startDate) return false;
        if (args.endDate && createdAt > args.endDate) return false;
        return true;
      });
    }

    // 5. Calculate analytics
    const totalPayments = filteredPayments.length;
    const totalRefunds = filteredRefunds.length;
    const totalRefundedAmount = filteredRefunds.reduce(
      (sum, r) => sum + (r.properties?.amount || 0),
      0
    );
    const totalPaymentAmount = filteredPayments.reduce(
      (sum, p) => sum + (p.properties?.amount || 0),
      0
    );

    const refundRate =
      totalPayments > 0 ? (totalRefunds / totalPayments) * 100 : 0;
    const averageRefundAmount =
      totalRefunds > 0 ? totalRefundedAmount / totalRefunds : 0;

    // Group by reason
    const refundsByReason: Record<string, number> = {
      duplicate: 0,
      fraudulent: 0,
      requested_by_customer: 0,
      other: 0,
    };

    filteredRefunds.forEach((refund) => {
      const reason = refund.properties?.reason || "other";
      refundsByReason[reason] = (refundsByReason[reason] || 0) + 1;
    });

    // Partial vs full refunds
    const partialRefunds = filteredRefunds.filter(
      (r) => r.properties?.isPartialRefund
    ).length;
    const fullRefunds = totalRefunds - partialRefunds;

    return {
      totalPayments,
      totalRefunds,
      totalRefundedAmount,
      totalPaymentAmount,
      refundRate,
      averageRefundAmount,
      refundsByReason,
      partialRefunds,
      fullRefunds,
      currency: filteredRefunds[0]?.properties?.currency || "usd",
    };
  },
});

// ============================================================================
// List All Refunds for Organization
// ============================================================================

/**
 * List all refunds for the user's organization
 */
export const listOrganizationRefunds = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      return [];
    }

    // 3. Query refunds
    let q = ctx.db
      .query("things")
      .withIndex("by_group_type", (q) =>
        q.eq("groupId", person.groupId).eq("type", "payment")
      )
      .filter((t) => !!t.properties?.stripeRefundId);

    // Apply status filter
    if (args.status) {
      q = q.filter((t) => t.status === args.status);
    }

    const limit = args.limit || 100;
    const refunds = await q.order("desc").take(limit);

    // 4. Enrich with original payment data
    const enrichedRefunds = await Promise.all(
      refunds.map(async (refund) => {
        const originalPayment = refund.properties?.originalPaymentId
          ? await ctx.db.get(refund.properties.originalPaymentId as any)
          : null;

        return {
          ...refund,
          originalPayment: originalPayment
            ? {
                _id: originalPayment._id,
                name: originalPayment.name,
                amount: originalPayment.properties?.amount,
              }
            : null,
        };
      })
    );

    return enrichedRefunds;
  },
});
