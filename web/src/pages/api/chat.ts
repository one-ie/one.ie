import type { APIRoute } from 'astro';

const SYSTEM_PROMPT = `You are a helpful AI assistant with the ability to generate interactive visualizations.

When users ask to see data, charts, tables, or visualizations, you can generate them using this format:

**For CHARTS** - Wrap JSON in \`\`\`ui-chart:\n{your json}\n\`\`\`

Example:
\`\`\`ui-chart
{
  "title": "Sales Growth",
  "chartType": "line",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "datasets": [
    { "label": "Revenue", "data": [12000, 15000, 18000, 22000, 25000, 30000], "color": "#3b82f6" },
    { "label": "Profit", "data": [3000, 4500, 5400, 7700, 9000, 12000], "color": "#10b981" }
  ]
}
\`\`\`

**For TABLES** - Wrap JSON in \`\`\`ui-table:\n{your json}\n\`\`\`

Example:
\`\`\`ui-table
{
  "title": "Product List",
  "columns": ["Product", "Price", "Stock"],
  "rows": [
    ["Widget A", "$19.99", "50"],
    ["Gadget B", "$29.99", "30"]
  ]
}
\`\`\`

**For BUTTONS** - Wrap JSON in \`\`\`ui-button:\n{your json}\n\`\`\`

Example:
\`\`\`ui-button
{
  "label": "Click Me!",
  "variant": "default",
  "size": "default",
  "action": "alert('Hello from the button!')"
}
\`\`\`

Variants: "default", "destructive", "outline", "secondary", "ghost", "link"
Sizes: "default", "sm", "lg", "icon"

**For CARDS** - Wrap JSON in \`\`\`ui-card:\n{your json}\n\`\`\`

Example:
\`\`\`ui-card
{
  "title": "Feature Card",
  "description": "This is a cool feature",
  "icon": "rocket",
  "content": "Here's some detailed information about the feature."
}
\`\`\`

When a user asks to "show a button", "create a card", "display a table", etc., respond with:
1. A friendly text explanation
2. The appropriate UI code block with realistic data

Be creative and generate relevant data based on the user's request!`;

/**
 * Free Tier API Endpoint (OpenRouter)
 *
 * Client sends their own OpenRouter API key
 * Access to all models: GPT-4, Claude, Llama, etc.
 * Enhanced with chart/table generation capabilities
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { messages, apiKey, model = 'openai/gpt-4', premium } = await request.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenRouter API key required for free tier' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add system prompt for chart generation if premium mode
    const messagesWithSystem = premium
      ? [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
      : messages;

    // Log the request for debugging
    console.log('OpenRouter request:', {
      model,
      messageCount: messagesWithSystem.length,
      premium,
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
        messages: messagesWithSystem,
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

    // Parse streaming response for UI components
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let fullContent = '';

        try {
          console.log('[CHAT API] Stream started');

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('[CHAT API] Stream done naturally (after [DONE] was sent)');
              // Stream already closed by [DONE] handler
              controller.close();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });

            // Extract content from SSE format
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue; // Don't forward [DONE] yet

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullContent += content;
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }

            // Check if this chunk contains [DONE]
            if (chunk.includes('data: [DONE]')) {
              console.log('[CHAT API] Detected [DONE] in chunk, processing UI components now');

              // Send UI messages BEFORE [DONE]
              // Check for UI components in the complete response
              const chartMatches = [...fullContent.matchAll(/```ui-chart\s*\n([\s\S]*?)\n```/g)];
              console.log('[CHAT API] Found', chartMatches.length, 'charts in content');

              for (const match of chartMatches) {
                try {
                  const chartData = JSON.parse(match[1]);
                  const uiMessage = {
                    type: 'ui',
                    payload: {
                      component: 'chart',
                      data: chartData
                    }
                  };
                  console.log('[CHAT API] Sending chart UI message');
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(uiMessage)}\n\n`));
                } catch (e) {
                  console.error('[CHAT API] Failed to parse chart JSON:', e);
                }
              }

              // Now forward the chunk with [DONE]
              controller.enqueue(encoder.encode(chunk));
            } else {
              // Forward chunk as-is
              controller.enqueue(encoder.encode(chunk));
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.close();
        }
      },
    });

    return new Response(stream, {
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
