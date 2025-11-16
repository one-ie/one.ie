/**
 * POST /api/checkout_sessions
 * Create checkout session for Agentic Commerce (ChatGPT)
 *
 * Follows OpenAI Agentic Checkout Spec
 * Integrates with existing Stripe infrastructure
 *
 * Security:
 * - API key authentication
 * - Server-side price calculation
 * - Request validation
 */

import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import type {
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  LineItem,
  Total,
  FulfillmentOption,
  ErrorResponse,
} from '@/lib/types/agentic-checkout';
import {
  calculateTax,
  calculateShipping,
  getDeliveryEstimate,
  validateStripeEnvironment,
} from '@/lib/stripe/agentic-commerce';

// Product catalog (matches product-chat.astro)
const products = {
  'chanel-coco-noir': {
    id: 'chanel-coco-noir',
    name: 'Chanel Coco Noir Eau de Parfum',
    price: 12999, // $129.99 in cents
    description: 'Elegant and mysterious. Coco Noir captures the essence of timeless sophistication with notes of grapefruit, rose, and sandalwood.',
    image: 'https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp',
    inStock: true, // Product is in stock
    stock: 7, // 7 units available
  },
};

function getProductById(id: string) {
  return products[id as keyof typeof products] || null;
}

// In-memory session store
// TODO: Migrate to Convex for production
const sessions = new Map<string, any>();

/**
 * Validate API key (from environment)
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
 * Build line items from cart items
 */
function buildLineItems(
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
      id: `li_${nanoid(16)}`,
      item: {
        id: item.id,
        quantity: item.quantity,
      },
      base_amount: priceInCents,
      discount: 0, // TODO: Apply promo codes if any
      subtotal: priceInCents,
      tax: 0, // Calculated after address provided
      total: priceInCents,
    });
  }

  return { lineItems, itemsBaseAmount };
}

/**
 * Build fulfillment options
 */
function buildFulfillmentOptions(
  items: Array<{ id: string; quantity: number }>,
  address: any
): FulfillmentOption[] {
  const shippingCosts = calculateShipping(items, {
    country: address.country,
    state: address.state,
    postal_code: address.postal_code,
  });

  const standardEstimate = getDeliveryEstimate('standard');
  const expressEstimate = getDeliveryEstimate('express');

  return [
    {
      type: 'shipping',
      id: 'standard_shipping',
      title: 'Standard Shipping',
      subtitle: 'Arrives in 5-7 business days',
      carrier_info: 'USPS',
      earliest_delivery_time: standardEstimate.earliest,
      latest_delivery_time: standardEstimate.latest,
      subtotal: shippingCosts.standard,
      tax: 0,
      total: shippingCosts.standard,
    },
    {
      type: 'shipping',
      id: 'express_shipping',
      title: 'Express Shipping',
      subtitle: 'Arrives in 1-2 business days',
      carrier_info: 'USPS',
      earliest_delivery_time: expressEstimate.earliest,
      latest_delivery_time: expressEstimate.latest,
      subtotal: shippingCosts.express,
      tax: 0,
      total: shippingCosts.express,
    },
  ];
}

/**
 * Build totals array
 */
function buildTotals(
  itemsBaseAmount: number,
  fulfillmentCost: number,
  tax: number
): Total[] {
  return [
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
}

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('[Checkout] Creating session...');

    // Validate environment
    validateStripeEnvironment();

    // Validate API key
    const authHeader = request.headers.get('Authorization');
    console.log('[Checkout] Auth header:', authHeader ? 'present' : 'missing');
    console.log('[Checkout] Expected key:', import.meta.env.COMMERCE_API_KEY);

    if (!validateApiKey(authHeader)) {
      console.error('[Checkout] API key validation failed');
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'unauthorized',
          message: 'Invalid API key',
        } as ErrorResponse),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Checkout] API key validated');

    // Parse request body
    const body = (await request.json()) as CreateCheckoutSessionRequest;
    console.log('[Checkout] Request body:', JSON.stringify(body, null, 2));
    const { items, buyer, fulfillment_address } = body;

    // Validate items
    console.log('[Checkout] Items:', items);
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('[Checkout] Items validation failed');

      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'missing',
          message: 'Items array is required and must not be empty',
          param: 'items',
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || typeof item.id !== 'string') {
        return new Response(
          JSON.stringify({
            type: 'invalid_request',
            code: 'invalid',
            message: 'Each item must have a valid id',
            param: 'items',
          } as ErrorResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (!item.quantity || item.quantity < 1) {
        return new Response(
          JSON.stringify({
            type: 'invalid_request',
            code: 'invalid',
            message: 'Each item must have quantity >= 1',
            param: 'items',
          } as ErrorResponse),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Create session ID
    const sessionId = `cs_${nanoid(24)}`;
    console.log('[Checkout] Session ID:', sessionId);

    // Build line items
    console.log('[Checkout] Building line items...');
    const lineItemsResult = buildLineItems(items);
    console.log('[Checkout] Line items result:', lineItemsResult);

    if ('error' in lineItemsResult) {
      console.error('[Checkout] Line items error:', lineItemsResult.error);
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'invalid',
          message: lineItemsResult.error,
          param: 'items',
        } as ErrorResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Checkout] Line items built successfully');

    const { lineItems, itemsBaseAmount } = lineItemsResult;

    // Calculate fulfillment and tax (if address provided)
    let fulfillmentOptions: FulfillmentOption[] = [];
    let selectedFulfillmentId: string | undefined;
    let fulfillmentCost = 0;
    let tax = 0;
    let status: 'not_ready_for_payment' | 'ready_for_payment' = 'not_ready_for_payment';

    if (fulfillment_address) {
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
      selectedFulfillmentId = 'free_shipping';
      fulfillmentCost = 0;

      // Calculate tax (no tax for now)
      tax = 0;

      status = 'ready_for_payment';
    }

    // Build totals
    const totals = buildTotals(itemsBaseAmount, fulfillmentCost, tax);

    // Build response
    console.log('[Checkout] Building response with:', {
      sessionId,
      status,
      fulfillmentOptionsCount: fulfillmentOptions.length,
      fulfillmentOptionId: selectedFulfillmentId,
    });

    const response: CheckoutSessionResponse = {
      id: sessionId,
      buyer,
      payment_provider: {
        provider: 'stripe',
        supported_payment_methods: ['card'],
      },
      status,
      currency: 'usd',
      line_items: lineItems,
      fulfillment_address,
      fulfillment_options: fulfillmentOptions, // Correct variable name
      fulfillment_option_id: selectedFulfillmentId,
      totals,
      messages: [],
      links: [
        {
          type: 'terms_of_use',
          value: 'https://one.ie/terms',
        },
        {
          type: 'privacy_policy',
          value: 'https://one.ie/privacy',
        },
      ],
    };

    console.log('[Checkout] Response built successfully');

    // Store session (TODO: Migrate to Convex)
    sessions.set(sessionId, {
      ...response,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Return response
    const idempotencyKey = request.headers.get('Idempotency-Key') || '';
    const requestId = request.headers.get('Request-Id') || '';

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'Request-Id': requestId,
      },
    });
  } catch (error) {
    console.error('Create checkout session error:', error);

    return new Response(
      JSON.stringify({
        type: 'invalid_request',
        code: 'processing_error',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Export sessions map for other endpoints to access
// TODO: Replace with Convex queries
export { sessions };
