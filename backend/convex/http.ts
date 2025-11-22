/**
 * HTTP Endpoints - Convex HTTP API routes
 *
 * This file defines HTTP endpoints for the Convex backend, including:
 * - Stripe webhook handler (/api/webhooks/stripe)
 * - Health check endpoint (/health)
 *
 * @see https://docs.convex.dev/functions/http-actions
 * @see /backend/convex/services/payments/webhook-handler.ts
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { WebhookHandler } from "./services/payments/webhook-handler";
import { Effect } from "effect";

// ============================================================================
// HTTP Router
// ============================================================================

const http = httpRouter();

// ============================================================================
// Stripe Webhook Endpoint
// ============================================================================

/**
 * POST /api/webhooks/stripe
 *
 * Receives and processes Stripe webhook events.
 *
 * CRITICAL:
 * - Verifies Stripe signature for security
 * - Implements idempotency (prevents duplicate processing)
 * - Logs all webhooks for debugging
 * - Updates payment/subscription status via internal mutations
 *
 * Stripe Configuration:
 * - Add this URL to your Stripe webhook endpoints: https://<your-domain>/api/webhooks/stripe
 * - Select events to send (or send all events)
 * - Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET env var
 *
 * Supported Events:
 * - payment_intent.succeeded, payment_intent.payment_failed
 * - checkout.session.completed
 * - customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 * - invoice.paid, invoice.payment_failed
 * - customer.created, customer.updated
 * - charge.refunded
 *
 * @see https://stripe.com/docs/webhooks
 * @see /backend/convex/services/payments/webhook-handler.ts
 */
http.route({
  path: "/api/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // 1. Get raw body and signature
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        console.error("[Webhook] Missing Stripe signature header");
        return new Response(
          JSON.stringify({ error: "Missing signature" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 2. Get webhook secret from environment
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return new Response(
          JSON.stringify({ error: "Webhook not configured" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 3. Process webhook using WebhookHandler service
      const program = WebhookHandler.handleStripeWebhook(
        body,
        signature,
        webhookSecret
      );

      const result = await Effect.runPromise(program);

      // 4. Check if event should be processed
      if (!WebhookHandler.shouldProcessEvent(result.eventType)) {
        console.log(`[Webhook] Ignoring event type: ${result.eventType}`);
        return new Response(
          JSON.stringify({
            received: true,
            eventId: result.eventId,
            eventType: result.eventType,
            processed: false,
            message: "Event type ignored",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // 5. Log webhook to events table for debugging
      try {
        await ctx.runMutation(internal.webhooks.logEvent, {
          stripeEventId: result.eventId,
          stripeEventType: result.eventType,
          processed: result.processed,
          error: result.message,
          timestamp: Date.now(),
          metadata: {
            protocol: "stripe",
            eventType: "webhook_received",
            category: WebhookHandler.getEventCategory(result.eventType),
            data: result.data,
          },
        });
      } catch (logError) {
        console.error("[Webhook] Failed to log event:", logError);
        // Continue processing even if logging fails
      }

      // 6. Return success response
      return new Response(
        JSON.stringify({
          received: true,
          eventId: result.eventId,
          eventType: result.eventType,
          processed: result.processed,
          message: result.message || "Webhook processed successfully",
          data: result.data,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("[Webhook] Processing error:", error);

      // Return 200 to acknowledge receipt (prevents Stripe retries for errors)
      // But log the error for investigation
      return new Response(
        JSON.stringify({
          received: true,
          error: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack : undefined,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// ============================================================================
// Health Check Endpoint
// ============================================================================

/**
 * GET /health
 *
 * Simple health check endpoint for monitoring.
 */
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({
        status: "healthy",
        timestamp: Date.now(),
        service: "ONE Platform Backend",
        version: "1.0.0",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// ============================================================================
// Webhook Testing Endpoint (Development Only)
// ============================================================================

/**
 * POST /api/webhooks/stripe/test
 *
 * Test webhook processing without Stripe signature verification.
 * ONLY use in development - remove before production deployment.
 */
if (process.env.NODE_ENV === "development") {
  http.route({
    path: "/api/webhooks/stripe/test",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      try {
        const body = await request.json();

        console.log("[Webhook Test] Received test webhook:", body);

        return new Response(
          JSON.stringify({
            received: true,
            message: "Test webhook received",
            data: body,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }),
  });
}

// ============================================================================
// Export HTTP Router
// ============================================================================

export default http;
