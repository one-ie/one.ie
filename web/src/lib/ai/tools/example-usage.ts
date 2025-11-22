/**
 * Example Usage: AI Clone Tool Calling
 *
 * This file demonstrates how to use the clone tools in different scenarios.
 */

import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { cloneTools, toolNames } from './clone-tools';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Example 1: Simple Tool Call (Search Knowledge)
 *
 * User asks a question, LLM decides to search knowledge base.
 */
export async function exampleSearchKnowledge() {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'system',
        content: 'You are an AI clone. Use tools to answer questions about the creator\'s content.'
      },
      {
        role: 'user',
        content: 'What did I teach about React hooks?'
      }
    ],
    tools: {
      search_knowledge: cloneTools.search_knowledge,
    },
    maxSteps: 3,
  });

  console.log('Response:', result.text);
  console.log('Tool calls:', result.steps.map(s => s.toolCalls));
}

/**
 * Example 2: Multi-Step Tool Call (Check Calendar → Schedule Meeting)
 *
 * User wants to book a meeting. Clone checks availability first, then schedules.
 */
export async function exampleScheduleMeeting() {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'system',
        content: 'You are an AI clone. Help users schedule meetings with the creator. Always check calendar availability before scheduling.'
      },
      {
        role: 'user',
        content: 'Can I book a 30-minute call next Tuesday at 2pm?'
      }
    ],
    tools: {
      check_calendar: cloneTools.check_calendar,
      schedule_meeting: cloneTools.schedule_meeting,
    },
    maxSteps: 5, // Allow multiple steps
  });

  console.log('Response:', result.text);

  // Extract tool calls
  const toolCalls = result.steps.flatMap(s => s.toolCalls || []);
  console.log('Tools used:', toolCalls.map(t => t.toolName));
}

/**
 * Example 3: React Component with Tool Calling
 *
 * Shows how to integrate tool calling in a React chat component.
 */
export function ChatWithTools({ cloneId }: { cloneId: string }) {
  const executeToolCall = useMutation(api.mutations.cloneToolCalls.executeToolCall);

  const handleSubmit = async (message: string) => {
    // Generate response with tool calling
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      messages: [
        {
          role: 'system',
          content: 'You are an AI clone. Use tools to help users.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      tools: cloneTools,
      maxSteps: 5,

      // Execute tools via Convex mutation
      experimental_toolCallHook: async (toolCall) => {
        console.log(`Executing tool: ${toolCall.toolName}`);

        try {
          const result = await executeToolCall({
            cloneId,
            toolName: toolCall.toolName,
            args: toolCall.args,
          });

          return result.result;
        } catch (error) {
          console.error('Tool execution failed:', error);
          throw error;
        }
      },
    });

    return result.text;
  };

  // Rest of component...
  return null;
}

/**
 * Example 4: Streaming Response with Tool Calling
 *
 * Stream LLM response while executing tools in the background.
 */
export async function exampleStreamingWithTools(cloneId: string) {
  const executeToolCall = useMutation(api.mutations.cloneToolCalls.executeToolCall);

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'user',
        content: 'Recommend me a Python course for beginners under $50'
      }
    ],
    tools: {
      recommend_product: cloneTools.recommend_product,
    },
    maxSteps: 3,

    // Track progress
    onStepFinish: async (step) => {
      if (step.toolCalls) {
        for (const toolCall of step.toolCalls) {
          console.log(`Calling ${toolCall.toolName}...`);

          const result = await executeToolCall({
            cloneId,
            toolName: toolCall.toolName,
            args: toolCall.args,
          });

          console.log(`${toolCall.toolName} result:`, result.success);
        }
      }
    },
  });

  // Stream response to user
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}

/**
 * Example 5: Selective Tool Access
 *
 * Only allow certain tools based on clone configuration.
 */
export async function exampleSelectiveTools(
  cloneId: string,
  enabledTools: string[]
) {
  // Filter tools to only enabled ones
  const allowedTools = Object.fromEntries(
    Object.entries(cloneTools).filter(([name]) =>
      enabledTools.includes(name)
    )
  );

  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'system',
        content: `You are an AI clone. You have access to these tools: ${Object.keys(allowedTools).join(', ')}`
      },
      {
        role: 'user',
        content: 'Help me with my question'
      }
    ],
    tools: allowedTools,
    maxSteps: 3,
  });

  return result.text;
}

/**
 * Example 6: Error Handling
 *
 * Gracefully handle tool failures and rate limits.
 */
