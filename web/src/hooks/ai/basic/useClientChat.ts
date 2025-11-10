/**
 * Client-Side AI Chat Hook (FREE TIER)
 *
 * Direct browser → AI provider communication
 * - No persistence (messages lost on refresh)
 * - User provides their own API key
 * - No backend required
 */

import { useChat } from 'ai/react';

export interface UseClientChatOptions {
  apiKey: string;
  model?: string;
  initialMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function useClientChat(options: UseClientChatOptions) {
  const { apiKey, model = 'gpt-4', initialMessages = [] } = options;

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: {
      model,
    },
    initialMessages,
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    // Free tier limitations
    isPersistent: false,
    canInviteHumans: false,
    hasAnalytics: false,
  };
}
