/**
 * Free Tier Chat Component (OpenRouter)
 *
 * Access to all AI models through OpenRouter
 */

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageList } from '@/components/ai/basic/MessageList';
import { PromptInput } from '@/components/ai/basic/PromptInput';
import { Suggestions } from '@/components/ai/basic/Suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Code, Brain, Lightbulb, Zap, MessageSquare } from 'lucide-react';
import { PremiumFeaturesShowcase } from './PremiumFeaturesShowcase';

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

// Demo prompt suggestions showcasing AI capabilities
const PROMPT_SUGGESTIONS = [
  "Write a creative short story about a time traveler",
  "Create a React component for a todo list with TypeScript",
  "Explain how neural networks work in simple terms",
  "Generate 5 unique business ideas for sustainable products",
  "Help me debug this code: function add(a,b) { return a+b }",
  "Analyze the pros and cons of remote work vs office work",
  "Write a professional email requesting a project deadline extension",
  "Create a Python script to analyze CSV data",
];

export function FreeChatExample() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash-lite');
  const [chatStarted, setChatStarted] = useState(false);

  // Load API key and model from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      const savedModel = localStorage.getItem(MODEL_KEY);

      if (savedKey) {
        setApiKey(savedKey);
        setChatStarted(true); // Auto-start if key exists
      }
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);

  // Save to localStorage when key or model changes
  const handleStartChat = () => {
    if (apiKey && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, apiKey);
      localStorage.setItem(MODEL_KEY, selectedModel);
      setChatStarted(true);
    }
  };

  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MODEL_KEY);
    }
    setApiKey('');
    setChatStarted(false);
  };

  // Initialize chat hook - only when chat is started
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      apiKey: apiKey || '',
      model: selectedModel,
    },
  });

  console.log('useChat values:', { messages, input, handleInputChange: typeof handleInputChange, handleSubmit: typeof handleSubmit, isLoading, error });

  // Handle input changes - convert string to event for useChat
  const handleInputChangeWrapper = (value: string) => {
    const event = {
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(event);
  };

  // Handle form submission
  const handleFormSubmit = (message: string) => {
    if (!message.trim()) return;

    const event = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    handleSubmit(event);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChangeWrapper(suggestion);
    // Auto-submit after a brief delay
    setTimeout(() => {
      handleFormSubmit(suggestion);
    }, 100);
  };

  if (!chatStarted) {
    return (
      <div className="container max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Start Free Chat</CardTitle>
            <CardDescription>
              Enter your OpenRouter API key to access all AI models.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Security Notice */}
            <Alert>
              <AlertDescription className="text-xs">
                🔒 <strong>Security:</strong> Your API key is stored in your browser's localStorage
                (not on our servers). Only use this on trusted devices.
                <button onClick={handleClearKey} className="underline ml-1">Clear stored key</button>
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
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform messages to match MessageList format
  const formattedMessages = messages.map((msg, index) => ({
    id: msg.id || `msg-${index}`,
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }));

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Free Tier Chat</h1>
          <p className="text-sm text-muted-foreground">
            Model: {POPULAR_MODELS.find(m => m.id === selectedModel)?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setChatStarted(false)}>
            Change Model
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearKey}>
            Clear Key
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <strong>Error:</strong> {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <Card className="mb-4">
        <CardContent className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Start a Conversation</h3>
                <p className="text-muted-foreground max-w-md">
                  Try asking me anything! I can help with coding, writing, analysis, and creative tasks.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span>Code Generation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>Problem Solving</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span>Creative Writing</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span>Analysis & Insights</span>
                </div>
              </div>
            </div>
          ) : (
            <MessageList messages={formattedMessages} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>

      {/* Prompt Suggestions - Show when no messages */}
      {messages.length === 0 && !isLoading && (
        <div className="mb-4">
          <Suggestions
            suggestions={PROMPT_SUGGESTIONS}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      )}

      {/* Input */}
      <PromptInput
        value={input}
        onChange={handleInputChangeWrapper}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        placeholder="Type your message or choose a suggestion above..."
      />

      {/* Upgrade prompt */}
      {messages.length > 10 && (
        <div className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <div className="flex-1">
              <p className="font-semibold mb-1">💡 Upgrade to Premium</p>
              <p className="text-sm opacity-90">
                Your messages will be lost on page refresh.
                <a href="/upgrade" className="underline ml-1 font-medium">Enable persistence for $29/mo</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Messages are ephemeral (lost on refresh). Using OpenRouter with your API key.
      </div>

      {/* Premium Features Showcase */}
      <div className="mt-12">
        <PremiumFeaturesShowcase />
      </div>
    </div>
  );
}
