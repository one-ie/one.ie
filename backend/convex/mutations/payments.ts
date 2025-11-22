/**
 * Payment Mutations - Stripe payment operations with organization scoping
 *
 * All mutations MUST:
 * 1. Authenticate user
 * 2. Validate groupId access
 * 3. Call StripeService (business logic)
 * 4. Log events after operations
 *
 * @see /backend/CLAUDE.md - Mutation patterns
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { StripeService } from "../services/payments/stripe";
import { SubscriptionService } from "../services/payments/subscriptions";
import { RefundService } from "../services/payments/refunds";
import { Effect } from "effect";

// ============================================================================
// Helper: Get Stripe Configuration from Environment
// ============================================================================

const getStripeConfig = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    throw new Error(
      "Stripe configuration missing. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET"
    );
  }

  return { secretKey, webhookSecret };
};

// ============================================================================
// Create Payment Intent
// ============================================================================

/**
 * Create a Stripe payment intent for a funnel purchase
 *
 * CRITICAL:
 * - Validates user has access to groupId
 * - Creates Stripe customer if needed
 * - Logs payment_event
 */
export const createPaymentIntent = mutation({
  args: {
    funnelId: v.id("things"),
    amount: v.number(),
    currency: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and validate access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    if (funnel.groupId !== person.groupId) {
      throw new Error("No access to this funnel");
    }

    // 4. Initialize Stripe
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      // 5. Get or create Stripe customer
      let stripeCustomerId = person.properties?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = yield* StripeService.createCustomer(stripe, {
          email: person.properties?.email || identity.email!,
          name: person.name,
          metadata: {
            personId: person._id,
            groupId: person.groupId,
          },
        });

        stripeCustomerId = customer.id;

        // Update person with Stripe customer ID
        await ctx.db.patch(person._id, {
          properties: {
            ...person.properties,
            stripeCustomerId: customer.id,
          },
          updatedAt: Date.now(),
        });
      }

      // 6. Create payment intent
      const paymentIntent = yield* StripeService.createPaymentIntent(stripe, {
        amount: args.amount,
        currency: args.currency,
        customerId: stripeCustomerId,
        description: args.description || `Payment for ${funnel.name}`,
        metadata: {
          funnelId: args.funnelId,
          personId: person._id,
          groupId: person.groupId,
        },
      });

      return paymentIntent;
    });

    // Run the Effect program
    const paymentIntent = await Effect.runPromise(program);

    // 7. Create payment thing
    const paymentId = await ctx.db.insert("things", {
      type: "payment",
      name: `Payment for ${funnel.name}`,
      groupId: person.groupId,
      properties: {
        stripePaymentIntentId: paymentIntent.id,
        amount: args.amount,
        currency: args.currency,
        status: paymentIntent.status,
        funnelId: args.funnelId,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 8. Create connection: person purchased via funnel
    await ctx.db.insert("connections", {
      fromThingId: person._id,
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

    // 9. Log event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: person._id,
      targetId: paymentId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "payment_intent_created",
        funnelId: args.funnelId,
        amount: args.amount,
        currency: args.currency,
        stripePaymentIntentId: paymentIntent.id,
        groupId: person.groupId,
      },
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    };
  },
});

// ============================================================================
// Create Checkout Session
// ============================================================================

/**
 * Create a Stripe checkout session for funnel purchase
 */
