/**
 * Commerce Session API
 *
 * Creates and manages conversation sessions
 */

import type { APIRoute } from 'astro';
import type { ConversationSession } from '@/lib/types/commerce';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { platform = 'web', category } = body;

    // Create new session
    const session: ConversationSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: null, // Will be set on first purchase
      platform,
      messages: [],
      inferredNeeds: {},
      suggestedProducts: [],
      productsViewed: [],
      productsAddedToCart: [],
      ordersCompleted: [],
      totalValue: 0,
      status: 'active',
      startedAt: Date.now(),
    };

    // In production, this would save to Convex database
    // For now, return the session
    return new Response(
      JSON.stringify({
        success: true,
        session,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Session creation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create session',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Session ID required',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // In production, fetch from Convex database
  // For now, return mock session
  return new Response(
    JSON.stringify({
      success: true,
      session: null, // Would be actual session data
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
