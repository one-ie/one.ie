/**
 * Stripe Agentic Commerce Integration
 *
 * Extends existing Stripe integration with Shared Payment Token support
 * for ChatGPT Instant Checkout
 *
 * References:
 * - Existing: /web/src/lib/stripe.ts
 * - Docs: https://docs.stripe.com/agentic-commerce
 */

import Stripe from 'stripe';
import type { StripePaymentIntentParams } from '@/lib/types/agentic-checkout';

// Initialize Stripe (reusing pattern from existing code)
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

/**
 * Create PaymentIntent using Stripe Shared Payment Token
 *
 * This is the KEY integration point for ChatGPT Instant Checkout.
 * ChatGPT sends us an SPT, we use it to charge the customer.
 */
export async function createPaymentIntentWithSPT(
  sharedPaymentToken: string,
  amount: number, // in cents
  currency: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    // Create PaymentIntent with Shared Payment Token
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      // This is the magic line - use SPT instead of payment_method
      shared_payment_granted_token: sharedPaymentToken,
      metadata: {
        ...metadata,
        source: 'chatgpt_agentic_commerce',
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Confirm immediately (SPT is single-use)
      confirm: true,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating PaymentIntent with SPT:', error);
    throw error;
  }
}

/**
 * Calculate tax
 * TODO: Integrate with Stripe Tax or TaxJar for production
 */
export function calculateTax(
  subtotal: number,
  shippingCost: number,
  state: string
): number {
  // Simplified: 8% flat rate
  // In production, use Stripe Tax or TaxJar API
  const taxableAmount = subtotal + shippingCost;
  const taxRate = 0.08; // 8%

  return Math.round(taxableAmount * taxRate);
}

/**
 * Calculate shipping cost
 * TODO: Integrate with Shippo or EasyPost for real-time rates
 */
export function calculateShipping(
  items: Array<{ id: string; quantity: number }>,
  address: {
    country: string;
    state: string;
    postal_code: string;
  }
): {
  standard: number;
  express: number;
} {
  // Simplified shipping calculation
  // In production, use Shippo/EasyPost API for real-time carrier rates

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Base rates
  let standardRate = 500; // $5.00
  let expressRate = 1500; // $15.00

  // Add per-item fee
  if (itemCount > 1) {
    standardRate += (itemCount - 1) * 200; // +$2 per additional item
    expressRate += (itemCount - 1) * 300; // +$3 per additional item
  }

  // Free standard shipping over $100
  const subtotal = items.reduce((sum, item) => {
    // TODO: Get real product prices
    return sum + 5000 * item.quantity; // Mock: $50 per item
  }, 0);

  if (subtotal >= 10000) {
    // $100 or more
    standardRate = 0;
  }

  return {
    standard: standardRate,
    express: expressRate,
  };
}

/**
 * Get delivery estimate
 */
export function getDeliveryEstimate(
  shippingMethod: 'standard' | 'express',
  fromDate = new Date()
): {
  earliest: string;
  latest: string;
} {
  const earliest = new Date(fromDate);
  const latest = new Date(fromDate);

  if (shippingMethod === 'standard') {
    earliest.setDate(earliest.getDate() + 5);
    latest.setDate(latest.getDate() + 7);
  } else {
    earliest.setDate(earliest.getDate() + 1);
    latest.setDate(latest.getDate() + 2);
  }

  return {
    earliest: earliest.toISOString(),
    latest: latest.toISOString(),
  };
}

/**
 * Validate Stripe environment (reusing existing pattern)
 */
export function validateStripeEnvironment(): void {
  if (!import.meta.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  const isProduction = import.meta.env.MODE === 'production';
  const isTestKey = import.meta.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

  if (isProduction && isTestKey) {
    throw new Error('Cannot use Stripe test keys in production');
  }
}

/**
 * Handle Stripe webhook signature verification
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Test helper: Create test Shared Payment Token
 * Only works in test mode
 */
export async function createTestSPT(params: {
  amount: number;
  currency: string;
  paymentMethod?: string;
}): Promise<string> {
  // This is a Stripe test helper
  // In production, ChatGPT creates the SPT
  const token = await stripe.testHelpers.sharedPayment.grantedTokens.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    payment_method: params.paymentMethod || 'pm_card_visa', // Test card
  });

  return token.id;
}