export const createCheckoutSession = mutation({
  args: {
    funnelId: v.id("things"),
    priceId: v.string(),
    quantity: v.number(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and validate access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    if (funnel.groupId !== person.groupId) {
      throw new Error("No access to this funnel");
    }

    // 4. Initialize Stripe and create session
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      // Get or create Stripe customer
      let stripeCustomerId = person.properties?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = yield* StripeService.createCustomer(stripe, {
          email: person.properties?.email || identity.email!,
          name: person.name,
          metadata: {
            personId: person._id,
            groupId: person.groupId,
          },
        });

        stripeCustomerId = customer.id;

        await ctx.db.patch(person._id, {
          properties: {
            ...person.properties,
            stripeCustomerId: customer.id,
          },
          updatedAt: Date.now(),
        });
      }

      // Create checkout session
      const session = yield* StripeService.createCheckoutSession(stripe, {
        priceId: args.priceId,
        quantity: args.quantity,
        successUrl: args.successUrl,
        cancelUrl: args.cancelUrl,
        customerId: stripeCustomerId,
        metadata: {
          funnelId: args.funnelId,
          personId: person._id,
          groupId: person.groupId,
        },
      });

      return session;
    });

    const session = await Effect.runPromise(program);

    // 5. Log event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: person._id,
      targetId: args.funnelId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "checkout_session_created",
        funnelId: args.funnelId,
        sessionId: session.id,
        priceId: args.priceId,
        quantity: args.quantity,
        groupId: person.groupId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  },
});

// ============================================================================
// Handle Stripe Webhook
// ============================================================================

/**
 * Handle Stripe webhook events
 *
 * CRITICAL:
 * - Verifies webhook signature
 * - Processes event based on type
 * - Logs events for audit trail
 */
export const handleWebhook = mutation({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get webhook config
    const config = getStripeConfig();

    // 2. Verify and process webhook
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      // Construct and verify event
      const event = yield* StripeService.constructWebhookEvent(
        stripe,
        args.payload,
        args.signature,
        config.webhookSecret
      );

      // Process event
      const eventData = yield* StripeService.processWebhookEvent(event);

      return { event, eventData };
    });

    const { event, eventData } = await Effect.runPromise(program);

    // 3. Handle specific event types
    switch (eventData.type) {
      case "payment_succeeded": {
        // Find payment by stripePaymentIntentId
        const payment = await ctx.db
          .query("things")
          .withIndex("by_type", (q) => q.eq("type", "payment"))
          .filter(
            (t) =>
              t.properties?.stripePaymentIntentId === eventData.paymentIntentId
          )
          .first();

        if (payment) {
          // Update payment status
          await ctx.db.patch(payment._id, {
            properties: {
              ...payment.properties,
              status: "succeeded",
            },
            status: "published",
            updatedAt: Date.now(),
          });

          // Get funnel connection to find actor
          const connection = await ctx.db
            .query("connections")
            .withIndex("to_type", (q) =>
              q
                .eq("toThingId", payment._id)
                .eq("relationshipType", "customer_purchased_via_funnel")
            )
            .first();

          if (connection) {
            // Log purchase completed event
            await ctx.db.insert("events", {
              type: "purchase_completed",
              actorId: connection.fromThingId,
              targetId: payment._id,
              timestamp: Date.now(),
              metadata: {
                protocol: "stripe",
                funnelId: payment.properties?.funnelId,
                amount: eventData.amount,
                currency: eventData.currency,
                stripePaymentIntentId: eventData.paymentIntentId,
                groupId: payment.groupId,
              },
            });
          }
        }
        break;
      }

      case "payment_failed": {
        const payment = await ctx.db
          .query("things")
          .withIndex("by_type", (q) => q.eq("type", "payment"))
          .filter(
            (t) =>
              t.properties?.stripePaymentIntentId === eventData.paymentIntentId
          )
          .first();

        if (payment) {
          await ctx.db.patch(payment._id, {
            properties: {
              ...payment.properties,
              status: "failed",
              error: eventData.error,
            },
            status: "archived",
            updatedAt: Date.now(),
          });
        }
        break;
      }

      case "checkout_completed": {
        // Log checkout completion
        const metadata = eventData.metadata || {};
        if (metadata.personId) {
          await ctx.db.insert("events", {
            type: "payment_event",
            actorId: metadata.personId,
            targetId: metadata.funnelId,
            timestamp: Date.now(),
            metadata: {
              protocol: "stripe",
              eventType: "checkout_completed",
              sessionId: eventData.sessionId,
              paymentIntentId: eventData.paymentIntentId,
              groupId: metadata.groupId,
            },
          });
        }
        break;
      }
    }

    // 4. Log webhook event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: "system" as any, // System event
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "webhook_received",
        stripeEventType: event.type,
        stripeEventId: event.id,
        processedType: eventData.type,
      },
    });

    return { success: true, eventType: event.type };
  },
});

