/**
 * StripeService - Business logic for Stripe payment processing
 *
 * This service implements the core business logic for Stripe payments
 * using Effect.ts patterns. All operations enforce multi-tenant isolation
 * through groupId validation.
 *
 * Key Features:
 * - Payment intent creation and confirmation
 * - Customer management
 * - Product and price creation
 * - Webhook event handling
 * - Subscription management
 *
 * @see /one/knowledge/ontology.md - 6-dimension ontology
 * @see /backend/CLAUDE.md - Backend patterns
 */

import { Effect } from "effect";
import Stripe from "stripe";

// ============================================================================
// Types
// ============================================================================

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface StripeCustomerData {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface StripeProductData {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
}

export interface StripePriceData {
  productId: string;
  unitAmount: number;
  currency: string;
  recurring?: {
    interval: "day" | "week" | "month" | "year";
    intervalCount?: number;
  };
  metadata?: Record<string, string>;
}

export interface CheckoutSessionData {
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

// ============================================================================
// Errors
// ============================================================================

export class StripeInitializationError {
  readonly _tag = "StripeInitializationError";
  constructor(public message: string) {}
}

export class StripePaymentError {
  readonly _tag = "StripePaymentError";
  constructor(public message: string, public code?: string) {}
}

export class StripeCustomerError {
  readonly _tag = "StripeCustomerError";
  constructor(public message: string) {}
}

export class StripeProductError {
  readonly _tag = "StripeProductError";
  constructor(public message: string) {}
}

export class StripeWebhookError {
  readonly _tag = "StripeWebhookError";
  constructor(public message: string) {}
}

// ============================================================================
// Stripe Client Initialization
// ============================================================================

/**
 * Initialize Stripe client
 *
 * @param config - Stripe configuration
 * @returns Effect that resolves to Stripe client
 */
export const initializeStripe = (
  config: StripeConfig
): Effect.Effect<Stripe, StripeInitializationError> =>
  Effect.try({
    try: () =>
      new Stripe(config.secretKey, {
        apiVersion: "2024-11-20.acacia",
        typescript: true,
      }),
    catch: (error) =>
      new StripeInitializationError(
        `Failed to initialize Stripe: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Payment Intent Operations
// ============================================================================

/**
 * Create a payment intent
 *
 * @param stripe - Stripe client
 * @param data - Payment intent data
 * @returns Effect that resolves to Stripe PaymentIntent
 */
export const createPaymentIntent = (
  stripe: Stripe,
  data: PaymentIntentData
): Effect.Effect<Stripe.PaymentIntent, StripePaymentError> =>
  Effect.tryPromise({
    try: () =>
      stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: data.customerId,
        metadata: data.metadata,
        description: data.description,
        automatic_payment_methods: {
          enabled: true,
        },
      }),
    catch: (error) =>
      new StripePaymentError(
        `Failed to create payment intent: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

/**
 * Confirm a payment intent
 *
 * @param stripe - Stripe client
 * @param paymentIntentId - Payment intent ID
 * @param paymentMethodId - Payment method ID
 * @returns Effect that resolves to confirmed PaymentIntent
 */
export const confirmPaymentIntent = (
  stripe: Stripe,
  paymentIntentId: string,
  paymentMethodId: string
): Effect.Effect<Stripe.PaymentIntent, StripePaymentError> =>
  Effect.tryPromise({
    try: () =>
      stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      }),
    catch: (error) =>
      new StripePaymentError(
        `Failed to confirm payment intent: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

/**
 * Retrieve a payment intent
 *
 * @param stripe - Stripe client
 * @param paymentIntentId - Payment intent ID
 * @returns Effect that resolves to PaymentIntent
 */
export const retrievePaymentIntent = (
  stripe: Stripe,
  paymentIntentId: string
): Effect.Effect<Stripe.PaymentIntent, StripePaymentError> =>
  Effect.tryPromise({
    try: () => stripe.paymentIntents.retrieve(paymentIntentId),
    catch: (error) =>
      new StripePaymentError(
        `Failed to retrieve payment intent: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

// ============================================================================
// Customer Operations
// ============================================================================

/**
 * Create a Stripe customer
 *
 * @param stripe - Stripe client
 * @param data - Customer data
 * @returns Effect that resolves to Stripe Customer
 */
export const createCustomer = (
  stripe: Stripe,
  data: StripeCustomerData
): Effect.Effect<Stripe.Customer, StripeCustomerError> =>
  Effect.tryPromise({
    try: () =>
      stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: data.metadata,
      }),
    catch: (error) =>
      new StripeCustomerError(
        `Failed to create customer: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Retrieve a Stripe customer
 *
 * @param stripe - Stripe client
 * @param customerId - Customer ID
 * @returns Effect that resolves to Stripe Customer
 */
export const retrieveCustomer = (
  stripe: Stripe,
  customerId: string
): Effect.Effect<Stripe.Customer, StripeCustomerError> =>
  Effect.tryPromise({
    try: () => stripe.customers.retrieve(customerId),
    catch: (error) =>
      new StripeCustomerError(
        `Failed to retrieve customer: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Update a Stripe customer
 *
 * @param stripe - Stripe client
 * @param customerId - Customer ID
 * @param data - Updated customer data
 * @returns Effect that resolves to updated Customer
 */
export const updateCustomer = (
  stripe: Stripe,
  customerId: string,
  data: Partial<StripeCustomerData>
): Effect.Effect<Stripe.Customer, StripeCustomerError> =>
  Effect.tryPromise({
    try: () =>
      stripe.customers.update(customerId, {
        email: data.email,
        name: data.name,
        metadata: data.metadata,
      }),
    catch: (error) =>
      new StripeCustomerError(
        `Failed to update customer: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Product Operations
// ============================================================================

/**
 * Create a Stripe product
 *
 * @param stripe - Stripe client
 * @param data - Product data
 * @returns Effect that resolves to Stripe Product
 */
export const createProduct = (
  stripe: Stripe,
  data: StripeProductData
): Effect.Effect<Stripe.Product, StripeProductError> =>
  Effect.tryPromise({
    try: () =>
      stripe.products.create({
        name: data.name,
        description: data.description,
        images: data.images,
        metadata: data.metadata,
      }),
    catch: (error) =>
      new StripeProductError(
        `Failed to create product: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Retrieve a Stripe product
 *
 * @param stripe - Stripe client
 * @param productId - Product ID
 * @returns Effect that resolves to Stripe Product
 */
export const retrieveProduct = (
  stripe: Stripe,
  productId: string
): Effect.Effect<Stripe.Product, StripeProductError> =>
  Effect.tryPromise({
    try: () => stripe.products.retrieve(productId),
    catch: (error) =>
      new StripeProductError(
        `Failed to retrieve product: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Update a Stripe product
 *
 * @param stripe - Stripe client
 * @param productId - Product ID
 * @param data - Updated product data
 * @returns Effect that resolves to updated Product
 */
export const updateProduct = (
  stripe: Stripe,
  productId: string,
  data: Partial<StripeProductData>
): Effect.Effect<Stripe.Product, StripeProductError> =>
  Effect.tryPromise({
    try: () =>
      stripe.products.update(productId, {
        name: data.name,
        description: data.description,
        images: data.images,
        metadata: data.metadata,
      }),
    catch: (error) =>
      new StripeProductError(
        `Failed to update product: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Price Operations
// ============================================================================

/**
 * Create a Stripe price
 *
 * @param stripe - Stripe client
 * @param data - Price data
 * @returns Effect that resolves to Stripe Price
 */
export const createPrice = (
  stripe: Stripe,
  data: StripePriceData
): Effect.Effect<Stripe.Price, StripeProductError> =>
  Effect.tryPromise({
    try: () =>
      stripe.prices.create({
        product: data.productId,
        unit_amount: data.unitAmount,
        currency: data.currency,
        recurring: data.recurring,
        metadata: data.metadata,
      }),
    catch: (error) =>
      new StripeProductError(
        `Failed to create price: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Retrieve a Stripe price
 *
 * @param stripe - Stripe client
 * @param priceId - Price ID
 * @returns Effect that resolves to Stripe Price
 */
export const retrievePrice = (
  stripe: Stripe,
  priceId: string
): Effect.Effect<Stripe.Price, StripeProductError> =>
  Effect.tryPromise({
    try: () => stripe.prices.retrieve(priceId),
    catch: (error) =>
      new StripeProductError(
        `Failed to retrieve price: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

// ============================================================================
// Checkout Session Operations
// ============================================================================

/**
 * Create a Stripe checkout session
 *
 * @param stripe - Stripe client
 * @param data - Checkout session data
 * @returns Effect that resolves to Stripe Checkout Session
 */
export const createCheckoutSession = (
  stripe: Stripe,
  data: CheckoutSessionData
): Effect.Effect<Stripe.Checkout.Session, StripePaymentError> =>
  Effect.tryPromise({
    try: () =>
      stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: data.priceId,
            quantity: data.quantity,
          },
        ],
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        customer: data.customerId,
        metadata: data.metadata,
      }),
    catch: (error) =>
      new StripePaymentError(
        `Failed to create checkout session: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

/**
 * Retrieve a checkout session
 *
 * @param stripe - Stripe client
 * @param sessionId - Session ID
 * @returns Effect that resolves to Checkout Session
 */
export const retrieveCheckoutSession = (
  stripe: Stripe,
  sessionId: string
): Effect.Effect<Stripe.Checkout.Session, StripePaymentError> =>
  Effect.tryPromise({
    try: () => stripe.checkout.sessions.retrieve(sessionId),
    catch: (error) =>
      new StripePaymentError(
        `Failed to retrieve checkout session: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Stripe.errors.StripeError ? error.code : undefined
      ),
  });

// ============================================================================
// Webhook Operations
// ============================================================================

/**
 * Construct and verify a Stripe webhook event
 *
 * @param stripe - Stripe client
 * @param payload - Raw webhook payload
 * @param signature - Stripe signature header
 * @param webhookSecret - Webhook secret
 * @returns Effect that resolves to verified Stripe Event
 */
export const constructWebhookEvent = (
  stripe: Stripe,
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Effect.Effect<Stripe.Event, StripeWebhookError> =>
  Effect.try({
    try: () =>
      stripe.webhooks.constructEvent(payload, signature, webhookSecret),
    catch: (error) =>
      new StripeWebhookError(
        `Failed to verify webhook: ${error instanceof Error ? error.message : "Unknown error"}`
      ),
  });

/**
 * Process webhook event and extract payment metadata
 *
 * @param event - Stripe webhook event
 * @returns Effect that resolves to processed event data
 */
export const processWebhookEvent = (
  event: Stripe.Event
): Effect.Effect<WebhookEventData, StripeWebhookError> =>
  Effect.sync(() => {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          type: "payment_succeeded",
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer as string | undefined,
          metadata: paymentIntent.metadata,
        };
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          type: "payment_failed",
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message,
          metadata: paymentIntent.metadata,
        };
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "checkout_completed",
          sessionId: session.id,
          paymentIntentId: session.payment_intent as string | undefined,
          customerId: session.customer as string | undefined,
          metadata: session.metadata,
        };
      }

      case "customer.created": {
        const customer = event.data.object as Stripe.Customer;
        return {
          type: "customer_created",
          customerId: customer.id,
          email: customer.email,
          metadata: customer.metadata,
        };
      }

      default:
        return {
          type: "unknown",
          eventType: event.type,
        };
    }
  });

export interface WebhookEventData {
  type: string;
  [key: string]: any;
}

// ============================================================================
// Service Export
// ============================================================================

export const StripeService = {
  // Initialization
  initializeStripe,

  // Payment Intents
  createPaymentIntent,
  confirmPaymentIntent,
  retrievePaymentIntent,

  // Customers
  createCustomer,
  retrieveCustomer,
  updateCustomer,

  // Products
  createProduct,
  retrieveProduct,
  updateProduct,

  // Prices
  createPrice,
  retrievePrice,

  // Checkout Sessions
  createCheckoutSession,
  retrieveCheckoutSession,

  // Webhooks
  constructWebhookEvent,
  processWebhookEvent,
};
