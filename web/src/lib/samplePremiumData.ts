/**
 * Sample Premium Chat Data
 *
 * Test data for premium features:
 * - Reasoning steps
 * - Tool calls
 * - Agent messages
 */

import type { AgentUIMessage } from '@/components/ai/premium/AgentMessage';
import type { ReasoningStep } from '@/components/ai/premium/Reasoning';
import type { ToolCallProps } from '@/components/ai/premium/ToolCall';

// Sample reasoning steps
export const sampleReasoning: ReasoningStep[] = [
  {
    step: 1,
    title: "Analyzing request",
    description: "Understanding user's question and context",
    completed: true,
  },
  {
    step: 2,
    title: "Searching knowledge base",
    description: "Querying relevant documentation and examples",
    completed: true,
  },
  {
    step: 3,
    title: "Formulating response",
    description: "Crafting a comprehensive answer with code examples",
    completed: false,
  },
];

// Sample tool calls
export const sampleToolCalls: ToolCallProps[] = [
  {
    name: "search_database",
    args: {
      query: "React hooks examples",
      limit: 10,
      filters: {
        category: "frontend",
        language: "typescript",
      },
    },
    result: {
      count: 5,
      items: [
        { id: 1, title: "useState Hook" },
        { id: 2, title: "useEffect Hook" },
        { id: 3, title: "useContext Hook" },
        { id: 4, title: "useReducer Hook" },
        { id: 5, title: "Custom Hooks" },
      ],
    },
    status: "completed",
  },
  {
    name: "generate_code",
    args: {
      language: "typescript",
      framework: "react",
      description: "Create a custom hook for API calls",
    },
    result: {
      code: `import { useState, useEffect } from 'react';\n\nexport function useAPI<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(true);\n  \n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then(data => {\n        setData(data);\n        setLoading(false);\n      });\n  }, [url]);\n  \n  return { data, loading };\n}`,
      language: "typescript",
    },
    status: "completed",
  },
  {
    name: "validate_code",
    args: {
      code: "function add(a, b) { return a + b; }",
      language: "javascript",
    },
    status: "running",
  },
];

// Sample agent messages
export const sampleAgentMessages: AgentUIMessage[] = [
  {
    type: "text",
    payload: {
      text: "I'll help you create a React component. Let me analyze your requirements first.",
    },
    timestamp: Date.now() - 10000,
  },
  {
    type: "reasoning",
    payload: {
      steps: sampleReasoning,
    },
    timestamp: Date.now() - 8000,
  },
  {
    type: "tool_call",
    payload: sampleToolCalls[0],
    timestamp: Date.now() - 6000,
  },
  {
    type: "tool_call",
    payload: sampleToolCalls[1],
    timestamp: Date.now() - 4000,
  },
  {
    type: "text",
    payload: {
      text: "Based on my analysis and the code I generated, here's a custom React hook for API calls. This follows best practices with TypeScript and proper error handling.",
    },
    timestamp: Date.now() - 2000,
  },
];

// Helper to create test messages with different types
export function createTestMessage(type: AgentUIMessage['type'], payload?: any): AgentUIMessage {
  switch (type) {
    case 'reasoning':
      return {
        type: 'reasoning',
        payload: { steps: payload || sampleReasoning },
        timestamp: Date.now(),
      };

    case 'tool_call':
      return {
        type: 'tool_call',
        payload: payload || sampleToolCalls[0],
        timestamp: Date.now(),
      };

    case 'text':
    default:
      return {
        type: 'text',
        payload: { text: payload || 'Sample message' },
        timestamp: Date.now(),
      };
  }
}

// Export for testing in console
export const premiumTestData = {
  reasoning: sampleReasoning,
  toolCalls: sampleToolCalls,
  messages: sampleAgentMessages,
  createTestMessage,
};