// ============================================================================
// Create Stripe Product
// ============================================================================

/**
 * Create a Stripe product for a funnel
 */
export const createStripeProduct = mutation({
  args: {
    funnelId: v.id("things"),
    name: v.string(),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and validate access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    if (funnel.groupId !== person.groupId) {
      throw new Error("No access to this funnel");
    }

    // 4. Create Stripe product
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      const product = yield* StripeService.createProduct(stripe, {
        name: args.name,
        description: args.description,
        images: args.images,
        metadata: {
          funnelId: args.funnelId,
          groupId: person.groupId,
        },
      });

      return product;
    });

    const product = await Effect.runPromise(program);

    // 5. Update funnel with Stripe product ID
    await ctx.db.patch(args.funnelId, {
      properties: {
        ...funnel.properties,
        stripeProductId: product.id,
      },
      updatedAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: args.funnelId,
      timestamp: Date.now(),
      metadata: {
        entityType: "funnel",
        protocol: "stripe",
        eventType: "product_created",
        stripeProductId: product.id,
        groupId: person.groupId,
      },
    });

    return {
      productId: product.id,
      name: product.name,
    };
  },
});

// ============================================================================
// Create Stripe Price
// ============================================================================

/**
 * Create a Stripe price for a funnel product
 */
export const createStripePrice = mutation({
  args: {
    funnelId: v.id("things"),
    productId: v.string(),
    unitAmount: v.number(),
    currency: v.string(),
    recurring: v.optional(
      v.object({
        interval: v.union(
          v.literal("day"),
          v.literal("week"),
          v.literal("month"),
          v.literal("year")
        ),
        intervalCount: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get funnel and validate access
    const funnel = await ctx.db.get(args.funnelId);
    if (!funnel || funnel.type !== "funnel") {
      throw new Error("Funnel not found");
    }

    if (funnel.groupId !== person.groupId) {
      throw new Error("No access to this funnel");
    }

    // 4. Create Stripe price
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      const price = yield* StripeService.createPrice(stripe, {
        productId: args.productId,
        unitAmount: args.unitAmount,
        currency: args.currency,
        recurring: args.recurring,
        metadata: {
          funnelId: args.funnelId,
          groupId: person.groupId,
        },
      });

      return price;
    });

    const price = await Effect.runPromise(program);

    // 5. Update funnel with Stripe price ID
    await ctx.db.patch(args.funnelId, {
      properties: {
        ...funnel.properties,
        stripePriceId: price.id,
      },
      updatedAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "entity_updated",
      actorId: person._id,
      targetId: args.funnelId,
      timestamp: Date.now(),
      metadata: {
        entityType: "funnel",
        protocol: "stripe",
        eventType: "price_created",
        stripePriceId: price.id,
        unitAmount: args.unitAmount,
        currency: args.currency,
        groupId: person.groupId,
      },
    });

    return {
      priceId: price.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
    };
  },
});

// ============================================================================
// Create Subscription
// ============================================================================

/**
 * Create a Stripe subscription with optional trial period
 *
 * CRITICAL:
 * - Validates user has access to groupId
 * - Creates subscription thing in database
 * - Logs subscription_event
 */
export const createSubscription = mutation({
  args: {
    priceId: v.string(),
    productId: v.optional(v.id("things")),
    trialPeriodDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get or create Stripe customer
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      let stripeCustomerId = person.properties?.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = yield* StripeService.createCustomer(stripe, {
          email: person.properties?.email || identity.email!,
          name: person.name,
          metadata: {
            personId: person._id,
            groupId: person.groupId,
          },
        });

        stripeCustomerId = customer.id;

        await ctx.db.patch(person._id, {
          properties: {
            ...person.properties,
            stripeCustomerId: customer.id,
          },
          updatedAt: Date.now(),
        });
      }

      // 4. Create subscription
      const subscription = yield* SubscriptionService.createSubscription(stripe, {
        priceId: args.priceId,
        customerId: stripeCustomerId,
        trialPeriodDays: args.trialPeriodDays,
        metadata: {
          personId: person._id,
          groupId: person.groupId,
          productId: args.productId || "",
        },
      });

      return subscription;
    });

    const subscription = await Effect.runPromise(program);

    // 5. Create subscription thing
    const subscriptionId = await ctx.db.insert("things", {
      type: "subscription",
      name: `Subscription ${subscription.id}`,
      groupId: person.groupId,
      properties: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: args.priceId,
        stripeCustomerId: subscription.customer,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start * 1000,
        currentPeriodEnd: subscription.current_period_end * 1000,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart: subscription.trial_start
          ? subscription.trial_start * 1000
          : null,
        trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
        productId: args.productId,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Create connection: person subscribed
    await ctx.db.insert("connections", {
      fromThingId: person._id,
      toThingId: subscriptionId,
      relationshipType: "purchased",
      metadata: {
        subscriptionType: "recurring",
        priceId: args.priceId,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 7. Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: person._id,
      targetId: subscriptionId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "subscription_created",
        stripeSubscriptionId: subscription.id,
        stripePriceId: args.priceId,
        trialPeriodDays: args.trialPeriodDays,
        groupId: person.groupId,
      },
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      trialEnd: subscription.trial_end
        ? subscription.trial_end * 1000
        : undefined,
    };
  },
});

// ============================================================================
// Update Subscription (Upgrade/Downgrade)
// ============================================================================

/**
 * Update subscription plan with proration
 */
export const updateSubscription = mutation({
  args: {
    subscriptionId: v.id("things"),
    newPriceId: v.string(),
    prorationBehavior: v.optional(
      v.union(
        v.literal("create_prorations"),
        v.literal("none"),
        v.literal("always_invoice")
      )
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get subscription and validate access
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription || subscription.type !== "subscription") {
      throw new Error("Subscription not found");
    }

    if (subscription.groupId !== person.groupId) {
      throw new Error("No access to this subscription");
    }

    // 4. Update Stripe subscription
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      const updatedSubscription = yield* SubscriptionService.updateSubscription(
        stripe,
        subscription.properties?.stripeSubscriptionId,
        {
          priceId: args.newPriceId,
          prorationBehavior: args.prorationBehavior || "create_prorations",
        }
      );

      return updatedSubscription;
    });

    const updatedSubscription = await Effect.runPromise(program);

    // 5. Update subscription thing
    await ctx.db.patch(args.subscriptionId, {
      properties: {
        ...subscription.properties,
        stripePriceId: args.newPriceId,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.current_period_end * 1000,
      },
      updatedAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: person._id,
      targetId: args.subscriptionId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "subscription_updated",
        oldPriceId: subscription.properties?.stripePriceId,
        newPriceId: args.newPriceId,
        prorationBehavior: args.prorationBehavior,
        groupId: person.groupId,
      },
    });

    return {
      subscriptionId: updatedSubscription.id,
      status: updatedSubscription.status,
    };
  },
});

