import type { APIRoute } from 'astro';

/**
 * Free Tier API Endpoint (OpenRouter)
 *
 * Client sends their own OpenRouter API key
 * Access to all models: GPT-4, Claude, Llama, etc.
 * No persistence, no analytics
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages, apiKey, model = 'openai/gpt-4' } = await request.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key required for free tier' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log the request for debugging
    console.log('OpenRouter request:', {
      model,
      messageCount: messages.length,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey.substring(0, 10) + '...'
    });

    // Call OpenRouter API directly
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4321', // Optional: for OpenRouter analytics
        'X-Title': 'ONE Platform Chat' // Optional: shows in OpenRouter dashboard
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      // Parse error message if possible
      let errorMessage = `OpenRouter API error: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch (e) {
        // If not JSON, use the text directly
        if (errorText) errorMessage = errorText;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forward the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Free tier chat error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
