/**
 * /api/checkout_sessions/[id]
 *
 * POST - Update checkout session
 * GET - Retrieve checkout session
 *
 * Follows OpenAI Agentic Checkout Spec
 */

import type { APIRoute } from 'astro';
import type {
  UpdateCheckoutSessionRequest,
  CheckoutSessionResponse,
  LineItem,
  Total,
  FulfillmentOption,
  ErrorResponse,
} from '@/lib/types/agentic-checkout';
import { sessions } from '../checkout_sessions';
import {
  calculateTax,
  calculateShipping,
  getDeliveryEstimate,
} from '@/lib/stripe/agentic-commerce';

// Product catalog (matches product-chat.astro)
const products = {
  'chanel-coco-noir': {
    id: 'chanel-coco-noir',
    name: 'Chanel Coco Noir Eau de Parfum',
    price: 12999, // $129.99 in cents
    description: 'Elegant and mysterious. Coco Noir captures the essence of timeless sophistication with notes of grapefruit, rose, and sandalwood.',
    image: 'https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp',
    inStock: true,
    stock: 7,
  },
};

function getProductById(id: string) {
  return products[id as keyof typeof products] || null;
}

/**
 * Validate API key
 */
function validateApiKey(authHeader: string | null): boolean {
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  const apiKey = authHeader.slice(7);
  const expectedKey = import.meta.env.COMMERCE_API_KEY || 'test_key_change_in_production';
  return apiKey === expectedKey;
}

/**
 * Rebuild line items if items changed
 */
function rebuildLineItems(
  items: Array<{ id: string; quantity: number }>
): { lineItems: LineItem[]; itemsBaseAmount: number } | { error: string } {
  const lineItems: LineItem[] = [];
  let itemsBaseAmount = 0;

  for (const item of items) {
    const product = getProductById(item.id);
    if (!product) {
      return { error: `Product ${item.id} not found` };
    }
    if (!product.inStock) {
      return { error: `Product ${item.id} is out of stock` };
    }

    // Price is already in cents (e.g., 12999 = $129.99)
    const priceInCents = product.price;
    const baseAmount = priceInCents * item.quantity;
    itemsBaseAmount += baseAmount;

    lineItems.push({
      id: `li_${Date.now()}_${item.id}`,
      item: { id: item.id, quantity: item.quantity },
      base_amount: priceInCents,
      discount: 0,
      subtotal: priceInCents,
      tax: 0,
      total: priceInCents,
    });
  }

  return { lineItems, itemsBaseAmount };
}

/**
 * GET - Retrieve checkout session
 */