// ============================================================================
// Cancel Subscription
// ============================================================================

/**
 * Cancel subscription immediately or at period end
 */
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.id("things"),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    cancellationReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get subscription and validate access
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription || subscription.type !== "subscription") {
      throw new Error("Subscription not found");
    }

    if (subscription.groupId !== person.groupId) {
      throw new Error("No access to this subscription");
    }

    // 4. Cancel Stripe subscription
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      const cancelledSubscription = yield* SubscriptionService.cancelSubscription(
        stripe,
        {
          subscriptionId: subscription.properties?.stripeSubscriptionId,
          cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? true,
          cancellationReason: args.cancellationReason,
        }
      );

      return cancelledSubscription;
    });

    const cancelledSubscription = await Effect.runPromise(program);

    // 5. Update subscription thing
    await ctx.db.patch(args.subscriptionId, {
      properties: {
        ...subscription.properties,
        status: cancelledSubscription.status,
        cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
        canceledAt: cancelledSubscription.canceled_at
          ? cancelledSubscription.canceled_at * 1000
          : null,
        cancellationReason: args.cancellationReason,
      },
      status: args.cancelAtPeriodEnd ? "active" : "archived",
      updatedAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: person._id,
      targetId: args.subscriptionId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "subscription_cancelled",
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        cancellationReason: args.cancellationReason,
        groupId: person.groupId,
      },
    });

    return {
      subscriptionId: cancelledSubscription.id,
      status: cancelledSubscription.status,
      cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
    };
  },
});

