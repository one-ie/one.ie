/**
 * POST /api/checkout_sessions/[id]/complete
 *
 * Complete checkout session with Stripe Shared Payment Token
 *
 * This is the KEY endpoint for ChatGPT Instant Checkout!
 * ChatGPT sends us an SPT, we charge via Stripe, create order.
 *
 * References:
 * - https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens
 * - Existing: /api/checkout/create-intent.ts
 */

import type { APIRoute } from "astro";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { createPaymentIntentWithSPT } from "@/lib/stripe/agentic-commerce";
import type {
  CheckoutSessionResponse,
  CompleteCheckoutSessionRequest,
  ErrorResponse,
  Total,
} from "@/lib/types/agentic-checkout";
import { sessions } from "../../checkout_sessions";

// Initialize Stripe (following existing pattern from /api/checkout/create-intent.ts)
const _stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-09-30.clover",
  typescript: true,
});

/**
 * Validate API key
 */
function validateApiKey(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  const apiKey = authHeader.slice(7);
  const expectedKey = import.meta.env.COMMERCE_API_KEY || "test_key_change_in_production";
  return apiKey === expectedKey;
}

/**
 * Create order record
 * TODO: Integrate with Convex for persistence
 */
function createOrder(
  sessionId: string,
  _paymentIntentId: string
): {
  id: string;
  checkout_session_id: string;
  permalink_url: string;
} {
  const orderId = `ord_${nanoid(24)}`;

  // TODO: Store in Convex database
  // await ctx.db.insert('orders', {
  //   id: orderId,
  //   checkoutSessionId: sessionId,
  //   paymentIntentId,
  //   status: 'confirmed',
  //   createdAt: Date.now(),
  // });

  return {
    id: orderId,
    checkout_session_id: sessionId,
    permalink_url: `https://one.ie/orders/${orderId}`,
  };
}

/**
 * Send webhook to OpenAI
 * Notifies ChatGPT that order was created
 */
async function sendOrderWebhookToOpenAI(sessionId: string, order: any): Promise<void> {
  // TODO: Implement webhook delivery
  // const webhookUrl = import.meta.env.OPENAI_WEBHOOK_URL;
  // const webhookSecret = import.meta.env.OPENAI_WEBHOOK_SECRET;
  //
  // await fetch(webhookUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Signature': generateHMACSignature(payload, webhookSecret),
  //   },
  //   body: JSON.stringify({
  //     type: 'order_created',
  //     data: {
  //       type: 'order',
  //       checkout_session_id: sessionId,
  //       permalink_url: order.permalink_url,
  //       status: 'confirmed',
  //       refunds: [],
  //     },
  //   }),
  // });

  console.log("[TODO] Send webhook to OpenAI:", {
    type: "order_created",
    checkout_session_id: sessionId,
    order_id: order.id,
  });
}

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const sessionId = params.id;
    if (!sessionId) {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "missing",
          message: "Session ID is required",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate API key
    const authHeader = request.headers.get("Authorization");
    if (!validateApiKey(authHeader)) {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "unauthorized",
          message: "Invalid API key",
        } as ErrorResponse),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get existing session
    const existingSession = sessions.get(sessionId);
    if (!existingSession) {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "not_found",
          message: "Checkout session not found",
        } as ErrorResponse),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if already completed
    if (existingSession.status === "completed") {
      // Return existing response (idempotency)
      const { created_at, updated_at, ...response } = existingSession;
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if canceled
    if (existingSession.status === "canceled") {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "invalid",
          message: "Cannot complete canceled session",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if ready for payment
    if (existingSession.status !== "ready_for_payment") {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "invalid",
          message: "Session is not ready for payment. Fulfillment address may be missing.",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = (await request.json()) as CompleteCheckoutSessionRequest;
    const { buyer, payment_data } = body;

    // Validate payment data
    if (!payment_data || !payment_data.token) {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "missing",
          message: "Payment data with token is required",
          param: "payment_data.token",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payment_data.provider !== "stripe") {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "invalid",
          message: "Only Stripe payment provider is supported",
          param: "payment_data.provider",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get total amount
    const totalObj = existingSession.totals.find((t: Total) => t.type === "total");
    if (!totalObj) {
      return new Response(
        JSON.stringify({
          type: "invalid_request",
          code: "invalid",
          message: "Session total not found",
        } as ErrorResponse),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const amount = totalObj.amount;

    try {
      // ⭐ KEY INTEGRATION POINT ⭐
      // Use Stripe Shared Payment Token from ChatGPT
      // This is different from regular payment flow!
      const paymentIntent = await createPaymentIntentWithSPT(
        payment_data.token, // spt_... from ChatGPT
        amount,
        existingSession.currency,
        {
          checkout_session_id: sessionId,
          buyer_email: buyer?.email || existingSession.buyer?.email || "",
          buyer_name: buyer?.first_name || "",
          source: "chatgpt_agentic_commerce",
        }
      );

      // Check payment status
      if (paymentIntent.status !== "succeeded") {
        // Payment failed or requires action
        return new Response(
          JSON.stringify({
            type: "error",
            code: "payment_declined",
            message: `Payment ${paymentIntent.status}. Please try a different payment method.`,
          } as ErrorResponse),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Payment succeeded! Create order
      const order = createOrder(sessionId, paymentIntent.id);

      // Send webhook to OpenAI (async, don't block response)
      sendOrderWebhookToOpenAI(sessionId, order).catch((error) => {
        console.error("Failed to send webhook to OpenAI:", error);
        // Don't fail the request if webhook fails
        // Implement retry logic in production
      });

      // Update session
      const completedSession: CheckoutSessionResponse = {
        id: sessionId,
        buyer: buyer || existingSession.buyer,
        payment_provider: existingSession.payment_provider,
        status: "completed",
        currency: existingSession.currency,
        line_items: existingSession.line_items,
        fulfillment_address: existingSession.fulfillment_address,
        fulfillment_options: existingSession.fulfillment_options,
        fulfillment_option_id: existingSession.fulfillment_option_id,
        totals: existingSession.totals,
        order,
        messages: [],
        links: existingSession.links,
      };

      // Store completed session
      sessions.set(sessionId, {
        ...completedSession,
        created_at: existingSession.created_at,
        updated_at: Date.now(),
        payment_intent_id: paymentIntent.id,
      });

      // Return response
      const idempotencyKey = request.headers.get("Idempotency-Key") || "";
      const requestId = request.headers.get("Request-Id") || "";

      return new Response(JSON.stringify(completedSession), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
          "Request-Id": requestId,
        },
      });
    } catch (stripeError) {
      console.error("Stripe payment error:", stripeError);

      // Handle Stripe-specific errors
      if (stripeError instanceof Stripe.errors.StripeError) {
        let errorCode: "payment_declined" | "requires_3ds" | "invalid" = "payment_declined";
        let errorMessage = stripeError.message;

        // Map Stripe error types to ACP error codes
        if (stripeError.type === "StripeCardError") {
          errorCode = "payment_declined";
        } else if (stripeError.code === "authentication_required") {
          errorCode = "requires_3ds";
          errorMessage = "3D Secure authentication required";
        }

        return new Response(
          JSON.stringify({
            type: "error",
            code: errorCode,
            message: errorMessage,
          } as ErrorResponse),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      throw stripeError;
    }
  } catch (error) {
    console.error("Complete checkout session error:", error);

    return new Response(
      JSON.stringify({
        type: "invalid_request",
        code: "processing_error",
        message: error instanceof Error ? error.message : "Unknown error",
      } as ErrorResponse),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
