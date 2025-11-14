/**
 * Commerce Purchase API
 *
 * Handles purchase initiation, order creation, and conversion tracking
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      productId,
      quantity = 1,
      email,
      name,
      conversationId,
      source = 'web',
    } = body;

    // Generate order ID
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // In production, this would:
    // 1. Create order in Convex database
    // 2. Create customer thing (if first purchase)
    // 3. Link order to conversation
    // 4. Log purchase event
    // 5. Process payment via Stripe
    // 6. Send confirmation email
    // 7. Schedule follow-up automations

    // Mock order creation
    const order = {
      id: orderId,
      productId,
      quantity,
      customer: {
        email,
        name,
      },
      conversationId,
      source,
      status: 'confirmed',
      createdAt: Date.now(),
    };

    // Log conversion event
    console.log('Conversion tracked:', {
      orderId,
      conversationId,
      source,
      productId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        order,
        message: 'Order placed successfully!',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Purchase error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process purchase',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