// ============================================================================
// Pause Subscription
// ============================================================================

/**
 * Pause subscription billing
 */
export const pauseSubscription = mutation({
  args: {
    subscriptionId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get subscription and validate access
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription || subscription.type !== "subscription") {
      throw new Error("Subscription not found");
    }

    if (subscription.groupId !== person.groupId) {
      throw new Error("No access to this subscription");
    }

    // 4. Pause Stripe subscription
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      const pausedSubscription = yield* SubscriptionService.pauseSubscription(
        stripe,
        subscription.properties?.stripeSubscriptionId
      );

      return pausedSubscription;
    });

    const pausedSubscription = await Effect.runPromise(program);

    // 5. Update subscription thing
    await ctx.db.patch(args.subscriptionId, {
      properties: {
        ...subscription.properties,
        status: pausedSubscription.status,
        pausedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: person._id,
      targetId: args.subscriptionId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "subscription_paused",
        groupId: person.groupId,
      },
    });

    return {
      subscriptionId: pausedSubscription.id,
      status: pausedSubscription.status,
    };
  },
});

// ============================================================================
// Resume Subscription
// ============================================================================

/**
 * Resume a paused or scheduled-to-cancel subscription
 */
export const resumeSubscription = mutation({
  args: {
    subscriptionId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get subscription and validate access
    const subscription = await ctx.db.get(args.subscriptionId);
    if (!subscription || subscription.type !== "subscription") {
      throw new Error("Subscription not found");
    }

    if (subscription.groupId !== person.groupId) {
      throw new Error("No access to this subscription");
    }

    // 4. Resume Stripe subscription
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      // Try unpause first, if that fails try resume
      try {
        const resumedSubscription = yield* SubscriptionService.unpauseSubscription(
          stripe,
          subscription.properties?.stripeSubscriptionId
        );
        return resumedSubscription;
      } catch (e) {
        const resumedSubscription = yield* SubscriptionService.resumeSubscription(
          stripe,
          subscription.properties?.stripeSubscriptionId
        );
        return resumedSubscription;
      }
    });

    const resumedSubscription = await Effect.runPromise(program);

    // 5. Update subscription thing
    await ctx.db.patch(args.subscriptionId, {
      properties: {
        ...subscription.properties,
        status: resumedSubscription.status,
        cancelAtPeriodEnd: false,
        pausedAt: null,
      },
      status: "active",
      updatedAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: person._id,
      targetId: args.subscriptionId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "subscription_resumed",
        groupId: person.groupId,
      },
    });

    return {
      subscriptionId: resumedSubscription.id,
      status: resumedSubscription.status,
    };
  },
});

// ============================================================================
// Retry Failed Payment
// ============================================================================

/**
 * Retry a failed subscription invoice payment
 */
