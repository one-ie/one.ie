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
import { getProductById } from '@/lib/data/products-multi-category';
import {
  calculateTax,
  calculateShipping,
  getDeliveryEstimate,
} from '@/lib/stripe/agentic-commerce';

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

    const priceInCents = Math.round(product.price * 100);
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
      // Get items for shipping calculation
      const itemsForShipping = lineItems.map((li: LineItem) => ({
        id: li.item.id,
        quantity: li.item.quantity,
      }));

      const shippingCosts = calculateShipping(itemsForShipping, {
        country: currentAddress.country,
        state: currentAddress.state,
        postal_code: currentAddress.postal_code,
      });

      const standardEstimate = getDeliveryEstimate('standard');
      const expressEstimate = getDeliveryEstimate('express');

      fulfillmentOptions = [
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

      // Get selected fulfillment cost
      const selectedOption = fulfillmentOptions.find(
        (opt) => opt.id === selectedFulfillmentId
      );
      fulfillmentCost = selectedOption?.total || fulfillmentOptions[0].total;
      if (!selectedFulfillmentId) {
        selectedFulfillmentId = fulfillmentOptions[0].id;
      }
    }

    // Calculate tax
    let tax = 0;
    if (currentAddress) {
      tax = calculateTax(itemsBaseAmount, fulfillmentCost, currentAddress.state);

      // Update line items with proportional tax
      lineItems = lineItems.map((li: LineItem) => {
        const itemTax = Math.round((tax * li.subtotal) / itemsBaseAmount);
        return {
          ...li,
          tax: itemTax,
          total: li.subtotal + itemTax,
        };
      });
    }

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
      fulfillment_options,
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