export async function exampleErrorHandling(cloneId: string) {
  const executeToolCall = useMutation(api.mutations.cloneToolCalls.executeToolCall);

  try {
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      messages: [
        { role: 'user', content: 'Send an email to user@example.com' }
      ],
      tools: {
        send_email: cloneTools.send_email,
      },

      experimental_toolCallHook: async (toolCall) => {
        try {
          const result = await executeToolCall({
            cloneId,
            toolName: toolCall.toolName,
            args: toolCall.args,
          });

          if (!result.success) {
            // Tool execution failed
            return {
              error: result.errorMessage || 'Tool execution failed',
            };
          }

          return result.result;
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes('Rate limit exceeded')) {
              return {
                error: 'Rate limit exceeded. Please try again later.',
              };
            }

            if (error.message.includes('not enabled')) {
              return {
                error: 'This tool is not enabled for this clone.',
              };
            }
          }

          throw error;
        }
      },
    });

    return result.text;
  } catch (error) {
    console.error('Conversation failed:', error);
    return 'I apologize, but I encountered an error. Please try again.';
  }
}

/**
 * Example 7: Tool Usage Analytics
 *
 * Track which tools are being used most frequently.
 */
export async function exampleToolAnalytics(cloneId: string) {
  const getToolUsageHistory = useMutation(
    api.mutations.cloneToolCalls.getToolUsageHistory
  );

  // Get last 100 tool calls
  const history = await getToolUsageHistory({
    cloneId,
    limit: 100,
  });

  // Analyze tool usage
  const analytics = {
    totalCalls: history.length,
    successRate: (history.filter(h => h.success).length / history.length) * 100,
    toolBreakdown: toolNames.map(toolName => ({
      tool: toolName,
      calls: history.filter(h => h.toolName === toolName).length,
      successRate: (
        history.filter(h => h.toolName === toolName && h.success).length /
        Math.max(1, history.filter(h => h.toolName === toolName).length)
      ) * 100,
    })),
    mostUsedTool: '',
    leastUsedTool: '',
  };

  // Find most/least used
  const sorted = analytics.toolBreakdown.sort((a, b) => b.calls - a.calls);
  analytics.mostUsedTool = sorted[0]?.tool || 'none';
  analytics.leastUsedTool = sorted[sorted.length - 1]?.tool || 'none';

  return analytics;
}

/**
 * Example 8: Approval Workflow
 *
 * Handle tools that require creator approval.
 */
export async function exampleApprovalWorkflow(cloneId: string) {
  const executeToolCall = useMutation(api.mutations.cloneToolCalls.executeToolCall);

  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'user',
        content: 'Send an email to all my students about the upcoming course'
      }
    ],
    tools: {
      send_email: cloneTools.send_email,
    },

    experimental_toolCallHook: async (toolCall) => {
      const result = await executeToolCall({
        cloneId,
        toolName: toolCall.toolName,
        args: toolCall.args,
      });

      if (result.result?.status === 'pending_approval') {
        // Email requires approval
        return {
          status: 'pending_approval',
          message: 'This email has been submitted for creator approval. You\'ll receive a notification once it\'s reviewed.',
        };
      }

      return result.result;
    },
  });

  return result.text;
}

/**
 * Example 9: Rate Limit Handling
 *
 * Gracefully handle rate limits with retry logic.
 */
export async function exampleRateLimitRetry(
  cloneId: string,
  maxRetries = 3
) {
  const executeToolCall = useMutation(api.mutations.cloneToolCalls.executeToolCall);

  const executeWithRetry = async (toolName: string, args: any, attempt = 1): Promise<any> => {
    try {
      const result = await executeToolCall({ cloneId, toolName, args });

      if (!result.success && result.errorMessage?.includes('Rate limit')) {
        if (attempt < maxRetries) {
          // Wait exponentially before retry
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));

          return executeWithRetry(toolName, args, attempt + 1);
        }

        throw new Error('Rate limit exceeded. Please try again later.');
      }

      return result.result;
    } catch (error) {
      if (attempt < maxRetries && error instanceof Error && error.message.includes('Rate limit')) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(toolName, args, attempt + 1);
      }

      throw error;
    }
  };

  // Use in tool calling
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [
      { role: 'user', content: 'Search for information about AI' }
    ],
    tools: cloneTools,

    experimental_toolCallHook: async (toolCall) => {
      return executeWithRetry(toolCall.toolName, toolCall.args);
    },
  });

  return result.text;
}

/**
 * Example 10: Custom Tool Configuration per Clone
 *
 * Load tool configuration from clone properties and apply it.
 */
export async function exampleCustomToolConfig(clone: any) {
  // Extract tool configuration from clone properties
  const toolConfig = clone.properties?.tools || {};

  // Build allowed tools list
  const enabledTools = Object.entries(toolConfig)
    .filter(([_, config]: [string, any]) => config.enabled)
    .map(([toolName]) => toolName);

  // Filter to only enabled tools
  const allowedTools = Object.fromEntries(
    Object.entries(cloneTools).filter(([name]) =>
      enabledTools.includes(name)
    )
  );

  console.log('Enabled tools:', Object.keys(allowedTools));

  // Use in conversation
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    messages: [
      {
        role: 'system',
        content: `You are ${clone.name}. You have access to these tools: ${Object.keys(allowedTools).join(', ')}. Use them to help users.`
      },
      {
        role: 'user',
        content: 'Help me with my question'
      }
    ],
    tools: allowedTools,
    maxSteps: 5,
  });

  return result.text;
}