export const retryFailedPayment = mutation({
  args: {
    invoiceId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Retry payment
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      const invoice = yield* SubscriptionService.retryInvoicePayment(
        stripe,
        args.invoiceId
      );

      return invoice;
    });

    const invoice = await Effect.runPromise(program);

    // 4. Log event
    await ctx.db.insert("events", {
      type: "subscription_event",
      actorId: person._id,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "invoice_payment_retry",
        invoiceId: args.invoiceId,
        groupId: person.groupId,
      },
    });

    return {
      invoiceId: invoice.id,
      status: invoice.status,
    };
  },
});

// ============================================================================
// Process Refund (Full or Partial)
// ============================================================================

/**
 * Process a full or partial refund for a payment
 *
 * CRITICAL:
 * - Validates payment belongs to user's group
 * - Validates refund amount (if partial)
 * - Creates refund thing in database
 * - Logs refund_processed event
 */
export const processRefund = mutation({
  args: {
    paymentId: v.id("things"),
    amount: v.optional(v.number()), // Optional for partial refund (omit for full refund)
    reason: v.optional(
      v.union(
        v.literal("duplicate"),
        v.literal("fraudulent"),
        v.literal("requested_by_customer"),
        v.literal("other")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get payment and validate access
    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.type !== "payment") {
      throw new Error("Payment not found");
    }

    if (payment.groupId !== person.groupId) {
      throw new Error("No access to this payment");
    }

    const paymentIntentId = payment.properties?.stripePaymentIntentId;
    if (!paymentIntentId) {
      throw new Error("Payment has no Stripe payment intent ID");
    }

    // 4. Process refund through Stripe
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      // Retrieve payment intent for validation
      const paymentIntent = yield* StripeService.retrievePaymentIntent(
        stripe,
        paymentIntentId
      );

      // Validate refund request
      yield* RefundService.validateRefundRequest(paymentIntent, args.amount);

      // Create refund
      const refund = yield* RefundService.createRefund(stripe, {
        paymentIntentId,
        amount: args.amount,
        reason: args.reason as any,
        metadata: {
          paymentId: args.paymentId,
          personId: person._id,
          groupId: person.groupId,
          notes: args.notes || "",
        },
      });

      return { refund, paymentIntent };
    });

    const { refund, paymentIntent } = await Effect.runPromise(program);

    // 5. Create refund thing
    const refundId = await ctx.db.insert("things", {
      type: "payment",
      name: `Refund for ${payment.name}`,
      groupId: person.groupId,
      properties: {
        stripeRefundId: refund.id,
        stripePaymentIntentId: paymentIntentId,
        originalPaymentId: args.paymentId,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason || "requested_by_customer",
        status: refund.status,
        notes: args.notes,
        isPartialRefund: args.amount !== undefined && args.amount < paymentIntent.amount,
        refundedAt: Date.now(),
      },
      status: refund.status === "succeeded" ? "published" : "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Update original payment with refund status
    const totalRefunded = (payment.properties?.totalRefunded || 0) + refund.amount;
    const fullyRefunded = totalRefunded >= (payment.properties?.amount || 0);

    await ctx.db.patch(args.paymentId, {
      properties: {
        ...payment.properties,
        refunded: true,
        fullyRefunded,
        totalRefunded,
        lastRefundId: refund.id,
      },
      status: fullyRefunded ? "archived" : payment.status,
      updatedAt: Date.now(),
    });

    // 7. Create connection: refund related to payment
    await ctx.db.insert("connections", {
      fromThingId: refundId,
      toThingId: args.paymentId,
      relationshipType: "references",
      metadata: {
        connectionType: "refund_for_payment",
        amount: refund.amount,
        reason: refund.reason,
      },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 8. Log event
    await ctx.db.insert("events", {
      type: "refund_processed",
      actorId: person._id,
      targetId: refundId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        originalPaymentId: args.paymentId,
        stripeRefundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
        isPartial: args.amount !== undefined,
        fullyRefunded,
        groupId: person.groupId,
      },
    });

    return {
      refundId: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      isPartial: args.amount !== undefined,
    };
  },
});

// ============================================================================
// Get Refund Status
// ============================================================================

/**
 * Get the status of a refund
 */
export const getRefundStatus = mutation({
  args: {
    refundId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get refund and validate access
    const refund = await ctx.db.get(args.refundId);
    if (!refund || refund.groupId !== person.groupId) {
      throw new Error("Refund not found");
    }

    const stripeRefundId = refund.properties?.stripeRefundId;
    if (!stripeRefundId) {
      throw new Error("Refund has no Stripe refund ID");
    }

    // 4. Retrieve refund from Stripe
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);
      const stripeRefund = yield* RefundService.retrieveRefund(
        stripe,
        stripeRefundId
      );
      return stripeRefund;
    });

    const stripeRefund = await Effect.runPromise(program);

    // 5. Update refund status if changed
    if (stripeRefund.status !== refund.properties?.status) {
      await ctx.db.patch(args.refundId, {
        properties: {
          ...refund.properties,
          status: stripeRefund.status,
        },
        status: stripeRefund.status === "succeeded" ? "published" : "active",
        updatedAt: Date.now(),
      });

      // Log status change event
      await ctx.db.insert("events", {
        type: "entity_updated",
        actorId: person._id,
        targetId: args.refundId,
        timestamp: Date.now(),
        metadata: {
          entityType: "refund",
          protocol: "stripe",
          oldStatus: refund.properties?.status,
          newStatus: stripeRefund.status,
          groupId: person.groupId,
        },
      });
    }

    return {
      refundId: stripeRefund.id,
      status: stripeRefund.status,
      amount: stripeRefund.amount,
      currency: stripeRefund.currency,
      reason: stripeRefund.reason,
    };
  },
});

