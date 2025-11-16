/**
 * POST /api/checkout_sessions/[id]/cancel
 *
 * Cancel a checkout session
 *
 * Per ACP spec:
 * - Can only cancel if status is NOT completed or canceled
 * - Return 405 if already completed/canceled
 */

import type { APIRoute } from 'astro';
import type {
  CheckoutSessionResponse,
  ErrorResponse,
} from '@/lib/types/agentic-checkout';
import { sessions } from '../../checkout_sessions';

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

    // Check if already completed or canceled
    if (existingSession.status === 'completed' || existingSession.status === 'canceled') {
      // Per ACP spec: return 405 Method Not Allowed
      return new Response(
        JSON.stringify({
          type: 'invalid_request',
          code: 'invalid',
          message: `Cannot cancel ${existingSession.status} session`,
        } as ErrorResponse),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cancel the session
    const canceledSession: CheckoutSessionResponse = {
      ...existingSession,
      status: 'canceled',
    };

    // Update session in store
    sessions.set(sessionId, {
      ...canceledSession,
      created_at: existingSession.created_at,
      updated_at: Date.now(),
    });

    // Remove internal fields for response
    const { created_at, updated_at, ...response } = canceledSession;

    // Return response
    const idempotencyKey = request.headers.get('Idempotency-Key') || '';
    const requestId = request.headers.get('Request-Id') || '';

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'Request-Id': requestId,
      },
    });
  } catch (error) {
    console.error('Cancel checkout session error:', error);

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
