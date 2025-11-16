/**
 * Product Chat API Endpoint
 *
 * Simple OpenRouter integration for product questions
 * No authentication required - uses free tier models
 */

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages, model = 'google/gemini-2.5-flash-lite' } = body;

    // Get OpenRouter API key from environment
    const apiKey = import.meta.env.OPENROUTER_API_KEY || import.meta.env.PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn('No OpenRouter API key found, using fallback response');
      return new Response(
        JSON.stringify({
          choices: [{
            message: {
              content: "I'm currently in demo mode. To enable AI responses, please add your OpenRouter API key to the .env file as OPENROUTER_API_KEY or PUBLIC_OPENROUTER_API_KEY."
            }
          }]
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://one.ie',
        'X-Title': 'ONE Platform Product Chat',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);

      return new Response(
        JSON.stringify({
          choices: [{
            message: {
              content: "I'm having trouble connecting to the AI service. Please try again in a moment."
            }
          }]
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Product chat API error:', error);

    return new Response(
      JSON.stringify({
        choices: [{
          message: {
            content: "Sorry, I encountered an error. Please try again."
          }
        }]
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
