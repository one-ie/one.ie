/**
 * Premium Chat Client - Extended with Agent Features
 *
 * Extends SimpleChatClient with:
 * - Agent reasoning visualization
 * - Tool call display
 * - Extended message types (text, reasoning, tool_call, ui)
 * - Premium indicators
 */

import { useState, useEffect, useRef } from 'react';
import { MessageList } from '@/components/ai/MessageList';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai/elements/model-selector';
import { Suggestions } from '@/components/ai/Suggestions';
import { AgentMessage, type AgentUIMessage } from '@/components/ai/AgentMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, GlobeIcon, CheckIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChatStatus } from 'ai';

const POPULAR_MODELS = [
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai', 'azure'],
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai', 'azure'],
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
  },
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
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const selectedModelData = POPULAR_MODELS.find((m) => m.id === selectedModel);

  // Load API key and model from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      const savedModel = localStorage.getItem(MODEL_KEY);

      if (savedKey) {
        setApiKey(savedKey);
      }
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);

  // Save API key to localStorage
  const handleSaveApiKey = () => {
    if (apiKey && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, apiKey);
      localStorage.setItem(MODEL_KEY, selectedModel);
    }
  };

  // Clear stored key
  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MODEL_KEY);
    }
    setApiKey('');
    setMessages([]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit({ text: suggestion, files: [] } as any, new Event('submit') as any);
  };

  // Handle voice input
  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          stream.getTracks().forEach(track => track.stop());

          // Here you would normally send the audio to a speech-to-text API
          // For now, we'll just show a message
          toast({
            title: "Voice Recording",
            description: "Voice input recorded. Speech-to-text integration coming soon!",
          });
        };

        mediaRecorder.start();
        setIsRecording(true);

        toast({
          title: "Recording Started",
          description: "Speak now... Click the microphone again to stop.",
        });
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          title: "Microphone Error",
          description: "Could not access your microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle web search
  const handleWebSearch = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const currentText = textarea.value;
      if (currentText.trim()) {
        // Prepend "Search the web for: " to the query
        textarea.value = `Search the web for: ${currentText}`;
        toast({
          title: "Web Search",
          description: "Your query will include web search results.",
        });
      } else {
        toast({
          title: "Enter a query",
          description: "Please type what you want to search for.",
          variant: "destructive",
        });
      }
    }
  };

  // Submit message to API
  const handleSubmit = async (message: any, event?: React.FormEvent<HTMLFormElement>) => {
    const text = message?.text || '';
    const files = message?.files || [];

    if (!text.trim() || isLoading) return;

    const userMessage: ExtendedMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      type: 'text',
      timestamp: Date.now(),
    };

    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Check if this is a demo request (only trigger if "(demo)" is in the message)
    const messageLower = text.toLowerCase();
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
      // Convert files to data URLs if present
      let messageContent: any = text;

      if (files && files.length > 0) {
        const fileDataUrls = await Promise.all(
          files.map(file => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }))
        );

        messageContent = [
          { type: 'text', text },
          ...fileDataUrls.map(url => ({
            type: 'image',
            url
          }))
        ];
      }

      // Create the user message with multimodal content if needed
      const userMessageForAPI = {
        role: 'user',
        content: messageContent,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), userMessageForAPI],
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
          <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl px-4 py-2">
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
        <div className="max-w-[80%] bg-zinc-800 text-zinc-100 rounded-2xl px-4 py-2">
          {msg.content}
        </div>
      </div>
    );
  };


  // Show chat interface
  return (
    <div className="relative h-screen bg-zinc-950">
      <style>{`
        textarea:focus, input:focus, button:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
      {/* No header - clean layout */}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Chat Settings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription className="text-xs">
                  💡 Chat works for free with Gemini Flash Lite. Add your OpenRouter API key to unlock other models.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="api-key">OpenRouter API Key (Optional)</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-... (optional)"
                />
                <p className="text-xs text-muted-foreground">
                  Get a free key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter</a>
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

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveApiKey} className="flex-1">
                  Save Settings
                </Button>
                {apiKey && (
                  <Button variant="destructive" size="sm" onClick={handleClearKey}>
                    Clear Key
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

      {/* Messages Area - Scrollable with padding for fixed input */}
      <div className="h-full overflow-y-auto pb-[180px]">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
              {/* Prompt Suggestions - Show when no messages */}
              <div className="w-full max-w-2xl">
                <Suggestions
                  suggestions={PROMPT_SUGGESTIONS}
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map(msg => renderMessage(msg))}
              {isLoading && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Brain className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area - FIXED at bottom with dark background, 3x taller */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-zinc-950">
        <div className="w-full max-w-3xl mx-auto px-4 py-4">
          <div className="relative flex flex-col bg-[hsl(var(--color-sidebar))] rounded-2xl p-3 gap-3 focus-within:outline-none border border-zinc-700">
            {/* Text input area on top */}
            <textarea
              ref={textareaRef}
              placeholder="What would you like to know?"
              className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 outline-none ring-0 focus:outline-none focus:ring-0 text-base resize-none min-h-[80px] px-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleSubmit({ text: value, files: attachments } as any, e as any);
                    e.currentTarget.value = '';
                    setAttachments([]);
                  }
                }
              }}
            />

            {/* Show attached files if any */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-1 bg-zinc-700/50 rounded-lg px-2 py-1 text-xs text-zinc-300">
                    <span>{file.name}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Button row on bottom */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {/* Plus button for attachments */}
                <input
                  type="file"
                  id="file-input"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachments(prev => [...prev, ...files]);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-lg transition-all"
                  onClick={() => document.getElementById('file-input')?.click()}
                  title="Attach files"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Microphone button */}
                <button
                  type="button"
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-lg transition-all"
                  onClick={handleVoiceInput}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 1C8.89543 1 8 1.89543 8 3V10C8 11.1046 8.89543 12 10 12C11.1046 12 12 11.1046 12 10V3C12 1.89543 11.1046 1 10 1Z" stroke={isRecording ? "#ef4444" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={isRecording ? "#ef4444" : "none"}/>
                    <path d="M14 8V10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10V8" stroke={isRecording ? "#ef4444" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 14V18" stroke={isRecording ? "#ef4444" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 18H14" stroke={isRecording ? "#ef4444" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Search button with text */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-lg transition-all text-sm"
                  onClick={handleWebSearch}
                  title="Search the web"
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Model selector */}
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 text-zinc-300 hover:text-zinc-100 transition-colors bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full text-sm"
                    >
                      {selectedModelData?.name || 'GPT-4o'}
                    </button>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {['OpenAI', 'Anthropic', 'Google'].map((chef) => (
                        <ModelSelectorGroup heading={chef} key={chef}>
                          {POPULAR_MODELS.filter((m) => m.chef === chef).map((m) => (
                            <ModelSelectorItem
                              key={m.id}
                              onSelect={() => {
                                setSelectedModel(m.id);
                                setModelSelectorOpen(false);
                              }}
                              value={m.id}
                            >
                              <ModelSelectorLogo provider={m.chefSlug} />
                              <ModelSelectorName>{m.name}</ModelSelectorName>
                              <ModelSelectorLogoGroup>
                                {m.providers.map((provider) => (
                                  <ModelSelectorLogo key={provider} provider={provider} />
                                ))}
                              </ModelSelectorLogoGroup>
                              {selectedModel === m.id ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <div className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>

                {/* Submit button */}
                <button
                  type="button"
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => {
                    const textarea = textareaRef.current;
                    if (textarea && textarea.value.trim()) {
                      handleSubmit({ text: textarea.value, files: attachments } as any, new Event('submit') as any);
                      textarea.value = '';
                      setAttachments([]);
                    }
                  }}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 17L17 10L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 10H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
