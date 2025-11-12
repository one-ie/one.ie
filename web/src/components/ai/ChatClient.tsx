/**
 * Premium Chat Client - Extended with Agent Features
 *
 * Extends SimpleChatClient with:
 * - Agent reasoning visualization
 * - Tool call display
 * - Extended message types (text, reasoning, tool_call, ui)
 * - Premium indicators
 */

import { useState, useEffect } from 'react';
import { MessageList } from '@/components/ai/MessageList';
import { PromptInput } from '@/components/ai/PromptInput';
import { Suggestions } from '@/components/ai/Suggestions';
import { AgentMessage, type AgentUIMessage } from '@/components/ai/AgentMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Code, Brain, Lightbulb, MessageSquare, Zap } from 'lucide-react';

const POPULAR_MODELS = [
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Google) - Fast & Free' },
  { id: 'openai/gpt-4', name: 'GPT-4 (OpenAI)' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (Anthropic)' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet (Anthropic)' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B (Meta)' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5 (Google)' },
];

const STORAGE_KEY = 'openrouter-api-key';
const MODEL_KEY = 'openrouter-model';

// Premium demo prompt suggestions showcasing advanced features
const PROMPT_SUGGESTIONS = [
  "🧠 Show me agent reasoning (demo)",
  "🔧 Demonstrate tool calls (demo)",
  "📊 Generate a sales chart (demo)",
  "📋 Create a data table (demo)",
  "📝 Build a contact form (demo)",
  "⏱️ Show project timeline (demo)",
  "Create a React component for a todo list with TypeScript",
  "Analyze sales data and show insights with charts",
];

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Extended message type for premium features
interface ExtendedMessage extends Message {
  type?: 'text' | 'reasoning' | 'tool_call' | 'ui';
  payload?: any;
  timestamp?: number;
}

