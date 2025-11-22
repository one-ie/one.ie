/**
 * Embed Widget Analytics API
 *
 * Tracks usage of embedded AI clone widgets for monetization.
 *
 * Events tracked:
 * - widget_loaded: Widget loaded on external site
 * - widget_opened: User opened chat interface
 * - widget_minimized: User minimized chat
 * - widget_closed: User closed chat
 * - conversation_started: First message sent in session
 * - message_sent: User sent a message
 * - message_received: AI clone responded
 * - widget_unloaded: User left page with widget
 *
 * Ontology Mapping:
 * - Logs events table (type: 'communication_event', metadata.protocol: 'embed')
 * - Tracks userUsage table (aiTokensUsed, apiCallsCount)
 * - Updates groupUsage table (api_calls_today, ai_tokens_used)
 * - Creates connections (external_connection for tracking installations)
 *
 * Monetization:
 * - Track conversations per clone
 * - Track messages per conversation
 * - Track unique users per day
 * - Track engagement metrics (avg session duration, response time)
 * - Bill per conversation or monthly subscription
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      event,
      cloneId,
      sessionId,
      referrer,
      metadata = {},
      timestamp,
    } = body;

    // Validate required fields
    if (!event || !cloneId || !sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: event, cloneId, sessionId',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // TODO: Log event to Convex events table
    // await convex.mutation(api.mutations.events.logEvent, {
    //   type: 'communication_event',
    //   actorId: sessionId, // Use sessionId as temporary actor
    //   targetId: cloneId,
    //   groupId: clone.groupId, // Get from clone metadata
    //   metadata: {
    //     protocol: 'embed',
    //     eventType: event,
    //     referrer,
    //     sessionId,
    //     ...metadata,
    //   },
    // });

    // TODO: Update usage tracking for monetization
    // if (['conversation_started', 'message_sent'].includes(event)) {
    //   await convex.mutation(api.mutations.usage.trackEmbedUsage, {
    //     cloneId,
    //     event,
    //     sessionId,
    //     timestamp,
    //   });
    // }

    // For now, just log to console
    console.log('[Embed Analytics]', {
      event,
      cloneId,
      sessionId,
      referrer,
      timestamp: new Date(timestamp).toISOString(),
      metadata,
    });

    return new Response(
      JSON.stringify({
        success: true,
        event,
        timestamp,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('[Embed Analytics] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Handle CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Also support GET for simple tracking pixels
export const GET: APIRoute = async ({ url }) => {
  const cloneId = url.searchParams.get('cloneId');
  const event = url.searchParams.get('event') || 'widget_loaded';
  const sessionId = url.searchParams.get('sessionId') || 'unknown';
  const referrer = url.searchParams.get('referrer') || 'direct';

  if (!cloneId) {
    return new Response('Missing cloneId', { status: 400 });
  }

  console.log('[Embed Analytics] GET', {
    event,
    cloneId,
    sessionId,
    referrer,
  });

  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  return new Response(pixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