export const GET: APIRoute = async ({ params, request }) => {
  try {
    const sessionId = params.id;
    if (!sessionId) {
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'missing',
          message: 'Session ID is required',
        } as ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key
    const authHeader = request.headers.get('Authorization');
    if (!validateApiKey(authHeader)) {
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'unauthorized',
          message: 'Invalid API key',
        } as ErrorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'not_found',
          message: 'Checkout session not found',
        } as ErrorResponse),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remove internal fields
    const { created_at, updated_at, ...response } = session;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get checkout session error:', error);
    return new Response(
      JSON.stringify({
        type: 'invalid_request',
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * POST - Update checkout session
 */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const sessionId = params.id;
    if (!sessionId) {
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'missing',
          message: 'Session ID is required',
        } as ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key
    const authHeader = request.headers.get('Authorization');
    if (!validateApiKey(authHeader)) {
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'unauthorized',
          message: 'Invalid API key',
        } as ErrorResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get existing session
    const existingSession = sessions.get(sessionId);
    if (!existingSession) {
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'not_found',
          message: 'Checkout session not found',
        } as ErrorResponse),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if session is completed or canceled
    if (existingSession.status === 'completed' || existingSession.status === 'canceled') {
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'invalid',
          message: `Cannot update ${existingSession.status} session`,
        } as ErrorResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = (await request.json()) as UpdateCheckoutSessionRequest;
    const { buyer, items, fulfillment_address, fulfillment_option_id } = body;

    // Start with existing session
    let lineItems = existingSession.line_items;
    let itemsBaseAmount = existingSession.totals.find(
      (t: Total) => t.type === 'items_base_amount'
    )?.amount || 0;

    // Rebuild line items if items changed
    if (items) {
      const result = rebuildLineItems(items);
      if ('error' in result) {
        return new Response(
          JSON.stringify({
            type: 'invalid_request',
            code: 'invalid',
            message: result.error,
            param: 'items',
          } as ErrorResponse),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      lineItems = result.lineItems;
      itemsBaseAmount = result.itemsBaseAmount;
    }

    // Get current or updated fulfillment address
    const currentAddress = fulfillment_address || existingSession.fulfillment_address;

    // Rebuild fulfillment options if address changed
    let fulfillmentOptions: FulfillmentOption[] = existingSession.fulfillment_options || [];
    let selectedFulfillmentId = fulfillment_option_id || existingSession.fulfillment_option_id;
    let fulfillmentCost = 0;

    if (currentAddress) {
      // Simple free shipping option
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
      const latestDeliveryDate = new Date(deliveryDate);
      latestDeliveryDate.setDate(latestDeliveryDate.getDate() + 2); // 7 days from now

      fulfillmentOptions = [
        {
          type: 'shipping',
          id: 'free_shipping',
          title: 'Free Shipping',
          subtitle: 'Arrives in 5-7 business days',
          carrier_info: 'USPS',
          earliest_delivery_time: deliveryDate.toISOString(),
          latest_delivery_time: latestDeliveryDate.toISOString(),
          subtotal: 0,
          tax: 0,
          total: 0,
        },
      ];

      // Select free shipping by default
      selectedFulfillmentId = fulfillment_option_id || 'free_shipping';
      fulfillmentCost = 0;
    }

    // Calculate tax (no tax for now)
    let tax = 0;

    // Build totals
    const totals: Total[] = [
      {
        type: 'items_base_amount',
        display_text: 'Item(s) total',
        amount: itemsBaseAmount,
      },
      {
        type: 'subtotal',
        display_text: 'Subtotal',
        amount: itemsBaseAmount,
      },
      ...(fulfillmentCost > 0
        ? [
            {
              type: 'fulfillment' as const,
              display_text: 'Shipping',
              amount: fulfillmentCost,
            },
          ]
        : []),
      ...(tax > 0
        ? [
            {
              type: 'tax' as const,
              display_text: 'Tax',
              amount: tax,
            },
          ]
        : []),
      {
        type: 'total',
        display_text: 'Total',
        amount: itemsBaseAmount + fulfillmentCost + tax,
      },
    ];

    // Determine status
    const status = currentAddress ? 'ready_for_payment' : 'not_ready_for_payment';

    // Build updated session
    const updatedSession: CheckoutSessionResponse = {
      id: sessionId,
      buyer: buyer || existingSession.buyer,
      payment_provider: existingSession.payment_provider,
      status,
      currency: existingSession.currency,
      line_items: lineItems,
      fulfillment_address: currentAddress,
      fulfillment_options: fulfillmentOptions,
      fulfillment_option_id: selectedFulfillmentId,
      totals,
      messages: [],
      links: existingSession.links,
    };

    // Update session in store
    sessions.set(sessionId, {
      ...updatedSession,
      created_at: existingSession.created_at,
      updated_at: Date.now(),
    });

    // Return response
    const idempotencyKey = request.headers.get('Idempotency-Key') || '';
    const requestId = request.headers.get('Request-Id') || '';

    return new Response(JSON.stringify(updatedSession), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'Request-Id': requestId,
      },
    });
  } catch (error) {
    console.error('Update checkout session error:', error);
    return new Response(
      JSON.stringify({
        type: 'invalid_request',
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
