/**
 * Generate Test Shared Payment Token (SPT)
 *
 * This endpoint uses Stripe's test helpers to create a test SPT for demo purposes.
 * In production, ChatGPT creates the SPT automatically from the customer's saved payment method.
 *
 * Reference: https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens
 */

import type { APIRoute } from "astro";
import { createTestSPT } from "@/lib/stripe/agentic-commerce";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { amount, currency } = await request.json();

    // Validate inputs
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid amount",
          message: "Amount must be a positive number in cents",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!currency || typeof currency !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid currency",
          message: "Currency must be a valid ISO 4217 currency code",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create test SPT using Stripe test helpers
    const sptToken = await createTestSPT({
      amount,
      currency,
    });

    return new Response(
      JSON.stringify({
        token: sptToken,
        amount,
        currency,
        test_mode: true,
        created_at: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Test SPT] Error generating test token:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to generate test SPT",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