// Mock premium responses for demo
const DEMO_RESPONSES: Record<string, ExtendedMessage[]> = {
  'agent reasoning': [
    {
      id: 'demo-reasoning',
      role: 'assistant',
      content: '',
      type: 'reasoning',
      payload: {
        steps: [
          { step: 1, title: "Analyzing request", description: "Understanding what the user wants to see", completed: true },
          { step: 2, title: "Preparing demonstration", description: "Setting up agent reasoning visualization", completed: true },
          { step: 3, title: "Generating response", description: "Creating structured output with reasoning steps", completed: true }
        ]
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'This is an example of agent reasoning! The steps above show how an AI agent thinks through a problem step-by-step. In a real implementation, these would be generated dynamically as the agent processes your request.',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'tool calls': [
    {
      id: 'demo-tool-1',
      role: 'assistant',
      content: '',
      type: 'tool_call',
      payload: {
        name: 'search_database',
        args: { query: 'recent sales data', limit: 10 },
        result: { count: 5, items: ['Item 1', 'Item 2', 'Item 3'] },
        status: 'completed'
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-tool-2',
      role: 'assistant',
      content: '',
      type: 'tool_call',
      payload: {
        name: 'calculate_metrics',
        args: { metric: 'revenue', period: 'last_month' },
        result: { revenue: 125000, growth: 15.5 },
        status: 'completed'
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'These tool calls show how an AI agent can execute functions and display the arguments and results. Click the chevron to expand and see the details!',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'sales chart': [
    {
      id: 'demo-chart',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'chart',
        data: {
          title: 'Monthly Sales Growth',
          chartType: 'line',
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            { label: 'Revenue', data: [12000, 15000, 18000, 22000, 25000, 30000], color: '#3b82f6' },
            { label: 'Profit', data: [3000, 4500, 5400, 7700, 9000, 12000], color: '#10b981' }
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'Here\'s a dynamic chart showing sales growth! The AI can generate interactive visualizations to help you understand data better.',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'data table': [
    {
      id: 'demo-table',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'table',
        data: {
          title: 'Top Customers',
          headers: ['Customer', 'Orders', 'Revenue', 'Status'],
          rows: [
            ['Acme Corp', '45', '$125,000', 'Active'],
            ['TechStart Inc', '32', '$98,500', 'Active'],
            ['Global Solutions', '28', '$76,200', 'Pending'],
            ['Innovation Labs', '19', '$54,800', 'Active']
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'This table displays structured data in an easy-to-read format. Perfect for showing analysis results!',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'contact form': [
    {
      id: 'demo-form',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'form',
        data: {
          title: 'Contact Us',
          fields: [
            { label: 'Name', type: 'text', name: 'name', required: true },
            { label: 'Email', type: 'email', name: 'email', required: true },
            { label: 'Phone', type: 'tel', name: 'phone', required: false },
            { label: 'Message', type: 'text', name: 'message', required: true }
          ],
          submitLabel: 'Send Message'
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'The AI can generate dynamic forms based on your requirements. This makes it easy to collect structured data from users!',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'timeline': [
    {
      id: 'demo-timeline',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'timeline',
        data: {
          title: 'Project Milestones',
          events: [
            { title: 'Project kickoff', timestamp: '2025-01-01' },
            { title: 'Design phase completed', timestamp: '2025-01-15' },
            { title: 'Development started', timestamp: '2025-02-01' },
            { title: 'Beta testing', timestamp: '2025-03-01' },
            { title: 'Launch date', timestamp: '2025-04-01' }
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'Timelines help visualize events and milestones chronologically. Great for project planning and status updates!',
      type: 'text',
      timestamp: Date.now(),
    }
  ]
};

export function ChatClient() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash-lite');
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API key and model from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      const savedModel = localStorage.getItem(MODEL_KEY);

      if (savedKey) {
        setApiKey(savedKey);
        setChatStarted(true);
      }
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);

  // Save to localStorage when starting chat
  const handleStartChat = () => {
    if (apiKey && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, apiKey);
      localStorage.setItem(MODEL_KEY, selectedModel);
      setChatStarted(true);
    }
  };

  // Clear stored key
  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MODEL_KEY);
    }
    setApiKey('');
    setChatStarted(false);
    setMessages([]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion);
  };

  // Submit message to API
  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ExtendedMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      type: 'text',
      timestamp: Date.now(),
    };

    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Check if this is a demo request (only trigger if "(demo)" is in the message)
    const messageLower = message.toLowerCase();
    let demoKey: string | null = null;

    if (messageLower.includes('(demo)')) {
      for (const key of Object.keys(DEMO_RESPONSES)) {
        if (messageLower.includes(key)) {
          demoKey = key;
          break;
        }
      }
    }

    // If demo request, return mock responses
    if (demoKey && DEMO_RESPONSES[demoKey]) {
      try {
        // Simulate typing delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));

        // Add all demo messages
        setMessages(prev => [...prev, ...DEMO_RESPONSES[demoKey]]);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Demo error:', err);
        setError('Failed to show demo');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey,
          model: selectedModel,
          premium: true, // Request premium features
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMessage: ExtendedMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        type: 'text',
        timestamp: Date.now(),
      };

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming response
      let receivedUIComponent = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete. Full assistant content:', assistantContent);

          // Client-side fallback: detect charts in content if server didn't send them
          const chartMatches = assistantContent.match(/```ui-chart\s*\n([\s\S]*?)\n```/g);
          if (!receivedUIComponent && chartMatches) {
            console.log(`Found ${chartMatches.length} charts in content, but not received as UI components`);
            console.log('This means server-side detection failed');

            const newChartMessages: ExtendedMessage[] = [];

            for (const match of chartMatches) {
              const chartJson = match
                .replace(/^```ui-chart\s*\n?/, '')
                .replace(/\n```$/, '')
                .trim();

              try {
                const chartData = JSON.parse(chartJson);
                newChartMessages.push({
                  id: `chart-${crypto.randomUUID()}`,
                  role: 'assistant',
                  content: '',
                  type: 'ui',
                  payload: { component: 'chart', data: chartData },
                  timestamp: Date.now(),
                });
              } catch (parseError) {
                console.error('Failed to parse chart JSON from fallback detection', parseError);
              }
            }

            if (newChartMessages.length) {
              const chartBlockRegex = /```ui-chart\s*\n([\s\S]*?)\n```/g;
              assistantContent = assistantContent.replace(chartBlockRegex, '').trim();

              setMessages(prev => {
                const cleaned = prev.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: assistantContent }
                    : msg
                );

                return [...cleaned, ...newChartMessages];
              });
            }
          }

          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Debug logging
              if (parsed.type) {
                console.log('Received UI component:', parsed.type, parsed.payload);
              }

              // Handle extended message types
              if (parsed.type) {
                receivedUIComponent = true;
                // Agent message with special type (reasoning, tool_call, etc.)
                // Use crypto.randomUUID() for truly unique IDs
                const agentMessage: ExtendedMessage = {
                  id: `agent-${crypto.randomUUID()}`,
                  role: 'assistant',
                  content: '',
                  type: parsed.type,
                  payload: parsed.payload,
                  timestamp: Date.now(),
                };

                setMessages(prev => [...prev, agentMessage]);
              } else if (parsed.choices?.[0]?.delta?.content) {
                // Standard text content
                assistantContent += parsed.choices[0].delta.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Some chunks might not be valid JSON, that's okay
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the user message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Render extended message types
  const renderMessage = (msg: ExtendedMessage) => {
    if (msg.role === 'user') {
      // Standard user message
      return (
        <div key={msg.id} className="flex justify-end mb-4">
          <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
            {msg.content}
          </div>
        </div>
      );
    }

    // Assistant message - check for extended types
    if (msg.type && msg.type !== 'text') {
      const agentMessage: AgentUIMessage = {
        type: msg.type as any,
        payload: msg.payload,
        timestamp: msg.timestamp || Date.now(),
      };

      return (
        <div key={msg.id} className="mb-4">
          <AgentMessage message={agentMessage} />
        </div>
      );
    }

    // Standard assistant text message
    return (
      <div key={msg.id} className="flex justify-start mb-4">
        <div className="max-w-[80%] bg-muted rounded-lg px-4 py-2">
          {msg.content}
        </div>
      </div>
    );
  };

  // Show API key setup form
  if (!chatStarted) {
    return (
      <div className="container max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Start Premium Chat</CardTitle>
              <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600">
                <Zap className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
            <CardDescription>
              Access advanced AI features: reasoning visualization, tool calls, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Premium Features */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
              <div className="text-xs">
                <Brain className="h-4 w-4 mb-1 text-blue-500" />
                <span className="font-medium">Agent Reasoning</span>
              </div>
              <div className="text-xs">
                <Code className="h-4 w-4 mb-1 text-purple-500" />
                <span className="font-medium">Tool Calls</span>
              </div>
              <div className="text-xs">
                <Sparkles className="h-4 w-4 mb-1 text-green-500" />
                <span className="font-medium">Generative UI</span>
              </div>
              <div className="text-xs">
                <MessageSquare className="h-4 w-4 mb-1 text-orange-500" />
                <span className="font-medium">Thread Persistence</span>
              </div>
            </div>

            {/* Security Notice */}
            <Alert>
              <AlertDescription className="text-xs">
                🔒 <strong>Security:</strong> Your API key is stored in your browser's localStorage
                (not on our servers). Only use this on trusted devices.
                {apiKey && (
                  <button onClick={handleClearKey} className="underline ml-1">
                    Clear stored key
                  </button>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="api-key">OpenRouter API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                placeholder="sk-or-v1-..."
              />
              <p className="text-xs text-muted-foreground">
                Get your key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter</a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleStartChat} disabled={!apiKey} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Start Premium Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show chat interface
  return (
    <div className="flex flex-col h-screen">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 border-b px-6 py-4 bg-background">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">AI Chat</h1>
                <Badge variant="default" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {POPULAR_MODELS.find(m => m.id === selectedModel)?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setChatStarted(false)}>
              Change Model
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearKey}>
              Clear Key
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 px-6 py-2 bg-destructive/10">
          <div className="container max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-12">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Start a Premium Conversation</h3>
                <p className="text-muted-foreground max-w-md">
                  Experience advanced AI with reasoning visualization, tool calls, and generative UI.
                </p>
              </div>

              {/* Premium feature highlights */}
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3 rounded-lg">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span>Agent Reasoning</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-3 rounded-lg">
                  <Code className="h-4 w-4 text-purple-500" />
                  <span>Tool Calls</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-3 rounded-lg">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  <span>Generative UI</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-3 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-orange-500" />
                  <span>Thread Persistence</span>
                </div>
              </div>

              {/* Prompt Suggestions - Show when no messages */}
              <div className="w-full max-w-2xl pt-4">
                <Suggestions
                  suggestions={PROMPT_SUGGESTIONS}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => renderMessage(msg))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Brain className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Agent thinking...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 border-t bg-background">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          <PromptInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder={messages.length === 0 ? "Ask me anything with premium features..." : "Type your message..."}
          />
          {messages.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Premium Chat with reasoning, tool calls, and advanced features
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