// ============================================================================
// Handle Dispute
// ============================================================================

/**
 * Submit evidence for a dispute/chargeback
 *
 * CRITICAL:
 * - Validates dispute belongs to user's group
 * - Submits evidence to Stripe
 * - Logs dispute_response event
 */
export const handleDispute = mutation({
  args: {
    paymentId: v.id("things"),
    disputeId: v.string(),
    evidence: v.object({
      customerName: v.optional(v.string()),
      customerEmailAddress: v.optional(v.string()),
      customerPurchaseIp: v.optional(v.string()),
      productDescription: v.optional(v.string()),
      refundPolicy: v.optional(v.string()),
      cancellationPolicy: v.optional(v.string()),
      customerCommunication: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Get user
    const person = await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "creator"))
      .filter((t) => t.properties?.email === identity.email)
      .first();

    if (!person || !person.groupId) {
      throw new Error("User must belong to a group");
    }

    // 3. Get payment and validate access
    const payment = await ctx.db.get(args.paymentId);
    if (!payment || payment.groupId !== person.groupId) {
      throw new Error("Payment not found");
    }

    // 4. Update dispute evidence in Stripe
    const config = getStripeConfig();
    const program = Effect.gen(function* () {
      const stripe = yield* StripeService.initializeStripe(config);

      const dispute = yield* RefundService.updateDisputeEvidence(stripe, args.disputeId, {
        chargeId: payment.properties?.stripeChargeId || "",
        evidence: args.evidence,
      });

      return dispute;
    });

    const dispute = await Effect.runPromise(program);

    // 5. Update payment with dispute information
    await ctx.db.patch(args.paymentId, {
      properties: {
        ...payment.properties,
        disputed: true,
        disputeId: args.disputeId,
        disputeStatus: dispute.status,
        disputeEvidenceSubmitted: true,
      },
      updatedAt: Date.now(),
    });

    // 6. Log event
    await ctx.db.insert("events", {
      type: "payment_event",
      actorId: person._id,
      targetId: args.paymentId,
      timestamp: Date.now(),
      metadata: {
        protocol: "stripe",
        eventType: "dispute_evidence_submitted",
        disputeId: args.disputeId,
        disputeStatus: dispute.status,
        groupId: person.groupId,
      },
    });

    return {
      disputeId: dispute.id,
      status: dispute.status,
      evidenceSubmitted: true,
    };
  },
});
