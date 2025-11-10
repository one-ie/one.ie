/**
 * Simple Chat Client - OpenRouter Integration
 *
 * Manages state locally and calls API directly
 * Stores API key in localStorage (client-side only)
 */

import { useState, useEffect } from 'react';
import { MessageList } from '@/components/ai/basic/MessageList';
import { PromptInput } from '@/components/ai/basic/PromptInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function SimpleChatClient() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash-lite');
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Submit message to API
  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
    };

    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

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
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
      };

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                assistantContent += parsed.choices[0].delta.content;
                // Update the assistant message content
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

  // Show API key setup form
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
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show chat interface
  return (
    <div className="container max-w-4xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Chat</h1>
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
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Interface */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          <MessageList messages={messages} isLoading={isLoading} />
        </CardContent>

        {/* Input */}
        <div className="border-t p-4">
          <PromptInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder="Type your message..."
          />
        </div>
      </Card>

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
    </div>
  );
}