import type { APIRoute } from 'astro';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

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
        { status: 400 }
      );
    }

    // Create OpenRouter client (compatible with OpenAI SDK)
    const openrouter = createOpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // Stream response from OpenRouter
    const result = await streamText({
      model: openrouter(model),
      messages,
    });

    // Return streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Free tier chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process chat'
      }),
      { status: 500 }
    );
  }
};
